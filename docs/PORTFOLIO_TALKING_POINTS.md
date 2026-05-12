# Portfolio Talking Points

Use these points for interview walkthroughs, LinkedIn posts, or a short demo video. Everything is intentionally generic and public-safe.

## What this project is
- A public portfolio MVP that demonstrates a workflow automation dashboard with simulated “AI-style” execution.
- A clear separation between UI (Next.js), API (NestJS), and persistence (Postgres + TypeORM).

## What this project is not
- Not a production SaaS.
- No authentication, billing, or multi-tenant admin complexity.
- No OpenAI or n8n integration in the MVP.

## Architectural decisions (why)
- **Simulation-first execution:** keeps the demo deterministic, repeatable, and safe for public GitHub use.
- **Logs as a first-class model:** every run emits step logs so reviewers can see “execution visibility” and traceability.
- **Schema-driven inputs:** workflows define input fields; the UI renders forms from the workflow’s `inputSchema`.
- **Thin controllers / readable services:** orchestration logic lives in services; controllers are kept minimal.
- **Pragmatic persistence:** Postgres + TypeORM is familiar and realistic for fullstack demos.

## Demo flow (30–60 seconds)
1. Open the dashboard to show seeded workflows and sample runs.
2. Go to Workflows, open a workflow, and submit a run.
3. Open the run detail page to show:
   - run status + timestamps
   - timeline logs
   - input/output JSON payloads
4. Return to dashboard to show updated stats and recent activity.

## Key engineering concepts demonstrated
- Domain modeling: `Workflow`, `WorkflowRun`, `WorkflowLog`
- State transitions: `queued` -> `running` -> `completed` / `failed`
- Input validation boundaries (DTO validation + workflow schema checks)
- Observable execution: ordered logs + structured outputs
- Public-safe demo data: seeded workflows + seeded sample runs (only when DB is empty)

## How to talk about “AI” without overselling
- The MVP demonstrates **AI workflow orchestration UX and architecture patterns**.
- Execution is simulated intentionally so reviewers can focus on:
  - lifecycle management
  - validation
  - logs and output handling
  - clear interfaces for future integrations

## Future enhancement ideas (optional discussion)
- Real LLM connectors behind feature flags
- Streaming run updates (SSE/WebSockets)
- Job queue + worker for async execution
- Auth only if a demo scenario needs it
- Workflow builder UI for authoring templates

