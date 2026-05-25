import { WorkflowRunStatus } from '../../common/enums/workflow-run-status.enum';

export type ProviderLogEntry = {
  stepName: string;
  message: string;
};

export type ProviderExecutionResult = {
  status: WorkflowRunStatus.Completed | WorkflowRunStatus.Failed;
  outputPayload: Record<string, unknown> | null;
  errorMessage: string | null;
  executionTimeMs: number;
  metadata: Record<string, unknown>;
  logs: ProviderLogEntry[];
};
