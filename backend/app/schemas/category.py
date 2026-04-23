from pydantic import BaseModel, Field
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .subcategory import SubcategoryPublic


class CategoryBase(BaseModel):
    nome: str = Field(min_length=1, max_length=120)
    tipo: str
    cor: str | None = None
    icone: str | None = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    nome: str | None = None
    tipo: str | None = None
    cor: str | None = None
    icone: str | None = None


class CategoryPublic(BaseModel):
    id: int
    nome: str
    tipo: str
    cor: str | None = None
    icone: str | None = None
    subcategorias: List["SubcategoryPublic"] = []

    class Config:
        from_attributes = True


# Resolver forward reference
from .subcategory import SubcategoryPublic
CategoryPublic.model_rebuild()

