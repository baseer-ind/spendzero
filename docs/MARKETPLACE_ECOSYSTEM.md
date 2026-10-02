# Marketplace Ecosystem — Project Future sandbox

The sandbox is a realistic, fictional consumption ecosystem. The user browses like they normally
would; Project Future adds the Pause/Decide at checkout. No real trademarks — fictional brands only.

## Verticals (depth over count)
Deep-first order: **Food (live) → Shopping → Grocery → Travel → Entertainment**, then reuse infra for
Fashion, Electronics, Beauty, Home, Books, Gaming, Fitness, Automotive, Jewellery, Hotels, Services, Pets.

| Vertical | Status |
|----------|--------|
| Food | ✅ Deep & live (3 apps, 4 restaurants, ~22 dishes, search, cuisine filters, item detail + add-ons, cart, checkout→Pause) |
| Grocery / Shopping / Electronics / Travel / Entertainment / Beauty / Home | 🔜 Hub category present ("Soon" state); build next on the shared infra |

## Fictional apps
- **Food:** Zwigato, Tomato, YumRush.
- **Shopping:** Amazing, FlippingKart, MegaMart.
- **Grocery:** FreshBasket, DailyCart, QuickGrocer.
- **Travel:** TripNest, StayScape, FlyAway.
- **Entertainment:** MovieHub, CinemaVerse.
- **Electronics:** TechNest, ElectroHub. **Beauty:** GlowCart, BeautyBox. **Fashion:** StyleStreet, TrendKart. **Home:** HomeNest, FurniCo.
Each app: name, logo treatment (emoji/colour for now), accent identity, catalogue, and the shared journey.

## The journey (every vertical)
`Discover → Search/Filter → Listing → Detail → Add/Select → Cart → Checkout → PAUSE → DECIDE → Enjoy | Redirect → Progress`

## Data model (`src/lib/catalog.ts`)
- `FoodApp`, `Restaurant { cuisines, rating, eta, fee, offer, veg, apps[], dishes[] }`, `Dish { section, price, mrp?, veg, addons[], bestseller }`.
- Restaurants belong to multiple apps (`apps[]`) — realistic cross-listing.
- `kwImg(keyword, seed)` for keyword photos (React `<img>`, no CORS); bundled assets for hero items.
- Extensible: add `ShoppingProduct`, `GroceryItem`, `Stay`, `Showtime` with the same pattern; UI components stay generic.

## Reusable components
- `Img` (graceful fallback), `Screen/NavBar/BottomNav` (Shell), cart (store), `/pause` (Pause/Decide), `/continue` (reward).
- Discovery list, search box, filter chips, detail sheet — generalise from the Food screens for other verticals.

## Catalogue strategy
Structured local data so catalogues grow without UI rewrites. Food already has enough depth to feel alive;
replicate density per vertical (multiple brands, products, variants, offers) before marking a vertical "done".

## Future expansion plan
1. Generalise the Food discovery/detail/cart components into vertical-agnostic primitives.
2. Add Shopping (product detail w/ variants, images, reviews) → Grocery (pack sizes, slots) → Travel (dates, rooms/fares) → Movies (seats/showtimes).
3. Per-category cart semantics all funnel into the same Pause/Decide.
