from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_or_create_guest_user
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.feedback import Feedback
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackOut

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post(
    "",
    response_model=FeedbackOut,
    status_code=201,
    dependencies=[Depends(rate_limit("create_feedback", times=20, seconds=60))],
)
async def create_feedback(
    payload: FeedbackCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_or_create_guest_user),
) -> FeedbackOut:
    feedback = Feedback(user_id=user.id, **payload.model_dump())
    db.add(feedback)
    await db.commit()
    return FeedbackOut.model_validate(feedback, from_attributes=True)
