from decimal import Decimal
from typing import Iterable

from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from app.crud.account import apply_balance_delta
from app.models.transaction import Transaction, TipoTransacao


def create_transaction(
    db: Session,
    usuario_id: int,
    tipo: str,
    valor: Decimal,
    data_transacao,
    descricao: str | None = None,
    categoria_id: int | None = None,
    conta_bancaria_id: int | None = None,
    cartao_credito_id: int | None = None,
) -> Transaction:
    tx = Transaction(
        usuario_id=usuario_id,
        tipo=tipo,
        valor=valor,
        data_transacao=data_transacao,
        descricao=descricao,
        categoria_id=categoria_id,
        conta_bancaria_id=conta_bancaria_id,
        cartao_credito_id=cartao_credito_id,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    # Atualiza saldo da conta, se houver
    if conta_bancaria_id:
        delta = valor if tipo == TipoTransacao.RECEITA else -valor
        apply_balance_delta(db, tx.conta, delta)

    return tx


def list_transactions(
    db: Session,
    usuario_ids: list[int],
    tipo: str | None = None,
    categoria_ids: list[int] | None = None,
    conta_ids: list[int] | None = None,
    cartao_ids: list[int] | None = None,
    start_date=None,
    end_date=None,
    order_by: str = "data_transacao",
    order_dir: str = "desc",
    page: int = 1,
    page_size: int = 20,
) -> list[Transaction]:
    if not usuario_ids:
        return []
    stmt = select(Transaction).where(Transaction.usuario_id.in_(usuario_ids))
    if tipo:
        stmt = stmt.where(Transaction.tipo == tipo)
    if categoria_ids:
        stmt = stmt.where(Transaction.categoria_id.in_(categoria_ids))
    if conta_ids:
        stmt = stmt.where(Transaction.conta_bancaria_id.in_(conta_ids))
    if cartao_ids:
        stmt = stmt.where(Transaction.cartao_credito_id.in_(cartao_ids))
    if start_date and end_date:
        stmt = stmt.where(and_(Transaction.data_transacao >= start_date, Transaction.data_transacao <= end_date))
    elif start_date:
        stmt = stmt.where(Transaction.data_transacao >= start_date)
    elif end_date:
        stmt = stmt.where(Transaction.data_transacao <= end_date)

    allowed_order_fields = {
        "data_transacao": Transaction.data_transacao,
        "valor": Transaction.valor,
        "id": Transaction.id,
    }
    order_col = allowed_order_fields.get(order_by, Transaction.data_transacao)
    if order_dir.lower() == "asc":
        stmt = stmt.order_by(order_col.asc(), Transaction.id.asc())
    else:
        stmt = stmt.order_by(order_col.desc(), Transaction.id.desc())

    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 20
    offset = (page - 1) * page_size
    stmt = stmt.offset(offset).limit(page_size)

    return list(db.execute(stmt).scalars().all())


def count_transactions(
    db: Session,
    usuario_ids: list[int],
    tipo: str | None = None,
    categoria_ids: list[int] | None = None,
    conta_ids: list[int] | None = None,
    cartao_ids: list[int] | None = None,
    start_date=None,
    end_date=None,
) -> int:
    if not usuario_ids:
        return 0
    stmt = select(func.count(Transaction.id)).where(Transaction.usuario_id.in_(usuario_ids))
    if tipo:
        stmt = stmt.where(Transaction.tipo == tipo)
    if categoria_ids:
        stmt = stmt.where(Transaction.categoria_id.in_(categoria_ids))
    if conta_ids:
        stmt = stmt.where(Transaction.conta_bancaria_id.in_(conta_ids))
    if cartao_ids:
        stmt = stmt.where(Transaction.cartao_credito_id.in_(cartao_ids))
    if start_date and end_date:
        stmt = stmt.where(and_(Transaction.data_transacao >= start_date, Transaction.data_transacao <= end_date))
    elif start_date:
        stmt = stmt.where(Transaction.data_transacao >= start_date)
    elif end_date:
        stmt = stmt.where(Transaction.data_transacao <= end_date)
    return int(db.execute(stmt).scalar_one())


def delete_transaction(db: Session, tx: Transaction) -> None:
    # Reverte saldo se tinha conta bancária
    if tx.conta_bancaria_id:
        delta = -tx.valor if tx.tipo == TipoTransacao.RECEITA else tx.valor
        apply_balance_delta(db, tx.conta, delta)
    db.delete(tx)
    db.commit()


