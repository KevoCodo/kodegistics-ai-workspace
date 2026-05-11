# Architecture

## High-level system architecture
The system is split into a web UI (Next.js) and an API server (NestJS). The backend owns workflow definitions, run orchestration, persistence, and the simulation engine. PostgreSQL stores workflows, runs, and logs.

## Frontend responsibilities
- Render workflow catalog (search/filter by category/status)
- Collect workflow run inputs (forms with validation hints)
- Display run status, logs, timestamps, and final output
- Provide a clean, "dashboard" UX suitable for a portfolio showcase

## Backend responsibilities
- Expose REST APIs for workflows, runs, and logs
- Validate inputs and enforce workflow contracts (schema-based validation)
- Orchestrate run lifecycle (queued/running/completed/failed)
- Execute the simulation engine and emit structured logs/events
- Produce a final "result" payload for completed runs

## Database responsibilities
- Persist workflow definitions (or seed them at startup in MVP)
- Persist workflow runs, including inputs, status transitions, and outputs
- Persist workflow logs (append-only event records)

## Workflow simulation layer responsibilities
- Execute predefined steps for each workflow type (deterministic and safe)
- Simulate timing, step progress, and failures in a controlled way
- Emit logs at each step (start, progress, warnings, completion)
- Never call external services in MVP

## Suggested API flow
1. `GET /workflows` - list available workflows for the catalog
2. `GET /workflows/:id` - get workflow details and input schema
3. `POST /workflow-runs` - create a run with validated input (status: `queued`)
4. Backend transitions run to `running`, appends logs, then writes `completed`/`failed`
5. `GET /workflow-runs` - list runs for the dashboard
6. `GET /workflow-runs/:id` - fetch run details (status, input, output)
7. `GET /workflow-runs/:id/logs` - fetch logs (or stream later as an enhancement)

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
