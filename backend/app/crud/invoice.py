import calendar
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import and_, func, select
from sqlalchemy.orm import Session

from app.crud.account import apply_balance_delta, get_account
from app.models.card import CreditCard
from app.models.invoice import CreditCardInvoice
from app.models.transaction import Transaction


def _billing_period(dia_fechamento: int, mes: int, ano: int) -> tuple[date, date]:
    """Calcula o periodo de faturamento para um mes/ano de referencia.

    Para cartao com dia_fechamento=15 e referencia marco/2026:
    - Inicio: 16/fev/2026
    - Fim: 15/mar/2026
    """
    # Fim do periodo: dia de fechamento do mes de referencia
    last_day = calendar.monthrange(ano, mes)[1]
    dia_fim = min(dia_fechamento, last_day)
    end_date = date(ano, mes, dia_fim)

    # Inicio do periodo: dia seguinte ao fechamento do mes anterior
    if mes == 1:
        prev_month = 12
        prev_year = ano - 1
    else:
        prev_month = mes - 1
        prev_year = ano

    prev_last_day = calendar.monthrange(prev_year, prev_month)[1]
    dia_inicio = min(dia_fechamento, prev_last_day) + 1
    if dia_inicio > prev_last_day:
        # Fechamento no ultimo dia do mes anterior -> inicio e o dia 1 do mes de referencia
        start_date = date(ano, mes, 1)
    else:
        start_date = date(prev_year, prev_month, dia_inicio)

    return start_date, end_date


def _due_date(dia_vencimento: int, mes: int, ano: int) -> date:
    """Calcula a data de vencimento da fatura.

    Normalmente o vencimento e no mes seguinte ao fechamento.
    """
    if mes == 12:
        next_month = 1
        next_year = ano + 1
    else:
        next_month = mes + 1
        next_year = ano

    last_day = calendar.monthrange(next_year, next_month)[1]
    dia = min(dia_vencimento, last_day)
    return date(next_year, next_month, dia)


def compute_invoice_total(
    db: Session, cartao_credito_id: int, start_date: date, end_date: date
) -> Decimal:
    """Soma transacoes vinculadas ao cartao no periodo de faturamento."""
    stmt = select(func.coalesce(func.sum(Transaction.valor), 0)).where(
        and_(
            Transaction.cartao_credito_id == cartao_credito_id,
            Transaction.data_transacao >= datetime.combine(start_date, datetime.min.time()),
            Transaction.data_transacao <= datetime.combine(end_date, datetime.max.time()),
        )
    )
    total = db.execute(stmt).scalar_one()
    return Decimal(str(total))


def get_or_create_invoice(
    db: Session, cartao_credito_id: int, mes: int, ano: int, usuario_id: int
) -> CreditCardInvoice:
    """Busca fatura existente ou cria uma nova com calculo automatico."""
    stmt = select(CreditCardInvoice).where(
        and_(
            CreditCardInvoice.cartao_credito_id == cartao_credito_id,
            CreditCardInvoice.mes_referencia == mes,
            CreditCardInvoice.ano_referencia == ano,
        )
    )
    invoice = db.execute(stmt).scalar_one_or_none()
    if invoice:
        return invoice

    # Buscar dados do cartao
    card = db.get(CreditCard, cartao_credito_id)
    if not card:
        raise ValueError("Cartao nao encontrado")

    start, end = _billing_period(card.dia_fechamento_fatura, mes, ano)
    vencimento = _due_date(card.dia_vencimento_fatura, mes, ano)
    total = compute_invoice_total(db, cartao_credito_id, start, end)

    invoice = CreditCardInvoice(
        usuario_id=usuario_id,
        cartao_credito_id=cartao_credito_id,
        mes_referencia=mes,
        ano_referencia=ano,
        valor_total=total,
        status="aberta",
        data_fechamento=end,
        data_vencimento=vencimento,
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


def recalculate_invoice(db: Session, invoice: CreditCardInvoice) -> CreditCardInvoice:
    """Recalcula o valor total da fatura a partir das transacoes."""
    card = db.get(CreditCard, invoice.cartao_credito_id)
    start, end = _billing_period(card.dia_fechamento_fatura, invoice.mes_referencia, invoice.ano_referencia)
    invoice.valor_total = compute_invoice_total(db, invoice.cartao_credito_id, start, end)
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


def list_invoices(
    db: Session, cartao_credito_id: int, usuario_id: int
) -> list[CreditCardInvoice]:
    """Lista faturas de um cartao ordenadas por data DESC."""
    stmt = (
        select(CreditCardInvoice)
        .where(
            and_(
                CreditCardInvoice.cartao_credito_id == cartao_credito_id,
                CreditCardInvoice.usuario_id == usuario_id,
            )
        )
        .order_by(CreditCardInvoice.ano_referencia.desc(), CreditCardInvoice.mes_referencia.desc())
    )
    return list(db.execute(stmt).scalars().all())


def get_invoice(db: Session, invoice_id: int) -> CreditCardInvoice | None:
    return db.get(CreditCardInvoice, invoice_id)


def pay_invoice(
    db: Session, invoice: CreditCardInvoice, conta_pagamento_id: int
) -> CreditCardInvoice:
    """Marca fatura como paga e debita a conta bancaria."""
    account = get_account(db, conta_pagamento_id)
    if not account:
        raise ValueError("Conta bancaria nao encontrada")

    invoice.status = "paga"
    invoice.data_pagamento = datetime.now()
    invoice.conta_pagamento_id = conta_pagamento_id
    db.add(invoice)

    # Debitar valor da conta bancaria
    apply_balance_delta(db, account, -invoice.valor_total)

    db.commit()
    db.refresh(invoice)
    return invoice


def get_invoice_transactions(
    db: Session, cartao_credito_id: int, start_date: date, end_date: date
) -> list[Transaction]:
    """Retorna transacoes do cartao no periodo de faturamento."""
    stmt = (
        select(Transaction)
        .where(
            and_(
                Transaction.cartao_credito_id == cartao_credito_id,
                Transaction.data_transacao >= datetime.combine(start_date, datetime.min.time()),
                Transaction.data_transacao <= datetime.combine(end_date, datetime.max.time()),
            )
        )
        .order_by(Transaction.data_transacao.desc())
    )
    return list(db.execute(stmt).scalars().all())


def get_current_invoices_summary(db: Session, usuario_id: int) -> list[dict]:
    """Resumo das faturas atuais de todos os cartoes do usuario (para dashboard)."""
    from app.crud.card import list_cards

    cards = list_cards(db, usuario_id)
    today = date.today()
    summaries = []

    for card in cards:
        invoice = get_or_create_invoice(db, card.id, today.month, today.year, usuario_id)
        # Recalcular se estiver aberta
        if invoice.status == "aberta":
            invoice = recalculate_invoice(db, invoice)

        summaries.append({
            "cartao_id": card.id,
            "cartao_nome": card.nome_cartao,
            "bandeira": card.bandeira,
            "valor_total": invoice.valor_total,
            "data_vencimento": invoice.data_vencimento,
            "status": invoice.status,
            "limite": card.limite,
        })

    return summaries
