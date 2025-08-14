from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud.category import create_category, delete_category, get_category, list_categories, update_category
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryPublic, CategoryUpdate


router = APIRouter()


@router.get("/categories", response_model=list[CategoryPublic])
def get_my_categories(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cats = list_categories(db, current_user.id)
    return [CategoryPublic.model_validate(c) for c in cats]


@router.post("/categories", response_model=CategoryPublic, status_code=status.HTTP_201_CREATED)
def create_my_category(payload: CategoryCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cat = create_category(db, usuario_id=current_user.id, nome=payload.nome, tipo=payload.tipo)
    return CategoryPublic.model_validate(cat)


@router.put("/categories/{category_id}", response_model=CategoryPublic)
def update_my_category(category_id: int, payload: CategoryUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cat = get_category(db, category_id)
    if not cat or (cat.usuario_id is not None and cat.usuario_id != current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria não encontrada")
    cat = update_category(db, cat, nome=payload.nome, tipo=payload.tipo)
    return CategoryPublic.model_validate(cat)


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_category(category_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cat = get_category(db, category_id)
    if not cat or (cat.usuario_id is not None and cat.usuario_id != current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria não encontrada")
    delete_category(db, cat)
    return None


