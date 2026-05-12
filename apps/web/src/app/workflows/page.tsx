"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api, type Workflow } from "../../lib/api";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { WorkflowStatusBadge } from "../../components/status-badges";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; workflows: Workflow[] };

export default function WorkflowsPage() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const workflows = await api.listWorkflows();
        if (cancelled) return;
        setState({ kind: "ready", workflows });
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Failed to load workflows";
        setState({ kind: "error", message });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => {
    if (state.kind !== "ready") return [];
    const byCategory = new Map<string, Workflow[]>();
    for (const w of state.workflows) {
      const list = byCategory.get(w.category) ?? [];
      list.push(w);
      byCategory.set(w.category, list);
    }
    return Array.from(byCategory.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [state]);

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Workflows</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Workflow templates define expected inputs, categories, and a safe execution
          contract. Open any workflow to submit inputs and create a simulated run with
          logs and a generated output payload.
        </p>
      </section>

      {state.kind === "loading" && (
        <div className="text-sm text-muted-foreground">Loading workflows...</div>
      )}

      {state.kind === "error" && (
        <Card className="border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30">
          <CardHeader>
            <CardTitle className="text-rose-800">Failed to load workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-rose-800">
              Unable to reach the API to load workflows.
            </div>
            <div className="mt-2 text-xs text-rose-700">
              Check <code>NEXT_PUBLIC_API_URL</code> and that the API is running.
            </div>
            <details className="mt-3 text-xs text-rose-700">
              <summary className="cursor-pointer select-none">Details</summary>
              <div className="mt-2 whitespace-pre-wrap">{state.message}</div>
            </details>
          </CardContent>
        </Card>
      )}

      {state.kind === "ready" && state.workflows.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No workflows found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              The API seeds default workflows on startup. Ensure Postgres is running and
              the API has started successfully.
            </div>
          </CardContent>
        </Card>
      )}

      {state.kind === "ready" && state.workflows.length > 0 && (
        <div className="space-y-8">
          {grouped.map(([category, workflows]) => (
            <section key={category} className="space-y-3">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold tracking-tight text-foreground/80">
                  {category}
                </h2>
                <div className="text-xs text-muted-foreground">
                  {workflows.length} workflow{workflows.length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {workflows.map((w) => (
                  <Card key={w.id} className="group flex flex-col">
                    <CardHeader className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-base font-semibold tracking-tight">
                            {w.name}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            <code>{w.slug}</code>
                          </div>
                        </div>
                        <WorkflowStatusBadge status={w.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="neutral">{w.category}</Badge>
                        <Badge>Simulated execution</Badge>
                        <span className="text-xs text-muted-foreground">
                          Inputs: {w.inputSchema?.fields?.length ?? 0}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col justify-between gap-4">
                      <p className="text-sm text-muted-foreground">{w.description}</p>
                      <div>
                        <Link
                          href={`/workflows/${w.slug}`}
                          className="inline-flex items-center rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-muted/60"
                        >
                          View details
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
