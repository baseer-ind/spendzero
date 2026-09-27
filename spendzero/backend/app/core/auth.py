"""Supabase auth: verify the access token Supabase issues to signed-in users.

Supabase signs its default access tokens with the project's JWT secret
(HS256). The mobile/web client signs in via Supabase (email or Google),
receives that token, and sends it to this API as `Authorization: Bearer
<token>`. We verify it here and map its `sub` claim (the Supabase user id)
to our own `User.auth_subject`.
"""
from __future__ import annotations

from jose import JWTError, jwt

from app.core.config import get_settings


class AuthError(Exception):
    """Raised when a bearer token is present but invalid."""


def verify_supabase_jwt(token: str, secret: str | None = None) -> dict:
    """Verify a Supabase access token and return its claims.

    Raises AuthError if the token is malformed, expired, wrong-audience, or
    signed with the wrong secret. `secret` defaults to the configured
    SPENDZERO_SUPABASE_JWT_SECRET (injectable for tests).
    """
    secret = secret if secret is not None else get_settings().supabase_jwt_secret
    if not secret:
        raise AuthError("Supabase auth is not configured on this server")
    try:
        return jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError as exc:  # invalid signature / expired / bad audience
        raise AuthError(str(exc)) from exc
