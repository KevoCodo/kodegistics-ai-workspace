"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { api, type WorkflowFieldSchema, type WorkflowRun } from "../lib/api";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function WorkflowRunForm({
  workflowSlug,
  fields,
}: {
  workflowSlug: string;
  fields: WorkflowFieldSchema[];
}) {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<
    | { kind: "idle" }
    | { kind: "submitting" }
    | { kind: "success"; run: WorkflowRun }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  const hasFields = fields.length > 0;

  function setFieldValue(fieldName: string, value: string) {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));
    setFormErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
    if (submitState.kind !== "idle") setSubmitState({ kind: "idle" });
  }

  const { payload, errors } = useMemo(() => {
    const nextErrors: Record<string, string> = {};
    const nextPayload: Record<string, unknown> = {};

    for (const field of fields) {
      const raw = formValues[field.name] ?? "";

      if (field.required && raw.trim().length === 0) {
        nextErrors[field.name] = "Required";
        continue;
      }

      if (raw.trim().length === 0) continue;

      if (field.type === "number") {
        const num = Number(raw);
        if (!Number.isFinite(num)) {
          nextErrors[field.name] = "Must be a number";
          continue;
        }
        nextPayload[field.name] = num;
        continue;
      }

      if (field.type === "json") {
        try {
          nextPayload[field.name] = JSON.parse(raw);
        } catch {
          nextErrors[field.name] = "Must be valid JSON";
        }
        continue;
      }

      nextPayload[field.name] = raw;
    }

    return { payload: nextPayload, errors: nextErrors };
  }, [fields, formValues]);

  async function handleSubmit() {
    if (!hasFields) return;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitState({ kind: "submitting" });
    try {
      const run = await api.createRun({ workflowSlug, inputPayload: payload });
      setSubmitState({ kind: "success", run });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create run";
      setSubmitState({ kind: "error", message });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Run this workflow (simulated)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasFields ? (
          <div className="text-sm text-muted-foreground">
            No input fields defined for this workflow.
          </div>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
          >
            {fields.map((field) => (
              <div key={field.name} className="space-y-1">
                <label className="text-sm font-medium" htmlFor={field.name}>
                  {field.label}
                  {field.required ? (
                    <span className="ml-1 text-rose-700">*</span>
                  ) : null}
                </label>
                {field.type === "textarea" || field.type === "json" ? (
                  <textarea
                    id={field.name}
                    className="min-h-24 w-full rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    placeholder={field.placeholder}
                    value={formValues[field.name] ?? ""}
                    onChange={(e) => setFieldValue(field.name, e.target.value)}
                  />
                ) : field.type === "select" ? (
                  <select
                    id={field.name}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    value={formValues[field.name] ?? ""}
                    onChange={(e) => setFieldValue(field.name, e.target.value)}
                  >
                    <option value="">Select...</option>
                    {(field.options ?? []).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={field.name}
                    type={field.type === "number" ? "number" : "text"}
                    className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    placeholder={field.placeholder}
                    value={formValues[field.name] ?? ""}
                    onChange={(e) => setFieldValue(field.name, e.target.value)}
                  />
                )}
                {formErrors[field.name] ? (
                  <div className="text-xs text-rose-700">{formErrors[field.name]}</div>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    {field.type === "json" ? "Provide valid JSON." : " "}
                  </div>
                )}
              </div>
            ))}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitState.kind === "submitting"}
                className="inline-flex items-center rounded-md border border-border bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-60"
              >
                {submitState.kind === "submitting" ? "Creating run..." : "Create run"}
              </button>
              {submitState.kind === "success" ? (
                <Link className="text-sm underline" href={`/runs/${submitState.run.id}`}>
                  View run details
                </Link>
              ) : null}
              {submitState.kind === "error" ? (
                <div className="text-sm text-rose-700">{submitState.message}</div>
              ) : null}
              {submitState.kind === "success" ? (
                <Badge variant="success">Run created</Badge>
              ) : null}
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
