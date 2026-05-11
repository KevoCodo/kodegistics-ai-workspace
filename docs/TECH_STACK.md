# Tech Stack

This stack is intentionally conventional and widely understood, to maximize clarity and portfolio value while keeping the project easy to run locally.

## Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui component primitives

## Backend
- NestJS (REST API)
- TypeScript
- Validation: `class-validator` / `class-transformer` (or equivalent Nest patterns)
- OpenAPI (Swagger) for API documentation (optional but recommended)

## Database
- PostgreSQL
- TypeORM (entities + migrations)

## Local development
- Docker Compose (Postgres + optional admin tools)
- Node.js (frontend + backend)
- pnpm or npm (choose one and standardize across the repo)

## Future optional AI integration layer (not in MVP)
- Pluggable "connector" interface for:
  - OpenAI (or other LLM providers)
  - n8n or similar workflow tools
- Feature-flagged, with safe defaults and no credentials committed

## Why this stack
- **TypeScript end-to-end:** one language across UI, API, and domain modeling.
- **Next.js + Tailwind + shadcn/ui:** fast UI iteration and modern component patterns.
- **NestJS:** structured backend architecture (modules/services/controllers) that reads well in a portfolio.
- **Postgres + TypeORM:** realistic persistence with relationships and migrations, without overcomplication.
- **Docker Compose:** simple, repeatable local setup for reviewers.
