from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.crud.subcategory import create_subcategory, delete_subcategory, get_subcategory, list_subcategories, update_subcategory
from app.crud.category import get_category
from app.models.user import User
from app.schemas.subcategory import SubcategoryCreate, SubcategoryPublic, SubcategoryUpdate


router = APIRouter()


@router.get("/categories/{category_id}/subcategories", response_model=list[SubcategoryPublic])
def get_subcategories_by_category(
    category_id: int,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Verificar se a categoria existe e o usuário tem acesso
    category = get_category(db, category_id)
    if not category or (category.usuario_id is not None and category.usuario_id != current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria não encontrada")
    
    subcats = list_subcategories(db, categoria_id=category_id, usuario_id=current_user.id)
    return [SubcategoryPublic.model_validate(s) for s in subcats]


@router.post("/categories/{category_id}/subcategories", response_model=SubcategoryPublic, status_code=status.HTTP_201_CREATED)
def create_subcategory_for_category(
    category_id: int,
    payload: SubcategoryCreate,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Verificar se a categoria existe e o usuário tem acesso
    category = get_category(db, category_id)
    if not category or (category.usuario_id is not None and category.usuario_id != current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria não encontrada")
    
    # Criar subcategoria
    subcat = create_subcategory(
        db, 
        categoria_id=category_id,
        usuario_id=current_user.id, 
        nome=payload.nome,
        cor=payload.cor,
        icone=payload.icone
    )
    return SubcategoryPublic.model_validate(subcat)


@router.put("/subcategories/{subcategory_id}", response_model=SubcategoryPublic)
def update_subcategory_endpoint(
    subcategory_id: int, 
    payload: SubcategoryUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    subcat = get_subcategory(db, subcategory_id)
    if not subcat or (subcat.usuario_id is not None and subcat.usuario_id != current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subcategoria não encontrada")
    
    subcat = update_subcategory(
        db, 
        subcat, 
        nome=payload.nome, 
        cor=payload.cor,
        icone=payload.icone
    )
    return SubcategoryPublic.model_validate(subcat)


@router.delete("/subcategories/{subcategory_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subcategory_endpoint(
    subcategory_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    subcat = get_subcategory(db, subcategory_id)
    if not subcat or (subcat.usuario_id is not None and subcat.usuario_id != current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subcategoria não encontrada")
    
    delete_subcategory(db, subcat)
    return None






