# Design System

## Principles

1. Familiar interaction patterns, original visual execution
   (`legal-and-branding-safety.md`).
2. Tone is celebratory, never punitive — no red "you spent too much"
   framing anywhere; savings moments use warm, rewarding color and
   motion.
3. India-first: Devanagari + Latin support, generous touch targets,
   low-bandwidth image sizes.

## Core tokens (app shell)

- **Primary**: `#1E8E6B` (SpendZero Green — calm, "in control" signal,
  distinct from any real fintech/commerce brand's primary).
- **Secondary**: `#FFB23F` (Warm Amber — celebration/goal-progress).
- **Craving-completed accent**: `#FF6F61` (Coral, used only on the
  Craving Completed screen's confetti/highlight, never elsewhere, so it
  stays a distinct "moment" color).
- **Neutral scale**: `#0E0E12` → `#FFFFFF`, 10-step grey ramp.
- Light mode default, dark mode follows system.

## Typography

Original/open variable font, Latin + Devanagari weights
(Regular/Medium/SemiBold/Bold). Type scale: Display 28/34, Title 20/26,
Body 15/22, Caption 12/16.

## Per-brand theming

Same model as the catalog spec: each fictional `brand` carries its own
contrast-checked accent pair applied within Category Home → Detail →
Checkout. Shell chrome (bottom nav, savings ticker, goal card) always
stays in the SpendZero app palette.

## Motion

- Standard easing `Curves.easeOutCubic`, 200–300ms.
- Craving Completed screen: an original celebratory burst (coral/amber
  particles) distinct from the tracking-stage motion — this is the
  emotional payoff moment and gets the most polish.
- "Maybe Later" dismiss uses a soft fade, deliberately less celebratory
  than "I Saved It" confirm (subtle positive reinforcement asymmetry
  without ever feeling like punishment).

## Accessibility

WCAG AA contrast minimum across all brand themes; 44x44dp minimum touch
targets; scalable text to 130%; screen-reader labels on all icon-only
controls, especially the "I Saved It"/"Maybe Later" buttons (must read as
full sentences, not just icons).

## Iconography

Single original icon set, 24dp grid, 1.5px stroke. Category icons (🍔🛒✈️
etc. in the spec) are placeholders only — shipped app uses original
glyphs.
