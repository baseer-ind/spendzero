# Asset Strategy — Project Future

Goal: the sandbox must look like real consumer apps — never coloured boxes with placeholder icons.

## Current approach
- **Bundled hero assets** (`src/assets/*.jpg`, from the Lovable design): used for marquee items
  (Sakura Omakase, omakase/nigiri/sushi dishes, burger, grocery hero). These are packaged → always load,
  offline-safe.
- **Keyword photos** via `kwImg(keyword, seed)` → `loremflickr` URLs, rendered with React `<img>` (no CORS
  issue in the web app). Stable per seed so an item keeps the same photo. Used for the long tail.
- **Graceful fallback** (`src/components/Img.tsx`): on load error, a tasteful seeded gradient + emoji — never
  a broken-image icon.

## Known limitation (honest)
`loremflickr` is a free keyword service: relevance is good but not curated, and reliability varies. In this
build it's acceptable; for a **production/App-Store-grade** release it should be replaced with:

## Production plan (recommended before store launch)
1. **Package a curated, licensed image set** per vertical (CC0/royalty-free, e.g. from an approved provider),
   downloaded into `src/assets/catalog/<vertical>/` and referenced by id in `catalog.ts`. This makes the app
   fully offline, fast, and visually consistent — no external dependency, no broken/slow images, no repeats.
2. Generate responsive sizes (e.g. 400/800 widths) at build.
3. Keep `Img` fallback for safety.

> Downloading/curating that set needs either outbound image access (blocked in this sandbox) or a provided
> asset pack. Flagged as the main pre-launch asset task.

## Rules
- No real brand logos/marks. Fictional identities only.
- Avoid obvious repeats within a screen (vary `seed`).
- Every listing/detail has an image or a tasteful fallback — never an empty rectangle.
