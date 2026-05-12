import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateWorkflowRunDto {
  @IsString()
  @IsNotEmpty()
  workflowSlug!: string;

  @IsOptional()
  @IsObject()
  inputPayload!: Record<string, unknown>;
}
