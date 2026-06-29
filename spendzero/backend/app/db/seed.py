"""Seeds fictional categories/brands/listings, plus a fully-populated demo
guest user, for local dev & demos.

Run with: python -m app.db.seed
Safe to re-run — it upserts catalog rows by slug/title and skips demo-user
seeding entirely if that user already exists, instead of duplicating rows.
"""
import asyncio
import random
from datetime import datetime, time, timedelta, timezone

from sqlalchemy import select

from app.core.config import get_settings
from app.db.session import async_session_factory
from app.models.catalog import Brand, Category, Listing
from app.models.commerce import CravingSession, CravingSessionItem
from app.models.goals import Goal, GoalContribution
from app.models.user import User, UserStats

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
    "food": [
        "Paneer Tikka Wrap",
        "Family Pizza Combo",
        "Butter Chicken Bowl",
        "Cold Coffee Float",
        "Loaded Nachos Platter",
        "Hyderabadi Biryani Tub",
    ],
    "shopping": [
        "Wireless Earbuds",
        "Smart Backpack",
        "Desk Organizer Set",
        "Travel Toiletry Kit",
        "Memory Foam Pillow",
    ],
    "grocery": [
        "Weekly Veggie Box",
        "Organic Atta 5kg",
        "Snack Combo Pack",
        "Cold-Pressed Oil 1L",
        "Breakfast Cereal Bundle",
    ],
    "fashion": [
        "Linen Shirt",
        "Running Sneakers",
        "Denim Jacket",
        "Everyday Tote Bag",
        "Slim Fit Chinos",
    ],
    "beauty": [
        "Matte Lipstick Set",
        "Hydrating Face Serum",
        "Hair Styling Kit",
        "Vitamin C Sunscreen",
        "Luxury Bath Bomb Trio",
    ],
    "electronics": [
        "Bluetooth Speaker",
        "Smartwatch Pro",
        "Power Bank 20000mAh",
        "Noise Cancelling Headphones",
        "Mini Drone Camera",
    ],
    "travel": [
        "Goa Weekend Flight",
        "Manali Bus Ticket",
        "Airport Cab Ride",
        "Backpacker Rail Pass",
        "Scenic Road Trip Fuel Pack",
    ],
    "hotels": [
        "Beachside Resort Night",
        "City Boutique Stay",
        "Hill View Cottage",
        "Rooftop Pool Suite Night",
    ],
    "movies": [
        "Weekend Blockbuster Ticket",
        "Recliner Seat + Popcorn Combo",
        "Late Night Show Pass",
        "3D Premiere Ticket",
    ],
    "vehicles": [
        "Bike Service Package",
        "Car Detailing Combo",
        "Alloy Wheel Upgrade",
        "Dash Cam Installation",
    ],
    "gaming": [
        "Wireless Controller",
        "Game Credits Pack",
        "Gaming Headset",
        "RGB Mechanical Keyboard",
        "Annual Game Pass Voucher",
    ],
    "gifts": [
        "Surprise Hamper",
        "Personalized Mug",
        "Flower Bouquet",
        "Engraved Photo Frame",
        "Celebration Cake Box",
    ],
}

DEMO_DEVICE_ID = "demo-device-001"

DEMO_GOALS = [
    ("Goa Trip", "✈️", 1_500_000, True),
    ("New Phone", "📱", 8_000_000, True),
    ("Emergency Fund", "🛡️", 5_000_000, False),
]


async def seed_catalog(db) -> dict[str, Category]:
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
                result = await db.execute(select(Listing).where(Listing.title == listing_title))
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
    return category_by_slug


async def seed_demo_user(db) -> None:
    """Backfills a guest user with goals, a 10-day save streak, and stats
    that all agree with each other, so a fresh install immediately feels
    alive instead of empty. Device id `demo-device-001` — point the app at
    it (X-Device-Id header) to explore a populated account without doing
    any of the underlying taps yourself."""
    result = await db.execute(select(User).where(User.auth_subject == DEMO_DEVICE_ID))
    if result.scalar_one_or_none() is not None:
        print("Demo user already seeded — skipping.")
        return

    result = await db.execute(select(Listing).where(Listing.is_active.is_(True)).limit(60))
    listings = result.scalars().all()
    if not listings:
        print("No listings to back the demo user — run catalog seeding first.")
        return

    user = User(auth_subject=DEMO_DEVICE_ID, is_guest=True, name="Demo Saver")
    db.add(user)
    await db.flush()

    goals_by_title: dict[str, Goal] = {}
    for title, icon, target, is_preset in DEMO_GOALS:
        goal = Goal(
            user_id=user.id, title=title, icon_key=icon, target_amount_paise=target, is_preset=is_preset
        )
        db.add(goal)
        await db.flush()
        goals_by_title[title] = goal

    random.shuffle(listings)
    goal_cycle = ["Goa Trip", "New Phone", "Emergency Fund", None]
    days_ago_plan = list(range(9, -1, -1))  # 10 consecutive days, oldest first

    today = datetime.now(timezone.utc).date()
    total_saved = 0
    categories_explored: set[str] = set()

    for i, days_ago in enumerate(days_ago_plan):
        listing = listings[i % len(listings)]
        day = today - timedelta(days=days_ago)
        completed_at = datetime.combine(day, time(hour=19, minute=30), tzinfo=timezone.utc)
        amount = listing.price_paise

        goal_title = goal_cycle[i % len(goal_cycle)]
        goal = goals_by_title.get(goal_title) if goal_title else None

        session = CravingSession(
            user_id=user.id,
            category_id=listing.category_id,
            brand_id=listing.brand_id,
            status="completed",
            total_price_paise=amount,
            fake_payment_method="demo_card",
            tracking_stage="delivered",
            outcome="saved",
            goal_id=goal.id if goal else None,
            placed_at=completed_at,
            completed_at=completed_at,
        )
        db.add(session)
        await db.flush()

        db.add(
            CravingSessionItem(
                craving_session_id=session.id,
                listing_id=listing.id,
                quantity=1,
                unit_price_paise=amount,
            )
        )
        if goal is not None:
            db.add(
                GoalContribution(
                    goal_id=goal.id,
                    craving_session_id=session.id,
                    amount_paise=amount,
                    recorded_at=completed_at,
                )
            )

        total_saved += amount
        categories_explored.add(str(listing.category_id))

    db.add(
        UserStats(
            user_id=user.id,
            total_amount_not_spent_paise=total_saved,
            cravings_completed=len(days_ago_plan),
            goals_completed=0,
            current_streak_days=len(days_ago_plan),
            longest_streak_days=len(days_ago_plan),
            categories_explored=list(categories_explored),
            last_saved_date=today,
        )
    )
    await db.commit()
    print(
        f"Demo user seeded: device id '{DEMO_DEVICE_ID}', "
        f"{len(days_ago_plan)}-day streak, ₹{total_saved / 100:.0f} saved across "
        f"{len(goals_by_title)} goals."
    )


async def seed() -> None:
    settings = get_settings()
    async with async_session_factory() as db:
        await seed_catalog(db)
        print("Catalog seed complete.")

        if settings.seed_demo_user:
            await seed_demo_user(db)


if __name__ == "__main__":
    asyncio.run(seed())
