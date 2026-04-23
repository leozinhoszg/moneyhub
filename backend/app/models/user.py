# app/models/user.py
from datetime import datetime
from sqlalchemy import Boolean, DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base


class User(Base):
    """Modelo de usuário para o MoneyHub"""
    __tablename__ = "usuarios"

    # Campos principais
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nome: Mapped[str] = mapped_column(String(120), nullable=False)
    sobrenome: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    senha_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)  # Pode ser null para usuários OAuth
    
    # Campos de timestamp
    data_cadastro: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.current_timestamp(),
        nullable=False
    )
    ultimo_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Campos OAuth e verificação
    google_id: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True, index=True)
    provider: Mapped[str] = mapped_column(String(20), nullable=False, default="email")  # "email", "google", "both"
    
    # Campos de foto de perfil
    foto_perfil: Mapped[str | None] = mapped_column(String(500), nullable=True)  # URL da foto de perfil
    google_picture: Mapped[str | None] = mapped_column(String(500), nullable=True)  # URL da foto do Google
    
    # Campos de status e verificação
    email_verificado: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relacionamentos (definidos via backref nos outros modelos)
    # contas = relationship("BankAccount", back_populates="usuario")
    # cartoes = relationship("CreditCard", back_populates="usuario")
    # categorias = relationship("Category", back_populates="usuario")
    # transacoes = relationship("Transaction", back_populates="usuario")
    password_reset_tokens = relationship("PasswordResetToken", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', provider='{self.provider}')>"

    @property
    def has_password(self) -> bool:
        """Verifica se o usuário tem senha definida"""
        return self.senha_hash is not None

    @property
    def has_google(self) -> bool:
        """Verifica se o usuário tem conta Google vinculada"""
        return self.google_id is not None

    @property
    def can_remove_google(self) -> bool:
        """Verifica se o usuário pode desvincular a conta Google"""
        return self.provider == "both" or (self.provider == "google" and self.has_password)

    @property
    def authentication_methods(self) -> list[str]:
        """Retorna lista de métodos de autenticação disponíveis"""
        methods = []
        if self.has_password:
            methods.append("email")
        if self.google_id:
            methods.append("google")
        return methods