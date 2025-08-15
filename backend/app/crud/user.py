from datetime import datetime, timezone

from sqlalchemy import select, func
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from app.core.security import get_password_hash, verify_password
from app.models.user import User


def get_user_by_email(db: Session, email: str) -> User | None:
    stmt = select(User).where(User.email == email)
    return db.execute(stmt).scalar_one_or_none()


def create_user(db: Session, nome: str, email: str, senha: str) -> User:
    user = User(
        nome=nome, 
        email=email, 
        senha_hash=get_password_hash(senha),
        provider="email",
        is_verified=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, senha: str) -> User | None:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(senha, user.senha_hash):
        return None
    return user


def update_last_login(db: Session, user: User) -> None:
    user.ultimo_login = datetime.now(tz=timezone.utc)
    db.add(user)
    db.commit()


def create_google_user(
    db: Session, 
    nome: str, 
    email: str, 
    google_id: str
) -> User:
    """Cria um novo usuário autenticado via Google"""
    db_user = User(
        nome=nome,
        email=email,
        google_id=google_id,
        provider="google",
        is_verified=True,  # Usuários do Google são automaticamente verificados
        email_verificado=True,  # Usuários do Google já têm email verificado
        senha_hash=None   # Não há senha para usuários do Google
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_google_id(db: Session, google_id: str) -> Optional[User]:
    """Busca usuário pelo Google ID"""
    return db.query(User).filter(User.google_id == google_id).first()


def update_user_google_info(
    db: Session, 
    user: User, 
    google_id: str = None,
    nome: str = None
) -> User:
    """Atualiza informações do Google de um usuário existente"""
    if google_id:
        user.google_id = google_id
        if not user.provider or user.provider == "email":
            user.provider = "google"
    
    if nome and nome != user.nome:
        user.nome = nome
    
    db.commit()
    db.refresh(user)
    return user


def link_google_account(
    db: Session, 
    user: User, 
    google_id: str
) -> User:
    """Vincula uma conta Google a um usuário existente"""
    user.google_id = google_id
    user.provider = "both"  # Indica que o usuário pode usar ambos os métodos
    user.is_verified = True
    user.email_verificado = True  # Marca email como verificado
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, user_data: Dict[str, Any]) -> User:
    """Atualizar dados do usuário"""
    for field, value in user_data.items():
        if hasattr(user, field) and value is not None:
            setattr(user, field, value)
    
    user.updated_at = datetime.now(tz=timezone.utc)
    db.commit()
    db.refresh(user)
    return user


def change_user_password(db: Session, user: User, new_password: str) -> User:
    """Alterar senha do usuário"""
    user.senha_hash = get_password_hash(new_password)
    user.updated_at = datetime.now(tz=timezone.utc)
    db.commit()
    db.refresh(user)
    return user


def unlink_google_account(db: Session, user: User) -> User:
    """Desvincular conta Google do usuário"""
    user.google_id = None
    
    # Ajustar provider baseado no que sobrou
    if user.senha_hash:
        user.provider = "email"
    else:
        # Isso não deveria acontecer devido à validação na rota
        raise ValueError("Usuário ficaria sem método de autenticação")
    
    user.updated_at = datetime.now(tz=timezone.utc)
    db.commit()
    db.refresh(user)
    return user


def get_user_stats(db: Session, user_id: int) -> Optional[Dict[str, Any]]:
    """Obter estatísticas do usuário"""
    # Esta função depende dos seus modelos de transação/conta
    # Adapte conforme sua estrutura de dados
    
    try:
        # Exemplo assumindo que você tem modelos de Transacao e Conta
        # from app.models.transacao import Transacao
        # from app.models.conta import Conta
        
        # total_transacoes = db.query(func.count(Transacao.id)).filter(
        #     Transacao.user_id == user_id
        # ).scalar()
        
        # saldo_total = db.query(func.sum(Conta.saldo)).filter(
        #     Conta.user_id == user_id
        # ).scalar() or 0.0
        
        # Por enquanto, retornar valores padrão
        return {
            "total_transacoes": 0,
            "saldo_total": 0.0
        }
        
    except Exception:
        # Em caso de erro, retornar None
        return None


def verify_user_email(db: Session, user: User) -> User:
    """Marcar email do usuário como verificado"""
    user.is_verified = True
    user.email_verificado = True
    user.updated_at = datetime.now(tz=timezone.utc)
    db.commit()
    db.refresh(user)
    return user


def get_users_by_provider(db: Session, provider: str, skip: int = 0, limit: int = 100):
    """Obter usuários por provedor de autenticação"""
    return db.query(User).filter(User.provider == provider).offset(skip).limit(limit).all()


def count_users_by_provider(db: Session) -> Dict[str, int]:
    """Contar usuários por provedor"""
    result = db.query(
        User.provider,
        func.count(User.id).label('count')
    ).group_by(User.provider).all()
    
    return {row.provider: row.count for row in result}


def search_users(db: Session, query: str, skip: int = 0, limit: int = 100):
    """Buscar usuários por nome ou email"""
    search_filter = f"%{query}%"
    return db.query(User).filter(
        (User.nome.ilike(search_filter)) | (User.email.ilike(search_filter))
    ).offset(skip).limit(limit).all()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Obter usuário por ID"""
    return db.query(User).filter(User.id == user_id).first()


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


