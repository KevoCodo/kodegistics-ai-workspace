# Architecture Diagram (Text)

Use this as a clean, readable diagram for README, interviews, or LinkedIn posts.

```
Next.js UI
  -> NestJS REST API
    -> Workflow Service
    -> Provider Registry
      -> Simulated Provider (default)
      -> OpenAI Provider (optional; disabled by default)
    -> Workflow Log Service
    -> Analytics Service
  -> PostgreSQL
```

Notes:
- Service names are conceptual groupings for discussion; the implementation uses NestJS modules/services.
- The provider adapter layer supports `simulated` by default and an opt-in `openai` backend adapter.
- Simulation is synchronous in the MVP and intentionally avoids external calls.

Future optional providers (not implemented):
- Anthropic
- Local LLM providers
- n8n workflow execution
