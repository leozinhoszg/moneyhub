from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class Subcategory(Base):
    __tablename__ = "SUBCATEGORIAS"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    categoria_id: Mapped[int] = mapped_column(ForeignKey("CATEGORIAS.id", ondelete="CASCADE"), index=True)
    usuario_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"), index=True, nullable=True)
    nome: Mapped[str] = mapped_column(String(120), nullable=False)
    cor: Mapped[str | None] = mapped_column(String(7), nullable=True)
    icone: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    categoria = relationship("Category", backref="subcategorias")
    usuario = relationship("User", backref="subcategorias")

