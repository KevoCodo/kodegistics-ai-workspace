import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkflowStatus } from '../../common/enums/workflow-status.enum';
import { ProviderType } from '../../providers/types/provider-type';
import { WorkflowInputSchemaDto } from './workflow-schema.dto';

export class UpdateWorkflowDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;

  @IsOptional()
  @IsEnum(ProviderType)
  providerType?: ProviderType;

  @IsOptional()
  @ValidateNested()
  @Type(() => WorkflowInputSchemaDto)
  inputSchema?: WorkflowInputSchemaDto;
}
