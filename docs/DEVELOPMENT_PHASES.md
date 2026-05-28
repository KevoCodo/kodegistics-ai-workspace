# Development Phases

This roadmap keeps the project focused and portfolio-friendly. Each phase should produce a demoable slice with minimal complexity.

## Phase 0: Documentation and alignment
- Create planning docs (scope, architecture, models, phases)
- Define MVP boundaries and public GitHub guardrails

## Phase 1: Project setup and base app structure
- Initialize monorepo layout (frontend + backend workspaces)
- Add repeatable local database setup (Docker Compose)

## Phase 2: Backend models and API foundation
- Implement TypeORM entities: `Workflow`, `WorkflowRun`, `WorkflowLog`
- Add REST endpoints for workflows, runs, and logs
- Validate inputs and keep error responses readable

## Phase 3: Frontend dashboard and workflow catalog
- Workflow catalog UI (list/detail)
- Run list UI (status + timestamps)
- Clean base layout with Tailwind + minimal component primitives

## Phase 4: Schema-driven forms and simulated execution
- Render input forms driven by workflow `inputSchema`
- Implement a simulation runner that updates run status and emits ordered logs
- Run detail page with timeline logs and structured output payloads

## Phase 5: Demo readiness and polish
- Seed workflows on API startup (idempotent upsert)
- Optionally seed sample runs when the DB is empty (screenshot-ready UI)
- Improve UI states and copy for demo walkthroughs

## Phase 8: Portfolio polish and public identity upgrade (completed)
- Recruiter-friendly README and docs that match the implementation
- Launch checklist for GitHub/LinkedIn readiness (no secrets, clear setup)
- Screenshot and diagram guidance for consistent, public-safe visuals

## Phase 9: Workflow template management (completed)
- Add admin-lite workflow template CRUD (create/edit/deactivate)
- Keep workflows public-safe and MVP-scoped (no visual builder, no external calls)
- Preserve existing run creation and simulated lifecycle behavior

## Phase 10: Run insights and observability layer (completed)
- Add lightweight analytics endpoints (`/analytics/*`) for dashboard visibility
- Upgrade dashboard to display workflow health, status breakdown, and recent activity
- Keep observability generic (no prompt evaluation, no heavy tracing)

## Phase 11: Provider adapter layer and architecture readiness (completed)
- Add a minimal provider adapter interface and a provider registry
- Implement a `simulated` provider (deterministic, safe, no external calls)
- Persist `providerType` on workflow templates (default: `simulated`)
- Route workflow run execution through the provider registry
- Expose `GET /providers` for architecture readiness walkthroughs

## Phase 12: Final launch and public showcase prep (completed)
- Finalize README for public GitHub + interview walkthroughs
- Review and tighten docs for accuracy and public-safe framing
- Add portfolio copy and a case study doc for reuse (resume/LinkedIn/interviews)
- Verify demo flow, Docker setup, and screenshot readiness

## Phase 13A: OpenAI provider adapter foundation (completed)
- Add an optional OpenAI backend adapter using the existing provider contract and registry
- Keep `simulated` as the default execution path and disable OpenAI unless explicitly configured
- Emit provider lifecycle logs and persist only safe provider metadata with completed outputs
- Document opt-in real-provider guardrails and environment configuration

## Phase 13B: UI wiring, demo workflow, and logging polish (completed)
- Expose provider selection in workflow create/edit forms with `simulated` as the recommended default
- Surface backend provider availability, safe run metadata, and provider lifecycle log events in the UI
- Seed a sanitized `AI Business Summary Workflow` for optional provider demonstrations
- Add lightweight dashboard provider distribution using existing run/workflow data

## Phase 14A: Provider registry expansion and failure readiness (completed)
- Register `anthropic`, `local`, and `custom-webhook` as non-executable provider placeholders
- Expand safe provider status reporting with implementation and enabled state
- Preserve lifecycle/log integrity for clean placeholder failure responses
- Display coming-soon provider options in the UI without enabling execution
- Defer retry state fields until a future phase defines retry behavior

## Future phases (out of scope for MVP)
- Additional optional real provider connectors behind feature flags
- Streaming updates (SSE/WebSockets)
- Async execution (queue + worker)
- Authentication/billing only if explicitly requested later
