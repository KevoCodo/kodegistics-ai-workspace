import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { JsonBlock } from "../../../components/json-block";
import {
  getApiBaseUrl,
  getApiBaseUrlOrThrow,
  type WorkflowLog,
  type WorkflowRun,
} from "../../../lib/api";
import { RunStatusBadge } from "../../../components/status-badges";
import { formatDateTime, formatRelativeTime } from "../../../lib/time";

async function getRun(id: string): Promise<WorkflowRun> {
  const baseUrl = getApiBaseUrlOrThrow();
  const res = await fetch(`${baseUrl}/workflow-runs/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Run not found: ${id}`);
  }
  return (await res.json()) as WorkflowRun;
}

async function getRunLogs(id: string): Promise<WorkflowLog[]> {
  const baseUrl = getApiBaseUrlOrThrow();
  const res = await fetch(
    `${baseUrl}/workflow-runs/${encodeURIComponent(id)}/logs`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    throw new Error(`Logs not found for run: ${id}`);
  }
  return (await res.json()) as WorkflowLog[];
}

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const apiBaseUrl = getApiBaseUrl();
  let run: WorkflowRun | null = null;
  let logs: WorkflowLog[] = [];
  let errorMessage: string | null = null;

  try {
    [run, logs] = await Promise.all([getRun(id), getRunLogs(id)]);
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : "Failed to load run";
  }

  if (!run) {
    return (
      <div className="space-y-6">
        <section className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Run details</h1>
          <p className="text-sm text-muted-foreground">Unable to load run details.</p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link className="underline" href="/runs">
              Back to runs
            </Link>
            <Link className="underline" href="/">
              Back to dashboard
            </Link>
          </div>
        </section>

        <Card className="border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30">
          <CardHeader>
            <CardTitle className="text-rose-800">API unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-rose-800">
            <div>
              Ensure the API is running and the web app is configured with{" "}
              <code>NEXT_PUBLIC_API_URL</code>.
            </div>
            <div className="text-xs text-rose-700">
              Current API base URL: <code>{apiBaseUrl ?? "not configured"}</code>
            </div>
            {errorMessage ? (
              <details className="pt-2 text-xs text-rose-700">
                <summary className="cursor-pointer select-none">Details</summary>
                <div className="mt-2 whitespace-pre-wrap">{errorMessage}</div>
              </details>
            ) : null}
          </CardContent>
        </Card>
      </div>
    );
  }

  const orderedLogs = [...logs].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {run.workflow?.name ?? "Run details"}
            </h1>
            <div className="mt-1 text-xs text-muted-foreground">
              Run ID: <code>{id}</code>
            </div>
          </div>
          <RunStatusBadge status={run.status} />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link className="underline" href="/runs">
            Back to runs
          </Link>
          <Link className="underline" href="/workflows">
            Back to workflows
          </Link>
          {run.workflow?.slug ? (
            <Link className="underline" href={`/workflows/${run.workflow.slug}`}>
              View workflow
            </Link>
          ) : null}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Run summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <div className="text-xs text-muted-foreground">Workflow</div>
                <div className="font-medium text-foreground/90">
                  {run.workflow?.name ?? run.workflowId}
                </div>
                <div className="text-xs text-muted-foreground">
                  <code>{run.workflow?.slug ?? run.workflowId}</code>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Status</div>
                <div>
                  <RunStatusBadge status={run.status} />
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Started</div>
                <div>
                  {formatDateTime(run.startedAt)}{" "}
                  <span className="text-muted-foreground/70">
                    ({formatRelativeTime(run.startedAt)})
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Completed</div>
                <div>
                  {formatDateTime(run.completedAt)}{" "}
                  <span className="text-muted-foreground/70">
                    ({formatRelativeTime(run.completedAt)})
                  </span>
                </div>
              </div>
            </div>

            {run.errorMessage ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30">
                <div className="text-xs font-medium">Error</div>
                <div className="mt-1 text-sm">{run.errorMessage}</div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Execution timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {orderedLogs.length === 0 ? (
              <div className="text-sm text-muted-foreground">No logs available.</div>
            ) : (
              <div className="relative">
                <div className="absolute left-[9px] top-2 h-[calc(100%-16px)] w-px bg-border" />
                <ul className="space-y-4">
                  {orderedLogs.map((log) => (
                    <li key={log.id} className="relative pl-7">
                      <div className="absolute left-1 top-2 h-4 w-4 rounded-full border border-border bg-background shadow-sm" />
                      <div className="flex items-start justify-between gap-3">
                        <code className="text-xs text-muted-foreground">{log.stepName}</code>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDateTime(log.createdAt)}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {log.message}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Input payload</CardTitle>
          </CardHeader>
          <CardContent>
            <JsonBlock value={run.inputPayload} />
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Output payload</CardTitle>
          </CardHeader>
          <CardContent>
            {run.outputPayload ? (
              <JsonBlock value={run.outputPayload} />
            ) : (
              <div className="text-sm text-muted-foreground">
                No output available (run not completed or failed early).
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
