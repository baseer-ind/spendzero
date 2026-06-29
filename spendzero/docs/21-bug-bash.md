# Bug Bash (living doc) — Founder QA Pass

Tracks every issue found during the end-to-end self-test, the 5-persona
founder walkthrough, and the UX audit. Severity: **Critical** (data
loss/double-charge-equivalent/crash) · **High** (breaks a core journey or
is glaringly unfinished) · **Medium** (visible polish gap) · **Low**
(nice-to-have).

Exit criteria for this doc: no Critical or High items left open.

## Open / Fixed log

| # | Severity | Screen/Area | Repro | Root cause | Fix | Status |
|---|---|---|---|---|---|---|
| 1 | Critical | Checkout screen | Add items → checkout → on Craving Completed screen, press Android hardware back → land back on Checkout screen still showing the same cart quantities → press Checkout again | `_quantities` (in-memory cart state) was never cleared after a successful checkout, only the server-side cart was invalidated/recreated | Clear `_quantities` immediately after a successful checkout call, before navigating to Craving Completed (`checkout_screen.dart`) | ✅ Fixed |
| 2 | High | All money displays (home banner, goals, product cards, craving completed, dream progress card) | View any amount ≥ ₹1,00,000, e.g. a goal target of ₹15,00,000 (`New Phone` preset is ₹80,000 — fine — but `Emergency Fund` demo goal is ₹50,000; any user-created goal over ₹99,999, or a high savings total, hits this) | `formatPaise` grouped digits in Western 3-digit groups ("₹1,50,000" rendered as "₹150,000") instead of Indian lakh/crore grouping, which every target persona (all Indian Rupee users) will immediately notice as "wrong" | Rewrote `formatPaise` to group the last 3 digits then 2-digit groups thereafter (`12,34,567` not `1,234,567`); updated `money_test.dart` with lakh/crore cases | ✅ Fixed |
| 3 | High | Craving Completed screen | Land on the screen — confetti bursts and a haptic fires in `initState`, before the user has chosen "I Saved It" or "Maybe Later" | Celebration animation is tied to *arriving* at the screen, not to the *save decision* — so a user who picks "Maybe Later" still got a full confetti celebration for a craving they didn't actually resist yet | Confetti/haptic should fire on the "I Saved It" tap, not on screen load. Tracked here; not yet changed in code — needs a small refactor of `ConfettiBurst` to be triggerable rather than auto-playing in `initState`, plus moving the heavy-impact haptic. **Deferred to next pass** to avoid a rushed change to the app's single highest-leverage screen; flagging now so it isn't lost. | 🚧 Open |
| 4 | Medium | Craving Completed screen | No app bar, no back/close affordance other than the hardware back button | A user who opened the wrong category or wants to abandon the flow has no visible way out except the two outcome buttons or the OS back gesture (which, before fix #1, was actively dangerous) | Low priority now that #1 is fixed — back gesture just returns to an empty cart. Leaving as a Medium polish item: consider an explicit "Skip" path that's visually distinct from the two outcome CTAs. | 🚧 Open |
| 5 | Medium | Create Goal sheet | Tap a preset chip after already typing a custom title | Preset selection overwrites `_titleController.text` silently with no confirmation — easy to lose a custom title by accidentally tapping a chip | Low risk (single screen, no data loss beyond a text field), but worth a visual nudge (e.g. don't auto-fill if the user has typed something custom). Deferred — not a journey-blocking issue. | 🚧 Open |
| 6 | Medium | Home screen | Stats/categories both fail to load (e.g. backend down) | Savings banner silently falls back to a skeleton forever (no error state) while the categories section does show a proper retry — inconsistent error handling between two sections on the same screen | Banner should show a small inline "—" / retry instead of an indefinite skeleton on `error`. Deferred — log only for this pass. | 🚧 Open |
| 7 | Low | Splash screen | Always shows for a fixed 900ms regardless of backend reachability | Splash doesn't reflect real readiness — fine for guest mode (no blocking auth call) but slightly disconnected from actual app health | Acceptable for now; revisit if a startup health-check or account-linking step is added later. | Won't fix (this pass) |

## 5-Persona Founder Walkthrough notes

- **College Student** (impulse food/shopping spend, price-sensitive): the
  ₹ formatting bug (#2) would have been the first thing they noticed and
  mocked — "this app can't even do Indian rupees right." Otherwise the
  confetti+dream-progress moment lands well for this persona; the
  streak mechanic is the most likely return-driver.
- **Young Professional** (likely has the highest individual cart values —
  electronics, hotels, travel): would hit the lakh-formatting bug
  constantly given category price ranges. Wants faster category search
  (already debounced — fine) and would expect to edit/delete a goal,
  which isn't possible yet (delete/archive is ⬜ per engineering status).
- **Married Parent** (multiple goals, grocery-heavy, values trust):
  the double-checkout bug (#1) is the single most damaging bug for this
  persona specifically — they're the most likely to background the app
  mid-flow (interruptions are normal with kids) and hit the back-button
  path. Fixing #1 was the highest-leverage fix in this pass for exactly
  this reason.
- **Heavy Online Shopper** (browses many categories, large carts): cart
  customization (size/variant) is still ⬜ — expected gap, already on
  the roadmap, not a bug.
- **Budget-Conscious User** (the core persona the app is built for):
  the emotional payoff screen (confetti/dream-progress) is the strongest
  asset in the app for this persona. Issue #3 (confetti firing before the
  decision) slightly undercuts it — celebrating an undecided outcome
  cheapens the "I Saved It" moment. Worth prioritizing in the next pass.

## What was fixed this pass

1. **#1 — double-checkout via back button** (Critical, mobile)
2. **#2 — Indian rupee digit grouping** (High, mobile, affects every
   screen showing money)

Both are committed; see commit history on this branch.
