from sqlalchemy import JSON, DateTime, Enum as SAEnum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class Share(Base):
    __tablename__ = "COMPARTILHAMENTOS"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    usuario_principal_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True)
    usuario_compartilhado_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True)
    data_inicio: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    data_fim: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(SAEnum("Ativo", "Inativo", "Pendente", name="status_compart"), default="Pendente")
    permissoes: Mapped[dict] = mapped_column(JSON, default={"ver_gastos": True, "adicionar_gastos": False})


