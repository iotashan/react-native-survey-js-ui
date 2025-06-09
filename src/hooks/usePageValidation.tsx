import * as React from 'react';
const { useState, useEffect, useCallback } = React;
import type { Model, Question, PageModel } from 'survey-core';

export interface ValidationError {
  questionName: string;
  message: string;
  ruleType?: string;
}

export interface ValidationState {
  hasErrors: boolean;
  errors: Record<string, string[]>;
  validationMessages: ValidationError[];
  isValidating: boolean;
}

export interface UsePageValidationReturn {
  validationState: ValidationState;
  validateCurrentPage: () => boolean;
  validateAllPages: () => boolean;
  clearValidationErrors: () => void;
  validateQuestion: (questionName: string) => boolean;
}

/**
 * Hook for managing survey page validation
 * Provides validation methods and state for survey questions and pages
 * @param model - Survey model instance
 * @returns Validation state and control methods
 */
export function usePageValidation(model: Model | null): UsePageValidationReturn {
  const [validationState, setValidationState] = useState<ValidationState>(() => ({
    hasErrors: false,
    errors: {},
    validationMessages: [],
    isValidating: false,
  }));

  // Update validation state when model changes
  useEffect(() => {
    if (!model) {
      setValidationState({
        hasErrors: false,
        errors: {},
        validationMessages: [],
        isValidating: false,
      });
      return;
    }

    // Event handlers for validation
    const handleValueChanged = (_sender: Model, options: any) => {
      // Validate the specific question that changed
      if (options.question) {
        validateSingleQuestion(options.question);
      }
    };

    const handleValidatedErrorsOnCurrentPage = (_sender: Model, _options: any) => {
      updateValidationState();
    };

    const handleCurrentPageChanged = () => {
      // Clear validation errors when page changes
      setValidationState(prev => ({
        ...prev,
        hasErrors: false,
        errors: {},
        validationMessages: [],
      }));
    };

    // Subscribe to events
    model.onValueChanged.add(handleValueChanged);
    model.onCurrentPageChanged.add(handleCurrentPageChanged);
    
    // Note: These events may not exist in all survey-core versions
    if ((model as any).onValidatedErrorsOnCurrentPage) {
      (model as any).onValidatedErrorsOnCurrentPage.add(handleValidatedErrorsOnCurrentPage);
    }

    // Initial validation state update
    updateValidationState();

    // Cleanup
    return () => {
      model.onValueChanged.remove(handleValueChanged);
      model.onCurrentPageChanged.remove(handleCurrentPageChanged);
      if ((model as any).onValidatedErrorsOnCurrentPage) {
        (model as any).onValidatedErrorsOnCurrentPage.remove(handleValidatedErrorsOnCurrentPage);
      }
    };
  }, [model]);

  /**
   * Validate a single question and update state
   */
  const validateSingleQuestion = useCallback((question: Question) => {
    if (!question) return;

    try {
      const errors: string[] = [];
      
      // Check if question has errors (survey-core specific method)
      if ((question as any).hasErrors && (question as any).hasErrors()) {
        if ((question as any).errors && Array.isArray((question as any).errors)) {
          errors.push(...(question as any).errors.map((e: any) => e.text || e.message || String(e)));
        }
      }

      // Check required validation
      if (question.isRequired && (!question.value || question.value === '')) {
        errors.push('This field is required');
      }

      // Update validation state for this question
      setValidationState(prev => {
        const newErrors = { ...prev.errors };
        
        if (errors.length > 0) {
          newErrors[question.name] = errors;
        } else {
          delete newErrors[question.name];
        }

        const hasErrors = Object.keys(newErrors).length > 0;
        
        return {
          ...prev,
          hasErrors,
          errors: newErrors,
          validationMessages: hasErrors ? 
            Object.entries(newErrors).flatMap(([questionName, msgs]) =>
              msgs.map(message => ({ questionName, message }))
            ) : [],
        };
      });
    } catch (error) {
      // Fallback validation for cases where survey-core methods don't exist
      const errors: string[] = [];
      
      if (question.isRequired && (!question.value || question.value === '')) {
        errors.push('This field is required');
      }

      setValidationState(prev => {
        const newErrors = { ...prev.errors };
        
        if (errors.length > 0) {
          newErrors[question.name] = errors;
        } else {
          delete newErrors[question.name];
        }

        const hasErrors = Object.keys(newErrors).length > 0;
        
        return {
          ...prev,
          hasErrors,
          errors: newErrors,
          validationMessages: hasErrors ? 
            Object.entries(newErrors).flatMap(([questionName, msgs]) =>
              msgs.map(message => ({ questionName, message }))
            ) : [],
        };
      });
    }
  }, []);

  /**
   * Update validation state based on current model state
   */
  const updateValidationState = useCallback(() => {
    if (!model || !model.currentPage) {
      return;
    }

    try {
      const errors: Record<string, string[]> = {};
      const validationMessages: ValidationError[] = [];

      // Get all questions on current page
      const questions = model.currentPage.questions || [];
      
      questions.forEach((question: Question) => {
        const questionErrors: string[] = [];
        
        // Check if question has errors (survey-core specific method)
        if ((question as any).hasErrors && (question as any).hasErrors()) {
          if ((question as any).errors && Array.isArray((question as any).errors)) {
            questionErrors.push(...(question as any).errors.map((e: any) => e.text || e.message || String(e)));
          }
        }

        // Check required validation
        if (question.isRequired && (!question.value || question.value === '')) {
          questionErrors.push('This field is required');
        }

        if (questionErrors.length > 0) {
          errors[question.name] = questionErrors;
          questionErrors.forEach(message => {
            validationMessages.push({ questionName: question.name, message });
          });
        }
      });

      const hasErrors = Object.keys(errors).length > 0;

      setValidationState(prev => ({
        ...prev,
        hasErrors,
        errors,
        validationMessages,
      }));
    } catch (error) {
      // Fallback: assume no errors if validation methods don't exist
      setValidationState(prev => ({
        ...prev,
        hasErrors: false,
        errors: {},
        validationMessages: [],
      }));
    }
  }, [model]);

  /**
   * Validate the current page
   */
  const validateCurrentPage = useCallback((): boolean => {
    if (!model || !model.currentPage) {
      return true;
    }

    setValidationState(prev => ({ ...prev, isValidating: true }));

    try {
      let isValid = true;

      // Use survey-core validation if available
      if ((model as any).validateCurrentPage) {
        isValid = (model as any).validateCurrentPage();
      } else if ((model.currentPage as any).hasErrors) {
        isValid = !(model.currentPage as any).hasErrors();
      } else {
        // Fallback validation
        const questions = model.currentPage.questions || [];
        
        questions.forEach((question: Question) => {
          if (question.isRequired && (!question.value || question.value === '')) {
            isValid = false;
          }
        });
      }

      // Update validation state
      updateValidationState();

      setValidationState(prev => ({ ...prev, isValidating: false }));
      
      return isValid;
    } catch (error) {
      setValidationState(prev => ({ ...prev, isValidating: false }));
      return true; // Fallback: assume valid if validation fails
    }
  }, [model, updateValidationState]);

  /**
   * Validate all pages in the survey
   */
  const validateAllPages = useCallback((): boolean => {
    if (!model) {
      return true;
    }

    setValidationState(prev => ({ ...prev, isValidating: true }));

    try {
      let isValid = true;

      // Use survey-core validation if available
      if ((model as any).hasErrors) {
        isValid = !(model as any).hasErrors();
      } else if ((model as any).validate) {
        isValid = (model as any).validate();
      } else {
        // Fallback validation for all pages
        const pages = model.pages || [];
        
        pages.forEach((page: PageModel) => {
          const questions = page.questions || [];
          questions.forEach((question: Question) => {
            if (question.isRequired && (!question.value || question.value === '')) {
              isValid = false;
            }
          });
        });
      }

      setValidationState(prev => ({ ...prev, isValidating: false }));
      
      return isValid;
    } catch (error) {
      setValidationState(prev => ({ ...prev, isValidating: false }));
      return true; // Fallback: assume valid if validation fails
    }
  }, [model]);

  /**
   * Clear all validation errors
   */
  const clearValidationErrors = useCallback(() => {
    setValidationState({
      hasErrors: false,
      errors: {},
      validationMessages: [],
      isValidating: false,
    });
  }, []);

  /**
   * Validate a specific question by name
   */
  const validateQuestion = useCallback((questionName: string): boolean => {
    if (!model || !model.currentPage) {
      return true;
    }

    try {
      const question = model.currentPage.getQuestionByName?.(questionName);
      if (!question) {
        return true;
      }

      validateSingleQuestion(question);

      // Return validation result
      if ((question as any).hasErrors) {
        return !(question as any).hasErrors();
      } else {
        // Fallback validation
        return !(question.isRequired && (!question.value || question.value === ''));
      }
    } catch (error) {
      return true; // Fallback: assume valid if validation fails
    }
  }, [model, validateSingleQuestion]);

  return {
    validationState,
    validateCurrentPage,
    validateAllPages,
    clearValidationErrors,
    validateQuestion,
  };
}