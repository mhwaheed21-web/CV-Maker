"""create cv chat messages table

Revision ID: a1b2c3d4e5f6
Revises: e4573545ff79
Create Date: 2026-04-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'e4573545ff79'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'cv_chat_messages',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('cv_id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['cv_id'], ['generated_cvs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_cv_chat_messages_cv_id'), 'cv_chat_messages', ['cv_id'], unique=False)
    op.create_index(op.f('ix_cv_chat_messages_user_id'), 'cv_chat_messages', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_cv_chat_messages_user_id'), table_name='cv_chat_messages')
    op.drop_index(op.f('ix_cv_chat_messages_cv_id'), table_name='cv_chat_messages')
    op.drop_table('cv_chat_messages')
