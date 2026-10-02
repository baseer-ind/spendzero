# Project Future — Product Journey (Story-First Redesign)

> Re-evaluated from first principles. Existing screens/functionality are reusable,
> but the journey below is the source of truth. Build the story, then the screens.

## Mission (one sentence)
Help people notice the small, unnecessary cravings they'd otherwise spend on, pause
them, and watch that redirected money visibly build a future they actually want —
without ever shaming them for spending.

## The feeling we are engineering
> "I understand why I sometimes spend unnecessarily. I know what I'm building toward.
> And every time I choose not to waste money, I can actually see my future getting closer."

## Non-negotiable stance on spending
We distinguish three kinds of spending and only ever target the third:
1. **Essential** — rent, food, bills, health, transport, debt. Never touched, never judged.
2. **Meaningful discretionary** — a trip, a gift, a hobby, a good coffee that genuinely
   brings joy or aligns with the person's values. Encouraged, not cut.
3. **Unnecessary / impulsive** — purchases driven by a momentary craving that don't align
   with the person's own stated goals and are often regretted shortly after.

The product only ever asks the user to reconsider category 3, in their own judgement.
We never imply spending is bad. The enemy is *autopilot*, not *money*.

## The core loop
`Craving → Pause → Decide → Redirect → Save → Progress → Reward → Future`

| Step | What happens | Why (evidence — see BEHAVIOURAL_FOUNDATION.md) |
|------|--------------|------------------------------------------------|
| Craving | User opens the app in a moment of wanting, or browses the simulated store | Impulse is cue-driven (Rook 1987) |
| Pause | A deliberate, low-friction beat before "buying" | Delay/precommitment reduces impulse buying (Ariely & Wertenbroch 2002; Vohs & Faber 2007) |
| Decide | User labels the urge: essential / meaningful / unnecessary | Reflection reframes the choice; mental accounting (Thaler 1999) |
| Redirect | If unnecessary, the amount is redirected toward their goal | Mental accounting + earmarking |
| Save | The redirected amount is logged to their Future Fund (virtual today) | Save-More-Tomorrow style friction-light commitment (Thaler & Benartzi 2004) |
| Progress | Goal bar, "X days closer," milestones update immediately | Goal-gradient: motivation rises as the goal nears (Kivetz et al. 2006) |
| Reward | A calm, earned moment — streaks, milestones, a note from "future self" | Anticipated reward + future-self continuity (Hershfield et al. 2011) |
| Future | The concrete goal (and future self) feels nearer and more real | Reduces present bias (Laibson 1997) |

## First-run journey (the order matters)
This replaces "splash → straight into the grid."

1. **Problem framing (3 beats, skippable after first).**
   - "Most money doesn't leak through big decisions. It leaks through tiny, forgettable ones."
   - "The urge to buy is strongest *before* you buy — and it fades fast."
   - "Project Future turns the cravings you *don't* act on into a future you *do* want."
   Honest, calm, no fake stats on screen; claims are qualitative.

2. **Behavioural insight (1 screen).** Introduce the three spending types and the stance:
   "We're not here to stop you spending. We're here to stop money leaking on autopilot."

3. **Spending Behaviour Assessment (short, ~8–10 items).** Evidence-informed questionnaire
   (see SPENDING_PROFILE.md). ~60–90 seconds. Non-clinical, non-judgmental.

4. **Spending Behaviour Profile (result).** A warm, strengths-based profile (e.g. "The Spark",
   "The Soother", "The Scroller", "The Planner") with: what tends to trigger your unnecessary
   spending, your strengths, and how the app will help *you specifically*. Never a score that
   feels like a grade or a diagnosis.

5. **Define a meaningful future.** Create the first goal: name, target amount, (optional) date,
   cover image. Framed as "What are you actually building toward?" Tie it to the future self.

6. **Account creation** (can precede or follow the profile; keep friction low). Email + password
   now; architected for cloud sync + a future regulated savings partner.

7. **Only now: the interactive craving/browse experience.** The simulated apps/stores exist to
   *practise the pause* in a safe sandbox and to make the redirect loop tangible.

## Steady-state journey (daily/weekly)
- **Home / Today:** active goal + momentum + "what to do next" (one clear action). Not a banking
  dashboard — progress, story, and the next small win.
- **A craving moment:** either the user is about to spend in real life (they open the app and log
  a resisted craving), or they browse the sandbox → pause → decide → redirect.
- **Journey:** the honest timeline of every quiet win; the story of the behaviour change.
- **Future:** goals, progress, milestones, the "letter from future self."
- **Me:** profile, insights over time, settings, (future) Move to Savings.

## Retention architecture (long term)
- **Variable, earned reward**, never manipulative: milestone moments, streaks that forgive a
  missed day (streaks that punish cause churn), occasional "letters from your future self."
- **Progress you can feel:** goal-gradient — always surface "how much closer today's choices got you."
- **Re-engagement with dignity:** gentle, opt-in nudges tied to the user's own triggers from their
  profile (e.g. late-night scroller gets an evening check-in), never guilt.
- **Fresh-start hooks** (Dai et al. 2014): new month / new goal / "reset the streak, not the savings."
- **The real-money horizon:** the single biggest retention unlock is letting the virtual Future Fund
  become real money via a regulated partner (see SAVINGS_DOMAIN_ARCHITECTURE.md). Until then we are
  explicit that the balance is a tally of intentions, not held funds.

## What this means for the current build (next, not now)
- Add the onboarding story + assessment + profile *before* the home grid.
- Keep the working loop (dreams, craving, cart→resist→save, journey) — it IS the "practise the pause"
  sandbox. Reframe copy to the three-category stance and add the explicit "Decide" step (label the urge).
- Do not expand to more verticals until the story front-end lands.
