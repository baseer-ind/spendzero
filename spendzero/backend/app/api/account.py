"""Account endpoints: claim a guest's on-device data into a signed-in account."""
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.commerce import Cart, CravingSession
from app.models.goals import Goal
from app.models.user import User

router = APIRouter(prefix="/me", tags=["account"])


class ClaimResult(BaseModel):
    claimed: bool
    goals_moved: int
    sessions_moved: int


@router.post("/claim-guest", response_model=ClaimResult)
async def claim_guest(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
    x_guest_device_id: str | None = Header(default=None, alias="X-Guest-Device-Id"),
) -> ClaimResult:
    """Migrate a guest's dreams/history into the caller's signed-in account.

    Call this once right after first sign-in, passing the device id the app
    used in guest mode as `X-Guest-Device-Id`. All goals, craving sessions,
    and carts owned by that guest are reassigned to the authenticated user so
    nothing they built before signing in is lost.
    """
    if user.is_guest:
        raise HTTPException(status_code=401, detail="Sign in before claiming guest data.")
    if not x_guest_device_id:
        raise HTTPException(status_code=400, detail="X-Guest-Device-Id header is required")

    result = await db.execute(
        select(User).where(User.auth_subject == x_guest_device_id, User.is_guest.is_(True))
    )
    guest = result.scalar_one_or_none()
    if guest is None or guest.id == user.id:
        return ClaimResult(claimed=False, goals_moved=0, sessions_moved=0)

    goals_res = await db.execute(
        update(Goal).where(Goal.user_id == guest.id).values(user_id=user.id)
    )
    sessions_res = await db.execute(
        update(CravingSession).where(CravingSession.user_id == guest.id).values(user_id=user.id)
    )
    await db.execute(update(Cart).where(Cart.user_id == guest.id).values(user_id=user.id))
    await db.flush()

    return ClaimResult(
        claimed=True,
        goals_moved=goals_res.rowcount or 0,
        sessions_moved=sessions_res.rowcount or 0,
    )
