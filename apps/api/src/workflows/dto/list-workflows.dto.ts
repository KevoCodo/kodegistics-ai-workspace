import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WorkflowStatus } from '../../common/enums/workflow-status.enum';

export class ListWorkflowsQueryDto {
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;

  @IsOptional()
  @IsString()
  category?: string;
}

