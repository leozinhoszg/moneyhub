# app/schemas/user.py
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from typing import Optional
from datetime import datetime
import re


class UserBase(BaseModel):
    """Schema base para usuário"""
    nome: str = Field(min_length=1, max_length=120, description="Nome do usuário")
    sobrenome: str = Field(min_length=1, max_length=120, description="Sobrenome do usuário")
    email: EmailStr = Field(description="Email válido do usuário")


class UserCreate(UserBase):
    """Schema para criação de usuário via email/senha"""
    senha: str = Field(min_length=6, max_length=128, description="Senha do usuário")
    confirmar_senha: str = Field(min_length=6, max_length=128, description="Confirmação da senha")

    @field_validator('senha')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Valida força da senha"""
        if len(v) < 6:
            raise ValueError('Senha deve ter pelo menos 6 caracteres')
        if len(v) > 128:
            raise ValueError('Senha deve ter no máximo 128 caracteres')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Senha deve conter pelo menos uma letra')
        if not re.search(r'\d', v):
            raise ValueError('Senha deve conter pelo menos um número')
        return v

    @model_validator(mode='after')
    def validate_password_confirmation(self):
        """Valida se as senhas coincidem"""
        if self.senha != self.confirmar_senha:
            raise ValueError('Senhas não coincidem')
        return self

    @field_validator('nome')
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Valida o nome do usuário"""
        if not v.strip():
            raise ValueError('Nome não pode estar vazio')
        if len(v.strip()) < 2:
            raise ValueError('Nome deve ter pelo menos 2 caracteres')
        return v.strip()


class UserCreateGoogle(BaseModel):
    """Schema para criação de usuário via Google OAuth"""
    nome: str = Field(min_length=1, max_length=120)
    email: EmailStr
    google_id: str = Field(min_length=1)
    picture: Optional[str] = None

    @field_validator('google_id')
    @classmethod
    def validate_google_id(cls, v: str) -> str:
        """Valida o Google ID"""
        if not v.strip():
            raise ValueError('Google ID não pode estar vazio')
        return v.strip()


class UserPublic(BaseModel):
    """Schema público do usuário (sem dados sensíveis)"""
    id: int
    nome: str
    sobrenome: str
    email: EmailStr
    provider: str = "email"
    is_verified: bool = False
    email_verificado: bool = False
    data_cadastro: datetime
    ultimo_login: Optional[datetime] = None
    is_active: bool = True
    foto_perfil: Optional[str] = None
    
    # Informações adicionais sobre métodos de autenticação
    has_password: Optional[bool] = None
    has_google: Optional[bool] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema para atualização de dados do usuário"""
    nome: Optional[str] = Field(None, min_length=1, max_length=120)
    sobrenome: Optional[str] = Field(None, min_length=1, max_length=120)
    email: Optional[EmailStr] = None

    @field_validator('nome')
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Valida o nome do usuário"""
        if v is not None:
            if not v.strip():
                raise ValueError('Nome não pode estar vazio')
            if len(v.strip()) < 2:
                raise ValueError('Nome deve ter pelo menos 2 caracteres')
            return v.strip()
        return v

    @field_validator('sobrenome')
    @classmethod
    def validate_sobrenome(cls, v: Optional[str]) -> Optional[str]:
        """Valida o sobrenome do usuário"""
        if v is not None:
            if not v.strip():
                raise ValueError('Sobrenome não pode estar vazio')
            if len(v.strip()) < 2:
                raise ValueError('Sobrenome deve ter pelo menos 2 caracteres')
            return v.strip()
        return v


class UserChangePassword(BaseModel):
    """Schema para alteração de senha"""
    senha_atual: str = Field(min_length=1, description="Senha atual do usuário")
    nova_senha: str = Field(min_length=6, max_length=128, description="Nova senha")
    confirmar_nova_senha: str = Field(min_length=6, max_length=128, description="Confirmação da nova senha")

    @field_validator('nova_senha')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Valida força da nova senha"""
        if len(v) < 6:
            raise ValueError('Nova senha deve ter pelo menos 6 caracteres')
        if len(v) > 128:
            raise ValueError('Nova senha deve ter no máximo 128 caracteres')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Nova senha deve conter pelo menos uma letra')
        if not re.search(r'\d', v):
            raise ValueError('Nova senha deve conter pelo menos um número')
        return v

    @model_validator(mode='after')
    def validate_password_confirmation(self):
        """Valida se as novas senhas coincidem"""
        if self.nova_senha != self.confirmar_nova_senha:
            raise ValueError('Confirmação da nova senha não confere')
        if self.senha_atual == self.nova_senha:
            raise ValueError('A nova senha deve ser diferente da senha atual')
        return self


class UserSetPassword(BaseModel):
    """Schema para definir senha (usuários OAuth que querem adicionar senha)"""
    nova_senha: str = Field(min_length=6, max_length=128, description="Nova senha")
    confirmar_nova_senha: str = Field(min_length=6, max_length=128, description="Confirmação da nova senha")

    @field_validator('nova_senha')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Valida força da senha"""
        if len(v) < 6:
            raise ValueError('Senha deve ter pelo menos 6 caracteres')
        if len(v) > 128:
            raise ValueError('Senha deve ter no máximo 128 caracteres')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Senha deve conter pelo menos uma letra')
        if not re.search(r'\d', v):
            raise ValueError('Senha deve conter pelo menos um número')
        return v

    @model_validator(mode='after')
    def validate_password_confirmation(self):
        """Valida se as senhas coincidem"""
        if self.nova_senha != self.confirmar_nova_senha:
            raise ValueError('Senhas não coincidem')
        return self


class UserProfile(BaseModel):
    """Schema completo do perfil do usuário com estatísticas"""
    id: int
    nome: str
    sobrenome: str
    email: EmailStr
    provider: str
    is_verified: bool
    email_verificado: bool
    data_cadastro: datetime
    ultimo_login: Optional[datetime] = None
    is_active: bool
    foto_perfil: Optional[str] = None
    
    # Informações sobre métodos de autenticação
    has_password: bool
    has_google: bool
    can_remove_google: bool
    
    # Estatísticas do usuário (opcionais)
    total_transacoes: Optional[int] = 0
    saldo_total: Optional[float] = 0.0
    total_contas: Optional[int] = 0
    total_cartoes: Optional[int] = 0

    class Config:
        from_attributes = True


class UserAccountSecurity(BaseModel):
    """Schema para informações de segurança da conta"""
    has_password: bool
    has_google: bool
    provider: str
    email_verificado: bool
    is_verified: bool
    ultimo_login: Optional[datetime] = None
    data_cadastro: datetime
    can_remove_google: bool

    class Config:
        from_attributes = True


class UserDeactivate(BaseModel):
    """Schema para desativação de conta"""
    confirmacao: bool = Field(description="Confirmação de desativação")
    senha_atual: Optional[str] = Field(None, description="Senha atual (se usuário tem senha)")

    @model_validator(mode='after')
    def validate_deactivation(self):
        """Valida confirmação de desativação"""
        if not self.confirmacao:
            raise ValueError('É necessário confirmar a desativação da conta')
        return self


class UserProfileImageResponse(BaseModel):
    """Schema para resposta de upload de foto de perfil"""
    foto_perfil: str = Field(description="URL da foto de perfil")
    message: str = Field(description="Mensagem de sucesso")


class UserProfileResponse(BaseModel):
    """Schema para resposta completa do perfil"""
    id: int
    nome: str
    sobrenome: str
    email: EmailStr
    provider: str
    foto_perfil: Optional[str] = None
    avatar_url: Optional[str] = None  # URL completa da foto ou avatar padrão
    has_password: bool
    has_google: bool
    can_remove_google: bool
    email_verificado: bool
    is_verified: bool
    data_cadastro: datetime
    ultimo_login: Optional[datetime] = None

    class Config:
        from_attributes = True