from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_or_create_guest_user
from app.db.session import get_db
from app.models.user import User, UserStats
from app.schemas.stats import UserStatsOut

router = APIRouter(prefix="/me", tags=["stats"])


@router.get("/stats", response_model=UserStatsOut)
async def get_my_stats(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_or_create_guest_user),
) -> UserStatsOut:
    """Self-reported savings tally — streaks, total saved, categories
    explored. Never reflects real money movement."""
    result = await db.execute(select(UserStats).where(UserStats.user_id == user.id))
    stats = result.scalar_one_or_none()
    if stats is None:
        return UserStatsOut(
            total_amount_not_spent_paise=0,
            cravings_completed=0,
            goals_completed=0,
            current_streak_days=0,
            longest_streak_days=0,
            categories_explored=[],
        )
    return UserStatsOut(
        total_amount_not_spent_paise=stats.total_amount_not_spent_paise,
        cravings_completed=stats.cravings_completed,
        goals_completed=stats.goals_completed,
        current_streak_days=stats.current_streak_days,
        longest_streak_days=stats.longest_streak_days,
        categories_explored=stats.categories_explored or [],
    )
