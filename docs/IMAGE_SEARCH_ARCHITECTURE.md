# Image Search Architecture

How dream covers and profile photos are sourced, in `webapp/src/lib/images.ts`
and `webapp/src/components/ImagePicker.tsx`.

## Sources (in the picker)

1. **Suggested (curated)** — India-first keyworded photos per goal theme
   (`COVER_PRESETS`, `curatedCovers()`). Used as the default when a user picks a
   goal category; seeded by the goal's `kw`.
2. **Search** — free-text query → images via `searchImages()`.
3. **Upload / Camera** — gallery file or camera capture → on-device crop →
   `data:` URL. See `USER_IMAGE_PRIVACY.md`.

## The ImageSearchProvider contract (replaceable, no frontend keys)

```ts
export type ImageSearchProvider = (query: string, count?: number) => Promise<string[]>;
```

- The **default provider** (`defaultImageSearch`) maps a query to keyworded
  photo URLs. It needs no API key and works offline-of-backend.
- To use a real image API (Unsplash, Pexels, Google, etc.), **replace only this
  provider** via `setImageSearchProvider()`. The replacement must call *your own
  backend endpoint* that holds the API key server-side and returns an array of
  image URLs. **No provider key ever lives in the frontend bundle.**
- No component imports a provider or a key — they call `searchImages()` only. So
  swapping the backend is a one-file change with zero UI churn.

## Why URLs (not proxied binaries) for remote images

React `<img>` renders any cross-origin URL with no CORS problem, so curated and
searched images are stored as plain URLs. We do **not** run them through the
canvas cropper (a cross-origin draw would taint the canvas and `toDataURL()`
would throw). They are already sized to the frame. Only user uploads — which are
same-origin `data:` URLs — go through the canvas crop.

## Rendering & fallback

Covers render in the home hero (`index.tsx`), the collection cards, and the
`future.tsx` dream cards. Where a cover is absent we fall back to the goal emoji
or a bundled asset. The shared `Img` component degrades gracefully to a seeded
gradient + emoji if a URL fails to load, so a dead image never breaks a screen.

## Storage

A chosen cover is stored on the `Dream` (`cover?: string`) and the profile photo
on app state (`profilePhoto`). Both persist through the normal localStorage
store, so they survive reload, restart and offline. See `USER_IMAGE_PRIVACY.md`
for the size discipline that keeps `data:` URLs within quota.
