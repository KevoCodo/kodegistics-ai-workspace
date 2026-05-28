import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowRunStatus } from '../common/enums/workflow-run-status.enum';
import { ProviderRegistryService } from '../providers/registry/provider-registry.service';
import { ProviderType } from '../providers/types/provider-type';
import { WorkflowsService } from '../workflows/workflows.service';
import { WorkflowLogEntity } from '../workflow-logs/workflow-log.entity';
import { CreateWorkflowRunDto } from './dto/create-workflow-run.dto';
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
  ) {}

  async list(): Promise<WorkflowRunEntity[]> {
    return this.runsRepo.find({
      order: { createdAt: 'DESC' },
      relations: { workflow: true },
    });
  }

  async getById(id: string): Promise<WorkflowRunEntity> {
    const run = await this.runsRepo.findOne({
      where: { id },
      relations: { workflow: true },
    });
    if (!run) {
      throw new NotFoundException(`Workflow run not found: ${id}`);
    }
    return run;
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

    await log(
      'queued',
      'Workflow run created and queued for provider execution.',
    );

    const requestedProviderType =
      workflow.providerType ?? ProviderType.Simulated;

    try {
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

      await log('routing', `Routing to workflow runner: ${workflow.slug}`);

      const provider = this.providerRegistry.resolve(requestedProviderType);
      const resolvedProviderType = provider.getProviderType();
      await log(
        'provider_resolved',
        `Resolved execution provider: ${provider.getProviderName()} (${resolvedProviderType}).`,
      );
      await log(
        'provider_execution_started',
        `Starting ${resolvedProviderType} provider execution for workflow: ${workflow.slug}.`,
      );

      provider.validatePayload({ workflow, inputPayload });

      const result = await provider.execute({ workflow, inputPayload });
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
          completedAt,
        });
        await log('completed', 'Workflow run completed successfully.');
      } else {
        const message =
          result.errorMessage ??
          'Workflow run failed during provider execution.';
        await log(
          'provider_execution_failed',
          `${resolvedProviderType} provider execution failed: ${message} (${result.executionTimeMs}ms).`,
        );
        await this.runsRepo.save({
          id: savedRun.id,
          status: WorkflowRunStatus.Failed,
          errorMessage: message,
          completedAt,
        });
        await log('failed', message);
      }
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : 'Workflow run failed during provider execution.';
      await log(
        'provider_execution_failed',
        `${requestedProviderType} provider execution failed: ${message}`,
      );
      await this.runsRepo.save({
        id: savedRun.id,
        status: WorkflowRunStatus.Failed,
        errorMessage: message,
        completedAt: new Date(),
      });
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
