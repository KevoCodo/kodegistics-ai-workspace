# Architecture

## High-level system architecture
The system is split into a web UI (Next.js) and an API server (NestJS). The backend owns workflow definitions, run orchestration, persistence, and a safe simulation-based execution layer. PostgreSQL stores workflows, runs, and logs.

## Frontend responsibilities
- Render the workflow catalog (grouped by category/status)
- Allow simple provider selection while keeping `simulated` as the default choice
- Display provider availability, safe returned metadata, and provider lifecycle log events
- Collect workflow run inputs (schema-driven forms)
- Display run status, execution timeline logs, timestamps, and final output payload
- Provide a clean dashboard UX suitable for a portfolio walkthrough

## Backend responsibilities
- Expose REST APIs for workflows, runs, logs, analytics, and provider readiness
- Validate requests (DTO validation + workflow input schema checks)
- Orchestrate the run lifecycle (`queued` -> `running` -> `completed` / `failed`)
- Route execution through a provider registry (adapter pattern)
- Execute the selected provider and emit ordered provider lifecycle logs
- Persist run outputs as structured JSON payloads
- Provide lightweight analytics endpoints for dashboard observability (overview, status breakdown, usage)

## Database responsibilities
- Persist workflow definitions (seeded on startup in the MVP)
- Persist workflow runs (inputs, status transitions, timestamps, outputs)
- Persist workflow logs (append-only records)

## Provider adapter layer (MVP)
Workflows include a `providerType` field that selects which execution provider is used. The registry keeps orchestration stable as adapters are added.

- Registered provider types: `simulated`, `openai`, `anthropic`, `local`, and `custom-webhook`
- Executable providers: `simulated` and `openai`
- Placeholder-only providers: `anthropic`, `local`, and `custom-webhook`; invoking one returns a clean not-implemented failure without an external call
- `simulated` is the default and is deterministic and credential-free
- `openai` is an optional backend adapter disabled unless `OPENAI_PROVIDER_ENABLED=true`
- The OpenAI adapter additionally requires `OPENAI_API_KEY` and reads `OPENAI_MODEL`
- Provider results use one contract: status, output payload, execution time, safe metadata, logs, and nullable error message
- Safe OpenAI metadata is limited to provider, model, execution time, status, and timestamp

## UI provider selection and status flow (Phase 13B / 14A)
1. Workflow create/edit forms allow choosing implemented providers; new workflows default to `simulated`.
2. Placeholder providers are shown as `coming soon` and disabled in the editor to prevent accidental execution.
3. The UI reads `GET /providers` to explain implementation and configuration availability without accessing secrets.
4. `simulated` reports `active` and is always the recommended public demo provider.
5. `openai` reports `disabled`, `missing_api_key`, or `enabled` based on backend configuration.
6. Placeholder providers report `coming_soon`, `implemented: false`, and `enabled: false`.
7. A workflow run still follows the same lifecycle and log contract regardless of the selected adapter.
8. Run details surface clean failure context and only safe provider metadata returned with successful output.

## Suggested API flow
1. `GET /workflows` - list workflows for the catalog
2. `GET /workflows/:slug` - get workflow details and input schema
3. `POST /workflow-runs` - create a run (starts as `queued`)
4. Backend synchronously resolves and executes the selected provider, appends lifecycle logs, and writes `completed`/`failed`
5. `GET /workflow-runs` - list runs for the dashboard
6. `GET /workflow-runs/:id` - fetch run details (status, input, output)
7. `GET /workflow-runs/:id/logs` - fetch logs
8. `GET /analytics/*` - compute simple observability metrics for the dashboard
9. `GET /providers` - list providers and safe configuration availability (architecture readiness)

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
        |-- Simulated Provider (default)
        |-- OpenAI Provider (optional; disabled by default)
        `-- Placeholders (Anthropic / Local / Custom Webhook; non-executable)
        |
        |  TypeORM
        v
PostgreSQL (workflow, workflow_run, workflow_log)
```

