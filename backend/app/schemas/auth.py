from pydantic import BaseModel, EmailStr, Field

from app.schemas.user import UserPublic


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str = Field(min_length=6, max_length=128)


class AuthResponse(BaseModel):
    user: UserPublic


