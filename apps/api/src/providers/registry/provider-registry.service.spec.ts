import { NotFoundException } from '@nestjs/common';
import { WorkflowRunStatus } from '../../common/enums/workflow-run-status.enum';
import { OpenAIWorkflowProvider } from '../openai/openai-workflow-provider';
import { SimulatedWorkflowProvider } from '../simulated/simulated-workflow-provider';
import { ProviderType } from '../types/provider-type';
import { ProviderRegistryService } from './provider-registry.service';

describe('ProviderRegistryService', () => {
  const simulatedProvider = {} as SimulatedWorkflowProvider;
  const openAIProvider = {
    getAvailabilityStatus: jest.fn(() => 'disabled' as const),
  } as unknown as OpenAIWorkflowProvider;
  const registry = new ProviderRegistryService(
    simulatedProvider,
    openAIProvider,
  );

  it('defaults missing provider type to simulated', () => {
    expect(registry.resolve(undefined)).toBe(simulatedProvider);
  });

  it('resolves the OpenAI adapter when selected', () => {
    expect(registry.resolve(ProviderType.OpenAI)).toBe(openAIProvider);
  });

  it('returns a clean failed adapter result for placeholder providers', async () => {
    const provider = registry.resolve(ProviderType.Anthropic);

    expect(provider.getProviderType()).toBe(ProviderType.Anthropic);
    await expect(provider.execute({} as never)).resolves.toEqual(
      expect.objectContaining({
        status: WorkflowRunStatus.Failed,
        errorMessage: 'Provider not yet implemented.',
        metadata: expect.objectContaining({
          provider: ProviderType.Anthropic,
          implemented: false,
        }),
      }),
    );
  });

  it('returns a clean error for an unknown provider', () => {
    expect(() => registry.resolve('unknown')).toThrow(NotFoundException);
    expect(() => registry.resolve('unknown')).toThrow(
      'Unknown provider type: unknown',
    );
  });

  it('reports implemented and placeholder provider availability', () => {
    expect(registry.listProviders()).toEqual([
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
        status: 'disabled',
        implemented: true,
        enabled: false,
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
    ]);
  });
});
