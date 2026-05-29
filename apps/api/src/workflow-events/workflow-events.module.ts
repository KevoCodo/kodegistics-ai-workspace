import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowRunEntity } from '../workflow-runs/workflow-run.entity';
import { WorkflowEventEntity } from './workflow-event.entity';
import { WorkflowEventsController } from './workflow-events.controller';
import { WorkflowEventsService } from './workflow-events.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowEventEntity, WorkflowRunEntity])],
  controllers: [WorkflowEventsController],
  providers: [WorkflowEventsService],
  exports: [WorkflowEventsService],
})
export class WorkflowEventsModule {}
