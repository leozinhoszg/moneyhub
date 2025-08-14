from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.category import Category


def create_category(db: Session, usuario_id: int | None, nome: str, tipo: str) -> Category:
    cat = Category(usuario_id=usuario_id, nome=nome, tipo=tipo)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def get_category(db: Session, category_id: int) -> Category | None:
    return db.get(Category, category_id)


def list_categories(db: Session, usuario_id: int | None = None) -> list[Category]:
    if usuario_id is None:
        stmt = select(Category).where(Category.usuario_id.is_(None))
    else:
        stmt = select(Category).where((Category.usuario_id == usuario_id) | (Category.usuario_id.is_(None)))
    return list(db.execute(stmt).scalars().all())


def update_category(db: Session, category: Category, nome: str | None = None, tipo: str | None = None) -> Category:
    if nome is not None:
        category.nome = nome
    if tipo is not None:
        category.tipo = tipo
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category: Category) -> None:
    db.delete(category)
    db.commit()


