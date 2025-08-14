from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud.card import create_card, delete_card, get_card, list_cards, update_card
from app.models.user import User
from app.schemas.card import CardCreate, CardPublic, CardUpdate


router = APIRouter()


@router.get("/cards", response_model=list[CardPublic])
def get_my_cards(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [CardPublic.model_validate(c) for c in list_cards(db, current_user.id)]


@router.post("/cards", response_model=CardPublic, status_code=status.HTTP_201_CREATED)
def create_my_card(payload: CardCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    card = create_card(
        db,
        usuario_id=current_user.id,
        nome_cartao=payload.nome_cartao,
        bandeira=payload.bandeira,
        limite=Decimal(payload.limite),
        dia_fechamento_fatura=payload.dia_fechamento_fatura,
        dia_vencimento_fatura=payload.dia_vencimento_fatura,
    )
    return CardPublic.model_validate(card)


@router.put("/cards/{card_id}", response_model=CardPublic)
def update_my_card(card_id: int, payload: CardUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    card = get_card(db, card_id)
    if not card or card.usuario_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cartão não encontrado")
    card = update_card(
        db,
        card,
        nome_cartao=payload.nome_cartao,
        bandeira=payload.bandeira,
        limite=Decimal(payload.limite) if payload.limite is not None else None,
        dia_fechamento_fatura=payload.dia_fechamento_fatura,
        dia_vencimento_fatura=payload.dia_vencimento_fatura,
    )
    return CardPublic.model_validate(card)


@router.delete("/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_card(card_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    card = get_card(db, card_id)
    if not card or card.usuario_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cartão não encontrado")
    delete_card(db, card)
    return None


