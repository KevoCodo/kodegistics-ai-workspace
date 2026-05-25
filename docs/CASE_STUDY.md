# Case Study: AI Workflow Automation Dashboard

## Problem
Many businesses want “AI automation,” but real operational value comes from repeatable workflows with structured inputs/outputs, execution visibility, and traceability. Prompt demos alone don’t show how runs are tracked, debugged, and observed over time.

## Goal
Build a public-safe fullstack showcase that demonstrates how AI workflow orchestration can be structured without exposing private client/business systems or requiring external provider credentials.

## Approach
- Model workflow templates as data (name, category, status, `inputSchema`, `providerType`)
- Generate schema-driven forms in the UI from workflow templates
- Implement simulated provider execution (deterministic and credential-free)
- Track run lifecycle (`queued` -> `running` -> `completed` / `failed`)
- Persist runs, logs, and structured outputs to PostgreSQL via TypeORM
- Add lightweight analytics endpoints to support operational visibility (success rate, usage, recent activity)

## Architecture
The app is a monorepo with a Next.js frontend and a NestJS backend. The backend owns the workflow/run domain model and persistence.

```
Next.js UI
  -> NestJS REST API
    -> Workflow Service (templates + validation)
    -> Provider Registry (resolve provider by type)
      -> Simulated Provider (default execution)
      -> OpenAI Provider (optional; disabled by default)
    -> Workflow Log Service (append-only log entries)
    -> Analytics Service (aggregations)
  -> PostgreSQL (workflows, runs, logs)
```

## Key Features
- Workflow catalog grouped by category/status
- Template management (create/edit/deactivate) scoped as admin-lite CRUD
- Schema-driven workflow run forms rendered from `inputSchema`
- Run detail page showing status, timestamps, ordered logs, and JSON input/output
- Dashboard observability views (status breakdown, usage summary, recent activity)
- Provider readiness endpoint (`GET /providers`) and architecture page for walkthroughs

## Technical Decisions
- Simulated execution first
  - Keeps the repo deterministic and easy to run locally
  - Avoids credentials, external rate limits, and private data risks
  - Improves demo reliability for screenshots and interviews
- Schema-driven forms
  - Reduces hardcoded UI logic per workflow
  - Keeps workflow definitions and UI behavior aligned
- Execution logs as a first-class concern
  - Makes runs traceable and debuggable
  - Supports operational UX patterns beyond “request/response”
- PostgreSQL persistence
  - Enables realistic run history and analytics derived from stored data

## Provider Adapter Strategy
The provider adapter layer is an architecture readiness feature:
- Workflows include `providerType` (default: `simulated`)
- A provider registry resolves the correct provider and routes execution through an interface
- The simulated provider is enabled by default; the optional OpenAI adapter requires explicit configuration

This demonstrates how a real provider can be added behind a feature flag without changing the workflow/run API contract.

## MVP Boundaries
- No authentication or user accounts
- No billing or payments
- No real provider execution by default; optional OpenAI execution is restricted to sanitized demo inputs
- No n8n execution or external workflow engine integration
- No private business/client data or proprietary workflows
- No production-hardening claims (portfolio MVP only)

## What I Learned
- How to model workflow/run/log domains in a way that supports operational UX
- The practical value of schema-driven UI patterns for reducing duplication
- Why execution logs and lifecycle state matter for traceability and observability
- How a small provider abstraction can keep orchestration logic stable while enabling future extensibility

## Future Improvements
- Add additional optional provider adapters behind feature flags
- Stream run updates (SSE/WebSockets)
- Async execution via a queue/worker for long-running workflows
- More analytics slices (per-workflow trend views, error breakdowns)

