import * as React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSubmissionMode } from '../useSubmissionMode';
import type { SubmissionOptions, SubmissionEvent, SubmissionResult } from '../../types';

// Mock fetch for testing HTTP submissions
global.fetch = jest.fn();

// Mock survey-core Model
const createMockModel = () => ({
  data: {},
  onValueChanged: {
    add: jest.fn(),
    remove: jest.fn(),
  },
  onCurrentPageChanged: {
    add: jest.fn(),
    remove: jest.fn(),
  },
  onComplete: {
    add: jest.fn(),
    remove: jest.fn(),
  },
  setValue: jest.fn(),
  completeLastPage: jest.fn(),
  currentPageNo: 0,
});

describe('useSubmissionMode', () => {
  let surveyModel: any;
  const mockSubmissionEvent = jest.fn();
  const mockSubmissionResult = jest.fn();
  const mockStatusChange = jest.fn();

  beforeEach(() => {
    surveyModel = createMockModel();
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('onComplete mode', () => {
    it('should submit only when survey is completed', async () => {
      const options: SubmissionOptions = { mode: 'onComplete' };
      
      let onCompleteHandler: any;
      surveyModel.onComplete.add.mockImplementation((handler: any) => {
        onCompleteHandler = handler;
      });

      renderHook(() =>
        useSubmissionMode(
          surveyModel,
          options,
          mockSubmissionEvent,
          mockSubmissionResult,
          mockStatusChange
        )
      );

      // Verify onComplete handler was registered
      expect(surveyModel.onComplete.add).toHaveBeenCalled();

      // Change a value - should not trigger submission
      surveyModel.data = { question1: 'test value' };

      expect(mockSubmissionEvent).not.toHaveBeenCalled();

      // Complete the survey - should trigger submission
      act(() => {
        if (onCompleteHandler) {
          onCompleteHandler(surveyModel);
        }
      });

      await waitFor(() => {
        expect(mockSubmissionEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            trigger: 'complete',
            data: { question1: 'test value' },
          })
        );
      });
    });
  });

  describe('onValueChange mode', () => {
    it('should submit on every value change', async () => {
      const options: SubmissionOptions = { mode: 'onValueChange' };
      
      let onValueChangedHandler: any;
      surveyModel.onValueChanged.add.mockImplementation((handler: any) => {
        onValueChangedHandler = handler;
      });

      renderHook(() =>
        useSubmissionMode(
          surveyModel,
          options,
          mockSubmissionEvent,
          mockSubmissionResult,
          mockStatusChange
        )
      );

      // Verify onValueChanged handler was registered
      expect(surveyModel.onValueChanged.add).toHaveBeenCalled();

      // Change a value - should trigger submission
      surveyModel.data = { question1: 'test value' };
      
      act(() => {
        if (onValueChangedHandler) {
          onValueChangedHandler(surveyModel, { name: 'question1' });
        }
      });

      await waitFor(() => {
        expect(mockSubmissionEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            trigger: 'valueChange',
            data: { question1: 'test value' },
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
      const options: SubmissionOptions = { 
        mode: 'realtime', 
        debounceDelay: 500 
      };
      
      let onValueChangedHandler: any;
      surveyModel.onValueChanged.add.mockImplementation((handler: any) => {
        onValueChangedHandler = handler;
      });
      
      renderHook(() =>
        useSubmissionMode(
          surveyModel,
          options,
          mockSubmissionEvent,
          mockSubmissionResult,
          mockStatusChange
        )
      );

      // Make multiple rapid changes
      act(() => {
        surveyModel.data = { question1: 'test1' };
        if (onValueChangedHandler) {
          onValueChangedHandler(surveyModel, { name: 'question1' });
        }
        
        surveyModel.data = { question1: 'test2' };
        if (onValueChangedHandler) {
          onValueChangedHandler(surveyModel, { name: 'question1' });
        }
        
        surveyModel.data = { question1: 'test3' };
        if (onValueChangedHandler) {
          onValueChangedHandler(surveyModel, { name: 'question1' });
        }
      });

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
            data: { question1: 'test3' },
          })
        );
      });
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
      const options: SubmissionOptions = {
        mode: 'onComplete',
        endpoint: 'https://api.example.com/submit',
        headers: { 'Authorization': 'Bearer token' },
      };

      let onCompleteHandler: any;
      surveyModel.onComplete.add.mockImplementation((handler: any) => {
        onCompleteHandler = handler;
      });

      const { result } = renderHook(() =>
        useSubmissionMode(
          surveyModel,
          options,
          mockSubmissionEvent,
          mockSubmissionResult,
          mockStatusChange
        )
      );

      // Verify onComplete handler was registered
      expect(surveyModel.onComplete.add).toHaveBeenCalled();

      act(() => {
        surveyModel.data = { question1: 'test value' };
        if (onCompleteHandler) {
          onCompleteHandler(surveyModel);
        }
      });

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

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });
    });

    it('should handle HTTP errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const options: SubmissionOptions = {
        mode: 'onComplete',
        endpoint: 'https://api.example.com/submit',
        autoRetry: false,
      };

      let onCompleteHandler: any;
      surveyModel.onComplete.add.mockImplementation((handler: any) => {
        onCompleteHandler = handler;
      });

      const { result } = renderHook(() =>
        useSubmissionMode(
          surveyModel,
          options,
          mockSubmissionEvent,
          mockSubmissionResult,
          mockStatusChange
        )
      );

      act(() => {
        surveyModel.data = { question1: 'test value' };
        if (onCompleteHandler) {
          onCompleteHandler(surveyModel);
        }
      });

      await waitFor(() => {
        expect(result.current.status).toBe('error');
        expect(result.current.lastResult?.error?.message).toContain('HTTP 500');
      });
    });
  });

  describe('retry logic', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should retry failed submissions', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: '123' }),
        });

      const options: SubmissionOptions = {
        mode: 'onComplete',
        endpoint: 'https://api.example.com/submit',
        autoRetry: true,
        maxRetries: 2,
        retryDelay: 1000,
      };

      let onCompleteHandler: any;
      surveyModel.onComplete.add.mockImplementation((handler: any) => {
        onCompleteHandler = handler;
      });

      const { result } = renderHook(() =>
        useSubmissionMode(
          surveyModel,
          options,
          mockSubmissionEvent,
          mockSubmissionResult,
          mockStatusChange
        )
      );

      act(() => {
        surveyModel.data = { question1: 'test value' };
        if (onCompleteHandler) {
          onCompleteHandler(surveyModel);
        }
      });

      // Wait for initial request to complete and fail
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // First attempt should fail and status should be retrying
      await waitFor(() => {
        expect(result.current.status).toBe('retrying');
      });

      // Fast-forward past retry delay
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Wait for retry to be processed
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });

      // Second attempt should succeed
      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });
    });

    it('should stop retrying after max retries', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const options: SubmissionOptions = {
        mode: 'onComplete',
        endpoint: 'https://api.example.com/submit',
        autoRetry: true,
        maxRetries: 2,
        retryDelay: 100, // Shorter delay for testing
      };

      let onCompleteHandler: any;
      surveyModel.onComplete.add.mockImplementation((handler: any) => {
        onCompleteHandler = handler;
      });

      const { result } = renderHook(() =>
        useSubmissionMode(
          surveyModel,
          options,
          mockSubmissionEvent,
          mockSubmissionResult,
          mockStatusChange
        )
      );

      // Trigger initial submission
      act(() => {
        surveyModel.data = { question1: 'test value' };
        if (onCompleteHandler) {
          onCompleteHandler(surveyModel);
        }
      });

      // Wait for initial attempt
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });

      // Advance time for first retry
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Wait for first retry
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });

      // Advance time for second retry
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Wait for second retry
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(3);
      });

      // Final status should be error after all retries exhausted
      await waitFor(() => {
        expect(result.current.status).toBe('error');
        expect(result.current.lastResult?.error?.message).toContain('HTTP 500');
      });
    });
  });

  describe('manual submission', () => {
    it('should allow manual triggering of submission', async () => {
      const options: SubmissionOptions = { mode: 'manual' };

      const { result } = renderHook(() =>
        useSubmissionMode(
          surveyModel,
          options,
          mockSubmissionEvent,
          mockSubmissionResult,
          mockStatusChange
        )
      );

      // Set the data on the model
      surveyModel.data = { question1: 'manual test' };

      // Should not auto-submit in manual mode
      expect(mockSubmissionEvent).not.toHaveBeenCalled();

      // Trigger manual submission
      act(() => {
        result.current.triggerSubmission();
      });

      await waitFor(() => {
        expect(mockSubmissionEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            trigger: 'manual',
            data: { question1: 'manual test' },
          })
        );
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

      const options: SubmissionOptions = {
        mode: 'onComplete',
        transformData,
      };

      let onCompleteHandler: any;
      surveyModel.onComplete.add.mockImplementation((handler: any) => {
        onCompleteHandler = handler;
      });

      renderHook(() =>
        useSubmissionMode(
          surveyModel,
          options,
          mockSubmissionEvent,
          mockSubmissionResult,
          mockStatusChange
        )
      );

      act(() => {
        surveyModel.data = { question1: 'test' };
        if (onCompleteHandler) {
          onCompleteHandler(surveyModel);
        }
      });

      await waitFor(() => {
        expect(transformData).toHaveBeenCalledWith({ question1: 'test' });
        expect(mockSubmissionEvent).toHaveBeenCalledWith(
          expect.objectContaining({
            data: {
              question1: 'test',
              transformed: true,
              timestamp: '2023-01-01',
            },
          })
        );
      });
    });
  });

  describe('status callbacks', () => {
    it('should call status change callback', async () => {
      const options: SubmissionOptions = { mode: 'onComplete' };

      let onCompleteHandler: any;
      surveyModel.onComplete.add.mockImplementation((handler: any) => {
        onCompleteHandler = handler;
      });

      renderHook(() =>
        useSubmissionMode(
          surveyModel,
          options,
          mockSubmissionEvent,
          mockSubmissionResult,
          mockStatusChange
        )
      );

      act(() => {
        surveyModel.data = { question1: 'test' };
        if (onCompleteHandler) {
          onCompleteHandler(surveyModel);
        }
      });

      await waitFor(() => {
        expect(mockStatusChange).toHaveBeenCalledTimes(2);
        expect(mockStatusChange).toHaveBeenNthCalledWith(1, 'pending', undefined);
        expect(mockStatusChange).toHaveBeenNthCalledWith(2, 'success', expect.any(Object));
      });
    });
  });
});