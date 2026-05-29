import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WorkflowRunStatus } from '../../common/enums/workflow-run-status.enum';
import {
  WorkflowExecutionProvider,
  type ProviderExecuteParams,
} from '../interfaces/workflow-execution-provider';
import { ProviderExecutionResult } from '../types/provider-execution.types';
import { ProviderType } from '../types/provider-type';

type OpenAIResponse = {
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
};

export type OpenAIProviderStatus = 'disabled' | 'enabled' | 'missing_api_key';

@Injectable()
export class OpenAIWorkflowProvider implements WorkflowExecutionProvider {
  constructor(private readonly configService: ConfigService) {}

  getProviderType(): ProviderType {
    return ProviderType.OpenAI;
  }

  getProviderName(): string {
    return 'OpenAIWorkflowProvider';
  }

  isEnabled(): boolean {
    return this.configService.get<string>('OPENAI_PROVIDER_ENABLED') === 'true';
  }

  getAvailabilityStatus(): OpenAIProviderStatus {
    if (!this.isEnabled()) return 'disabled';
    return this.configService.get<string>('OPENAI_API_KEY')?.trim()
      ? 'enabled'
      : 'missing_api_key';
  }

  validatePayload(): void {
    // Workflow-level schema validation is handled by the orchestrator.
  }

  async execute(
    params: ProviderExecuteParams,
  ): Promise<ProviderExecutionResult> {
    const startedAt = Date.now();
    const model =
      this.configService.get<string>('OPENAI_MODEL')?.trim() || 'gpt-4o-mini';

    if (!this.isEnabled()) {
      return this.failureResult(
        startedAt,
        model,
        'OpenAI provider is not enabled for this local environment. Use simulated provider or configure the backend environment variables.',
      );
    }

    const apiKey = this.configService.get<string>('OPENAI_API_KEY')?.trim();
    if (!apiKey) {
      return this.failureResult(
        startedAt,
        model,
        'OpenAI provider is not enabled for this local environment. Use simulated provider or configure the backend environment variables.',
      );
    }

    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          store: false,
          instructions:
            'You are executing a public demo workflow. Generate a concise structured response using only the provided workflow description and input payload. Do not include private data. Return clear business-friendly output.',
          input: this.buildInput(params),
        }),
      });

      if (!response.ok) {
        return this.failureResult(
          startedAt,
          model,
          `OpenAI provider request failed with status ${response.status}.`,
        );
      }

      const responsePayload = (await response.json()) as OpenAIResponse;
      const responseText = this.extractOutputText(responsePayload);
      if (!responseText) {
        return this.failureResult(
          startedAt,
          model,
          'Invalid response schema: OpenAI provider returned no text output.',
        );
      }

      const executionTimeMs = Date.now() - startedAt;
      return {
        status: WorkflowRunStatus.Completed,
        outputPayload: {
          responseText,
        },
        errorMessage: null,
        executionTimeMs,
        metadata: this.buildMetadata(
          model,
          executionTimeMs,
          WorkflowRunStatus.Completed,
        ),
        logs: [
          {
            stepName: 'provider_openai_response_received',
            message: 'OpenAI provider returned a text response.',
          },
        ],
      };
    } catch (e) {
      return this.failureResult(
        startedAt,
        model,
        this.toSafeRequestErrorMessage(e),
      );
    }
  }

  private buildInput(params: ProviderExecuteParams): string {
    return [
      `Workflow name: ${params.workflow.name}`,
      `Workflow description: ${params.workflow.description}`,
      'Input payload:',
      JSON.stringify(params.inputPayload, null, 2),
    ].join('\n');
  }

  private extractOutputText(response: OpenAIResponse): string | null {
    const text = response.output
      ?.flatMap((item) => item.content ?? [])
      .filter((content) => content.type === 'output_text')
      .map((content) => content.text ?? '')
      .join('')
      .trim();

    return text || null;
  }

  private failureResult(
    startedAt: number,
    model: string,
    errorMessage: string,
  ): ProviderExecutionResult {
    const executionTimeMs = Date.now() - startedAt;
    return {
      status: WorkflowRunStatus.Failed,
      outputPayload: null,
      errorMessage,
      executionTimeMs,
      metadata: this.buildMetadata(
        model,
        executionTimeMs,
        WorkflowRunStatus.Failed,
      ),
      logs: [
        {
          stepName: 'provider_openai_error',
          message: errorMessage,
        },
      ],
    };
  }

  private toSafeRequestErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      const normalized = error.message.toLowerCase();
      if (
        normalized.includes('fetch failed') ||
        normalized.includes('econn') ||
        normalized.includes('enotfound') ||
        normalized.includes('network')
      ) {
        return 'Connection failure: OpenAI provider request could not reach the service.';
      }

      if (
        normalized.includes('timeout') ||
        normalized.includes('timed out') ||
        normalized.includes('aborted')
      ) {
        return 'Request timeout: OpenAI provider request did not complete in time.';
      }
    }

    return 'OpenAI provider request failed unexpectedly.';
  }

  private buildMetadata(
    model: string,
    executionTimeMs: number,
    status: WorkflowRunStatus.Completed | WorkflowRunStatus.Failed,
  ): Record<string, unknown> {
    return {
      provider: ProviderType.OpenAI,
      model,
      executionTimeMs,
      status,
      timestamp: new Date().toISOString(),
    };
  }
}
