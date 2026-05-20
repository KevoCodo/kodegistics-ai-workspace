import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WorkflowStatus } from '../common/enums/workflow-status.enum';
import { type WorkflowInputSchema } from './dto/workflow-response.dto';
import { ProviderType } from '../providers/types/provider-type';

@Entity({ name: 'workflow' })
export class WorkflowEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 200 })
  slug!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'varchar', length: 200 })
  category!: string;

  @Column({ type: 'enum', enum: WorkflowStatus, default: WorkflowStatus.Active })
  status!: WorkflowStatus;

  @Column({
    type: 'enum',
    enum: ProviderType,
    default: ProviderType.Simulated,
    name: 'provider_type',
  })
  providerType!: ProviderType;

  @Column({ type: 'jsonb', name: 'input_schema' })
  inputSchema!: WorkflowInputSchema;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}

