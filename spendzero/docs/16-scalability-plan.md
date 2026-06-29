# Scalability Plan

## Application tier

- FastAPI, stateless containers, horizontal autoscaling on CPU/RPS.
  Kubernetes-ready manifests from day one even if MVP runs on a simpler
  PaaS. Async I/O throughout — no blocking calls in the request path.

## Data tier

- PostgreSQL: read replicas for catalog browse traffic once read QPS
  outgrows a single primary.
- `analytics_events` partitioned by month, archived to Cloudflare R2
  past 90 days.
- Redis: catalog read caching (60–300s TTL), session/rate-limit state,
  guest-merge locks. Cluster mode once single-node memory becomes a
  constraint.

## Media/assets

All brand logos/illustrations/animations served from Cloudflare R2 + CDN.

## Background work

`arq` workers scaled independently from API pods; AI search/planning is
the most expensive job class — isolate in its own worker pool so it
doesn't starve lightweight jobs (achievement evaluation, event ingestion,
guest-to-account merges).

## Growth triggers

- API p95 latency > 300ms sustained → add read replica/cache layer
  before scaling pod count blindly.
- `analytics_events` > 50M rows → confirm partitioning/archival is
  actually running.
- Guest-device table growth: since MVP has no signup wall, guest rows
  will vastly outnumber accounts — plan a TTL/cleanup policy for
  abandoned guest devices with zero activity after N months, independent
  of the always-real `goals`/`goal_contributions` retention (which must
  never be silently purged for converted accounts).

## Multi-region

Not required pre-GA (India-only launch). Single India-region deployment
with CDN edge caching for static assets globally if diaspora usage grows.
