import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateWorkflowRunDto } from './dto/create-workflow-run.dto';
import { WorkflowRunsService } from './workflow-runs.service';

@Controller('workflow-runs')
export class WorkflowRunsController {
  constructor(private readonly workflowRunsService: WorkflowRunsService) {}

  @Get()
  async list() {
    return this.workflowRunsService.list();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.workflowRunsService.getById(id);
  }

  @Post()
  async create(@Body() dto: CreateWorkflowRunDto) {
    return this.workflowRunsService.create(dto);
  }
}

