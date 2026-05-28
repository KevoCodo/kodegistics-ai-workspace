import { WorkflowRunStatus } from '../../common/enums/workflow-run-status.enum';
import { WorkflowExecutionProvider } from '../interfaces/workflow-execution-provider';
import { ProviderExecutionResult } from '../types/provider-execution.types';
import { ProviderType } from '../types/provider-type';

export class NotImplementedWorkflowProvider implements WorkflowExecutionProvider {
  constructor(private readonly providerType: ProviderType) {}

  getProviderType(): ProviderType {
    return this.providerType;
  }

  getProviderName(): string {
    return 'NotImplementedWorkflowProvider';
  }

  validatePayload(): void {}

  async execute(): Promise<ProviderExecutionResult> {
    const executionTimeMs = 0;
    const status = WorkflowRunStatus.Failed;

    return {
      status,
      outputPayload: null,
      errorMessage: 'Provider not yet implemented.',
      executionTimeMs,
      metadata: {
        provider: this.providerType,
        implemented: false,
        executionTimeMs,
        status,
        timestamp: new Date().toISOString(),
      },
      logs: [
        {
          stepName: 'provider_not_implemented',
          message: `Provider not yet implemented: ${this.providerType}.`,
        },
      ],
    };
  }
}
