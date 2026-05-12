# Development Phases

This roadmap keeps the project focused and portfolio-friendly. Each phase should produce a demoable slice with minimal complexity.

## Phase 0: Documentation and alignment
- Create planning docs (scope, architecture, models, phases)
- Define MVP boundaries and public GitHub guardrails

## Phase 1: Project setup and base app structure (completed)
- Initialize monorepo or two-package layout (frontend/backend)
- Add linting/formatting conventions and basic CI (optional)
- Add Docker Compose for Postgres (no secrets committed)

## Phase 2: Backend models and API foundation (completed)
- Create TypeORM entities: `Workflow`, `WorkflowRun`, `WorkflowLog`
- Add REST endpoints for listing workflows and creating runs
- Add input validation and consistent API error shapes

## Phase 3: Frontend dashboard and workflow catalog (completed)
- Workflow catalog UI (list/detail)
- Simple run list UI (status, timestamps)
- Clean base layout with Tailwind + shadcn/ui

## Phase 4: Workflow run form and simulated execution (completed)
- Dynamic input forms driven by workflow input schema
- Backend simulation runner that updates status + writes logs
- Basic "run details" page (status + output)

## Phase 5: Logs, result output, and polish
- Log viewer UI (levels, timestamps, filtering)
- Better status UX (loading states, error states)
- Seed workflows and improve demo content (still generic)

Status: completed - Timeline-style logs, improved dashboard/run UX, seeded sample runs for screenshot readiness.

## Phase 6A: Functional MVP wiring and end-to-end execution (completed)
- Ensure workflows load end-to-end (web -> API -> DB)
- Ensure runs can be created from workflow detail forms
- Ensure run detail shows ordered logs and output payload
- Ensure dashboard stats populate from real API data

## Phase 6: README, screenshots, and public portfolio cleanup
- Finalize README with setup steps
- Add screenshots/gifs using only sanitized sample data
- Confirm scope guardrails and remove any accidental sensitive content

Status: completed - README refreshed, docs aligned, and the UI is screenshot-ready for public portfolio use.

## Phase 6B: Launch readiness (completed)
- Improve UI polish and screenshot readiness
- Add portfolio-focused documentation and talking points
- Verify public-safe copy and guardrails across the repo

## Future Phase: Optional real OpenAI/n8n integration
- Add connector interfaces and feature flags
- Implement optional provider integrations without changing core domain model
- Keep credentials out of the repo and document local setup securely
