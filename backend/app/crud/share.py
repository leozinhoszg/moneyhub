from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.share import Share


def list_shares(db: Session, owner_id: int) -> list[Share]:
    stmt = select(Share).where(Share.usuario_principal_id == owner_id)
    return list(db.execute(stmt).scalars().all())


def create_share(db: Session, owner_id: int, shared_user_id: int, permissoes: dict | None = None) -> Share:
    share = Share(
        usuario_principal_id=owner_id,
        usuario_compartilhado_id=shared_user_id,
        status="Pendente",
        permissoes=permissoes or {"ver_gastos": True, "adicionar_gastos": False},
    )
    db.add(share)
    db.commit()
    db.refresh(share)
    return share


def delete_share(db: Session, share: Share) -> None:
    db.delete(share)
    db.commit()


def get_effective_user_ids(db: Session, owner_id: int) -> list[int]:
    # Inclui o owner e quaisquer usuários ativos compartilhados mutuamente (status Ativo) onde owner é principal
    stmt = select(Share.usuario_compartilhado_id).where(
        (Share.usuario_principal_id == owner_id) & (Share.status == "Ativo")
    )
    rows = db.execute(stmt).scalars().all()
    return [owner_id, *rows]


