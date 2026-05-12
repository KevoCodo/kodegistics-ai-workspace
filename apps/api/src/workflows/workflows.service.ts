import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowEntity } from './workflow.entity';
import { WorkflowStatus } from '../common/enums/workflow-status.enum';

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
}

