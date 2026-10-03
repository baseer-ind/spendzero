# SELFly onboarding imagery

The 3-screen intro (`src/components/onboarding/Story.tsx`) loads a cinematic
background for each screen from this folder. If a file is absent or fails to
load, the screen automatically falls back to the on-brand generated field
(`scenicArt` — Midnight → Charcoal with a champagne glow and a rising path),
so the app never shows a broken image and no code change is needed to add a
real photo later.

## Drop-in slots (filename → screen)

| File                    | Screen                 | Feeling / subject |
|-------------------------|------------------------|-------------------|
| `selfly-intro-01.webp`  | 1 · The idea           | A single calm figure (gender-neutral, from behind or distant) at the start of a path / looking toward a bright horizon. "Small choices today." |
| `selfly-intro-02.webp`  | 2 · The problem        | A quiet pause moment — hands near a phone, or a still cafe/street scene — unhurried, reflective. "A moment to pause and decide." |
| `selfly-intro-03.webp`  | 3 · The transformation | An open, aspirational vista — mountains, a rising path, a horizon at golden hour. "A bigger, brighter tomorrow." |

## Requirements

- **Format:** `.webp`, portrait-friendly, min **1080×1920**, optimised < 300 KB each.
- **Palette:** warm neutrals + Midnight (#0F1419) + champagne (#C9A988). Golden-hour
  light. Must read well under a dark bottom gradient (text sits over the lower third).
- **Mood:** cinematic, minimal, calm, aspirational, gender-neutral.
- **Allowed subjects:** mountains, paths, horizons, open skies, soft interior light,
  a distant/anonymous figure walking toward something.
- **Not allowed:** piggy banks, coins, rupee/₹ graphics, stock "fintech" imagery,
  recognisable faces, any Japan/Kyoto/Tokyo theme, brand logos, copyrighted stills.
- **Sourcing:** do NOT scrape the web or use random internet / copyrighted images.
  Use licensed/owned photography or an approved image-generation tool only.
