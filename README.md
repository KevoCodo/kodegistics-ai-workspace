# AI Workflow Automation Dashboard

Public portfolio project demonstrating a generic workflow automation dashboard with simulated AI-style execution: workflow catalog, run lifecycle, validation boundaries, logs, and structured outputs.

This is a showcase MVP — not a production SaaS platform.

## Project Overview
This project demonstrates:
- Fullstack engineering (Next.js UI + NestJS API + PostgreSQL persistence)
- Workflow orchestration concepts (routing, run lifecycle, validation, observability)
- Operational dashboard UX patterns (status-driven UI, timelines, logs, outputs)
- "AI systems thinking" using safe, deterministic simulation (no external calls)

## Features (MVP)
- Workflow catalog (seeded templates grouped by category)
- Workflow detail pages with schema-driven input forms
- Create workflow runs with deterministic simulation (`queued` -> `running` -> `completed` / `failed`)
- Run history view with status badges and timestamps
- Run detail view with execution timeline logs + JSON input/output payloads
- Architecture overview page (layer responsibilities + diagram)

## Tech Stack
**Frontend**
- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- shadcn/ui-style primitives (minimal component layer)

**Backend**
- NestJS + TypeScript (REST)
- PostgreSQL
- TypeORM

**Infrastructure**
- Docker Compose for local Postgres (and optional full-stack dev)

**AI layer (MVP)**
- Simulated workflow execution only (no OpenAI, no n8n)

## Architecture Overview
**High-level diagram**
```
Browser (Next.js UI)
  |
  | REST/JSON
  v
NestJS API (Workflows + Runs + Logs + Simulation)
  |
  | TypeORM
  v
PostgreSQL (workflow, workflow_run, workflow_log)
```

**Data flow**
1. UI lists workflows from `GET /workflows`
2. UI fetches workflow detail from `GET /workflows/:slug`
3. UI submits inputs to `POST /workflow-runs`
4. API validates input against the workflow input schema
5. API simulates execution (state transitions + logs) and persists output
6. UI displays run history (`GET /workflow-runs`) and run details (`GET /workflow-runs/:id` + `/logs`)

**Execution lifecycle (simulated)**
- Statuses: `queued`, `running`, `completed`, `failed`
- Logs emitted in a predictable order:
  - `queued`
  - `validation`
  - `routing`
  - `simulated_processing`
  - `formatting`
  - `completed` (or `failed`)

## Folder Structure
```
/
  apps/
    web/               # Next.js frontend
    api/               # NestJS backend
  docs/                # planning, architecture, portfolio notes
  docker-compose.yml   # local infrastructure (Postgres + optional app services)
```

## Local Development
### Prerequisites
- Node.js 20+
- Docker Desktop (for Postgres)

### Install & Run (local Node)
1. Install dependencies: `npm install`
2. Start Postgres: `docker compose up postgres`
3. Create local env files:
   - Web: copy `apps/web/.env.example` to `apps/web/.env.local`
   - API: copy `apps/api/.env.example` to `apps/api/.env.local`
4. Start web + api together: `npm run dev`

Run separately:
- Web: `npm run dev:web`
- API: `npm run dev:api`

### Run Everything In Docker (Compose)
- Start all services: `docker compose up`

Optional overrides (useful if ports are already taken):
- `WEB_PORT` (host port -> container 3000)
- `API_PORT` (host port -> container 3001)

If you open the web UI via a non-localhost address (for example, a WSL/Docker/VM IP like `http://172.31.x.x:3000`), set:
- `NEXT_PUBLIC_API_URL=http://172.31.x.x:3001`

If you open the web UI at `http://localhost:3000`, set:
- `NEXT_PUBLIC_API_URL=http://localhost:3001`

For Docker Compose, the easiest way is a root `.env` file (ignored by git):
```
NEXT_PUBLIC_API_URL=http://172.31.x.x:3001
NEXT_ALLOWED_DEV_ORIGINS=172.31.x.x
WEB_PORT=3000
API_PORT=3001
```

### Services
- Web: http://localhost:3000 (or configured `WEB_PORT`)
- API: http://localhost:3001 (`GET /health`, or configured `API_PORT`)
- Postgres: localhost:5432

### Next.js dev origin note
If you see an error like "Cross-origin access to Next.js dev resources is blocked", set:
- `NEXT_ALLOWED_DEV_ORIGINS=172.31.80.1` (or whatever host you access the dev server from)
Then restart the web dev server.

If pages look "stuck" on loading, this is often the cause (the client JS bundle can't load dev resources until the origin is allowed).

## Environment Variables
### Web (`apps/web/.env.local`)
- `NEXT_PUBLIC_API_URL` (example: `http://localhost:3001`)

### API (`apps/api/.env.local`)
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`
- `PORT` (default `3001`)
- `TYPEORM_SYNCHRONIZE` (default `true` for non-production)
- `SEED_SAMPLE_RUNS` (default: enabled outside production; only seeds when DB has zero runs)
- `SIMULATION_STEP_DELAY_MS` (optional, default `120`)

## API Overview
**Health**
- `GET /health`

**Workflows**
- `GET /workflows`
- `GET /workflows/:slug`

**Workflow runs**
- `GET /workflow-runs`
- `GET /workflow-runs/:id`
- `POST /workflow-runs`

**Run logs**
- `GET /workflow-runs/:id/logs`

## Screenshots
Add images under `docs/screenshots/`:
- `docs/screenshots/dashboard.png`
- `docs/screenshots/workflows.png`
- `docs/screenshots/workflow-detail.png`
- `docs/screenshots/run-detail.png`
- `docs/screenshots/architecture.png`

## Why This Project Exists (portfolio framing)
This repository is intentionally scoped to a clean, demoable MVP that highlights:
- Designing API-driven operational dashboards
- Modeling workflow/run/log domains with clear boundaries
- Building observable execution traces (logs + structured outputs)
- Simulating AI-adjacent automation safely (deterministic execution, no external dependencies)

## Future Enhancements (not in MVP)
- Optional real OpenAI integration behind a connector interface
- Optional n8n integration behind feature flags
- Streaming execution updates (SSE/WebSockets)
- Authentication (only if the demo needs it)
- Workflow builder UI (template creation/editing)
- Real background job processing (queue + worker)

## Public-Safe Disclaimer
- No authentication in MVP
- No billing/payments
- No team/org/user management
- No external AI calls in MVP
- No private company/client data or proprietary workflows

## Docs
- `docs/PROJECT_OVERVIEW.md`
- `docs/TECH_STACK.md`
- `docs/SCOPE_GUARDRAILS.md`
- `docs/ARCHITECTURE.md`
- `docs/WORKFLOW_MODEL.md`
- `docs/DEVELOPMENT_PHASES.md`
