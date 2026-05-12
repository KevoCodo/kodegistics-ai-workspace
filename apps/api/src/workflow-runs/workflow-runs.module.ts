import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowLogEntity } from '../workflow-logs/workflow-log.entity';
import { WorkflowsModule } from '../workflows/workflows.module';
import { WorkflowRunEntity } from './workflow-run.entity';
import { WorkflowRunsController } from './workflow-runs.controller';
import { WorkflowRunsService } from './workflow-runs.service';
import { WorkflowRunsSeed } from './workflow-runs.seed';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkflowRunEntity, WorkflowLogEntity]),
    WorkflowsModule,
  ],
  controllers: [WorkflowRunsController],
  providers: [WorkflowRunsService, WorkflowRunsSeed],
  exports: [TypeOrmModule, WorkflowRunsService],
})
export class WorkflowRunsModule {}
