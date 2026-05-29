import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FailureCategory } from '../common/enums/failure-category.enum';
import { WorkflowEventType } from '../common/enums/workflow-event-type.enum';
import { WorkflowRunStatus } from '../common/enums/workflow-run-status.enum';
import { ProviderRegistryService } from '../providers/registry/provider-registry.service';
import { ProviderType } from '../providers/types/provider-type';
import { WorkflowEventsService } from '../workflow-events/workflow-events.service';
import { WorkflowsService } from '../workflows/workflows.service';
import { WorkflowLogEntity } from '../workflow-logs/workflow-log.entity';
import { CreateWorkflowRunDto } from './dto/create-workflow-run.dto';
import { classifyWorkflowFailure } from './failure-classifier';
import { WorkflowRunEntity } from './workflow-run.entity';

@Injectable()
export class WorkflowRunsService {
  constructor(
    @InjectRepository(WorkflowRunEntity)
    private readonly runsRepo: Repository<WorkflowRunEntity>,
    @InjectRepository(WorkflowLogEntity)
    private readonly logsRepo: Repository<WorkflowLogEntity>,
    private readonly workflowsService: WorkflowsService,
    private readonly configService: ConfigService,
    private readonly providerRegistry: ProviderRegistryService,
    private readonly workflowEventsService: WorkflowEventsService,
  ) {}

  async list(): Promise<WorkflowRunEntity[]> {
    const runs = await this.runsRepo.find({
      order: { createdAt: 'DESC' },
      relations: { workflow: true },
    });
    return Promise.all(
      runs.map((run) => this.ensureFailureMetadataForLegacyRun(run)),
    );
  }

  async getById(id: string): Promise<WorkflowRunEntity> {
    const run = await this.runsRepo.findOne({
      where: { id },
      relations: { workflow: true },
    });
    if (!run) {
      throw new NotFoundException(`Workflow run not found: ${id}`);
    }
    return this.ensureFailureMetadataForLegacyRun(run);
  }

  async create(dto: CreateWorkflowRunDto): Promise<WorkflowRunEntity> {
    const workflow = await this.workflowsService.findBySlug(dto.workflowSlug);
    if (!workflow) {
      throw new NotFoundException(
        `Workflow not found for slug: ${dto.workflowSlug}`,
      );
    }

    const inputPayload = dto.inputPayload ?? {};
    this.assertInputPayloadMatchesSchema(workflow.inputSchema, inputPayload);

    const run = this.runsRepo.create({
      workflowId: workflow.id,
      workflow,
      inputPayload,
      outputPayload: null,
      status: WorkflowRunStatus.Queued,
      errorMessage: null,
      failureReason: null,
      failureCategory: null,
      retryEligible: false,
      lastErrorAt: null,
      startedAt: null,
      completedAt: null,
    });

    const savedRun = await this.runsRepo.save(run);

    const delayMs = this.getSimulationStepDelayMs();
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const log = async (stepName: string, message: string) => {
      await this.appendLog(savedRun.id, stepName, message);
      if (delayMs > 0) await sleep(delayMs);
    };
    const event = async (type: WorkflowEventType, message: string) => {
      await this.workflowEventsService.record(savedRun.id, type, message);
    };

    await event(
      WorkflowEventType.RUN_CREATED,
      'Run created and queued for execution.',
    );
    await log(
      'queued',
      'Workflow run created and queued for provider execution.',
    );

    const requestedProviderType =
      workflow.providerType ?? ProviderType.Simulated;

    try {
      await event(
        WorkflowEventType.VALIDATION_STARTED,
        'Validation started for workflow input payload.',
      );
      await log(
        'validation',
        'Validating input payload against workflow input schema.',
      );

      const startedAt = new Date();
      await this.runsRepo.save({
        id: savedRun.id,
        status: WorkflowRunStatus.Running,
        startedAt,
      });
      await event(WorkflowEventType.RUN_STARTED, 'Run started.');

      await log('routing', `Routing to workflow runner: ${workflow.slug}`);

      const provider = this.providerRegistry.resolve(requestedProviderType);
      const resolvedProviderType = provider.getProviderType();
      await event(
        WorkflowEventType.PROVIDER_SELECTED,
        `Provider selected: ${resolvedProviderType}.`,
      );
      await log(
        'provider_resolved',
        `Resolved execution provider: ${provider.getProviderName()} (${resolvedProviderType}).`,
      );
      await log(
        'provider_execution_started',
        `Starting ${resolvedProviderType} provider execution for workflow: ${workflow.slug}.`,
      );

      provider.validatePayload({ workflow, inputPayload });

      await event(
        WorkflowEventType.PROVIDER_REQUEST_SENT,
        `Provider request sent: ${resolvedProviderType}.`,
      );
      const result = await provider.execute({ workflow, inputPayload });
      await event(
        WorkflowEventType.PROVIDER_RESPONSE_RECEIVED,
        `Provider response received with status: ${result.status}.`,
      );
      for (const entry of result.logs ?? []) {
        await log(entry.stepName, entry.message);
      }

      const completedAt = new Date();

      if (result.status === WorkflowRunStatus.Completed) {
        await log(
          'provider_execution_completed',
          `${resolvedProviderType} provider execution completed with status: ${result.status} (${result.executionTimeMs}ms).`,
        );
        await this.runsRepo.save({
          id: savedRun.id,
          status: WorkflowRunStatus.Completed,
          outputPayload: {
            ...(result.outputPayload ?? {}),
            providerMetadata: result.metadata,
          },
          errorMessage: null,
          failureReason: null,
          failureCategory: null,
          retryEligible: false,
          lastErrorAt: null,
          completedAt,
        });
        await event(
          WorkflowEventType.RUN_COMPLETED,
          'Run completed successfully.',
        );
        await log('completed', 'Workflow run completed successfully.');
      } else {
        const message =
          result.errorMessage ??
          'Workflow run failed during provider execution.';
        const classifiedFailure = classifyWorkflowFailure(message);
        const lastErrorAt = new Date();
        await log(
          'provider_execution_failed',
          `${resolvedProviderType} provider execution failed: ${message} (${result.executionTimeMs}ms).`,
        );
        await this.runsRepo.save({
          id: savedRun.id,
          status: WorkflowRunStatus.Failed,
          errorMessage: message,
          failureReason: classifiedFailure.failureReason,
          failureCategory: classifiedFailure.failureCategory,
          retryEligible: classifiedFailure.retryEligible,
          lastErrorAt,
          completedAt,
        });
        await event(
          WorkflowEventType.RUN_FAILED,
          `Run failed: ${classifiedFailure.failureCategory}.`,
        );
        await log('failed', message);
      }
    } catch (e) {
      const classifiedFailure = classifyWorkflowFailure(e);
      const message = classifiedFailure.failureReason;
      const lastErrorAt = new Date();
      if (classifiedFailure.failureCategory === FailureCategory.VALIDATION) {
        await event(WorkflowEventType.VALIDATION_FAILED, message);
      }
      await log(
        'provider_execution_failed',
        `${requestedProviderType} provider execution failed: ${message}`,
      );
      await this.runsRepo.save({
        id: savedRun.id,
        status: WorkflowRunStatus.Failed,
        errorMessage: message,
        failureReason: classifiedFailure.failureReason,
        failureCategory: classifiedFailure.failureCategory,
        retryEligible: classifiedFailure.retryEligible,
        lastErrorAt,
        completedAt: new Date(),
      });
      await event(
        WorkflowEventType.RUN_FAILED,
        `Run failed: ${classifiedFailure.failureCategory}.`,
      );
      await log('failed', message);
    }

    return this.getById(savedRun.id);
  }

  private async appendLog(runId: string, stepName: string, message: string) {
    await this.logsRepo.save(
      this.logsRepo.create({
        workflowRunId: runId,
        stepName,
        message,
      }),
    );
  }

  private async ensureFailureMetadataForLegacyRun(
    run: WorkflowRunEntity,
  ): Promise<WorkflowRunEntity> {
    if (
      run.status !== WorkflowRunStatus.Failed ||
      !run.errorMessage ||
      (run.failureReason && run.failureCategory && run.lastErrorAt)
    ) {
      return run;
    }

    const classifiedFailure = classifyWorkflowFailure(run.errorMessage);
    const lastErrorAt = run.completedAt ?? run.updatedAt ?? new Date();
    const patch = {
      id: run.id,
      failureReason: classifiedFailure.failureReason,
      failureCategory: classifiedFailure.failureCategory,
      retryEligible: classifiedFailure.retryEligible,
      lastErrorAt,
    };

    await this.runsRepo.save(patch);

    return Object.assign(run, patch);
  }

  private getSimulationStepDelayMs(): number {
    const raw = this.configService.get<string>('SIMULATION_STEP_DELAY_MS');
    if (!raw) return 120;
    const value = Number.parseInt(raw, 10);
    if (!Number.isFinite(value)) return 120;
    return Math.min(2000, Math.max(0, value));
  }

  private assertInputPayloadMatchesSchema(
    inputSchema: {
      fields?: Array<{ name: string; required?: boolean; type?: string }>;
    } | null,
    inputPayload: Record<string, unknown>,
  ) {
    if (!inputSchema || !Array.isArray(inputSchema.fields)) return;

    const missing: string[] = [];
    const invalid: string[] = [];

    for (const field of inputSchema.fields) {
      const fieldName = field?.name;
      if (!fieldName) continue;
      const value = inputPayload[fieldName];

      if (field.required) {
        const isEmptyString =
          typeof value === 'string' && value.trim().length === 0;
        const isMissing =
          value === undefined || value === null || isEmptyString;
        if (isMissing) {
          missing.push(fieldName);
          continue;
        }
      }

      if (value == null) continue;

      if (field.type === 'number' && typeof value !== 'number') {
        invalid.push(fieldName);
      }
      if (field.type === 'json' && typeof value !== 'object') {
        invalid.push(fieldName);
      }
    }

    if (missing.length || invalid.length) {
      throw new BadRequestException({
        message: 'Input validation failed',
        missingFields: missing,
        invalidFields: invalid,
      });
    }
  }
}
