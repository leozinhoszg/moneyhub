from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class Bank(Base):
    __tablename__ = "bancos"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    COD: Mapped[str | None] = mapped_column(String(9), nullable=True)
    LongName: Mapped[str] = mapped_column(String(255), nullable=False)
    ShortName: Mapped[str | None] = mapped_column(String(255), nullable=True)
    Url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    logotipo: Mapped[str | None] = mapped_column(String(99), nullable=True)
    ativo: Mapped[bool | None] = mapped_column(nullable=True)

