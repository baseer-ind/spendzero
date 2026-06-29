from fastapi import FastAPI

from app.api.categories import router as categories_router
from app.api.craving_sessions import router as craving_sessions_router
from app.api.goals import router as goals_router
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
app.include_router(categories_router, prefix="/api/v1")
app.include_router(goals_router, prefix="/api/v1")
app.include_router(craving_sessions_router, prefix="/api/v1")
