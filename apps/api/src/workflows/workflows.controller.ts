import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ListWorkflowsQueryDto } from './dto/list-workflows.dto';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
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

  @Post()
  async create(@Body() dto: CreateWorkflowDto) {
    return this.workflowsService.create(dto);
  }

  @Patch(':id')
  async updateById(@Param('id') id: string, @Body() dto: UpdateWorkflowDto) {
    return this.workflowsService.updateById(id, dto);
  }

  @Delete(':id')
  async deactivateById(@Param('id') id: string) {
    return this.workflowsService.deactivateById(id);
  }
}

