from fastapi import FastAPI

from app.api.health import router as health_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="SpendZero API",
    version="0.1.0",
    description=(
        "Simulation-only backend for SpendZero. No real payments are "
        "processed and no financial instruments are ever stored."
    ),
)

app.include_router(health_router, prefix="/api/v1")
