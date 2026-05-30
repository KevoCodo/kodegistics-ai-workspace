import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { FailureCategory } from '../common/enums/failure-category.enum';
import { WorkflowEventType } from '../common/enums/workflow-event-type.enum';
import { WorkflowRunStatus } from '../common/enums/workflow-run-status.enum';
import { ProviderRegistryService } from '../providers/registry/provider-registry.service';
import { ProviderType } from '../providers/types/provider-type';
import { WorkflowEventsService } from '../workflow-events/workflow-events.service';
import { WorkflowEntity } from '../workflows/workflow.entity';
import { WorkflowsService } from '../workflows/workflows.service';
import { WorkflowLogEntity } from '../workflow-logs/workflow-log.entity';
import { WorkflowRunEntity } from './workflow-run.entity';
import { WorkflowRunsService } from './workflow-runs.service';

describe('WorkflowRunsService provider execution', () => {
  const workflow = {
    id: 'workflow-id',
    name: 'Demo workflow',
    slug: 'demo',
    providerType: undefined,
    inputSchema: { fields: [] },
  } as unknown as WorkflowEntity;

  function setup(
    status: WorkflowRunStatus.Completed | WorkflowRunStatus.Failed,
    options: {
      workflowOverride?: Partial<WorkflowEntity>;
      providerAvailability?: Array<{
        type: ProviderType;
        implemented: boolean;
        enabled: boolean;
      }>;
      workflowExists?: boolean;
    } = {},
  ) {
    const activeWorkflow = {
      ...workflow,
      ...options.workflowOverride,
    } as WorkflowEntity;
    const runs = new Map<string, WorkflowRunEntity>();
    let sequence = 0;

    const makeRun = (data: Partial<WorkflowRunEntity>): WorkflowRunEntity =>
      ({
        id: data.id ?? `run-${++sequence}`,
        workflowId: activeWorkflow.id,
        workflow: activeWorkflow,
        retriedFromRunId: null,
        retriedFromRun: null,
        retryCount: 0,
        maxRetries: 3,
        inputPayload: {},
        outputPayload: null,
        status: WorkflowRunStatus.Queued,
        errorMessage: null,
        failureReason: null,
        failureCategory: null,
        retryEligible: false,
        lastErrorAt: null,
        startedAt: null,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      }) as WorkflowRunEntity;

    const logRows: Array<{ runId: string; stepName: string; message: string }> =
      [];
    const eventRows: Array<{
      runId: string;
      type: WorkflowEventType;
      message: string;
      metadata?: Record<string, unknown> | null;
    }> = [];

    const runsRepo = {
      create: jest.fn(
        (data: Partial<WorkflowRunEntity>): WorkflowRunEntity => makeRun(data),
      ),
      save: jest.fn(
        (data: Partial<WorkflowRunEntity>): Promise<WorkflowRunEntity> => {
          const id = data.id ?? `run-${++sequence}`;
          const existing = runs.get(id) ?? makeRun({ id });
          const saved = Object.assign(existing, data, { id });
          runs.set(id, saved);
          return Promise.resolve(saved);
        },
      ),
      findOne: jest.fn(
        (params: {
          where: { id: string };
        }): Promise<WorkflowRunEntity | null> =>
          Promise.resolve(runs.get(params.where.id) ?? null),
      ),
    };
    const logsRepo = {
      create: jest.fn((data: Partial<WorkflowLogEntity>): WorkflowLogEntity => {
        return data as WorkflowLogEntity;
      }),
      save: jest.fn((data: WorkflowLogEntity): Promise<WorkflowLogEntity> => {
        logRows.push({
          runId: data.workflowRunId,
          stepName: data.stepName,
          message: data.message,
        });
        return Promise.resolve(data);
      }),
    };
    const workflowsService = {
      findBySlug: jest.fn(
        (): Promise<WorkflowEntity | null> =>
          Promise.resolve(
            options.workflowExists === false ? null : activeWorkflow,
          ),
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
      listProviders: jest.fn(
        () =>
          options.providerAvailability ?? [
            {
              type: ProviderType.Simulated,
              implemented: true,
              enabled: true,
            },
            {
              type: ProviderType.OpenAI,
              implemented: true,
              enabled: false,
            },
          ],
      ),
    };
    const workflowEventsService = {
      record: jest.fn(
        (
          runId: string,
          type: WorkflowEventType,
          message: string,
          metadata: Record<string, unknown> | null = null,
        ): Promise<{
          runId: string;
          type: WorkflowEventType;
          message: string;
          metadata: Record<string, unknown> | null;
        }> => {
          eventRows.push({ runId, type, message, metadata });
          return Promise.resolve({ runId, type, message, metadata });
        },
      ),
    };
    const service = new WorkflowRunsService(
      runsRepo as unknown as Repository<WorkflowRunEntity>,
      logsRepo as unknown as Repository<WorkflowLogEntity>,
      workflowsService as unknown as WorkflowsService,
      new ConfigService({ SIMULATION_STEP_DELAY_MS: '0' }),
      providerRegistry as unknown as ProviderRegistryService,
      workflowEventsService as unknown as WorkflowEventsService,
    );

    return {
      service,
      runs,
      makeRun,
      logRows,
      eventRows,
      providerRegistry,
    };
  }

  it('defaults missing provider type to simulated and records completion logs', async () => {
    const { service, logRows, eventRows, providerRegistry } = setup(
      WorkflowRunStatus.Completed,
    );

    const run = await service.create({
      workflowSlug: workflow.slug,
      inputPayload: {},
    });

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
    expect(run.outputPayload).toEqual({
      result: 'ok',
      providerMetadata: { provider: ProviderType.Simulated },
    });
    expect(run.retryCount).toBe(0);
    expect(run.maxRetries).toBe(3);
    expect(eventRows.map((row) => row.type)).toEqual([
      WorkflowEventType.RUN_CREATED,
      WorkflowEventType.VALIDATION_STARTED,
      WorkflowEventType.RUN_STARTED,
      WorkflowEventType.PROVIDER_SELECTED,
      WorkflowEventType.PROVIDER_REQUEST_SENT,
      WorkflowEventType.PROVIDER_RESPONSE_RECEIVED,
      WorkflowEventType.RUN_COMPLETED,
    ]);
  });

  it('records a provider execution failure and preserves failed lifecycle status', async () => {
    const { service, logRows, eventRows } = setup(WorkflowRunStatus.Failed);

    const run = await service.create({
      workflowSlug: workflow.slug,
      inputPayload: {},
    });

    expect(run.status).toBe(WorkflowRunStatus.Failed);
    expect(run.errorMessage).toBe('Provider unavailable.');
    expect(run.failureReason).toBe('Provider unavailable.');
    expect(run.failureCategory).toBe(FailureCategory.PROVIDER_ERROR);
    expect(run.retryEligible).toBe(true);
    expect(run.lastErrorAt).toBeInstanceOf(Date);
    expect(logRows.map((row) => row.stepName)).toContain(
      'provider_execution_failed',
    );
    expect(
      logRows.find((row) => row.stepName === 'provider_execution_failed')
        ?.message,
    ).toContain('simulated provider execution failed: Provider unavailable.');
    expect(eventRows.map((row) => row.type)).toEqual([
      WorkflowEventType.RUN_CREATED,
      WorkflowEventType.VALIDATION_STARTED,
      WorkflowEventType.RUN_STARTED,
      WorkflowEventType.PROVIDER_SELECTED,
      WorkflowEventType.PROVIDER_REQUEST_SENT,
      WorkflowEventType.PROVIDER_RESPONSE_RECEIVED,
      WorkflowEventType.RUN_FAILED,
    ]);
  });

  it('creates a new retry run for a failed retry-eligible run', async () => {
    const { service, runs, makeRun, eventRows, logRows } = setup(
      WorkflowRunStatus.Completed,
    );
    const originalRun = makeRun({
      id: 'failed-run',
      status: WorkflowRunStatus.Failed,
      errorMessage: 'Provider unavailable.',
      failureReason: 'Provider unavailable.',
      failureCategory: FailureCategory.PROVIDER_ERROR,
      retryEligible: true,
      retryCount: 0,
      maxRetries: 3,
      inputPayload: { notes: 'Safe demo notes' },
      completedAt: new Date(),
    });
    runs.set(originalRun.id, originalRun);

    const retryRun = await service.retry(originalRun.id);

    expect(retryRun.id).not.toBe(originalRun.id);
    expect(retryRun.retriedFromRunId).toBe(originalRun.id);
    expect(retryRun.retryCount).toBe(1);
    expect(retryRun.maxRetries).toBe(3);
    expect(retryRun.inputPayload).toEqual(originalRun.inputPayload);
    expect(runs.get(originalRun.id)?.status).toBe(WorkflowRunStatus.Failed);
    expect(runs.get(originalRun.id)?.retryCount).toBe(0);
    expect(eventRows.map((row) => row.type)).toEqual(
      expect.arrayContaining([
        WorkflowEventType.RETRY_REQUESTED,
        WorkflowEventType.RETRY_APPROVED,
        WorkflowEventType.RETRIED_FROM_RUN,
        WorkflowEventType.RETRY_RUN_CREATED,
      ]),
    );
    expect(logRows.map((row) => row.stepName)).toEqual(
      expect.arrayContaining([
        'retry_requested',
        'retry_approved',
        'retried_from_run',
        'retry_run_created',
      ]),
    );
  });

  it('rejects retry for a non-retry-eligible failed run', async () => {
    const { service, runs, makeRun, eventRows } = setup(
      WorkflowRunStatus.Completed,
    );
    const originalRun = makeRun({
      id: 'failed-run',
      status: WorkflowRunStatus.Failed,
      retryEligible: false,
    });
    runs.set(originalRun.id, originalRun);

    await expect(service.retry(originalRun.id)).rejects.toThrow(
      BadRequestException,
    );
    expect(eventRows.map((row) => row.type)).toEqual(
      expect.arrayContaining([
        WorkflowEventType.RETRY_REQUESTED,
        WorkflowEventType.RETRY_REJECTED,
      ]),
    );
  });

  it('rejects retry for a completed run', async () => {
    const { service, runs, makeRun } = setup(WorkflowRunStatus.Completed);
    const originalRun = makeRun({
      id: 'completed-run',
      status: WorkflowRunStatus.Completed,
      retryEligible: true,
    });
    runs.set(originalRun.id, originalRun);

    await expect(service.retry(originalRun.id)).rejects.toThrow(
      'Only failed workflow runs can be retried.',
    );
  });

  it('rejects retry after max retry attempts are reached', async () => {
    const { service, runs, makeRun } = setup(WorkflowRunStatus.Completed);
    const originalRun = makeRun({
      id: 'failed-run',
      status: WorkflowRunStatus.Failed,
      retryEligible: true,
      retryCount: 3,
      maxRetries: 3,
    });
    runs.set(originalRun.id, originalRun);

    await expect(service.retry(originalRun.id)).rejects.toThrow(
      'Maximum retry attempts reached (3).',
    );
  });

  it('rejects retry when the selected provider is disabled', async () => {
    const { service, runs, makeRun } = setup(WorkflowRunStatus.Completed, {
      workflowOverride: { providerType: ProviderType.OpenAI },
      providerAvailability: [
        {
          type: ProviderType.OpenAI,
          implemented: true,
          enabled: false,
        },
      ],
    });
    const originalRun = makeRun({
      id: 'failed-run',
      status: WorkflowRunStatus.Failed,
      retryEligible: true,
    });
    runs.set(originalRun.id, originalRun);

    await expect(service.retry(originalRun.id)).rejects.toThrow(
      'Selected provider is not available for retry in this environment.',
    );
  });
});
