# Consumption Intelligence

Project Future's differentiator: a layer between discovery and consumption that
makes **attention** and **money** visible together — not just "did you buy?".

Code: `webapp/src/lib/tracking.tsx` (attention capture), engagement state in
`webapp/src/lib/store.tsx`, dashboard `webapp/src/routes/consumption.tsx`.

## What we measure (inside Project Future only)

| Metric | Source |
|--------|--------|
| Active browsing time (total, per vertical, per fictional app) | `useBrowseTracking()` |
| Products viewed (in lists) | `trackView()` |
| Products opened (detail) | `trackOpen()` |
| Cart additions & cart value explored | `trackCartExplore()` |
| Money spent | decisions with choice `enjoyed` |
| Money redirected | decisions with choice `redirected` |
| Conscious decisions | `decisionLog` length |

All aggregated per day (`engagement[YYYY-MM-DD]`), summarised for the last 7 days
by `weekSummary`.

## Active-time definition (important)

Time is counted **only** when BOTH are true:
- the tab is visible (`document.visibilityState === "visible"`), and
- the user interacted within the last 30s (idle timeout).

So background-tab time and idle time are **excluded**. "28 minutes exploring"
means 28 minutes of real attention. Accumulation flushes to the store every 5
active seconds and on navigation/unmount.

## The insight

The dashboard relates the two:
> "Your attention was bigger than your spending. You explored ₹18,600 of
> products and spent ₹2,499. ₹6,800 went toward your future."

This is **awareness, not judgement** — stated explicitly in the UI. We never
compute "savings" from merely abandoning a page; redirected money comes only
from explicit Build-my-future decisions.

## Honesty boundaries

- We measure only activity **inside this app's simulated marketplace**.
- Awareness of time in *real* external apps (Amazon, Flipkart, …) is a separate,
  permission-based, OS-dependent capability — see `EXTERNAL_APP_USAGE_RESEARCH.md`.
  The dashboard says so; it does not imply we see other apps.

## Not optimised for engagement

The marketplace is deliberately not tuned to maximise screen time. The
`ExploreNudge` surfaces "you've been exploring ~N minutes — keep exploring / take
a pause" (see `EXPLORE_MODE.md`). Making attention visible is the point.
