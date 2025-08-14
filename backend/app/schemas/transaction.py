from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class TransactionBase(BaseModel):
    tipo: str
    valor: Decimal = Field(gt=0)
    data_transacao: datetime
    descricao: str | None = Field(default=None, max_length=255)
    categoria_id: int | None = None
    conta_bancaria_id: int | None = None
    cartao_credito_id: int | None = None


class TransactionCreate(TransactionBase):
    pass


class TransactionPublic(BaseModel):
    id: int
    tipo: str
    valor: Decimal
    data_transacao: datetime
    descricao: str | None
    categoria_id: int | None
    conta_bancaria_id: int | None
    cartao_credito_id: int | None

    class Config:
        from_attributes = True


