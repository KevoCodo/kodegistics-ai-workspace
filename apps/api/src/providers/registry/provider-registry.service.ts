import { Injectable, NotFoundException } from '@nestjs/common';
import { ProviderType } from '../types/provider-type';
import { WorkflowExecutionProvider } from '../interfaces/workflow-execution-provider';
import { SimulatedWorkflowProvider } from '../simulated/simulated-workflow-provider';

@Injectable()
export class ProviderRegistryService {
  constructor(private readonly simulatedProvider: SimulatedWorkflowProvider) {}

  listProviders(): Array<{ type: ProviderType; status: 'active' }> {
    return [{ type: ProviderType.Simulated, status: 'active' }];
  }

  resolve(type: ProviderType): WorkflowExecutionProvider {
    switch (type) {
      case ProviderType.Simulated:
        return this.simulatedProvider;
      default:
        throw new NotFoundException(`Unknown provider type: ${type}`);
    }
  }
}

