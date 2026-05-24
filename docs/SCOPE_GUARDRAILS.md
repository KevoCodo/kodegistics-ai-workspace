# Scope Guardrails

This project is a public portfolio showcase. It must remain generic, sanitized, and safe for public GitHub use.

## Strict MVP boundaries
- Demonstrate workflow templates, run orchestration, logs, and a clear operational dashboard UX.
- Use deterministic, local simulation logic (no external provider calls).
- Prefer clarity and interview-readability over scale, optimization, or production hardening.

## Features intentionally out of scope
- Authentication, authorization, SSO, or user management
- Billing, payments, subscriptions, invoices, or usage metering
- Multi-tenant organizations, teams, invites, or complex role/permission systems
- External connectors and integrations in the MVP (OpenAI, Anthropic, n8n, etc.)
- A visual workflow builder (drag-and-drop authoring, versioning, publishing pipelines)
- Background job infrastructure (queues/workers) beyond simple in-process simulation
- Production hardening claims (autoscaling, SOC2-style controls, etc.)

## Provider adapter scope (Phase 11+)
- A provider adapter interface + registry exists to demonstrate architecture readiness.
- Only `simulated` execution is implemented and enabled.
- Future provider types may be described in docs, but must not be implemented in the MVP.

## Template CRUD scope (Phase 9)
- Template management is admin-lite CRUD only (create/edit/deactivate workflow templates).
- This is not a production workflow automation platform and not a full authoring/builder system.

## Privacy and security rules (public GitHub safe)
- No secrets, API keys, tokens, or credentials in the repo.
- No private business logic, internal prompts, or proprietary workflows.
- No private company/client names, datasets, or screenshots with real data.
- Keep sample inputs/outputs generic and sanitized.
- Validate inputs and keep logs safe-by-default (no sensitive payloads).

