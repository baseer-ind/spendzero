import os
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

# SPENDZERO_ENV picks which dotenv file to load (development/staging/production).
# Defaults to "development" so a fresh clone with no env vars set still works
# against the local docker-compose stack with zero manual editing.
_ENV_NAME = os.getenv("SPENDZERO_ENV", "development")
# Order matters: later files in this tuple override earlier ones, so the
# environment-specific file (.env.development/.env.staging/.env.production)
# takes precedence over the generic .env fallback.
_ENV_FILES = (".env", f".env.{_ENV_NAME}")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="SPENDZERO_", env_file=_ENV_FILES, extra="ignore")

    environment: str = _ENV_NAME
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/spendzero"
    redis_url: str = "redis://localhost:6379/0"
    supabase_url: str = ""
    supabase_jwt_secret: str = ""
    cors_origins: str = "*"
    seed_demo_user: bool = True

    @property
    def cors_origin_list(self) -> list[str]:
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
