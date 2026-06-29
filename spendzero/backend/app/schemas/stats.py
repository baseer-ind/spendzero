from pydantic import BaseModel


class UserStatsOut(BaseModel):
    total_amount_not_spent_paise: int
    cravings_completed: int
    goals_completed: int
    current_streak_days: int
    longest_streak_days: int
    categories_explored: list[str]
