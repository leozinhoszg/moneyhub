from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.subcategory import Subcategory


def create_subcategory(
    db: Session, 
    categoria_id: int,
    usuario_id: int | None, 
    nome: str, 
    cor: str | None = None,
    icone: str | None = None
) -> Subcategory:
    subcat = Subcategory(
        categoria_id=categoria_id,
        usuario_id=usuario_id, 
        nome=nome, 
        cor=cor,
        icone=icone
    )
    db.add(subcat)
    db.commit()
    db.refresh(subcat)
    return subcat


def get_subcategory(db: Session, subcategory_id: int) -> Subcategory | None:
    return db.get(Subcategory, subcategory_id)


def list_subcategories(
    db: Session, 
    categoria_id: int | None = None,
    usuario_id: int | None = None
) -> list[Subcategory]:
    stmt = select(Subcategory)
    
    if categoria_id is not None:
        stmt = stmt.where(Subcategory.categoria_id == categoria_id)
    
    if usuario_id is None:
        stmt = stmt.where(Subcategory.usuario_id.is_(None))
    else:
        stmt = stmt.where(
            (Subcategory.usuario_id == usuario_id) | 
            (Subcategory.usuario_id.is_(None))
        )
    
    return list(db.execute(stmt).scalars().all())


def update_subcategory(
    db: Session, 
    subcategory: Subcategory, 
    nome: str | None = None, 
    cor: str | None = None,
    icone: str | None = None
) -> Subcategory:
    if nome is not None:
        subcategory.nome = nome
    if cor is not None:
        subcategory.cor = cor
    if icone is not None:
        subcategory.icone = icone
    
    db.add(subcategory)
    db.commit()
    db.refresh(subcategory)
    return subcategory


def delete_subcategory(db: Session, subcategory: Subcategory) -> None:
    db.delete(subcategory)
    db.commit()






