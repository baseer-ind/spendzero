# Product photography assets

Drop real, launch-grade product photos here. The app uses them automatically and
falls back to generated vector art when a photo is absent — so you can add photos
incrementally without touching the catalogue code.

## How to add a photo
1. Save the image as `products/<folder>/<productId>.jpg`
   - Optional extra gallery images: `<productId>_2.jpg`, `<productId>_3.jpg`
2. Add the `productId` to `HAS_PHOTO` in `webapp/src/lib/productImages.ts`.

## Folders (one per vertical)
`electronics` · `shopping` · `grocery` · `beauty` · `home` · `food` ·
`travel` · `entertainment`

## Product ids
- Electronics: see `webapp/src/lib/electronics.ts` (e.g. `soniq-airbuds-pro`).
- Grocery/Shopping/Beauty/Home/Travel/Entertainment: see `webapp/src/lib/market.ts`
  (e.g. `gr-milk`, `sh-jeans`, `be-perfume`).
- Food: see `webapp/src/lib/catalog.ts`.

## Asset guidance (fictional stores — DO NOT use real brands)
- Generic, logo-free, text-free ecommerce product photography.
- Clean, consistent background (warm-white / light grey), soft studio lighting,
  front three-quarter view, realistic materials.
- Square or 4:3, ~800–1200px, optimised JPG (< ~150 KB each).
- Licence must permit this commercial use (e.g. Pexels/Unsplash where the
  individual asset's licence allows it, or generated studio photography).

### Example generation prompt (per product)
> Studio product photograph of a generic black 25L everyday backpack, isolated on
> a clean warm-white background, ecommerce product photography, realistic
> materials, soft studio lighting, front three-quarter view, no logos, no text,
> no watermark.

Nothing here should imply affiliation with a real brand or merchant.
