export type ApiError = {
  message: string;
  status?: number;
};

export type WorkflowStatus = "active" | "inactive";
export type WorkflowRunStatus = "queued" | "running" | "completed" | "failed";

export type WorkflowFieldSchema = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number" | "json";
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
};

export type WorkflowInputSchema = {
  fields: WorkflowFieldSchema[];
};

export type Workflow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  status: WorkflowStatus;
  inputSchema: WorkflowInputSchema;
  createdAt: string;
  updatedAt: string;
};

export type WorkflowRun = {
  id: string;
  workflowId: string;
  workflow?: Workflow;
  inputPayload: Record<string, unknown>;
  outputPayload: Record<string, unknown> | null;
  status: WorkflowRunStatus;
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkflowLog = {
  id: string;
  workflowRunId: string;
  stepName: string;
  message: string;
  createdAt: string;
};

export function getApiBaseUrl(): string | null {
  const isServer = typeof window === "undefined";

  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  const internal = isServer ? process.env.API_INTERNAL_URL?.trim() : undefined;

  const resolved = internal || configured;
  if (!resolved) return null;
  return resolved.replace(/\/+$/, "");
}

export function getApiBaseUrlOrThrow(): string {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_API_URL (copy apps/web/.env.example to apps/web/.env.local). In Docker, set API_INTERNAL_URL=http://api:3001 for server-side fetches.",
    );
  }
  return baseUrl;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrlOrThrow();

  const method = (init?.method ?? "GET").toUpperCase();
  const headers = new Headers(init?.headers ?? {});
  if (!headers.has("Content-Type") && method !== "GET" && method !== "HEAD") {
    headers.set("Content-Type", "application/json");
  }

  const timeoutMs = 8000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error(
        `Request timed out after ${timeoutMs}ms. Check NEXT_PUBLIC_API_URL (${baseUrl}) and that the API is reachable.`,
      );
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    let details: unknown = null;
    try {
      details = await res.json();
    } catch {
      details = await res.text().catch(() => null);
    }
    const message =
      typeof details === "object" && details && "message" in details
        ? String((details as { message: unknown }).message)
        : `Request failed: ${res.status}`;
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  return (await res.json()) as T;
}

export const api = {
  async health(): Promise<{ status: "ok"; service: string }> {
    return fetchJson("/health", { cache: "no-store" });
  },
  async listWorkflows(): Promise<Workflow[]> {
    return fetchJson("/workflows", { cache: "no-store" });
  },
  async getWorkflow(slug: string): Promise<Workflow> {
    return fetchJson(`/workflows/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
  },
  async listRuns(): Promise<WorkflowRun[]> {
    return fetchJson("/workflow-runs", { cache: "no-store" });
  },
  async getRun(id: string): Promise<WorkflowRun> {
    return fetchJson(`/workflow-runs/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
  },
  async createRun(params: {
    workflowSlug: string;
    inputPayload: Record<string, unknown>;
  }): Promise<WorkflowRun> {
    return fetchJson("/workflow-runs", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },
  async listRunLogs(runId: string): Promise<WorkflowLog[]> {
    return fetchJson(`/workflow-runs/${encodeURIComponent(runId)}/logs`, {
      cache: "no-store",
    });
  },
};
