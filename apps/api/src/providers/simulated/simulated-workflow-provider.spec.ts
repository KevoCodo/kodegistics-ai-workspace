import { WorkflowRunStatus } from '../../common/enums/workflow-run-status.enum';
import { WorkflowEntity } from '../../workflows/workflow.entity';
import { SimulatedWorkflowProvider } from './simulated-workflow-provider';

describe('SimulatedWorkflowProvider', () => {
  it('continues to return deterministic completed output and simulation logs', async () => {
    const provider = new SimulatedWorkflowProvider();
    const workflow = {
      slug: 'intake-classification',
    } as WorkflowEntity;

    const result = await provider.execute({
      workflow,
      inputPayload: { intakeText: 'Urgent bug report.' },
    });

    expect(result.status).toBe(WorkflowRunStatus.Completed);
    expect(result.errorMessage).toBeNull();
    expect(result.outputPayload).toMatchObject({
      category: 'Incident',
      priority: 'High',
    });
    expect(result.metadata).toMatchObject({
      provider: 'simulated',
      status: WorkflowRunStatus.Completed,
    });
    expect(result.logs.map((log) => log.stepName)).toEqual([
      'simulated_processing',
      'formatting',
    ]);
  });

  it('produces structured output for the AI business summary demo workflow', async () => {
    const provider = new SimulatedWorkflowProvider();
    const workflow = {
      slug: 'ai-business-summary',
    } as WorkflowEntity;

    const result = await provider.execute({
      workflow,
      inputPayload: {
        notes:
          'Milestone approved.\nTwo risks remain open.\nReview scheduled Friday.',
        audience: 'Leadership team',
        tone: 'Concise',
      },
    });

    expect(result.status).toBe(WorkflowRunStatus.Completed);
    expect(result.outputPayload).toMatchObject({
      audience: 'Leadership team',
      tone: 'Concise',
      highlights: [
        'Milestone approved.',
        'Two risks remain open.',
        'Review scheduled Friday.',
      ],
    });
  });
});
