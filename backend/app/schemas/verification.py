from pydantic import BaseModel, EmailStr


class SendVerificationCodeRequest(BaseModel):
    email: EmailStr
    nome: str
    sobrenome: str


class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str
    senha: str


class SendVerificationCodeResponse(BaseModel):
    message: str
    email: str


class VerifyCodeResponse(BaseModel):
    message: str
    user: dict
