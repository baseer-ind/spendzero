import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_or_create_guest_user
from app.core.rate_limit import rate_limit
from app.db.session import get_db
from app.models.commerce import Cart, CartItem
from app.models.user import User
from app.schemas.commerce import CartItemIn, CartItemOut, CartOut

router = APIRouter(prefix="/carts", tags=["carts"])


async def _get_or_create_open_cart(db: AsyncSession, user_id: uuid.UUID, category_id: uuid.UUID) -> Cart:
    result = await db.execute(
        select(Cart).where(
            Cart.user_id == user_id, Cart.category_id == category_id, Cart.status == "open"
        )
    )
    cart = result.scalar_one_or_none()
    if cart is None:
        cart = Cart(user_id=user_id, category_id=category_id, status="open")
        db.add(cart)
        await db.flush()
    return cart


async def _cart_out(db: AsyncSession, cart: Cart) -> CartOut:
    result = await db.execute(select(CartItem).where(CartItem.cart_id == cart.id))
    items = result.scalars().all()
    return CartOut(
        id=cart.id,
        category_id=cart.category_id,
        items=[
            CartItemOut(
                listing_id=item.listing_id,
                quantity=item.quantity,
                options=item.options,
                unit_price_paise=item.unit_price_paise,
            )
            for item in items
        ],
    )


@router.get("/{category_id}", response_model=CartOut)
async def get_cart(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_or_create_guest_user),
) -> CartOut:
    """Resume the open (abandoned) cart for this category, if any."""
    cart = await _get_or_create_open_cart(db, user.id, category_id)
    return await _cart_out(db, cart)


@router.put(
    "/{category_id}/items",
    response_model=CartOut,
    dependencies=[Depends(rate_limit("save_cart", times=60, seconds=60))],
)
async def replace_cart_items(
    category_id: uuid.UUID,
    items: list[CartItemIn],
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_or_create_guest_user),
) -> CartOut:
    """Persist the current selection for this category's cart so it survives
    app restarts and can be resumed later."""
    from app.models.catalog import Listing

    cart = await _get_or_create_open_cart(db, user.id, category_id)

    existing = await db.execute(select(CartItem).where(CartItem.cart_id == cart.id))
    for row in existing.scalars().all():
        await db.delete(row)
    await db.flush()

    if items:
        listing_ids = [item.listing_id for item in items]
        result = await db.execute(select(Listing).where(Listing.id.in_(listing_ids)))
        listings_by_id = {listing.id: listing for listing in result.scalars().all()}
        for item in items:
            listing = listings_by_id.get(item.listing_id)
            if listing is None:
                continue
            db.add(
                CartItem(
                    cart_id=cart.id,
                    listing_id=item.listing_id,
                    quantity=item.quantity,
                    options=item.options,
                    unit_price_paise=listing.price_paise,
                )
            )

    await db.commit()
    return await _cart_out(db, cart)
