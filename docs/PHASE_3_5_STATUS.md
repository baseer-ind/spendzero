# Phase 3.5 — India-First + Image Personalization — Status

Status: **Implemented & verified** (local build + Playwright smoke, all green).

## What shipped

### India-first content (data, not just labels)
- **Food catalogue rewritten** (`catalog.ts`): default city Hyderabad; fictional
  apps ZaikaGo / KhanaNow / MealKart; 6 Hyderabad restaurants with `area`,
  `city`, `costForTwo`, `vegOnly`; dishes carry a `diet` enum (veg/egg/nonveg)
  with the standard Indian label dot; India-style offers and ₹ pricing.
- **Food route components** updated to the new shape (diet dots, Pure veg tag,
  area/city on cards, cost-for-two).
- **Dream categories** are India-first: Emergency Fund, Parents' Vacation, New
  Bike, Wedding, Child's Education, Gold, Own Home, Start a Business, India Trip,
  Personal dream — with realistic ₹ targets.
- **Legacy Japanese-themed routes removed** (`/order`, `/restaurant`,
  `/restaurants`) and inbound links repointed to the Food vertical.

### Indian checkout (`/checkout`)
- Indian address form: Flat/Building → Area/Street/Sector → Landmark → City →
  State → PIN Code (6-digit), 10-digit mobile. Saved & reused (`state.address`).
- Payment simulation: UPI (default), Credit/Debit Card, Net Banking, Cash on
  Delivery — no real payment, no card capture.
- Bill shows item total, delivery fee (free over ₹199), GST (5%), total.
- "Place order" is the intervention point → routes into **Pause** (`from=checkout`).
- Cart CTA changed from "Take a moment" to "Proceed to checkout".

### Image personalization system
- `cover` added to `Dream`; `profilePhoto` + `address` added to app state, with
  `setDreamCover`, `setProfilePhoto`, `saveAddress`.
- `lib/images.ts`: curated India-first covers, a **replaceable
  ImageSearchProvider** (no frontend keys), `fileToDataURL`, and a canvas
  `cropToDataURL` (zoom/pan, downscaled JPEG).
- `components/ImagePicker.tsx`: Suggested / Search / Upload+Camera, with an
  on-device cropper. Profile mode is Upload/Camera + Remove only (never a stock
  face; initials fallback).
- Covers render in home hero, collection cards, and future dream cards; profile
  photo renders on the profile screen (initials fallback).
- Everything persists via the existing localStorage store.

## Verification
- `NITRO_PRESET=node-server npm run build` → clean.
- `node smoke.mjs` → full journey (story → register → assessment → profile →
  India-first goal with cover → food (ZaikaGo → Deccan Zaika → biryani) → cart →
  Indian checkout → place order → pause → redirect / enjoy), plus image
  affordances, achievements, persistence, and all live routes 200. **Issues: none.**

## Docs
INDIA_FIRST_PRODUCT_GUIDELINES · IMAGE_SEARCH_ARCHITECTURE · USER_IMAGE_PRIVACY ·
IMAGE_SYSTEM_QA · INDIA_CATALOGUE_GUIDE · this file.

## Not in scope yet
Travel / Shopping / Grocery / Entertainment verticals (Indian catalogues to be
built with the same depth as Food). Server-backed image search provider (the
frontend contract is ready for it).
