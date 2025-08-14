from decimal import Decimal

from pydantic import BaseModel, Field


class CardBase(BaseModel):
    nome_cartao: str = Field(min_length=1, max_length=120)
    bandeira: str = Field(min_length=1, max_length=60)
    limite: Decimal = Field(ge=0)
    dia_fechamento_fatura: int = Field(ge=1, le=28)
    dia_vencimento_fatura: int = Field(ge=1, le=31)


class CardCreate(CardBase):
    pass


class CardUpdate(BaseModel):
    nome_cartao: str | None = None
    bandeira: str | None = None
    limite: Decimal | None = None
    dia_fechamento_fatura: int | None = None
    dia_vencimento_fatura: int | None = None


class CardPublic(BaseModel):
    id: int
    nome_cartao: str
    bandeira: str
    limite: Decimal
    dia_fechamento_fatura: int
    dia_vencimento_fatura: int

    class Config:
        from_attributes = True


