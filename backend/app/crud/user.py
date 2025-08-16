# app/crud/user.py
from datetime import datetime, timezone
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List

from app.core.security import get_password_hash, verify_password
from app.models.user import User


# ============================================================================
# FUNÇÕES BÁSICAS DE USUÁRIO
# ============================================================================

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Obter usuário por ID"""
    return db.query(User).filter(User.id == user_id, User.is_active == True).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Obter usuário por email"""
    stmt = select(User).where(and_(User.email == email, User.is_active == True))
    return db.execute(stmt).scalar_one_or_none()


def get_user_by_google_id(db: Session, google_id: str) -> Optional[User]:
    """Obter usuário por Google ID"""
    return db.query(User).filter(
        and_(User.google_id == google_id, User.is_active == True)
    ).first()


# ============================================================================
# FUNÇÕES DE CRIAÇÃO DE USUÁRIO
# ============================================================================

def create_user(db: Session, nome: str, sobrenome: str, email: str, senha: str) -> User:
    """Criar usuário com email e senha"""
    # Verificar se email já existe
    existing_user = get_user_by_email(db, email)
    if existing_user:
        raise ValueError("Email já está em uso")

    user = User(
        nome=nome.strip(),
        sobrenome=sobrenome.strip(),
        email=email.lower().strip(),
        senha_hash=get_password_hash(senha),
        provider="email",
        is_verified=False,
        email_verificado=False,
        is_active=True
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def create_google_user(db: Session, nome_completo: str, email: str, google_id: str) -> User:
    """Criar usuário autenticado via Google"""
    # Verificar se Google ID já existe
    existing_google_user = get_user_by_google_id(db, google_id)
    if existing_google_user:
        raise ValueError("Conta Google já está vinculada a outro usuário")
    
    # Verificar se email já existe
    existing_email_user = get_user_by_email(db, email)
    if existing_email_user:
        # Se usuário já existe com esse email, vincular conta Google
        return link_google_account(db, existing_email_user, google_id)
    
    # Separar nome completo em nome e sobrenome
    nome_parts = nome_completo.strip().split(' ', 1)
    nome = nome_parts[0]
    sobrenome = nome_parts[1] if len(nome_parts) > 1 else ""
    
    # Criar novo usuário Google
    user = User(
        nome=nome,
        sobrenome=sobrenome,
        email=email.lower().strip(),
        google_id=google_id,
        provider="google",
        is_verified=True,  # Usuários do Google são automaticamente verificados
        email_verificado=True,  # Email do Google já é verificado
        senha_hash=None,  # Sem senha para usuários Google
        is_active=True
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ============================================================================
# FUNÇÕES DE AUTENTICAÇÃO
# ============================================================================

def authenticate_user(db: Session, email: str, senha: str) -> Optional[User]:
    """Autenticar usuário com email e senha"""
    user = get_user_by_email(db, email)
    if not user:
        return None
    
    if not user.senha_hash:
        return None  # Usuário não tem senha (só OAuth)
    
    if not verify_password(senha, user.senha_hash):
        return None
    
    return user


def authenticate_google_user(db: Session, google_id: str, email: str) -> Optional[User]:
    """Autenticar usuário via Google"""
    # Primeiro tenta encontrar por Google ID
    user = get_user_by_google_id(db, google_id)
    if user:
        return user
    
    # Se não encontrar por Google ID, tenta por email (para vincular contas)
    user = get_user_by_email(db, email)
    if user and not user.google_id:
        # Vincular conta Google ao usuário existente
        return link_google_account(db, user, google_id)
    
    return None


# ============================================================================
# FUNÇÕES DE ATUALIZAÇÃO
# ============================================================================

def update_user(db: Session, user: User, nome: Optional[str] = None, sobrenome: Optional[str] = None, email: Optional[str] = None) -> User:
    """Atualizar dados básicos do usuário"""
    if nome is not None:
        user.nome = nome.strip()
    
    if sobrenome is not None:
        user.sobrenome = sobrenome.strip()
    
    if email is not None:
        email_clean = email.lower().strip()
        if email_clean != user.email:
            # Verificar se o novo email já está em uso
            existing_user = get_user_by_email(db, email_clean)
            if existing_user and existing_user.id != user.id:
                raise ValueError("Este email já está em uso por outro usuário")
            user.email = email_clean
            user.email_verificado = False  # Email alterado precisa ser verificado novamente
    
    user.updated_at = datetime.now(tz=timezone.utc)
    db.commit()
    db.refresh(user)
    return user


def update_last_login(db: Session, user: User) -> None:
    """Atualizar último login do usuário"""
    user.ultimo_login = datetime.now(tz=timezone.utc)
    db.add(user)
    db.commit()


def change_user_password(db: Session, user: User, senha_atual: str, nova_senha: str) -> User:
    """Alterar senha do usuário"""
    # Verificar senha atual
    if not user.senha_hash or not verify_password(senha_atual, user.senha_hash):
        raise ValueError("Senha atual incorreta")
    
    # Atualizar senha
    user.senha_hash = get_password_hash(nova_senha)
    
    # Atualizar provider se necessário
    if user.provider == "google":
        user.provider = "both"
    
    user.updated_at = datetime.now(tz=timezone.utc)
    db.commit()
    db.refresh(user)
    return user


def set_user_password(db: Session, user: User, nova_senha: str) -> User:
    """Definir senha para usuário que não tinha (OAuth)"""
    if user.senha_hash:
        raise ValueError("Usuário já possui senha. Use change_user_password para alterar.")
    
    user.senha_hash = get_password_hash(nova_senha)
    
    # Atualizar provider
    if user.provider == "google":
        user.provider = "both"
    else:
        user.provider = "email"
    
    user.updated_at = datetime.now(tz=timezone.utc)
    db.commit()
    db.refresh(user)
    return user


# ============================================================================
# FUNÇÕES DE VINCULAÇÃO GOOGLE
# ============================================================================

def link_google_account(db: Session, user: User, google_id: str) -> User:
    """Vincular conta Google ao usuário existente"""
    # Verificar se Google ID já está em uso
    existing_google_user = get_user_by_google_id(db, google_id)
    if existing_google_user and existing_google_user.id != user.id:
        raise ValueError("Esta conta Google já está vinculada a outro usuário")
    
    user.google_id = google_id
    user.is_verified = True
    user.email_verificado = True
    
    # Atualizar provider
    if user.senha_hash:
        user.provider = "both"
    else:
        user.provider = "google"
    
    user.updated_at = datetime.now(tz=timezone.utc)
    db.commit()
    db.refresh(user)
    return user


def unlink_google_account(db: Session, user: User) -> User:
    """Desvincular conta Google do usuário"""
    if not user.google_id:
        raise ValueError("Usuário não possui conta Google vinculada")
    
    if not user.senha_hash:
        raise ValueError("Não é possível desvincular conta Google. Usuário ficaria sem método de autenticação.")
    
    user.google_id = None
    user.provider = "email"
    user.updated_at = datetime.now(tz=timezone.utc)
    db.commit()
    db.refresh(user)
    return user


# ============================================================================
# FUNÇÕES DE VERIFICAÇÃO
# ============================================================================

def verify_user_email(db: Session, user: User) -> User:
    """Marcar email do usuário como verificado"""
    user.is_verified = True
    user.email_verificado = True
    user.updated_at = datetime.now(tz=timezone.utc)
    db.commit()
    db.refresh(user)
    return user


def resend_verification_email(db: Session, user: User) -> bool:
    """Marcar que email de verificação foi reenviado"""
    # Aqui você implementaria a lógica de envio de email
    # Por enquanto, apenas atualizamos o timestamp
    user.updated_at = datetime.now(tz=timezone.utc)
    db.commit()
    return True


# ============================================================================
# FUNÇÕES DE STATUS DA CONTA
# ============================================================================

def deactivate_user(db: Session, user: User) -> User:
    """Desativar usuário (soft delete)"""
    user.is_active = False
    user.updated_at = datetime.now(tz=timezone.utc)
    db.commit()
    db.refresh(user)
    return user


def reactivate_user(db: Session, user: User) -> User:
    """Reativar usuário"""
    user.is_active = True
    user.updated_at = datetime.now(tz=timezone.utc)
    db.commit()
    db.refresh(user)
    return user


# ============================================================================
# FUNÇÕES DE CONSULTA E ESTATÍSTICAS
# ============================================================================

def get_user_stats(db: Session, user_id: int) -> Optional[Dict[str, Any]]:
    """Obter estatísticas do usuário"""
    try:
        # Aqui você implementaria as consultas baseadas nos seus modelos
        # Por enquanto, retornando valores padrão
        
        # Exemplo de consultas que você pode implementar:
        # from app.models.transaction import Transaction
        # from app.models.account import BankAccount
        # from app.models.card import CreditCard
        
        # total_transacoes = db.query(func.count(Transaction.id)).filter(
        #     Transaction.usuario_id == user_id
        # ).scalar() or 0
        
        # saldo_total = db.query(func.sum(BankAccount.saldo_atual)).filter(
        #     BankAccount.usuario_id == user_id
        # ).scalar() or 0.0
        
        # total_contas = db.query(func.count(BankAccount.id)).filter(
        #     BankAccount.usuario_id == user_id
        # ).scalar() or 0
        
        # total_cartoes = db.query(func.count(CreditCard.id)).filter(
        #     CreditCard.usuario_id == user_id
        # ).scalar() or 0
        
        return {
            "total_transacoes": 0,
            "saldo_total": 0.0,
            "total_contas": 0,
            "total_cartoes": 0
        }
        
    except Exception as e:
        print(f"Erro ao obter estatísticas do usuário {user_id}: {e}")
        return None


def search_users(db: Session, query: str, skip: int = 0, limit: int = 100) -> List[User]:
    """Buscar usuários por nome ou email"""
    search_filter = f"%{query}%"
    return db.query(User).filter(
        and_(
            User.is_active == True,
            or_(
                User.nome.ilike(search_filter),
                User.email.ilike(search_filter)
            )
        )
    ).offset(skip).limit(limit).all()


def get_users_by_provider(db: Session, provider: str, skip: int = 0, limit: int = 100) -> List[User]:
    """Obter usuários por provedor de autenticação"""
    return db.query(User).filter(
        and_(User.provider == provider, User.is_active == True)
    ).offset(skip).limit(limit).all()


def count_users_by_provider(db: Session) -> Dict[str, int]:
    """Contar usuários por provedor"""
    result = db.query(
        User.provider,
        func.count(User.id).label('count')
    ).filter(User.is_active == True).group_by(User.provider).all()
    
    return {row.provider: row.count for row in result}


def get_recently_registered_users(db: Session, days: int = 30, limit: int = 100) -> List[User]:
    """Obter usuários registrados recentemente"""
    date_threshold = datetime.now(tz=timezone.utc) - timezone.timedelta(days=days)
    return db.query(User).filter(
        and_(
            User.data_cadastro >= date_threshold,
            User.is_active == True
        )
    ).order_by(User.data_cadastro.desc()).limit(limit).all()