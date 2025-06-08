// Import React hooks directly to avoid resolution issues
import * as React from 'react';
import { Model } from 'survey-core';
import { SurveyModelManager } from '../utils/surveyCore';

export interface UseSurveyModelOptions {
  /**
   * Custom model ID (defaults to auto-generated)
   */
  modelId?: string;
}

export interface UseSurveyModelResult {
  /**
   * The survey model instance
   */
  model: Model | null;
  /**
   * Loading state
   */
  isLoading: boolean;
  /**
   * Error state
   */
  error: Error | null;
  /**
   * Refresh the survey model
   */
  refresh: () => void;
}

/**
 * React hook for managing survey-core model lifecycle (fixed version)
 * @param json - SurveyJS JSON model
 * @param options - Hook options
 * @returns Survey model and state
 */
export function useSurveyModelFixed(
  json: any,
  options: UseSurveyModelOptions = {}
): UseSurveyModelResult {
  // Use React.useState directly to avoid destructuring issues
  // Store the entire state tuple to avoid babel destructuring
  const modelState = React.useState<Model | null>(null);
  const model = modelState[0];
  const setModel = modelState[1];

  const loadingState = React.useState(true);
  const isLoading = loadingState[0];
  const setIsLoading = loadingState[1];

  const errorState = React.useState<Error | null>(null);
  const error = errorState[0];
  const setError = errorState[1];

  const modelIdRef = React.useRef(options.modelId || generateModelId());
  const jsonRef = React.useRef(json);

  const createModel = React.useCallback(() => {
    setIsLoading(true);
    setError(null);

    try {
      if (!json || typeof json !== 'object') {
        throw new Error('Invalid survey JSON');
      }

      const newModel = SurveyModelManager.create(modelIdRef.current, json);
      setModel(newModel);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setModel(null);
      setIsLoading(false);
    }
  }, [json]);

  const refresh = React.useCallback(() => {
    if (modelIdRef.current) {
      SurveyModelManager.dispose(modelIdRef.current);
    }
    createModel();
  }, [createModel]);

  React.useEffect(() => {
    // Initial creation and when json changes
    if (!model || jsonRef.current !== json) {
      if (model && modelIdRef.current) {
        SurveyModelManager.dispose(modelIdRef.current);
      }
      jsonRef.current = json;
      createModel();
    }

    // Cleanup on unmount
    return () => {
      const currentModelId = modelIdRef.current;
      if (currentModelId) {
        SurveyModelManager.dispose(currentModelId);
      }
    };
  }, [json]);

  return {
    model,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Generate a unique model ID
 */
function generateModelId(): string {
  return `survey-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
