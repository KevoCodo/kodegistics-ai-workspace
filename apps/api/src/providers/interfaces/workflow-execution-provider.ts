import { WorkflowEntity } from '../../workflows/workflow.entity';
import { ProviderType } from '../types/provider-type';
import { ProviderExecutionResult } from '../types/provider-execution.types';

export type ProviderExecuteParams = {
  workflow: WorkflowEntity;
  inputPayload: Record<string, unknown>;
};

export interface WorkflowExecutionProvider {
  getProviderType(): ProviderType;
  getProviderName(): string;
  validatePayload(params: ProviderExecuteParams): void;
  execute(params: ProviderExecuteParams): Promise<ProviderExecutionResult>;
}

