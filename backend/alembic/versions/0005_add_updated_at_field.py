"""add updated_at field

Revision ID: 0005
Revises: 0004_add_provider_and_is_verified_fields
Create Date: 2025-01-27 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0005'
down_revision = '0004_add_provider_and_is_verified_fields'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Adicionar coluna updated_at
    op.add_column('USUARIOS', sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    # Remover coluna updated_at
    op.drop_column('USUARIOS', 'updated_at')
