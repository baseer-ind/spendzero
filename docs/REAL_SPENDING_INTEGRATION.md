# Real Spending & Savings Integration — Feasibility Research

How Project Future could one day understand *real* money (spent / kept /
redirected / actually saved) — and move virtual redirections into a real savings
product. Research only. **Nothing implemented. No bank connectivity is faked.**

> Rules: never fake bank connectivity; never collect raw bank/card credentials;
> never imply Project Future is a bank or holds user funds. Any real-money step
> requires a regulated partner and explicit, revocable user consent.

## India: reading spending data

### Account Aggregator (AA) framework — RBI-regulated
- India's AA ecosystem lets a user consent to share financial data between a
  **FIP** (bank, data provider) and an **FIU** (data user) via a licensed
  **NBFC-AA**, over standardised consent artefacts.
- To receive transaction data this way, Project Future (or a partner) would need
  to be onboarded as an **FIU** and integrate through an AA, with the RBI/ReBIT
  consent and data-use rules. This is a regulated, contractual path — not a quick
  API key.
- **Benefit:** user-consented, standardised, revocable access to bank
  transactions → real "money spent / kept" over time.

### UPI / payments data
- UPI runs on NPCI rails; transaction-level data is **not** openly available to
  third-party apps. Access requires being a regulated participant (PSP/bank
  partner). Not a general integration.

### Card/bank statements
- Manual statement upload/parsing is possible but fragile and privacy-heavy;
  AA is the cleaner, consented route.

## India: moving money into real savings
- "Move to savings" must go through a **regulated financial partner** (bank /
  SEBI-registered entity for investment products / RBI-regulated deposit
  product), with KYC handled by that partner.
- Project Future would **facilitate**, not custody. Funds move from the user's
  account to a product held by the regulated partner. We never hold balances.

## Staged model (matches the product story)

```
Money You Kept   → virtual behavioural tally (LIVE today; not a balance)
Money Redirected → assigned to dreams (LIVE today; virtual)
Money Actually Saved → real transfer via regulated partner (FUTURE)
```

## Interface (reserved, not implemented)

```ts
interface SpendingDataProvider {           // AA-backed, consented
  getTransactions(range): Promise<Txn[]>;
}
interface SavingsPartner {                 // regulated partner
  createGoalAccount(...): Promise<AccountRef>;
  initiateTransfer(amount, ref): Promise<TransferStatus>; // user-initiated, KYC by partner
}
```

## Compliance checklist before any real-money feature
- Partner(s) identified and contracted (AA/FIU; savings product provider).
- RBI/SEBI/data-protection (DPDP Act) obligations mapped.
- Consent UX: explicit, granular, revocable; clear data retention.
- Security review; no credential capture in the app.
- Clear user messaging: Project Future facilitates; the partner holds funds.
