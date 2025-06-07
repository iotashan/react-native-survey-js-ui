import * as React from 'react';
const { useEffect, useState, useRef, useCallback } = React;
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
 * React hook for managing survey-core model lifecycle
 * @param json - SurveyJS JSON model
 * @param options - Hook options
 * @returns Survey model and state
 */
export function useSurveyModel(
  json: any,
  options: UseSurveyModelOptions = {}
): UseSurveyModelResult {
  const [model, setModel] = useState<Model | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const modelIdRef = useRef(options.modelId || generateModelId());
  const jsonRef = useRef(json);

  const createModel = useCallback(() => {
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

  const refresh = useCallback(() => {
    if (modelIdRef.current) {
      SurveyModelManager.dispose(modelIdRef.current);
    }
    createModel();
  }, [createModel]);

  useEffect(() => {
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
