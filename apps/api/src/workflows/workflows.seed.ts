import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowStatus } from '../common/enums/workflow-status.enum';
import { WorkflowEntity } from './workflow.entity';
import { ProviderType } from '../providers/types/provider-type';

@Injectable()
export class WorkflowsSeed implements OnModuleInit {
  private readonly logger = new Logger(WorkflowsSeed.name);

  constructor(
    @InjectRepository(WorkflowEntity)
    private readonly workflowsRepo: Repository<WorkflowEntity>,
  ) {}

  async onModuleInit() {
    const seeds: Array<Pick<
      WorkflowEntity,
      'name' | 'slug' | 'description' | 'category' | 'status' | 'providerType' | 'inputSchema'
    >> = [
      {
        name: 'Blog Draft Workflow',
        slug: 'blog-draft',
        description:
          'Generate a structured blog post draft from a topic and basic preferences (simulated).',
        category: 'Content Automation',
        status: WorkflowStatus.Active,
        providerType: ProviderType.Simulated,
        inputSchema: {
          fields: [
            { name: 'topic', label: 'Topic', type: 'text', required: true },
            { name: 'audience', label: 'Audience', type: 'text', required: true },
            { name: 'tone', label: 'Tone', type: 'text', required: false },
          ],
        },
      },
      {
        name: 'Report Summary Workflow',
        slug: 'report-summary',
        description:
          'Summarize a pasted report into key takeaways and action items (simulated).',
        category: 'Business Reporting',
        status: WorkflowStatus.Active,
        providerType: ProviderType.Simulated,
        inputSchema: {
          fields: [
            {
              name: 'reportText',
              label: 'Report Text',
              type: 'textarea',
              required: true,
            },
            {
              name: 'summaryLength',
              label: 'Summary Length',
              type: 'text',
              required: false,
              placeholder: 'short | medium | long',
            },
          ],
        },
      },
      {
        name: 'Intake Classification Workflow',
        slug: 'intake-classification',
        description:
          'Classify an intake message into a category and priority (simulated).',
        category: 'Workflow Routing',
        status: WorkflowStatus.Active,
        providerType: ProviderType.Simulated,
        inputSchema: {
          fields: [
            {
              name: 'intakeText',
              label: 'Intake Text',
              type: 'textarea',
              required: true,
            },
          ],
        },
      },
      {
        name: 'Meeting Summary Workflow',
        slug: 'meeting-summary',
        description:
          'Turn meeting notes into a concise recap and next steps (simulated).',
        category: 'Internal Operations',
        status: WorkflowStatus.Active,
        providerType: ProviderType.Simulated,
        inputSchema: {
          fields: [
            {
              name: 'notesText',
              label: 'Meeting Notes',
              type: 'textarea',
              required: true,
            },
            {
              name: 'attendees',
              label: 'Attendees (optional)',
              type: 'text',
              required: false,
              placeholder: 'Comma-separated names',
            },
          ],
        },
      },
    ];

    const slugs = seeds.map((s) => s.slug);
    const existing = await this.workflowsRepo.find({
      where: slugs.map((slug) => ({ slug })),
      select: { slug: true },
    });
    const existingSlugs = new Set(existing.map((w) => w.slug));

    const toInsert = seeds.filter((s) => !existingSlugs.has(s.slug));
    if (toInsert.length === 0) {
      this.logger.log('Seeded workflows skipped (already present).');
      return;
    }

    await this.workflowsRepo.insert(toInsert);
    this.logger.log(`Seeded workflows: ${toInsert.map((s) => s.slug).join(', ')}`);
  }
}

