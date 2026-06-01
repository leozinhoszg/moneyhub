"""set default current_timestamp for verification_codes.created_at

Revision ID: 0015
Revises: 0014
Create Date: 2026-05-31 00:10:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0015'
down_revision = '0014'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        'verification_codes',
        'created_at',
        existing_type=sa.DateTime(),
        server_default=sa.text('CURRENT_TIMESTAMP'),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        'verification_codes',
        'created_at',
        existing_type=sa.DateTime(),
        server_default=None,
        existing_nullable=False,
    )
