import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FailureCategory } from '../common/enums/failure-category.enum';
import { WorkflowRunStatus } from '../common/enums/workflow-run-status.enum';
import { WorkflowEntity } from '../workflows/workflow.entity';

@Entity({ name: 'workflow_run' })
export class WorkflowRunEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid', name: 'workflow_id' })
  workflowId!: string;

  @ManyToOne(() => WorkflowEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'workflow_id' })
  workflow!: WorkflowEntity;

  @Column({ type: 'jsonb', name: 'input_payload' })
  inputPayload!: Record<string, unknown>;

  @Column({ type: 'jsonb', name: 'output_payload', nullable: true })
  outputPayload!: Record<string, unknown> | null;

  @Column({
    type: 'enum',
    enum: WorkflowRunStatus,
    default: WorkflowRunStatus.Queued,
  })
  status!: WorkflowRunStatus;

  @Column({ type: 'text', name: 'error_message', nullable: true })
  errorMessage!: string | null;

  @Column({ type: 'text', name: 'failure_reason', nullable: true })
  failureReason!: string | null;

  @Column({
    type: 'enum',
    enum: FailureCategory,
    name: 'failure_category',
    nullable: true,
  })
  failureCategory!: FailureCategory | null;

  @Column({ type: 'boolean', name: 'retry_eligible', default: false })
  retryEligible!: boolean;

  @Column({ type: 'timestamptz', name: 'last_error_at', nullable: true })
  lastErrorAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'started_at', nullable: true })
  startedAt!: Date | null;

  @Column({ type: 'timestamptz', name: 'completed_at', nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
