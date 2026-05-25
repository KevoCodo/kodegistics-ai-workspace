import { Injectable } from '@nestjs/common';
import { WorkflowRunStatus } from '../../common/enums/workflow-run-status.enum';
import { WorkflowEntity } from '../../workflows/workflow.entity';
import {
  WorkflowExecutionProvider,
  type ProviderExecuteParams,
} from '../interfaces/workflow-execution-provider';
import { ProviderExecutionResult } from '../types/provider-execution.types';
import { ProviderType } from '../types/provider-type';

@Injectable()
export class SimulatedWorkflowProvider implements WorkflowExecutionProvider {
  getProviderType(): ProviderType {
    return ProviderType.Simulated;
  }

  getProviderName(): string {
    return 'SimulatedWorkflowProvider';
  }

  validatePayload(): void {
    // Workflow-level schema validation is handled by the orchestrator.
  }

  execute(params: ProviderExecuteParams): Promise<ProviderExecutionResult> {
    const started = Date.now();
    const logs: ProviderExecutionResult['logs'] = [];

    try {
      logs.push({
        stepName: 'simulated_processing',
        message: 'Simulating processing (deterministic, no external calls).',
      });

      const outputPayload = this.buildSimulatedOutput(
        params.workflow,
        params.inputPayload,
      );
      logs.push({
        stepName: 'formatting',
        message: 'Formatting simulated output payload.',
      });

      const executionTimeMs = Date.now() - started;
      return Promise.resolve({
        status: WorkflowRunStatus.Completed,
        outputPayload,
        errorMessage: null,
        executionTimeMs,
        metadata: this.buildMetadata(
          executionTimeMs,
          WorkflowRunStatus.Completed,
        ),
        logs,
      });
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : 'Provider execution failed (simulated).';
      logs.push({ stepName: 'provider_simulated_error', message });
      const executionTimeMs = Date.now() - started;
      return Promise.resolve({
        status: WorkflowRunStatus.Failed,
        outputPayload: null,
        errorMessage: message,
        executionTimeMs,
        metadata: this.buildMetadata(executionTimeMs, WorkflowRunStatus.Failed),
        logs,
      });
    }
  }

  private buildSimulatedOutput(
    workflow: WorkflowEntity,
    inputPayload: Record<string, unknown>,
  ): Record<string, unknown> {
    const workflowSlug = workflow.slug;

    const topic =
      typeof inputPayload.topic === 'string' ? inputPayload.topic.trim() : null;
    const audience =
      typeof inputPayload.audience === 'string'
        ? inputPayload.audience.trim()
        : null;
    const tone =
      typeof inputPayload.tone === 'string' ? inputPayload.tone.trim() : null;
    const reportText =
      typeof inputPayload.reportText === 'string'
        ? inputPayload.reportText.trim()
        : null;
    const notesText =
      typeof inputPayload.notesText === 'string'
        ? inputPayload.notesText.trim()
        : null;
    const intakeText =
      typeof inputPayload.intakeText === 'string'
        ? inputPayload.intakeText.trim()
        : null;
    const notes =
      typeof inputPayload.notes === 'string' ? inputPayload.notes.trim() : null;

    const safeSnippet = (text: string, maxLen: number) =>
      text.length <= maxLen ? text : `${text.slice(0, maxLen).trim()}...`;

    const normalizeLines = (text: string) =>
      text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 12);

    switch (workflowSlug) {
      case 'blog-draft': {
        const titleBase = topic ?? 'Sample topic';
        const audienceText = audience ?? 'a general technical audience';
        const toneText = tone ?? 'Clear and practical';
        const outline = [
          `Why ${titleBase} matters`,
          'Core concepts',
          'Common pitfalls',
          'A simple implementation approach',
          'Next steps',
        ];
        return {
          title: `Blog Draft: ${titleBase}`,
          meta: {
            audience: audienceText,
            tone: toneText,
          },
          outline,
          draft: [
            `This is a simulated blog draft about ${titleBase}.`,
            `Target audience: ${audienceText}. Tone: ${toneText}.`,
            '',
            `Intro: ${titleBase} is a useful pattern for turning repeatable work into consistent outcomes.`,
            'Key points: define inputs/outputs, track run state, and log every step for observability.',
            'Conclusion: start with simulation, then add optional integrations behind feature flags.',
          ].join('\n'),
        };
      }
      case 'report-summary': {
        const base = reportText ?? 'Report text not provided';
        const snippet = safeSnippet(base, 220);
        return {
          summary: `Simulated summary based on the provided report text: ${snippet}`,
          keyPoints: [
            'Key trend: a notable change over the reporting period.',
            'Risk: a potential blocker requiring attention.',
            'Opportunity: an area to optimize or automate.',
          ],
          actionItems: [
            'Validate assumptions and confirm data sources.',
            'Assign an owner to the highest-risk item.',
            'Draft a short follow-up plan with next steps.',
          ],
        };
      }
      case 'intake-classification': {
        const text = (intakeText ?? '').toLowerCase();
        const hasUrgent = /urgent|asap|immediately|critical/.test(text);
        const hasBug = /bug|error|broken|issue|incident/.test(text);
        const hasChange = /change|request|feature|enhancement/.test(text);

        const category = hasBug
          ? 'Incident'
          : hasChange
            ? 'Change Request'
            : 'General Inquiry';
        const priority = hasUrgent ? 'High' : hasBug ? 'Medium' : 'Low';
        const confidence = hasUrgent || hasBug || hasChange ? 0.78 : 0.55;

        return {
          category,
          priority,
          confidence,
          rationale:
            'Simulated classification using deterministic keyword rules.',
        };
      }
      case 'meeting-summary': {
        const lines = notesText ? normalizeLines(notesText) : [];
        const bullets = lines.map((l) => l.replace(/^[-*]\s*/, ''));
        return {
          summary:
            bullets.length > 0
              ? `Simulated meeting summary based on ${bullets.length} note items.`
              : 'Simulated meeting summary based on the provided notes.',
          decisions: bullets.slice(0, 2),
          nextSteps: [
            'Confirm owners for each action item.',
            'Schedule a short follow-up check-in.',
            'Publish the recap to the team channel.',
          ],
        };
      }
      case 'ai-business-summary': {
        const notesItems = notes ? normalizeLines(notes) : [];
        return {
          headline:
            'Business Summary: Current status and recommended next step',
          audience: audience ?? 'Business stakeholders',
          tone: tone ?? 'Professional',
          executiveSummary:
            notesItems.length > 0
              ? `Simulated summary based on ${notesItems.length} structured note item${notesItems.length === 1 ? '' : 's'}.`
              : 'Simulated summary prepared from the supplied business notes.',
          highlights: notesItems.slice(0, 3),
          recommendedActions: [
            'Confirm the highest-priority open item and its owner.',
            'Share a concise status update with the intended audience.',
            'Schedule the next review point and capture decisions.',
          ],
        };
      }
      default:
        return {
          summary: 'Simulated output generated for this workflow.',
          workflowSlug,
        };
    }
  }

  private buildMetadata(
    executionTimeMs: number,
    status: WorkflowRunStatus.Completed | WorkflowRunStatus.Failed,
  ): Record<string, unknown> {
    return {
      provider: this.getProviderType(),
      executionTimeMs,
      status,
      timestamp: new Date().toISOString(),
      simulated: true,
    };
  }
}
