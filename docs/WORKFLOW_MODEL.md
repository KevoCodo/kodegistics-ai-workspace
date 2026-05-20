# Workflow Model

This document defines the core concepts used throughout the dashboard. The MVP intentionally uses a small, generic model that is easy to understand and extend.

## Core concepts

### Workflow (template)
A workflow is a predefined template that describes:
- A category and description (for catalog UX)
- The expected input fields (`inputSchema`) used to render forms
- The execution provider type (`providerType`) used by the backend to route runs

**Key fields (implemented)**
- `id`, `name`, `slug`, `description`, `category`, `status`
- `providerType` (`simulated` in the MVP)
- `inputSchema` (a small JSON shape for UI rendering; not full JSON Schema)
- `createdAt`, `updatedAt`

### ProviderType (architecture readiness)
The provider adapter layer is an architecture readiness feature: it allows the execution backend to be swapped without changing the workflow/run API contract.

- Supported providers in the MVP: `simulated` only
- No real OpenAI/Anthropic/local-LLM execution is implemented

### WorkflowRun
A workflow run is a single execution instance of a workflow. It stores:
- Which workflow was executed
- The user-provided input payload
- Execution status and timestamps
- A final output payload (if completed)
- Failure details (if failed)

**Key fields (implemented)**
- `id`, `workflowId`
- `status` (`queued` | `running` | `completed` | `failed`)
- `inputPayload` (JSON), `outputPayload` (JSON or null)
- `errorMessage` (string or null)
- `startedAt`, `completedAt`
- `createdAt`, `updatedAt`

### WorkflowLog
A workflow log is an append-only record emitted during a run. In the MVP, logs are UI-friendly (step + message + timestamp).

**Key fields (implemented)**
- `id`, `workflowRunId`
- `stepName`
- `message`
- `createdAt`

## Execution statuses
- `queued`: accepted and waiting to start
- `running`: actively executing steps
- `completed`: finished successfully with an output
- `failed`: finished with an error

## Simulated execution lifecycle (MVP)
Execution is synchronous and simulated inside the API service:
- A run is created as `queued` with an initial log entry.
- The service logs a predictable sequence of steps:
  - `queued`
  - `validation`
  - `routing`
  - `provider_resolved`
  - `provider_execution_started`
  - `simulated_processing`
  - `formatting`
  - `provider_execution_completed`
  - `completed` (or `failed`)
- The run is updated to `running`, then `completed` with an output payload (or `failed` with an error message).

No external AI providers or workflow tools are called in the MVP.

## Seed data (demo readiness)
- Workflows are seeded on API startup (idempotent upsert by `slug`).
- Sample runs can also be seeded for screenshot-ready UI (only when the database has zero runs).

## Workflow template management (admin-lite)
The MVP includes lightweight template CRUD so the catalog can be edited without turning this into a full workflow builder.

- Create templates: `POST /workflows`
- Update templates: `PATCH /workflows/:id` (slug is intentionally stable)
- Delete behavior: `DELETE /workflows/:id` deactivates the template (sets status to `inactive`) instead of hard deleting, so existing workflow runs remain valid.

### Active vs inactive templates
- `active`: shown normally in the catalog and intended to be run.
- `inactive`: still viewable (and keeps historical runs intact), but should be visually de-emphasized.

### Input schema shape
The `inputSchema` value is a small JSON structure used for form rendering (not full JSON Schema):

```ts
inputSchema: {
  fields: Array<{
    name: string
    label: string
    type: 'text' | 'textarea' | 'number' | 'select'
    required?: boolean
    placeholder?: string
    options?: Array<{ label: string; value: string }> // select only
  }>
}
```

## Run insights and observability (Phase 10)
To support operational dashboard discussion without overbuilding, the API exposes lightweight analytics endpoints that aggregate existing run/workflow data:
- Total workflows (active/inactive)
- Total runs + status breakdown (queued/running/completed/failed)
- Success rate (completed / (completed + failed))
- Average execution time (finished runs with `startedAt` + `completedAt`)
- Recent activity (latest runs)
- Workflow usage summary (runs and health per workflow)

These metrics are derived from Postgres data and are intentionally not a full tracing or prompt-evaluation system.

