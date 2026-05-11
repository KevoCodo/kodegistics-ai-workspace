# Scope Guardrails

This project is a public portfolio showcase. It must remain generic, sanitized, and safe for public GitHub use.

## Strict MVP boundaries
- Build a workflow catalog, workflow run execution simulation, logs, and results display.
- Use deterministic, local simulation logic (no external API calls).
- Focus on clean architecture, clarity, and demonstrability over completeness.

## Features not to add in early phases
- Authentication, authorization, SSO, or user management
- Billing, payments, subscriptions, invoices, or usage metering
- Multi-tenant organizations, teams, invites, or complex role/permission systems
- Marketplace, plugin distribution, or "app store" concepts
- Webhook ecosystems, third-party integrations, or external connectors
- Background job infrastructure (queues/workers) beyond simple in-process simulation
- "Production" concerns like autoscaling, rate limiting at scale, or SOC2-style controls

## Privacy and security rules
- Do not include secrets, API keys, tokens, or fake credentials in the repo.
- Do not include any private business logic, internal prompts, or proprietary workflows.
- Do not include any private company/client names, datasets, or screenshots with real data.
- Keep sample inputs/outputs generic (e.g., "Acme Co." is fine; real entities are not).
- Prefer safe-by-default design: validate inputs, avoid arbitrary code execution, and log defensively.

## Data rules (public GitHub safe)
- No private business/client data.
- No proprietary "KodeGistics OS" code, workflows, prompts, schemas, or identifiers.
- Keep the domain language generic: "workflow", "run", "log", "result".

## Explicit non-goals
- No authentication in MVP unless explicitly requested later.
- No billing/payments.
- No team management.
- No complex admin roles.
