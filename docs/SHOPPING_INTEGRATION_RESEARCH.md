# Real Shopping Integration — Feasibility Research

Can Project Future bring *real* products, prices and offers in (vs. our fictional
catalogue)? Research only — **nothing implemented**. The live app uses a
fictional India-first catalogue by design.

> Rules: respect every provider's Terms. Do **not** scrape sites in violation of
> their ToS. Do not present affiliate content deceptively. Disclose affiliate
> relationships.

## Categories

### Available now (with setup/eligibility)
- **Affiliate product APIs** where we qualify. Amazon's **Product Advertising
  API (PA-API 5.0)** exposes product data/prices/images for approved Associates,
  but eligibility typically requires qualifying sales within a window and comes
  with strict display/caching rules. Treat as "available *if* we meet and keep
  eligibility," not guaranteed.
- **Affiliate networks / aggregators** (e.g. networks that syndicate Indian
  merchant offers) can provide product/offer feeds and deep links under their
  terms. Availability and catalogue depth vary by network and approval.

### Possible with a partner
- **Merchant product feeds** (Google Merchant Center / Content API style feeds)
  are merchant-side; we'd need a merchant partner sharing their feed.
- **Official retailer/partner APIs** (quick-commerce, travel, etc.) typically
  require a signed partnership and are not open to arbitrary developers.
- **Flipkart affiliate / others** — program availability has shifted over time;
  confirm current status directly before relying on it.

### Not currently feasible (without agreements)
- A single unified "all of Indian e-commerce" product + live-price + order-history
  API does not exist openly. Prices and stock change constantly and are tightly
  controlled.
- **Order history** from marketplaces is generally not exposed by public APIs.

### Not allowed / should not do
- Scraping Amazon/Flipkart/etc. against their ToS.
- Hotlinking copyrighted product imagery without rights.
- Reusing another app's branding/UI.

## Recommendation

Keep the **fictional India-first catalogue** as the product core (it's also
better for the behavioural simulation — we control the deal framing we're
teaching about). Layer *real* data later, provider-by-provider, starting with an
affiliate feed we're approved for, behind an interface:

```ts
interface ProductFeedProvider {
  search(q, filters): Promise<Product[]>;
  product(id): Promise<Product>;
  offers(id): Promise<Offer[]>;
}
```
Ship the fictional provider now; add a real provider when a compliant agreement
exists. Never block the core experience on a third party.
