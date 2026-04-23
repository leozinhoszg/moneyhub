"""add subcategories table

Revision ID: 0012
Revises: 0011
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0012'
down_revision = '0011'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Criar tabela SUBCATEGORIAS
    op.create_table(
        'SUBCATEGORIAS',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('categoria_id', sa.Integer(), nullable=False),
        sa.Column('usuario_id', sa.Integer(), nullable=True),
        sa.Column('nome', sa.String(length=120), nullable=False),
        sa.Column('cor', sa.String(length=7), nullable=True),
        sa.Column('icone', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['categoria_id'], ['CATEGORIAS.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['usuario_id'], ['usuarios.id'], ondelete='CASCADE'),
    )
    
    # Criar índices
    op.create_index('ix_SUBCATEGORIAS_categoria_id', 'SUBCATEGORIAS', ['categoria_id'])
    op.create_index('ix_SUBCATEGORIAS_usuario_id', 'SUBCATEGORIAS', ['usuario_id'])
    op.create_index('ix_SUBCATEGORIAS_id', 'SUBCATEGORIAS', ['id'])


def downgrade() -> None:
    # Remover índices
    op.drop_index('ix_SUBCATEGORIAS_id', 'SUBCATEGORIAS')
    op.drop_index('ix_SUBCATEGORIAS_usuario_id', 'SUBCATEGORIAS')
    op.drop_index('ix_SUBCATEGORIAS_categoria_id', 'SUBCATEGORIAS')
    
    # Remover tabela
    op.drop_table('SUBCATEGORIAS')






