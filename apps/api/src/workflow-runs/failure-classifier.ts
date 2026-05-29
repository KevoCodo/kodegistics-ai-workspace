import { FailureCategory } from '../common/enums/failure-category.enum';

export type ClassifiedFailure = {
  failureReason: string;
  failureCategory: FailureCategory;
  retryEligible: boolean;
};

const RETRY_ELIGIBLE_CATEGORIES = new Set<FailureCategory>([
  FailureCategory.TIMEOUT,
  FailureCategory.NETWORK,
  FailureCategory.PROVIDER_ERROR,
]);

export function isRetryEligible(category: FailureCategory): boolean {
  return RETRY_ELIGIBLE_CATEGORIES.has(category);
}

export function classifyWorkflowFailure(error: unknown): ClassifiedFailure {
  const failureReason = getFailureReason(error);
  const normalized = failureReason.toLowerCase();
  const failureCategory = mapFailureCategory(normalized);

  return {
    failureReason,
    failureCategory,
    retryEligible: isRetryEligible(failureCategory),
  };
}

function getFailureReason(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === 'string' && error.trim()) return error;

  return 'Unknown workflow execution failure.';
}

function mapFailureCategory(message: string): FailureCategory {
  if (
    message.includes('request timeout') ||
    message.includes('timed out') ||
    message.includes('timeout') ||
    message.includes('aborted')
  ) {
    return FailureCategory.TIMEOUT;
  }

  if (
    message.includes('connection failure') ||
    message.includes('network') ||
    message.includes('econn') ||
    message.includes('enotfound') ||
    message.includes('eai_again') ||
    message.includes('fetch failed')
  ) {
    return FailureCategory.NETWORK;
  }

  if (
    message.includes('invalid response schema') ||
    message.includes('input validation failed') ||
    message.includes('validation')
  ) {
    return FailureCategory.VALIDATION;
  }

  if (
    message.includes('provider unavailable') ||
    message.includes('provider not yet implemented') ||
    message.includes('provider request failed') ||
    message.includes('provider is disabled') ||
    message.includes('not enabled for this local environment') ||
    message.includes('status 429') ||
    message.includes('http 429') ||
    /http 5\d\d/.test(message) ||
    /status 5\d\d/.test(message)
  ) {
    return FailureCategory.PROVIDER_ERROR;
  }

  if (
    message.includes('unhandled exception') ||
    message.includes('unexpectedly')
  ) {
    return FailureCategory.SYSTEM;
  }

  if (message.includes('unknown')) {
    return FailureCategory.UNKNOWN;
  }

  return FailureCategory.SYSTEM;
}
