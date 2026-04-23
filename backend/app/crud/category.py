from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.category import Category


def create_category(
    db: Session, 
    usuario_id: int | None, 
    nome: str, 
    tipo: str,
    cor: str | None = None,
    icone: str | None = None
) -> Category:
    cat = Category(
        usuario_id=usuario_id, 
        nome=nome, 
        tipo=tipo,
        cor=cor,
        icone=icone
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def get_category(db: Session, category_id: int) -> Category | None:
    return db.get(Category, category_id)


def get_category_with_subcategories(db: Session, category_id: int) -> Category | None:
    stmt = select(Category).options(selectinload(Category.subcategorias)).where(Category.id == category_id)
    return db.execute(stmt).scalar_one_or_none()


def list_categories(db: Session, usuario_id: int | None = None, include_subcategories: bool = False) -> list[Category]:
    stmt = select(Category)
    
    if include_subcategories:
        stmt = stmt.options(selectinload(Category.subcategorias))
    
    if usuario_id is None:
        stmt = stmt.where(Category.usuario_id.is_(None))
    else:
        stmt = stmt.where((Category.usuario_id == usuario_id) | (Category.usuario_id.is_(None)))
    
    return list(db.execute(stmt).scalars().all())


def update_category(
    db: Session, 
    category: Category, 
    nome: str | None = None, 
    tipo: str | None = None,
    cor: str | None = None,
    icone: str | None = None
) -> Category:
    if nome is not None:
        category.nome = nome
    if tipo is not None:
        category.tipo = tipo
    if cor is not None:
        category.cor = cor
    if icone is not None:
        category.icone = icone
    
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category: Category) -> None:
    db.delete(category)
    db.commit()


