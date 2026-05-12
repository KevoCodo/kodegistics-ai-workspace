"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api, type WorkflowRun } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { RunStatusBadge } from "../../components/status-badges";
import { formatDateTime, formatDurationMs, formatRelativeTime } from "../../lib/time";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; runs: WorkflowRun[] };

export default function RunsPage() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const runs = await api.listRuns();
        if (cancelled) return;
        setState({ kind: "ready", runs });
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Failed to load runs";
        setState({ kind: "error", message });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    if (state.kind !== "ready") return [];
    return state.runs;
  }, [state]);

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Runs</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Workflow runs represent execution instances (queued/running/completed/failed).
          Create a simulated run from a workflow detail page to see lifecycle logs and
          a generated output payload.
        </p>
      </section>

      {state.kind === "loading" && (
        <div className="text-sm text-muted-foreground">Loading runs...</div>
      )}

      {state.kind === "error" && (
        <Card className="border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30">
          <CardHeader>
            <CardTitle className="text-rose-800">Failed to load runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-rose-800">Unable to reach the API to load runs.</div>
            <div className="mt-2 text-xs text-rose-700">
              If the API is up, you may just have no runs yet.
            </div>
            <details className="mt-3 text-xs text-rose-700">
              <summary className="cursor-pointer select-none">Details</summary>
              <div className="mt-2 whitespace-pre-wrap">{state.message}</div>
            </details>
          </CardContent>
        </Card>
      )}

      {state.kind === "ready" && rows.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No runs yet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Create a run from a workflow detail page to see it here.
            </div>
            <div>
              <Link className="text-sm underline" href="/workflows">
                Browse workflows
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {state.kind === "ready" && rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Run history</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="border-b border-border text-xs text-muted-foreground">
                  <tr>
                    <th className="py-2 pr-4 font-medium">Run ID</th>
                    <th className="py-2 pr-4 font-medium">Workflow</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 pr-4 font-medium">Created</th>
                    <th className="py-2 pr-4 font-medium">Duration</th>
                    <th className="py-2 pr-4 font-medium">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((run) => {
                    const durationMs =
                      run.startedAt && run.completedAt
                        ? new Date(run.completedAt).getTime() -
                          new Date(run.startedAt).getTime()
                        : null;

                    return (
                      <tr
                        key={run.id}
                        className="border-b border-border/60 hover:bg-muted/40"
                      >
                      <td className="py-3 pr-4 align-top">
                        <Link className="underline" href={`/runs/${run.id}`}>
                          <code className="text-xs">{run.id}</code>
                        </Link>
                      </td>
                      <td className="py-3 pr-4 align-top">
                        <div className="font-medium">
                          {run.workflow?.name ?? run.workflowId}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <code>{run.workflow?.slug ?? run.workflowId}</code>
                        </div>
                      </td>
                      <td className="py-3 pr-4 align-top">
                        <RunStatusBadge status={run.status} />
                      </td>
                      <td className="py-3 pr-4 align-top">
                        <div className="text-xs text-muted-foreground">
                          {formatRelativeTime(run.createdAt)}
                        </div>
                        <div className="text-xs">{formatDateTime(run.createdAt)}</div>
                      </td>
                      <td className="py-3 pr-4 align-top text-xs text-muted-foreground">
                        {formatDurationMs(durationMs)}
                      </td>
                      <td className="py-3 pr-4 align-top">
                        <div className="text-xs text-muted-foreground">
                          {formatRelativeTime(run.completedAt)}
                        </div>
                        <div className="text-xs">{formatDateTime(run.completedAt)}</div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Click a run ID to view details and logs.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
