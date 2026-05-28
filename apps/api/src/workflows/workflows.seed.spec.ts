import { Repository } from 'typeorm';
import { ProviderType } from '../providers/types/provider-type';
import { WorkflowEntity } from './workflow.entity';
import { WorkflowsSeed } from './workflows.seed';

describe('WorkflowsSeed', () => {
  it('seeds the public-safe AI business summary workflow as simulated by default', async () => {
    const insert = jest.fn(() => Promise.resolve({} as never));
    const workflowsRepo = {
      find: jest.fn(() => Promise.resolve([])),
      insert,
    } as unknown as Repository<WorkflowEntity>;
    const seed = new WorkflowsSeed(workflowsRepo);

    await seed.onModuleInit();

    expect(insert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          slug: 'ai-business-summary',
          providerType: ProviderType.Simulated,
          category: 'AI Provider Demo',
        }),
      ]),
    );
  });
});
