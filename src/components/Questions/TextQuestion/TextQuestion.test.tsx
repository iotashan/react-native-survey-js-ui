import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TextQuestion } from './TextQuestion';
import type { QuestionModel } from '../../../types';

describe('TextQuestion Component', () => {
  const mockQuestion: QuestionModel = {
    name: 'q1',
    type: 'text',
    title: 'What is your name?',
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { getByTestId } = render(
      <TextQuestion question={mockQuestion} onChange={mockOnChange} />
    );
    expect(getByTestId('text-question-container')).toBeTruthy();
  });

  it('should display question in BaseQuestion wrapper', () => {
    const { getByText } = render(
      <TextQuestion question={mockQuestion} onChange={mockOnChange} />
    );
    expect(getByText('What is your name?')).toBeTruthy();
  });

  it('should render TextInput with correct placeholder', () => {
    const { getByPlaceholderText } = render(
      <TextQuestion
        question={{ ...mockQuestion, placeholder: 'Enter your name' }}
        onChange={mockOnChange}
      />
    );
    expect(getByPlaceholderText('Enter your name')).toBeTruthy();
  });

  it('should use default placeholder when not provided', () => {
    const { getByPlaceholderText } = render(
      <TextQuestion question={mockQuestion} onChange={mockOnChange} />
    );
    expect(getByPlaceholderText('Enter your answer')).toBeTruthy();
  });

  it('should call onChange when text changes', () => {
    const { getByTestId } = render(
      <TextQuestion question={mockQuestion} onChange={mockOnChange} />
    );
    const input = getByTestId('text-question-input');
    
    fireEvent.changeText(input, 'John Doe');
    
    expect(mockOnChange).toHaveBeenCalledWith('John Doe');
  });

  it('should display current value', () => {
    const { getByTestId } = render(
      <TextQuestion
        question={mockQuestion}
        value="Current Value"
        onChange={mockOnChange}
      />
    );
    const input = getByTestId('text-question-input');
    
    expect(input.props.value).toBe('Current Value');
  });

  it('should be editable when not read-only', () => {
    const { getByTestId } = render(
      <TextQuestion question={mockQuestion} onChange={mockOnChange} />
    );
    const input = getByTestId('text-question-input');
    
    expect(input.props.editable).toBe(true);
  });

  it('should be non-editable when read-only', () => {
    const { getByTestId } = render(
      <TextQuestion
        question={{ ...mockQuestion, readOnly: true }}
        onChange={mockOnChange}
      />
    );
    const input = getByTestId('text-question-input');
    
    expect(input.props.editable).toBe(false);
  });

  it('should pass error to BaseQuestion', () => {
    const { getByText } = render(
      <TextQuestion
        question={mockQuestion}
        onChange={mockOnChange}
        error="This field is required"
      />
    );
    expect(getByText('This field is required')).toBeTruthy();
  });

  describe('Input Types', () => {
    it('should set keyboard type for email input', () => {
      const { getByTestId } = render(
        <TextQuestion
          question={{ ...mockQuestion, inputType: 'email' }}
          onChange={mockOnChange}
        />
      );
      const input = getByTestId('text-question-input');
      
      expect(input.props.keyboardType).toBe('email-address');
    });

    it('should set keyboard type for number input', () => {
      const { getByTestId } = render(
        <TextQuestion
          question={{ ...mockQuestion, inputType: 'number' }}
          onChange={mockOnChange}
        />
      );
      const input = getByTestId('text-question-input');
      
      expect(input.props.keyboardType).toBe('numeric');
    });

    it('should set keyboard type for tel input', () => {
      const { getByTestId } = render(
        <TextQuestion
          question={{ ...mockQuestion, inputType: 'tel' }}
          onChange={mockOnChange}
        />
      );
      const input = getByTestId('text-question-input');
      
      expect(input.props.keyboardType).toBe('phone-pad');
    });

    it('should set keyboard type for url input', () => {
      const { getByTestId } = render(
        <TextQuestion
          question={{ ...mockQuestion, inputType: 'url' }}
          onChange={mockOnChange}
        />
      );
      const input = getByTestId('text-question-input');
      
      expect(input.props.keyboardType).toBe('url');
    });

    it('should use default keyboard for unknown input types', () => {
      const { getByTestId } = render(
        <TextQuestion
          question={{ ...mockQuestion, inputType: 'custom' }}
          onChange={mockOnChange}
        />
      );
      const input = getByTestId('text-question-input');
      
      expect(input.props.keyboardType).toBe('default');
    });
  });

  describe('Multiline Support', () => {
    it('should render single line input by default', () => {
      const { getByTestId } = render(
        <TextQuestion question={mockQuestion} onChange={mockOnChange} />
      );
      const input = getByTestId('text-question-input');
      
      expect(input.props.multiline).toBe(false);
    });

    it('should render multiline input for comment type', () => {
      const { getByTestId } = render(
        <TextQuestion
          question={{ ...mockQuestion, type: 'comment' }}
          onChange={mockOnChange}
        />
      );
      const input = getByTestId('text-question-input');
      
      expect(input.props.multiline).toBe(true);
      expect(input.props.numberOfLines).toBe(4);
    });
  });

  describe('Accessibility', () => {
    it('should have accessibility label', () => {
      const { getByTestId } = render(
        <TextQuestion question={mockQuestion} onChange={mockOnChange} />
      );
      const input = getByTestId('text-question-input');
      
      expect(input.props.accessibilityLabel).toBe('What is your name?');
    });

    it('should indicate required state in accessibility', () => {
      const { getByTestId } = render(
        <TextQuestion
          question={{ ...mockQuestion, isRequired: true }}
          onChange={mockOnChange}
        />
      );
      const input = getByTestId('text-question-input');
      
      expect(input.props.accessibilityHint).toBe('Required field');
    });
  });
});