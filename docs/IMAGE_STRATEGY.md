# Image Strategy (simplified for V1)

Project Future is a **behavioural simulation**, not a 99-product ecommerce
marketplace. We make browsing *feel* real — we don't hand-maintain a photo for
every database row. Imagery is a data attribute resolved at render time (the model
real catalogues/feeds use: product → image reference → provider/CDN).

## Tiers
1. **Launch visual catalogue (34 products)** — MUST be photographic for V1:
   Electronics 8 · Shopping 8 · Food 10 · Grocery 8. Flagged in
   `src/lib/productImages.ts` (`LAUNCH_IDS`) and starred in the manifest.
2. **Long tail (65)** — available in the catalogue but uses the generated vector
   illustration; not prominent on first screens.
3. **Future** — real merchant/product feeds supply image URLs via a CDN; the same
   resolver consumes them with no UI change.

## Data model (`ProductMedia`)
```ts
{ type: "local" | "remote" | "illustration", src?, gallery?, credit?, source?, sourceId?, licenseNote? }
```
- `resolveMedia()` / `photoSrc()` return a real photo when one is **registered**
  (`PHOTO_REGISTRY`), else the illustration. The renderer (`ProductImage`) is
  source-agnostic and always falls back gracefully — no broken images.
- No scraping, no arbitrary image URLs, no API keys in the frontend.

## Approved photographic sources
- **Local files** (committed) — fully stable; best for V1. Drop into
  `public/products/<folder>/<id>.webp` and register, or see
  `docs/ADDING_PRODUCT_PHOTOS.md`.
- **Pexels** (commercial use allowed; its API asks for a Pexels link/credit) —
  supported via `PHOTO_REGISTRY` entries `{ type:"remote", src, source:"pexels",
  credit, licenseNote }`. Attribution is stored and must be displayed where used.
- **Unsplash** is *not* recommended for this use now: its API requires hotlinking
  and specific attribution — unnecessary complexity for V1.

## Naming simplification
Fake manufacturer identities were removed where they added nothing. Electronics are
now generic ("Wireless ANC Earbuds", "5G Smartphone (8GB/128GB)", "Fitness
Smartwatch"…), so a representative photo is honest — we're not claiming a specific
real product. **Stores stay fictional** (TechBazaar, StyleBazaar, FreshKart…).

## Audit
`node scripts/image-audit.mjs` reports the **launch catalogue** (X/8 per vertical)
separately from the long tail, and never counts illustration as a photograph.

## What's required to populate the 34
Create 34 photographs per `docs/PRODUCT_PHOTO_SPEC.md`, name them by the manifest's
`photoFilename`, drop into the folders (or register Pexels URLs), run the audit.
That alone makes the first impression feel like a real shopping app.
