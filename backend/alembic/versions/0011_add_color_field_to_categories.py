"""add color field to categories

Revision ID: 0011
Revises: 0010
Create Date: 2025-01-07 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0011'
down_revision = '0010'
branch_labels = None
depends_on = None


def upgrade():
    # Add color column to CATEGORIAS table
    op.add_column('CATEGORIAS', sa.Column('cor', sa.String(7), nullable=True))


def downgrade():
    # Remove color column from CATEGORIAS table
    op.drop_column('CATEGORIAS', 'cor')

