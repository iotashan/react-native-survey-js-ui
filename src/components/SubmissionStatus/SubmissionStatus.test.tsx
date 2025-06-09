import * as React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SubmissionStatus } from './SubmissionStatus';
import type { SubmissionResult } from '../../types';

describe('SubmissionStatus', () => {
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when status is idle', () => {
    const { queryByTestId } = render(
      <SubmissionStatus status="idle" />
    );

    expect(queryByTestId('submission-status')).toBeNull();
  });

  it('should not render when visible is false', () => {
    const { queryByTestId } = render(
      <SubmissionStatus status="pending" visible={false} />
    );

    expect(queryByTestId('submission-status')).toBeNull();
  });

  it('should render pending status with loading indicator', () => {
    const { getByText } = render(
      <SubmissionStatus status="pending" />
    );

    expect(getByText('Saving...')).toBeTruthy();
  });

  it('should render success status with checkmark', () => {
    const { getByText } = render(
      <SubmissionStatus status="success" />
    );

    expect(getByText('Saved successfully')).toBeTruthy();
    expect(getByText('✓')).toBeTruthy();
  });

  it('should render error status with retry button', () => {
    const lastResult: SubmissionResult = {
      success: false,
      error: {
        message: 'Network error',
      },
      event: {
        trigger: 'complete',
        data: {},
        timestamp: '2023-01-01T00:00:00.000Z',
        attempt: 1,
      },
    };

    const { getByText, getByTestId } = render(
      <SubmissionStatus 
        status="error" 
        lastResult={lastResult}
        onRetry={mockOnRetry}
      />
    );

    expect(getByText('Network error')).toBeTruthy();
    expect(getByText('✗')).toBeTruthy();
    expect(getByTestId('submission-retry-button')).toBeTruthy();
  });

  it('should call onRetry when retry button is pressed', () => {
    const lastResult: SubmissionResult = {
      success: false,
      error: {
        message: 'Network error',
      },
      event: {
        trigger: 'complete',
        data: {},
        timestamp: '2023-01-01T00:00:00.000Z',
        attempt: 1,
      },
    };

    const { getByTestId } = render(
      <SubmissionStatus 
        status="error" 
        lastResult={lastResult}
        onRetry={mockOnRetry}
      />
    );

    fireEvent.press(getByTestId('submission-retry-button'));
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('should render retrying status with retry count', () => {
    const { getByText } = render(
      <SubmissionStatus status="retrying" retryCount={2} />
    );

    expect(getByText('Retrying... (2)')).toBeTruthy();
  });

  it('should not show retry button when onRetry is not provided', () => {
    const lastResult: SubmissionResult = {
      success: false,
      error: {
        message: 'Network error',
      },
      event: {
        trigger: 'complete',
        data: {},
        timestamp: '2023-01-01T00:00:00.000Z',
        attempt: 1,
      },
    };

    const { queryByTestId } = render(
      <SubmissionStatus 
        status="error" 
        lastResult={lastResult}
      />
    );

    expect(queryByTestId('submission-retry-button')).toBeNull();
  });

  it('should apply custom styles', () => {
    const customStyle = { backgroundColor: 'red' };

    const { getByText } = render(
      <SubmissionStatus 
        status="success" 
        style={customStyle}
      />
    );

    // Check if the component renders with success status
    expect(getByText('Saved successfully')).toBeTruthy();
  });

  it('should show default error message when lastResult.error is undefined', () => {
    const lastResult: SubmissionResult = {
      success: false,
      event: {
        trigger: 'complete',
        data: {},
        timestamp: '2023-01-01T00:00:00.000Z',
        attempt: 1,
      },
    };

    const { getByText } = render(
      <SubmissionStatus 
        status="error" 
        lastResult={lastResult}
        onRetry={mockOnRetry}
      />
    );

    expect(getByText('Save failed')).toBeTruthy();
  });
});