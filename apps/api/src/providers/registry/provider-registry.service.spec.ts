import { NotFoundException } from '@nestjs/common';
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

  it('returns a clean error for an unknown provider', () => {
    expect(() => registry.resolve('unknown')).toThrow(NotFoundException);
    expect(() => registry.resolve('unknown')).toThrow(
      'Unknown provider type: unknown',
    );
  });

  it('lists OpenAI as disabled until explicitly enabled', () => {
    expect(registry.listProviders()).toEqual([
      { type: ProviderType.Simulated, status: 'active', default: true },
      { type: ProviderType.OpenAI, status: 'disabled', default: false },
    ]);
  });
});
