from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.bank import Bank


def list_banks(db: Session, limit: int = 100) -> list[Bank]:
    """
    Lista todos os bancos ativos (ativo = 1 ou ativo = NULL)
    """
    stmt = select(Bank).where(
        (Bank.ativo == 1) | (Bank.ativo.is_(None))
    ).limit(limit).order_by(Bank.LongName)
    return list(db.execute(stmt).scalars().all())


def get_bank_by_code(db: Session, code: str) -> Bank | None:
    """
    Busca um banco pelo código
    """
    stmt = select(Bank).where(
        Bank.COD == code,
        (Bank.ativo == 1) | (Bank.ativo.is_(None))
    )
    return db.execute(stmt).scalar_one_or_none()


def search_banks(db: Session, search_term: str, limit: int = 50) -> list[Bank]:
    """
    Busca bancos por nome
    """
    stmt = (
        select(Bank)
        .where(
            (Bank.ativo == 1) | (Bank.ativo.is_(None)),
            Bank.LongName.ilike(f"%{search_term}%")
        )
        .limit(limit)
        .order_by(Bank.LongName)
    )
    return list(db.execute(stmt).scalars().all())
