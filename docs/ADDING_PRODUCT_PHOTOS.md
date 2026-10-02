# Adding Product Photos — Drop-in Guide

Goal: **drop files in → run audit → done.** No code changes to catalogues.

## 1. Where to place a file
```
webapp/public/products/<vertical>/<productId>.webp
```
Verticals (folders): `electronics` · `shopping` · `food` · `grocery` · `beauty` ·
`home` · `travel` · `entertainment`.

Use the **exact** `photoFilename` from `docs/PRODUCT_IMAGE_MANIFEST.md`.
Example: `webapp/public/products/electronics/soniq-airbuds-pro.webp`.

## 2. Exact filename / how a product maps to it
Each product's id and target path are listed in `docs/PRODUCT_IMAGE_MANIFEST.md`
(and `product-image-manifest.json`). The filename base **must equal the productId**.
`.webp` is preferred; `.jpg/.png/.avif` also resolve.

## 3. Gallery images (optional, product detail)
Add `<productId>_2.webp`, `<productId>_3.webp` in the same folder. The detail page
shows them as a swipeable gallery automatically.

## 4. Turn the photo on
Add the productId to `HAS_PHOTO` in `webapp/src/lib/productImages.ts`:
```ts
export const HAS_PHOTO = new Set<string>([
  "soniq-airbuds-pro",
  "voltedge-x7",
  // …
]);
```
When an id is in `HAS_PHOTO`, the photo is used everywhere (grid, search, detail,
wishlist, cart). If the file is missing, it is reported by the audit and the app
falls back to the illustration (never a broken image).

> Tip: the id must be in `HAS_PHOTO` **and** the file must exist. The audit catches
> either being wrong.

## 5. Run the image audit
```
cd webapp
node scripts/image-audit.mjs
```
It prints, per vertical, `real photos / total`, lists any MISSING files, and exits
non-zero if an id in `HAS_PHOTO` has no file. It never counts illustrations as photos.

## 6. Verify it appears everywhere
Build and open the app (or use the live deploy):
```
cd webapp && NITRO_PRESET=node-server npm run build
HOST=127.0.0.1 PORT=3000 node .output/server/index.mjs
```
Check the product shows the photo in: **category grid**, **search results**,
**product detail** (+ gallery), **wishlist** (after ♥), and **cart** (after add).
Because every surface resolves through `photoSrc`/`ProductImage`, a product can
never show a photo on the card and a different illustration on the detail.

## Regenerating the manifest
If you add/rename catalogue products, re-run:
```
cd webapp && node scripts/gen-manifest.mjs
```
This rewrites `docs/PRODUCT_IMAGE_MANIFEST.md` and `product-image-manifest.json`
from the live catalogue.
