from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class PasswordResetRequest(BaseModel):
    """Schema para solicitação de reset de senha"""
    email: EmailStr = Field(..., description="Email do usuário")


class PasswordResetResponse(BaseModel):
    """Schema para resposta de solicitação de reset"""
    message: str = Field(..., description="Mensagem de confirmação")
    success: bool = Field(..., description="Status da operação")


class PasswordResetConfirm(BaseModel):
    """Schema para confirmação de reset de senha"""
    token: str = Field(..., min_length=32, max_length=32, description="Token de reset")
    new_password: str = Field(..., min_length=6, description="Nova senha")
    confirm_password: str = Field(..., min_length=6, description="Confirmação da nova senha")


class PasswordResetConfirmResponse(BaseModel):
    """Schema para resposta de confirmação de reset"""
    message: str = Field(..., description="Mensagem de confirmação")
    success: bool = Field(..., description="Status da operação")
