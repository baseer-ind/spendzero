# SELFly — Launch image brief (34 product heroes + 8 category heroes)

This is the single source of truth for the launch photographic assets. The app
**cannot generate photographs in the build environment** (no image tool, locked
network), so these are produced externally with ONE consistent direction and
dropped into the repo. Until an asset exists, the app shows an on-brand generated
backdrop (never a broken image, never a false claim of real photography).

## Shared art direction (apply to ALL 42 assets)

- **Look:** premium e-commerce / editorial product photography. Clean, modern,
  realistic materials, natural soft shadows. Indian consumer context where noted.
- **Palette harmony:** neutral/warm backgrounds (stone, sand, off-white, soft
  champagne); must sit calmly beside SELFly's Midnight UI. Avoid loud primaries.
- **Lighting:** soft daylight / softbox. No harsh flash, no heavy vignettes.
- **Composition:** single clear hero subject, centered-ish, generous negative
  space. Product fills ~60–75% of frame.
- **Strictly NOT allowed:** real/!recognisable brand logos or branded packaging,
  watermarks, promotional text/price baked into the image, stock-photo people's
  faces as the subject, rupee/coin/piggy-bank motifs, AI artefacts/extra fingers.
- **Format:** `.webp`, quality ~82, **1200×1200** for products (square),
  **1200×1500** (4:5 portrait) for category heroes. Target < 180 KB each.

## File drop locations & wiring

- Product heroes → `public/products/<id>.webp`, then run
  `node scripts/register-local.mjs` (writes `src/lib/photoRegistry.generated.ts`).
  No component changes needed; `photoSrc()` resolves them automatically.
- Category heroes → `public/brand/categories/<id>.webp` (loaded directly by the
  Today tiles; fallback is automatic).

---

## A. Product heroes — 34 (P0 launch catalogue)

Each row: `id` → subject → per-asset prompt (append the shared direction).

### Electronics — 8  (clean studio, light seamless background)
1. `soniq-airbuds-pro` — Wireless ANC earbuds in an open charging case, matte white + champagne accents, studio.
2. `voltedge-x7` — 5G smartphone, front + 3/4 back, dark glass, no UI brand marks on screen (abstract wallpaper).
3. `pulse-fit-2` — Fitness smartwatch, square AMOLED, fabric/silicone strap, abstract watch face.
4. `aero-overear` — Over-ear headphones, matte charcoal with champagne ring, 3/4 view.
5. `quanta-powercell` — 20000mAh power bank, brushed metal, two USB ports, minimal.
6. `orbit-boom` — Bluetooth party speaker, cylindrical, fabric mesh, subtle LED ring off.
7. `nimbus-ultrabook` — 14-inch laptop, open at 110°, thin bezel, neutral desktop wallpaper, no logos.
8. `quanta-mon27` — 27-inch QHD monitor on a slim stand, abstract gradient wallpaper, no logos.

### Shopping (fashion) — 8  (flat-lay or ghost-mannequin, neutral backdrop, Indian context)
9. `sh-tshirt` — Cotton crew-neck t-shirt, solid heather, neatly folded or ghost-mannequin.
10. `sh-kurta` — Men's cotton kurta, earthy tone, ghost-mannequin, Indian ethnic.
11. `sh-jeans` — Slim-fit jeans, mid-indigo, folded flat-lay with subtle texture.
12. `sh-saree` — Georgette saree, draped detail showing fabric fall and border, warm tone.
13. `sh-kurti` — Women's A-line kurti, block-print/solid, ghost-mannequin.
14. `sh-shoes` — Running shoes, pair at 3/4, breathable knit, neutral colourway.
15. `sh-bag` — Tote handbag, vegan leather, structured, tan/olive.
16. `sh-backpack` — Everyday backpack, laptop-style, charcoal with champagne zip pulls.

### Food — 10  (realistic Indian food photography, appetising, top-down or 3/4, rustic/neutral surface)
17. `dz-chk-bir` — Chicken dum biryani in a copper handi/plate, saffron rice, garnish.
18. `dz-haleem` — Haleem in a bowl, fried onions, lemon wedge, mint, Hyderabadi style.
19. `dz-mut-bir` — Mutton dum biryani, long-grain rice, tender mutton piece visible.
20. `ck-butter-chk` — Butter chicken, creamy tomato gravy, cream swirl, coriander.
21. `ck-paneer` — Paneer tikka masala, charred paneer cubes, rich gravy.
22. `ug-dosa` — Masala dosa, crisp golden, with sambar and two chutneys.
23. `ug-thali` — South Indian meals thali on banana leaf / steel plate, multiple bowls.
24. `mt-vadapav` — Vada pav, green chutney, fried chilli on the side, street-food feel.
25. `mt-pavbhaji` — Pav bhaji, buttery bhaji, toasted pav, onion + lemon.
26. `ar-gongura` — Gongura chicken, Andhra style, deep red, curry leaves.

### Grocery — 8  (clean generic packaging, NO real brands, neutral/white)
27. `gr-banana` — Bunch of ripe bananas, fresh, slight gradient backdrop.
28. `gr-milk` — Milk in a plain/unbranded carton or pouch + glass of milk.
29. `gr-atta` — Whole-wheat atta in a plain kraft/clear bag, a little flour spilled.
30. `gr-rice` — Basmati rice in a clear bag + a small heap, long grains visible.
31. `gr-noodles` — Instant noodles, generic unbranded pack + cooked bowl.
32. `gr-tea` — Assam loose tea leaves + a cup of chai, plain tin, no brand.
33. `gr-tomato` — Fresh tomatoes, a few with stalks, water droplets.
34. `gr-paneer` — Block of fresh paneer, cubed corner, plain surface.

---

## B. Category heroes — 8  (4:5 portrait, editorial, calm)

Drop at `public/brand/categories/<id>.webp`.

- `food` — overhead spread of Indian dishes, warm, inviting (not one dish).
- `electronics` — a tidy flat-lay of gadgets on neutral desk, soft light.
- `grocery` — fresh produce + staples basket, bright and clean.
- `shopping` — folded apparel / fashion flat-lay, neutral tones.
- `travel` — aspirational Indian/Asian destination at golden hour (coast, hills).
- `entertainment` — cinema seats / concert lights, moody but premium.
- `beauty` — skincare/grooming flat-lay, minimal, warm neutral.
- `home` — cosy home corner / textiles + decor, warm light.

---

## How to generate (recommended)

Generate in a capable image model with the shared direction prepended to each
per-asset prompt, export `.webp` at the sizes above, name exactly as the `id`,
drop into the paths above, run `register-local.mjs`, rebuild. Review once for any
accidental brand logos/text before committing.
