"""initial schema

Revision ID: 0001_initial
Revises: 
Create Date: 2025-08-14 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # USUARIOS
    op.create_table(
        'USUARIOS',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('nome', sa.String(length=120), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('senha_hash', sa.String(length=255), nullable=False),
        sa.Column('data_cadastro', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('ultimo_login', sa.DateTime(timezone=True), nullable=True),
    )

    # CATEGORIAS
    op.create_table(
        'CATEGORIAS',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('usuario_id', sa.Integer(), sa.ForeignKey('USUARIOS.id', ondelete='CASCADE'), nullable=True),
        sa.Column('nome', sa.String(length=120), nullable=False),
        sa.Column('tipo', sa.Enum('Receita', 'Despesa', name='tipo_categoria'), nullable=False),
        sa.Column('icone', sa.String(length=255), nullable=True),
    )

    # CONTAS_BANCARIAS
    op.create_table(
        'CONTAS_BANCARIAS',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('usuario_id', sa.Integer(), sa.ForeignKey('USUARIOS.id', ondelete='CASCADE'), nullable=False),
        sa.Column('nome_banco', sa.String(length=120), nullable=False),
        sa.Column('tipo_conta', sa.Enum('Corrente', 'Poupança', 'Investimento', name='tipo_conta'), nullable=False),
        sa.Column('saldo_inicial', sa.Numeric(10, 2), nullable=False, server_default='0.00'),
        sa.Column('saldo_atual', sa.Numeric(10, 2), nullable=False, server_default='0.00'),
        sa.Column('data_criacao', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    # CARTOES_CREDITO
    op.create_table(
        'CARTOES_CREDITO',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('usuario_id', sa.Integer(), sa.ForeignKey('USUARIOS.id', ondelete='CASCADE'), nullable=False),
        sa.Column('nome_cartao', sa.String(length=120), nullable=False),
        sa.Column('bandeira', sa.String(length=60), nullable=False),
        sa.Column('limite', sa.Numeric(10, 2), nullable=False, server_default='0.00'),
        sa.Column('dia_fechamento_fatura', sa.Integer(), nullable=False),
        sa.Column('dia_vencimento_fatura', sa.Integer(), nullable=False),
        sa.Column('data_criacao', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    # GASTOS_FIXOS
    op.create_table(
        'GASTOS_FIXOS',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('usuario_id', sa.Integer(), sa.ForeignKey('USUARIOS.id', ondelete='CASCADE'), nullable=False),
        sa.Column('categoria_id', sa.Integer(), sa.ForeignKey('CATEGORIAS.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('descricao', sa.String(length=255), nullable=False),
        sa.Column('valor', sa.Numeric(10, 2), nullable=False),
        sa.Column('conta_bancaria_id', sa.Integer(), sa.ForeignKey('CONTAS_BANCARIAS.id', ondelete='SET NULL'), nullable=True),
        sa.Column('cartao_credito_id', sa.Integer(), sa.ForeignKey('CARTOES_CREDITO.id', ondelete='SET NULL'), nullable=True),
        sa.Column('dia_vencimento', sa.Integer(), nullable=False),
        sa.Column('data_inicio', sa.Date(), nullable=False),
        sa.Column('data_fim', sa.Date(), nullable=True),
        sa.Column('status', sa.Enum('Ativo', 'Inativo', name='status_gasto_fixo'), server_default='Ativo'),
        sa.Column('lembrete_ativado', sa.Boolean(), server_default=sa.text('1')),
    )

    # TRANSACOES
    op.create_table(
        'TRANSACOES',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('usuario_id', sa.Integer(), sa.ForeignKey('USUARIOS.id', ondelete='CASCADE'), nullable=False),
        sa.Column('categoria_id', sa.Integer(), sa.ForeignKey('CATEGORIAS.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('conta_bancaria_id', sa.Integer(), sa.ForeignKey('CONTAS_BANCARIAS.id', ondelete='SET NULL'), nullable=True),
        sa.Column('cartao_credito_id', sa.Integer(), sa.ForeignKey('CARTOES_CREDITO.id', ondelete='SET NULL'), nullable=True),
        sa.Column('tipo', sa.Enum('Receita', 'Despesa', name='tipo_transacao'), nullable=False),
        sa.Column('valor', sa.Numeric(10, 2), nullable=False),
        sa.Column('descricao', sa.Text(), nullable=True),
        sa.Column('data_transacao', sa.DateTime(timezone=True), nullable=False),
        sa.Column('eh_gasto_fixo', sa.Boolean(), server_default=sa.text('0')),
        sa.Column('gasto_fixo_id', sa.Integer(), sa.ForeignKey('GASTOS_FIXOS.id', ondelete='SET NULL'), nullable=True),
        sa.Column('data_criacao', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    # DOCUMENTOS
    op.create_table(
        'DOCUMENTOS',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('usuario_id', sa.Integer(), sa.ForeignKey('USUARIOS.id', ondelete='CASCADE'), nullable=False),
        sa.Column('transacao_id', sa.Integer(), sa.ForeignKey('TRANSACOES.id', ondelete='SET NULL'), nullable=True),
        sa.Column('nome_arquivo', sa.String(length=255), nullable=False),
        sa.Column('caminho_arquivo', sa.String(length=255), nullable=False),
        sa.Column('tipo_documento', sa.Enum('Comprovante', 'Extrato', 'Contracheque', 'Outro', name='tipo_documento'), nullable=False),
        sa.Column('data_upload', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
    )

    # COMPARTILHAMENTOS
    op.create_table(
        'COMPARTILHAMENTOS',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('usuario_principal_id', sa.Integer(), sa.ForeignKey('USUARIOS.id', ondelete='CASCADE'), nullable=False),
        sa.Column('usuario_compartilhado_id', sa.Integer(), sa.ForeignKey('USUARIOS.id', ondelete='CASCADE'), nullable=False),
        sa.Column('data_inicio', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('data_fim', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.Enum('Ativo', 'Inativo', 'Pendente', name='status_compart'), server_default='Pendente'),
        sa.Column('permissoes', sa.JSON(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('COMPARTILHAMENTOS')
    op.drop_table('DOCUMENTOS')
    op.drop_table('TRANSACOES')
    op.drop_table('GASTOS_FIXOS')
    op.drop_table('CARTOES_CREDITO')
    op.drop_table('CONTAS_BANCARIAS')
    op.drop_table('CATEGORIAS')
    op.drop_table('USUARIOS')


