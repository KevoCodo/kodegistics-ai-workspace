import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum WorkflowFieldType {
  Text = 'text',
  Textarea = 'textarea',
  Number = 'number',
  Select = 'select',
}

export class WorkflowSelectOptionDto {
  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsString()
  @IsNotEmpty()
  value!: string;
}

export class WorkflowFieldSchemaDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
    message: 'Field name must start with a letter and contain only letters, numbers, or underscores.',
  })
  name!: string;

  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsEnum(WorkflowFieldType, {
    message: 'Field type must be one of: text, textarea, number, select.',
  })
  type!: WorkflowFieldType;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  placeholder?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowSelectOptionDto)
  options?: WorkflowSelectOptionDto[];
}

export class WorkflowInputSchemaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowFieldSchemaDto)
  fields!: WorkflowFieldSchemaDto[];
}
