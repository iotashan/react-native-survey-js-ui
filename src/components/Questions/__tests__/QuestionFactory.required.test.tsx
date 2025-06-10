import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuestionFactory } from '../QuestionFactory';
import type { Model, Question } from 'survey-core';
import type { QuestionModel } from '../../../types';

// Mock survey-core Model for testing
const createMockModel = (questions: Partial<Question>[] = []): Model => {
  const mockQuestions = questions.map(q => ({
    name: q.name || 'question1',
    value: q.value || '',
    isRequired: q.isRequired || false,
    type: q.type || 'text',
    visible: q.visible !== false,
    title: q.title || 'Test Question',
    ...q
  }));

  const mockCurrentPage = {
    questions: mockQuestions,
    getQuestionByName: jest.fn((name: string) => 
      mockQuestions.find(q => q.name === name)
    ),
  };

  const model = {
    currentPage: mockCurrentPage,
    pages: [mockCurrentPage],
    onValueChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onCurrentPageChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
  } as unknown as Model;

  return model;
};

describe('QuestionFactory - Required Field Validation Integration', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display required field error for empty text question', () => {
    const model = createMockModel([
      { name: 'firstName', value: '', isRequired: true, type: 'text', title: 'First Name' }
    ]);

    const question: QuestionModel = {
      name: 'firstName',
      type: 'text',
      title: 'First Name',
      isRequired: true,
      visible: true,
      readOnly: false,
    };

    const { getByTestId } = render(
      <QuestionFactory 
        question={question} 
        value="" 
        onChange={mockOnChange}
        model={model}
      />
    );

    // The error should be displayed since the field is required and empty
    expect(getByTestId('question-error')).toBeTruthy();
  });

  it('should display custom required error message', () => {
    const model = createMockModel([
      { 
        name: 'email', 
        value: '', 
        isRequired: true, 
        type: 'text', 
        title: 'Email',
        requiredErrorText: 'Please provide your email address'
      }
    ]);

    const question: QuestionModel = {
      name: 'email',
      type: 'text',
      title: 'Email',
      isRequired: true,
      visible: true,
      readOnly: false,
    };

    const { getByTestId } = render(
      <QuestionFactory 
        question={question} 
        value="" 
        onChange={mockOnChange}
        model={model}
      />
    );

    const errorElement = getByTestId('question-error');
    expect(errorElement.children[0]).toBe('Please provide your email address');
  });

  it('should not display error for valid required field', () => {
    const model = createMockModel([
      { name: 'firstName', value: 'John', isRequired: true, type: 'text', title: 'First Name' }
    ]);

    const question: QuestionModel = {
      name: 'firstName',
      type: 'text',
      title: 'First Name',
      isRequired: true,
      visible: true,
      readOnly: false,
    };

    const { queryByTestId } = render(
      <QuestionFactory 
        question={question} 
        value="John" 
        onChange={mockOnChange}
        model={model}
      />
    );

    // No error should be displayed since the field has a value
    expect(queryByTestId('question-error')).toBeNull();
  });

  it('should validate on value change', () => {
    const model = createMockModel([
      { name: 'firstName', value: '', isRequired: true, type: 'text', title: 'First Name' }
    ]);

    const question: QuestionModel = {
      name: 'firstName',
      type: 'text',
      title: 'First Name',
      isRequired: true,
      visible: true,
      readOnly: false,
    };

    const { getByTestId, queryByTestId, rerender } = render(
      <QuestionFactory 
        question={question} 
        value="" 
        onChange={mockOnChange}
        model={model}
      />
    );

    // Initially should show error
    expect(getByTestId('question-error')).toBeTruthy();

    // Update the model to simulate value change
    const updatedModel = createMockModel([
      { name: 'firstName', value: 'John', isRequired: true, type: 'text', title: 'First Name' }
    ]);

    // Re-render with new value
    rerender(
      <QuestionFactory 
        question={question} 
        value="John" 
        onChange={mockOnChange}
        model={updatedModel}
      />
    );

    // Error should be gone
    expect(queryByTestId('question-error')).toBeNull();
  });

  it('should handle questions not in model gracefully', () => {
    const model = createMockModel([]); // Empty model

    const question: QuestionModel = {
      name: 'missingQuestion',
      type: 'text',
      title: 'Missing Question',
      isRequired: true,
      visible: true,
      readOnly: false,
    };

    const { queryByTestId } = render(
      <QuestionFactory 
        question={question} 
        value="" 
        onChange={mockOnChange}
        model={model}
      />
    );

    // Should not crash and should not show error for missing question
    expect(queryByTestId('question-error')).toBeNull();
  });
});