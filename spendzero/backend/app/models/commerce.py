import uuid
from datetime import datetime

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TimestampedBase


class Cart(TimestampedBase):
    __tablename__ = "carts"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    category_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("categories.id"))
    status: Mapped[str] = mapped_column(String, default="open")


class CartItem(TimestampedBase):
    __tablename__ = "cart_items"

    cart_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("carts.id"))
    listing_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("listings.id"))
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    options: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    unit_price_paise: Mapped[int] = mapped_column(Integer)


class CravingSession(TimestampedBase):
    """The simulated 'purchase'. Nothing here ever touches real money."""

    __tablename__ = "craving_sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    category_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("categories.id"))
    brand_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("brands.id"), nullable=True
    )
    status: Mapped[str] = mapped_column(String, default="placed")
    total_price_paise: Mapped[int] = mapped_column(Integer)
    fake_payment_method: Mapped[str | None] = mapped_column(String, nullable=True)
    tracking_stage: Mapped[str | None] = mapped_column(String, nullable=True)
    outcome: Mapped[str | None] = mapped_column(String, nullable=True)
    goal_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("goals.id"), nullable=True
    )
    placed_at: Mapped[datetime | None] = mapped_column(nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(nullable=True)


class CravingSessionItem(TimestampedBase):
    __tablename__ = "craving_session_items"

    craving_session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("craving_sessions.id")
    )
    listing_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("listings.id"))
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    unit_price_paise: Mapped[int] = mapped_column(Integer)
    options: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
