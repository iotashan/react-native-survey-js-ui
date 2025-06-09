import * as React from 'react';
const { useState, useEffect, useCallback } = React;
import type { Model, SurveyError } from 'survey-core';

export interface ValidationState {
  errors: Record<string, string[]>; // questionName -> error messages
  isValidating: boolean;
  hasErrors: boolean;
}

export interface UsePageValidation {
  validateCurrentPage: () => boolean;
  clearErrors: (questionName?: string) => void;
  getQuestionErrors: (questionName: string) => string[];
  validationState: ValidationState;
}

/**
 * Hook for managing page-level validation with real-time feedback
 * Integrates with survey-core's validation system and provides error state management
 * @param model - Survey model instance
 * @returns Validation state and control methods
 */
export function usePageValidation(model: Model | null): UsePageValidation {
  const [validationState, setValidationState] = useState<ValidationState>(() => ({
    errors: {},
    isValidating: false,
    hasErrors: false,
  }));

  /**
   * Converts survey-core errors to our error format
   */
  const parseErrors = useCallback((surveyErrors: SurveyError[]): Record<string, string[]> => {
    const errorMap: Record<string, string[]> = {};
    
    surveyErrors.forEach((error) => {
      const questionName = (error as any).questionName || 'general';
      const errorText = error.text || 'Validation error';
      
      if (!errorMap[questionName]) {
        errorMap[questionName] = [];
      }
      errorMap[questionName].push(errorText);
    });
    
    return errorMap;
  }, []);

  /**
   * Validates the current page and updates error state
   */
  const validateCurrentPage = useCallback((): boolean => {
    if (!model || !model.currentPage) {
      return true;
    }

    setValidationState((prev) => ({ ...prev, isValidating: true }));

    try {
      // Trigger page validation
      const isValid = model.currentPage.validate(true, false);
      
      if (isValid && !model.currentPage.hasErrors) {
        // No errors
        setValidationState((prev) => ({
          ...prev,
          errors: {},
          hasErrors: false,
          isValidating: false,
        }));
        return true;
      } else {
        // Has errors - collect them
        const errors = model.currentPage.errors || [];
        const errorMap = parseErrors(errors);
        
        setValidationState((prev) => ({
          ...prev,
          errors: errorMap,
          hasErrors: Object.keys(errorMap).length > 0,
          isValidating: false,
        }));
        return false;
      }
    } catch (error) {
      // Fallback: assume valid if validation fails
      console.warn('Page validation error:', error);
      setValidationState((prev) => ({
        ...prev,
        isValidating: false,
      }));
      return true;
    }
  }, [model, parseErrors]);

  /**
   * Clears validation errors for a specific question or all questions
   */
  const clearErrors = useCallback((questionName?: string) => {
    setValidationState((prev) => {
      if (!questionName) {
        // Clear all errors
        return {
          ...prev,
          errors: {},
          hasErrors: false,
        };
      } else {
        // Clear errors for specific question
        const newErrors = { ...prev.errors };
        delete newErrors[questionName];
        
        return {
          ...prev,
          errors: newErrors,
          hasErrors: Object.keys(newErrors).length > 0,
        };
      }
    });
  }, []);

  /**
   * Gets errors for a specific question
   */
  const getQuestionErrors = useCallback((questionName: string): string[] => {
    return validationState.errors[questionName] || [];
  }, [validationState.errors]);

  /**
   * Real-time validation on question value changes
   */
  useEffect(() => {
    if (!model) {
      return;
    }

    const handleValidateQuestion = (sender: Model, options: any) => {
      try {
        // Update errors for the specific question that was validated
        const questionName = options?.name;
        if (!questionName) return;

        const question = model.getQuestionByName(questionName);
        if (!question) return;

        // Get errors for this specific question
        const questionErrors = (question as any).errors || [];
        const errorTexts = questionErrors.map((error: SurveyError) => error.text);

        setValidationState((prev) => {
          const newErrors = { ...prev.errors };
          
          if (errorTexts.length > 0) {
            newErrors[questionName] = errorTexts;
          } else {
            delete newErrors[questionName];
          }

          return {
            ...prev,
            errors: newErrors,
            hasErrors: Object.keys(newErrors).length > 0,
          };
        });
      } catch (error) {
        console.warn('Question validation error:', error);
      }
    };

    const handleValueChanged = (sender: Model, options: any) => {
      try {
        // Clear errors for question when value changes
        const questionName = options?.name;
        if (questionName) {
          clearErrors(questionName);
        }
      } catch (error) {
        console.warn('Value change handling error:', error);
      }
    };

    // Subscribe to events
    model.onValidateQuestion.add(handleValidateQuestion);
    model.onValueChanged.add(handleValueChanged);

    // Cleanup
    return () => {
      model.onValidateQuestion.remove(handleValidateQuestion);
      model.onValueChanged.remove(handleValueChanged);
    };
  }, [model, clearErrors]);

  return {
    validateCurrentPage,
    clearErrors,
    getQuestionErrors,
    validationState,
  };
}