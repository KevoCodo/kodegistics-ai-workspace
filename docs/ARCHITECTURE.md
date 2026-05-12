# Architecture

## High-level system architecture
The system is split into a web UI (Next.js) and an API server (NestJS). The backend owns workflow definitions, run orchestration, persistence, and the simulation engine. PostgreSQL stores workflows, runs, and logs.

## Frontend responsibilities
- Render workflow catalog (search/filter by category/status)
- Collect workflow run inputs (schema-driven forms)
- Display run status, execution timeline logs, timestamps, and final output
- Provide a clean, "dashboard" UX suitable for a portfolio showcase

## Backend responsibilities
- Expose REST APIs for workflows, runs, and logs
- Validate inputs and enforce workflow contracts (schema-based validation)
- Orchestrate run lifecycle (queued/running/completed/failed)
- Execute the simulation engine and emit ordered logs/events
- Produce a final "result" payload for completed runs

## Database responsibilities
- Persist workflow definitions (or seed them at startup in MVP)
- Persist workflow runs, including inputs, status transitions, and outputs
- Persist workflow logs (append-only event records)

## Workflow simulation layer responsibilities
- Execute predefined steps for each workflow type (deterministic and safe)
- Simulate timing, step progress, and failures in a controlled way (no external calls)
- Emit logs at each step in chronological order
- Never call external services in MVP

## Suggested API flow
1. `GET /workflows` - list available workflows for the catalog
2. `GET /workflows/:slug` - get workflow details and input schema
3. `POST /workflow-runs` - create a run with validated input (status: `queued`)
4. Backend transitions run to `running`, appends logs, then writes `completed`/`failed` (synchronous simulation in MVP)
5. `GET /workflow-runs` - list runs for the dashboard
6. `GET /workflow-runs/:id` - fetch run details (status, input, output)
7. `GET /workflow-runs/:id/logs` - fetch logs (or stream later as an enhancement)

## Seeding (demo readiness)
- Workflows are seeded on API startup (idempotent upsert by `slug`).
- Sample runs may also be seeded for screenshot-ready UI in non-production environments (only when the database has zero runs).

## Text-based architecture diagram
```
Browser (Next.js UI)
        |
        |  REST/JSON
        v
NestJS API (Workflows + Runs + Logs)
        |
        |  TypeORM
        v
PostgreSQL (workflow, workflow_run, workflow_log)

Within NestJS:
  WorkflowRunner (simulation engine)
    - validates inputs
    - emits logs
    - updates run status + output
```
