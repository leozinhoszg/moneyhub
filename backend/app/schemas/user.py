from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    nome: str = Field(min_length=1, max_length=120)
    email: EmailStr


class UserCreate(UserBase):
    senha: str = Field(min_length=6, max_length=128)


class UserPublic(BaseModel):
    id: int
    nome: str
    email: EmailStr

    class Config:
        from_attributes = True


