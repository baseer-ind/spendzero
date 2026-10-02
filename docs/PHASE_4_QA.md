# Phase 4 — QA

Automated via `webapp/smoke.mjs` (Playwright). Build with
`NITRO_PRESET=node-server`, serve `.output/server/index.mjs` on 127.0.0.1:3000,
run `node smoke.mjs`. Expect `ISSUES: ✅ none`.

## Covered by the smoke test

| Area | Assertion |
|------|-----------|
| Decision moment | "Your future is waiting" + dreams shown at the pause |
| Opportunity cost | active dream visible with amount; "One choice. Two directions." |
| Build my future | goal card shows before→after ("…closer") |
| Continue | "Your craving ends here. Your future continues." |
| Enjoy it | buy path reaches "You made the choice consciously" (no shame) |
| Money You Kept | `/savings` renders total + category breakdown |
| Future Intelligence | `/learn` hub + Discount Trap lesson (question + Krishna research) |
| Multiple dreams | both dreams listed at decision; redirect routes to the chosen goal |
| Routes 200 | incl. `/savings`, `/learn`, `/learn/discount-trap` |
| Full journey | story → register → assessment → profile → India-first goal (with cover) → food → cart → checkout → decision → redirect/enjoy |
| Persistence | session + onboarding survive reload |

## Manual checks

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Decide step with 3 dreams | all three show cover/progress; active highlighted |
| 2 | Build my future → pick goal B | B's before→after animates; B increments, not A |
| 3 | Enjoy it | no guilt copy; order cleared; decision logged as "enjoyed" |
| 4 | Money You Kept after several redirects | category bars reflect amounts; honesty note present |
| 5 | Discount Trap → "Explore a deal" | lands in `/today` sandbox |
| 6 | Research links | open to the cited sources |
| 7 | Claims scan | no "dopamine"/"proves everyone"/medical/financial-advice wording |

## Claims policy verification

Lesson copy and takeaways reviewed against `FUTURE_INTELLIGENCE_RESEARCH.md`.
The ₹100→₹70 example is an illustration framed as a question, not attributed to a
study; supporting research is cited separately with limitations.

## Known acceptable console noise
Remote image hosts fail through the sandbox proxy (`ERR_CERT_AUTHORITY_INVALID`,
`ERR_TUNNEL_CONNECTION_FAILED`); they resolve in a real browser and the `Img`
fallback covers them.
