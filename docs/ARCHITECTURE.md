# Architecture

## High-level system architecture
The system is split into a web UI (Next.js) and an API server (NestJS). The backend owns workflow definitions, run orchestration, persistence, and a safe simulation-based execution layer. PostgreSQL stores workflows, runs, and logs.

## Frontend responsibilities
- Render the workflow catalog (grouped by category/status)
- Collect workflow run inputs (schema-driven forms)
- Display run status, execution timeline logs, timestamps, and final output payload
- Provide a clean dashboard UX suitable for a portfolio walkthrough

## Backend responsibilities
- Expose REST APIs for workflows, runs, logs, analytics, and provider readiness
- Validate requests (DTO validation + workflow input schema checks)
- Orchestrate the run lifecycle (`queued` -> `running` -> `completed` / `failed`)
- Route execution through a provider registry (adapter pattern)
- Execute the simulated provider and emit ordered logs
- Persist run outputs as structured JSON payloads
- Provide lightweight analytics endpoints for dashboard observability (overview, status breakdown, usage)

## Database responsibilities
- Persist workflow definitions (seeded on startup in the MVP)
- Persist workflow runs (inputs, status transitions, timestamps, outputs)
- Persist workflow logs (append-only records)

## Provider adapter layer (MVP)
Workflows include a `providerType` field that selects which execution provider is used. This is an architecture readiness layer only.

- Supported provider types in the MVP: `simulated`
- The simulated provider is deterministic and credential-free (no external calls)
- A provider registry resolves the provider by `providerType` and routes execution

## Suggested API flow
1. `GET /workflows` - list workflows for the catalog
2. `GET /workflows/:slug` - get workflow details and input schema
3. `POST /workflow-runs` - create a run (starts as `queued`)
4. Backend executes a synchronous simulation (MVP) that updates status, appends logs, and writes `completed`/`failed`
5. `GET /workflow-runs` - list runs for the dashboard
6. `GET /workflow-runs/:id` - fetch run details (status, input, output)
7. `GET /workflow-runs/:id/logs` - fetch logs
8. `GET /analytics/*` - compute simple observability metrics for the dashboard
9. `GET /providers` - list enabled providers (architecture readiness)

## Seeding (demo readiness)
- Workflows are seeded on API startup (idempotent upsert by `slug`).
- Sample runs can be seeded for screenshot-ready UI in non-production environments (only when the database has zero runs).

## Text-based architecture diagram
```
Browser (Next.js UI)
        |
        |  REST/JSON
        v
NestJS API (Workflows + Runs + Logs + Analytics)
        |
        |  resolve provider
        v
Provider Registry
        |
        v
Simulated Provider
        |
        |  TypeORM
        v
PostgreSQL (workflow, workflow_run, workflow_log)
```

