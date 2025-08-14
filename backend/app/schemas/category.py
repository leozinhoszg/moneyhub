from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    nome: str = Field(min_length=1, max_length=120)
    tipo: str


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    nome: str | None = None
    tipo: str | None = None


class CategoryPublic(BaseModel):
    id: int
    nome: str
    tipo: str

    class Config:
        from_attributes = True


