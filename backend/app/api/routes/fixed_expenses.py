from datetime import date, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud.fixed_expense import (
    create_fixed_expense,
    delete_fixed_expense,
    list_fixed_expenses,
    run_fixed_expenses_for_date,
    update_fixed_expense,
)
from app.models.fixed_expense import FixedExpense
from app.models.user import User


router = APIRouter()
@router.get("/fixed-expenses/upcoming")
def get_upcoming_due(
    days: int = Query(default=7, ge=1, le=60),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Lista gastos com vencimento nos próximos N dias (considerando dia do mês)
    today = date.today()
    end = today + timedelta(days=days)
    items = list_fixed_expenses(db, current_user.id)
    upcoming: list[dict] = []
    for i in items:
        if i.status != "Ativo" or not i.lembrete_ativado:
            continue
        # próximo vencimento calculado por dia_vencimento no mês corrente ou próximo
        due_month = today.month
        due_year = today.year
        if today.day > i.dia_vencimento:
            # próximo mês
            if due_month == 12:
                due_month = 1
                due_year += 1
            else:
                due_month += 1
        try:
            due_date = date(due_year, due_month, i.dia_vencimento)
        except ValueError:
            # ajuste para meses curtos
            from calendar import monthrange

            last_day = monthrange(due_year, due_month)[1]
            due_date = date(due_year, due_month, min(i.dia_vencimento, last_day))
        if today <= due_date <= end:
            upcoming.append(
                {
                    "id": i.id,
                    "descricao": i.descricao,
                    "valor": str(i.valor),
                    "vencimento": due_date.isoformat(),
                }
            )
    return {"items": upcoming}



@router.get("/fixed-expenses")
def get_my_fixed_expenses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = list_fixed_expenses(db, current_user.id)
    return [
        {
            "id": i.id,
            "descricao": i.descricao,
            "valor": str(i.valor),
            "dia_vencimento": i.dia_vencimento,
            "categoria_id": i.categoria_id,
            "conta_bancaria_id": i.conta_bancaria_id,
            "cartao_credito_id": i.cartao_credito_id,
            "status": i.status,
            "lembrete_ativado": i.lembrete_ativado,
            "ultimo_lancamento": (i.ultimo_lancamento.isoformat() if getattr(i, "ultimo_lancamento", None) else None),
        }
        for i in items
    ]


@router.post("/fixed-expenses", status_code=status.HTTP_201_CREATED)
def create_my_fixed_expense(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    fx = create_fixed_expense(
        db,
        usuario_id=current_user.id,
        descricao=payload["descricao"],
        valor=Decimal(str(payload["valor"])),
        dia_vencimento=int(payload["dia_vencimento"]),
        categoria_id=payload.get("categoria_id"),
        conta_bancaria_id=payload.get("conta_bancaria_id"),
        cartao_credito_id=payload.get("cartao_credito_id"),
    )
    return {"id": fx.id}


@router.put("/fixed-expenses/{fx_id}")
def update_my_fixed_expense(fx_id: int, payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    fx = db.get(FixedExpense, fx_id)
    if not fx or fx.usuario_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gasto fixo não encontrado")
    fx = update_fixed_expense(db, fx, **payload)
    return {"id": fx.id}


@router.delete("/fixed-expenses/{fx_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_fixed_expense(fx_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    fx = db.get(FixedExpense, fx_id)
    if not fx or fx.usuario_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gasto fixo não encontrado")
    delete_fixed_expense(db, fx)
    return None


@router.post("/fixed-expenses/run")
def run_today(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    count = run_fixed_expenses_for_date(db, current_user.id, today)
    return {"executados": count}


