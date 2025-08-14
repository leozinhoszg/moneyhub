from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud.share import create_share, delete_share, list_shares
from app.models.share import Share
from app.models.user import User


router = APIRouter()


@router.get("/shares")
def get_shares(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = list_shares(db, current_user.id)
    return [
        {
            "id": s.id,
            "usuario_principal_id": s.usuario_principal_id,
            "usuario_compartilhado_id": s.usuario_compartilhado_id,
            "status": s.status,
            "permissoes": s.permissoes,
        }
        for s in items
    ]


@router.post("/shares", status_code=status.HTTP_201_CREATED)
def create_share_endpoint(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    share = create_share(db, current_user.id, payload["usuario_compartilhado_id"], payload.get("permissoes"))
    return {"id": share.id}


@router.delete("/shares/{share_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_share_endpoint(share_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    share = db.get(Share, share_id)
    if not share or share.usuario_principal_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Compartilhamento não encontrado")
    delete_share(db, share)
    return None


