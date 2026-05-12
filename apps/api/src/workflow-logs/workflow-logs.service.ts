import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowRunEntity } from '../workflow-runs/workflow-run.entity';
import { WorkflowLogEntity } from './workflow-log.entity';

@Injectable()
export class WorkflowLogsService {
  constructor(
    @InjectRepository(WorkflowLogEntity)
    private readonly logsRepo: Repository<WorkflowLogEntity>,
    @InjectRepository(WorkflowRunEntity)
    private readonly runsRepo: Repository<WorkflowRunEntity>,
  ) {}

  async listForRun(runId: string): Promise<WorkflowLogEntity[]> {
    const exists = await this.runsRepo.exist({ where: { id: runId } });
    if (!exists) {
      throw new NotFoundException(`Workflow run not found: ${runId}`);
    }

    return this.logsRepo.find({
      where: { workflowRunId: runId },
      order: { createdAt: 'ASC' },
    });
  }
}
