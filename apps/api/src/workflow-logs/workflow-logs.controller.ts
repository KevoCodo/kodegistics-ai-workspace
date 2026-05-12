import { Controller, Get, Param } from '@nestjs/common';
import { WorkflowLogsService } from './workflow-logs.service';

@Controller('workflow-runs/:id/logs')
export class WorkflowLogsController {
  constructor(private readonly workflowLogsService: WorkflowLogsService) {}

  @Get()
  async list(@Param('id') id: string) {
    return this.workflowLogsService.listForRun(id);
  }
}

