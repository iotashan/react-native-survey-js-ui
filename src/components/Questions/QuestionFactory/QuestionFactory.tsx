import React from 'react';
import type { QuestionModel } from '../../../types';
import { BaseQuestion } from '../BaseQuestion';
import { TextQuestion } from '../TextQuestion';
import { usePageValidation } from '../../../hooks/usePageValidation';

export interface QuestionComponentProps {
  question: QuestionModel;
  value?: any;
  onChange?: (value: any) => void;
  error?: string;
}

type QuestionComponent = React.ComponentType<QuestionComponentProps>;

// Question type registry
const questionRegistry = new Map<string, QuestionComponent>();

// Register built-in question types
questionRegistry.set('text', TextQuestion);

export interface QuestionFactoryProps extends QuestionComponentProps {
  model?: any; // Survey model for validation
}

export const QuestionFactory: React.FC<QuestionFactoryProps> & {
  registerQuestionType: (type: string, component: QuestionComponent) => void;
  clearRegistry: () => void;
  getRegisteredTypes: () => string[];
  isTypeRegistered: (type: string) => boolean;
} = ({ question, value, onChange, error, model }) => {
  const { validationState, validateQuestion } = usePageValidation(model);
  const QuestionComponent = questionRegistry.get(question.type);

  // Use validation errors if available, fallback to passed error prop
  const questionErrors = validationState.errors[question.name] || [];
  const displayError = questionErrors.length > 0 ? questionErrors[0] : error;

  // Enhanced onChange handler that includes validation
  const handleChange = React.useCallback((newValue: any) => {
    // Call the original onChange handler
    if (onChange) {
      onChange(newValue);
    }

    // Validate the question after value change
    validateQuestion(question.name);
  }, [onChange, validateQuestion, question.name]);

  if (!QuestionComponent) {
    console.warn(
      `Unknown question type: ${question.type}. Falling back to BaseQuestion.`
    );
    return <BaseQuestion question={question} {...(displayError && { error: displayError })} />;
  }

  return (
    <QuestionComponent
      question={question}
      {...(value !== undefined && { value })}
      onChange={handleChange}
      {...(displayError && { error: displayError })}
    />
  );
};

// Static methods for managing the registry
QuestionFactory.registerQuestionType = (
  type: string,
  component: QuestionComponent
) => {
  questionRegistry.set(type, component);
};

QuestionFactory.clearRegistry = () => {
  questionRegistry.clear();
  // Re-register built-in types
  questionRegistry.set('text', TextQuestion);
};

QuestionFactory.getRegisteredTypes = () => {
  return Array.from(questionRegistry.keys());
};

QuestionFactory.isTypeRegistered = (type: string) => {
  return questionRegistry.has(type);
};
