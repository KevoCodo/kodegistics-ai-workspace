import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowStatus } from '../common/enums/workflow-status.enum';
import { WorkflowEntity } from './workflow.entity';

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
      'name' | 'slug' | 'description' | 'category' | 'status' | 'inputSchema'
    >> = [
      {
        name: 'Blog Draft Workflow',
        slug: 'blog-draft',
        description:
          'Generate a structured blog post draft from a topic and basic preferences (simulated).',
        category: 'Content Automation',
        status: WorkflowStatus.Active,
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

    await this.workflowsRepo.upsert(seeds, ['slug']);
    this.logger.log(`Seeded workflows: ${seeds.map((s) => s.slug).join(', ')}`);
  }
}

