// Import React hooks directly to avoid resolution issues
import * as React from 'react';
import { Model, Question, PageModel } from 'survey-core';

// Import validation interfaces
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

export interface SurveyState {
  /**
   * Survey data/answers
   */
  data: any;
  /**
   * Current page number (0-based)
   */
  currentPageNo: number;
  /**
   * Total number of pages
   */
  pageCount: number;
  /**
   * Whether currently on first page
   */
  isFirstPage: boolean;
  /**
   * Whether currently on last page
   */
  isLastPage: boolean;
  /**
   * Whether the survey is completed
   */
  isCompleted: boolean;
  /**
   * All questions with their current values
   */
  questions: Array<{
    name: string;
    value: any;
    type: string;
    [key: string]: any;
  }>;
  /**
   * Validation state integrated from usePageValidation
   */
  validation: ValidationState;
}

export interface UseSurveyStateReturn extends SurveyState {
  // Validation methods
  validateCurrentPage: () => boolean;
  validateAllPages: () => boolean;
  clearValidationErrors: () => void;
  validateQuestion: (questionName: string) => boolean;
  clearErrors: (questionName?: string) => void;
  getQuestionErrors: (questionName: string) => string[];
}

/**
 * React hook for tracking survey-core model state with integrated validation
 * Subscribes to model events and provides reactive state
 * @param model - Survey model instance
 * @returns Current survey state with validation methods
 */
export function useSurveyState(model: Model | null): UseSurveyStateReturn {
  const stateResult = React.useState<SurveyState>(() => ({
    data: model?.data || {},
    currentPageNo: model?.currentPageNo || 0,
    pageCount: model?.pageCount || 1,
    isFirstPage: model?.isFirstPage ?? true,
    isLastPage: model?.isLastPage ?? false,
    isCompleted: model ? model.getPropertyValue('isCompleted') === true : false,
    questions: getQuestions(model),
    validation: {
      hasErrors: false,
      errors: {},
      validationMessages: [],
      isValidating: false,
    },
  }));
  // Store the entire state tuple to avoid babel destructuring
  const state = stateResult[0];
  const setState = stateResult[1];

  /**
   * Converts survey-core errors to our error format
   */
  const parseErrors = React.useCallback((surveyErrors: any[]): Record<string, string[]> => {
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
   * Update validation state based on current model state
   */
  const updateValidationState = React.useCallback(() => {
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
        
        // Only check for actual validation errors from survey-core
        // Don't run validation on initial load - only process existing errors
        if ((question as any).hasErrors && (question as any).hasErrors()) {
          if ((question as any).errors && Array.isArray((question as any).errors)) {
            const validErrors = (question as any).errors
              .map((e: any) => {
                if (typeof e === 'string') return e;
                if (e && typeof e === 'object') {
                  return e.text || e.message || e.errorText;
                }
                return null;
              })
              .filter(Boolean); // Remove null/undefined values
            
            questionErrors.push(...validErrors);
          }
        }

        // Only add required validation errors if validation has been explicitly triggered
        // This prevents showing errors on initial load
        if (question.isRequired && (!question.value || question.value === '') && 
            (model as any).validationTriggered) {
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

      setState(prev => ({
        ...prev,
        validation: {
          ...prev.validation,
          hasErrors,
          errors,
          validationMessages,
        },
      }));
    } catch (error) {
      // Fallback: assume no errors if validation methods don't exist
      setState(prev => ({
        ...prev,
        validation: {
          ...prev.validation,
          hasErrors: false,
          errors: {},
          validationMessages: [],
        },
      }));
    }
  }, [model]);

  React.useEffect(() => {
    if (!model) {
      setState({
        data: {},
        currentPageNo: 0,
        pageCount: 1,
        isFirstPage: true,
        isLastPage: false,
        isCompleted: false,
        questions: [],
        validation: {
          hasErrors: false,
          errors: {},
          validationMessages: [],
          isValidating: false,
        },
      });
      return;
    }

    // Update state with current model values
    setState({
      data: model.data || {},
      currentPageNo: model.currentPageNo || 0,
      pageCount: model.pageCount || 1,
      isFirstPage: model.isFirstPage,
      isLastPage: model.isLastPage,
      isCompleted: model.getPropertyValue('isCompleted') === true,
      questions: getQuestions(model),
      validation: {
        hasErrors: false,
        errors: {},
        validationMessages: [],
        isValidating: false,
      },
    });

    // Event handlers
    const handleValueChanged = (sender: Model, options: any) => {
      setState((prev) => ({
        ...prev,
        data: sender.data || {},
        questions: getQuestions(sender),
      }));
      
      // Update validation for the changed question
      if (options?.question) {
        updateValidationState();
      }
    };

    const handlePageChanged = (sender: Model) => {
      setState((prev) => ({
        ...prev,
        currentPageNo: sender.currentPageNo || 0,
        isFirstPage: sender.isFirstPage,
        isLastPage: sender.isLastPage,
        validation: {
          ...prev.validation,
          hasErrors: false,
          errors: {},
          validationMessages: [],
        },
      }));
    };

    const handleComplete = () => {
      setState((prev) => ({
        ...prev,
        isCompleted: true,
      }));
    };

    const handleValidatedErrorsOnCurrentPage = (_sender: Model, _options: any) => {
      updateValidationState();
    };

    const handleValidateQuestion = (_sender: Model, options: any) => {
      try {
        // Update errors for the specific question that was validated
        const questionName = options?.name;
        if (!questionName) return;

        const question = (model as any).getQuestionByName ? (model as any).getQuestionByName(questionName) : null;
        if (!question) return;

        // Get errors for this specific question
        const questionErrors = (question as any).errors || [];
        const errorTexts = questionErrors.map((error: any) => error.text);

        setState((prev) => {
          const newErrors = { ...prev.validation.errors };
          
          if (errorTexts.length > 0) {
            newErrors[questionName] = errorTexts;
          } else {
            delete newErrors[questionName];
          }

          return {
            ...prev,
            validation: {
              ...prev.validation,
              errors: newErrors,
              hasErrors: Object.keys(newErrors).length > 0,
            },
          };
        });
      } catch (error) {
        console.warn('Question validation error:', error);
      }
    };

    // Subscribe to events
    model.onValueChanged.add(handleValueChanged);
    model.onCurrentPageChanged.add(handlePageChanged);
    model.onComplete.add(handleComplete);
    
    // Subscribe to validation events (if available)
    if ((model as any).onValidatedErrorsOnCurrentPage) {
      (model as any).onValidatedErrorsOnCurrentPage.add(handleValidatedErrorsOnCurrentPage);
    }
    if ((model as any).onValidateQuestion) {
      (model as any).onValidateQuestion.add(handleValidateQuestion);
    }

    // Don't run validation on initial load - let SurveyJS handle validation timing

    // Cleanup
    return () => {
      model.onValueChanged.remove(handleValueChanged);
      model.onCurrentPageChanged.remove(handlePageChanged);
      model.onComplete.remove(handleComplete);
      if ((model as any).onValidatedErrorsOnCurrentPage) {
        (model as any).onValidatedErrorsOnCurrentPage.remove(handleValidatedErrorsOnCurrentPage);
      }
      if ((model as any).onValidateQuestion) {
        (model as any).onValidateQuestion.remove(handleValidateQuestion);
      }
    };
  }, [model, updateValidationState]);

  // Validation methods
  const validateCurrentPage = React.useCallback((): boolean => {
    if (!model || !model.currentPage) {
      return true;
    }

    setState(prev => ({ 
      ...prev, 
      validation: { ...prev.validation, isValidating: true } 
    }));

    try {
      let isValid = true;

      // Try using survey-core's validate method first
      if ((model.currentPage as any).validate) {
        isValid = (model.currentPage as any).validate(true, false);
        
        if (isValid && !(model.currentPage as any).hasErrors) {
          // No errors
          setState(prev => ({
            ...prev,
            validation: {
              ...prev.validation,
              errors: {},
              hasErrors: false,
              isValidating: false,
            },
          }));
          return true;
        } else {
          // Has errors - collect them
          const errors = (model.currentPage as any).errors || [];
          const errorMap = parseErrors(errors);
          
          setState(prev => ({
            ...prev,
            validation: {
              ...prev.validation,
              errors: errorMap,
              hasErrors: Object.keys(errorMap).length > 0,
              isValidating: false,
            },
          }));
          return false;
        }
      } else {
        // Fallback validation methods
        updateValidationState();
        setState(prev => ({ 
          ...prev, 
          validation: { ...prev.validation, isValidating: false } 
        }));
        
        return !state.validation.hasErrors;
      }
    } catch (error) {
      console.warn('Page validation error:', error);
      setState(prev => ({ 
        ...prev, 
        validation: { ...prev.validation, isValidating: false } 
      }));
      return true; // Fallback: assume valid if validation fails
    }
  }, [model, updateValidationState, parseErrors, state.validation.hasErrors]);

  const validateAllPages = React.useCallback((): boolean => {
    if (!model) {
      return true;
    }

    setState(prev => ({ 
      ...prev, 
      validation: { ...prev.validation, isValidating: true } 
    }));

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

      setState(prev => ({ 
        ...prev, 
        validation: { ...prev.validation, isValidating: false } 
      }));
      
      return isValid;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        validation: { ...prev.validation, isValidating: false } 
      }));
      return true; // Fallback: assume valid if validation fails
    }
  }, [model]);

  const clearValidationErrors = React.useCallback(() => {
    setState(prev => ({
      ...prev,
      validation: {
        hasErrors: false,
        errors: {},
        validationMessages: [],
        isValidating: false,
      },
    }));
  }, []);

  const clearErrors = React.useCallback((questionName?: string) => {
    setState((prev) => {
      if (!questionName) {
        // Clear all errors
        return {
          ...prev,
          validation: {
            ...prev.validation,
            errors: {},
            hasErrors: false,
          },
        };
      } else {
        // Clear errors for specific question
        const newErrors = { ...prev.validation.errors };
        delete newErrors[questionName];
        
        return {
          ...prev,
          validation: {
            ...prev.validation,
            errors: newErrors,
            hasErrors: Object.keys(newErrors).length > 0,
          },
        };
      }
    });
  }, []);

  const getQuestionErrors = React.useCallback((questionName: string): string[] => {
    return state.validation.errors[questionName] || [];
  }, [state.validation.errors]);

  const validateQuestion = React.useCallback((questionName: string): boolean => {
    if (!model || !model.currentPage) {
      return true;
    }

    try {
      const question = model.currentPage.getQuestionByName?.(questionName);
      if (!question) {
        return true;
      }

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
  }, [model]);

  return {
    ...state,
    validateCurrentPage,
    validateAllPages,
    clearValidationErrors,
    validateQuestion,
    clearErrors,
    getQuestionErrors,
  };
}

/**
 * Extract questions and their values from model
 */
function getQuestions(
  model: Model | null
): Array<{ name: string; value: any; type: string; [key: string]: any }> {
  if (!model) {
    return [];
  }

  try {
    const questions = model.getAllQuestions();
    return questions.map((q: any) => ({
      name: q.name || '',
      value: q.value || '',
      type: q.getType?.() || q.type || 'text',
      title: q.title || '',
      description: q.description || '',
      isRequired: Boolean(q.isRequired),
      visible: q.visible !== false,
      readOnly: Boolean(q.readOnly),
    }));
  } catch (error) {
    console.warn('Error getting questions:', error);
    return [];
  }
}