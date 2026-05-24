"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { api, type Workflow, type WorkflowStatus } from "../../../../lib/api";
import {
  WorkflowTemplateEditor,
  type WorkflowTemplateDraft,
} from "../../../../components/workflow-template-editor";
import { Badge } from "../../../../components/ui/badge";

function asDraft(workflow: Workflow): WorkflowTemplateDraft {
  return {
    name: workflow.name,
    slug: workflow.slug,
    description: workflow.description,
    category: workflow.category,
    status: workflow.status,
    providerType: workflow.providerType,
    inputSchema: workflow.inputSchema ?? { fields: [] },
  };
}

export function WorkflowEditClient({ slug }: { slug: string }) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [status, setStatus] = useState<
    | { kind: "loading" }
    | { kind: "ready"; workflow: Workflow }
    | { kind: "error"; message: string }
  >({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const wf = await api.getWorkflow(slug);
        if (cancelled) return;
        setWorkflow(wf);
        setStatus({ kind: "ready", workflow: wf });
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Failed to load workflow";
        setStatus({ kind: "error", message });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const canDeactivate = useMemo(() => {
    if (!workflow) return false;
    return workflow.status === ("active" satisfies WorkflowStatus);
  }, [workflow]);

  async function deactivate() {
    if (!workflow) return;
    const updated = await api.deactivateWorkflow(workflow.id);
    setWorkflow(updated);
    setStatus({ kind: "ready", workflow: updated });
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Edit workflow</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link className="underline" href={`/workflows/${slug}`}>
            Back to workflow
          </Link>
          <Link className="underline" href="/workflows">
            Back to catalog
          </Link>
          {workflow ? (
            <Badge variant={workflow.status === "active" ? "success" : "neutral"}>
              {workflow.status}
            </Badge>
          ) : null}
        </div>
      </section>

      {status.kind === "loading" ? (
        <div className="text-sm text-muted-foreground">Loading workflow...</div>
      ) : null}

      {status.kind === "error" ? (
        <div className="text-sm text-rose-700">{status.message}</div>
      ) : null}

      {status.kind === "ready" ? (
        <>
          <WorkflowTemplateEditor
            mode="edit"
            initial={asDraft(status.workflow)}
            onSubmit={async (draft) => {
              const updated = await api.updateWorkflow(status.workflow.id, {
                name: draft.name,
                description: draft.description,
                category: draft.category,
                status: draft.status,
                providerType: draft.providerType,
                inputSchema: draft.inputSchema,
              });
              setWorkflow(updated);
              setStatus({ kind: "ready", workflow: updated });
              return updated;
            }}
          />

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              disabled={!canDeactivate}
              className="inline-flex items-center rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:bg-muted/60 disabled:opacity-60"
              onClick={() => void deactivate()}
            >
              Deactivate workflow
            </button>
            <div className="text-xs text-muted-foreground">
              Deactivation is used instead of hard delete so existing runs remain
              valid.
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
