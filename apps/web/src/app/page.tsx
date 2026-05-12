"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api, getApiBaseUrl, type WorkflowRun, type Workflow } from "../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { RunStatusBadge } from "../components/status-badges";
import { formatDateTime, formatRelativeTime } from "../lib/time";

type DashboardState =
  | { kind: "loading" }
  | { kind: "error"; message: string; details?: string }
  | {
      kind: "ready";
      apiOk: boolean;
      workflows: Workflow[];
      runs: WorkflowRun[];
    };

function formatCount(n: number) {
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(n);
}

export default function DashboardPage() {
  const [state, setState] = useState<DashboardState>({ kind: "loading" });
  const apiBaseUrl = getApiBaseUrl();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [health, workflows, runs] = await Promise.all([
          api.health().catch(() => null),
          api.listWorkflows(),
          api.listRuns(),
        ]);
        if (cancelled) return;
        setState({
          kind: "ready",
          apiOk: Boolean(health?.status === "ok"),
          workflows,
          runs,
        });
      } catch (e) {
        if (cancelled) return;
        const details = e instanceof Error ? e.message : "Failed to load data";
        setState({
          kind: "error",
          message:
            "Unable to reach the API. Start the backend and confirm NEXT_PUBLIC_API_URL is set.",
          details,
        });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    if (state.kind !== "ready") return null;
    const activeWorkflows = state.workflows.filter(
      (w) => w.status === "active",
    ).length;
    const totalRuns = state.runs.length;

    const runsByStatus = state.runs.reduce(
      (acc, run) => {
        acc[run.status] += 1;
        return acc;
      },
      { queued: 0, running: 0, completed: 0, failed: 0 } as Record<
        WorkflowRun["status"],
        number
      >,
    );

    const workflowsByCategory = state.workflows.reduce((acc, w) => {
      acc[w.category] = (acc[w.category] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryRows = Object.entries(workflowsByCategory)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8);

    return { activeWorkflows, totalRuns, runsByStatus, categoryRows };
  }, [state]);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-border bg-card/70 p-6 shadow-sm backdrop-blur md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="max-w-3xl text-base text-muted-foreground">
              Public portfolio dashboard demonstrating workflow catalog design, run
              lifecycle state handling, validation boundaries, and observable logs and
              outputs. Execution is simulated only (no external AI calls).
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutral">Public showcase</Badge>
              <Badge variant="neutral">Simulated execution</Badge>
              <Badge variant="neutral">No auth in MVP</Badge>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link
              href="/workflows"
              className="inline-flex items-center rounded-md border border-border bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
            >
              Browse workflows
            </Link>
            <Link
              href="/runs"
              className="inline-flex items-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted/60"
            >
              View runs
            </Link>
          </div>
        </div>
      </section>

      {state.kind === "error" && (
        <Card className="border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30">
          <CardHeader>
            <CardTitle className="text-rose-800">API unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-rose-800">
            <div>{state.message}</div>
            <div className="text-xs text-rose-700">
              Current API base URL: <code>{apiBaseUrl ?? "not configured"}</code>
            </div>
            {state.details ? (
              <details className="pt-2 text-xs text-rose-700">
                <summary className="cursor-pointer select-none">Details</summary>
                <div className="mt-2 whitespace-pre-wrap">{state.details}</div>
              </details>
            ) : null}
          </CardContent>
        </Card>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Active Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">
              {state.kind === "ready"
                ? formatCount(summary!.activeWorkflows)
                : "-"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {state.kind === "ready"
                ? `of ${formatCount(state.workflows.length)} total`
                : "Loading workflow catalog..."}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">
              {state.kind === "ready" ? formatCount(summary!.totalRuns) : "-"}
            </div>
            {state.kind === "ready" ? (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>Completed: {summary!.runsByStatus.completed}</span>
                <span>Failed: {summary!.runsByStatus.failed}</span>
                <span>Queued: {summary!.runsByStatus.queued}</span>
                <span>Running: {summary!.runsByStatus.running}</span>
              </div>
            ) : (
              <div className="mt-1 text-xs text-muted-foreground">
                Loading run history...
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Simulation Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">On</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Deterministic runner, no external calls.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            {state.kind === "ready" ? (
              <Badge variant={state.apiOk ? "success" : "danger"}>
                {state.apiOk ? "API online" : "API offline"}
              </Badge>
            ) : (
              <Badge variant="neutral">Checking...</Badge>
            )}
            <div className="mt-2 text-xs text-muted-foreground">
              API base URL: <code>{apiBaseUrl ?? "not configured"}</code>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {state.kind === "loading" && (
              <div className="text-sm text-muted-foreground">Loading runs...</div>
            )}
            {state.kind === "error" && (
              <div className="space-y-1 text-sm text-rose-800">
                <div>Unable to load recent activity.</div>
                <div className="text-xs text-rose-700">
                  Confirm the API is running and <code>NEXT_PUBLIC_API_URL</code> is
                  set.
                </div>
              </div>
            )}
            {state.kind === "ready" && state.runs.length === 0 && (
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>No runs yet.</div>
                <div>
                  Start a run from any workflow detail page to populate activity and logs.
                </div>
              </div>
            )}
            {state.kind === "ready" && state.runs.length > 0 && (
              <ul className="space-y-2">
                {state.runs.slice(0, 5).map((run) => (
                  <li
                    key={run.id}
                    className="rounded-lg border border-border bg-background/40 transition-colors hover:bg-muted/40"
                  >
                    <Link
                      href={`/runs/${run.id}`}
                      className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">
                          {run.workflow?.name ?? run.workflowId}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatRelativeTime(run.createdAt)} - {formatDateTime(run.createdAt)}
                        </div>
                      </div>
                      <RunStatusBadge status={run.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex items-center justify-between gap-3">
              <Link className="text-sm underline" href="/runs">
                View all runs
              </Link>
              <Link className="text-sm underline" href="/workflows">
                Create another run
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Workflow categories</CardTitle>
          </CardHeader>
          <CardContent>
            {state.kind === "ready" ? (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Quick overview of seeded workflow templates.
                </div>
                <ul className="space-y-2">
                  {summary!.categoryRows.map(([category, count]) => (
                    <li
                      key={category}
                      className="flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2 text-sm"
                    >
                      <span className="truncate">{category}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-1">
                  <Link className="text-sm underline" href="/workflows">
                    Browse all workflows
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Loading categories...</div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>What this dashboard demonstrates</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Workflow catalog and routing concepts</li>
              <li>Run lifecycle state management (queued/running/etc.)</li>
              <li>Validation boundaries and safe defaults</li>
              <li>Observable logs and structured outputs</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demo flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>
              Open a workflow, submit inputs, then view the resulting run timeline and
              output payload.
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link className="text-sm underline" href="/workflows">
                Start from workflows
              </Link>
              <span className="text-muted-foreground/60">-</span>
              <Link className="text-sm underline" href="/architecture">
                Architecture overview
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
