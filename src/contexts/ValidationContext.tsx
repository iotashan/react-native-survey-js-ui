import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { Model, Question } from 'survey-core';
import { ValidatorRegistry, type ValidationFunction } from '../validation';

/**
 * Validation timing modes for form validation
 * - 'real-time': Validates as user types
 * - 'on-submit': Validates only when form is submitted
 * - 'hybrid': Validates touched fields in real-time, others on submit
 */
export type ValidationMode = 'real-time' | 'on-submit' | 'hybrid';

/**
 * ValidationContext value interface
 * Provides validation state and methods for the entire survey
 */
export interface ValidationContextValue {
  // State
  model: Model | null;
  validationMode: ValidationMode;
  errors: Record<string, string[]>;
  touchedFields: Record<string, boolean>;
  hasErrors: boolean;
  isValidating: boolean;
  
  // Methods
  validateField: (fieldName: string) => boolean;
  validatePage: (pageIndex?: number) => boolean;
  validateSurvey: () => boolean | Promise<boolean>;
  validateAllVisibleQuestions: () => boolean;
  setValidationMode: (mode: ValidationMode) => void;
  clearErrors: () => void;
  clearFieldError: (fieldName: string) => void;
  setFieldError: (fieldName: string, errors: string[]) => void;
  getFieldErrors: (fieldName: string) => string[];
  markFieldTouched: (fieldName: string) => void;
  setShowErrors: (show: boolean) => void;
  
  // Custom validation methods
  registerCustomValidator: (ruleName: string, validationFunction: ValidationFunction, errorMessage?: string) => void;
  addCustomValidatorToField: (fieldName: string, validatorRuleName: string, customErrorMessage?: string) => void;
  removeCustomValidatorFromField: (fieldName: string, validatorRuleName: string) => void;
  validateWithCustomValidator: (fieldName: string, value: any, validatorRuleName: string) => boolean | Promise<boolean>;
}

const ValidationContext = createContext<ValidationContextValue | null>(null);

export interface ValidationProviderProps {
  children: React.ReactNode;
  model: Model | null;
  initialMode?: ValidationMode;
}

/**
 * ValidationProvider component that manages validation state for the entire survey
 * Provides centralized validation management with support for multiple validation modes
 */
export function ValidationProvider({ 
  children, 
  model, 
  initialMode = 'on-submit' 
}: ValidationProviderProps) {
  const [validationMode, setValidationMode] = useState<ValidationMode>(initialMode);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);
  
  // Custom validator state - track which validators are applied to which fields
  const [_fieldCustomValidators, setFieldCustomValidators] = useState<Record<string, string[]>>({});
  
  // Ref to track current validation mode for event handlers
  const validationModeRef = useRef(validationMode);
  validationModeRef.current = validationMode;
  
  // Ref to track touched fields for event handlers
  const touchedFieldsRef = useRef(touchedFields);
  touchedFieldsRef.current = touchedFields;

  // Compute hasErrors
  const hasErrors = useMemo(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  /**
   * Extract validation errors from a question
   */
  const getQuestionErrors = useCallback((question: Question): string[] => {
    const questionErrors: string[] = [];
    
    try {
      // Check if question has errors using survey-core methods
      if ((question as any).hasErrors && (question as any).hasErrors()) {
        if ((question as any).errors && Array.isArray((question as any).errors)) {
          questionErrors.push(...(question as any).errors.map((e: any) => 
            e.text || e.message || String(e)
          ));
        }
      }
      
      // Check required validation only if not already in errors
      if (question.isRequired && (!question.value || question.value === '')) {
        const hasRequiredError = questionErrors.some(err => 
          err.toLowerCase().includes('required') || err.toLowerCase().includes('field is required')
        );
        if (!hasRequiredError) {
          questionErrors.push('This field is required');
        }
      }
    } catch (error) {
      // Fallback validation
      if (question.isRequired && (!question.value || question.value === '')) {
        questionErrors.push('This field is required');
      }
    }
    
    return questionErrors;
  }, []);

  /**
   * Validate a single field
   */
  const validateField = useCallback((fieldName: string): boolean => {
    if (!model || !model.currentPage) {
      return true;
    }
    
    try {
      const question = model.currentPage.getQuestionByName?.(fieldName);
      if (!question) {
        // Try to find in all pages
        for (const page of model.pages || []) {
          const q = page.getQuestionByName?.(fieldName);
          if (q) {
            const questionErrors = getQuestionErrors(q);
            if (questionErrors.length > 0) {
              setErrors(prev => ({ ...prev, [fieldName]: questionErrors }));
              return false;
            } else {
              setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
              });
              return true;
            }
          }
        }
        return true;
      }
      
      const questionErrors = getQuestionErrors(question);
      
      if (questionErrors.length > 0) {
        setErrors(prev => ({ ...prev, [fieldName]: questionErrors }));
        return false;
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
        return true;
      }
    } catch (error) {
      console.warn('Error validating field:', error);
      return true;
    }
  }, [model, getQuestionErrors]);

  /**
   * Validate a page (current page by default)
   */
  const validatePage = useCallback((pageIndex?: number): boolean => {
    if (!model) {
      return true;
    }
    
    try {
      if (pageIndex === undefined) {
        // Validate current page
        if ((model as any).validateCurrentPage) {
          const isValid = (model as any).validateCurrentPage();
          
          // Update error state for current page questions
          if (model.currentPage) {
            const questions = model.currentPage.questions || [];
            const pageErrors: Record<string, string[]> = {};
            
            questions.forEach((question: Question) => {
              const questionErrors = getQuestionErrors(question);
              if (questionErrors.length > 0) {
                pageErrors[question.name] = questionErrors;
              }
            });
            
            // Update errors for current page
            setErrors(prev => {
              const newErrors = { ...prev };
              // Clear errors for current page questions
              questions.forEach((q: Question) => {
                delete newErrors[q.name];
              });
              // Add new errors
              return { ...newErrors, ...pageErrors };
            });
          }
          
          return isValid;
        }
      } else {
        // Validate specific page
        const page = model.pages?.[pageIndex];
        if (!page) return true;
        
        let isValid = true;
        const pageErrors: Record<string, string[]> = {};
        
        const questions = page.questions || [];
        questions.forEach((question: Question) => {
          const questionErrors = getQuestionErrors(question);
          if (questionErrors.length > 0) {
            pageErrors[question.name] = questionErrors;
            isValid = false;
          }
        });
        
        // Update errors for specific page
        setErrors(prev => {
          const newErrors = { ...prev };
          // Clear errors for this page's questions
          questions.forEach((q: Question) => {
            delete newErrors[q.name];
          });
          // Add new errors
          return { ...newErrors, ...pageErrors };
        });
        
        return isValid;
      }
      
      return true;
    } catch (error) {
      console.warn('Error validating page:', error);
      return true;
    }
  }, [model, getQuestionErrors]);

  /**
   * Validate the entire survey
   */
  const validateSurvey = useCallback((): boolean | Promise<boolean> => {
    if (!model) {
      return true;
    }
    
    setIsValidating(true);
    
    try {
      if ((model as any).validate) {
        const result = (model as any).validate();
        
        // Handle both sync and async validation
        if (result instanceof Promise) {
          return result.finally(() => setIsValidating(false));
        } else {
          setIsValidating(false);
          
          // Update all errors
          const allErrors: Record<string, string[]> = {};
          
          for (const page of model.pages || []) {
            for (const question of page.questions || []) {
              const questionErrors = getQuestionErrors(question);
              if (questionErrors.length > 0) {
                allErrors[question.name] = questionErrors;
              }
            }
          }
          
          setErrors(allErrors);
          return result;
        }
      } else {
        // Fallback: validate all pages
        let isValid = true;
        const allErrors: Record<string, string[]> = {};
        
        for (const page of model.pages || []) {
          for (const question of page.questions || []) {
            const questionErrors = getQuestionErrors(question);
            if (questionErrors.length > 0) {
              allErrors[question.name] = questionErrors;
              isValid = false;
            }
          }
        }
        
        setErrors(allErrors);
        setIsValidating(false);
        return isValid;
      }
    } catch (error) {
      console.warn('Error validating survey:', error);
      setIsValidating(false);
      return true;
    }
  }, [model, getQuestionErrors]);

  /**
   * Clear all validation errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
    setTouchedFields({});
  }, []);

  /**
   * Clear error for a specific field
   */
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Set error for a specific field
   */
  const setFieldError = useCallback((fieldName: string, fieldErrors: string[]) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldErrors
    }));
  }, []);

  /**
   * Get errors for a specific field
   */
  const getFieldErrors = useCallback((fieldName: string): string[] => {
    return errors[fieldName] || [];
  }, [errors]);

  /**
   * Mark a field as touched
   */
  const markFieldTouched = useCallback((fieldName: string) => {
    setTouchedFields(prev => ({
      ...prev,
      [fieldName]: true
    }));
  }, []);

  /**
   * Set up event listeners for survey model
   */
  useEffect(() => {
    if (!model) return;

    const handleValueChanged = (_sender: Model, options: any) => {
      const mode = validationModeRef.current;
      
      if (options.question) {
        const isTouched = touchedFieldsRef.current[options.question.name];
        if (mode === 'real-time' || (mode === 'hybrid' && isTouched)) {
          validateField(options.question.name);
        }
      }
    };

    const handleCurrentPageChanged = () => {
      // Validation state persists across page navigation
      // Do not clear errors - they should persist as per requirements
    };

    const handleValidatedErrorsOnCurrentPage = () => {
      // Update validation state when survey-core validates
      if (model.currentPage) {
        const questions = model.currentPage.questions || [];
        const pageErrors: Record<string, string[]> = {};
        
        questions.forEach((question: Question) => {
          const questionErrors = getQuestionErrors(question);
          if (questionErrors.length > 0) {
            pageErrors[question.name] = questionErrors;
          }
        });
        
        setErrors(pageErrors);
      }
    };

    const handleCompleting = () => {
      // Validate entire survey before completion
      validateSurvey();
    };

    // Subscribe to events
    model.onValueChanged.add(handleValueChanged);
    model.onCurrentPageChanged.add(handleCurrentPageChanged);
    
    if ((model as any).onValidatedErrorsOnCurrentPage) {
      (model as any).onValidatedErrorsOnCurrentPage.add(handleValidatedErrorsOnCurrentPage);
    }
    
    if ((model as any).onCompleting) {
      (model as any).onCompleting.add(handleCompleting);
    }

    // Cleanup
    return () => {
      model.onValueChanged.remove(handleValueChanged);
      model.onCurrentPageChanged.remove(handleCurrentPageChanged);
      
      if ((model as any).onValidatedErrorsOnCurrentPage) {
        (model as any).onValidatedErrorsOnCurrentPage.remove(handleValidatedErrorsOnCurrentPage);
      }
      
      if ((model as any).onCompleting) {
        (model as any).onCompleting.remove(handleCompleting);
      }
    };
  }, [model, validateField, validateSurvey, getQuestionErrors]);

  // Custom validation methods
  const registerCustomValidator = useCallback((
    ruleName: string, 
    validationFunction: ValidationFunction, 
    errorMessage?: string
  ) => {
    ValidatorRegistry.register(ruleName, validationFunction, errorMessage);
  }, []);

  const addCustomValidatorToField = useCallback((
    fieldName: string, 
    validatorRuleName: string, 
    _customErrorMessage?: string
  ) => {
    setFieldCustomValidators(prev => ({
      ...prev,
      [fieldName]: [...(prev[fieldName] || []), validatorRuleName]
    }));
  }, []);

  const removeCustomValidatorFromField = useCallback((
    fieldName: string, 
    validatorRuleName: string
  ) => {
    setFieldCustomValidators(prev => ({
      ...prev,
      [fieldName]: (prev[fieldName] || []).filter(name => name !== validatorRuleName)
    }));
  }, []);

  const validateWithCustomValidator = useCallback(async (
    fieldName: string, 
    value: any, 
    validatorRuleName: string
  ): Promise<boolean> => {
    try {
      if (!ValidatorRegistry.exists(validatorRuleName)) {
        console.warn(`Custom validator "${validatorRuleName}" not found`);
        return true;
      }

      const validator = ValidatorRegistry.createValidator(validatorRuleName);
      const result = validator.validate(value, fieldName);
      
      if (validator.isAsync) {
        // For async validators, we return true initially and handle errors via onAsyncCompleted
        return new Promise((resolve) => {
          validator.onAsyncCompleted = (asyncResult) => {
            const isValid = !asyncResult || !asyncResult.error;
            if (!isValid && asyncResult?.error) {
              setFieldError(fieldName, [asyncResult.error.text || 'Validation failed']);
            } else {
              clearFieldError(fieldName);
            }
            resolve(isValid);
          };
        });
      } else {
        // Sync validation
        const isValid = !result || !result.error;
        if (!isValid && result?.error) {
          setFieldError(fieldName, [result.error.text || 'Validation failed']);
        } else {
          clearFieldError(fieldName);
        }
        return isValid;
      }
    } catch (error) {
      console.error(`Error in custom validator "${validatorRuleName}":`, error);
      setFieldError(fieldName, ['Validation error occurred']);
      return false;
    }
  }, [setFieldError, clearFieldError]);

  // Additional validation methods
  const validateAllVisibleQuestions = useCallback((): boolean => {
    if (!model) return true;
    
    try {
      // Get all visible questions on current page
      const currentPage = model.currentPage;
      if (!currentPage) return true;
      
      let isValid = true;
      const visibleQuestions = currentPage.getAllQuestions().filter((q: any) => q.isVisible);
      
      for (const question of visibleQuestions) {
        const questionValid = validateField(question.name);
        if (!questionValid) {
          isValid = false;
        }
      }
      
      return isValid;
    } catch (error) {
      console.error('Error validating all visible questions:', error);
      return false;
    }
  }, [model, validateField]);

  const setShowErrors = useCallback((show: boolean) => {
    if (!model) return;
    
    // This could be used to control whether errors are shown
    // For now, we'll implement a basic version
    if (!show) {
      clearErrors();
    }
  }, [model, clearErrors]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<ValidationContextValue>(() => ({
    model,
    validationMode,
    errors,
    touchedFields,
    hasErrors,
    isValidating,
    validateField,
    validatePage,
    validateSurvey,
    validateAllVisibleQuestions,
    setValidationMode,
    clearErrors,
    clearFieldError,
    setFieldError,
    getFieldErrors,
    markFieldTouched,
    setShowErrors,
    registerCustomValidator,
    addCustomValidatorToField,
    removeCustomValidatorFromField,
    validateWithCustomValidator,
  }), [
    model,
    validationMode,
    errors,
    touchedFields,
    hasErrors,
    isValidating,
    validateField,
    validatePage,
    validateSurvey,
    validateAllVisibleQuestions,
    clearErrors,
    clearFieldError,
    setFieldError,
    getFieldErrors,
    markFieldTouched,
    setShowErrors,
    registerCustomValidator,
    addCustomValidatorToField,
    removeCustomValidatorFromField,
    validateWithCustomValidator,
  ]);

  return (
    <ValidationContext.Provider value={contextValue}>
      {children}
    </ValidationContext.Provider>
  );
}

/**
 * Hook to access validation context
 * @throws Error if used outside of ValidationProvider
 */
export function useValidation(): ValidationContextValue {
  const context = useContext(ValidationContext);
  
  if (!context) {
    throw new Error('useValidation must be used within a ValidationProvider');
  }
  
  return context;
}