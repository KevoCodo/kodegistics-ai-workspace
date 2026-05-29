import { FailureCategory } from '../common/enums/failure-category.enum';
import { classifyWorkflowFailure } from './failure-classifier';

describe('classifyWorkflowFailure', () => {
  it.each([
    ['Provider unavailable.', FailureCategory.PROVIDER_ERROR, true],
    [
      'OpenAI provider request failed with status 429.',
      FailureCategory.PROVIDER_ERROR,
      true,
    ],
    [
      'OpenAI provider is not enabled for this local environment. Use simulated provider or configure the backend environment variables.',
      FailureCategory.PROVIDER_ERROR,
      true,
    ],
    [
      'Provider request failed with HTTP 500.',
      FailureCategory.PROVIDER_ERROR,
      true,
    ],
    [
      'Request timeout while executing provider.',
      FailureCategory.TIMEOUT,
      true,
    ],
    [
      'Connection failure: service could not be reached.',
      FailureCategory.NETWORK,
      true,
    ],
    [
      'Invalid response schema: missing output.',
      FailureCategory.VALIDATION,
      false,
    ],
    [
      'Unhandled exception while executing workflow.',
      FailureCategory.SYSTEM,
      false,
    ],
    ['Unknown workflow execution failure.', FailureCategory.UNKNOWN, false],
  ])('maps "%s"', (message, failureCategory, retryEligible) => {
    expect(classifyWorkflowFailure(message)).toEqual({
      failureReason: message,
      failureCategory,
      retryEligible,
    });
  });
});
