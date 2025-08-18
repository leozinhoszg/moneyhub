# app/utils/file_upload.py
import os
import uuid
from typing import Optional, Tuple
from PIL import Image
from fastapi import UploadFile, HTTPException
import aiofiles
from pathlib import Path

# Configurações de upload
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
PROFILE_IMAGE_SIZE = (300, 300)  # Tamanho padrão para fotos de perfil
UPLOAD_DIR = Path("uploads")
PROFILE_DIR = UPLOAD_DIR / "profile"

# Criar diretórios se não existirem
UPLOAD_DIR.mkdir(exist_ok=True)
PROFILE_DIR.mkdir(exist_ok=True)


def validate_image_file(file: UploadFile) -> None:
    """Valida se o arquivo é uma imagem válida"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Nome do arquivo é obrigatório")
    
    # Verificar extensão
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Tipo de arquivo não permitido. Use: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Verificar tamanho do arquivo
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400, 
            detail=f"Arquivo muito grande. Tamanho máximo: {MAX_FILE_SIZE // (1024*1024)}MB"
        )


def generate_unique_filename(original_filename: str) -> str:
    """Gera um nome único para o arquivo"""
    file_ext = Path(original_filename).suffix.lower()
    unique_id = str(uuid.uuid4())
    return f"{unique_id}{file_ext}"


async def resize_image(image_path: Path, size: Tuple[int, int]) -> None:
    """Redimensiona uma imagem mantendo a proporção"""
    try:
        with Image.open(image_path) as img:
            # Converter para RGB se necessário (para PNG com transparência)
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Redimensionar mantendo proporção
            img.thumbnail(size, Image.Resampling.LANCZOS)
            
            # Criar uma nova imagem com o tamanho exato (centralizada)
            new_img = Image.new('RGB', size, (255, 255, 255))
            paste_x = (size[0] - img.width) // 2
            paste_y = (size[1] - img.height) // 2
            new_img.paste(img, (paste_x, paste_y))
            
            # Salvar com qualidade otimizada
            new_img.save(image_path, 'JPEG', quality=85, optimize=True)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar imagem: {str(e)}")


async def save_profile_image(file: UploadFile, user_id: int) -> str:
    """Salva uma imagem de perfil e retorna o caminho relativo"""
    # Validar arquivo
    validate_image_file(file)
    
    # Gerar nome único
    filename = generate_unique_filename(file.filename)
    file_path = PROFILE_DIR / filename
    
    try:
        # Salvar arquivo temporariamente
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Redimensionar imagem
        await resize_image(file_path, PROFILE_IMAGE_SIZE)
        
        # Retornar caminho relativo para armazenar no banco
        return f"uploads/profile/{filename}"
        
    except Exception as e:
        # Limpar arquivo em caso de erro
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Erro ao salvar imagem: {str(e)}")


async def delete_profile_image(image_path: str) -> None:
    """Remove uma imagem de perfil do sistema de arquivos"""
    try:
        if image_path and not image_path.startswith('http'):
            full_path = Path(image_path)
            if full_path.exists():
                full_path.unlink()
    except Exception as e:
        # Log do erro, mas não falha a operação
        print(f"Erro ao deletar imagem {image_path}: {e}")


def get_profile_image_url(image_path: Optional[str], base_url: str) -> Optional[str]:
    """Converte caminho da imagem para URL completa"""
    if not image_path:
        return None
    
    # Se já é uma URL (Google, etc.), retornar como está
    if image_path.startswith('http'):
        return image_path
    
    # Construir URL completa
    return f"{base_url.rstrip('/')}/{image_path}"


def get_default_avatar_url(name: str, base_url: str) -> str:
    """Gera URL para avatar padrão baseado no nome"""
    # Usar serviço de avatar padrão (UI Avatars)
    initials = ''.join([word[0].upper() for word in name.split()[:2]])
    return f"https://ui-avatars.com/api/?name={initials}&size=300&background=3B82F6&color=ffffff"