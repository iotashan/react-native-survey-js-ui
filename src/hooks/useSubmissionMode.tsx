import * as React from 'react';
const { useCallback, useEffect, useRef, useState } = React;
import { Model } from 'survey-core';
import type {
  SubmissionOptions,
  SubmissionStatus,
  SubmissionEvent,
  SubmissionResult,
  SubmissionEventHandler,
  SubmissionResultHandler,
  SubmissionStatusHandler,
  SurveyData,
} from '../types';

/**
 * Default submission options
 */
const DEFAULT_OPTIONS: Required<Omit<SubmissionOptions, 'endpoint' | 'headers' | 'transformData'>> = {
  mode: 'onComplete',
  autoRetry: true,
  maxRetries: 3,
  retryDelay: 1000,
  debounceDelay: 500,
  showStatus: true,
};

/**
 * Hook for managing survey submission with different modes
 */
export function useSubmissionMode(
  surveyModel: Model | null,
  options: Partial<SubmissionOptions> = {},
  onSubmissionEvent?: SubmissionEventHandler,
  onSubmissionResult?: SubmissionResultHandler,
  onStatusChange?: SubmissionStatusHandler
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Submission state
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [lastResult, setLastResult] = useState<SubmissionResult | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Refs for debouncing and retry logic
  const debounceRef = useRef<NodeJS.Timeout>();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const submissionInProgress = useRef(false);

  /**
   * Update status and notify listeners
   */
  const updateStatus = useCallback((newStatus: SubmissionStatus, result?: SubmissionResult) => {
    setStatus(newStatus);
    onStatusChange?.(newStatus, result);
  }, [onStatusChange]);

  /**
   * Create a submission event
   */
  const createSubmissionEvent = useCallback((
    trigger: SubmissionEvent['trigger'],
    data: SurveyData,
    triggerQuestion?: string,
    triggerPage?: number
  ): SubmissionEvent => ({
    trigger,
    data: opts.transformData ? opts.transformData(data) : data,
    timestamp: new Date().toISOString(),
    attempt: retryCount + 1,
    triggerQuestion,
    triggerPage,
  }), [opts.transformData, retryCount]);

  /**
   * Perform the actual submission
   */
  const performSubmission = useCallback(async (event: SubmissionEvent): Promise<SubmissionResult> => {
    const result: SubmissionResult = {
      success: false,
      event,
    };

    try {
      if (opts.endpoint) {
        // Make HTTP request to endpoint
        const response = await fetch(opts.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...opts.headers,
          },
          body: JSON.stringify(event),
        });

        if (response.ok) {
          result.success = true;
          result.response = await response.json();
        } else {
          result.error = {
            message: `HTTP ${response.status}: ${response.statusText}`,
            code: response.status,
          };
        }
      } else {
        // No endpoint specified - just notify via callback
        await onSubmissionEvent?.(event);
        result.success = true;
      }
    } catch (error) {
      result.error = {
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error,
      };
    }

    return result;
  }, [opts.endpoint, opts.headers, onSubmissionEvent]);

  /**
   * Submit survey data
   */
  const submitData = useCallback(async (
    trigger: SubmissionEvent['trigger'],
    data: SurveyData,
    triggerQuestion?: string,
    triggerPage?: number
  ) => {
    // Prevent concurrent submissions
    if (submissionInProgress.current) {
      return;
    }

    submissionInProgress.current = true;
    updateStatus('pending');

    const event = createSubmissionEvent(trigger, data, triggerQuestion, triggerPage);
    
    try {
      const result = await performSubmission(event);
      
      if (result.success) {
        setRetryCount(0);
        updateStatus('success', result);
        setLastResult(result);
        onSubmissionResult?.(result);
      } else {
        // Handle failure
        if (opts.autoRetry && retryCount < opts.maxRetries) {
          updateStatus('retrying', result);
          setRetryCount(prev => prev + 1);
          
          // Schedule retry
          retryTimeoutRef.current = setTimeout(() => {
            submitData('retry', data, triggerQuestion, triggerPage);
          }, opts.retryDelay);
        } else {
          updateStatus('error', result);
          setLastResult(result);
          onSubmissionResult?.(result);
        }
      }
    } catch (error) {
      const result: SubmissionResult = {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error,
        },
        event,
      };
      
      updateStatus('error', result);
      setLastResult(result);
      onSubmissionResult?.(result);
    } finally {
      submissionInProgress.current = false;
    }
  }, [
    createSubmissionEvent,
    performSubmission,
    opts.autoRetry,
    opts.maxRetries,
    opts.retryDelay,
    retryCount,
    updateStatus,
    onSubmissionResult,
  ]);

  /**
   * Debounced submission for realtime mode
   */
  const debouncedSubmit = useCallback((
    trigger: SubmissionEvent['trigger'],
    data: SurveyData,
    triggerQuestion?: string,
    triggerPage?: number
  ) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      submitData(trigger, data, triggerQuestion, triggerPage);
    }, opts.debounceDelay);
  }, [submitData, opts.debounceDelay]);

  /**
   * Manual trigger for submission
   */
  const triggerSubmission = useCallback(() => {
    if (!surveyModel) return;
    
    submitData('manual', surveyModel.data || {});
  }, [surveyModel, submitData]);

  /**
   * Handle value changes based on submission mode
   */
  useEffect(() => {
    if (!surveyModel || (opts.mode !== 'onValueChange' && opts.mode !== 'realtime')) {
      return;
    }

    const handleValueChange = (sender: Model, options: any) => {
      const questionName = options?.name || '';
      const data = sender.data || {};

      if (opts.mode === 'onValueChange') {
        submitData('valueChange', data, questionName);
      } else if (opts.mode === 'realtime') {
        debouncedSubmit('valueChange', data, questionName);
      }
    };

    surveyModel.onValueChanged.add(handleValueChange);

    return () => {
      surveyModel.onValueChanged.remove(handleValueChange);
    };
  }, [surveyModel, opts.mode, submitData, debouncedSubmit]);

  /**
   * Handle page changes for onPageChange mode
   */
  useEffect(() => {
    if (!surveyModel || opts.mode !== 'onPageChange') {
      return;
    }

    const handlePageChange = (sender: Model) => {
      const data = sender.data || {};
      const currentPage = sender.currentPageNo;
      
      submitData('pageChange', data, undefined, currentPage);
    };

    surveyModel.onCurrentPageChanged.add(handlePageChange);

    return () => {
      surveyModel.onCurrentPageChanged.remove(handlePageChange);
    };
  }, [surveyModel, opts.mode, submitData]);

  /**
   * Handle completion for onComplete mode
   */
  useEffect(() => {
    if (!surveyModel || opts.mode !== 'onComplete') {
      return;
    }

    const handleComplete = (sender: Model) => {
      const data = sender.data || {};
      submitData('complete', data);
    };

    surveyModel.onComplete.add(handleComplete);

    return () => {
      surveyModel.onComplete.remove(handleComplete);
    };
  }, [surveyModel, opts.mode, submitData]);

  /**
   * Cleanup timeouts on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    status,
    lastResult,
    retryCount,
    triggerSubmission,
    options: opts,
  };
}