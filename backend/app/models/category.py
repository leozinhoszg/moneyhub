from sqlalchemy import Enum as SAEnum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class TipoCategoria(str):
    RECEITA = "Receita"
    DESPESA = "Despesa"


class Category(Base):
    __tablename__ = "CATEGORIAS"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    usuario_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True, nullable=True)
    nome: Mapped[str] = mapped_column(String(120), nullable=False)
    tipo: Mapped[str] = mapped_column(SAEnum(TipoCategoria.RECEITA, TipoCategoria.DESPESA, name="tipo_categoria"), nullable=False)
    icone: Mapped[str | None] = mapped_column(String(255), nullable=True)

    usuario = relationship("User", backref="categorias")


