# migration_google_oauth.py
# Execute este script como migração Alembic ou SQL direto

"""
Migração para adicionar campos Google OAuth à tabela de usuários

Revision ID: add_google_oauth_fields
Revises: previous_revision
Create Date: 2025-01-XX XX:XX:XX.XXXXXX
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'add_google_oauth_fields'
down_revision = 'previous_revision'  # Substitua pelo ID da migração anterior
branch_labels = None
depends_on = None

def upgrade():
    """Adicionar campos para Google OAuth"""
    
    # Adicionar coluna google_id
    op.add_column('users', sa.Column('google_id', sa.String(), nullable=True))
    op.create_index('ix_users_google_id', 'users', ['google_id'], unique=True)
    
    # Adicionar coluna provider
    op.add_column('users', sa.Column('provider', sa.String(), nullable=False, server_default='email'))
    
    # Adicionar coluna is_verified
    op.add_column('users', sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'))
    
    # Tornar senha_hash nullable (para usuários do Google)
    op.alter_column('users', 'senha_hash', nullable=True)

def downgrade():
    """Remover campos Google OAuth"""
    
    # Remover colunas adicionadas
    op.drop_index('ix_users_google_id', table_name='users')
    op.drop_column('users', 'google_id')
    op.drop_column('users', 'provider')
    op.drop_column('users', 'is_verified')
    
    # Tornar senha_hash não-nullable novamente
    op.alter_column('users', 'senha_hash', nullable=False)


# SQL alternativo se não estiver usando Alembic:
"""
-- Para PostgreSQL/SQLite
ALTER TABLE users ADD COLUMN google_id VARCHAR UNIQUE;
ALTER TABLE users ADD COLUMN provider VARCHAR DEFAULT 'email' NOT NULL;
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE NOT NULL;

-- Para tornar senha_hash nullable
ALTER TABLE users ALTER COLUMN senha_hash DROP NOT NULL;

-- Criar índice para google_id
CREATE UNIQUE INDEX ix_users_google_id ON users (google_id);
"""