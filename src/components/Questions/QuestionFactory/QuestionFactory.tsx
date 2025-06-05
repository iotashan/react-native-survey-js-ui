import React from 'react';
import type { QuestionModel } from '../../../types';
import { BaseQuestion } from '../BaseQuestion';
import { TextQuestion } from '../TextQuestion';

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
  const QuestionComponent = questionRegistry.get(question.type);

  if (!QuestionComponent) {
    console.warn(
      `Unknown question type: ${question.type}. Falling back to BaseQuestion.`
    );
    return <BaseQuestion question={question} error={error} />;
  }

  return (
    <QuestionComponent
      question={question}
      value={value}
      onChange={onChange}
      error={error}
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
