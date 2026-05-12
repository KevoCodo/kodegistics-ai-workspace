import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowEntity } from './workflow.entity';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { WorkflowsSeed } from './workflows.seed';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowEntity])],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, WorkflowsSeed],
  exports: [TypeOrmModule, WorkflowsService],
})
export class WorkflowsModule {}
