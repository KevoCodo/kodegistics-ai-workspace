import { Controller, Get, Param, Query } from '@nestjs/common';
import { WorkflowEventsService } from './workflow-events.service';

@Controller()
export class WorkflowEventsController {
  constructor(private readonly workflowEventsService: WorkflowEventsService) {}

  @Get('workflow-runs/:id/events')
  async listForRun(@Param('id') id: string) {
    return this.workflowEventsService.listForRun(id);
  }

  @Get('workflow-events/recent')
  async listRecent(@Query('limit') rawLimit?: string) {
    const limit = rawLimit ? Number.parseInt(rawLimit, 10) : 25;
    return this.workflowEventsService.listRecent(limit);
  }
}
