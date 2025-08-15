"""add google oauth fields to users

Revision ID: 0003
Revises: 0002_add_ultimo_lancamento_to_fixed_expenses
Create Date: 2025-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0003'
down_revision = '0002_add_ultimo_lancamento'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Adicionar campo email_verificado (google_id já existe)
    op.add_column('USUARIOS', sa.Column('email_verificado', sa.Boolean(), nullable=False, server_default='0'))
    
    # Tornar senha_hash nullable (para usuários OAuth)
    op.alter_column('USUARIOS', 'senha_hash', nullable=True)
    
    # Criar índice único para google_id se não existir
    try:
        op.create_index(op.f('ix_USUARIOS_google_id'), 'USUARIOS', ['google_id'], unique=True)
    except:
        pass  # Índice já existe


def downgrade() -> None:
    # Remover índices
    op.drop_index(op.f('ix_USUARIOS_google_id'), table_name='USUARIOS')
    
    # Remover colunas
    op.drop_column('USUARIOS', 'email_verificado')
    op.drop_column('USUARIOS', 'google_id')
    
    # Tornar senha_hash not null novamente
    op.alter_column('USUARIOS', 'senha_hash', nullable=False)
