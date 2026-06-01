"""add sobrenome column to usuarios

Revision ID: 0014
Revises: 0013
Create Date: 2026-05-31 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0014'
down_revision = '0013'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Adicionar coluna como nullable primeiro para nao quebrar registros existentes
    op.add_column(
        'usuarios',
        sa.Column('sobrenome', sa.String(length=120), nullable=True),
    )

    # Preencher registros existentes com string vazia para permitir NOT NULL
    op.execute("UPDATE usuarios SET sobrenome = '' WHERE sobrenome IS NULL")

    # Tornar a coluna NOT NULL para casar com o modelo
    op.alter_column(
        'usuarios',
        'sobrenome',
        existing_type=sa.String(length=120),
        nullable=False,
    )


def downgrade() -> None:
    op.drop_column('usuarios', 'sobrenome')
