import uuid

from fastapi import Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User


async def get_or_create_guest_user(
    db: AsyncSession = Depends(get_db),
    x_device_id: str = Header(..., alias="X-Device-Id"),
) -> User:
    """Resolve the guest-mode user from a stable client device id.

    SpendZero lets guests use the full experience before any sign-in, so
    auth here is device-scoped until Supabase auth is wired up in a later
    milestone.
    """
    if not x_device_id:
        raise HTTPException(status_code=400, detail="X-Device-Id header is required")

    result = await db.execute(select(User).where(User.auth_subject == x_device_id))
    user = result.scalar_one_or_none()
    if user is None:
        user = User(id=uuid.uuid4(), auth_subject=x_device_id, is_guest=True)
        db.add(user)
        await db.flush()
    return user
