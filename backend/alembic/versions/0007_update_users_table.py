# backend/alembic/versions/0007_update_users_table.py
"""Update users table to match DDL

Revision ID: 0007_update_users_table
Revises: 0006_add_is_active
Create Date: 2025-08-15 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '0007_update_users_table'
down_revision = '0006_add_is_active'  # Substitua pelo último revision ID
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Atualizar tabela de usuários para corresponder à DDL fornecida"""
    
    # Renomear tabela se necessário (de USUARIOS para usuarios)
    # Nota: Esta operação pode ser perigosa em produção
    try:
        op.execute("RENAME TABLE USUARIOS TO usuarios")
    except Exception:
        # Se a tabela já se chama 'usuarios', a operação falhará
        # Isso é esperado se a tabela já tiver o nome correto
        pass
    
    # Verificar e ajustar colunas existentes
    
    # 1. Verificar se coluna google_id tem índice unique
    try:
        op.create_index('ix_usuarios_google_id', 'usuarios', ['google_id'], unique=True)
    except Exception:
        # Índice já existe
        pass
    
    # 2. Garantir que senha_hash pode ser NULL
    op.alter_column('usuarios', 'senha_hash',
                   existing_type=sa.String(255),
                   nullable=True)
    
    # 3. Adicionar campos que podem estar faltando
    
    # Campo google_id (se não existir)
    try:
        op.add_column('usuarios', sa.Column('google_id', sa.String(255), nullable=True))
        op.create_index('ix_usuarios_google_id', 'usuarios', ['google_id'], unique=True)
    except Exception:
        # Coluna já existe
        pass
    
    # Campo email_verificado (se não existir)
    try:
        op.add_column('usuarios', sa.Column('email_verificado', sa.Boolean(), nullable=False, server_default='0'))
    except Exception:
        # Coluna já existe
        pass
    
    # Campo provider (se não existir)
    try:
        op.add_column('usuarios', sa.Column('provider', sa.String(20), nullable=False, server_default='email'))
    except Exception:
        # Coluna já existe
        pass
    
    # Campo is_verified (se não existir)
    try:
        op.add_column('usuarios', sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='0'))
    except Exception:
        # Coluna já existe
        pass
    
    # Campo updated_at (se não existir)
    try:
        op.add_column('usuarios', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))
    except Exception:
        # Coluna já existe
        pass
    
    # Campo is_active (se não existir)
    try:
        op.add_column('usuarios', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'))
    except Exception:
        # Coluna já existe
        pass
    
    # 4. Atualizar registros existentes para garantir consistência
    
    # Atualizar provider para usuários que não têm
    op.execute("""
        UPDATE usuarios 
        SET provider = CASE 
            WHEN google_id IS NOT NULL AND senha_hash IS NOT NULL THEN 'both'
            WHEN google_id IS NOT NULL THEN 'google'
            ELSE 'email'
        END
        WHERE provider IS NULL OR provider = ''
    """)
    
    # Atualizar is_verified para usuários Google
    op.execute("""
        UPDATE usuarios 
        SET is_verified = 1, email_verificado = 1
        WHERE google_id IS NOT NULL AND is_verified = 0
    """)
    
    # Garantir que usuários ativos são marcados como tal
    op.execute("""
        UPDATE usuarios 
        SET is_active = 1
        WHERE is_active IS NULL
    """)


def downgrade() -> None:
    """Reverter alterações (use com cuidado!)"""
    
    # Remover campos adicionados (CUIDADO: isso apaga dados!)
    # Descomente apenas se necessário e você tem certeza
    
    # op.drop_column('usuarios', 'is_active')
    # op.drop_column('usuarios', 'updated_at')
    # op.drop_column('usuarios', 'is_verified')
    # op.drop_column('usuarios', 'provider')
    # op.drop_column('usuarios', 'email_verificado')
    # op.drop_index('ix_usuarios_google_id', 'usuarios')
    # op.drop_column('usuarios', 'google_id')
    
    # Reverter senha_hash para NOT NULL (PERIGOSO!)
    # op.alter_column('usuarios', 'senha_hash',
    #                existing_type=sa.String(255),
    #                nullable=False)
    
    pass  # Por segurança, não fazemos downgrade automático


# Script SQL alternativo para execução manual
"""
-- Execute este SQL manualmente se preferir não usar Alembic

-- 1. Verificar estrutura atual da tabela
DESCRIBE usuarios;

-- 2. Adicionar colunas que podem estar faltando
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) NULL UNIQUE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email_verificado TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS provider VARCHAR(20) NOT NULL DEFAULT 'email';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS is_verified TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1;

-- 3. Adicionar índices
CREATE UNIQUE INDEX IF NOT EXISTS ix_usuarios_google_id ON usuarios (google_id);

-- 4. Atualizar dados existentes
UPDATE usuarios 
SET provider = CASE 
    WHEN google_id IS NOT NULL AND senha_hash IS NOT NULL THEN 'both'
    WHEN google_id IS NOT NULL THEN 'google'
    ELSE 'email'
END
WHERE provider = 'email' OR provider = '';

UPDATE usuarios 
SET is_verified = 1, email_verificado = 1
WHERE google_id IS NOT NULL;

UPDATE usuarios 
SET is_active = 1
WHERE is_active IS NULL OR is_active = 0;

-- 5. Verificar resultado
SELECT id, nome, email, provider, is_verified, email_verificado, is_active
FROM usuarios 
LIMIT 10;
"""