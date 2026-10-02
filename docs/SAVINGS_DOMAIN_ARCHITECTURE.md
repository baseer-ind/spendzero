# Savings Domain Architecture — virtual today, real-money ready

> Hard rule: **the app does not hold, custody, or move user money today.** The balance is a *tally of
> intentions* ("money you chose not to waste"), not funds on deposit. The domain is designed so a future,
> properly licensed **"Move to Savings"** capability can be added via a regulated partner **without
> rewriting the core** and **without ever pretending the app itself is a bank or wallet.**

## Core domain concepts (today — all virtual)
- **FutureGoal** — `{ id, name, emoji, targetAmount, savedAmount, createdAt, targetDate? }`.
- **Redirection** — the atomic event: a craving the user chose not to act on.
  `{ id, goalId, amount, reason, source (quick|cart), craving?, at }`. Immutable, append-only.
- **FutureFund (virtual)** — a per-goal projection = sum of Redirections. **Not** money held.
- **BehaviourProfile** — assessment result (see SPENDING_PROFILE.md).
- **Account** — identity (device-local today; cloud later).

The current `store.tsx` already models most of this (`dreams`, `events`, `applySaving`). Rename/clarify
toward this vocabulary: `events` → `redirections`, `applySaving` → `redirect`. Keep it an **append-only
ledger** so history and audit survive the move to real money.

## Explicit boundaries (must stay true)
- The virtual balance is labelled as such in-copy: "redirected," "intended," "your Future Fund" — never
  "balance in your account" or "deposited."
- No interest, yield, or returns are shown or implied on virtual funds.
- No claim of FDIC/DICGC/insurance/custody.
- No real inbound/outbound money movement in the app itself.

## The "Move to Savings" bounded context (future, licensed)
Add as a **separate module** that the core emits to; the core never gains custody logic.

```
Core (virtual)                     │  Partner bounded context (regulated)
 FutureGoal / Redirection / Ledger │  PartnerAccount, RealTransfer, KYC, Mandate
          │  emits domain event     │
          ▼                         ▼
   RedirectionRecorded  ───────►  (optional) TransferIntent ──► Partner API (bank/EMI/PA)
                                          money is held and moved BY THE PARTNER, not us
```

- **PartnerAccount** — opened with and held by a regulated partner (a licensed bank / NBFC / SEBI-regulated
  product / payment aggregator / account-aggregator flow). The partner is the entity of record for funds.
- **TransferIntent / RealTransfer** — the user opts to move some/all of their virtual Future Fund into the
  real partner account (e.g., a recurring-deposit, round-up savings, or goal account). The app orchestrates
  UX + consent; the **partner executes and custodies**.
- **Mandate / KYC / consent** — handled by the partner's regulated flow (e.g., in India: RBI-governed;
  account-aggregator consent; e-mandate). The app stores references, not funds.

### Design rules for the future module
1. Core domain has **zero** dependency on the partner module (one-way: core emits events).
2. All money-movement code lives behind a `SavingsPartner` interface; today there is **no** implementation.
3. Virtual → real is always **user-initiated and consented**, never automatic.
4. Reconciliation: virtual Future Fund and real partner balance are tracked separately and clearly labelled.

## Regulatory reality (flag for counsel — do not self-certify)
- Holding or moving user funds, round-ups to a real account, interest/yield, or investing saved amounts
  are **regulated activities**. In India this touches RBI (deposits/payments/e-mandates, Account Aggregator
  framework) and/or SEBI (if investing). Requires a licensed partner and legal review. **Not buildable by us
  unilaterally.**
- Until a partner + licences are in place, "Move to Savings" must not ship — and the app must keep saying
  the balance is virtual.

## Why this ordering is safe
We can build the entire behaviour-change product and a large user base on the **virtual** model with no
licensing. The virtual ledger is already the exact event stream a partner integration would consume, so the
real-money upgrade is additive, not a rewrite — and we never misrepresent custody in the meantime.
