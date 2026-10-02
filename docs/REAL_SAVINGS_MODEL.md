# Real Savings Model — "Money You Kept"

How Project Future accounts for money, and the honesty rules around it.

Route: `webapp/src/routes/savings.tsx`.

## Three stages (the product story)

```
Money you kept  →  Money you redirected  →  Money you actually saved
(chose not to      (assigned to a dream,     (future: moved by the user into a
 spend)             a virtual tally)          real account via a regulated partner)
```

Today the app implements the first two. The third is **architecture only** — no
banking, no fund-holding.

## What we show

- **Redirected so far** = sum of amounts moved to dreams (`totalSaved`).
- **Conscious decisions** = count of pause decisions (`decisions`).
- **Where it came from** = redirected amount grouped by craving category
  (`keptByCategory`, from each `SaveEvent.category`).

## Honesty rules (must stay true)

- This is a **behavioural tally**, not a bank balance. The screen says so
  explicitly: "money you chose not to spend… It isn't money transferred into a
  bank account; Project Future doesn't hold your money."
- Never imply the app currently holds or transfers funds.
- Perceived saving ≠ money kept: "If you weren't planning to buy it, spending
  ₹700 isn't the same as saving ₹300. If you choose not to buy it, ₹700 stays
  with you." (Use in future Deals lessons.)

## Future: "Move to savings"

When built: Virtual redirection → user explicitly chooses to save → regulated
financial partner → real savings account. Constraints that never change:
- No fake banking UI.
- Never collect real bank/card credentials. (Checkout payment is a simulation
  and collects none.)
- Never claim Project Future is a bank.

## Data model

`SaveEvent { dreamId, amount, note, category?, at }` and
`Decision { category, amount, trigger, choice: "enjoyed" | "redirected", dreamId?, at }`
in `webapp/src/lib/store.tsx`, persisted in localStorage.
