import { Injectable, NotFoundException } from '@nestjs/common';
import { ProviderType } from '../types/provider-type';
import { WorkflowExecutionProvider } from '../interfaces/workflow-execution-provider';
import { OpenAIWorkflowProvider } from '../openai/openai-workflow-provider';
import { NotImplementedWorkflowProvider } from '../placeholder/not-implemented-workflow-provider';
import { SimulatedWorkflowProvider } from '../simulated/simulated-workflow-provider';

export type ProviderAvailabilityStatus =
  | 'active'
  | 'disabled'
  | 'enabled'
  | 'missing_api_key'
  | 'coming_soon';

export type ProviderStatus = {
  type: ProviderType;
  status: ProviderAvailabilityStatus;
  implemented: boolean;
  enabled: boolean;
  requiresApiKey: boolean;
  default: boolean;
};

@Injectable()
export class ProviderRegistryService {
  constructor(
    private readonly simulatedProvider: SimulatedWorkflowProvider,
    private readonly openAIProvider: OpenAIWorkflowProvider,
  ) {}

  listProviders(): ProviderStatus[] {
    const openAIStatus = this.openAIProvider.getAvailabilityStatus();

    return [
      {
        type: ProviderType.Simulated,
        status: 'active',
        implemented: true,
        enabled: true,
        requiresApiKey: false,
        default: true,
      },
      {
        type: ProviderType.OpenAI,
        status: openAIStatus,
        implemented: true,
        enabled: openAIStatus === 'enabled',
        requiresApiKey: true,
        default: false,
      },
      {
        type: ProviderType.Anthropic,
        status: 'coming_soon',
        implemented: false,
        enabled: false,
        requiresApiKey: true,
        default: false,
      },
      {
        type: ProviderType.Local,
        status: 'coming_soon',
        implemented: false,
        enabled: false,
        requiresApiKey: false,
        default: false,
      },
      {
        type: ProviderType.CustomWebhook,
        status: 'coming_soon',
        implemented: false,
        enabled: false,
        requiresApiKey: false,
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
      case ProviderType.Anthropic:
      case ProviderType.Local:
      case ProviderType.CustomWebhook:
        return new NotImplementedWorkflowProvider(resolvedType);
    }
  }

  private isProviderType(type: string): type is ProviderType {
    return Object.values(ProviderType).includes(type as ProviderType);
  }
}
