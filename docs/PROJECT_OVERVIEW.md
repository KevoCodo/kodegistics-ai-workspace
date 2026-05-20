# AI Workflow Automation Dashboard - Project Overview

## Purpose
Build a public, sanitized portfolio project that demonstrates how an AI workflow orchestration dashboard can be structured: workflow templates, run lifecycle tracking, execution logs, and operational visibility.

The MVP uses simulated provider execution (no external AI calls) to keep the repo deterministic, credential-free, and safe for public GitHub.

## Target audience
- Recruiters and hiring teams evaluating fullstack engineering and system design
- Engineers interested in workflow orchestration and operational tooling patterns
- Anyone looking for a realistic-but-generic reference implementation of workflow UX + backend layering

## What this project demonstrates
- Fullstack TypeScript architecture (Next.js + NestJS)
- Workflow templates with schema-driven inputs (forms generated from `inputSchema`)
- Run lifecycle management (`queued` -> `running` -> `completed` / `failed`)
- Provider adapter layer (registry + `providerType`) to show future extensibility
- Execution logs for traceability (ordered, UI-friendly steps)
- Persistence in PostgreSQL via TypeORM (workflows, runs, logs)
- Lightweight analytics for observability discussion (success rate, usage, recent activity)

## What this project intentionally does not do
- Authentication/authorization, SSO, or user management
- Billing, payments, subscriptions, or usage metering
- Multi-tenant org/team management or complex roles/permissions
- Real OpenAI/Anthropic/local model execution (simulated provider only)
- n8n execution or external workflow engine integrations
- Private company/client data, proprietary workflows, or internal prompts
- Production-hardening claims (this is a portfolio MVP, not a SaaS)

## High-level MVP summary
The MVP lets a reviewer:
1. Browse workflow templates (catalog)
2. Create/edit/deactivate workflow templates (admin-lite CRUD)
3. Start a workflow run via schema-driven input forms
4. Observe lifecycle state transitions and ordered logs (timeline-style)
5. Inspect structured input/output payloads
6. Review lightweight analytics and provider architecture readiness

