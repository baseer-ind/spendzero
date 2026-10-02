# Future Intelligence

Project Future's behavioural-education layer. Not a generic personal-finance
blog — short, evidence-based lessons tied directly to the user's real decisions.

Code: `webapp/src/lib/learn.ts`; routes `learn.index.tsx` (hub),
`learn.$lessonId.tsx` (lesson). Research library: `FUTURE_INTELLIGENCE_RESEARCH.md`.

## Content architecture

Every lesson follows: **Insight → Example → Question → (Research) → Try it.**
The "Try it" button sends the user into the real craving sandbox, closing the
loop: **Learn → Experience → Decide → Save.**

```ts
Lesson = { id, categoryId, title, minutes,
  insight, example{optionA,optionB,note}, question, takeaway,
  research: sourceId[], tryIt{label,to} }
```

## Categories (12)

1. Deals & Discounts · 2. Impulse & Cravings · 3. FOMO · 4. Convenience ·
5. Reference Prices · 6. Present vs Future · 7. Social Influence ·
8. Emotional Spending · 9. Subscriptions · 10. Small Purchases ·
11. Online Shopping · 12. Habit Building.

## Lessons shipped

- **The Discount Trap** (Deals & Discounts) — how discount presentation can
  change perceived value even when the final price is identical. Sources:
  Krishna 2002, Chen 1998, Bayer 2013.
- **The Scarcity Clock** (FOMO) — how limited-time/quantity promotions can add
  pressure. Source: Wu 2020.

Remaining categories show "Coming soon" until a lesson is authored.

## Claims policy (enforced in copy)

- Use "Research suggests…", "Studies have found…", "In this experiment…".
- **Never** "dopamine makes you buy", never "research proves everyone…", never
  medical/addiction or financial-advice claims.
- Keep **what a study found** separate from **what Project Future interprets**.
- Do not assert the exact ₹100→₹70 experiment as a published result; it's used as
  an *illustration*, and the lesson explicitly asks a question rather than
  claiming an outcome. The supporting, verified research is cited separately.

## India-first examples

All amounts in ₹ with Indian grouping; examples use Indian shopping context
(₹149 delivery, ₹1,499 "70% OFF", ₹799 food order, etc.).

## Personalisation (future)

Lessons can later be surfaced from observable app behaviour (e.g. frequent
discount-driven adds → surface "The Discount Trap"). Use observed behaviour
only — never diagnose the user.
