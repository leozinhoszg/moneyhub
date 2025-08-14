import asyncio
from io import BytesIO

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import csrf_protect, get_current_user, get_db
from app.models.user import User


router = APIRouter()


async def fake_ocr_extract(content: bytes) -> dict:
    # MVP: simula OCR/extração com delay
    await asyncio.sleep(0.5)
    text = content[:64].decode(errors="ignore")
    return {"text_preview": text}


@router.post("/uploads/receipt", dependencies=[])  # CSRF opcional aqui, frontend pode enviar header
async def upload_receipt(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.content_type or not file.content_type.startswith(("image/", "application/pdf")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Arquivo inválido")
    content = await file.read()
    result = await fake_ocr_extract(content)
    # Em produção: salvar arquivo (S3), enfileirar tarefa real de OCR/extração
    return {"filename": file.filename, "meta": result}


