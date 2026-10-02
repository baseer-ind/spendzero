# Explore Mode / Future Mode

Project Future serves three users, and must not assume everyone wants to stop
shopping.

- **User A — "I want the dopamine."** Loves browsing, deals, discovery. We say:
  *enjoy browsing, become aware of your behaviour.*
- **User B — "I want to save."** Wants goals, money kept, habit change.
- **User C — "I don't know I have a pattern."** Comes to "just look," and later
  sees: *42 minutes, 27 products, ₹8,460 explored, ₹0 bought — ₹8,460 stayed
  yours.*

## Modes

- **Explore** — the simulated marketplace (Food, Electronics, …). Browsing is
  allowed and pleasant. Attention is tracked and made visible.
- **Future** — goals, Money You Kept, Future Intelligence, progress.
- **Default** — the whole loop: Explore → Experience → Understand → Decide →
  Build.

These are currently expressed through navigation and the Consumption dashboard
rather than a hard mode switch; a future explicit toggle is optional.

## The pause nudge (`components/ExploreNudge.tsx`)

After a stretch of **active** browsing (default 120s), a calm card appears:
> "You've been exploring for about N minutes. No rush — enjoy it. Just making
> your attention visible."
> [Keep exploring] [Take a pause]

Design rules:
- Never forces an interruption; "Keep exploring" snoozes for another interval.
- "Take a pause" returns to Today (a calmer surface), not a dead end.
- Not an engagement-maximising pattern — the opposite. We surface attention; the
  user decides.

## Why this tension matters

Because we *want* users to be able to browse without buying, we must not tune the
marketplace purely for maximum engagement. The product's job is to make time and
money visible and give a genuine choice — consistent with the mission, not with
screen-time growth.
