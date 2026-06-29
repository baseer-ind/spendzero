import uuid
from datetime import date

from pydantic import BaseModel, ConfigDict


class GoalCreate(BaseModel):
    title: str
    icon_key: str | None = None
    target_amount_paise: int
    target_date: date | None = None


class GoalOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    icon_key: str | None = None
    target_amount_paise: int
    target_date: date | None = None
    status: str
    saved_amount_paise: int = 0
