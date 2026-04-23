from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class CreditCardInvoice(Base):
    __tablename__ = "FATURAS_CARTAO"
    __table_args__ = (
        UniqueConstraint("cartao_credito_id", "mes_referencia", "ano_referencia", name="uq_fatura_cartao_mes_ano"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True)
    cartao_credito_id: Mapped[int] = mapped_column(ForeignKey("CARTOES_CREDITO.id", ondelete="CASCADE"), index=True)
    mes_referencia: Mapped[int] = mapped_column(nullable=False)
    ano_referencia: Mapped[int] = mapped_column(nullable=False)
    valor_total: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="aberta")
    data_fechamento: Mapped[Date] = mapped_column(Date, nullable=False)
    data_vencimento: Mapped[Date] = mapped_column(Date, nullable=False)
    data_pagamento: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    conta_pagamento_id: Mapped[int | None] = mapped_column(ForeignKey("CONTAS_BANCARIAS.id", ondelete="SET NULL"), nullable=True)
    data_criacao: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    usuario = relationship("User", backref="faturas")
    cartao = relationship("CreditCard", backref="faturas")
    conta_pagamento = relationship("BankAccount", foreign_keys=[conta_pagamento_id])
