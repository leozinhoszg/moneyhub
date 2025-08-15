from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class CreditCard(Base):
    __tablename__ = "CARTOES_CREDITO"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True)
    nome_cartao: Mapped[str] = mapped_column(String(120), nullable=False)
    bandeira: Mapped[str] = mapped_column(String(60), nullable=False)
    limite: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    dia_fechamento_fatura: Mapped[int] = mapped_column(nullable=False)
    dia_vencimento_fatura: Mapped[int] = mapped_column(nullable=False)
    data_criacao: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    usuario = relationship("User", backref="cartoes")


