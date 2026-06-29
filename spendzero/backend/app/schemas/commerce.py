import uuid

from pydantic import BaseModel


class CartItemIn(BaseModel):
    listing_id: uuid.UUID
    quantity: int = 1
    options: dict | None = None


class CheckoutRequest(BaseModel):
    category_id: uuid.UUID
    brand_id: uuid.UUID | None = None
    items: list[CartItemIn]
    fake_payment_method: str = "simulated_card"


class CravingCompletedOut(BaseModel):
    """The 'Craving Completed' celebration payload — never 'Order Successful'."""

    craving_session_id: uuid.UUID
    amount_not_spent_paise: int
    today_savings_paise: int
    month_savings_paise: int


class SaveOutcomeRequest(BaseModel):
    outcome: str  # 'saved' | 'maybe_later'
    goal_id: uuid.UUID | None = None
