from datetime import date
from decimal import Decimal

from sqlalchemy import Date, Enum as SAEnum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class FixedExpense(Base):
    __tablename__ = "GASTOS_FIXOS"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True)
    descricao: Mapped[str] = mapped_column(String(255), nullable=False)
    valor: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    categoria_id: Mapped[int] = mapped_column(ForeignKey("CATEGORIAS.id", ondelete="RESTRICT"), nullable=False)
    conta_bancaria_id: Mapped[int | None] = mapped_column(ForeignKey("CONTAS_BANCARIAS.id", ondelete="SET NULL"), nullable=True)
    cartao_credito_id: Mapped[int | None] = mapped_column(ForeignKey("CARTOES_CREDITO.id", ondelete="SET NULL"), nullable=True)
    dia_vencimento: Mapped[int] = mapped_column(nullable=False)
    data_inicio: Mapped[date] = mapped_column(Date, nullable=False)
    data_fim: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(SAEnum("Ativo", "Inativo", name="status_gasto_fixo"), default="Ativo")
    lembrete_ativado: Mapped[bool] = mapped_column(default=True)
    ultimo_lancamento: Mapped[date | None] = mapped_column(Date, nullable=True)

    usuario = relationship("User", backref="gastos_fixos")
    categoria = relationship("Category")
    conta = relationship("BankAccount")
    cartao = relationship("CreditCard")


