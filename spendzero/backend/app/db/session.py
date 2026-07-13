from collections.abc import AsyncGenerator
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings

settings = get_settings()


def _prepare_asyncpg_url(url: str) -> tuple[str, dict]:
    """Normalize a Postgres URL for SQLAlchemy's asyncpg driver.

    Managed Postgres providers (Supabase, Neon, etc.) hand out libpq-style
    URLs with query params like `sslmode=require`/`channel_binding` that the
    asyncpg driver does not understand and will raise on. We strip those and
    translate them into asyncpg `connect_args` instead:

    - any `sslmode` other than `disable` -> ssl enabled
    - `statement_cache_size=0` is forced whenever SSL is required, since
      Supabase's PgBouncer transaction pooler (port 6543) is incompatible
      with asyncpg's prepared-statement cache. Harmless on a direct
      connection, so we set it whenever a managed provider is detected.
    """
    if not url.startswith("postgresql+asyncpg://"):
        return url, {}

    parts = urlsplit(url)
    query = dict(parse_qsl(parts.query))
    connect_args: dict = {}

    sslmode = query.pop("sslmode", None)
    if sslmode and sslmode != "disable":
        connect_args["ssl"] = True

    # asyncpg doesn't accept this libpq param as a query string.
    query.pop("channel_binding", None)

    if connect_args.get("ssl"):
        connect_args["statement_cache_size"] = 0

    new_query = urlencode(query)
    cleaned = urlunsplit((parts.scheme, parts.netloc, parts.path, new_query, parts.fragment))
    return cleaned, connect_args


_db_url, _connect_args = _prepare_asyncpg_url(settings.database_url)

engine = create_async_engine(
    _db_url,
    echo=False,
    pool_pre_ping=True,
    connect_args=_connect_args,
)
async_session_factory = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session
