"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-06-29

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _timestamps() -> list[sa.Column]:
    return [
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    ]


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')
    op.execute('CREATE EXTENSION IF NOT EXISTS "pg_trgm"')

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("auth_provider", sa.String, nullable=True),
        sa.Column("auth_subject", sa.String, nullable=True),
        sa.Column("is_guest", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("email", sa.String, nullable=True),
        sa.Column("phone", sa.String, nullable=True),
        sa.Column("name", sa.String, nullable=True),
        sa.Column("city", sa.String, nullable=True),
        sa.Column("state", sa.String, nullable=True),
        sa.Column("language", sa.String, nullable=False, server_default="en"),
        sa.Column("interests", postgresql.ARRAY(sa.Text), nullable=True),
        *_timestamps(),
    )
    op.create_index("ix_users_auth_subject", "users", ["auth_subject"])

    op.create_table(
        "user_settings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), unique=True),
        sa.Column("notifications_enabled", sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column("theme", sa.String, nullable=False, server_default="system"),
        *_timestamps(),
    )

    op.create_table(
        "user_stats",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), unique=True),
        sa.Column("total_amount_not_spent_paise", sa.Integer, nullable=False, server_default="0"),
        sa.Column("cravings_completed", sa.Integer, nullable=False, server_default="0"),
        sa.Column("goals_completed", sa.Integer, nullable=False, server_default="0"),
        sa.Column("current_streak_days", sa.Integer, nullable=False, server_default="0"),
        sa.Column("longest_streak_days", sa.Integer, nullable=False, server_default="0"),
        sa.Column("categories_explored", postgresql.ARRAY(sa.Text), nullable=True),
        *_timestamps(),
    )

    op.create_table(
        "categories",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("slug", sa.String, nullable=False, unique=True),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("icon_key", sa.String, nullable=True),
        sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("parent_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("categories.id"), nullable=True),
        *_timestamps(),
    )

    op.create_table(
        "brands",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("categories.id"), nullable=False),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("slug", sa.String, nullable=False, unique=True),
        sa.Column("tagline", sa.String, nullable=True),
        sa.Column("logo_asset_key", sa.String, nullable=True),
        sa.Column("primary_color", sa.String, nullable=True),
        sa.Column("secondary_color", sa.String, nullable=True),
        sa.Column("style_tag", sa.String, nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.true()),
        *_timestamps(),
    )
    op.create_index("ix_brands_category_id", "brands", ["category_id"])

    op.create_table(
        "listings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("brand_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("brands.id"), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("categories.id"), nullable=False),
        sa.Column("type", sa.String, nullable=False),
        sa.Column("title", sa.String, nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("price_paise", sa.Integer, nullable=False),
        sa.Column("mrp_paise", sa.Integer, nullable=True),
        sa.Column("rating", sa.Numeric(2, 1), nullable=True),
        sa.Column("review_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("images", postgresql.ARRAY(sa.Text), nullable=True),
        sa.Column("attributes", postgresql.JSONB, nullable=True),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default=sa.true()),
        *_timestamps(),
    )
    op.create_index("ix_listings_category_brand", "listings", ["category_id", "brand_id"])
    op.execute("CREATE INDEX ix_listings_title_trgm ON listings USING gin (title gin_trgm_ops)")

    op.create_table(
        "goals",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String, nullable=False),
        sa.Column("icon_key", sa.String, nullable=True),
        sa.Column("is_preset", sa.Boolean, nullable=False, server_default=sa.false()),
        sa.Column("target_amount_paise", sa.Integer, nullable=False),
        sa.Column("target_date", sa.Date, nullable=True),
        sa.Column("status", sa.String, nullable=False, server_default="active"),
        *_timestamps(),
    )
    op.create_index("ix_goals_user_id", "goals", ["user_id"])

    op.create_table(
        "carts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("categories.id"), nullable=False),
        sa.Column("status", sa.String, nullable=False, server_default="open"),
        *_timestamps(),
    )

    op.create_table(
        "cart_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("cart_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("carts.id"), nullable=False),
        sa.Column("listing_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("listings.id"), nullable=False),
        sa.Column("quantity", sa.Integer, nullable=False, server_default="1"),
        sa.Column("options", postgresql.JSONB, nullable=True),
        sa.Column("unit_price_paise", sa.Integer, nullable=False),
        *_timestamps(),
    )

    op.create_table(
        "craving_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("categories.id"), nullable=False),
        sa.Column("brand_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("brands.id"), nullable=True),
        sa.Column("status", sa.String, nullable=False, server_default="placed"),
        sa.Column("total_price_paise", sa.Integer, nullable=False),
        sa.Column("fake_payment_method", sa.String, nullable=True),
        sa.Column("tracking_stage", sa.String, nullable=True),
        sa.Column("outcome", sa.String, nullable=True),
        sa.Column("goal_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("goals.id"), nullable=True),
        sa.Column("placed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        *_timestamps(),
    )
    op.create_index("ix_craving_sessions_user_status", "craving_sessions", ["user_id", "status"])
    op.create_index("ix_craving_sessions_user_outcome", "craving_sessions", ["user_id", "outcome"])

    op.create_table(
        "craving_session_items",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "craving_session_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("craving_sessions.id"),
            nullable=False,
        ),
        sa.Column("listing_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("listings.id"), nullable=False),
        sa.Column("quantity", sa.Integer, nullable=False, server_default="1"),
        sa.Column("unit_price_paise", sa.Integer, nullable=False),
        sa.Column("options", postgresql.JSONB, nullable=True),
        *_timestamps(),
    )

    op.create_table(
        "goal_contributions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("goal_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("goals.id"), nullable=False),
        sa.Column(
            "craving_session_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("craving_sessions.id"),
            nullable=False,
        ),
        sa.Column("amount_paise", sa.Integer, nullable=False),
        sa.Column("recorded_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        *_timestamps(),
    )
    op.create_index("ix_goal_contributions_goal_recorded", "goal_contributions", ["goal_id", "recorded_at"])


def downgrade() -> None:
    op.drop_table("goal_contributions")
    op.drop_table("craving_session_items")
    op.drop_table("craving_sessions")
    op.drop_table("cart_items")
    op.drop_table("carts")
    op.drop_table("goals")
    op.drop_table("listings")
    op.drop_table("brands")
    op.drop_table("categories")
    op.drop_table("user_stats")
    op.drop_table("user_settings")
    op.drop_table("users")
