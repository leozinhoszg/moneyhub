"""add ultimo_lancamento to GASTOS_FIXOS

Revision ID: 0002_add_ultimo_lancamento
Revises: 0001_initial
Create Date: 2025-08-14 01:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0002_add_ultimo_lancamento'
down_revision = '0001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'GASTOS_FIXOS',
        sa.Column('ultimo_lancamento', sa.Date(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('GASTOS_FIXOS', 'ultimo_lancamento')




