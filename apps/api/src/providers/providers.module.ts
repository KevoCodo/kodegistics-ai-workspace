import { Module } from '@nestjs/common';
import { ProvidersController } from './providers.controller';
import { ProviderRegistryService } from './registry/provider-registry.service';
import { SimulatedWorkflowProvider } from './simulated/simulated-workflow-provider';

@Module({
  controllers: [ProvidersController],
  providers: [ProviderRegistryService, SimulatedWorkflowProvider],
  exports: [ProviderRegistryService],
})
export class ProvidersModule {}

