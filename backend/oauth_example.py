#!/usr/bin/env python3
"""
Exemplo de como usar as configurações OAuth no FastAPI
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
from app.core.config import get_settings

router = APIRouter()

def get_oauth_settings():
    """Dependency para obter configurações OAuth"""
    return get_settings()

@router.get("/auth/google")
async def google_auth(settings = Depends(get_oauth_settings)):
    """
    Inicia o fluxo de autenticação Google OAuth
    """
    if not settings.google_client_id:
        raise HTTPException(
            status_code=500, 
            detail="Google OAuth não configurado. Configure GOOGLE_CLIENT_ID no .env"
        )
    
    # URL de autorização do Google
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={settings.google_client_id}&"
        "response_type=code&"
        "scope=openid email profile&"
        f"redirect_uri={settings.frontend_url}/auth/callback&"
        "access_type=offline"
    )
    
    return RedirectResponse(url=google_auth_url)

@router.get("/auth/callback")
async def google_callback(
    code: str,
    settings = Depends(get_oauth_settings)
):
    """
    Callback do Google OAuth
    """
    if not settings.google_client_secret:
        raise HTTPException(
            status_code=500,
            detail="Google OAuth não configurado. Configure GOOGLE_CLIENT_SECRET no .env"
        )
    
    # Aqui você implementaria a troca do código por tokens
    # e a criação/atualização do usuário no banco de dados
    
    return {
        "message": "Autenticação Google OAuth configurada com sucesso!",
        "code": code,
        "frontend_url": settings.frontend_url
    }

# Exemplo de como verificar se OAuth está configurado
def is_oauth_configured(settings = Depends(get_oauth_settings)) -> bool:
    """Verifica se o Google OAuth está configurado"""
    return bool(settings.google_client_id and settings.google_client_secret)

@router.get("/auth/status")
async def oauth_status(settings = Depends(get_oauth_settings)):
    """
    Verifica o status das configurações OAuth
    """
    return {
        "oauth_configured": is_oauth_configured(settings),
        "google_client_id_configured": bool(settings.google_client_id),
        "google_client_secret_configured": bool(settings.google_client_secret),
        "frontend_url": settings.frontend_url,
        "session_secret_configured": bool(settings.session_secret_key)
    }
