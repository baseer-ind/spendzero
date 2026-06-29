# SpendZero

**Every craving. Zero spending.**

A shopping-simulation and financial-wellness app. No real payments, no
banking, no investments — SpendZero never moves, holds, transfers, or
invests money. Every simulated "craving" you skip can be logged toward a
personal savings goal you define.

See `docs/` for the full deliverable set:

| # | Doc |
|---|-----|
| 1 | `docs/01-prd.md` — Product Requirements Document |
| 2 | `docs/02-information-architecture.md` |
| 3 | `docs/03-user-flows.md` |
| 4 | `docs/04-database-schema.md` |
| 5 | `docs/05-backend-apis.md` |
| 6 | `docs/06-flutter-structure.md` |
| 7 | `docs/07-design-system.md` |
| 8 | `docs/08-component-library.md` |
| 9 | `docs/09-admin-dashboard.md` |
| 10 | `docs/10-analytics-events.md` |
| 11 | `docs/11-roadmap.md` |
| 12 | `docs/12-mvp-scope.md` |
| 13 | `docs/13-v2-features.md` |
| 14 | `docs/14-v3-features.md` |
| 15 | `docs/15-launch-strategy.md` |
| 16 | `docs/16-scalability-plan.md` |
| 17 | `docs/17-security-architecture.md` |
| 18 | `docs/18-development-plan.md` |
| — | `docs/brands.md` — original fictional brand names per category |
| — | `docs/legal-and-branding-safety.md` — IP safety + financial-claims rules |

## Tech stack

Flutter (mobile) · FastAPI (backend) · PostgreSQL · Redis · Supabase Auth
· Firebase Push · Cloudflare R2 · Docker · GitHub Actions.

## Status

Pre-MVP. Milestone 0 scaffold only (backend health endpoint + Docker
setup, Flutter app shell with splash screen) — see `docs/12-mvp-scope.md`
for what ships first and `docs/18-development-plan.md` for milestones.

## Quickstart (backend)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# GET http://localhost:8000/api/v1/health -> {"status": "ok"}
```

Or via Docker:

```bash
docker-compose up
```
