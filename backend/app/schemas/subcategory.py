from pydantic import BaseModel, Field


class SubcategoryBase(BaseModel):
    categoria_id: int
    nome: str = Field(min_length=1, max_length=120)
    cor: str | None = None
    icone: str | None = None


class SubcategoryCreate(SubcategoryBase):
    pass


class SubcategoryUpdate(BaseModel):
    nome: str | None = None
    cor: str | None = None
    icone: str | None = None


class SubcategoryPublic(BaseModel):
    id: int
    categoria_id: int
    nome: str
    cor: str | None = None
    icone: str | None = None

    class Config:
        from_attributes = True






