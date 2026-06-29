# Legal & Branding Safety Rules

Binding for every contributor (human or AI) on SpendZero.

## Hard prohibitions

- No real company names, trademarks, logos, mascots, slogans, fonts,
  splash screens, icons, sound effects, or product photography from any
  real brand (food delivery, e-commerce, travel, ticketing, services,
  etc.).
- No pixel-for-pixel layout cloning of any specific app.
- No scraping or display of real retailer product catalogs/images.
- No real brand color palette replication.

## Required per fictional brand

1. Original name (see `brands.md`).
2. Original wordmark/logo, palette (contrast-checked, WCAG AA).
3. Original iconography, no copies from real app icon sets.

## Financial-claims safety (critical for this product)

SpendZero must never imply it moves, holds, invests, or transfers real
money. Specifically:

- No copy anywhere should say "saved," "deposited," "transferred," or
  "invested" in a way that implies the app touched real funds. Always
  frame as "you chose not to spend ₹X" / "recorded toward your goal."
- No bank-account linking, no UPI handle collection, no card storage —
  ever. The "fake payment" screen is purely a UI state with no backend
  field for real payment instruments.
- No claims of interest, returns, or growth on tracked savings — it is a
  manual tally, not a financial product. This keeps SpendZero outside
  RBI/SEBI-regulated activity (payment aggregation, NBFC, investment
  advisory) by construction.
- OTP fields, if ever shown, are only for login (Supabase-issued),
  explicitly never for "payment verification."

## Mandatory disclaimer

Shown once during onboarding/guest-mode first use (dismissible, logged)
and always available in Settings → Legal:

> "SpendZero is an independent entertainment and financial wellness
> experience. It does not process, hold, transfer, or invest real money.
> Savings goals are a personal tracking tool based on amounts you choose
> to record after deciding not to spend — they do not represent an actual
> bank balance, deposit, or investment. SpendZero is not affiliated with,
> endorsed by, or associated with any real company, retailer, bank,
> payment provider, or service mentioned or implied. All brands, stores,
> products, and services shown in the app are fictional or independently
> created for simulation purposes."

## Store & regulatory compliance checklist (pre-launch gate)

- [ ] No trademarked terms in app name, screenshots, store listing copy.
- [ ] No real brand logos anywhere in store assets.
- [ ] Privacy policy + data-deletion flow present.
- [ ] Explicit reviewer note: "no real payment processing, no financial
      instrument storage, savings tracking is self-reported only."
- [ ] Legal review confirming the app does not fall under India's Payment
      and Settlement Systems Act / RBI PPI guidelines (it shouldn't, by
      design, since no value is ever stored or transferred).
- [ ] Trademark clearance pass on `brands.md` names before public launch.
