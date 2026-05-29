import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WorkflowEventType } from '../common/enums/workflow-event-type.enum';
import { WorkflowRunEntity } from '../workflow-runs/workflow-run.entity';

@Entity({ name: 'workflow_event' })
export class WorkflowEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid', name: 'run_id' })
  runId!: string;

  @ManyToOne(() => WorkflowRunEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'run_id' })
  run!: WorkflowRunEntity;

  @Index()
  @Column({ type: 'enum', enum: WorkflowEventType })
  type!: WorkflowEventType;

  @Column({ type: 'text' })
  message!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
