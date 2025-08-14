from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud.account import create_account, delete_account, get_account, list_accounts, update_account
from app.models.user import User
from app.schemas.account import AccountCreate, AccountPublic, AccountUpdate


router = APIRouter()


@router.get("/accounts", response_model=list[AccountPublic])
def get_my_accounts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [AccountPublic.model_validate(a) for a in list_accounts(db, current_user.id)]


@router.post("/accounts", response_model=AccountPublic, status_code=status.HTTP_201_CREATED)
def create_my_account(payload: AccountCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    acc = create_account(
        db,
        usuario_id=current_user.id,
        nome_banco=payload.nome_banco,
        tipo_conta=payload.tipo_conta,
        saldo_inicial=Decimal(payload.saldo_inicial),
    )
    return AccountPublic.model_validate(acc)


@router.put("/accounts/{account_id}", response_model=AccountPublic)
def update_my_account(account_id: int, payload: AccountUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    acc = get_account(db, account_id)
    if not acc or acc.usuario_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conta não encontrada")
    acc = update_account(db, acc, nome_banco=payload.nome_banco, tipo_conta=payload.tipo_conta)
    return AccountPublic.model_validate(acc)


@router.delete("/accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_account(account_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    acc = get_account(db, account_id)
    if not acc or acc.usuario_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conta não encontrada")
    delete_account(db, acc)
    return None


