from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.account import BankAccount


def create_account(
    db: Session,
    usuario_id: int,
    nome_banco: str,
    tipo_conta: str,
    saldo_inicial: Decimal,
) -> BankAccount:
    account = BankAccount(
        usuario_id=usuario_id,
        nome_banco=nome_banco,
        tipo_conta=tipo_conta,
        saldo_inicial=saldo_inicial,
        saldo_atual=saldo_inicial,
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


def get_account(db: Session, account_id: int) -> BankAccount | None:
    return db.get(BankAccount, account_id)


def list_accounts(db: Session, usuario_id: int) -> list[BankAccount]:
    stmt = select(BankAccount).where(BankAccount.usuario_id == usuario_id)
    return list(db.execute(stmt).scalars().all())


def update_account(
    db: Session,
    account: BankAccount,
    nome_banco: str | None = None,
    tipo_conta: str | None = None,
) -> BankAccount:
    if nome_banco is not None:
        account.nome_banco = nome_banco
    if tipo_conta is not None:
        account.tipo_conta = tipo_conta
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


def delete_account(db: Session, account: BankAccount) -> None:
    db.delete(account)
    db.commit()


def apply_balance_delta(db: Session, account: BankAccount, delta: Decimal) -> BankAccount:
    account.saldo_atual = (account.saldo_atual or Decimal("0.00")) + Decimal(delta)
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


