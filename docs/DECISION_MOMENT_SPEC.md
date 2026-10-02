# The Decision Moment — Spec

The single most important screen in Project Future. It turns an ordinary
checkout into a conscious choice by making the user's future **visible** at the
exact moment of spending.

## Flow

```
Browse → Cart → Checkout → Place order → PAUSE (the decision moment)
PAUSE: Understand why → See craving vs. future → Choose → Enjoy it OR Build my future
```

Route: `webapp/src/routes/pause.tsx`. Search params: `amt`, `from`, `cat`
(category, default "Food"; passed by checkout).

## Steps

1. **Understand why you want it** (`feel`) — name the trigger (hungry, bored,
   great deal, genuinely want it…). This is the "understand" in the product
   promise, and it's recorded as the decision's `trigger`.
2. **The decision** (`decide`) — the heart of it:
   - The craving: category + amount, large.
   - "Your future is waiting." + "You could put ₹X toward it instead."
   - **All dreams shown** with cover image/photo, name, current/target, % —
     the active one highlighted. This is opportunity cost made tangible, not a
     guilt mechanism.
   - "One choice. Two directions." · "₹X — what do you choose?"
   - Two legitimate buttons:
     - **Enjoy it** — "Keep the order. You chose it consciously."
     - **Build my future** — "Put ₹X toward <active dream>."
3. **Choose the goal** (`choose`, only when Building) — one card per dream with
   cover, name, **before → after**, and "<dream> just got ₹X closer." Tapping a
   card redirects to that goal.
4. **Enjoy it** (`bought`) — "Enjoy it. You made the choice consciously." No
   shame. Order cleared.

## Language rules (agency-preserving)

- Never "you're wasting money", "don't buy this", or shaming copy.
- Both choices are legitimate; buying something you genuinely value is fine.
- We make opportunity cost visible, not obligatory. Final microcopy:
  "One choice. Two directions."

## What gets recorded

- **Redirected:** `recordDecision({category, amount, trigger, choice:"redirected", dreamId})`
  + `applySaving(amount, note, category)` → updates the goal, journey event
  (with category), streak, decision count, and the "Money You Kept" totals.
- **Enjoyed:** `recordDecision({category, amount, trigger, choice:"enjoyed"})`
  — logged for the user's own behavioural history; order simulated as complete.

## Design intent

Premium and calm: dream imagery, restrained motion, strong whitespace, elegant
type. Not a warning, not a countdown, not "Are you sure?". A personal moment of
reflection. Haptics where the platform supports them (future enhancement).
