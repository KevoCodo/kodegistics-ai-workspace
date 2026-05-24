# Launch Checklist (Public Portfolio)

Use this before sharing the repo publicly (GitHub, LinkedIn, recruiter screens, demo videos).

## Docs and copy
- README completed and accurate.
- Docs reviewed and match the implementation (`docs/`).
- Case study completed (`docs/CASE_STUDY.md`).
- Portfolio copy completed (`docs/PORTFOLIO_COPY.md`).
- Screenshot guidance present (`docs/screenshots/README.md`).
- Diagram guidance present (`docs/diagrams/architecture.md`).

## Safety (public GitHub safe)
- No secrets committed (`.env*` ignored; no API keys in code or docs).
- No private company/client data in seeded workflows, sample runs, or screenshots.
- No proprietary business logic, internal prompts, or private system references.

## Environment files
- `apps/api/.env.example` present and current.
- `apps/web/.env.example` present and current.
- Root `.env` (optional) is git-ignored.

## Local run verification
- Postgres starts locally (Docker): `docker compose up -d postgres`.
- Backend starts locally: `npm run dev:api` and `GET /health` returns ok.
- Frontend starts locally: `npm run dev:web` and pages load.
- Seed data works:
  - Workflows are seeded on startup.
  - Sample runs are seeded when DB has zero runs (non-production).
- Demo flow tested end-to-end:
  - Create/edit workflow template
  - Create workflow run
  - View run logs + output
  - Verify analytics dashboard populates
  - Verify `GET /providers` and architecture page

## Docker verification (optional)
- `docker compose up` starts `postgres`, `api`, and `web`.
- Ports are documented (`POSTGRES_PORT`, `WEB_PORT`, `API_PORT`) and conflicts are handled.

## Screenshot capture
- Dashboard overview (stats + recent activity + status breakdown)
- Workflow catalog
- Workflow template editor (create/edit)
- Workflow run detail showing timeline logs and JSON input/output payloads
- Analytics/observability sections (usage, success rate, recent activity)
- Architecture/provider adapter page

## GitHub metadata (recommended)
Suggested repo description:
- Public fullstack AI workflow orchestration dashboard demonstrating schema-driven templates, simulated provider execution, workflow logs, analytics, and operational dashboard patterns.

Suggested topics:
- nextjs
- nestjs
- postgresql
- typeorm
- workflow-automation
- ai-workflows
- provider-pattern
- operational-dashboard
- fullstack
- systems-engineering

## LinkedIn launch (optional)
- LinkedIn Featured description added.
- LinkedIn post drafted (see `docs/PORTFOLIO_COPY.md`).
- 3–6 screenshots or a short demo clip ready.
- MVP boundaries stated clearly (simulation-only, public-safe, no private data).
