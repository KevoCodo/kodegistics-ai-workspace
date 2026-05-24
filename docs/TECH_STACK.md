# Tech Stack

This stack is intentionally conventional and widely understood, to maximize clarity and portfolio value while keeping the project easy to run locally.

## Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Small UI component primitives (dark dashboard aesthetic)

## Backend
- NestJS (REST API)
- TypeScript
- TypeORM
- DTO validation with `class-validator` / `class-transformer`

## Database
- PostgreSQL
- JSON payload persistence for workflow inputs/outputs

## Local development
- Docker Compose for Postgres (and optional full stack)
- npm workspaces (monorepo)
- Node.js 20+

## Architecture patterns showcased
- Schema-driven forms (workflow-defined inputs)
- Provider adapter layer (registry + provider interface; simulated provider only)
- Status-driven run lifecycle and execution logs
- Lightweight analytics endpoints for observability discussion

## Intentional non-goals (MVP)
- No authentication, billing, or team/user management
- No real provider integrations (OpenAI/Anthropic/local models)
- No external workflow tool execution (n8n, etc.)
- No visual workflow builder

