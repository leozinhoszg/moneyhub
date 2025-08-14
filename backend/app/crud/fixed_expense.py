from datetime import date

from sqlalchemy import and_, select
from sqlalchemy.orm import Session

from app.crud.transaction import create_transaction
from app.models.fixed_expense import FixedExpense


def list_fixed_expenses(db: Session, usuario_id: int) -> list[FixedExpense]:
    stmt = select(FixedExpense).where(FixedExpense.usuario_id == usuario_id)
    return list(db.execute(stmt).scalars().all())


def create_fixed_expense(
    db: Session,
    usuario_id: int,
    descricao: str,
    valor,
    dia_vencimento: int,
    categoria_id: int,
    conta_bancaria_id: int | None = None,
    cartao_credito_id: int | None = None,
    data_inicio: date | None = None,
    data_fim: date | None = None,
) -> FixedExpense:
    fx = FixedExpense(
        usuario_id=usuario_id,
        descricao=descricao,
        valor=valor,
        categoria_id=int(categoria_id),
        conta_bancaria_id=conta_bancaria_id,
        cartao_credito_id=cartao_credito_id,
        dia_vencimento=dia_vencimento,
        data_inicio=data_inicio or date.today(),
        data_fim=data_fim,
        status="Ativo",
    )
    db.add(fx)
    db.commit()
    db.refresh(fx)
    return fx


def update_fixed_expense(db: Session, fx: FixedExpense, **fields) -> FixedExpense:
    for k, v in fields.items():
        if hasattr(fx, k) and v is not None:
            setattr(fx, k, v)
    db.add(fx)
    db.commit()
    db.refresh(fx)
    return fx


def delete_fixed_expense(db: Session, fx: FixedExpense) -> None:
    db.delete(fx)
    db.commit()


def run_fixed_expenses_for_date(db: Session, usuario_id: int, run_date: date) -> int:
    # Lança transações para todos os gastos fixos ativos no dia informado
    stmt = select(FixedExpense).where(
        (FixedExpense.usuario_id == usuario_id)
        & (FixedExpense.status == "Ativo")
        & (FixedExpense.dia_vencimento == run_date.day)
        & (FixedExpense.data_inicio <= run_date)
        & ((FixedExpense.data_fim.is_(None)) | (FixedExpense.data_fim >= run_date))
    )
    gastos = list(db.execute(stmt).scalars().all())
    count = 0
    for g in gastos:
        # Evita duplicar no mesmo dia
        if getattr(g, "ultimo_lancamento", None) == run_date:
            continue
        create_transaction(
            db,
            usuario_id=g.usuario_id,
            tipo="Despesa",
            valor=g.valor,
            data_transacao=run_date,
            descricao=g.descricao,
            categoria_id=g.categoria_id,
            conta_bancaria_id=g.conta_bancaria_id,
            cartao_credito_id=g.cartao_credito_id,
        )
        # Atualiza marcador de último lançamento para evitar duplicações
        if hasattr(g, "ultimo_lancamento"):
            g.ultimo_lancamento = run_date
        db.add(g)
        db.commit()
        count += 1
    return count


