from fastapi import APIRouter, Depends
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
async def list_listings(category_id: str, db: AsyncSession = Depends(get_db)) -> list[Listing]:
    result = await db.execute(
        select(Listing).where(Listing.category_id == category_id, Listing.is_active.is_(True))
    )
    return list(result.scalars().all())
