"""add last_saved_date to user_stats for streak tracking

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-29

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("user_stats", sa.Column("last_saved_date", sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column("user_stats", "last_saved_date")
