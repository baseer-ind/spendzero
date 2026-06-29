import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_or_create_guest_user
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.goals import Goal, GoalContribution
from app.models.user import User
from app.schemas.goals import GoalCreate, GoalOut

router = APIRouter(prefix="/goals", tags=["goals"])


async def _saved_amount(db: AsyncSession, goal_id: uuid.UUID) -> int:
    result = await db.execute(
        select(func.coalesce(func.sum(GoalContribution.amount_paise), 0)).where(
            GoalContribution.goal_id == goal_id
        )
    )
    return int(result.scalar_one())


@router.get("", response_model=list[GoalOut])
async def list_goals(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_or_create_guest_user),
) -> list[GoalOut]:
    result = await db.execute(select(Goal).where(Goal.user_id == user.id))
    goals = result.scalars().all()
    out = []
    for goal in goals:
        saved = await _saved_amount(db, goal.id)
        out.append(GoalOut.model_validate(goal, from_attributes=True).model_copy(
            update={"saved_amount_paise": saved}
        ))
    return out


@router.post(
    "",
    response_model=GoalOut,
    status_code=201,
    dependencies=[Depends(rate_limit("create_goal", times=20, seconds=60))],
)
async def create_goal(
    payload: GoalCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_or_create_guest_user),
) -> GoalOut:
    goal = Goal(user_id=user.id, **payload.model_dump())
    db.add(goal)
    await db.commit()
    return GoalOut.model_validate(goal, from_attributes=True)
