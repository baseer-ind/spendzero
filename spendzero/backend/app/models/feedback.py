import uuid

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TimestampedBase


class Feedback(TimestampedBase):
    """Free-text beta feedback submitted from the in-app feedback flow.

    Intentionally minimal — this is a stopgap until a real crash
    reporter/analytics SDK is integrated (see docs/22-release-readiness.md);
    it just needs to get a tester's words in front of us with enough
    context (app version, env, device id) to reproduce what they saw.
    """

    __tablename__ = "feedback"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    category: Mapped[str] = mapped_column(String, default="general")
    message: Mapped[str] = mapped_column(Text)
    app_version: Mapped[str | None] = mapped_column(String, nullable=True)
    environment: Mapped[str | None] = mapped_column(String, nullable=True)
    device_id: Mapped[str | None] = mapped_column(String, nullable=True)
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
