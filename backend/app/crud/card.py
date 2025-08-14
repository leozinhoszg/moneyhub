from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.card import CreditCard


def create_card(
    db: Session,
    usuario_id: int,
    nome_cartao: str,
    bandeira: str,
    limite: Decimal,
    dia_fechamento_fatura: int,
    dia_vencimento_fatura: int,
) -> CreditCard:
    card = CreditCard(
        usuario_id=usuario_id,
        nome_cartao=nome_cartao,
        bandeira=bandeira,
        limite=limite,
        dia_fechamento_fatura=dia_fechamento_fatura,
        dia_vencimento_fatura=dia_vencimento_fatura,
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


def get_card(db: Session, card_id: int) -> CreditCard | None:
    return db.get(CreditCard, card_id)


def list_cards(db: Session, usuario_id: int) -> list[CreditCard]:
    stmt = select(CreditCard).where(CreditCard.usuario_id == usuario_id)
    return list(db.execute(stmt).scalars().all())


def update_card(
    db: Session,
    card: CreditCard,
    nome_cartao: str | None = None,
    bandeira: str | None = None,
    limite: Decimal | None = None,
    dia_fechamento_fatura: int | None = None,
    dia_vencimento_fatura: int | None = None,
) -> CreditCard:
    if nome_cartao is not None:
        card.nome_cartao = nome_cartao
    if bandeira is not None:
        card.bandeira = bandeira
    if limite is not None:
        card.limite = limite
    if dia_fechamento_fatura is not None:
        card.dia_fechamento_fatura = dia_fechamento_fatura
    if dia_vencimento_fatura is not None:
        card.dia_vencimento_fatura = dia_vencimento_fatura
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


def delete_card(db: Session, card: CreditCard) -> None:
    db.delete(card)
    db.commit()


