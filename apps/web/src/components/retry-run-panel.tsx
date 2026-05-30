"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, type ProviderStatus, type WorkflowRun } from "../lib/api";
import { Badge } from "./ui/badge";

type RetryRunPanelProps = {
  run: WorkflowRun;
  providerStatus?: ProviderStatus | null;
};

function getRetryBlockedReason(
  run: WorkflowRun,
  providerStatus?: ProviderStatus | null,
): string | null {
  const retryCount = run.retryCount ?? 0;
  const maxRetries = run.maxRetries ?? 3;
  if (run.status !== "failed")
    return "Only failed workflow runs can be retried.";
  if (!run.retryEligible) {
    return "This run is not retry eligible because the failure was not considered transient.";
  }
  if (retryCount >= maxRetries) {
    return `Maximum retry attempts reached (${maxRetries}).`;
  }
  if (providerStatus && !providerStatus.implemented) {
    return "Selected provider is not implemented and cannot be retried.";
  }
  if (providerStatus && !providerStatus.enabled) {
    return "Selected provider is not available for retry in this environment.";
  }
  return null;
}

export function RetryRunPanel({ run, providerStatus }: RetryRunPanelProps) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const retryCount = run.retryCount ?? 0;
  const maxRetries = run.maxRetries ?? 3;
  const blockedReason = getRetryBlockedReason(run, providerStatus);
  const canRetry = run.status === "failed" && !blockedReason;

  if (run.status !== "failed") return null;

  async function handleRetry() {
    setIsRetrying(true);
    setErrorMessage(null);
    try {
      const retryRun = await api.retryRun(run.id);
      router.push(`/runs/${retryRun.id}`);
      router.refresh();
    } catch (e) {
      setErrorMessage(
        e instanceof Error
          ? e.message
          : "Retry could not be created for this run.",
      );
    } finally {
      setIsRetrying(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={canRetry ? "warning" : "neutral"}>
            {canRetry ? "Retry Available" : "Retry Not Available"}
          </Badge>
          <Badge variant="neutral">
            Attempt {retryCount} of {maxRetries}
          </Badge>
        </div>
        {canRetry ? (
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRetrying ? "Creating retry..." : "Retry Run"}
          </button>
        ) : null}
      </div>

      <div className="mt-2 text-sm text-muted-foreground">
        {canRetry
          ? "This run failed due to a retryable issue. You can create a new retry attempt using the same workflow input."
          : blockedReason}
      </div>

      {run.retriedFromRunId ? (
        <div className="mt-2 text-xs text-muted-foreground">
          Retried from run: <code>{run.retriedFromRunId}</code>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-800 dark:border-rose-900 dark:bg-rose-950/30">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}
