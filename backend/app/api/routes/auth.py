from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth, OAuthError
from starlette.middleware.sessions import SessionMiddleware
import httpx

from app.api.deps import csrf_protect, get_db
from app.core.config import get_settings
from app.core.security import create_access_token, set_auth_cookies, clear_auth_cookies
from app.crud.user import authenticate_user, create_user, get_user_by_email, update_last_login, create_google_user
from app.schemas.auth import AuthResponse, LoginRequest
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


@router.post("/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, response: Response, db: Session = Depends(get_db)):
    if get_user_by_email(db, payload.email):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="E-mail já cadastrado")
    user = create_user(db, nome=payload.nome, email=payload.email, senha=payload.senha)

    token = create_access_token(str(user.id), get_settings())
    max_age = get_settings().access_token_expire_minutes * 60
    set_auth_cookies(response, token, get_settings(), max_age)
    return AuthResponse(user=UserPublic.model_validate(user))


@router.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = authenticate_user(db, email=payload.email, senha=payload.senha)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Credenciais inválidas")

    update_last_login(db, user)
    token = create_access_token(str(user.id), get_settings())
    max_age = get_settings().access_token_expire_minutes * 60
    set_auth_cookies(response, token, get_settings(), max_age)
    return AuthResponse(user=UserPublic.model_validate(user))


@router.post("/auth/logout", dependencies=[Depends(csrf_protect)])
def logout(response: Response):
    clear_auth_cookies(response)
    return {"message": "logout ok"}


# Novas rotas para Google OAuth
@router.get("/auth/google")
async def google_auth(request: Request):
    """Rota principal para autenticação Google (redireciona para login)"""
    redirect_uri = f"{request.url_for('google_callback')}?type=login"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/auth/google/login")
async def google_login(request: Request):
    """Inicia o fluxo de login com Google"""
    redirect_uri = f"{request.url_for('google_callback')}?type=login"
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/auth/google/register")
async def google_register(request: Request):
    """Inicia o fluxo de registro com Google"""
    redirect_uri = f"{request.url_for('google_callback')}?type=register"
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/auth/google/callback")
async def google_callback(
    request: Request, 
    response: Response,
    type: str = "login", 
    db: Session = Depends(get_db)
):
    """Callback do Google OAuth"""
    settings = get_settings()
    
    try:
        # Obter token do Google
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if not user_info:
            return RedirectResponse(
                url=f"{settings.frontend_url}/auth/login?error=Falha ao obter informações do Google"
            )
        
        email = user_info['email']
        nome = user_info['name']
        google_id = user_info.get('sub')
        
        # Verificar se usuário já existe
        existing_user = get_user_by_email(db, email)
        
        if type == "register" and existing_user:
            return RedirectResponse(
                url=f"{settings.frontend_url}/auth/register?error=Email já cadastrado"
            )
        
        if type == "login" and not existing_user:
            return RedirectResponse(
                url=f"{settings.frontend_url}/auth/login?error=Usuário não encontrado"
            )
        
        # Criar usuário se não existir (para registro)
        if not existing_user:
            user = create_google_user(
                db, 
                nome=nome, 
                email=email, 
                google_id=google_id
            )
        else:
            user = existing_user
            # Atualizar último login
            update_last_login(db, user)
        
        # Criar token de acesso
        access_token = create_access_token(str(user.id), settings)
        
        # Definir cookies de autenticação
        max_age = settings.access_token_expire_minutes * 60
        set_auth_cookies(response, access_token, settings, max_age)
        
        # Redirecionar para o dashboard
        redirect_response = RedirectResponse(url=f"{settings.frontend_url}/dashboard")
        
        # Copiar cookies para a resposta de redirecionamento
        if response.headers.get("set-cookie"):
            redirect_response.headers["set-cookie"] = response.headers["set-cookie"]
        
        return redirect_response
        
    except OAuthError as error:
        error_message = f"Erro na autenticação: {error.error}"
        return RedirectResponse(
            url=f"{settings.frontend_url}/auth/login?error={error_message}"
        )
    except Exception as error:
        return RedirectResponse(
            url=f"{settings.frontend_url}/auth/login?error=Erro interno do servidor"
        )