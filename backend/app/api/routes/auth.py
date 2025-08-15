# app/api/routes/auth.py
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth, OAuthError
import httpx

from app.api.deps import csrf_protect, get_db
from app.core.config import get_settings
from app.core.security import (
    create_access_token, 
    create_refresh_token,
    set_auth_cookies, 
    clear_auth_cookies,
    validate_password_strength,
    create_password_reset_token,
    verify_password_reset_token
)
from app.crud.user import (
    authenticate_user, 
    create_user, 
    get_user_by_email, 
    get_user_by_id,
    update_last_login, 
    create_google_user,
    authenticate_google_user
)
from app.schemas.auth import AuthResponse, LoginRequest, PasswordResetRequest, PasswordResetConfirm
from app.schemas.user import UserCreate, UserPublic


router = APIRouter()

# Configuração OAuth Google
oauth = OAuth()

def init_oauth():
    """Inicializa a configuração OAuth do Google"""
    settings = get_settings()
    oauth.register(
        name='google',
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        client_kwargs={
            'scope': 'openid email profile'
        },
        server_metadata_url='https://accounts.google.com/.well-known/openid_configuration'
    )

# Inicializar OAuth na importação do módulo
init_oauth()


# ============================================================================
# ROTAS DE REGISTRO
# ============================================================================

@router.post("/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, response: Response, db: Session = Depends(get_db)):
    """Registrar novo usuário com email e senha"""
    
    # Verificar se email já está em uso
    existing_user = get_user_by_email(db, payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email já está cadastrado"
        )
    
    # Validar força da senha
    password_validation = validate_password_strength(payload.senha)
    if not password_validation["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Senha não atende aos critérios de segurança",
                "issues": password_validation["issues"]
            }
        )
    
    try:
        # Criar usuário
        user = create_user(db, nome=payload.nome, email=payload.email, senha=payload.senha)
        
        # Gerar tokens
        settings = get_settings()
        access_token = create_access_token(str(user.id), settings)
        refresh_token = create_refresh_token(str(user.id), settings)
        
        # Configurar cookies
        max_age = settings.access_token_expire_minutes * 60
        set_auth_cookies(response, access_token, settings, max_age, refresh_token)
        
        # Atualizar último login
        update_last_login(db, user)
        
        return AuthResponse(user=UserPublic.model_validate(user))
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=str(e)
        )


@router.post("/auth/check-email", response_model=dict)
def check_email_availability(email_data: dict, db: Session = Depends(get_db)):
    """Verificar se email está disponível para cadastro"""
    email = email_data.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email é obrigatório"
        )
    
    existing_user = get_user_by_email(db, email)
    is_available = existing_user is None
    
    return {
        "email": email,
        "available": is_available,
        "message": "Email disponível" if is_available else "Email já está em uso"
    }


@router.post("/auth/validate-password", response_model=dict)
def validate_password(password_data: dict):
    """Validar força da senha (endpoint para feedback em tempo real)"""
    password = password_data.get("password", "")
    validation = validate_password_strength(password)
    
    return {
        "password_strength": validation["strength"],
        "score": validation["score"],
        "is_valid": validation["is_valid"],
        "issues": validation["issues"]
    }


# ============================================================================
# ROTAS DE LOGIN
# ============================================================================

@router.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """Fazer login com email e senha"""
    
    # Autenticar usuário
    user = authenticate_user(db, email=payload.email, senha=payload.senha)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email ou senha incorretos"
        )
    
    # Verificar se conta está ativa
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conta desativada. Entre em contato com o suporte."
        )
    
    # Gerar tokens
    settings = get_settings()
    access_token = create_access_token(str(user.id), settings)
    refresh_token = create_refresh_token(str(user.id), settings)
    
    # Configurar cookies
    max_age = settings.access_token_expire_minutes * 60
    set_auth_cookies(response, access_token, settings, max_age, refresh_token)
    
    # Atualizar último login
    update_last_login(db, user)
    
    return AuthResponse(user=UserPublic.model_validate(user))


@router.post("/auth/logout", dependencies=[Depends(csrf_protect)])
def logout(response: Response):
    """Fazer logout (limpar cookies)"""
    clear_auth_cookies(response)
    return {"message": "Logout realizado com sucesso"}


# ============================================================================
# ROTAS DE RESET DE SENHA
# ============================================================================

@router.post("/auth/forgot-password", response_model=dict)
def forgot_password(payload: PasswordResetRequest, db: Session = Depends(get_db)):
    """Solicitar reset de senha (enviar email com token)"""
    user = get_user_by_email(db, payload.email)
    
    # Mesmo que o usuário não exista, retornamos sucesso por segurança
    # (evita enumeration attacks)
    if not user:
        return {"message": "Se o email estiver cadastrado, você receberá instruções para redefinir sua senha"}
    
    # Verificar se usuário tem senha (não é só OAuth)
    if not user.has_password:
        return {"message": "Esta conta foi criada via Google. Use o login com Google ou defina uma senha primeiro."}
    
    # Gerar token de reset
    settings = get_settings()
    reset_token = create_password_reset_token(user.id, settings)
    
    # Aqui você implementaria o envio de email
    # Por enquanto, vamos só simular
    print(f"Token de reset para {user.email}: {reset_token}")
    
    return {"message": "Se o email estiver cadastrado, você receberá instruções para redefinir sua senha"}


@router.post("/auth/reset-password", response_model=dict)
def reset_password(payload: PasswordResetConfirm, db: Session = Depends(get_db)):
    """Confirmar reset de senha com token"""
    settings = get_settings()
    
    # Verificar token
    user_id = verify_password_reset_token(payload.token, settings)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido ou expirado"
        )
    
    # Buscar usuário
    user = get_user_by_id(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário não encontrado ou inativo"
        )
    
    # Validar nova senha
    if payload.nova_senha != payload.confirmar_senha:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senhas não coincidem"
        )
    
    password_validation = validate_password_strength(payload.nova_senha)
    if not password_validation["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Nova senha não atende aos critérios de segurança",
                "issues": password_validation["issues"]
            }
        )
    
    try:
        # Atualizar senha
        from app.crud.user import set_user_password
        from app.core.security import get_password_hash
        
        user.senha_hash = get_password_hash(payload.nova_senha)
        if user.provider == "google":
            user.provider = "both"
        elif not user.provider or user.provider == "":
            user.provider = "email"
        
        user.updated_at = datetime.now(tz=timezone.utc)
        db.commit()
        
        return {"message": "Senha redefinida com sucesso"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


# ============================================================================
# ROTAS OAUTH GOOGLE
# ============================================================================

@router.get("/auth/google")
async def google_auth(request: Request):
    """Iniciar autenticação Google"""
    redirect_uri = f"{request.url_for('google_callback')}"
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/auth/google/login")
async def google_login(request: Request):
    """Iniciar login Google (alias para compatibilidade)"""
    return await google_auth(request)


@router.get("/auth/google/callback")
async def google_callback(request: Request, response: Response, db: Session = Depends(get_db)):
    """Callback do Google OAuth"""
    try:
        # Obter token do Google
        token = await oauth.google.authorize_access_token(request)
        
        # Obter informações do usuário
        user_info = token.get('userinfo')
        if not user_info:
            # Fallback: buscar informações do usuário
            async with httpx.AsyncClient() as client:
                user_response = await client.get(
                    'https://www.googleapis.com/oauth2/v2/userinfo',
                    headers={'Authorization': f'Bearer {token["access_token"]}'}
                )
                user_info = user_response.json()
        
        google_id = user_info.get('id')
        email = user_info.get('email')
        nome = user_info.get('name', '')
        
        if not google_id or not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Não foi possível obter informações da conta Google"
            )
        
        # Tentar autenticar usuário existente
        user = authenticate_google_user(db, google_id, email)
        
        if not user:
            # Criar novo usuário
            try:
                user = create_google_user(db, nome, email, google_id)
            except ValueError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=str(e)
                )
        
        # Verificar se conta está ativa
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Conta desativada. Entre em contato com o suporte."
            )
        
        # Gerar tokens
        settings = get_settings()
        access_token = create_access_token(str(user.id), settings)
        refresh_token = create_refresh_token(str(user.id), settings)
        
        # Configurar cookies
        max_age = settings.access_token_expire_minutes * 60
        set_auth_cookies(response, access_token, settings, max_age, refresh_token)
        
        # Atualizar último login
        update_last_login(db, user)
        
        # Redirecionar para o frontend
        frontend_url = settings.cors_origins.split(',')[0]  # Primeira origem CORS como padrão
        return RedirectResponse(url=f"{frontend_url}/dashboard?auth=success")
        
    except OAuthError as e:
        # Erro no processo OAuth
        frontend_url = settings.cors_origins.split(',')[0]
        return RedirectResponse(url=f"{frontend_url}/login?error=oauth_error")
    
    except Exception as e:
        # Outros erros
        print(f"Erro no callback Google: {e}")
        frontend_url = settings.cors_origins.split(',')[0]
        return RedirectResponse(url=f"{frontend_url}/login?error=server_error")


# ============================================================================
# ROTAS DE REFRESH TOKEN
# ============================================================================

@router.post("/auth/refresh", response_model=AuthResponse)
def refresh_access_token(request: Request, response: Response, db: Session = Depends(get_db)):
    """Renovar access token usando refresh token"""
    
    # Obter refresh token do cookie
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token não encontrado"
        )
    
    # Decodificar refresh token
    try:
        from app.core.security import decode_refresh_token
        settings = get_settings()
        payload = decode_refresh_token(refresh_token, settings)
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token inválido"
            )
        
        # Buscar usuário
        user = get_user_by_id(db, int(user_id))
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário não encontrado ou inativo"
            )
        
        # Gerar novos tokens
        new_access_token = create_access_token(str(user.id), settings)
        new_refresh_token = create_refresh_token(str(user.id), settings)
        
        # Configurar novos cookies
        max_age = settings.access_token_expire_minutes * 60
        set_auth_cookies(response, new_access_token, settings, max_age, new_refresh_token)
        
        return AuthResponse(user=UserPublic.model_validate(user))
        
    except Exception as e:
        # Limpar cookies inválidos
        clear_auth_cookies(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token inválido ou expirado"
        )


# ============================================================================
# ROTAS DE VERIFICAÇÃO
# ============================================================================

@router.get("/auth/me", response_model=UserPublic)
def get_current_user_info(request: Request, db: Session = Depends(get_db)):
    """Obter informações do usuário atual (verificar se está logado)"""
    from app.api.deps import get_current_user
    
    try:
        current_user = get_current_user(request, db)
        user_data = UserPublic.model_validate(current_user)
        user_data.has_password = current_user.has_password
        user_data.has_google = current_user.google_id is not None
        return user_data
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não autenticado"
        )


@router.get("/auth/status", response_model=dict)
def auth_status(request: Request, db: Session = Depends(get_db)):
    """Verificar status de autenticação"""
    try:
        from app.api.deps import get_current_user
        current_user = get_current_user(request, db)
        
        return {
            "authenticated": True,
            "user_id": current_user.id,
            "email": current_user.email,
            "provider": current_user.provider,
            "email_verified": current_user.email_verificado
        }
    except HTTPException:
        return {
            "authenticated": False,
            "user_id": None,
            "email": None,
            "provider": None,
            "email_verified": False
        }