from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.crud import bank as crud_bank
from app.schemas.bank import BankPublic, BankList

router = APIRouter()


@router.get("/banks", response_model=BankList)
def list_banks(
    search: str = Query(None, description="Buscar bancos por nome"),
    limit: int = Query(300, description="Limite de bancos retornados"),
    db: Session = Depends(get_db),
):
    """
    Lista todos os bancos ativos ou busca por nome
    """
    if search:
        banks = crud_bank.search_banks(db, search_term=search, limit=limit)
    else:
        banks = crud_bank.list_banks(db, limit=limit)
    
    return BankList(banks=banks)


@router.get("/banks/{code}", response_model=BankPublic)
def get_bank_by_code(
    code: str,
    db: Session = Depends(get_db),
):
    """
    Busca um banco pelo código
    """
    bank = crud_bank.get_bank_by_code(db, code=code)
    if not bank:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Banco não encontrado")
    
    return bank
