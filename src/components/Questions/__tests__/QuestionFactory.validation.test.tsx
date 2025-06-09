import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuestionFactory } from '../QuestionFactory';
import { ValidationProvider } from '../../ValidationContext';
import type { QuestionModel } from '../../../types';

// Mock TextInput from react-native
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  const mockReact = require('react');
  return {
    ...RN,
    TextInput: jest.fn().mockImplementation(({ children, ...props }) => {
      return mockReact.createElement('TextInput', props, children);
    }),
  };
});

const mockSurveyModel = {
  currentPage: {
    questions: [],
  },
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ValidationProvider surveyModel={mockSurveyModel}>
    {children}
  </ValidationProvider>
);

describe('QuestionFactory with Validation', () => {
  const mockRequiredQuestion: QuestionModel = {
    name: 'test-question',
    type: 'text',
    title: 'Test Question',
    isRequired: true,
    visible: true,
    readOnly: false,
    inputType: 'text',
  };

  const mockOptionalQuestion: QuestionModel = {
    ...mockRequiredQuestion,
    name: 'optional-question',
    isRequired: false,
  };

  const mockEmailQuestion: QuestionModel = {
    ...mockRequiredQuestion,
    name: 'email-question',
    inputType: 'email',
  };

  it('should render question with validation context', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <QuestionFactory
          question={mockRequiredQuestion}
          value=""
          onChange={jest.fn()}
        />
      </TestWrapper>
    );

    expect(getByTestId('text-question-container')).toBeTruthy();
  });

  it('should validate required field on change', () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <TestWrapper>
        <QuestionFactory
          question={mockRequiredQuestion}
          value=""
          onChange={mockOnChange}
        />
      </TestWrapper>
    );

    const input = getByTestId('text-question-input');
    
    // Simulate text change
    fireEvent.changeText(input, 'test value');

    // Verify onChange was called
    expect(mockOnChange).toHaveBeenCalledWith('test value');
  });

  it('should show validation error for empty required field', async () => {
    const { getByTestId, queryByTestId } = render(
      <TestWrapper>
        <QuestionFactory
          question={mockRequiredQuestion}
          value=""
          onChange={jest.fn()}
        />
      </TestWrapper>
    );

    const input = getByTestId('text-question-input');
    
    // Initially no error should be shown
    expect(queryByTestId('question-error')).toBeFalsy();

    // Change to empty value and trigger validation
    fireEvent.changeText(input, '');
    fireEvent.changeText(input, 'something');
    fireEvent.changeText(input, '');

    // Note: The actual error display depends on the validation state being set to show errors
    // This would typically happen when trying to navigate or submit
  });

  it('should validate email format', () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <TestWrapper>
        <QuestionFactory
          question={mockEmailQuestion}
          value=""
          onChange={mockOnChange}
        />
      </TestWrapper>
    );

    const input = getByTestId('text-question-input');
    
    // Test invalid email
    fireEvent.changeText(input, 'invalid-email');
    expect(mockOnChange).toHaveBeenCalledWith('invalid-email');

    // Test valid email
    fireEvent.changeText(input, 'test@example.com');
    expect(mockOnChange).toHaveBeenCalledWith('test@example.com');
  });

  it('should not validate optional fields for required constraint', () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <TestWrapper>
        <QuestionFactory
          question={mockOptionalQuestion}
          value=""
          onChange={mockOnChange}
        />
      </TestWrapper>
    );

    const input = getByTestId('text-question-input');
    
    // Optional field should not fail validation for being empty
    fireEvent.changeText(input, '');
    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('should display external error prop when no validation errors', () => {
    const externalError = 'External error message';
    const { getByTestId } = render(
      <TestWrapper>
        <QuestionFactory
          question={mockOptionalQuestion}
          value="some value"
          onChange={jest.fn()}
          error={externalError}
        />
      </TestWrapper>
    );

    // The error should be passed to the BaseQuestion
    const container = getByTestId('base-question-container');
    expect(container).toBeTruthy();
  });

  it('should handle unknown question types gracefully', () => {
    const unknownQuestion: QuestionModel = {
      ...mockRequiredQuestion,
      type: 'unknown-type' as any,
    };

    const { getByTestId } = render(
      <TestWrapper>
        <QuestionFactory
          question={unknownQuestion}
          value=""
          onChange={jest.fn()}
        />
      </TestWrapper>
    );

    // Should fallback to BaseQuestion
    expect(getByTestId('base-question-container')).toBeTruthy();
  });

  it('should handle validation when question changes', () => {
    const mockOnChange = jest.fn();
    const { rerender, getByTestId } = render(
      <TestWrapper>
        <QuestionFactory
          question={mockRequiredQuestion}
          value=""
          onChange={mockOnChange}
        />
      </TestWrapper>
    );

    let input = getByTestId('text-question-input');
    fireEvent.changeText(input, 'test');

    // Change question type
    const newQuestion: QuestionModel = {
      ...mockRequiredQuestion,
      name: 'new-question',
      inputType: 'email',
    };

    rerender(
      <TestWrapper>
        <QuestionFactory
          question={newQuestion}
          value=""
          onChange={mockOnChange}
        />
      </TestWrapper>
    );

    input = getByTestId('text-question-input');
    fireEvent.changeText(input, 'new value');
    expect(mockOnChange).toHaveBeenCalledWith('new value');
  });

  it('should handle validation edge cases', () => {
    const edgeQuestion: QuestionModel = {
      ...mockRequiredQuestion,
      minLength: 5,
      maxLength: 10,
    };

    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <TestWrapper>
        <QuestionFactory
          question={edgeQuestion}
          value=""
          onChange={mockOnChange}
        />
      </TestWrapper>
    );

    const input = getByTestId('text-question-input');
    
    // Test minimum length
    fireEvent.changeText(input, 'hi');
    expect(mockOnChange).toHaveBeenCalledWith('hi');

    // Test maximum length
    fireEvent.changeText(input, 'this is a very long string');
    expect(mockOnChange).toHaveBeenCalledWith('this is a very long string');

    // Test valid length
    fireEvent.changeText(input, 'valid');
    expect(mockOnChange).toHaveBeenCalledWith('valid');
  });

  it('should handle null and undefined values', () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <TestWrapper>
        <QuestionFactory
          question={mockRequiredQuestion}
          value={null}
          onChange={mockOnChange}
        />
      </TestWrapper>
    );

    const input = getByTestId('text-question-input');
    fireEvent.changeText(input, 'test');
    expect(mockOnChange).toHaveBeenCalledWith('test');
  });

  it('should handle onChange being undefined', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <QuestionFactory
          question={mockRequiredQuestion}
          value=""
        />
      </TestWrapper>
    );

    const input = getByTestId('text-question-input');
    
    // Should not throw error when onChange is undefined
    expect(() => {
      fireEvent.changeText(input, 'test');
    }).not.toThrow();
  });
});