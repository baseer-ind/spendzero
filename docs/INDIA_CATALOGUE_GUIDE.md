# India Catalogue Guide

Reference for the India-first marketplace data in `webapp/src/lib/catalog.ts`.

## Shape

```ts
type Diet = "veg" | "nonveg" | "egg";

type Dish = {
  id; name; section; desc; price; mrp?; rating;
  diet: Diet; img; bestseller?; addons?: { name; price }[];
};

type Restaurant = {
  id; name; area; city; cuisines[]; rating; etaMins;
  deliveryFee; distanceKm; costForTwo; vegOnly; offer?; img;
  apps[]; dishes[];
};
```

- `diet` replaces the old boolean `veg`. Render: veg = green, egg = amber,
  nonveg = red (the standard Indian label dot).
- `costForTwo` replaces `priceForTwo`; `vegOnly` replaces `veg` on the
  restaurant; `area`/`city` are new and shown on discovery cards.

## Food apps (fictional)

| id | name | tagline |
|----|------|---------|
| zaikago | ZaikaGo | Ghar jaisa, tez delivery |
| khananow | KhanaNow | Top-rated kitchens near you |
| mealkart | MealKart | 30-min meals, no surge |

## Restaurants (Hyderabad, fictional)

Deccan Zaika (Banjara Hills, Biryani/Hyderabadi) · Charminar Kitchen (Old City,
Hyderabadi/North Indian) · Udupi Grand Tiffins (Ameerpet, South Indian/Thali,
pure veg) · Mumbai Tadka Street (Kukatpally, Street Food/Chinese) · Andhra
Ruchulu (Madhapur, Andhra/Biryani) · Hyderabad Sweet House (Secunderabad,
Desserts/Beverages, pure veg).

Dishes include: Hyderabadi Chicken/Mutton Dum Biryani, Haleem, Mirchi Ka Salan,
Double Ka Meetha, Irani Chai + Osmania, Butter Chicken, Paneer Tikka Masala,
Dal Makhani, Chicken 65, Masala Dosa, Idli Vada, Unlimited Meals, Ven Pongal,
Filter Coffee, Vada Pav, Pav Bhaji, Misal Pav, Hakka Noodles, Gobi Manchurian,
Gongura Chicken, Pulihora, Pesarattu, Egg Pulusu, Qubani Ka Meetha, Jalebi,
Kaju Katli, Royal Falooda.

## Offers (India-style)

"₹100 OFF above ₹499 · UPI", "Free delivery over ₹199", "10% OFF on Thali",
"Bank offer: 10% on UPI", "Weekend offer: Buy 1kg get 250g free".

## Images

`kwImg(keyword, seed)` returns a stable keyworded photo URL (React `<img>`,
no CORS). Bundled fallbacks are in `BUNDLED`.

## Adding a vertical

Travel, Shopping, Grocery, Entertainment are "Soon" on `/today`. When building
one, follow `INDIA_FIRST_PRODUCT_GUIDELINES.md`: Indian brands (fictional),
Indian prices in ₹, Indian context. Mirror the Food vertical's depth — product
depth over category count.
