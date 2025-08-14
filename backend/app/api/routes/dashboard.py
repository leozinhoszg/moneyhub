from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.account import BankAccount
from app.models.category import Category, TipoCategoria
from app.models.transaction import TipoTransacao, Transaction
from app.models.user import User


router = APIRouter()


@router.get("/dashboard/summary")
def get_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Soma receitas e despesas do mês atual
    today = date.today()
    first_day = today.replace(day=1)
    stmt = (
        select(
            Transaction.tipo,
            func.coalesce(func.sum(Transaction.valor), 0),
        )
        .where(
            (Transaction.usuario_id == current_user.id)
            & (Transaction.data_transacao >= first_day)
            & (Transaction.data_transacao <= today)
        )
        .group_by(Transaction.tipo)
    )
    rows = db.execute(stmt).all()
    receita = Decimal("0")
    despesa = Decimal("0")
    for tipo, total in rows:
        if tipo == TipoTransacao.RECEITA:
            receita = Decimal(total or 0)
        elif tipo == TipoTransacao.DESPESA:
            despesa = Decimal(total or 0)
    saldo_mes = receita - despesa
    return {"receita_mes": str(receita), "despesa_mes": str(despesa), "saldo_mes": str(saldo_mes)}


@router.get("/dashboard/balances-by-account")
def balances_by_account(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.execute(
        select(BankAccount.id, BankAccount.nome_banco, BankAccount.saldo_atual).where(BankAccount.usuario_id == current_user.id)
    ).all()
    return [
        {"id": r[0], "nome_banco": r[1], "saldo_atual": str(r[2] or 0)}
        for r in rows
    ]


@router.get("/dashboard/expenses-by-category")
def expenses_by_category(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    first_day = today.replace(day=1)
    stmt = (
        select(Category.nome, func.coalesce(func.sum(Transaction.valor), 0))
        .join(Category, Category.id == Transaction.categoria_id, isouter=True)
        .where(
            (Transaction.usuario_id == current_user.id)
            & (Transaction.tipo == TipoTransacao.DESPESA)
            & (Transaction.data_transacao >= first_day)
            & (Transaction.data_transacao <= today)
        )
        .group_by(Category.nome)
        .order_by(func.coalesce(func.sum(Transaction.valor), 0).desc())
    )
    rows = db.execute(stmt).all()
    return [{"categoria": r[0] or "Sem categoria", "total": str(r[1] or 0)} for r in rows]


@router.get("/dashboard/daily-flow")
def daily_flow(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    first_day = today.replace(day=1)
    stmt = (
        select(
            Transaction.data_transacao,
            func.sum(func.case((Transaction.tipo == TipoTransacao.RECEITA, Transaction.valor), else_=0)).label("receitas"),
            func.sum(func.case((Transaction.tipo == TipoTransacao.DESPESA, Transaction.valor), else_=0)).label("despesas"),
        )
        .where(
            (Transaction.usuario_id == current_user.id)
            & (Transaction.data_transacao >= first_day)
            & (Transaction.data_transacao <= today)
        )
        .group_by(Transaction.data_transacao)
        .order_by(Transaction.data_transacao)
    )
    rows = db.execute(stmt).all()
    return [
        {
            "data": r[0].isoformat(),
            "receitas": str(r[1] or 0),
            "despesas": str(r[2] or 0),
        }
        for r in rows
    ]


