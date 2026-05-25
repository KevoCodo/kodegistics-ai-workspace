import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { JsonBlock } from "../../../components/json-block";
import { WorkflowStatusBadge } from "../../../components/status-badges";
import { WorkflowRunForm } from "../../../components/workflow-run-form";
import {
  getApiBaseUrl,
  getApiBaseUrlOrThrow,
  type ProviderStatus,
  type Workflow,
  type WorkflowFieldSchema,
} from "../../../lib/api";

async function getWorkflow(slug: string): Promise<Workflow> {
  const baseUrl = getApiBaseUrlOrThrow();
  const res = await fetch(`${baseUrl}/workflows/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Workflow not found for slug: ${slug}`);
  }
  return (await res.json()) as Workflow;
}

async function getProviders(): Promise<ProviderStatus[]> {
  try {
    const baseUrl = getApiBaseUrlOrThrow();
    const res = await fetch(`${baseUrl}/providers`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as ProviderStatus[];
  } catch {
    return [];
  }
}

export default async function WorkflowDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const apiBaseUrl = getApiBaseUrl();
  let workflow: Workflow | null = null;
  let providers: ProviderStatus[] = [];
  let errorMessage: string | null = null;

  try {
    [workflow, providers] = await Promise.all([
      getWorkflow(slug),
      getProviders(),
    ]);
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : "Failed to load workflow";
  }

  if (!workflow) {
    return (
      <div className="space-y-6">
        <section className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Workflow</h1>
          <p className="text-sm text-muted-foreground">
            Unable to load workflow details.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link className="underline" href="/workflows">
              Back to workflows
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
              Current API base URL:{" "}
              <code>{apiBaseUrl ?? "not configured"}</code>
            </div>
            {errorMessage ? (
              <details className="pt-2 text-xs text-rose-700">
                <summary className="cursor-pointer select-none">
                  Details
                </summary>
                <div className="mt-2 whitespace-pre-wrap">{errorMessage}</div>
              </details>
            ) : null}
          </CardContent>
        </Card>
      </div>
    );
  }

  const fields: WorkflowFieldSchema[] = workflow.inputSchema?.fields ?? [];
  const providerStatus = providers.find(
    (provider) => provider.type === workflow.providerType,
  );

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {workflow.name}
            </h1>
            <div className="mt-1 text-xs text-muted-foreground">
              <code>{workflow.slug}</code>
            </div>
          </div>
          <WorkflowStatusBadge status={workflow.status} />
        </div>
        <div>
          <Link className="text-sm underline" href="/workflows">
            Back to workflows
          </Link>
          <Link
            className="ml-4 text-sm underline"
            href={`/workflows/${workflow.slug}/edit`}
          >
            Edit workflow
          </Link>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {workflow.description}
            </div>
            <div className="text-xs text-muted-foreground">
              Category: <span className="font-medium">{workflow.category}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Provider:{" "}
              <span className="font-medium">{workflow.providerType}</span>
              {providerStatus ? (
                <span className="ml-2 rounded-full border border-border px-2 py-0.5">
                  {providerStatus.status}
                </span>
              ) : null}
            </div>
            <div className="rounded-lg border border-border bg-muted/60 p-3 text-xs text-muted-foreground">
              <div className="font-medium text-foreground/80">
                Execution concept
              </div>
              <div className="mt-1">
                Creating a run validates the input payload, sets the run to{" "}
                <code>queued</code>, transitions to <code>running</code>, and
                finishes as <code>completed</code> (or <code>failed</code>)
                while emitting structured logs. Runs route through a provider
                registry so the execution adapter can be selected without
                changing the run contract. Simulated execution remains the
                recommended public demo path.
              </div>
            </div>

            <WorkflowRunForm
              workflowSlug={workflow.slug}
              providerType={workflow.providerType}
              fields={fields}
            />
          </CardContent>
        </Card>

        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Provider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div>
                <code>simulated</code> = local demo execution with deterministic
                output.
              </div>
              <div>
                <code>openai</code> = optional real provider adapter that
                requires backend environment configuration.
              </div>
              <div className="text-xs">
                Selected: <code>{workflow.providerType}</code>
                {providerStatus ? ` (${providerStatus.status})` : ""}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Input Schema</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonBlock value={workflow.inputSchema} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
