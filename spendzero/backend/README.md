# SpendZero — Backend

FastAPI service implementing the simulated-commerce + goals APIs
described in `../docs/05-backend-apis.md`, against the schema in
`../docs/04-database-schema.md`.

```
backend/
  app/
    api/        # FastAPI routers
    core/       # config, db session, security/auth deps, redis client
    models/     # SQLAlchemy models
    schemas/    # Pydantic request/response models
    services/   # business logic (checkout simulation, savings ledger)
    workers/    # arq background jobs
```

Currently only the health endpoint is implemented — this is the
Milestone 0 scaffold (see `../docs/18-development-plan.md`).
