from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud.card import get_card
from app.crud.invoice import (
    get_invoice,
    get_invoice_transactions,
    get_or_create_invoice,
    list_invoices,
    pay_invoice,
    recalculate_invoice,
    _billing_period,
)
from app.models.card import CreditCard
from app.models.user import User
from app.schemas.invoice import InvoicePayment, InvoicePublic, InvoiceWithTransactions
from app.schemas.transaction import TransactionPublic

router = APIRouter()


def _verify_card_ownership(db: Session, card_id: int, user_id: int) -> CreditCard:
    card = get_card(db, card_id)
    if not card or card.usuario_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cartao nao encontrado")
    return card


@router.get("/cards/{card_id}/invoices", response_model=list[InvoicePublic])
def get_card_invoices(
    card_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lista todas as faturas de um cartao."""
    _verify_card_ownership(db, card_id, current_user.id)
    invoices = list_invoices(db, card_id, current_user.id)
    return [InvoicePublic.model_validate(inv) for inv in invoices]


@router.get("/cards/{card_id}/invoices/current", response_model=InvoiceWithTransactions)
def get_current_invoice(
    card_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna a fatura atual do cartao com transacoes."""
    card = _verify_card_ownership(db, card_id, current_user.id)

    from datetime import date
    today = date.today()
    invoice = get_or_create_invoice(db, card_id, today.month, today.year, current_user.id)

    # Recalcular se estiver aberta
    if invoice.status == "aberta":
        invoice = recalculate_invoice(db, invoice)

    # Buscar transacoes do periodo
    start, end = _billing_period(card.dia_fechamento_fatura, today.month, today.year)
    transactions = get_invoice_transactions(db, card_id, start, end)

    result = InvoiceWithTransactions.model_validate(invoice)
    result.transacoes = [TransactionPublic.model_validate(tx) for tx in transactions]
    return result


@router.get("/cards/{card_id}/invoices/{mes}/{ano}", response_model=InvoiceWithTransactions)
def get_invoice_by_month(
    card_id: int,
    mes: int,
    ano: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retorna fatura especifica com transacoes."""
    if mes < 1 or mes > 12:
        raise HTTPException(status_code=400, detail="Mes invalido")

    card = _verify_card_ownership(db, card_id, current_user.id)
    invoice = get_or_create_invoice(db, card_id, mes, ano, current_user.id)

    start, end = _billing_period(card.dia_fechamento_fatura, mes, ano)
    transactions = get_invoice_transactions(db, card_id, start, end)

    result = InvoiceWithTransactions.model_validate(invoice)
    result.transacoes = [TransactionPublic.model_validate(tx) for tx in transactions]
    return result


@router.post("/invoices/{invoice_id}/pay", response_model=InvoicePublic)
def pay_invoice_endpoint(
    invoice_id: int,
    payload: InvoicePayment,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Paga uma fatura, debitando a conta bancaria selecionada."""
    invoice = get_invoice(db, invoice_id)
    if not invoice or invoice.usuario_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fatura nao encontrada")

    if invoice.status == "paga":
        raise HTTPException(status_code=400, detail="Fatura ja foi paga")

    try:
        invoice = pay_invoice(db, invoice, payload.conta_pagamento_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return InvoicePublic.model_validate(invoice)
