from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserPublic


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str = Field(min_length=6, max_length=128)


class AuthResponse(BaseModel):
    user: UserPublic


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class GoogleAuthRequest(BaseModel):
    """Schema para dados recebidos do Google OAuth"""
    google_id: str
    email: EmailStr
    nome: str
    picture: str = None


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    nova_senha: str
    confirmar_senha: str


class EmailVerificationRequest(BaseModel):
    email: EmailStr


class RefreshTokenRequest(BaseModel):
    refresh_token: str


