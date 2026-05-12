# Workflow Model

This document defines the core concepts used throughout the dashboard. The MVP uses a small, intentionally generic model that is easy to understand and extend.

## Core concepts

### Workflow
A **Workflow** is a predefined template that describes:
- A workflow category (e.g., writing, summarization)
- Expected input fields (a simple schema)
- What the output should look like (a result schema or description)
- The simulation "runner" to execute it

Example fields (conceptual):
- `id`, `name`, `slug`, `category`, `description`, `status`
- `inputSchema` (JSON schema-like shape for UI rendering)
- `version` (optional, for future evolution)

### WorkflowRun
A **WorkflowRun** is a single execution instance of a workflow. It stores:
- Which workflow was executed
- The user-provided input payload
- Execution status and timestamps
- A final output payload (if completed)
- Failure metadata (if failed)

Example fields (conceptual):
- `id`, `workflowId`
- `status` (`queued` | `running` | `completed` | `failed`)
- `input` (JSON), `output` (JSON)
- `startedAt`, `completedAt`

### WorkflowLog
A **WorkflowLog** is an append-only record emitted during a run. In the MVP, logs are simple and UI-friendly (step + message + timestamp).

Example fields (conceptual):
- `id`, `workflowRunId`
- `stepName`
- `message`
- `createdAt`

## Execution statuses
- `queued` - accepted and waiting to start
- `running` - actively executing steps
- `completed` - finished successfully with an output
- `failed` - finished with an error

## Simulated execution lifecycle (MVP)
For the MVP, execution is synchronous and simulated inside the API service:
- A run is created as `queued` with an initial log entry.
- The service logs a predictable sequence of steps:
  - `queued`
  - `validation`
  - `routing`
  - `simulated_processing`
  - `formatting`
  - `completed` (or `failed`)
- The run is updated to `running`, then `completed` with an output payload (or `failed` with an error message).
No external AI providers or workflow tools are called.

## Initial workflow categories
- Writing assistance
- Summarization
- Classification / routing
- Meeting notes

## Initial workflow examples

### Blog Draft Workflow
Goal: generate a structured blog post draft from a topic and audience.
- Input: `topic`, `audience`, `tone`, `lengthHint`
- Output: `title`, `outline`, `draft`
- Simulation idea: build a deterministic outline template + placeholder draft text

### Report Summary Workflow
Goal: summarize a pasted report into key takeaways and action items.
- Input: `reportText`, `summaryLength`
- Output: `summary`, `keyPoints[]`, `actionItems[]`
- Simulation idea: extract sections by simple heuristics (headings/length), then format

### Intake Classification Workflow
Goal: classify an "intake" text into a category and priority.
- Input: `intakeText`
- Output: `category`, `priority`, `confidence`, `rationale`
- Simulation idea: keyword-based routing table with predictable outcomes

### Meeting Summary Workflow
Goal: turn meeting notes into a concise recap and next steps.
- Input: `notesText`, `attendees` (optional)
- Output: `summary`, `decisions[]`, `nextSteps[]`
- Simulation idea: split by lines/bullets and format into sections
