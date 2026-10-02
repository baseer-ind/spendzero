# India-First Product Guidelines

Project Future is built for India first. This is not a localisation layer on a
global app — the catalogue, money, places, journeys and language are Indian by
default. These rules apply to every screen, string and data file.

## Non-negotiables

1. **Currency** — Always `₹` with Indian digit grouping via `formatINR()`
   (e.g. `₹1,50,000`, not `₹1,50,000.00`, never `$`). No decimals on rupee
   amounts in the UI.
2. **Fictional brands only** — No real trademarks, logos, or brand UI. Food
   apps are ZaikaGo / KhanaNow / MealKart; restaurants and dishes are our own
   fictional creations. Never imitate a real company's look.
3. **Virtual savings** — The money "redirected" is a virtual tally. We never
   hold money, move money, or act like a bank. Checkout is a *simulation*: no
   real payment is taken and no card details are stored or requested.
4. **No dark patterns, no invented science** — No fake urgency, no guilt. No
   invented dopamine/neuroscience statistics.

## Defaults

- **City:** Hyderabad (`DEFAULT_CITY`). Other cities: Bengaluru, Mumbai, Delhi,
  Chennai, Pune, Kolkata (`CITIES`).
- **Addresses:** Flat / House no / Building → Area / Street / Sector → Landmark
  → City → State → **PIN Code** (6 digits). Mobile is a 10-digit number.
- **Payments (simulated):** UPI (default), Credit/Debit Card (Visa/RuPay/
  Mastercard), Net Banking, Cash on Delivery.
- **Taxes:** show GST (5% on restaurant food) in the bill for realism.

## Language

| Use | Not |
|-----|-----|
| PIN Code | Zip code |
| Mobile number | Cell / phone |
| Order food | Takeout |
| Veg / Non-veg / Egg | Vegetarian toggle only |
| For two | Per person |
| UPI | Venmo / Apple Pay |

Hinglish is welcome where natural (e.g. a tagline "Ghar jaisa, tez delivery"),
but never forced.

## Dream categories (India-first)

Emergency Fund, Parents' Vacation, New Bike, Wedding, Child's Education, Gold,
Own Home, Start a Business, India Trip, Personal dream. Default target amounts
are realistic Indian figures (see `FirstGoal.tsx`).

## Food catalogue

Indian cuisines first: Biryani, Hyderabadi, South Indian, North Indian, Street
Food, Thali, Desserts, Beverages, Chinese (desi-Chinese). Dishes carry a
`diet` marker (`veg` green, `egg` amber, `nonveg` red) — the standard Indian
food-labelling convention. Restaurants carry `area`, `city`, `costForTwo`,
`vegOnly`, and Indian offers ("₹100 OFF above ₹499 · UPI", "Bank offer: 10% on
UPI").

## When adding new content

Audit the data, not just the labels. A new vertical (Travel, Shopping, Grocery,
Entertainment) ships with Indian brands, Indian prices, Indian context — or it
does not ship.
