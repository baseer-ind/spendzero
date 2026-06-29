"""App-wiring smoke tests that don't require a live database."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint() -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_all_routes_registered() -> None:
    paths = set(app.openapi()["paths"].keys())
    expected = {
        "/api/v1/health",
        "/api/v1/categories",
        "/api/v1/goals",
        "/api/v1/craving-sessions/checkout",
    }
    assert expected.issubset(paths)


def test_checkout_requires_device_id_header() -> None:
    response = client.post(
        "/api/v1/craving-sessions/checkout",
        json={"category_id": "00000000-0000-0000-0000-000000000000", "items": []},
    )
    assert response.status_code == 422
