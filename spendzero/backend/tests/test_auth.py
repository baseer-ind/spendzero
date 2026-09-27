"""Auth wiring tests — Supabase JWT verification + route registration.

DB-free: exercises the token verifier directly and checks the account
route is registered, matching the smoke-test style (no live database).
"""
import time

import pytest
from jose import jwt

from app.core.auth import AuthError, verify_supabase_jwt
from app.main import app

_SECRET = "test-jwt-secret"


def _token(claims: dict) -> str:
    base = {
        "sub": "user-123",
        "aud": "authenticated",
        "role": "authenticated",
        "exp": int(time.time()) + 3600,
    }
    base.update(claims)
    return jwt.encode(base, _SECRET, algorithm="HS256")


def test_valid_token_returns_claims() -> None:
    claims = verify_supabase_jwt(_token({"email": "a@b.com"}), secret=_SECRET)
    assert claims["sub"] == "user-123"
    assert claims["email"] == "a@b.com"


def test_wrong_secret_rejected() -> None:
    with pytest.raises(AuthError):
        verify_supabase_jwt(_token({}), secret="not-the-secret")


def test_expired_token_rejected() -> None:
    with pytest.raises(AuthError):
        verify_supabase_jwt(_token({"exp": int(time.time()) - 10}), secret=_SECRET)


def test_wrong_audience_rejected() -> None:
    with pytest.raises(AuthError):
        verify_supabase_jwt(_token({"aud": "someone-else"}), secret=_SECRET)


def test_unconfigured_secret_rejected() -> None:
    with pytest.raises(AuthError):
        verify_supabase_jwt(_token({}), secret="")


def test_claim_guest_route_registered() -> None:
    assert "/api/v1/me/claim-guest" in set(app.openapi()["paths"].keys())
