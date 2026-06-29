from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.catalog import Brand, Category, Listing
from app.schemas.catalog import BrandOut, CategoryOut, ListingOut

router = APIRouter(prefix="/categories", tags=["catalog"])


@router.get("", response_model=list[CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_db)) -> list[Category]:
    result = await db.execute(select(Category).order_by(Category.sort_order))
    return list(result.scalars().all())


@router.get("/{category_id}/brands", response_model=list[BrandOut])
async def list_brands(category_id: str, db: AsyncSession = Depends(get_db)) -> list[Brand]:
    result = await db.execute(
        select(Brand).where(Brand.category_id == category_id, Brand.is_active.is_(True))
    )
    return list(result.scalars().all())


@router.get("/{category_id}/listings", response_model=list[ListingOut])
async def list_listings(
    category_id: str,
    q: str | None = Query(default=None, description="Search listing titles"),
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> list[Listing]:
    stmt = select(Listing).where(
        Listing.category_id == category_id, Listing.is_active.is_(True)
    )
    if q:
        stmt = stmt.where(Listing.title.ilike(f"%{q}%"))
    stmt = stmt.order_by(Listing.created_at).offset(offset).limit(limit)
    result = await db.execute(stmt)
    return list(result.scalars().all())
