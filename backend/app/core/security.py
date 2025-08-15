# app/core/security.py
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
import secrets
import string

from fastapi import HTTPException, Request, Response, status
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import Settings


password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ============================================================================
# FUNÇÕES DE HASH E VERIFICAÇÃO DE SENHA
# ============================================================================

def get_password_hash(plain_password: str) -> str:
    """Gerar hash da senha"""
    return password_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar se a senha corresponde ao hash"""
    if not hashed_password:
        return False
    return password_context.verify(plain_password, hashed_password)


def validate_password_strength(password: str) -> Dict[str, Any]:
    """Validar força da senha e retornar feedback detalhado"""
    issues = []
    score = 0
    
    # Verificações básicas
    if len(password) < 6:
        issues.append("Senha deve ter pelo menos 6 caracteres")
    elif len(password) >= 8:
        score += 1
        if len(password) >= 12:
            score += 1
    
    # Verificar caracteres
    has_lower = any(c.islower() for c in password)
    has_upper = any(c.isupper() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
    
    if not has_lower:
        issues.append("Senha deve conter pelo menos uma letra minúscula")
    else:
        score += 1
        
    if not has_upper:
        issues.append("Senha deve conter pelo menos uma letra maiúscula")
    else:
        score += 1
        
    if not has_digit:
        issues.append("Senha deve conter pelo menos um número")
    else:
        score += 1
        
    if has_special:
        score += 1
    
    # Determinar nível de força
    if score <= 2:
        strength = "fraca"
    elif score <= 4:
        strength = "média"
    else:
        strength = "forte"
    
    return {
        "is_valid": len(issues) == 0,
        "issues": issues,
        "strength": strength,
        "score": score
    }


# ============================================================================
# FUNÇÕES JWT
# ============================================================================

def create_access_token(subject: str, settings: Settings, expires_minutes: Optional[int] = None) -> str:
    """Criar token de acesso JWT"""
    expire_delta = timedelta(minutes=expires_minutes or settings.access_token_expire_minutes)
    expire_at = datetime.now(tz=timezone.utc) + expire_delta
    to_encode: Dict[str, Any] = {
        "sub": subject, 
        "exp": expire_at,
        "iat": datetime.now(tz=timezone.utc),
        "type": "access"
    }
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt


def create_refresh_token(subject: str, settings: Settings) -> str:
    """Criar token de refresh JWT"""
    expire_delta = timedelta(days=settings.jwt_refresh_expiration_days)
    expire_at = datetime.now(tz=timezone.utc) + expire_delta
    to_encode: Dict[str, Any] = {
        "sub": subject,
        "exp": expire_at,
        "iat": datetime.now(tz=timezone.utc),
        "type": "refresh"
    }
    encoded_jwt = jwt.encode(to_encode, settings.jwt_refresh_secret, algorithm=settings.jwt_algorithm)
    return encoded_jwt


def decode_access_token(token: str, settings: Settings) -> Dict[str, Any]:
    """Decodificar e validar token de acesso"""
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        
        # Verificar se é um token de acesso
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Tipo de token inválido"
            )
        
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token inválido ou expirado"
        )


def decode_refresh_token(token: str, settings: Settings) -> Dict[str, Any]:
    """Decodificar e validar token de refresh"""
    try:
        payload = jwt.decode(token, settings.jwt_refresh_secret, algorithms=[settings.jwt_algorithm])
        
        # Verificar se é um token de refresh
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Tipo de token inválido"
            )
        
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token de refresh inválido ou expirado"
        )


# ============================================================================
# FUNÇÕES DE COOKIES
# ============================================================================

def get_token_from_cookie(request: Request) -> str:
    """Extrair token JWT do cookie"""
    cookie_val = request.cookies.get("access_token")
    if not cookie_val:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Token de acesso não encontrado"
        )
    if not cookie_val.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Formato de token inválido"
        )
    return cookie_val.split(" ", 1)[1]


def set_auth_cookies(response: Response, access_token: str, settings: Settings, max_age_seconds: int, refresh_token: Optional[str] = None) -> None:
    """Definir cookies de autenticação"""
    # Cookie do token de acesso (HTTPOnly)
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=max_age_seconds,
        path="/",
    )
    
    # Cookie do token de refresh (se fornecido)
    if refresh_token:
        refresh_max_age = settings.jwt_refresh_expiration_days * 24 * 60 * 60  # Converter dias para segundos
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=settings.cookie_secure,
            samesite=settings.cookie_samesite,
            max_age=refresh_max_age,
            path="/auth/refresh",  # Restringir path para endpoint de refresh
        )
    
    # Token CSRF (para proteção CSRF)
    csrf_token = generate_csrf_token()
    response.set_cookie(
        key="XSRF-TOKEN",
        value=csrf_token,
        httponly=False,  # Precisa ser acessível via JavaScript
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=max_age_seconds,
        path="/",
    )


def clear_auth_cookies(response: Response) -> None:
    """Limpar todos os cookies de autenticação"""
    cookies_to_clear = ["access_token", "refresh_token", "XSRF-TOKEN"]
    
    for cookie_name in cookies_to_clear:
        response.delete_cookie(cookie_name, path="/")
        # Também tentar limpar com path específico
        if cookie_name == "refresh_token":
            response.delete_cookie(cookie_name, path="/auth/refresh")


# ============================================================================
# PROTEÇÃO CSRF
# ============================================================================

def generate_csrf_token() -> str:
    """Gerar token CSRF seguro"""
    return secrets.token_urlsafe(32)


def ensure_csrf(request: Request) -> None:
    """Verificar proteção CSRF"""
    # Verificar se é uma requisição que modifica estado
    if request.method in ["GET", "HEAD", "OPTIONS"]:
        return  # Métodos seguros não precisam de verificação CSRF
    
    header_token = request.headers.get("x-csrf-token") or request.headers.get("X-CSRF-Token")
    cookie_token = request.cookies.get("XSRF-TOKEN")
    
    if not header_token or not cookie_token or header_token != cookie_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Token CSRF inválido ou ausente"
        )


# ============================================================================
# FUNÇÕES DE VERIFICAÇÃO E VALIDAÇÃO
# ============================================================================

def generate_verification_token() -> str:
    """Gerar token de verificação de email"""
    return secrets.token_urlsafe(32)


def generate_reset_token() -> str:
    """Gerar token de reset de senha"""
    return secrets.token_urlsafe(32)


def generate_secure_password(length: int = 12) -> str:
    """Gerar senha segura aleatória"""
    if length < 8:
        length = 8
    
    # Definir caracteres permitidos
    lowercase = string.ascii_lowercase
    uppercase = string.ascii_uppercase
    digits = string.digits
    special_chars = "!@#$%^&*"
    
    # Garantir pelo menos um caractere de cada tipo
    password = [
        secrets.choice(lowercase),
        secrets.choice(uppercase),
        secrets.choice(digits),
        secrets.choice(special_chars)
    ]
    
    # Preencher o resto com caracteres aleatórios
    all_chars = lowercase + uppercase + digits + special_chars
    for _ in range(length - 4):
        password.append(secrets.choice(all_chars))
    
    # Embaralhar a senha
    secrets.SystemRandom().shuffle(password)
    
    return ''.join(password)


# ============================================================================
# FUNÇÕES DE RATE LIMITING (BÁSICO)
# ============================================================================

def check_rate_limit(request: Request, max_attempts: int = 5, window_minutes: int = 15) -> bool:
    """Verificação básica de rate limiting (implementação simples)"""
    # Esta é uma implementação básica
    # Em produção, use Redis ou outra solução mais robusta
    
    client_ip = request.client.host if request.client else "unknown"
    current_time = datetime.now(tz=timezone.utc)
    
    # Aqui você implementaria a lógica de rate limiting
    # Por exemplo, usando cache em memória ou Redis
    
    return True  # Por enquanto, sempre permite


def create_password_reset_token(user_id: int, settings: Settings) -> str:
    """Criar token JWT para reset de senha"""
    expire_delta = timedelta(hours=1)  # Token expira em 1 hora
    expire_at = datetime.now(tz=timezone.utc) + expire_delta
    
    to_encode: Dict[str, Any] = {
        "sub": str(user_id),
        "exp": expire_at,
        "iat": datetime.now(tz=timezone.utc),
        "type": "password_reset"
    }
    
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt


def verify_password_reset_token(token: str, settings: Settings) -> Optional[int]:
    """Verificar token de reset de senha e retornar user_id"""
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        
        if payload.get("type") != "password_reset":
            return None
        
        user_id = payload.get("sub")
        if user_id:
            return int(user_id)
        
        return None
    except JWTError:
        return None