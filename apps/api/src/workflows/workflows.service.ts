import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowEntity } from './workflow.entity';
import { WorkflowStatus } from '../common/enums/workflow-status.enum';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { WorkflowFieldSchemaDto } from './dto/workflow-schema.dto';
import { ProviderType } from '../providers/types/provider-type';

@Injectable()
export class WorkflowsService {
  constructor(
    @InjectRepository(WorkflowEntity)
    private readonly workflowsRepo: Repository<WorkflowEntity>,
  ) {}

  async list(params: {
    status?: WorkflowStatus;
    category?: string;
  }): Promise<WorkflowEntity[]> {
    const query = this.workflowsRepo.createQueryBuilder('w');

    if (params.status) {
      query.andWhere('w.status = :status', { status: params.status });
    }
    if (params.category) {
      query.andWhere('w.category = :category', { category: params.category });
    }

    query.orderBy('w.category', 'ASC').addOrderBy('w.name', 'ASC');
    return query.getMany();
  }

  async findBySlug(slug: string): Promise<WorkflowEntity | null> {
    return this.workflowsRepo.findOne({ where: { slug } });
  }

  async create(dto: CreateWorkflowDto): Promise<WorkflowEntity> {
    const existing = await this.workflowsRepo.findOne({
      where: { slug: dto.slug },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(`Workflow slug already exists: ${dto.slug}`);
    }

    this.assertInputSchemaValid(dto.inputSchema);

    const workflow = this.workflowsRepo.create({
      name: dto.name.trim(),
      slug: dto.slug.trim(),
      description: dto.description.trim(),
      category: dto.category.trim(),
      status: dto.status ?? WorkflowStatus.Active,
      providerType: dto.providerType ?? ProviderType.Simulated,
      inputSchema: dto.inputSchema,
    });

    return this.workflowsRepo.save(workflow);
  }

  async updateById(id: string, dto: UpdateWorkflowDto): Promise<WorkflowEntity> {
    const workflow = await this.workflowsRepo.findOne({ where: { id } });
    if (!workflow) {
      throw new NotFoundException(`Workflow not found: ${id}`);
    }

    if (dto.inputSchema) this.assertInputSchemaValid(dto.inputSchema);

    if (dto.name != null) workflow.name = dto.name.trim();
    if (dto.description != null) workflow.description = dto.description.trim();
    if (dto.category != null) workflow.category = dto.category.trim();
    if (dto.status != null) workflow.status = dto.status;
    if (dto.providerType != null) workflow.providerType = dto.providerType;
    if (dto.inputSchema != null) workflow.inputSchema = dto.inputSchema;

    return this.workflowsRepo.save(workflow);
  }

  async deactivateById(id: string): Promise<WorkflowEntity> {
    const workflow = await this.workflowsRepo.findOne({ where: { id } });
    if (!workflow) {
      throw new NotFoundException(`Workflow not found: ${id}`);
    }

    if (workflow.status !== WorkflowStatus.Inactive) {
      workflow.status = WorkflowStatus.Inactive;
      await this.workflowsRepo.save(workflow);
    }

    return workflow;
  }

  private assertInputSchemaValid(inputSchema: { fields: WorkflowFieldSchemaDto[] }) {
    if (!inputSchema || !Array.isArray(inputSchema.fields)) {
      throw new BadRequestException('inputSchema must include a fields array.');
    }

    const seen = new Set<string>();
    const duplicates: string[] = [];

    for (const field of inputSchema.fields) {
      const name = field?.name?.trim();
      if (!name) continue;
      if (seen.has(name)) duplicates.push(name);
      seen.add(name);
    }

    if (duplicates.length > 0) {
      throw new BadRequestException(
        `inputSchema.fields contains duplicate field names: ${duplicates.join(', ')}`,
      );
    }
  }
}

