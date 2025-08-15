"""add provider and is_verified fields

Revision ID: 0004
Revises: 0003_add_google_oauth_fields
Create Date: 2025-01-27 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0004'
down_revision = '0003_add_google_oauth_fields'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Adicionar coluna provider
    op.add_column('USUARIOS', sa.Column('provider', sa.String(20), nullable=False, server_default='email'))
    
    # Adicionar coluna is_verified
    op.add_column('USUARIOS', sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='0'))


def downgrade() -> None:
    # Remover coluna is_verified
    op.drop_column('USUARIOS', 'is_verified')
    
    # Remover coluna provider
    op.drop_column('USUARIOS', 'provider')
