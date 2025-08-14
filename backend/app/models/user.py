from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class User(Base):
    __tablename__ = "USUARIOS"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nome: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    senha_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    data_cadastro: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ultimo_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


