import { WorkflowStatus } from '../../common/enums/workflow-status.enum';

export type WorkflowFieldSchema = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'json';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
};

export type WorkflowInputSchema = {
  fields: WorkflowFieldSchema[];
};

export class WorkflowResponseDto {
  id!: string;
  name!: string;
  slug!: string;
  description!: string;
  category!: string;
  status!: WorkflowStatus;
  inputSchema!: WorkflowInputSchema;
  createdAt!: Date;
  updatedAt!: Date;
}

