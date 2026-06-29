import uuid

from pydantic import BaseModel, ConfigDict, Field


class FeedbackCreate(BaseModel):
    category: str = "general"
    message: str = Field(min_length=1, max_length=4000)
    app_version: str | None = None
    environment: str | None = None
    device_id: str | None = None
    rating: int | None = Field(default=None, ge=1, le=5)


class FeedbackOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    category: str
    message: str
