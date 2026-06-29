import uuid

from pydantic import BaseModel, ConfigDict


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    name: str
    icon_key: str | None = None
    sort_order: int


class BrandOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    category_id: uuid.UUID
    name: str
    slug: str
    tagline: str | None = None
    primary_color: str | None = None
    secondary_color: str | None = None


class ListingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    brand_id: uuid.UUID
    category_id: uuid.UUID
    title: str
    description: str | None = None
    price_paise: int
    mrp_paise: int | None = None
    rating: float | None = None
    review_count: int
    images: list[str] | None = None
