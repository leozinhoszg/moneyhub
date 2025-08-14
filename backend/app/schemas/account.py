from decimal import Decimal

from pydantic import BaseModel, Field


class AccountBase(BaseModel):
    nome_banco: str = Field(min_length=1, max_length=120)
    tipo_conta: str
    saldo_inicial: Decimal = Field(ge=0)


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    nome_banco: str | None = None
    tipo_conta: str | None = None


class AccountPublic(BaseModel):
    id: int
    nome_banco: str
    tipo_conta: str
    saldo_inicial: Decimal
    saldo_atual: Decimal

    class Config:
        from_attributes = True


