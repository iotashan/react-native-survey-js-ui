import * as React from 'react';
const { createContext, useContext, useState, useCallback, useEffect } = React;
import type { Model, Question } from 'survey-core';

export interface ValidationError {
  questionName: string;
  message: string;
  ruleType?: string;
}

export interface ValidationContextState {
  errors: Record<string, string[]>;
  validationMessages: ValidationError[];
  hasErrors: boolean;
  isValidating: boolean;
  showErrors: boolean;
}

export interface ValidationContextValue {
  validationState: ValidationContextState;
  validateQuestion: (questionName: string, value: any, question: Question) => string[];
  setQuestionError: (questionName: string, errors: string[]) => void;
  clearQuestionError: (questionName: string) => void;
  clearAllErrors: () => void;
  validateAllVisibleQuestions: () => boolean;
  setShowErrors: (show: boolean) => void;
}

const ValidationContext = createContext<ValidationContextValue | null>(null);

export interface ValidationProviderProps {
  children: React.ReactNode;
  surveyModel: Model | null;
}

export const ValidationProvider: React.FC<ValidationProviderProps> = ({
  children,
  surveyModel,
}) => {
  const [validationState, setValidationState] = useState<ValidationContextState>({
    errors: {},
    validationMessages: [],
    hasErrors: false,
    isValidating: false,
    showErrors: false,
  });

  /**
   * Validate a single question based on its properties and value
   */
  const validateQuestion = useCallback((_questionName: string, value: any, question: Question): string[] => {
    const errors: string[] = [];

    // Required field validation
    if (question.isRequired) {
      const isEmpty = value === null || 
                     value === undefined || 
                     value === '' || 
                     (Array.isArray(value) && value.length === 0);
      
      if (isEmpty) {
        errors.push('This field is required');
      }
    }

    // Email validation for email input type
    if (value && (question as any).inputType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push('Please enter a valid email address');
      }
    }

    // URL validation for url input type
    if (value && (question as any).inputType === 'url') {
      try {
        new URL(value);
      } catch {
        errors.push('Please enter a valid URL');
      }
    }

    // Number validation for number input type
    if (value && (question as any).inputType === 'number') {
      if (isNaN(Number(value))) {
        errors.push('Please enter a valid number');
      }
    }

    // Text length validation
    if (value && typeof value === 'string') {
      // Min length validation
      if ((question as any).minLength && value.length < (question as any).minLength) {
        errors.push(`Minimum length is ${(question as any).minLength} characters`);
      }
      
      // Max length validation
      if ((question as any).maxLength && value.length > (question as any).maxLength) {
        errors.push(`Maximum length is ${(question as any).maxLength} characters`);
      }
    }

    // Custom validators from survey-core
    if ((question as any).validators && Array.isArray((question as any).validators)) {
      (question as any).validators.forEach((validator: any) => {
        if (validator.validate) {
          try {
            const result = validator.validate(value, question.name);
            if (result && result.error) {
              errors.push(result.error);
            }
          } catch (error) {
            // Fallback for custom validators that might throw
          }
        }
      });
    }

    return errors;
  }, []);

  /**
   * Set validation errors for a specific question
   */
  const setQuestionError = useCallback((questionName: string, errors: string[]) => {
    setValidationState(prev => {
      const newErrors = { ...prev.errors };
      
      if (errors.length > 0) {
        newErrors[questionName] = errors;
      } else {
        delete newErrors[questionName];
      }

      const hasErrors = Object.keys(newErrors).length > 0;
      const validationMessages: ValidationError[] = hasErrors
        ? Object.entries(newErrors).flatMap(([qName, msgs]) =>
            msgs.map(message => ({ questionName: qName, message }))
          )
        : [];

      return {
        ...prev,
        errors: newErrors,
        hasErrors,
        validationMessages,
      };
    });
  }, []);

  /**
   * Clear validation errors for a specific question
   */
  const clearQuestionError = useCallback((questionName: string) => {
    setQuestionError(questionName, []);
  }, [setQuestionError]);

  /**
   * Clear all validation errors
   */
  const clearAllErrors = useCallback(() => {
    setValidationState(prev => ({
      ...prev,
      errors: {},
      validationMessages: [],
      hasErrors: false,
      showErrors: false,
    }));
  }, []);

  /**
   * Validate all visible questions on the current page
   */
  const validateAllVisibleQuestions = useCallback((): boolean => {
    if (!surveyModel || !surveyModel.currentPage) {
      return true;
    }

    setValidationState(prev => ({ ...prev, isValidating: true }));

    try {
      const questions = surveyModel.currentPage.questions || [];
      const visibleQuestions = questions.filter((q: Question) => q.visible !== false);
      
      let hasAnyErrors = false;
      const allErrors: Record<string, string[]> = {};

      visibleQuestions.forEach((question: Question) => {
        const errors = validateQuestion(question.name, question.value, question);
        if (errors.length > 0) {
          allErrors[question.name] = errors;
          hasAnyErrors = true;
        }
      });

      // Update all errors at once
      const validationMessages: ValidationError[] = hasAnyErrors
        ? Object.entries(allErrors).flatMap(([qName, msgs]) =>
            msgs.map(message => ({ questionName: qName, message }))
          )
        : [];

      setValidationState(prev => ({
        ...prev,
        errors: allErrors,
        hasErrors: hasAnyErrors,
        validationMessages,
        isValidating: false,
        showErrors: true, // Show errors after validation
      }));

      return !hasAnyErrors;
    } catch (error) {
      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        showErrors: true,
      }));
      return true; // Fallback: assume valid if validation fails
    }
  }, [surveyModel, validateQuestion]);

  /**
   * Control whether validation errors should be displayed
   */
  const setShowErrors = useCallback((show: boolean) => {
    setValidationState(prev => ({
      ...prev,
      showErrors: show,
    }));
  }, []);

  // Clear errors when survey model or current page changes
  useEffect(() => {
    clearAllErrors();
  }, [surveyModel?.currentPage, clearAllErrors]);

  const contextValue: ValidationContextValue = {
    validationState,
    validateQuestion,
    setQuestionError,
    clearQuestionError,
    clearAllErrors,
    validateAllVisibleQuestions,
    setShowErrors,
  };

  return (
    <ValidationContext.Provider value={contextValue}>
      {children}
    </ValidationContext.Provider>
  );
};

/**
 * Hook to access validation context
 */
export const useValidation = (): ValidationContextValue => {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error('useValidation must be used within a ValidationProvider');
  }
  return context;
};

/**
 * Hook to get validation errors for a specific question
 */
export const useQuestionValidation = (questionName: string) => {
  const { validationState, validateQuestion, setQuestionError, clearQuestionError } = useValidation();
  
  const questionErrors = validationState.errors[questionName] || [];
  const hasErrors = questionErrors.length > 0;
  const shouldShowErrors = validationState.showErrors && hasErrors;

  return {
    errors: questionErrors,
    hasErrors,
    shouldShowErrors,
    validateQuestion,
    setQuestionError: (errors: string[]) => setQuestionError(questionName, errors),
    clearQuestionError: () => clearQuestionError(questionName),
  };
};