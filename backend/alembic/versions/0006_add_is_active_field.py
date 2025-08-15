"""add is_active field

Revision ID: 0006
Revises: 0005_add_updated_at_field
Create Date: 2025-01-27 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0006'
down_revision = '0005_add_updated_at_field'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Adicionar coluna is_active
    op.add_column('USUARIOS', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'))


def downgrade() -> None:
    # Remover coluna is_active
    op.drop_column('USUARIOS', 'is_active')
