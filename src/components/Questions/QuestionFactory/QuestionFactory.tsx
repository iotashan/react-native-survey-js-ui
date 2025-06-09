import React from 'react';
import type { QuestionModel } from '../../../types';
import { BaseQuestion } from '../BaseQuestion';
import { TextQuestion } from '../TextQuestion';
import { useQuestionValidation } from '../../ValidationContext';

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

export interface QuestionFactoryProps extends QuestionComponentProps {}

export const QuestionFactory: React.FC<QuestionFactoryProps> & {
  registerQuestionType: (type: string, component: QuestionComponent) => void;
  clearRegistry: () => void;
  getRegisteredTypes: () => string[];
  isTypeRegistered: (type: string) => boolean;
} = ({ question, value, onChange, error }) => {
  const validation = useQuestionValidation(question.name);
  const QuestionComponent = questionRegistry.get(question.type);

  // Use validation errors if available, fallback to passed error prop
  const displayError = validation.shouldShowErrors && validation.errors.length > 0
    ? validation.errors[0] // Show first error
    : error;

  // Enhanced onChange handler that includes validation
  const handleChange = React.useCallback((newValue: any) => {
    // Call the original onChange handler
    if (onChange) {
      onChange(newValue);
    }

    // Validate the new value and update validation state
    const errors = validation.validateQuestion(question.name, newValue, question as any);
    validation.setQuestionError(errors);
  }, [onChange, validation, question]);

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
