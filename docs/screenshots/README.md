# Screenshot Guide

Use only generic, sanitized data. The API can seed sample runs to make the UI screenshot-ready (only when the database is empty).

## Suggested screenshots
- `dashboard.png`: dashboard overview (stats + recent activity + status breakdown)
- `workflows.png`: workflow catalog grouped by category/status
- `workflow-editor.png`: workflow template editor (create/edit)
- `workflow-detail.png`: `AI Business Summary Workflow` detail showing provider explanation and schema-driven input form
- `run-detail.png`: completed simulated run showing provider metadata and provider lifecycle timeline entries
- `provider-disabled.png`: optional OpenAI-selected run showing the clean disabled/missing-configuration state
- `analytics.png`: observability sections including provider distribution
- `architecture.png`: architecture + provider adapter page

## Capture tips
- Prefer a consistent viewport width (e.g., 1280px+) and zoom.
- Keep browser chrome minimal if you're creating a featured image.
- Use only fake names and generic sample content.
- If you access the web UI by a non-localhost hostname/IP, set `NEXT_ALLOWED_DEV_ORIGINS` and restart the web dev server.

