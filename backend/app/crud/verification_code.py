import json
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.models.verification_code import VerificationCode
from app.services.email_service import email_service


def create_verification_code(
    db: Session, 
    email: str, 
    user_data: dict
) -> VerificationCode:
    """Cria um novo código de verificação"""
    # Invalidar códigos anteriores para este email
    db.query(VerificationCode).filter(
        VerificationCode.email == email,
        VerificationCode.used == False
    ).update({"used": True})
    
    # Gerar novo código
    code = email_service.generate_verification_code()
    
    # Criar registro no banco
    db_code = VerificationCode(
        email=email,
        code=code,
        user_data=json.dumps(user_data),
        used=False
    )
    
    db.add(db_code)
    db.commit()
    db.refresh(db_code)
    
    return db_code


def get_verification_code(
    db: Session, 
    email: str, 
    code: str
) -> Optional[VerificationCode]:
    """Busca um código de verificação válido"""
    return db.query(VerificationCode).filter(
        VerificationCode.email == email,
        VerificationCode.code == code,
        VerificationCode.used == False
    ).first()


def use_verification_code(
    db: Session, 
    verification_code: VerificationCode
) -> bool:
    """Marca um código como usado"""
    try:
        verification_code.used = True
        db.commit()
        return True
    except Exception:
        db.rollback()
        return False


def cleanup_expired_codes(db: Session) -> int:
    """Remove códigos expirados (mais de 24 horas)"""
    from datetime import timedelta
    
    cutoff_time = datetime.utcnow() - timedelta(hours=24)
    
    deleted_count = db.query(VerificationCode).filter(
        VerificationCode.created_at < cutoff_time
    ).delete()
    
    db.commit()
    return deleted_count
