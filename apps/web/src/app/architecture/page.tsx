import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

export default function ArchitecturePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-border bg-card/70 p-6 shadow-sm backdrop-blur md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Architecture</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          AI Workflow Automation Dashboard is a public, sanitized portfolio
          project. It demonstrates clean boundaries between UI, API,
          persistence, and provider adapters, with simulation as the default and
          OpenAI as an optional opt-in path.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="neutral">Public GitHub safe</Badge>
          <Badge variant="neutral">Simulated execution</Badge>
          <Badge variant="neutral">Optional OpenAI adapter</Badge>
          <Badge variant="neutral">No auth in MVP</Badge>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Frontend layer (Next.js)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>
              Dashboard pages, workflow catalog, run history, and run detail
              views.
            </div>
            <div>
              Uses a small API client configured via{" "}
              <code>NEXT_PUBLIC_API_URL</code>.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backend API layer (NestJS)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>REST APIs for workflows, runs, and logs.</div>
            <div>
              Validates requests with DTOs and manages the run lifecycle state
              transitions used by the simulation runner.
            </div>
            <div>
              Provides lightweight analytics endpoints for dashboard
              observability (usage overview, status breakdown, recent activity).
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database layer (Postgres + TypeORM)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>Stores workflows, workflow runs, and workflow logs.</div>
            <div>
              For local development, TypeORM <code>synchronize</code> is enabled
              by default.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Provider adapter layer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>
              Runs are routed through a provider registry so execution adapters
              can be swapped without changing the API contract.
            </div>
            <div>
              <code>simulated</code> is the default provider.{" "}
              <code>openai</code> is optional and only executes when backend
              environment configuration enables it. <code>anthropic</code>,{" "}
              <code>local</code>, and <code>custom-webhook</code> are
              placeholder-only registry entries.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Provider selection flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>
              Workflow create/edit forms allow selecting executable adapters.
              Coming soon providers are visible but disabled;{" "}
              <code>GET /providers</code> reports implementation and
              availability status.
            </div>
            <div>
              The goal is to keep the core domain model stable while swapping
              execution backends.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reference docs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>
              Repo planning docs live under <code>docs/</code>, including{" "}
              <code>docs/ARCHITECTURE.md</code>.
            </div>
            <div className="text-xs text-muted-foreground">
              An in-app docs viewer is intentionally out of scope for the early
              MVP.
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Simple architecture diagram</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-auto rounded-lg border border-border bg-muted/60 p-4 text-xs text-foreground/80">
              {`Browser (Next.js UI)
  |
  | REST/JSON
  v
NestJS API (Workflows + Runs + Logs + Analytics)
  |
  | resolve provider
  v
Provider Registry
  |-- Simulated Provider (default)
  |-- OpenAI Provider (optional; configuration-gated)
  \`-- Future Provider Placeholders (non-executable)
  |
  | persist logs + state
  v
PostgreSQL`}
            </pre>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
