import { ConfigService } from '@nestjs/config';
import { WorkflowRunStatus } from '../../common/enums/workflow-run-status.enum';
import { WorkflowEntity } from '../../workflows/workflow.entity';
import { OpenAIWorkflowProvider } from './openai-workflow-provider';

describe('OpenAIWorkflowProvider', () => {
  const workflow = {
    name: 'Demo Workflow',
    description: 'Summarize generic input.',
  } as WorkflowEntity;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a clean disabled error without making a request', async () => {
    const provider = new OpenAIWorkflowProvider(
      new ConfigService({ OPENAI_PROVIDER_ENABLED: 'false' }),
    );
    const fetchSpy = jest.spyOn(global, 'fetch');

    const result = await provider.execute({ workflow, inputPayload: {} });

    expect(provider.getAvailabilityStatus()).toBe('disabled');
    expect(result.status).toBe(WorkflowRunStatus.Failed);
    expect(result.errorMessage).toBe(
      'OpenAI provider is not enabled for this local environment. Use simulated provider or configure the backend environment variables.',
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns a clean missing-key error when enabled without credentials', async () => {
    const provider = new OpenAIWorkflowProvider(
      new ConfigService({ OPENAI_PROVIDER_ENABLED: 'true' }),
    );
    const fetchSpy = jest.spyOn(global, 'fetch');

    const result = await provider.execute({ workflow, inputPayload: {} });

    expect(provider.getAvailabilityStatus()).toBe('missing_api_key');
    expect(result.status).toBe(WorkflowRunStatus.Failed);
    expect(result.errorMessage).toBe(
      'OpenAI provider is not enabled for this local environment. Use simulated provider or configure the backend environment variables.',
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('executes a Responses API request and returns safe output metadata', async () => {
    const provider = new OpenAIWorkflowProvider(
      new ConfigService({
        OPENAI_PROVIDER_ENABLED: 'true',
        OPENAI_API_KEY: 'test-key',
        OPENAI_MODEL: 'gpt-4o-mini',
      }),
    );
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          output: [
            {
              type: 'message',
              content: [
                { type: 'output_text', text: 'Concise demo response.' },
              ],
            },
          ],
        }),
    } as Response);

    const result = await provider.execute({
      workflow,
      inputPayload: { topic: 'public demo' },
    });

    expect(provider.getAvailabilityStatus()).toBe('enabled');
    expect(result.status).toBe(WorkflowRunStatus.Completed);
    expect(result.outputPayload).toEqual({
      responseText: 'Concise demo response.',
    });
    expect(result.metadata).toMatchObject({
      provider: 'openai',
      model: 'gpt-4o-mini',
      status: WorkflowRunStatus.Completed,
    });
    expect(JSON.stringify(result.metadata)).not.toContain('test-key');
  });

  it('returns a clean provider error when the API rejects the request', async () => {
    const provider = new OpenAIWorkflowProvider(
      new ConfigService({
        OPENAI_PROVIDER_ENABLED: 'true',
        OPENAI_API_KEY: 'test-key',
      }),
    );
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
    } as Response);

    const result = await provider.execute({ workflow, inputPayload: {} });

    expect(result.status).toBe(WorkflowRunStatus.Failed);
    expect(result.errorMessage).toBe(
      'OpenAI provider request failed with status 401.',
    );
    expect(JSON.stringify(result)).not.toContain('test-key');
  });

  it('returns a validation failure when the provider response shape is unusable', async () => {
    const provider = new OpenAIWorkflowProvider(
      new ConfigService({
        OPENAI_PROVIDER_ENABLED: 'true',
        OPENAI_API_KEY: 'test-key',
      }),
    );
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ output: [] }),
    } as Response);

    const result = await provider.execute({ workflow, inputPayload: {} });

    expect(result.status).toBe(WorkflowRunStatus.Failed);
    expect(result.errorMessage).toBe(
      'Invalid response schema: OpenAI provider returned no text output.',
    );
  });

  it('returns a clean network failure without exposing credentials', async () => {
    const provider = new OpenAIWorkflowProvider(
      new ConfigService({
        OPENAI_PROVIDER_ENABLED: 'true',
        OPENAI_API_KEY: 'test-key',
      }),
    );
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('fetch failed'));

    const result = await provider.execute({ workflow, inputPayload: {} });

    expect(result.status).toBe(WorkflowRunStatus.Failed);
    expect(result.errorMessage).toBe(
      'Connection failure: OpenAI provider request could not reach the service.',
    );
    expect(JSON.stringify(result)).not.toContain('test-key');
  });
});
