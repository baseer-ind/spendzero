# Image Launch Audit

## The problem (before)
Core catalogue imagery depended on an external host (LoremFlickr). That is
unreliable, breaks offline, can fail CORS/CDN, and is unacceptable for launch.

## The fix (now)
Catalogue imagery is generated **locally** as deterministic inline SVG art tiles
(`webapp/src/lib/localImage.ts`): a seeded gradient + a context glyph + optional
label. `kwImg()` (catalog) and `photo()` (images) now return these data-URI SVGs,
so **every** food/electronics/cover image is:
- **offline** — no network, no third-party host;
- **never broken** — no broken-image icon ever;
- **instant & tiny** (~1KB each);
- **consistent & context-appropriate** (biryani→🍛, earbuds→🎧, wedding→💍, …).

Verified by `smoke.mjs`: the first catalogue `<img>` src is a `data:` URI.

## Image inventory
| Area | Source | Status |
|---|---|---|
| Food restaurants & dishes | local SVG art (`kwImg`) | ✅ reliable |
| Electronics products & gallery | local SVG art (`photo`) | ✅ reliable |
| Dream covers (curated/search) | local SVG art | ✅ reliable |
| Dream cover (user upload/camera) | on-device data URL (cropped) | ✅ reliable |
| Profile photo | user data URL / initials fallback | ✅ reliable |
| Home hero, future hero, journey bg | **bundled** JPGs in `src/assets` | ✅ bundled |
| Any image load failure | `Img` component → gradient + emoji | ✅ fallback |

## Fallback states (every `Img`)
- loading: native lazy-load;
- success: the image;
- failure: `onError` → seeded gradient + category emoji (no broken icon);
- empty src: same fallback.

## Performance
- SVG tiles are tiny and inline (no extra requests).
- Below-the-fold images use `loading="lazy"`.
- Bundled hero JPGs are the only sizable assets; acceptable for the few hero
  screens.

## Future upgrade path (non-blocking)
Photographic assets can replace the generated art per id/category by mapping ids
→ bundled files; because everything renders through `Img`, swapping a URL needs
no component change. Licensing must be cleared before shipping real photos — do
not hotlink unlicensed images. For launch, reliable generated art is the chosen,
documented strategy (reliability over photoreal, per the brief).
