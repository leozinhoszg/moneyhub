from datetime import datetime
from sqlalchemy.orm import Session
from typing import Optional

from app.models.password_reset_token import PasswordResetToken
from app.models.user import User


class PasswordResetTokenCRUD:
    def create_reset_token(
        self, 
        db: Session, 
        email: str, 
        token: str, 
        user_id: Optional[int] = None
    ) -> PasswordResetToken:
        """Cria um novo token de reset de senha"""
        db_token = PasswordResetToken(
            email=email,
            token=token,
            user_id=user_id,
            used=False
        )
        db.add(db_token)
        db.commit()
        db.refresh(db_token)
        return db_token
    
    def get_valid_token(self, db: Session, token: str) -> Optional[PasswordResetToken]:
        """Busca um token válido (não usado e não expirado)"""
        return db.query(PasswordResetToken).filter(
            PasswordResetToken.token == token,
            PasswordResetToken.used == False
        ).first()
    
    def get_token_by_email(self, db: Session, email: str) -> Optional[PasswordResetToken]:
        """Busca o token mais recente por email"""
        return db.query(PasswordResetToken).filter(
            PasswordResetToken.email == email,
            PasswordResetToken.used == False
        ).order_by(PasswordResetToken.created_at.desc()).first()
    
    def mark_token_as_used(self, db: Session, token: str) -> bool:
        """Marca um token como usado"""
        db_token = db.query(PasswordResetToken).filter(
            PasswordResetToken.token == token
        ).first()
        
        if db_token:
            db_token.used = True
            db.commit()
            return True
        return False
    
    def delete_expired_tokens(self, db: Session, expiry_minutes: int = 15) -> int:
        """Remove tokens expirados"""
        from datetime import timedelta
        expiry_time = datetime.now() - timedelta(minutes=expiry_minutes)
        
        expired_tokens = db.query(PasswordResetToken).filter(
            PasswordResetToken.created_at < expiry_time
        )
        count = expired_tokens.count()
        expired_tokens.delete()
        db.commit()
        return count
    
    def invalidate_user_tokens(self, db: Session, email: str) -> int:
        """Invalida todos os tokens de um usuário"""
        tokens = db.query(PasswordResetToken).filter(
            PasswordResetToken.email == email,
            PasswordResetToken.used == False
        )
        count = tokens.count()
        tokens.update({"used": True})
        db.commit()
        return count


# Instância global do CRUD
password_reset_token_crud = PasswordResetTokenCRUD()
