# app/api/routes/user.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.user import UserPublic, UserUpdate, UserChangePassword, UserProfile
from app.crud.user import update_user, change_user_password, get_user_stats
from app.core.security import verify_password


router = APIRouter()


@router.get("/users/me", response_model=UserPublic)
def read_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Obter informações básicas do usuário atual"""
    return UserPublic.model_validate(current_user)


@router.get("/users/profile", response_model=UserProfile)
def read_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Obter perfil completo do usuário com estatísticas"""
    # Obter estatísticas do usuário (implementar conforme sua lógica de negócio)
    stats = get_user_stats(db, current_user.id)
    
    user_data = UserProfile.model_validate(current_user)
    if stats:
        user_data.total_transacoes = stats.get('total_transacoes', 0)
        user_data.saldo_total = stats.get('saldo_total', 0.0)
    
    return user_data


@router.put("/users/me", response_model=UserPublic)
def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualizar informações do usuário atual"""
    # Verificar se o email já está em uso por outro usuário
    if user_update.email and user_update.email != current_user.email:
        from app.crud.user import get_user_by_email
        existing_user = get_user_by_email(db, user_update.email)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já está em uso"
            )
    
    # Atualizar usuário
    updated_user = update_user(db, current_user, user_update.model_dump(exclude_unset=True))
    return UserPublic.model_validate(updated_user)


@router.post("/users/change-password")
def change_password(
    password_data: UserChangePassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Alterar senha do usuário"""
    # Verificar se o usuário tem senha (não é usuário do Google apenas)
    if not current_user.senha_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuários autenticados via Google não podem alterar senha"
        )
    
    # Verificar senha atual
    if not verify_password(password_data.senha_atual, current_user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Senha atual incorreta"
        )
    
    # Verificar se nova senha e confirmação coincidem
    if password_data.nova_senha != password_data.confirmar_senha:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nova senha e confirmação não coincidem"
        )
    
    # Alterar senha
    change_user_password(db, current_user, password_data.nova_senha)
    
    return {"message": "Senha alterada com sucesso"}


@router.post("/users/link-google")
def link_google_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Vincular conta Google a usuário existente"""
    # Esta rota seria chamada após um fluxo OAuth específico para vincular conta
    # Por agora, retorna informação sobre como proceder
    
    if current_user.google_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conta Google já vinculada"
        )
    
    return {
        "message": "Para vincular sua conta Google, use o link de autenticação",
        "link": "/auth/google/link"  # Implementar esta rota no auth.py se necessário
    }


@router.delete("/users/unlink-google")
def unlink_google_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Desvincular conta Google"""
    if not current_user.google_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhuma conta Google vinculada"
        )
    
    if not current_user.senha_hash:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível desvincular Google sem ter uma senha definida"
        )
    
    # Desvincular conta Google
    from app.crud.user import unlink_google_account
    unlink_google_account(db, current_user)
    
    return {"message": "Conta Google desvinculada com sucesso"}


@router.get("/users/account-info")
def get_account_info(current_user: User = Depends(get_current_user)):
    """Obter informações sobre métodos de autenticação disponíveis"""
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "provider": current_user.provider,
        "has_password": bool(current_user.senha_hash),
        "has_google": bool(current_user.google_id),
        "is_verified": current_user.is_verified,
        "auth_methods": {
            "email_password": bool(current_user.senha_hash),
            "google": bool(current_user.google_id)
        }
    }