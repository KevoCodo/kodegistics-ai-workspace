# AI Workflow Automation Dashboard

Public portfolio project demonstrating a generic AI workflow orchestration dashboard: workflow catalog, run lifecycle management, validation, execution state, logs, and result output.

## Tech stack (target)
- Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- Backend: NestJS, TypeScript (REST APIs)
- Database: PostgreSQL with TypeORM
- Local dev: Docker Compose
- AI layer: simulated execution first (no external calls)

## Current status
- Phase 1: project setup and base app structure (completed)

## Project structure
```
/
  apps/
    web/   (Next.js)
    api/   (NestJS)
  docs/
  docker-compose.yml
  README.md
```

## Local development
Setup instructions are intentionally lightweight for Phase 1.

### Run with Node (recommended for iteration)
1. Install dependencies: `npm install`
2. Start frontend: `npm run dev:web` (http://localhost:3000)
3. Start backend: `npm run dev:api` (http://localhost:3001)

### Run with Docker Compose (web + api + postgres)
- `docker compose up`

## Available services
- Web: http://localhost:3000
- API: http://localhost:3001 (`GET /health`)
- Postgres: localhost:5432

## Environment examples
- `apps/web/.env.example`
- `apps/api/.env.example`

## Public showcase purpose
- Demonstrate fullstack engineering and workflow orchestration concepts
- Remain generic and sanitized for public GitHub (no private data, no proprietary logic)
- Start with simulated execution; consider optional real integrations later

## Documentation
- `docs/PROJECT_OVERVIEW.md`
- `docs/TECH_STACK.md`
- `docs/SCOPE_GUARDRAILS.md`
- `docs/ARCHITECTURE.md`
- `docs/WORKFLOW_MODEL.md`
- `docs/DEVELOPMENT_PHASES.md`
