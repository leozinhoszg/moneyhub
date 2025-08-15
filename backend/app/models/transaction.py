from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, Enum as SAEnum, ForeignKey, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class TipoTransacao(str):
    RECEITA = "Receita"
    DESPESA = "Despesa"


class Transaction(Base):
    __tablename__ = "TRANSACOES"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True)
    categoria_id: Mapped[int] = mapped_column(ForeignKey("CATEGORIAS.id", ondelete="RESTRICT"), nullable=False, index=True)
    conta_bancaria_id: Mapped[int | None] = mapped_column(ForeignKey("CONTAS_BANCARIAS.id", ondelete="SET NULL"), nullable=True)
    cartao_credito_id: Mapped[int | None] = mapped_column(ForeignKey("CARTOES_CREDITO.id", ondelete="SET NULL"), nullable=True)
    tipo: Mapped[str] = mapped_column(SAEnum(TipoTransacao.RECEITA, TipoTransacao.DESPESA, name="tipo_transacao"), nullable=False)
    valor: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    descricao: Mapped[str | None] = mapped_column(Text, nullable=True)
    data_transacao: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    eh_gasto_fixo: Mapped[bool] = mapped_column(default=False)
    gasto_fixo_id: Mapped[int | None] = mapped_column(ForeignKey("GASTOS_FIXOS.id", ondelete="SET NULL"), nullable=True)
    data_criacao: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    usuario = relationship("User", backref="transacoes")
    categoria = relationship("Category")
    conta = relationship("BankAccount")
    cartao = relationship("CreditCard")


