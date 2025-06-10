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
  // Additional methods from task/T04
  clearErrors: (questionName?: string) => void;
  getQuestionErrors: (questionName: string) => string[];
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

  /**
   * Converts survey-core errors to our error format
   */
  const parseErrors = useCallback((surveyErrors: any[]): Record<string, string[]> => {
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
   * Check if a value is empty for validation purposes
   */
  const isValueEmpty = useCallback((value: any, questionType: string): boolean => {
    if (value === null || value === undefined) {
      return true;
    }
    
    if (typeof value === 'string') {
      return value.trim() === '';
    }
    
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    
    if (typeof value === 'object') {
      // For matrix questions or other object-based questions
      if (questionType === 'matrix' || questionType === 'matrixdropdown' || questionType === 'matrixdynamic') {
        return Object.keys(value).length === 0 || Object.values(value).every(v => !v);
      }
      return Object.keys(value).length === 0;
    }
    
    return false;
  }, []);

  /**
   * Generate contextual required error message based on question type
   */
  const getRequiredErrorMessage = useCallback((question: Question): string => {
    // Use custom required error text if provided
    if ((question as any).requiredErrorText) {
      return (question as any).requiredErrorText;
    }
    
    // Generate contextual message based on question type
    switch (question.type) {
      case 'radiogroup':
      case 'dropdown':
        return 'Please select an option';
      case 'checkbox':
        return 'Please select at least one option';
      case 'matrix':
      case 'matrixdropdown':
      case 'matrixdynamic':
        return 'Please answer all required rows';
      case 'rating':
        return 'Please provide a rating';
      case 'imagepicker':
        return 'Please select an image';
      case 'file':
        return 'Please upload a file';
      case 'signaturepad':
        return 'Please provide a signature';
      case 'boolean':
        return 'Please make a selection';
      default:
        return 'This field is required';
    }
  }, []);

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

      // Enhanced required validation
      if (question.isRequired) {
        const isEmpty = isValueEmpty(question.value, question.type);
        if (isEmpty) {
          const requiredError = getRequiredErrorMessage(question);
          // Avoid duplicate required messages
          if (!errors.some(err => err.toLowerCase().includes('required') || err === requiredError)) {
            errors.push(requiredError);
          }
        }
      }

      // Validate custom validators (like minimum selection count)
      if ((question as any).validators && Array.isArray((question as any).validators)) {
        (question as any).validators.forEach((validator: any) => {
          try {
            if (validator.type === 'answercount' && Array.isArray(question.value)) {
              const count = question.value.length;
              if (validator.minCount && count < validator.minCount) {
                errors.push(validator.text || `Please select at least ${validator.minCount} options`);
              }
              if (validator.maxCount && count > validator.maxCount) {
                errors.push(validator.text || `Please select no more than ${validator.maxCount} options`);
              }
            }
            // Add other validator types as needed
          } catch (validatorError) {
            // Ignore validator errors
          }
        });
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
      
      if (question.isRequired && isValueEmpty(question.value, question.type)) {
        errors.push(getRequiredErrorMessage(question));
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
  }, [isValueEmpty, getRequiredErrorMessage]);

  /**
   * Update validation state based on current model state
   */
  const updateValidationState = useCallback(() => {
    if (!model || !model.currentPage) {
      return;
    }

    try {
      // Get all questions on current page and validate each one
      const questions = model.currentPage.questions || [];
      
      questions.forEach((question: Question) => {
        validateSingleQuestion(question);
      });

    } catch (error) {
      // Fallback validation
      const questions = model.currentPage?.questions || [];
      questions.forEach((question: Question) => {
        if (question.isRequired && isValueEmpty(question.value, question.type)) {
          const requiredError = getRequiredErrorMessage(question);
          setValidationState(prev => ({
            ...prev,
            hasErrors: true,
            errors: { ...prev.errors, [question.name]: [requiredError] },
            validationMessages: [...prev.validationMessages, { questionName: question.name, message: requiredError }],
          }));
        }
      });
    }
  }, [model, validateSingleQuestion, isValueEmpty, getRequiredErrorMessage]);

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

      // Try using survey-core's validate method first
      if ((model.currentPage as any).validate) {
        isValid = (model.currentPage as any).validate(true, false);
        
        if (isValid && !(model.currentPage as any).hasErrors) {
          // No errors
          setValidationState(prev => ({
            ...prev,
            errors: {},
            hasErrors: false,
            isValidating: false,
          }));
          return true;
        } else {
          // Has errors - collect them
          const errors = (model.currentPage as any).errors || [];
          const errorMap = parseErrors(errors);
          
          setValidationState(prev => ({
            ...prev,
            errors: errorMap,
            hasErrors: Object.keys(errorMap).length > 0,
            isValidating: false,
          }));
          return false;
        }
      } else {
        // Fallback validation methods
        if ((model as any).validateCurrentPage) {
          isValid = (model as any).validateCurrentPage();
        } else if ((model.currentPage as any).hasErrors) {
          isValid = !(model.currentPage as any).hasErrors();
        } else {
          // Manual validation
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
      }
    } catch (error) {
      console.warn('Page validation error:', error);
      setValidationState(prev => ({ ...prev, isValidating: false }));
      return true; // Fallback: assume valid if validation fails
    }
  }, [model, updateValidationState, parseErrors]);
>>>>>>> task/T03_S08

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
            if (question.isRequired && isValueEmpty(question.value, question.type)) {
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
  }, [model, isValueEmpty]);

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
        return !(question.isRequired && isValueEmpty(question.value, question.type));
      }
    } catch (error) {
      return true; // Fallback: assume valid if validation fails
    }
  }, [model, validateSingleQuestion, isValueEmpty]);

  /**
   * Real-time validation on question value changes
   */
  useEffect(() => {
    if (!model) {
      return;
    }

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

    const handleValueChanged = (_sender: Model, options: any) => {
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
    if ((model as any).onValidateQuestion) {
      (model as any).onValidateQuestion.add(handleValidateQuestion);
    }
    model.onValueChanged.add(handleValueChanged);

    // Cleanup
    return () => {
      if ((model as any).onValidateQuestion) {
        (model as any).onValidateQuestion.remove(handleValidateQuestion);
      }
      model.onValueChanged.remove(handleValueChanged);
    };
  }, [model, clearErrors]);

  return {
    validationState,
    validateCurrentPage,
    validateAllPages,
    clearValidationErrors,
    validateQuestion,
    clearErrors,
    getQuestionErrors,
  };
}