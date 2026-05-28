import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { WorkflowRunStatus } from '../common/enums/workflow-run-status.enum';
import { ProviderRegistryService } from '../providers/registry/provider-registry.service';
import { ProviderType } from '../providers/types/provider-type';
import { WorkflowEntity } from '../workflows/workflow.entity';
import { WorkflowsService } from '../workflows/workflows.service';
import { WorkflowLogEntity } from '../workflow-logs/workflow-log.entity';
import { WorkflowRunEntity } from './workflow-run.entity';
import { WorkflowRunsService } from './workflow-runs.service';

describe('WorkflowRunsService provider execution', () => {
  const workflow = {
    id: 'workflow-id',
    slug: 'demo',
    providerType: undefined,
    inputSchema: { fields: [] },
  } as unknown as WorkflowEntity;

  function setup(
    status: WorkflowRunStatus.Completed | WorkflowRunStatus.Failed,
  ) {
    const runState = {
      id: 'run-id',
      workflowId: workflow.id,
      workflow,
      inputPayload: {},
      outputPayload: null,
      status: WorkflowRunStatus.Queued,
      errorMessage: null,
      startedAt: null,
      completedAt: null,
    } as unknown as WorkflowRunEntity;
    const logRows: Array<{ stepName: string; message: string }> = [];
    const runsRepo = {
      create: jest.fn(
        (data: Partial<WorkflowRunEntity>): WorkflowRunEntity => ({
          ...runState,
          ...data,
        }),
      ),
      save: jest.fn(
        (data: Partial<WorkflowRunEntity>): Promise<WorkflowRunEntity> =>
          Promise.resolve(Object.assign(runState, data)),
      ),
      findOne: jest.fn(
        (): Promise<WorkflowRunEntity> => Promise.resolve(runState),
      ),
    };
    const logsRepo = {
      create: jest.fn((data: Partial<WorkflowLogEntity>): WorkflowLogEntity => {
        return data as WorkflowLogEntity;
      }),
      save: jest.fn((data: WorkflowLogEntity): Promise<WorkflowLogEntity> => {
        logRows.push({ stepName: data.stepName, message: data.message });
        return Promise.resolve(data);
      }),
    };
    const workflowsService = {
      findBySlug: jest.fn(
        (): Promise<WorkflowEntity> => Promise.resolve(workflow),
      ),
    };
    const provider = {
      getProviderName: () => 'TestProvider',
      getProviderType: () => ProviderType.Simulated,
      validatePayload: jest.fn(),
      execute: jest.fn(() =>
        Promise.resolve({
          status,
          outputPayload:
            status === WorkflowRunStatus.Completed ? { result: 'ok' } : null,
          errorMessage:
            status === WorkflowRunStatus.Failed
              ? 'Provider unavailable.'
              : null,
          executionTimeMs: 1,
          metadata: { provider: ProviderType.Simulated },
          logs: [],
        }),
      ),
    };
    const providerRegistry = {
      resolve: jest.fn(() => provider),
    };
    const service = new WorkflowRunsService(
      runsRepo as unknown as Repository<WorkflowRunEntity>,
      logsRepo as unknown as Repository<WorkflowLogEntity>,
      workflowsService as unknown as WorkflowsService,
      new ConfigService({ SIMULATION_STEP_DELAY_MS: '0' }),
      providerRegistry as unknown as ProviderRegistryService,
    );

    return { service, runState, logRows, providerRegistry };
  }

  it('defaults missing provider type to simulated and records completion logs', async () => {
    const { service, runState, logRows, providerRegistry } = setup(
      WorkflowRunStatus.Completed,
    );

    await service.create({ workflowSlug: workflow.slug, inputPayload: {} });

    expect(providerRegistry.resolve).toHaveBeenCalledWith(
      ProviderType.Simulated,
    );
    expect(logRows.map((row) => row.stepName)).toEqual(
      expect.arrayContaining([
        'provider_resolved',
        'provider_execution_started',
        'provider_execution_completed',
      ]),
    );
    expect(runState.outputPayload).toEqual({
      result: 'ok',
      providerMetadata: { provider: ProviderType.Simulated },
    });
  });

  it('records a provider execution failure and preserves failed lifecycle status', async () => {
    const { service, runState, logRows } = setup(WorkflowRunStatus.Failed);

    await service.create({ workflowSlug: workflow.slug, inputPayload: {} });

    expect(runState.status).toBe(WorkflowRunStatus.Failed);
    expect(runState.errorMessage).toBe('Provider unavailable.');
    expect(logRows.map((row) => row.stepName)).toContain(
      'provider_execution_failed',
    );
    expect(
      logRows.find((row) => row.stepName === 'provider_execution_failed')
        ?.message,
    ).toContain('simulated provider execution failed: Provider unavailable.');
  });
});
