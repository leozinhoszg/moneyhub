from datetime import date
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud.transaction import count_transactions, create_transaction, delete_transaction, list_transactions
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionCreate, TransactionPublic


router = APIRouter()


@router.get("/transactions")
def get_my_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    tipo: str | None = Query(default=None),
    categoria_ids: Annotated[list[int] | None, Query()] = None,
    conta_ids: Annotated[list[int] | None, Query()] = None,
    cartao_ids: Annotated[list[int] | None, Query()] = None,
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    order_by: str = Query(default="data_transacao"),
    order_dir: str = Query(default="desc"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=200),
):
    txs = list_transactions(
        db,
        [current_user.id],
        tipo=tipo,
        categoria_ids=categoria_ids,
        conta_ids=conta_ids,
        cartao_ids=cartao_ids,
        start_date=start_date,
        end_date=end_date,
        order_by=order_by,
        order_dir=order_dir,
        page=page,
        page_size=page_size,
    )
    total = count_transactions(
        db,
        [current_user.id],
        tipo=tipo,
        categoria_ids=categoria_ids,
        conta_ids=conta_ids,
        cartao_ids=cartao_ids,
        start_date=start_date,
        end_date=end_date,
    )
    return {
        "items": [TransactionPublic.model_validate(t) for t in txs],
        "page": page,
        "page_size": page_size,
        "total": total,
    }


@router.post("/transactions", response_model=TransactionPublic, status_code=status.HTTP_201_CREATED)
def create_my_transaction(payload: TransactionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tx = create_transaction(
        db,
        usuario_id=current_user.id,
        tipo=payload.tipo,
        valor=Decimal(payload.valor),
        data_transacao=payload.data_transacao,
        descricao=payload.descricao,
        categoria_id=payload.categoria_id,
        conta_bancaria_id=payload.conta_bancaria_id,
        cartao_credito_id=payload.cartao_credito_id,
    )
    return TransactionPublic.model_validate(tx)


@router.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_transaction(transaction_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tx = db.get(Transaction, transaction_id)
    if not tx or tx.usuario_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transação não encontrada")
    delete_transaction(db, tx)
    return None


