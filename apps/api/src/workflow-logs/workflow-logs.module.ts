import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowRunEntity } from '../workflow-runs/workflow-run.entity';
import { WorkflowLogEntity } from './workflow-log.entity';
import { WorkflowLogsController } from './workflow-logs.controller';
import { WorkflowLogsService } from './workflow-logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowLogEntity, WorkflowRunEntity])],
  controllers: [WorkflowLogsController],
  providers: [WorkflowLogsService],
})
export class WorkflowLogsModule {}

