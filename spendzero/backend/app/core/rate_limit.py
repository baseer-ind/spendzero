import logging

from fastapi import Header, HTTPException

from app.core.redis import get_redis

logger = logging.getLogger(__name__)


def rate_limit(name: str, times: int, seconds: int):
    """Fixed-window rate limiter keyed on the guest device id.

    Fails open (allows the request) if Redis is unreachable, so a missing
    cache in local dev never takes down the write endpoints — only
    production deployments with Redis configured actually enforce limits.
    """

    async def _dependency(
        x_device_id: str = Header(..., alias="X-Device-Id"),
    ) -> None:
        key = f"ratelimit:{name}:{x_device_id}"
        try:
            client = get_redis()
            count = await client.incr(key)
            if count == 1:
                await client.expire(key, seconds)
            if count > times:
                raise HTTPException(status_code=429, detail="Too many requests. Please slow down.")
        except HTTPException:
            raise
        except Exception:  # noqa: BLE001 - Redis unavailable, fail open
            logger.warning("Rate limiter unavailable, allowing request", exc_info=True)

    return _dependency
