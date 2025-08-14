from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.user import UserPublic


router = APIRouter()


@router.get("/users/me", response_model=UserPublic)
def read_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return UserPublic.model_validate(current_user)


