# Admin Dashboard

Internal web app, role-gated (`admin`, `content_editor`, `support`).

## Modules

1. **Catalog management** — CRUD for categories, brands (with contrast-
   checked palette picker), listings, offers. Bulk import via CSV/JSON.
2. **Brand safety review queue** — flags new brand names against a
   trademark-keyword blocklist before publish; requires second-reviewer
   approval (`legal-and-branding-safety.md`).
3. **Goal presets management** — curate the default goal list (Goa Trip,
   New Bike, etc.), icons, suggested target amounts by category.
4. **Copy review queue** — every user-facing string referencing money/
   savings must pass a checklist before merge: no "deposit/transfer/
   invest" language, no guilt framing (`legal-and-branding-safety.md`
   financial-claims section). This is the single highest-risk review
   surface in the product.
5. **User support** — search users (minimal PII), view craving-session/
   goal history for support tickets, account deletion processing.
6. **Analytics overview** — funnels (browse → cart → checkout →
   completion → Craving Completed → outcome), retention cohorts, goal
   completion rates, guest→signed-in conversion.
7. **Feature flags / config** — toggle categories on/off, control AI
   feature rollout, manage which categories are guest-visible at launch.
8. **Content/asset manager** — upload original illustrations/animations
   to Cloudflare R2.

## Access & audit

All admin actions logged (`admin_audit_log`: actor, action, entity,
before/after diff, timestamp). Admin auth via Supabase with a separate
`role` claim, never reachable from the consumer-app audience token.
