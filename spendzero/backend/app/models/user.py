import uuid
from datetime import date

from sqlalchemy import ARRAY, Boolean, Date, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TimestampedBase


class User(TimestampedBase):
    """A SpendZero user. Guests have no auth_subject until they sign in."""

    __tablename__ = "users"

    auth_provider: Mapped[str | None] = mapped_column(String, nullable=True)
    auth_subject: Mapped[str | None] = mapped_column(String, nullable=True)
    is_guest: Mapped[bool] = mapped_column(Boolean, default=True)
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    name: Mapped[str | None] = mapped_column(String, nullable=True)
    city: Mapped[str | None] = mapped_column(String, nullable=True)
    state: Mapped[str | None] = mapped_column(String, nullable=True)
    language: Mapped[str] = mapped_column(String, default="en")
    interests: Mapped[list[str] | None] = mapped_column(ARRAY(Text), nullable=True)


class UserSettings(TimestampedBase):
    __tablename__ = "user_settings"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), unique=True
    )
    notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    theme: Mapped[str] = mapped_column(String, default="system")


class UserStats(TimestampedBase):
    """Aggregate, user-confirmed savings tally. No money ever moves here."""

    __tablename__ = "user_stats"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), unique=True
    )
    total_amount_not_spent_paise: Mapped[int] = mapped_column(Integer, default=0)
    cravings_completed: Mapped[int] = mapped_column(Integer, default=0)
    goals_completed: Mapped[int] = mapped_column(Integer, default=0)
    current_streak_days: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak_days: Mapped[int] = mapped_column(Integer, default=0)
    categories_explored: Mapped[list[str] | None] = mapped_column(ARRAY(Text), nullable=True)
    last_saved_date: Mapped[date | None] = mapped_column(Date, nullable=True)
