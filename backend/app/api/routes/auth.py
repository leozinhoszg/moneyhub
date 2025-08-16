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
from app.crud.verification_code import (
    create_verification_code,
    get_verification_code,
    use_verification_code
)
from app.crud.password_reset_token import password_reset_token_crud
from app.services.email_service import email_service
from app.schemas.auth import AuthResponse, LoginRequest
from app.schemas.password_reset import PasswordResetRequest, PasswordResetResponse, PasswordResetConfirm, PasswordResetConfirmResponse
from app.schemas.user import UserCreate, UserPublic
from app.schemas.verification import SendVerificationCodeRequest, VerifyCodeRequest, SendVerificationCodeResponse, VerifyCodeResponse


import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Configuração OAuth Google
oauth = OAuth()

def init_oauth():
    """Inicializa a configuração OAuth do Google"""
    settings = get_settings()
    
    try:
        oauth.register(
            name='google',
            client_id=settings.google_client_id,
            client_secret=settings.google_client_secret,
            client_kwargs={
                'scope': 'openid email profile',
                'prompt': 'select_account',  # Sempre mostrar seleção de conta
                'access_type': 'offline',  # Sempre solicitar refresh token
                'include_granted_scopes': 'true'  # Incluir escopos já concedidos
            },
            authorize_url='https://accounts.google.com/o/oauth2/v2/auth',
            access_token_url='https://oauth2.googleapis.com/token',
            userinfo_endpoint='https://www.googleapis.com/oauth2/v2/userinfo'
        )
        
    except Exception as e:
        logger.debug("OAuth initialization failed: %s", e)

# Inicializar OAuth imediatamente
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
    
    # Adicionar headers para limpar cache e forçar nova autenticação
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    
    return {"message": "Logout realizado com sucesso"}


@router.get("/auth/logout/google")
def logout_google(request: Request):
    """Logout que também revoga a sessão do Google"""
    settings = get_settings()
    frontend_url = settings.frontend_url or settings.cors_origins[0]
    
    # URL do Google para revogar sessão e forçar nova seleção de conta
    google_logout_url = "https://accounts.google.com/Logout"
    
    # Redirecionar para o Google logout e depois para o frontend
    return RedirectResponse(
        url=f"{google_logout_url}?continue={frontend_url}/auth/login",
        status_code=302
    )

# ============================================================================
# ROTAS DE RESET DE SENHA
# ============================================================================


# ============================================================================
# ROTAS OAUTH GOOGLE
# ============================================================================

@router.get("/auth/google")
async def google_auth(request: Request):
    """Iniciar autenticação Google"""
    redirect_uri = f"{request.url_for('google_callback')}"
    
    try:
        # Configurar para desenvolvimento (desabilitar validação de estado)
        # Adicionar prompt=select_account para sempre mostrar seleção de conta
        result = await oauth.google.authorize_redirect(
            request, 
            redirect_uri,
            state=None,  # Desabilitar validação de estado para desenvolvimento
            prompt="select_account",  # Sempre mostrar seleção de conta
            access_type="offline",  # Sempre solicitar refresh token
            include_granted_scopes="true"  # Incluir escopos já concedidos
        )
        return result
    except Exception as e:
        logger.debug("OAuth authorize_redirect failed, will propagate for fallback handling: %s", e)
        raise


@router.get("/auth/google/login")
async def google_login(request: Request):
    """Iniciar login Google (alias para compatibilidade)"""
    return await google_auth(request)


@router.get("/auth/google/callback")
async def google_callback(request: Request, response: Response, db: Session = Depends(get_db)):
    """Callback do Google OAuth"""
    settings = get_settings()
    
    try:
        # Verificar se temos os parâmetros necessários
        state = request.query_params.get('state')
        code = request.query_params.get('code')
        
        if not state or not code:
            frontend_url = settings.frontend_url or settings.cors_origins[0]
            return RedirectResponse(url=f"{frontend_url}/auth/login?error=missing_params")
        
        # Obter token do Google
        try:
            # Tentar obter token sem validação de estado para desenvolvimento
            token = await oauth.google.authorize_access_token(
                request,
                state=None  # Desabilitar validação de estado
            )
        except Exception as token_error:
            logger.debug("OAuth authorize_access_token failed, switching to manual token exchange: %s", token_error)
            
            # Tentar uma abordagem alternativa sem validação de estado
            try:
                # Extrair código manualmente
                code = request.query_params.get('code')
                if not code:
                    frontend_url = settings.frontend_url or settings.cors_origins[0]
                    return RedirectResponse(url=f"{frontend_url}/auth/login?error=missing_code")
                
                # Fazer requisição manual para obter token
                import httpx
                async with httpx.AsyncClient() as client:
                    token_url = "https://oauth2.googleapis.com/token"
                    # Construir redirect_uri corretamente
                    redirect_uri = f"{request.base_url}api/auth/google/callback"
                    
                    token_data = {
                        "client_id": settings.google_client_id,
                        "client_secret": settings.google_client_secret,
                        "code": code,
                        "grant_type": "authorization_code",
                        "redirect_uri": redirect_uri
                    }
                    
                    response = await client.post(token_url, data=token_data)
                    
                    if response.status_code == 200:
                        token = response.json()
                    else:
                        frontend_url = settings.frontend_url or settings.cors_origins[0]
                        return RedirectResponse(url=f"{frontend_url}/auth/login?error=manual_token_error")
                        
            except Exception as token_error2:
                logger.debug("Manual token exchange failed: %s", token_error2)
                frontend_url = settings.frontend_url or settings.cors_origins[0]
                return RedirectResponse(url=f"{frontend_url}/auth/login?error=token_error")
        
        # Obter informações do usuário
        user_info = token.get('userinfo')
        
        if not user_info:
            try:
                # Fallback: buscar informações do usuário
                async with httpx.AsyncClient() as client:
                    user_response = await client.get(
                        'https://www.googleapis.com/oauth2/v2/userinfo',
                        headers={'Authorization': f'Bearer {token["access_token"]}'}
                    )
                    user_info = user_response.json()
            except Exception as api_error:
                frontend_url = settings.frontend_url or settings.cors_origins[0]
                return RedirectResponse(url=f"{frontend_url}/auth/login?error=userinfo_error")
        
        google_id = user_info.get('id')
        email = user_info.get('email')
        nome = user_info.get('name', '')
        
        if not google_id or not email:
            frontend_url = settings.frontend_url or settings.cors_origins[0]
            return RedirectResponse(url=f"{frontend_url}/auth/login?error=missing_user_data")
        
        # Tentar autenticar usuário existente
        user = authenticate_google_user(db, google_id, email)
        
        if not user:
            # Criar novo usuário
            try:
                user = create_google_user(db, nome, email, google_id)
            except ValueError as e:
                frontend_url = settings.frontend_url or settings.cors_origins[0]
                return RedirectResponse(url=f"{frontend_url}/auth/login?error=user_creation_error")
        
        # Verificar se conta está ativa
        if not user.is_active:
            frontend_url = settings.frontend_url or settings.cors_origins[0]
            return RedirectResponse(url=f"{frontend_url}/auth/login?error=inactive_user")
        
        # Gerar tokens
        access_token = create_access_token(str(user.id), settings)
        refresh_token = create_refresh_token(str(user.id), settings)
        
        # Atualizar último login
        update_last_login(db, user)
        
        # Criar resposta de redirecionamento com cookies
        frontend_url = settings.frontend_url or settings.cors_origins[0]
        redirect_url = f"{frontend_url}/auth/callback?success=true"
        
        # Criar resposta de redirecionamento
        redirect_response = RedirectResponse(url=redirect_url)
        
        # Configurar cookies na resposta de redirecionamento
        max_age = settings.access_token_expire_minutes * 60
        redirect_response.set_cookie(
            key="access_token",
            value=f"Bearer {access_token}",
            httponly=True,
            secure=settings.cookie_secure,
            samesite=settings.cookie_samesite,
            max_age=max_age,
            path="/",
        )
        
        # Cookie do token de refresh
        refresh_max_age = settings.jwt_refresh_expiration_days * 24 * 60 * 60
        redirect_response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=settings.cookie_secure,
            samesite=settings.cookie_samesite,
            max_age=refresh_max_age,
            path="/auth/refresh",
        )
        
        # Token CSRF
        from app.core.security import generate_csrf_token
        csrf_token = generate_csrf_token()
        redirect_response.set_cookie(
            key="XSRF-TOKEN",
            value=csrf_token,
            httponly=False,
            secure=settings.cookie_secure,
            samesite=settings.cookie_samesite,
            max_age=max_age,
            path="/",
        )
        
        return redirect_response
        
    except OAuthError as e:
        # Erro no processo OAuth
        logger.debug("OAuthError during Google login: %s", e)
        frontend_url = settings.frontend_url or settings.cors_origins[0]
        return RedirectResponse(url=f"{frontend_url}/auth/login?error=oauth_error")
    
    except Exception as e:
        # Outros erros
        logger.debug("Unexpected error during Google login: %s", e)
        frontend_url = settings.frontend_url or settings.cors_origins[0]
        return RedirectResponse(url=f"{frontend_url}/auth/login?error=server_error")


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


# ============================================================================
# ROTAS DE VERIFICAÇÃO POR EMAIL
# ============================================================================

@router.post("/auth/send-verification-code", response_model=SendVerificationCodeResponse)
async def send_verification_code(
    payload: SendVerificationCodeRequest, 
    db: Session = Depends(get_db)
):
    """Enviar código de verificação por email"""
    
    # Verificar se email já está em uso
    existing_user = get_user_by_email(db, payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email já está cadastrado"
        )
    
    try:
        # Preparar dados do usuário para armazenar temporariamente
        user_data = {
            "nome": payload.nome,
            "sobrenome": payload.sobrenome,
            "email": payload.email
        }
        
        # Criar código de verificação no banco
        verification_code = create_verification_code(db, payload.email, user_data)
        
        # Enviar email com o código
        full_name = f"{payload.nome} {payload.sobrenome}"
        email_sent = await email_service.send_verification_email(
            email=payload.email,
            code=verification_code.code,
            user_name=full_name
        )
        
        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao enviar email de verificação"
            )
        
        return SendVerificationCodeResponse(
            message="Código de verificação enviado com sucesso",
            email=payload.email
        )
        
    except Exception as e:
        print(f"Erro ao enviar código de verificação: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.post("/auth/verify-code", response_model=VerifyCodeResponse)
async def verify_code_and_create_account(
    payload: VerifyCodeRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    """Verificar código e criar conta"""
    
    # Buscar código de verificação
    verification_code = get_verification_code(db, payload.email, payload.code)
    
    if not verification_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de verificação inválido ou expirado"
        )
    
    # Verificar se o código expirou
    if email_service.is_code_expired(verification_code.created_at):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de verificação expirado"
        )
    
    # Verificar se email já está em uso (dupla verificação)
    existing_user = get_user_by_email(db, payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email já está cadastrado"
        )
    
    try:
        # Recuperar dados do usuário do código de verificação
        import json
        user_data = json.loads(verification_code.user_data)
        
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
        
        # Criar usuário com nome e sobrenome separados
        user = create_user(
            db, 
            nome=user_data['nome'], 
            sobrenome=user_data['sobrenome'],
            email=payload.email, 
            senha=payload.senha
        )
        
        # Marcar código como usado
        use_verification_code(db, verification_code)
        
        # Gerar tokens
        settings = get_settings()
        access_token = create_access_token(str(user.id), settings)
        refresh_token = create_refresh_token(str(user.id), settings)
        
        # Configurar cookies
        max_age = settings.access_token_expire_minutes * 60
        set_auth_cookies(response, access_token, settings, max_age, refresh_token)
        
        # Atualizar último login
        update_last_login(db, user)
        
        return VerifyCodeResponse(
            message="Conta criada e autenticada com sucesso",
            user=UserPublic.model_validate(user).model_dump()
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=str(e)
        )
    except Exception as e:
        print(f"Erro ao verificar código e criar conta: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


# ============================================================================
# ROTAS DE RESET DE SENHA
# ============================================================================

@router.post("/auth/forgot-password", response_model=PasswordResetResponse)
async def forgot_password(payload: PasswordResetRequest, db: Session = Depends(get_db)):
    """Solicitar reset de senha via email"""
    
    # Verificar se usuário existe
    user = get_user_by_email(db, payload.email)
    if not user:
        # Por segurança, sempre retornar sucesso mesmo se email não existir
        return PasswordResetResponse(
            message="Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha.",
            success=True
        )
    
    # Verificar se usuário tem senha (não é apenas OAuth)
    if not user.has_password:
        return PasswordResetResponse(
            message="Esta conta foi criada com Google. Use 'Continuar com Google' para fazer login.",
            success=False
        )
    
    try:
        # Invalidar tokens existentes do usuário
        password_reset_token_crud.invalidate_user_tokens(db, payload.email)
        
        # Gerar novo token
        reset_token = email_service.generate_reset_token()
        
        # Salvar token no banco
        password_reset_token_crud.create_reset_token(
            db=db,
            email=payload.email,
            token=reset_token,
            user_id=user.id
        )
        
        # Enviar email
        email_sent = await email_service.send_password_reset_email(
            email=payload.email,
            reset_token=reset_token,
            user_name=user.nome
        )
        
        if not email_sent:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao enviar email. Tente novamente."
            )
        
        return PasswordResetResponse(
            message="Email enviado com sucesso! Verifique sua caixa de entrada.",
            success=True
        )
        
    except Exception as e:
        print(f"Erro ao solicitar reset de senha: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.post("/auth/reset-password", response_model=PasswordResetConfirmResponse)
def reset_password(payload: PasswordResetConfirm, db: Session = Depends(get_db)):
    """Confirmar reset de senha com token"""
    
    # Validar se senhas coincidem
    if payload.new_password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="As senhas não coincidem"
        )
    
    # Validar força da senha
    password_validation = validate_password_strength(payload.new_password)
    if not password_validation["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "Senha não atende aos critérios de segurança",
                "issues": password_validation["issues"]
            }
        )
    
    # Buscar token válido
    reset_token = password_reset_token_crud.get_valid_token(db, payload.token)
    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido ou expirado"
        )
    
    # Verificar se token não expirou
    if email_service.is_code_expired(reset_token.created_at):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token expirado. Solicite um novo reset de senha."
        )
    
    # Buscar usuário
    user = get_user_by_email(db, reset_token.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário não encontrado"
        )
    
    try:
        # Atualizar senha do usuário
        from app.core.security import get_password_hash
        user.senha_hash = get_password_hash(payload.new_password)
        
        # Marcar token como usado
        password_reset_token_crud.mark_token_as_used(db, payload.token)
        
        # Invalidar todos os outros tokens do usuário
        password_reset_token_crud.invalidate_user_tokens(db, reset_token.email)
        
        db.commit()
        
        return PasswordResetConfirmResponse(
            message="Senha redefinida com sucesso! Faça login com sua nova senha.",
            success=True
        )
        
    except Exception as e:
        print(f"Erro ao redefinir senha: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )