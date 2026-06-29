"""Seeds fictional categories/brands/listings for local dev & demos.

Run with: python -m app.db.seed
Safe to re-run — it upserts by slug instead of duplicating rows.
"""
import asyncio
import random

from sqlalchemy import select

from app.db.session import async_session_factory
from app.models.catalog import Brand, Category, Listing

CATEGORIES = [
    ("food", "Food", "🍔"),
    ("shopping", "Shopping", "🛒"),
    ("grocery", "Grocery", "📦"),
    ("fashion", "Fashion", "👕"),
    ("beauty", "Beauty", "💄"),
    ("electronics", "Electronics", "📱"),
    ("travel", "Travel", "✈️"),
    ("hotels", "Hotels", "🏨"),
    ("movies", "Movies", "🎬"),
    ("vehicles", "Vehicles", "🚗"),
    ("gaming", "Gaming", "🎮"),
    ("gifts", "Gifts", "🎁"),
]

BRANDS_BY_CATEGORY = {
    "food": ["Zwigato", "Swaggie", "QuickPlate", "CurryCab"],
    "shopping": ["Amazia", "FlipNest", "Cartly"],
    "grocery": ["FreshKart", "GreenBasket", "QuickCrate"],
    "fashion": ["StyleKart", "TrendNest", "VogueLoop"],
    "beauty": ["GlowKart", "BeautyBee", "PinkBox"],
    "electronics": ["TechBazaar", "GadgetNest", "ByteBox"],
    "travel": ["TripNest", "FlyGo", "WanderKart"],
    "hotels": ["StayNest", "RoomBee", "CozyStay"],
    "movies": ["CinemaNow", "MovieHive", "ShowSquare"],
    "vehicles": ["MotorMint", "DriveDeck", "AutoArena"],
    "gaming": ["GameVerse", "PlayArena", "PixelPlay"],
    "gifts": ["GiftGalaxy", "SurpriseSquare", "WrapWorld"],
}

LISTING_TITLES_BY_CATEGORY = {
    "food": ["Paneer Tikka Wrap", "Family Pizza Combo", "Butter Chicken Bowl", "Cold Coffee Float"],
    "shopping": ["Wireless Earbuds", "Smart Backpack", "Desk Organizer Set"],
    "grocery": ["Weekly Veggie Box", "Organic Atta 5kg", "Snack Combo Pack"],
    "fashion": ["Linen Shirt", "Running Sneakers", "Denim Jacket"],
    "beauty": ["Matte Lipstick Set", "Hydrating Face Serum", "Hair Styling Kit"],
    "electronics": ["Bluetooth Speaker", "Smartwatch Pro", "Power Bank 20000mAh"],
    "travel": ["Goa Weekend Flight", "Manali Bus Ticket", "Airport Cab Ride"],
    "hotels": ["Beachside Resort Night", "City Boutique Stay", "Hill View Cottage"],
    "movies": ["Weekend Blockbuster Ticket", "Recliner Seat + Popcorn Combo"],
    "vehicles": ["Bike Service Package", "Car Detailing Combo"],
    "gaming": ["Wireless Controller", "Game Credits Pack", "Gaming Headset"],
    "gifts": ["Surprise Hamper", "Personalized Mug", "Flower Bouquet"],
}


async def seed() -> None:
    async with async_session_factory() as db:
        category_by_slug: dict[str, Category] = {}
        for slug, name, icon in CATEGORIES:
            result = await db.execute(select(Category).where(Category.slug == slug))
            category = result.scalar_one_or_none()
            if category is None:
                category = Category(slug=slug, name=name, icon_key=icon)
                db.add(category)
                await db.flush()
            category_by_slug[slug] = category

        for slug, category in category_by_slug.items():
            for brand_name in BRANDS_BY_CATEGORY.get(slug, []):
                brand_slug = brand_name.lower().replace(" ", "-")
                result = await db.execute(select(Brand).where(Brand.slug == brand_slug))
                brand = result.scalar_one_or_none()
                if brand is None:
                    brand = Brand(
                        category_id=category.id,
                        name=brand_name,
                        slug=brand_slug,
                        tagline=f"{brand_name} — simulated picks, zero spend.",
                        primary_color=f"#{random.randint(0, 0xFFFFFF):06X}",
                    )
                    db.add(brand)
                    await db.flush()

                for title in LISTING_TITLES_BY_CATEGORY.get(slug, []):
                    listing_title = f"{brand_name} {title}"
                    result = await db.execute(
                        select(Listing).where(Listing.title == listing_title)
                    )
                    if result.scalar_one_or_none() is not None:
                        continue
                    price = random.randint(99, 4999) * 100
                    db.add(
                        Listing(
                            brand_id=brand.id,
                            category_id=category.id,
                            type="product",
                            title=listing_title,
                            description=f"A simulated {title.lower()} from {brand_name}.",
                            price_paise=price,
                            mrp_paise=int(price * 1.2),
                            rating=round(random.uniform(3.8, 4.9), 1),
                            review_count=random.randint(10, 5000),
                            images=[],
                            is_active=True,
                        )
                    )

        await db.commit()
        print("Seed complete.")


if __name__ == "__main__":
    asyncio.run(seed())
