from pydantic import BaseModel


class BankPublic(BaseModel):
    id: int
    COD: str | None = None
    LongName: str | None = None
    logotipo: str | None = None
    
    model_config = {
        "from_attributes": True,
        "str_strip_whitespace": True,
        "validate_assignment": True
    }


class BankList(BaseModel):
    banks: list[BankPublic]

