# app/schemas/user.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    nome: str = Field(min_length=1, max_length=120)
    email: EmailStr


class UserCreate(UserBase):
    senha: str = Field(min_length=6, max_length=128)


class UserCreateGoogle(BaseModel):
    """Schema para criação de usuário via Google OAuth"""
    nome: str = Field(min_length=1, max_length=120)
    email: EmailStr
    google_id: str
    provider: str = "google"


class UserPublic(BaseModel):
    id: int
    nome: str
    email: EmailStr
    provider: Optional[str] = "email"
    is_verified: bool = False
    email_verificado: bool = False
    data_cadastro: datetime
    ultimo_login: Optional[datetime] = None
    
    # Campos opcionais para não quebrar compatibilidade
    google_id: Optional[str] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema para atualização de dados do usuário"""
    nome: Optional[str] = Field(None, min_length=1, max_length=120)
    email: Optional[EmailStr] = None


class UserChangePassword(BaseModel):
    """Schema para alteração de senha"""
    senha_atual: str = Field(min_length=1)
    nova_senha: str = Field(min_length=6, max_length=128)
    confirmar_senha: str = Field(min_length=6, max_length=128)


class UserProfile(BaseModel):
    """Schema completo do perfil do usuário"""
    id: int
    nome: str
    email: EmailStr
    provider: str
    is_verified: bool
    email_verificado: bool
    data_cadastro: datetime
    ultimo_login: Optional[datetime] = None
    
    # Estatísticas do usuário (opcional)
    total_transacoes: Optional[int] = 0
    saldo_total: Optional[float] = 0.0

    class Config:
        from_attributes = True