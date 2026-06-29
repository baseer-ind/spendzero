import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_or_create_guest_user
from app.db.session import get_db
from app.models.catalog import Listing
from app.models.commerce import Cart, CravingSession, CravingSessionItem
from app.models.goals import GoalContribution
from app.models.user import User, UserStats
from app.schemas.commerce import CheckoutRequest, CravingCompletedOut, SaveOutcomeRequest

router = APIRouter(prefix="/craving-sessions", tags=["craving-sessions"])


@router.post("/checkout", response_model=CravingCompletedOut)
async def checkout(
    payload: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_or_create_guest_user),
) -> CravingCompletedOut:
    """Run the fake payment + fake tracking flow and land on 'Craving Completed'.

    No real payment is ever processed; total_price_paise is the amount the
    user chose NOT to spend.
    """
    now = datetime.now(timezone.utc)
    listing_ids = [item.listing_id for item in payload.items]
    result = await db.execute(select(Listing).where(Listing.id.in_(listing_ids)))
    listings_by_id = {listing.id: listing for listing in result.scalars().all()}

    total_paise = 0
    line_items: list[CravingSessionItem] = []
    for item in payload.items:
        listing = listings_by_id.get(item.listing_id)
        if listing is None:
            raise HTTPException(status_code=404, detail=f"Listing {item.listing_id} not found")
        unit_price = listing.price_paise
        total_paise += unit_price * item.quantity
        line_items.append(
            CravingSessionItem(
                listing_id=item.listing_id,
                quantity=item.quantity,
                unit_price_paise=unit_price,
                options=item.options,
            )
        )

    session = CravingSession(
        user_id=user.id,
        category_id=payload.category_id,
        brand_id=payload.brand_id,
        status="completed",
        total_price_paise=total_paise,
        fake_payment_method=payload.fake_payment_method,
        tracking_stage="delivered",
        placed_at=now,
        completed_at=now,
    )
    db.add(session)
    await db.flush()

    for line_item in line_items:
        line_item.craving_session_id = session.id
        db.add(line_item)

    today_total = await _sum_amount_not_spent(db, user.id, since=now.date())
    month_total = await _sum_amount_not_spent(db, user.id, since=now.replace(day=1).date())

    open_cart = await db.execute(
        select(Cart).where(
            Cart.user_id == user.id,
            Cart.category_id == payload.category_id,
            Cart.status == "open",
        )
    )
    cart = open_cart.scalar_one_or_none()
    if cart is not None:
        cart.status = "converted"

    await db.commit()
    return CravingCompletedOut(
        craving_session_id=session.id,
        amount_not_spent_paise=session.total_price_paise,
        today_savings_paise=today_total + session.total_price_paise,
        month_savings_paise=month_total + session.total_price_paise,
    )


@router.post("/{session_id}/outcome", status_code=204)
async def record_outcome(
    session_id: uuid.UUID,
    payload: SaveOutcomeRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_or_create_guest_user),
) -> None:
    """Record the user's own choice after 'Craving Completed' — 'I Saved It'
    or 'Maybe Later'. This never moves or implies movement of real money."""
    result = await db.execute(
        select(CravingSession).where(
            CravingSession.id == session_id, CravingSession.user_id == user.id
        )
    )
    session = result.scalar_one_or_none()
    if session is None:
        raise HTTPException(status_code=404, detail="Craving session not found")

    session.outcome = payload.outcome
    session.goal_id = payload.goal_id

    if payload.outcome == "saved":
        if payload.goal_id is not None:
            db.add(
                GoalContribution(
                    goal_id=payload.goal_id,
                    craving_session_id=session.id,
                    amount_paise=session.total_price_paise,
                )
            )
        await _increment_stats(db, user.id, session.total_price_paise, session.category_id)

    await db.commit()


async def _sum_amount_not_spent(db: AsyncSession, user_id: uuid.UUID, since) -> int:
    result = await db.execute(
        select(func.coalesce(func.sum(CravingSession.total_price_paise), 0)).where(
            CravingSession.user_id == user_id,
            CravingSession.outcome == "saved",
            func.date(CravingSession.completed_at) >= since,
        )
    )
    return int(result.scalar_one())


async def _increment_stats(
    db: AsyncSession, user_id: uuid.UUID, amount_paise: int, category_id: uuid.UUID
) -> None:
    result = await db.execute(select(UserStats).where(UserStats.user_id == user_id))
    stats = result.scalar_one_or_none()
    if stats is None:
        stats = UserStats(user_id=user_id)
        db.add(stats)
        await db.flush()
    stats.total_amount_not_spent_paise += amount_paise
    stats.cravings_completed += 1

    today = datetime.now(timezone.utc).date()
    last_saved = stats.last_saved_date
    if last_saved is None or last_saved < today - timedelta(days=1):
        stats.current_streak_days = 1
    elif last_saved == today - timedelta(days=1):
        stats.current_streak_days += 1
    # else last_saved == today: already counted today, streak unchanged.
    stats.longest_streak_days = max(stats.longest_streak_days, stats.current_streak_days)
    stats.last_saved_date = today

    explored = set(stats.categories_explored or [])
    explored.add(str(category_id))
    stats.categories_explored = list(explored)
