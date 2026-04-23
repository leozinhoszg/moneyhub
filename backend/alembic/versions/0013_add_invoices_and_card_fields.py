"""add invoices table and card extra fields

Revision ID: 0013
Revises: 0012
Create Date: 2026-03-28 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0013'
down_revision = '0012'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Adicionar campos extras na tabela CARTOES_CREDITO
    op.add_column('CARTOES_CREDITO', sa.Column('ultimos_4_digitos', sa.String(length=4), nullable=True))
    op.add_column('CARTOES_CREDITO', sa.Column('cor', sa.String(length=7), nullable=True))

    # Criar tabela FATURAS_CARTAO
    op.create_table(
        'FATURAS_CARTAO',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('usuario_id', sa.Integer(), nullable=False),
        sa.Column('cartao_credito_id', sa.Integer(), nullable=False),
        sa.Column('mes_referencia', sa.Integer(), nullable=False),
        sa.Column('ano_referencia', sa.Integer(), nullable=False),
        sa.Column('valor_total', sa.Numeric(precision=10, scale=2), nullable=False, server_default='0.00'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='aberta'),
        sa.Column('data_fechamento', sa.Date(), nullable=False),
        sa.Column('data_vencimento', sa.Date(), nullable=False),
        sa.Column('data_pagamento', sa.DateTime(timezone=True), nullable=True),
        sa.Column('conta_pagamento_id', sa.Integer(), nullable=True),
        sa.Column('data_criacao', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['usuario_id'], ['usuarios.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['cartao_credito_id'], ['CARTOES_CREDITO.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['conta_pagamento_id'], ['CONTAS_BANCARIAS.id'], ondelete='SET NULL'),
        sa.UniqueConstraint('cartao_credito_id', 'mes_referencia', 'ano_referencia', name='uq_fatura_cartao_mes_ano'),
    )

    # Criar indices
    op.create_index('ix_FATURAS_CARTAO_id', 'FATURAS_CARTAO', ['id'])
    op.create_index('ix_FATURAS_CARTAO_usuario_id', 'FATURAS_CARTAO', ['usuario_id'])
    op.create_index('ix_FATURAS_CARTAO_cartao_credito_id', 'FATURAS_CARTAO', ['cartao_credito_id'])
    op.create_index('ix_FATURAS_CARTAO_mes_ano', 'FATURAS_CARTAO', ['mes_referencia', 'ano_referencia'])


def downgrade() -> None:
    # Remover indices
    op.drop_index('ix_FATURAS_CARTAO_mes_ano', 'FATURAS_CARTAO')
    op.drop_index('ix_FATURAS_CARTAO_cartao_credito_id', 'FATURAS_CARTAO')
    op.drop_index('ix_FATURAS_CARTAO_usuario_id', 'FATURAS_CARTAO')
    op.drop_index('ix_FATURAS_CARTAO_id', 'FATURAS_CARTAO')

    # Remover tabela
    op.drop_table('FATURAS_CARTAO')

    # Remover campos extras do CARTOES_CREDITO
    op.drop_column('CARTOES_CREDITO', 'cor')
    op.drop_column('CARTOES_CREDITO', 'ultimos_4_digitos')
