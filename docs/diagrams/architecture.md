# Architecture Diagram (Text)

Use this as a clean, readable diagram for README, interviews, or LinkedIn posts.

```
Next.js UI
  -> NestJS REST API
    -> Workflow Service
    -> Provider Registry
      -> Simulated Provider
    -> Workflow Log Service
    -> Analytics Service
  -> PostgreSQL
```

Notes:
- Service names are conceptual groupings for discussion; the implementation uses NestJS modules/services.
- The provider adapter layer is present for architecture readiness, but only `simulated` execution is enabled in the MVP.
- Simulation is synchronous in the MVP and intentionally avoids external calls.

Future optional providers (not implemented):
- OpenAI
- Anthropic
- Local LLM providers
- n8n workflow execution
