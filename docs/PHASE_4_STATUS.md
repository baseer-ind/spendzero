# Phase 4 — Decision Moment + Future Intelligence — Status

Status: **Implemented & verified** (node-server build clean; Playwright smoke all
green, including multi-dream routing).

## Part 1 — Dreams at the decision moment
- `pause.tsx` rebuilt into the premium decision moment: understand-why → craving
  vs. future (all dreams with cover/progress, active highlighted) → choose goal
  (before → after) → Enjoy it / Build my future.
- Checkout "Place order" passes `cat` and enters the decision at the moment of
  commitment.
- Agency-preserving wording: "One choice. Two directions."; "Enjoy it — keep the
  order, you chose it consciously"; "Build my future — put ₹X toward <dream>".
  No guilt, no shame, no countdown. (Adopted the user's improved copy over
  "Skip your dream for this craving".)
- Goal choice cards show **Before → After** and "<dream> just got ₹X closer."
- Continue screen: "Your craving ends here. Your future continues."

## Part 2 — Decision logging + Money You Kept
- Store: `Decision` log (category, amount, trigger, choice, dreamId, ts) and
  `category` on `SaveEvent`; `keptByCategory` derived.
- `/savings` "Money You Kept": redirected total, conscious-decision count,
  category breakdown, and explicit honesty framing (virtual tally, not a bank).
- Architecture note for the future "Move to savings" (regulated partner) with no
  fake banking and no real credentials.

## Part 3 — Future Intelligence
- `learn.ts`: 12 categories, lessons (Insight → Example → Question → Research →
  Try it), and a verified research library.
- `/learn` hub + `/learn/$lessonId` detail.
- Lessons shipped: **The Discount Trap** (Krishna 2002, Chen 1998, Bayer 2013)
  and **The Scarcity Clock** (Wu 2020). Remaining categories: "Coming soon".
- Claims policy enforced; the ₹100→₹70 example is an illustration (a question),
  not attributed to a study.
- Entry points: home card, profile rows (Money you kept, Future Intelligence).

## Verification
`node smoke.mjs` → full India-first journey + decision moment + build/enjoy paths
+ multiple-dream routing + Money You Kept + Future Intelligence lesson +
persistence + all routes 200. **Issues: none.**

## Docs
DECISION_MOMENT_SPEC · FUTURE_INTELLIGENCE · FUTURE_INTELLIGENCE_RESEARCH ·
REAL_SAVINGS_MODEL · PHASE_4_QA · this file.

## Not in scope (next)
Additional marketplace verticals (Travel/Shopping/Grocery/Entertainment);
authoring lessons for the remaining categories; behaviour-personalised lesson
surfacing; the real-money "Move to savings" partner integration.
