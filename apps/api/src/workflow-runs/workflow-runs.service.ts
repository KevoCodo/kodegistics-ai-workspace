import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowRunStatus } from '../common/enums/workflow-run-status.enum';
import { WorkflowsService } from '../workflows/workflows.service';
import { WorkflowLogEntity } from '../workflow-logs/workflow-log.entity';
import { WorkflowRunEntity } from './workflow-run.entity';
import { CreateWorkflowRunDto } from './dto/create-workflow-run.dto';

@Injectable()
export class WorkflowRunsService {
  constructor(
    @InjectRepository(WorkflowRunEntity)
    private readonly runsRepo: Repository<WorkflowRunEntity>,
    @InjectRepository(WorkflowLogEntity)
    private readonly logsRepo: Repository<WorkflowLogEntity>,
    private readonly workflowsService: WorkflowsService,
    private readonly configService: ConfigService,
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
      'Workflow run created and queued for simulated execution.',
    );

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
      await log(
        'simulated_processing',
        'Simulating processing (deterministic, no external calls).',
      );
      await log('formatting', 'Formatting simulated output payload.');

      const outputPayload = this.buildSimulatedOutput(workflow.slug, inputPayload);
      const completedAt = new Date();

      await this.runsRepo.save({
        id: savedRun.id,
        status: WorkflowRunStatus.Completed,
        outputPayload,
        completedAt,
      });
      await log('completed', 'Workflow run completed successfully (simulated).');
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Workflow run failed (simulated).';
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

  private async appendLog(
    runId: string,
    stepName: string,
    message: string,
  ) {
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
    inputSchema: { fields?: Array<{ name: string; required?: boolean; type?: string }> } | null,
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
        const isEmptyString = typeof value === 'string' && value.trim().length === 0;
        const isMissing = value === undefined || value === null || isEmptyString;
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

  private buildSimulatedOutput(
    workflowSlug: string,
    inputPayload: Record<string, unknown>,
  ): Record<string, unknown> {
    const topic =
      typeof inputPayload.topic === 'string' ? inputPayload.topic.trim() : null;
    const audience =
      typeof inputPayload.audience === 'string'
        ? inputPayload.audience.trim()
        : null;
    const tone =
      typeof inputPayload.tone === 'string' ? inputPayload.tone.trim() : null;
    const reportText =
      typeof inputPayload.reportText === 'string'
        ? inputPayload.reportText.trim()
        : null;
    const notesText =
      typeof inputPayload.notesText === 'string'
        ? inputPayload.notesText.trim()
        : null;
    const intakeText =
      typeof inputPayload.intakeText === 'string'
        ? inputPayload.intakeText.trim()
        : null;

    const safeSnippet = (text: string, maxLen: number) =>
      text.length <= maxLen ? text : `${text.slice(0, maxLen).trim()}…`;

    const normalizeLines = (text: string) =>
      text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 12);

    switch (workflowSlug) {
      case 'blog-draft':
        {
          const titleBase = topic ?? 'Sample topic';
          const audienceText = audience ?? 'a general technical audience';
          const toneText = tone ?? 'Clear and practical';
          const outline = [
            `Why ${titleBase} matters`,
            'Core concepts',
            'Common pitfalls',
            'A simple implementation approach',
            'Next steps',
          ];
        return {
            title: `Blog Draft: ${titleBase}`,
            meta: {
              audience: audienceText,
              tone: toneText,
            },
            outline,
            draft: [
              `This is a simulated blog draft about ${titleBase}.`,
              `Target audience: ${audienceText}. Tone: ${toneText}.`,
              '',
              `Intro: ${titleBase} is a useful pattern for turning repeatable work into consistent outcomes.`,
              'Key points: define inputs/outputs, track run state, and log every step for observability.',
              'Conclusion: start with simulation, then add optional integrations behind feature flags.',
            ].join('\n'),
        };
        }
      case 'report-summary':
        {
          const base = reportText ?? 'Report text not provided';
          const snippet = safeSnippet(base, 220);
        return {
            summary: `Simulated summary based on the provided report text: ${snippet}`,
            keyPoints: [
              'Key trend: a notable change over the reporting period.',
              'Risk: a potential blocker requiring attention.',
              'Opportunity: an area to optimize or automate.',
            ],
            actionItems: [
              'Validate assumptions and confirm data sources.',
              'Assign an owner to the highest-risk item.',
              'Draft a short follow-up plan with next steps.',
            ],
        };
        }
      case 'intake-classification':
        {
          const text = (intakeText ?? '').toLowerCase();
          const hasUrgent = /urgent|asap|immediately|critical/.test(text);
          const hasBug = /bug|error|broken|issue|incident/.test(text);
          const hasChange = /change|request|feature|enhancement/.test(text);

          const category = hasBug
            ? 'Incident'
            : hasChange
              ? 'Change Request'
              : 'General Inquiry';
          const priority = hasUrgent ? 'High' : hasBug ? 'Medium' : 'Low';
          const confidence = hasUrgent || hasBug || hasChange ? 0.78 : 0.55;

        return {
            category,
            priority,
            confidence,
            rationale: 'Simulated classification using deterministic keyword rules.',
        };
        }
      case 'meeting-summary':
        {
          const lines = notesText ? normalizeLines(notesText) : [];
          const bullets = lines.map((l) => l.replace(/^[-*]\s*/, ''));
        return {
            summary:
              bullets.length > 0
                ? `Simulated meeting summary based on ${bullets.length} note items.`
                : 'Simulated meeting summary based on the provided notes.',
            decisions: bullets.slice(0, 2),
            nextSteps: [
              'Confirm owners for each action item.',
              'Schedule a short follow-up check-in.',
              'Publish the recap to the team channel.',
            ],
        };
        }
      default:
        return {
          summary: 'Simulated output generated for this workflow.',
          workflowSlug,
        };
    }
  }
}
