from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User


def get_user_by_email(db: Session, email: str) -> User | None:
    stmt = select(User).where(User.email == email)
    return db.execute(stmt).scalar_one_or_none()


def create_user(db: Session, nome: str, email: str, senha: str) -> User:
    user = User(nome=nome, email=email, senha_hash=get_password_hash(senha))
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


