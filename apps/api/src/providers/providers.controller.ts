import { Controller, Get } from '@nestjs/common';
import { ProviderRegistryService } from './registry/provider-registry.service';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly registry: ProviderRegistryService) {}

  @Get()
  async list() {
    return this.registry.listProviders();
  }
}

