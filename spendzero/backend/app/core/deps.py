import uuid

from fastapi import Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import AuthError, verify_supabase_jwt
from app.db.session import get_db
from app.models.user import User


async def get_or_create_guest_user(
    db: AsyncSession = Depends(get_db),
    x_device_id: str = Header(..., alias="X-Device-Id"),
) -> User:
    """Resolve the guest-mode user from a stable client device id.

    SpendZero lets guests use the full experience before any sign-in, so
    auth here is device-scoped. Signed-in requests use [get_current_user]
    instead, which prefers the Supabase bearer token.
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


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    authorization: str | None = Header(default=None),
    x_device_id: str | None = Header(default=None, alias="X-Device-Id"),
) -> User:
    """Resolve the current user for a request.

    Prefers a Supabase access token (`Authorization: Bearer <jwt>`) — a real
    signed-in account. Falls back to the `X-Device-Id` guest identity when no
    token is present, so guest mode keeps working and guests can later claim
    their data into an account. Requires at least one of the two.
    """
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        try:
            claims = verify_supabase_jwt(token)
        except AuthError as exc:
            raise HTTPException(status_code=401, detail=f"Invalid token: {exc}") from exc

        subject = claims.get("sub")
        if not subject:
            raise HTTPException(status_code=401, detail="Token missing subject")

        result = await db.execute(select(User).where(User.auth_subject == subject))
        user = result.scalar_one_or_none()
        if user is None:
            user = User(
                id=uuid.uuid4(),
                auth_subject=subject,
                auth_provider="supabase",
                is_guest=False,
                email=claims.get("email"),
            )
            db.add(user)
            await db.flush()
        elif user.is_guest:
            # Same subject seen before as a guest — promote it in place.
            user.is_guest = False
            user.auth_provider = "supabase"
            user.email = user.email or claims.get("email")
            await db.flush()
        return user

    if x_device_id:
        return await get_or_create_guest_user(db=db, x_device_id=x_device_id)

    raise HTTPException(
        status_code=401,
        detail="Sign in, or send an X-Device-Id header for guest mode.",
    )
