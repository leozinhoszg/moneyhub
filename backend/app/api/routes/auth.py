from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.api.deps import csrf_protect, get_db
from app.core.config import get_settings
from app.core.security import create_access_token, set_auth_cookies, clear_auth_cookies
from app.crud.user import authenticate_user, create_user, get_user_by_email, update_last_login
from app.schemas.auth import AuthResponse, LoginRequest
from app.schemas.user import UserCreate, UserPublic


router = APIRouter()


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


