import { Injectable, NotFoundException } from '@nestjs/common';
import { ProviderType } from '../types/provider-type';
import { WorkflowExecutionProvider } from '../interfaces/workflow-execution-provider';
import { OpenAIWorkflowProvider } from '../openai/openai-workflow-provider';
import { SimulatedWorkflowProvider } from '../simulated/simulated-workflow-provider';

@Injectable()
export class ProviderRegistryService {
  constructor(
    private readonly simulatedProvider: SimulatedWorkflowProvider,
    private readonly openAIProvider: OpenAIWorkflowProvider,
  ) {}

  listProviders(): Array<{
    type: ProviderType;
    status: 'active' | 'disabled' | 'enabled' | 'missing_api_key';
    default: boolean;
  }> {
    return [
      { type: ProviderType.Simulated, status: 'active', default: true },
      {
        type: ProviderType.OpenAI,
        status: this.openAIProvider.getAvailabilityStatus(),
        default: false,
      },
    ];
  }

  resolve(type?: string | null): WorkflowExecutionProvider {
    const resolvedType = type ?? ProviderType.Simulated;
    if (!this.isProviderType(resolvedType)) {
      throw new NotFoundException(`Unknown provider type: ${type}`);
    }

    switch (resolvedType) {
      case ProviderType.Simulated:
        return this.simulatedProvider;
      case ProviderType.OpenAI:
        return this.openAIProvider;
    }
  }

  private isProviderType(type: string): type is ProviderType {
    return Object.values(ProviderType).includes(type as ProviderType);
  }
}
