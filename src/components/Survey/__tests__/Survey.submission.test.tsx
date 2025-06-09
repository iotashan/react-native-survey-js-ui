import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Survey } from '../Survey';
import type { SubmissionOptions, SubmissionEvent, SubmissionResult } from '../../../types';

// Mock fetch for testing HTTP submissions
global.fetch = jest.fn();

describe('Survey Component - Submission Modes', () => {
  const surveyJson = {
    title: 'Test Survey',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'text',
            name: 'question1',
            title: 'Question 1',
          },
        ],
      },
    ],
  };

  const mockSubmissionEvent = jest.fn();
  const mockSubmissionResult = jest.fn();
  const mockStatusChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('onComplete mode', () => {
    it('should submit when survey is completed', async () => {
      const submissionOptions: SubmissionOptions = {
        mode: 'onComplete',
      };

      const { getByText, getByDisplayValue } = render(
        <Survey
          model={surveyJson}
          submissionOptions={submissionOptions}
          onSubmissionEvent={mockSubmissionEvent}
          onSubmissionResult={mockSubmissionResult}
          onSubmissionStatusChange={mockStatusChange}
        />
      );

      // Fill in the question
      const input = getByDisplayValue('');
      fireEvent.changeText(input, 'Test answer');

      // Complete the survey
      const completeButton = getByText('Complete');
      fireEvent.press(completeButton);

      await waitFor(() => {
        expect(mockSubmissionEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            trigger: 'complete',
            data: { question1: 'Test answer' },
          })
        );
      });
    });
  });

  describe('onValueChange mode', () => {
    it('should submit on every value change', async () => {
      const submissionOptions: SubmissionOptions = {
        mode: 'onValueChange',
      };

      const { getByDisplayValue } = render(
        <Survey
          model={surveyJson}
          submissionOptions={submissionOptions}
          onSubmissionEvent={mockSubmissionEvent}
          onSubmissionResult={mockSubmissionResult}
          onSubmissionStatusChange={mockStatusChange}
        />
      );

      // Fill in the question
      const input = getByDisplayValue('');
      fireEvent.changeText(input, 'Test answer');

      await waitFor(() => {
        expect(mockSubmissionEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            trigger: 'valueChange',
            data: { question1: 'Test answer' },
            triggerQuestion: 'question1',
          })
        );
      });
    });
  });

  describe('realtime mode', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce submissions in realtime mode', async () => {
      const submissionOptions: SubmissionOptions = {
        mode: 'realtime',
        debounceDelay: 500,
      };

      const { getByDisplayValue } = render(
        <Survey
          model={surveyJson}
          submissionOptions={submissionOptions}
          onSubmissionEvent={mockSubmissionEvent}
          onSubmissionResult={mockSubmissionResult}
          onSubmissionStatusChange={mockStatusChange}
        />
      );

      const input = getByDisplayValue('');

      // Make multiple rapid changes
      fireEvent.changeText(input, 'Test 1');
      fireEvent.changeText(input, 'Test 2');
      fireEvent.changeText(input, 'Test 3');

      // Should not have submitted yet
      expect(mockSubmissionEvent).not.toHaveBeenCalled();

      // Fast-forward past debounce delay
      act(() => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(mockSubmissionEvent).toHaveBeenCalledTimes(1);
        expect(mockSubmissionEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            trigger: 'valueChange',
            data: { question1: 'Test 3' },
          })
        );
      });
    });
  });

  describe('manual mode', () => {
    it('should not auto-submit and allow manual triggering', async () => {
      const submissionOptions: SubmissionOptions = {
        mode: 'manual',
      };

      const { getByDisplayValue } = render(
        <Survey
          model={surveyJson}
          submissionOptions={submissionOptions}
          onSubmissionEvent={mockSubmissionEvent}
          onSubmissionResult={mockSubmissionResult}
          onSubmissionStatusChange={mockStatusChange}
        />
      );

      // Fill in the question
      const input = getByDisplayValue('');
      fireEvent.changeText(input, 'Manual test');

      // Should not auto-submit in manual mode
      expect(mockSubmissionEvent).not.toHaveBeenCalled();

      // Note: Manual triggering would need to be exposed through a ref or callback
      // This is a limitation of the current implementation
    });
  });

  describe('HTTP submission', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: '123' }),
      });
    });

    it('should make HTTP request when endpoint is provided', async () => {
      const submissionOptions: SubmissionOptions = {
        mode: 'onComplete',
        endpoint: 'https://api.example.com/submit',
        headers: { 'Authorization': 'Bearer token' },
      };

      const { getByText, getByDisplayValue } = render(
        <Survey
          model={surveyJson}
          submissionOptions={submissionOptions}
          onSubmissionEvent={mockSubmissionEvent}
          onSubmissionResult={mockSubmissionResult}
          onSubmissionStatusChange={mockStatusChange}
        />
      );

      // Fill in the question
      const input = getByDisplayValue('');
      fireEvent.changeText(input, 'HTTP test');

      // Complete the survey
      const completeButton = getByText('Complete');
      fireEvent.press(completeButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://api.example.com/submit',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'Authorization': 'Bearer token',
            }),
            body: expect.stringContaining('"trigger":"complete"'),
          })
        );
      });
    });

    it('should show submission status', async () => {
      const submissionOptions: SubmissionOptions = {
        mode: 'onComplete',
        endpoint: 'https://api.example.com/submit',
        showStatus: true,
      };

      const { getByText, getByDisplayValue, queryByText } = render(
        <Survey
          model={surveyJson}
          submissionOptions={submissionOptions}
          onSubmissionEvent={mockSubmissionEvent}
          onSubmissionResult={mockSubmissionResult}
          onSubmissionStatusChange={mockStatusChange}
        />
      );

      // Fill in the question
      const input = getByDisplayValue('');
      fireEvent.changeText(input, 'Status test');

      // Complete the survey
      const completeButton = getByText('Complete');
      fireEvent.press(completeButton);

      // Should show pending status
      await waitFor(() => {
        expect(queryByText('Saving...')).toBeTruthy();
      });

      // Should eventually show success status
      await waitFor(() => {
        expect(queryByText('Saved successfully')).toBeTruthy();
      });
    });
  });

  describe('error handling and retry', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should show error status and retry button on failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const submissionOptions: SubmissionOptions = {
        mode: 'onComplete',
        endpoint: 'https://api.example.com/submit',
        autoRetry: false,
        showStatus: true,
      };

      const { getByText, getByDisplayValue, getByTestId } = render(
        <Survey
          model={surveyJson}
          submissionOptions={submissionOptions}
          onSubmissionEvent={mockSubmissionEvent}
          onSubmissionResult={mockSubmissionResult}
          onSubmissionStatusChange={mockStatusChange}
        />
      );

      // Fill in the question
      const input = getByDisplayValue('');
      fireEvent.changeText(input, 'Error test');

      // Complete the survey
      const completeButton = getByText('Complete');
      fireEvent.press(completeButton);

      // Should show error status with retry button
      await waitFor(() => {
        expect(getByText(/HTTP 500/)).toBeTruthy();
        expect(getByTestId('submission-retry-button')).toBeTruthy();
      });

      // Reset mock to succeed on retry
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: '123' }),
      });

      // Press retry button
      fireEvent.press(getByTestId('submission-retry-button'));

      // Should eventually show success
      await waitFor(() => {
        expect(getByText('Saved successfully')).toBeTruthy();
      });
    });
  });

  describe('data transformation', () => {
    it('should transform data before submission', async () => {
      const transformData = jest.fn((data) => ({
        ...data,
        transformed: true,
        timestamp: '2023-01-01',
      }));

      const submissionOptions: SubmissionOptions = {
        mode: 'onComplete',
        transformData,
      };

      const { getByText, getByDisplayValue } = render(
        <Survey
          model={surveyJson}
          submissionOptions={submissionOptions}
          onSubmissionEvent={mockSubmissionEvent}
          onSubmissionResult={mockSubmissionResult}
          onSubmissionStatusChange={mockStatusChange}
        />
      );

      // Fill in the question
      const input = getByDisplayValue('');
      fireEvent.changeText(input, 'Transform test');

      // Complete the survey
      const completeButton = getByText('Complete');
      fireEvent.press(completeButton);

      await waitFor(() => {
        expect(transformData).toHaveBeenCalledWith({ question1: 'Transform test' });
        expect(mockSubmissionEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            data: {
              question1: 'Transform test',
              transformed: true,
              timestamp: '2023-01-01',
            },
          })
        );
      });
    });
  });

  describe('status visibility', () => {
    it('should hide status when showStatus is false', async () => {
      const submissionOptions: SubmissionOptions = {
        mode: 'onComplete',
        showStatus: false,
      };

      const { getByText, getByDisplayValue, queryByText } = render(
        <Survey
          model={surveyJson}
          submissionOptions={submissionOptions}
          onSubmissionEvent={mockSubmissionEvent}
          onSubmissionResult={mockSubmissionResult}
          onSubmissionStatusChange={mockStatusChange}
        />
      );

      // Fill in the question
      const input = getByDisplayValue('');
      fireEvent.changeText(input, 'Hidden status test');

      // Complete the survey
      const completeButton = getByText('Complete');
      fireEvent.press(completeButton);

      await waitFor(() => {
        expect(mockSubmissionEvent).toHaveBeenCalled();
      });

      // Should not show any status
      expect(queryByText('Saving...')).toBeNull();
      expect(queryByText('Saved successfully')).toBeNull();
    });
  });
});