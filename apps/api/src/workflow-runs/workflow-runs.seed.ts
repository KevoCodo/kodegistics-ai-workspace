import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowRunStatus } from '../common/enums/workflow-run-status.enum';
import { WorkflowEntity } from '../workflows/workflow.entity';
import { WorkflowLogEntity } from '../workflow-logs/workflow-log.entity';
import { WorkflowRunEntity } from './workflow-run.entity';

@Injectable()
export class WorkflowRunsSeed implements OnModuleInit {
  private readonly logger = new Logger(WorkflowRunsSeed.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(WorkflowRunEntity)
    private readonly runsRepo: Repository<WorkflowRunEntity>,
    @InjectRepository(WorkflowLogEntity)
    private readonly logsRepo: Repository<WorkflowLogEntity>,
    @InjectRepository(WorkflowEntity)
    private readonly workflowsRepo: Repository<WorkflowEntity>,
  ) {}

  async onModuleInit() {
    const raw = this.configService.get<string>('SEED_SAMPLE_RUNS');
    const nodeEnv = this.configService.get<string>('NODE_ENV') ?? 'development';
    const seedEnabled = raw != null ? raw === 'true' : nodeEnv !== 'production';
    if (!seedEnabled) return;

    const existingCount = await this.runsRepo.count();
    if (existingCount > 0) {
      this.logger.log('Sample runs seed skipped (runs already exist).');
      return;
    }

    const workflows = await this.workflowsRepo.find();
    const bySlug = new Map(workflows.map((w) => [w.slug, w]));

    const now = Date.now();
    const mkDate = (minsAgo: number) => new Date(now - minsAgo * 60_000);

    const samples: Array<{
      slug: string;
      status: WorkflowRunStatus;
      inputPayload: Record<string, unknown>;
      outputPayload: Record<string, unknown> | null;
      errorMessage: string | null;
      startedAt: Date | null;
      completedAt: Date | null;
      logs: Array<{ stepName: string; message: string }>;
    }> = [
      {
        slug: 'blog-draft',
        status: WorkflowRunStatus.Completed,
        inputPayload: { topic: 'AI workflow dashboards', audience: 'Engineers', tone: 'Pragmatic' },
        outputPayload: {
          title: 'Blog Draft: AI workflow dashboards',
          meta: { audience: 'Engineers', tone: 'Pragmatic' },
          outline: [
            'Why AI workflow dashboards matters',
            'Core concepts',
            'Common pitfalls',
            'A simple implementation approach',
            'Next steps',
          ],
          draft:
            'This is a simulated blog draft about AI workflow dashboards.\n' +
            'Target audience: Engineers. Tone: Pragmatic.\n\n' +
            'Intro: AI workflow dashboards is a useful pattern for turning repeatable work into consistent outcomes.\n' +
            'Key points: define inputs/outputs, track run state, and log every step for observability.\n' +
            'Conclusion: start with simulation, then add optional integrations behind feature flags.',
        },
        errorMessage: null,
        startedAt: mkDate(55),
        completedAt: mkDate(54),
        logs: [
          { stepName: 'queued', message: 'Workflow run created and queued for simulated execution.' },
          { stepName: 'validation', message: 'Validating input payload against workflow input schema.' },
          { stepName: 'routing', message: 'Routing to workflow runner: blog-draft' },
          { stepName: 'simulated_processing', message: 'Simulating processing (deterministic, no external calls).' },
          { stepName: 'formatting', message: 'Formatting simulated output payload.' },
          { stepName: 'completed', message: 'Workflow run completed successfully (simulated).' },
        ],
      },
      {
        slug: 'report-summary',
        status: WorkflowRunStatus.Failed,
        inputPayload: { reportText: 'Quarterly report text (sanitized sample)...', summaryLength: 'short' },
        outputPayload: null,
        errorMessage: 'Simulated failure: output formatting step encountered an unexpected edge case.',
        startedAt: mkDate(32),
        completedAt: mkDate(31),
        logs: [
          { stepName: 'queued', message: 'Workflow run created and queued for simulated execution.' },
          { stepName: 'validation', message: 'Validating input payload against workflow input schema.' },
          { stepName: 'routing', message: 'Routing to workflow runner: report-summary' },
          { stepName: 'simulated_processing', message: 'Simulating processing (deterministic, no external calls).' },
          { stepName: 'failed', message: 'Simulated failure: output formatting step encountered an unexpected edge case.' },
        ],
      },
      {
        slug: 'intake-classification',
        status: WorkflowRunStatus.Running,
        inputPayload: { intakeText: 'Customer asked for a change request with high urgency.' },
        outputPayload: null,
        errorMessage: null,
        startedAt: mkDate(7),
        completedAt: null,
        logs: [
          { stepName: 'queued', message: 'Workflow run created and queued for simulated execution.' },
          { stepName: 'routing', message: 'Routing to workflow runner: intake-classification' },
          { stepName: 'simulated_processing', message: 'Simulating processing (deterministic, no external calls).' },
        ],
      },
      {
        slug: 'meeting-summary',
        status: WorkflowRunStatus.Queued,
        inputPayload: { notesText: '- Discussed milestones\n- Identified risks\n- Next steps agreed' },
        outputPayload: null,
        errorMessage: null,
        startedAt: null,
        completedAt: null,
        logs: [
          { stepName: 'queued', message: 'Workflow run created and queued for simulated execution.' },
        ],
      },
    ];

    for (const sample of samples) {
      const workflow = bySlug.get(sample.slug);
      if (!workflow) continue;

      const run = await this.runsRepo.save(
        this.runsRepo.create({
          workflowId: workflow.id,
          workflow,
          inputPayload: sample.inputPayload,
          outputPayload: sample.outputPayload,
          status: sample.status,
          errorMessage: sample.errorMessage,
          startedAt: sample.startedAt,
          completedAt: sample.completedAt,
        }),
      );

      await this.logsRepo.save(
        sample.logs.map((l, idx) =>
          this.logsRepo.create({
            workflowRunId: run.id,
            stepName: l.stepName,
            message: l.message,
          }),
        ),
      );
    }

    this.logger.log(`Seeded sample runs: ${samples.length}`);
  }
}
