import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowEventEntity } from '../workflow-events/workflow-event.entity';
import { WorkflowEventsModule } from '../workflow-events/workflow-events.module';
import { WorkflowLogEntity } from '../workflow-logs/workflow-log.entity';
import { WorkflowsModule } from '../workflows/workflows.module';
import { ProvidersModule } from '../providers/providers.module';
import { WorkflowRunEntity } from './workflow-run.entity';
import { WorkflowRunsController } from './workflow-runs.controller';
import { WorkflowRunsService } from './workflow-runs.service';
import { WorkflowRunsSeed } from './workflow-runs.seed';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WorkflowRunEntity,
      WorkflowLogEntity,
      WorkflowEventEntity,
    ]),
    WorkflowsModule,
    ProvidersModule,
    WorkflowEventsModule,
  ],
  controllers: [WorkflowRunsController],
  providers: [WorkflowRunsService, WorkflowRunsSeed],
  exports: [TypeOrmModule, WorkflowRunsService],
})
export class WorkflowRunsModule {}
