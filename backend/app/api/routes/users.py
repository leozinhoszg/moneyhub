# app/api/routes/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.user import (
    UserPublic, 
    UserUpdate, 
    UserChangePassword, 
    UserSetPassword,
    UserProfile,
    UserAccountSecurity,
    UserDeactivate
)
from app.crud.user import (
    update_user, 
    change_user_password, 
    set_user_password,
    get_user_stats,
    verify_user_email,
    link_google_account,
    unlink_google_account,
    deactivate_user,
    resend_verification_email
)
from app.core.security import verify_password

router = APIRouter()


# ============================================================================
# ROTAS DE INFORMAÇÕES DO USUÁRIO
# ============================================================================

@router.get("/users/me", response_model=UserPublic)
def read_me(current_user: User = Depends(get_current_user)):
    """Obter informações básicas do usuário atual"""
    user_data = UserPublic.model_validate(current_user)
    # Adicionar informações sobre métodos de autenticação
    user_data.has_password = current_user.has_password
    user_data.has_google = current_user.google_id is not None
    return user_data


@router.get("/users/profile", response_model=UserProfile)
def read_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Obter perfil completo do usuário com estatísticas"""
    # Obter estatísticas do usuário
    stats = get_user_stats(db, current_user.id)
    
    user_data = UserProfile.model_validate(current_user)
    user_data.has_password = current_user.has_password
    user_data.has_google = current_user.google_id is not None
    user_data.can_remove_google = current_user.can_remove_google
    
    if stats:
        user_data.total_transacoes = stats.get('total_transacoes', 0)
        user_data.saldo_total = stats.get('saldo_total', 0.0)
        user_data.total_contas = stats.get('total_contas', 0)
        user_data.total_cartoes = stats.get('total_cartoes', 0)
    
    return user_data


@router.get("/users/security", response_model=UserAccountSecurity)
def read_security_info(current_user: User = Depends(get_current_user)):
    """Obter informações de segurança da conta do usuário"""
    security_data = UserAccountSecurity.model_validate(current_user)
    security_data.has_password = current_user.has_password
    security_data.has_google = current_user.google_id is not None
    security_data.can_remove_google = current_user.can_remove_google
    return security_data


# ============================================================================
# ROTAS DE ATUALIZAÇÃO DE DADOS
# ============================================================================

@router.put("/users/me", response_model=UserPublic)
def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualizar informações básicas do usuário atual"""
    try:
        updated_user = update_user(
            db, 
            current_user, 
            nome=user_update.nome, 
            email=user_update.email
        )
        
        user_data = UserPublic.model_validate(updated_user)
        user_data.has_password = updated_user.has_password
        user_data.has_google = updated_user.google_id is not None
        return user_data
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=str(e)
        )


# ============================================================================
# ROTAS DE GERENCIAMENTO DE SENHA
# ============================================================================

@router.put("/users/change-password", response_model=UserPublic)
def change_password(
    password_data: UserChangePassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Alterar senha do usuário (para usuários que já têm senha)"""
    if not current_user.has_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário não possui senha definida. Use /users/set-password"
        )
    
    try:
        updated_user = change_user_password(
            db, 
            current_user, 
            password_data.senha_atual, 
            password_data.nova_senha
        )
        
        user_data = UserPublic.model_validate(updated_user)
        user_data.has_password = updated_user.has_password
        user_data.has_google = updated_user.google_id is not None
        return user_data
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=str(e)
        )


@router.post("/users/set-password", response_model=UserPublic)
def set_password(
    password_data: UserSetPassword,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Definir senha para usuário OAuth que não tinha senha"""
    if current_user.has_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário já possui senha. Use /users/change-password para alterar"
        )
    
    try:
        updated_user = set_user_password(db, current_user, password_data.nova_senha)
        
        user_data = UserPublic.model_validate(updated_user)
        user_data.has_password = updated_user.has_password
        user_data.has_google = updated_user.google_id is not None
        return user_data
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=str(e)
        )


# ============================================================================
# ROTAS DE VERIFICAÇÃO DE EMAIL
# ============================================================================

@router.post("/users/verify-email", response_model=dict)
def verify_email(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marcar email como verificado (normalmente seria chamado via token de email)"""
    if current_user.email_verificado:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já está verificado"
        )
    
    verify_user_email(db, current_user)
    return {"message": "Email verificado com sucesso"}


@router.post("/users/resend-verification", response_model=dict)
def resend_verification(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reenviar email de verificação"""
    if current_user.email_verificado:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já está verificado"
        )
    
    success = resend_verification_email(db, current_user)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao enviar email de verificação"
        )
    
    return {"message": "Email de verificação enviado"}


# ============================================================================
# ROTAS DE VINCULAÇÃO GOOGLE
# ============================================================================

@router.post("/users/link-google", response_model=UserPublic)
def link_google(
    google_data: dict,  # Aqui você receberia dados do Google OAuth
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Vincular conta Google ao usuário atual"""
    if current_user.google_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário já possui conta Google vinculada"
        )
    
    google_id = google_data.get("google_id")
    if not google_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google ID é obrigatório"
        )
    
    try:
        updated_user = link_google_account(db, current_user, google_id)
        
        user_data = UserPublic.model_validate(updated_user)
        user_data.has_password = updated_user.has_password
        user_data.has_google = updated_user.google_id is not None
        return user_data
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=str(e)
        )


@router.delete("/users/unlink-google", response_model=UserPublic)
def unlink_google(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Desvincular conta Google do usuário atual"""
    if not current_user.google_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário não possui conta Google vinculada"
        )
    
    if not current_user.can_remove_google:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível desvincular conta Google. Usuário ficaria sem método de autenticação."
        )
    
    try:
        updated_user = unlink_google_account(db, current_user)
        
        user_data = UserPublic.model_validate(updated_user)
        user_data.has_password = updated_user.has_password
        user_data.has_google = updated_user.google_id is not None
        return user_data
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=str(e)
        )


# ============================================================================
# ROTAS DE GERENCIAMENTO DE CONTA
# ============================================================================

@router.post("/users/deactivate", response_model=dict)
def deactivate_account(
    deactivation_data: UserDeactivate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Desativar conta do usuário (soft delete)"""
    if not deactivation_data.confirmacao:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="É necessário confirmar a desativação da conta"
        )
    
    # Se usuário tem senha, verificar senha atual
    if current_user.has_password:
        if not deactivation_data.senha_atual:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Senha atual é obrigatória para desativar a conta"
            )
        
        if not verify_password(deactivation_data.senha_atual, current_user.senha_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Senha atual incorreta"
            )
    
    deactivate_user(db, current_user)
    return {"message": "Conta desativada com sucesso"}


# ============================================================================
# ROTAS ADMINISTRATIVAS (OPCIONAIS)
# ============================================================================

@router.get("/users/stats", response_model=dict)
def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obter estatísticas detalhadas do usuário atual"""
    stats = get_user_stats(db, current_user.id)
    
    if not stats:
        return {
            "total_transacoes": 0,
            "saldo_total": 0.0,
            "total_contas": 0,
            "total_cartoes": 0
        }
    
    return stats


# Rota para listar métodos de autenticação disponíveis
@router.get("/users/auth-methods", response_model=dict)
def get_auth_methods(current_user: User = Depends(get_current_user)):
    """Obter métodos de autenticação disponíveis para o usuário"""
    return {
        "methods": current_user.authentication_methods,
        "has_password": current_user.has_password,
        "has_google": current_user.google_id is not None,
        "can_remove_google": current_user.can_remove_google,
        "provider": current_user.provider
    }