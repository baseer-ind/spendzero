# Product Photo Specification

Exact requirements for every product photograph added to Project Future. The
stores and products are **fictional** — the photo must look real without imitating
any real brand.

## Global rules (all verticals)
- Realistic ecommerce product photography.
- **No** real brand logos, trademarks, or recognizable branded packaging.
- No watermarks. No promotional text overlays. Minimal/необязательный on-pack text
  only where a product genuinely needs it (and it must be generic/fictional).
- Clean studio environment; consistent soft lighting across the catalogue.
- Realistic materials and proportions; product clearly identifiable.
- Product centered, generous padding, single hero subject.
- Consistent visual language so the grid looks like one store.

## Format & size
- **Aspect ratio:** 4:3 (landscape) to match the card/detail frame (`object-cover`).
- **Resolution:** ~1200×900 source; export optimized.
- **Format:** `.webp` preferred (`.jpg` acceptable). Target < ~150 KB each.
- **Background:** warm-white / light neutral (#f5f5f7-ish) for a bright catalogue
  feel on the dark UI.
- **Filename:** exactly the `photoFilename` in `docs/PRODUCT_IMAGE_MANIFEST.md`
  (e.g. `electronics/soniq-airbuds-pro.webp`). Gallery: `<id>_2.webp`, `<id>_3.webp`.

## Per-vertical guidance
- **Electronics:** realistic device materials and proportions, clean studio, front
  three-quarter view (earbuds, phones, watches, headphones, speakers, laptops…).
- **Shopping / Fashion:** garment/product on a neutral background or simple flat-lay;
  Indian context welcome (kurta, kurti, saree); clean ecommerce presentation.
- **Food:** appetising, realistic Indian food photography — biryani looks like
  biryani, dosa like dosa, haleem like haleem. Natural plating, top or 45° angle.
- **Grocery:** generic fictional packaging (no real-brand imitation), realistic
  Indian grocery context (atta, rice, milk carton, dal, tea).
- **Beauty:** clean bottle/tube/compact product shots, soft lighting.
- **Home:** cookware, décor, appliances, bedding — realistic materials, simple set.
- **Travel/Entertainment (P2):** representative imagery (destination/flight/hotel,
  cinema/event) — these are experiences, so evocative rather than product-on-white.

## Example generation prompt
> Studio product photograph of a generic [PRODUCT], isolated on a clean warm-white
> background, ecommerce product photography, realistic materials, soft studio
> lighting, front three-quarter view, centered, no logos, no text, no watermark,
> 4:3.

## Acceptance
An image passes only if a normal Indian shopper would read it as a real product
photo, it has no real-brand marks, and it matches the catalogue's visual language.
Vector illustration / emoji / gradient does **not** count as a photograph.
