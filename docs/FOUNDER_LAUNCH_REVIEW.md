# Founder Launch Review

Standard: "Would I confidently give this to 100 real Indian users tomorrow?"
This is an honest review, not a reassuring one. Green tests prove the software
works; they do not prove it feels real. **My verdict: functionally close, not yet
a confident public launch. Good enough for a small, controlled launch (10–25
users) with expectations set.**

Classifications: **BLOCKER** · **NEEDS FIX** · **ACCEPTABLE FOR V1** · **POST-LAUNCH**.

## 1. First impression
Dark, premium, calm. Reads as a real app's shell. The home "Your day" card + hero
dream look intentional. → ACCEPTABLE FOR V1.

## 2. Onboarding
Story → assessment → profile → first goal (with cover) → Today. Clear, well-paced,
India-first. Strongest part of the product. → ACCEPTABLE FOR V1.

## 3. Today
Eight live category cards, clear. → ACCEPTABLE FOR V1.

## 4. Shopping realism
Flow is real (search/filter/sort/cart/checkout/decision). Card layout now
product-anchored on light tiles. BUT the imagery is illustration, not photography,
so it still reads "catalogue mockup," not "Amazon/Myntra." → **NEEDS FIX** (see 5).

## 5. Product imagery — the #1 gap
Vector product illustrations on light studio backgrounds (big step up from emoji),
offline and legal. **This is the single biggest "feels like a demo" signal.**
Architecture is now drop-in ready: `public/products/<folder>/<id>.jpg` +
`HAS_PHOTO` in `productImages.ts`; grids already prefer a photo when present.
→ **NEEDS FIX before a confident launch** (IMPROVE — photographic assets). Not
marked PASS. Lowest-effort path: generate a consistent generic studio set for the
~60 catalogue ids (P0: electronics, fashion, food, grocery).

## 6. Food experience
Flow excellent (apps → restaurant → menu → add-ons → cart). But food imagery is
the weakest (glyph art, not vector products or photos). → **NEEDS FIX** (food photos).

## 7. Electronics experience
The most convincing vertical: deals rail, filters, sort, detail (specs, reviews,
bank offers, scarcity, recommendations, wishlist). → ACCEPTABLE FOR V1 (imagery aside).

## 8. Decision Moment
Redesigned: leads with ₹ amount + the two directions; trigger is secondary,
optional, vertical-adaptive; dreams shown with before→after. Feels like a natural
pause, not a questionnaire. → ACCEPTABLE FOR V1 (a highlight).

## 9. Dreams
Create/select/cover/multiple goals all work; redirect routes correctly. →
ACCEPTABLE FOR V1.

## 10. Money You Kept
Clear, with honest "not a bank" framing. → ACCEPTABLE FOR V1.

## 11. Consumption
Now visible: home "Your day" card → `/consumption` with Today tiles, decisions
summary, attention-vs-money, weekly map, time-by-app. Honest (no dopamine claims).
Missing a real per-session timeline (we only store daily aggregates; a fake
timeline would be dishonest). → ACCEPTABLE FOR V1; timeline POST-LAUNCH.

## 12. Future Intelligence
Strong format, but only 2 of 12 categories have lessons; the rest say "Coming
soon." → ACCEPTABLE FOR V1 (honest), more lessons POST-LAUNCH.

## 13. Feedback
Easy to find (Profile + Settings), contextual micro-feedback, persists locally,
clearly says "saved on this device until sync." → ACCEPTABLE FOR V1.

## 14. Mobile UX
Built mobile-first (440px frame, 2-col grids, sticky actions). **I cannot test on
a real OnePlus from here** — needs your device pass for tap targets, keyboard
overlap on checkout, scroll feel. → NEEDS FIX (founder device pass required).

## 15. Performance
Local data, inline SVG, lazy images — should be fast. **No Lighthouse run** (can't
hit the live host from here). Bundle not profiled. → NEEDS FIX (one Lighthouse
pass on the live URL).

## 16. Trust / legal
Added Settings → draft Privacy, Terms, "About brands & money" disclaimer, Export
my data, Delete my data, Contact. The legal text is a **draft, not lawyer-reviewed**.
→ **BLOCKER for public launch** (needs real legal text); ACCEPTABLE for a tiny
friends-and-family test with the disclaimer visible.

## 17. Privacy
Data is device-local, photos never uploaded, no card capture, export/delete
available. Honest and safe. The flip side: no backend means **data is lost if the
user clears browser storage or switches device** — must be said to users. →
ACCEPTABLE FOR V1 if disclosed; real accounts POST-LAUNCH.

## 18. Broken / unfinished experiences
- Device-local "auth" is obfuscation, not security (disclosed). → ACCEPTABLE V1.
- Travel/Entertainment lack date/traveller/seat selection; they flow through the
  generic cart with delivery/GST semantics that read oddly for a flight/movie. →
  NEEDS FIX (hide delivery/GST for non-physical, or add minimal booking fields).
- Product **detail hero** still shows vector art even when a grid photo exists
  (only grids wired to `photoSrc`). → NEEDS FIX (small).
- Dream cover "search" returns vector art, not photos. → POST-LAUNCH.

## 19. What still feels like a prototype
1. Product/food photography (illustration, not photos) — the dominant signal.
2. Travel/Entertainment checkout semantics.
3. Sparse Future Intelligence library.
Everything else reads as a real, if early, consumer app.

## 20. Launch blockers
Real legal text; a confident imagery pass (at least P0 verticals); a founder
on-device mobile pass. Nothing architectural is broken.

---

## A. LAUNCH BLOCKERS (public launch)
1. **Lawyer-reviewed Privacy Policy & Terms** (drafts are in Settings; replace them).
2. **Photographic imagery for P0 verticals** (electronics, fashion, food, grocery)
   — or explicitly launch as a "preview" so illustration is acceptable.

## B. MUST FIX BEFORE FIRST USERS (even a small test)
1. Founder on-device mobile pass (OnePlus) — tap targets, checkout keyboard, scroll.
2. Fix Travel/Entertainment checkout semantics (no "delivery/GST" for a flight/movie).
3. Wire the product **detail hero** to `photoSrc` for consistency with grids.
4. Tell users plainly: data is on this device only (no account sync yet).

## C. ACCEPTABLE FOR V1
Onboarding, Today, Food/Electronics flows, Decision Moment, Dreams, Money You
Kept, Consumption (no timeline), Feedback, Settings/data controls, vector imagery
*as a clearly-communicated preview*, device-local data (disclosed).

## D. POST-LAUNCH
Real backend + accounts/sync; live merchant/product feeds & real photos at scale;
external-app usage tracking; real "move to savings"; consumption timeline;
remaining Future Intelligence lessons; deeper Travel/Entertainment.

## E. EXACT NEXT ACTIONS
1. **Founder:** open the deployed app on your OnePlus, run the 6 scenarios in the
   brief, screenshot anything that feels fake/confusing/unfinished. This beats more
   automated tests now.
2. **Imagery:** generate a consistent generic studio photo set for P0 ids (prompt
   template + folders are in `public/products/README.md`); add ids to `HAS_PHOTO`.
3. **Legal:** get the draft Privacy/Terms reviewed; swap in final text.
4. **Quick fixes:** Travel/Entertainment checkout semantics; detail-hero photo
   wiring; add a one-line "data stays on this device" note at sign-up.
5. **One Lighthouse pass** on the live URL; fix only real blockers.

Do these and it crosses from "functionally close" to "confidently launchable to a
first cohort." It is **not** launch-ready today — and I won't call it that.
