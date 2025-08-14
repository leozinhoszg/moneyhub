from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from fastapi import HTTPException, Request, Response, status
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import Settings


password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(plain_password: str) -> str:
    return password_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, settings: Settings, expires_minutes: int | None = None) -> str:
    expire_delta = timedelta(minutes=expires_minutes or settings.access_token_expire_minutes)
    expire_at = datetime.now(tz=timezone.utc) + expire_delta
    to_encode: Dict[str, Any] = {"sub": subject, "exp": expire_at}
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt


def decode_access_token(token: str, settings: Settings) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido ou expirado")


def get_token_from_cookie(request: Request) -> str:
    cookie_val = request.cookies.get("access_token")
    if not cookie_val:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Não autenticado")
    if not cookie_val.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token ausente")
    return cookie_val.split(" ", 1)[1]


def set_auth_cookies(response: Response, token: str, settings: Settings, max_age_seconds: int) -> None:
    # JWT em cookie HTTPOnly
    response.set_cookie(
        key="access_token",
        value=f"Bearer {token}",
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=max_age_seconds,
        path="/",
    )
    # CSRF token (double submit cookie pattern)
    # O valor é o próprio JWT subject + exp como base simples; em produção, prefira um token aleatório independente
    csrf_token = token[-32:]  # derivado do token; simples para MVP
    response.set_cookie(
        key="XSRF-TOKEN",
        value=csrf_token,
        httponly=False,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=max_age_seconds,
        path="/",
    )


def clear_auth_cookies(response: Response) -> None:
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("XSRF-TOKEN", path="/")


def ensure_csrf(request: Request) -> None:
    header_token = request.headers.get("x-csrf-token")
    cookie_token = request.cookies.get("XSRF-TOKEN")
    if not header_token or not cookie_token or header_token != cookie_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF inválido")


