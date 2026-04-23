"""Add profile picture fields to users table

Revision ID: 0010
Revises: 0009
Create Date: 2025-01-16 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0010'
down_revision = '0009'
branch_labels = None
depends_on = None


def upgrade():
    """Add profile picture fields to users table"""
    # Add foto_perfil column
    try:
        op.add_column('usuarios', sa.Column('foto_perfil', sa.String(500), nullable=True))
    except Exception:
        # Column already exists
        pass
    
    # Add google_picture column
    try:
        op.add_column('usuarios', sa.Column('google_picture', sa.String(500), nullable=True))
    except Exception:
        # Column already exists
        pass


def downgrade():
    """Remove profile picture fields from users table"""
    op.drop_column('usuarios', 'google_picture')
    op.drop_column('usuarios', 'foto_perfil')