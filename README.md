# AI Workflow Automation Dashboard

Public fullstack portfolio project demonstrating workflow orchestration patterns: schema-driven workflow templates, simulated provider execution, run lifecycle tracking, execution logs, and lightweight observability metrics.

This repo is intentionally scoped as a public-safe MVP (not a production SaaS).

## Why This Project Exists
Many “AI automation” demos stop at prompts. Real operational value comes from repeatable workflows, structured inputs/outputs, execution visibility, and traceability. This project is a public, sanitized showcase of those orchestration patterns without requiring external credentials or private data.

## What This Project Demonstrates
- Fullstack engineering (Next.js UI + NestJS API + PostgreSQL persistence)
- Workflow orchestration (templates, routing, lifecycle states)
- Provider adapter architecture (execution abstraction + registry)
- Schema-driven UI forms (workflow-defined inputs)
- Simulated AI execution (deterministic, credential-free)
- Execution logging (timeline-style steps per run)
- Lightweight observability metrics (success rate, usage, recent activity)
- Operational dashboard design (status-driven UX, traceability)
- Public-safe AI systems thinking (architecture readiness without real providers)

## Core Features (MVP)
- Workflow template catalog (seeded) and admin-lite template CRUD (create/edit/deactivate)
- Schema-driven workflow input forms generated from `inputSchema`
- Workflow runs with deterministic lifecycle: `queued` -> `running` -> `completed` / `failed`
- Run history and run detail pages with ordered logs and structured output payloads
- Analytics endpoints + dashboard observability views (status breakdown, usage, recent activity)
- Provider adapter layer (only `simulated` provider enabled)

## Tech Stack
- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS
- Backend: NestJS (REST), TypeScript, TypeORM
- Database: PostgreSQL
- Local infra: Docker Compose (Postgres; optional full stack)

## Architecture Overview
```
Browser (Next.js UI)
  |
  | REST/JSON
  v
NestJS API (Workflows + Runs + Logs + Analytics)
  |
  | resolve provider
  v
Provider Registry
  |
  v
Simulated Provider (deterministic, no external calls)
  |
  | TypeORM
  v
PostgreSQL (workflow, workflow_run, workflow_log)
```

## Provider Adapter (Architecture Readiness)
Workflows include `providerType` (default: `simulated`). The API resolves a provider through a small registry and executes via an interface so future providers can be added behind feature flags without changing the workflow/run API contract.

Enabled in the MVP:
- `simulated` (deterministic, public-safe, credential-free)

Not implemented (intentionally out of scope):
- OpenAI / Anthropic / local model providers
- n8n or other workflow engines

## Workflow Execution Lifecycle
- Statuses: `queued`, `running`, `completed`, `failed`
- Typical log steps:
  - `queued`
  - `validation`
  - `routing`
  - `provider_resolved`
  - `provider_execution_started`
  - `simulated_processing`
  - `formatting`
  - `provider_execution_completed`
  - `completed` (or `failed`)

## Analytics / Observability
The API exposes lightweight aggregation endpoints and the dashboard renders:
- Workflow counts (active/inactive)
- Run counts by status and recent activity
- Success rate and average execution time
- Workflow usage summary (runs + health per template)

## Demo Flow
1. View workflow templates (catalog)
2. Create or edit a workflow template
3. Submit schema-driven workflow input
4. Run simulated workflow execution
5. Review execution status transitions
6. Inspect logs and structured output payload
7. Review dashboard analytics
8. Review provider architecture (`GET /providers` + Architecture page)

## Local Development
### Prerequisites
- Node.js 20+
- Docker Desktop (for Postgres)

### Install & Run (web + api locally, Postgres in Docker)
1. Install dependencies: `npm install`
2. Start Postgres: `docker compose up -d postgres`
3. Create local env files:
   - Web: copy `apps/web/.env.example` to `apps/web/.env.local`
   - API: copy `apps/api/.env.example` to `apps/api/.env.local`
4. Start web + api together: `npm run dev`

Run separately:
- Web: `npm run dev:web`
- API: `npm run dev:api`

Services:
- Web: http://localhost:3000
- API: http://localhost:3001 (`GET /health`)
- Postgres: localhost:5432

## Environment Variables
### Web (`apps/web/.env.local`)
- `NEXT_PUBLIC_API_URL` (example: `http://localhost:3001`)
- `NEXT_ALLOWED_DEV_ORIGINS` (only needed when accessing the dev server by non-localhost hostname/IP)

### API (`apps/api/.env.local`)
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`
- `PORT` (default `3001`)
- `TYPEORM_SYNCHRONIZE` (default `true` for local dev)
- `SEED_SAMPLE_RUNS` (seeds demo runs when DB has zero runs; disabled in production)
- `SIMULATION_STEP_DELAY_MS` (optional; default `120`)

## Docker
### Postgres only
- `docker compose up -d postgres`

### Full stack (optional)
- `docker compose up`

Optional overrides (useful if ports are already taken):
- `POSTGRES_PORT` (host port -> container 5432)
- `WEB_PORT` (host port -> container 3000)
- `API_PORT` (host port -> container 3001)

If you open the web UI via a non-localhost address (for example, a WSL/Docker/VM IP like `http://172.31.x.x:3000`), set:
- `NEXT_PUBLIC_API_URL=http://172.31.x.x:3001`

## API Endpoint Summary
- Health: `GET /health`
- Workflows:
  - `GET /workflows`
  - `GET /workflows/:slug`
  - `POST /workflows`
  - `PATCH /workflows/:id`
  - `DELETE /workflows/:id` (deactivates; keeps runs valid)
- Workflow runs:
  - `GET /workflow-runs`
  - `GET /workflow-runs/:id`
  - `POST /workflow-runs`
  - `GET /workflow-runs/:id/logs`
- Analytics:
  - `GET /analytics/overview`
  - `GET /analytics/workflow-usage`
  - `GET /analytics/recent-activity`
  - `GET /analytics/status-breakdown`
- Providers:
  - `GET /providers`

## Screenshots
See `docs/screenshots/README.md` for a suggested screenshot list. Recommended set:
- Dashboard overview
- Workflow catalog
- Workflow template editor
- Workflow run detail (logs + output)
- Analytics/observability sections
- Architecture/provider adapter page

## Project Status
- Status: MVP complete and ready for public showcase
- Execution: simulated provider only (no external AI providers)

## MVP Boundaries
- No authentication
- No billing
- No real OpenAI execution
- No real n8n execution
- No private business/client data
- Simulated provider execution only
- Public portfolio showcase only (not production-hardened)

## Future Improvements (not in MVP)
- Optional real providers behind feature flags (OpenAI/Anthropic/local models)
- Optional external workflow engine adapters (e.g., n8n)
- Streaming run updates (SSE/WebSockets)
- Async execution via a queue/worker

## Public-safe disclaimer
- No secrets committed
- No private company/client data
- No proprietary business logic

## Docs
- `docs/PROJECT_OVERVIEW.md`
- `docs/TECH_STACK.md`
- `docs/SCOPE_GUARDRAILS.md`
- `docs/ARCHITECTURE.md`
- `docs/WORKFLOW_MODEL.md`
- `docs/DEVELOPMENT_PHASES.md`
- `docs/CASE_STUDY.md`
- `docs/PORTFOLIO_COPY.md`
- `docs/LAUNCH_CHECKLIST.md`
