from datetime import datetime

from sqlalchemy import DateTime, String, func, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class User(Base):
    __tablename__ = "USUARIOS"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nome: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    senha_hash: Mapped[str] = mapped_column(String(255), nullable=True)  # Pode ser null para usuários OAuth
    google_id: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True, index=True)
    email_verificado: Mapped[bool] = mapped_column(default=False)
    data_cadastro: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ultimo_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Novos campos para Google OAuth
    provider: Mapped[str] = mapped_column(String(20), default="email")  # "email", "google", "both"
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # Campo para controle de atualizações
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Campo para soft delete
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


