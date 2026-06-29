from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.carts import router as carts_router
from app.api.categories import router as categories_router
from app.api.craving_sessions import router as craving_sessions_router
from app.api.goals import router as goals_router
from app.api.stats import router as stats_router
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

# Native Android/iOS clients aren't subject to CORS, but the same backend
# also fronts the Flutter web target and local browser-based testing tools
# (e.g. Swagger UI from a different port), so this still matters in dev.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api/v1")
app.include_router(categories_router, prefix="/api/v1")
app.include_router(goals_router, prefix="/api/v1")
app.include_router(craving_sessions_router, prefix="/api/v1")
app.include_router(carts_router, prefix="/api/v1")
app.include_router(stats_router, prefix="/api/v1")
