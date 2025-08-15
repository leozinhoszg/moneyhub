from decimal import Decimal

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class TipoConta(str):
    CORRENTE = "Corrente"
    POUPANCA = "Poupança"
    INVESTIMENTO = "Investimento"


class BankAccount(Base):
    __tablename__ = "CONTAS_BANCARIAS"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True)
    nome_banco: Mapped[str] = mapped_column(String(120), nullable=False)
    tipo_conta: Mapped[str] = mapped_column(SAEnum(*[TipoConta.CORRENTE, TipoConta.POUPANCA, TipoConta.INVESTIMENTO], name="tipo_conta"), nullable=False)
    saldo_inicial: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    saldo_atual: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    data_criacao: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # relationships
    usuario = relationship("User", backref="contas")


