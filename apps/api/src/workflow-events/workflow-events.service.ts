import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowEventType } from '../common/enums/workflow-event-type.enum';
import { WorkflowRunEntity } from '../workflow-runs/workflow-run.entity';
import { WorkflowEventEntity } from './workflow-event.entity';

@Injectable()
export class WorkflowEventsService {
  constructor(
    @InjectRepository(WorkflowEventEntity)
    private readonly eventsRepo: Repository<WorkflowEventEntity>,
    @InjectRepository(WorkflowRunEntity)
    private readonly runsRepo: Repository<WorkflowRunEntity>,
  ) {}

  async record(
    runId: string,
    type: WorkflowEventType,
    message: string,
  ): Promise<WorkflowEventEntity> {
    return this.eventsRepo.save(
      this.eventsRepo.create({
        runId,
        type,
        message,
      }),
    );
  }

  async listForRun(runId: string): Promise<WorkflowEventEntity[]> {
    const exists = await this.runsRepo.exist({ where: { id: runId } });
    if (!exists) {
      throw new NotFoundException(`Workflow run not found: ${runId}`);
    }

    return this.eventsRepo.find({
      where: { runId },
      order: { createdAt: 'DESC' },
    });
  }

  async listRecent(limit = 25): Promise<WorkflowEventEntity[]> {
    return this.eventsRepo.find({
      order: { createdAt: 'DESC' },
      take: Math.min(100, Math.max(1, limit)),
    });
  }
}
