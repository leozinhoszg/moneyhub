from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel

from app.schemas.transaction import TransactionPublic


class InvoicePublic(BaseModel):
    id: int
    cartao_credito_id: int
    mes_referencia: int
    ano_referencia: int
    valor_total: Decimal
    status: str
    data_fechamento: date
    data_vencimento: date
    data_pagamento: datetime | None
    conta_pagamento_id: int | None

    class Config:
        from_attributes = True


class InvoiceWithTransactions(InvoicePublic):
    transacoes: list[TransactionPublic] = []


class InvoicePayment(BaseModel):
    conta_pagamento_id: int


class InvoiceSummary(BaseModel):
    cartao_id: int
    cartao_nome: str
    bandeira: str
    valor_total: Decimal
    data_vencimento: date
    status: str
    limite: Decimal

    class Config:
        from_attributes = True
