# Phase 2 — Implementation Audit (webapp)

Source of truth = the 5 strategy docs. Current UI/nav is NOT source of truth.

## Current state (webapp/, TanStack Start + React + Tailwind)
| Area | File | Verdict |
|------|------|---------|
| State/store | `src/lib/store.tsx` | **Reuse + extend.** Has dreams, redirections (events), cart, accounts, streak, persistence. Add: story-seen, behaviour profile, conscious purchases, achievements. |
| Account gate | `src/components/AuthGate.tsx` | **Replace** with a broader `ExperienceGate` (story → auth → assessment → profile → first goal → app). Reuse the AuthScreen UI. |
| Home | `src/routes/index.tsx` | **Reuse**, already "My Future" (not finances). Minor copy. |
| Dreams/goals | `src/routes/future.tsx` | **Reuse.** Create/select works. Add edit/archive. |
| Craving quick-resist | `src/routes/order.tsx` | **Modify** → route into Pause/Decide. |
| Browse → cart | `src/routes/restaurants.tsx`, `restaurant.tsx`, `cart.tsx` | **Reuse**, re-route checkout through Pause/Decide. |
| Win screen | `src/routes/continue.tsx` | **Reuse** as the Redirect celebration. |
| Journey | `src/routes/journey.tsx` | **Reuse**, real events already. |
| Profile | `src/routes/profile.tsx` | **Reuse + add** behaviour profile + insights. |
| Achievements | — | **Missing → build** (`src/lib/achievements.ts` + screen + unlock surfacing). |
| Assessment/Profile | — | **Missing → build** (`src/lib/assessment.ts` + onboarding screens). |
| Pause/Decide | — | **Missing → build** (the behavioural core). |
| Fake status bar | removed | done |

## Reuse / modify / rebuild / remove / missing
- **Reuse:** store core, dreams, cart, journey, continue, home, design tokens, bundled imagery.
- **Modify:** gate (→ExperienceGate), craving CTAs (→Pause/Decide), profile (+insights).
- **Rebuild:** first-run journey (story→assessment→profile→goal) ahead of the sandbox.
- **Remove:** nothing functional; delete dead copy only.
- **Missing:** assessment, profile engine, Pause/Decide step, achievements, conscious-purchase logging, insights.

## Plan (this phase, autonomous)
1. Extend store (profile, storySeen, conscious purchases, achievements selectors).
2. `assessment.ts` (10 items, scoring, 5 archetypes) + `achievements.ts`.
3. Onboarding: Story → Assessment → ProfileResult → FirstGoal, composed in `ExperienceGate`.
4. Pause → Decide → Redirect loop (new `/pause`) feeding `continue` (redirect) or an "enjoy it" path.
5. Achievements screen + unlock surfacing tied to Journey/Future.
6. Playwright QA of both decide paths; deploy.
