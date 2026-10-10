# CLAUDE.md — SELFly project instructions

Permanent instructions for every Claude Code session on this repository. Read
this first, then the relevant docs under `webapp/docs/` before making changes.

## What this repo is
- **Active application: `webapp/`** — SELFly, an India-first intentional-spending
  web app (TanStack Start SSR + React 19 + Tailwind 4 + shadcn/ui + Supabase,
  deployed on Vercel). All current work happens in `webapp/`.
- Other top-level folders (`spendzero/mobile`, `spendzero/mobile-rn`,
  `spendzero/web`, …) are **legacy/earlier variants**. Do not change them unless
  explicitly asked.
- Default (production) branch: **`main`** → auto-deploys to Vercel. Active dev
  branch: **`claude/spendzero-mobile-app-vudvnb`**.

## Read before you change anything
Load the docs that match the task:
- `webapp/docs/PRODUCT_BIBLE.md` — purpose, users, approved requirements, journeys, design principles.
- `webapp/docs/PROJECT_STATUS.md` — verified current state, known bugs, test results, next steps.
- `webapp/docs/DECISIONS.md` — dated, numbered decisions and their rationale/status.
- `webapp/docs/FEATURE_BACKLOG.md` — ideas vs proposals vs approved vs in-progress vs done.
- `webapp/docs/REGRESSION_CHECKLIST.md` — functionality and journeys that must not break.
- `webapp/AGENTS.md` — Lovable/git-history constraints.

## How to work here (authority & intent)
1. **Authoritative sources** are the user's explicit instructions and **approved**
   decisions recorded in `DECISIONS.md`. When something conflicts, the user's
   current explicit instruction wins; otherwise the latest approved decision wins.
2. **Separate approved requirements from ideas/assumptions.** Suggestions,
   brainstorms, and reviewer opinions are **not** requirements until the user
   approves them. Record them in `FEATURE_BACKLOG.md` as ideas/proposals, never
   silently as requirements.
3. **"Add" never means "replace" or "remove."** Extend; do not delete or rewrite
   working behavior as a side effect.
4. **Preserve working functionality** unless the user explicitly authorizes its
   removal. Check `REGRESSION_CHECKLIST.md` before and after changes.
5. **When the user corrects you,** investigate the root cause, fix that (not just
   the symptom), and record a durable prevention rule in `DECISIONS.md` (and here
   if it's a standing rule).
6. **Never fabricate** facts, test results, or completion status. If something is
   unverified, say so and mark it `UNKNOWN`. Report *actual* command output.
7. **Verify before claiming done.** Inspect the change, run the applicable checks
   (below), and report the real results.
8. **Update the records** (`PROJECT_STATUS.md`, `DECISIONS.md`,
   `FEATURE_BACKLOG.md`) after any meaningful implementation or decision change.

## Ask before consequential actions
Confirm with the user before anything destructive, irreversible, production-
impacting, or otherwise consequential, including:
- Deleting/overwriting files, data, or git history (no force-push/rebase/squash of
  pushed commits — see `AGENTS.md`; Lovable syncs this branch).
- Changing production config, secrets, the Supabase database/schema/RLS, Storage,
  Edge Functions, or deployments.
- Merging to `main` or otherwise triggering a deploy.
- Changing public-facing copy, pricing, or claims.

## Data-safety invariants (do not change without explicit approval)
- **localStorage keys** (changing/renaming these loses user data):
  `project_future_state_v1`, `project_future_creds_v1`,
  `project_future_images_v1`, `project_future_feedback_v1`, `selfly_sim_ack_v1`.
- **Supabase schema/RLS/Storage** and the `delete-account` Edge Function.
- **Env var names**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
  `VITE_SITE_URL`. Only the publishable/anon key is client-side; the service-role
  key must never appear in the client bundle or the repo.

## Verification commands (run from `webapp/`)
There is **no unit-test suite**. The de-facto checks are:
- **Build (local prod):** `NITRO_PRESET=node-server npm run build`
- **Run that build:** serve `.output/server/index.mjs` on `127.0.0.1:3000`, then
- **Full-journey smoke:** `node smoke.mjs` (Playwright; drives the whole flow).
- **Image audit gate:** `node scripts/image-audit.mjs` (exits non-zero until the
  launch catalogue is complete).
- **Lint:** `npm run lint`.
- Deploy build preset is `NITRO_PRESET=vercel` (do not deploy without approval).
Report the actual pass/fail output of whichever you ran. Do not say "tests pass"
if you did not run them.

## Git / PR conventions
- Develop on the active dev branch or a task branch; **do not push directly to
  `main`** without explicit approval (it deploys).
- Commit attribution lines, when creating commits/PRs from a Claude session,
  follow the attribution given in that session's system context.
- Open a PR for review; do not merge/deploy unless the user approves.

## When unsure
State what you verified, what you assumed, and what is `UNKNOWN`. Ask rather than
guess on anything consequential.
