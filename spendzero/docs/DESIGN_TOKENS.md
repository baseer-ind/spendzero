# Project Future — Design Tokens (Lovable Visual Reference)

Source of truth for the visual redesign: a Lovable React/Tailwind prototype ("Future_You")
uploaded by the founder, explicitly scoped as **visual reference only** — colors, typography,
spacing, motion, and component look. Business logic, routing, offline storage, the dream/
achievement systems, and the fictional-app catalogues are untouched and come entirely from the
existing Flutter codebase.

Theme: **"Midnight + Champagne Gold."** The reference design is dark-only (no separate light
variant in its CSS), so `mobile/lib/core/theme/app_theme.dart` is intentionally dark-only too —
`AppTheme.light` and `AppTheme.dark` both resolve to the same midnight `ThemeData`, and
`MaterialApp.router` pins `themeMode: ThemeMode.dark`.

## Colors

| Token | Hex | Use |
|---|---|---|
| `background` | `#0A0B0E` | App background |
| `surface` | `#111318` | Cards, sheets, nav bar |
| `surface-elevated` | `#1A1D24` | Elevated cards, inputs, chips |
| `foreground` | `#F7F6F2` | Primary text |
| `muted-foreground` | `#9A9CA5` | Secondary text |
| `gold` (primary) | `#D8B36A` | CTAs, redirected-value accents, victories |
| `gold-soft` | `#E8CC94` | Gradient/shimmer highlight |
| `future` (secondary) | `#4DA3FF` | Progress, "My Future" accent |
| `destructive` | `#E2553D` | Errors only |
| `border` | white @ 8% opacity | Card/input borders |

Radius scale (`--radius: 1.25rem` = 20px base): sm 16, md 18, lg 20, xl 24, 2xl 28, 3xl 32.
Mapped in Flutter as: buttons/inputs/chips 18, cards 24, bottom sheets 28 (top corners).

## Typography

- **Display** (`font-display`): **Fraunces** (variable, serif) — headlines, hero copy, "letter
  from your future self" moments. Letter-spacing -0.02em equivalent (~-0.2 to -0.8 across sizes
  in the Flutter `TextTheme`).
- **Sans** (`font-sans`): **Inter** (variable) — body text, labels, buttons, nav.
- Both fonts bundled as local assets (`mobile/assets/fonts/Fraunces-Variable.ttf`,
  `Inter-Variable.ttf`) rather than via the `google_fonts` package, which fetches over network by
  default — bundling keeps the app's offline-first guarantee intact. Declared as font families
  `Fraunces` / `Inter` in `pubspec.yaml`.

## Motion vocabulary (from `styles.css` keyframes — reference for Flutter equivalents)

- `shimmer` / `text-shimmer-gold` — animated gold gradient sweep across text (used on key
  headline words, e.g. "Two futures."). Flutter: `ShaderMask` + `AnimationController` loop.
- `float-petal` — slow-falling, rotating petal particles, used as ambient background texture on
  emotionally-charged screens (craving-completed / "Continue My Journey"). Flutter: a handful of
  `AnimatedBuilder`-driven small circles with looping vertical+rotation tweens.
- `ring-grow` — progress-ring stroke draws in on entry (`stroke-dashoffset` animation). Flutter:
  `CustomPainter` arc with an `AnimationController`-driven sweep angle.
- `rise` — fade+translateY(14px) entrance, 0.9s, `cubic-bezier(.2,.7,.2,1)`. Flutter: matches the
  existing `_PremiumPageTransitionsBuilder` fade+scale approach; apply the same curve to
  individual widget entrance animations (`AnimatedSlide`/`AnimatedOpacity`).
- `grain` — 5%-opacity SVG noise overlay via `mix-blend-mode: overlay`, subtle texture on hero
  imagery/cards. Flutter: low-priority, optional — a tiled noise `Image` with `BlendMode.overlay`
  in a `ColorFiltered`/`Opacity` stack if pursued.

## Screen-to-screen mapping (Lovable routes → existing Flutter screens)

| Lovable route | Flutter screen | Notes |
|---|---|---|
| `index.tsx` (Home) | `home/presentation/home_screen.dart` | Hero + category grid |
| `future.tsx` ("My Future") | `dashboard/presentation/dashboard_screen.dart` | Renamed/repositioned per Experience Blueprint; reference shows hero photo + "letter from your future self" framing, dream cards with progress |
| `journey.tsx` | `journey/presentation/journey_screen.dart` | Full chronological history |
| `cart.tsx` | `cart/presentation/cart_screen.dart` | "One Last Pause" framing |
| `continue.tsx` | `checkout/presentation/craving_completed_screen.dart` | Victory moment, petal motif |
| `profile.tsx` | `profile/presentation/profile_screen.dart` | |
| `restaurants.tsx` / `restaurant.tsx` | `food/presentation/food_home_screen.dart` / `restaurant_screen.dart` | Reference vertical example; pattern reusable for grocery/shopping/beauty/travel/movies |
| `order.tsx` | `checkout/presentation/checkout_screen.dart` | |

Lovable's fictional brand names in its mockups (if any) are reference-only and do not override
the existing fictional ecosystem (Zwigato/TomatoEats/YumRush, FlippingKart/Amazing/MegaMart,
TripNest/StayScape, MovieHub, etc.) already built into the Flutter app's seed data — those stay
exactly as they are, per the founder's explicit "keep the fictional ecosystems" instruction.

## Status

- [x] **Phase 1 — Theme foundation**: `app_theme.dart` rebuilt with the palette/typography above;
      fonts bundled offline; `flutter analyze`/`flutter test` clean.
- [ ] **Phase 2 — Core components**: bottom nav, cards, buttons, activity rows reskinned to match
      Lovable's `Shell.tsx` component patterns.
- [ ] **Phase 3 — Primary screens**: Home, My Future, Journey, Cart, Profile, craving-completed.
- [ ] **Phase 4 — Vertical screens**: Food, Grocery, Shopping, Beauty, Travel, Movies home/detail
      screens and fictional brand pages.
- [ ] **Phase 5 — CI verification**: confirm font assets bundle correctly in release builds;
      update `docs/AUTONOMOUS_STATUS.md` / `docs/MILESTONES.md`.
