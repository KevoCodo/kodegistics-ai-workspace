import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ListWorkflowsQueryDto } from './dto/list-workflows.dto';
import { WorkflowsService } from './workflows.service';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get()
  async list(@Query() query: ListWorkflowsQueryDto) {
    return this.workflowsService.list(query);
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const workflow = await this.workflowsService.findBySlug(slug);
    if (!workflow) {
      throw new NotFoundException(`Workflow not found for slug: ${slug}`);
    }
    return workflow;
  }
}

