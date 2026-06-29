# Product Requirements Document — SpendZero

**Tagline:** Every craving. Zero spending.

## 1. Problem

Impulse-spending is often a craving-satisfaction ritual (browse → cart →
buy) rather than a rational need. People want the ritual's dopamine
without the financial cost, and want a way to redirect that energy toward
something they actually care about.

## 2. Vision

A shopping-simulation and financial-wellness app where users go through
the full emotional arc of shopping — browse, customize, cart, checkout —
without spending real money, then explicitly redirect the "craving
completed" moment into progress on a personal savings goal they define
(trip, gadget, emergency fund, wedding, etc.).

## 3. Non-goals / hard constraints

- Not e-commerce, not banking, not an investment product.
- The app never moves, holds, transfers, or invests money. "Savings" are
  a self-reported tally, never a real balance.
- No guilt/shame framing — celebratory, never punitive, copy and design.
- No dark patterns to manufacture urgency around fake purchases (no fake
  countdown "X people viewing this" type pressure tactics).

## 4. Target users

18–40, India-first, smartphone-first users who window-shop as a stress
ritual, plus anyone actively saving toward a defined goal who wants a
tactile way to log restraint.

## 5. Core value props

1. **Catharsis without cost** — full sensory shopping simulation.
2. **Meaning over money** — every skipped purchase is explicitly tied to
   a goal the user chose, not an abstract number.
3. **Frictionless trust** — full core experience in guest mode, no signup
   wall, no financial-credential requests ever.

## 6. Key user stories

- As a guest, I can open the app and complete a full simulated purchase
  in Food or Shopping with zero signup.
- As a user, I finish checkout and see "🎉 Craving Completed — You chose
  not to spend ₹850," with that amount offered toward a goal I pick.
- As a user, I tap "✔ I Saved It" to log progress toward "🏖 Goa Trip,"
  and "⏳ Maybe Later" to skip without penalty or nagging.
- As a user, I create unlimited custom goals beyond the presets.
- As a returning user (signed in), my goals and history sync across
  devices.

## 7. Success metrics

- Guest → first "Craving Completed" completion rate (activation).
- "I Saved It" tap rate (the core habit-loop confirmation).
- D7/D30 retention.
- Goal completion rate (% of goals that reach 100%).
- Guest → signed-in conversion rate (value-first conversion, not forced).

## 8. Constraints

- Must never resemble a real brand closely enough to create trademark/
  trade-dress risk (`legal-and-branding-safety.md`).
- Must never use financial language implying real money movement
  (`legal-and-branding-safety.md` financial-claims section).
- India-first: Hindi + English, ₹ formatting, IST scheduling.

## 9. Tone rules

Every screen must leave the user feeling satisfied, relaxed, in control,
motivated, and closer to their goal — never guilty, manipulated, or
pressured. This is a hard design review gate, not a suggestion.
