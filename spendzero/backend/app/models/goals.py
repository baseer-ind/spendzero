import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TimestampedBase


class Goal(TimestampedBase):
    """A savings goal the user voluntarily tracks. No funds are held."""

    __tablename__ = "goals"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String)
    icon_key: Mapped[str | None] = mapped_column(String, nullable=True)
    is_preset: Mapped[bool] = mapped_column(Boolean, default=False)
    target_amount_paise: Mapped[int] = mapped_column(Integer)
    target_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String, default="active")


class GoalContribution(TimestampedBase):
    """One row per 'I Saved It' tap — a self-reported ledger entry only."""

    __tablename__ = "goal_contributions"

    goal_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("goals.id"))
    craving_session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("craving_sessions.id")
    )
    amount_paise: Mapped[int] = mapped_column(Integer)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
