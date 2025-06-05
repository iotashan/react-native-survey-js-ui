import React from 'react';
import { render } from '@testing-library/react-native';
import { Text, StyleSheet } from 'react-native';
import { BaseQuestion } from './BaseQuestion';
import type { QuestionModel } from '../../../types';

describe('BaseQuestion Component', () => {
  const mockQuestion: QuestionModel = {
    name: 'q1',
    type: 'text',
    title: 'Test Question',
  };

  it('should render without crashing', () => {
    const { getByTestId } = render(<BaseQuestion question={mockQuestion} />);
    expect(getByTestId('base-question-container')).toBeTruthy();
  });

  it('should display question title', () => {
    const { getByText } = render(
      <BaseQuestion
        question={{
          ...mockQuestion,
          title: 'What is your name?',
        }}
      />
    );
    expect(getByText('What is your name?')).toBeTruthy();
  });

  describe('Required Field Handling', () => {
    it('should display required indicator when question is required', () => {
      const { getByText } = render(
        <BaseQuestion
          question={{
            ...mockQuestion,
            isRequired: true,
            title: 'Required Question',
          }}
        />
      );
      expect(getByText('*')).toBeTruthy();
    });

    it('should not display required indicator when question is not required', () => {
      const { queryByText } = render(
        <BaseQuestion
          question={{
            ...mockQuestion,
            isRequired: false,
            title: 'Optional Question',
          }}
        />
      );
      expect(queryByText('*')).toBeNull();
    });
  });

  describe('Description Handling', () => {
    it('should display description when provided', () => {
      const { getByText } = render(
        <BaseQuestion
          question={{
            ...mockQuestion,
            description: 'This is a helpful description',
          }}
        />
      );
      expect(getByText('This is a helpful description')).toBeTruthy();
    });

    it('should not display description when not provided', () => {
      const { queryByTestId } = render(
        <BaseQuestion question={mockQuestion} />
      );
      expect(queryByTestId('question-description')).toBeNull();
    });
  });

  describe('Visibility Handling', () => {
    it('should render when visible is true', () => {
      const { getByTestId } = render(
        <BaseQuestion
          question={{
            ...mockQuestion,
            visible: true,
          }}
        />
      );
      expect(getByTestId('base-question-container')).toBeTruthy();
    });

    it('should not render when visible is false', () => {
      const { queryByTestId } = render(
        <BaseQuestion
          question={{
            ...mockQuestion,
            visible: false,
          }}
        />
      );
      expect(queryByTestId('base-question-container')).toBeNull();
    });

    it('should render by default when visible is not specified', () => {
      const { getByTestId } = render(<BaseQuestion question={mockQuestion} />);
      expect(getByTestId('base-question-container')).toBeTruthy();
    });
  });

  describe('Validation Error Display', () => {
    it('should display validation errors when provided', () => {
      const { getByText } = render(
        <BaseQuestion question={mockQuestion} error="This field is required" />
      );
      expect(getByText('This field is required')).toBeTruthy();
    });

    it('should not display validation errors when not provided', () => {
      const { queryByTestId } = render(
        <BaseQuestion question={mockQuestion} />
      );
      expect(queryByTestId('question-error')).toBeNull();
    });

    it('should apply error styling when error is present', () => {
      const { getByTestId } = render(
        <BaseQuestion question={mockQuestion} error="Error message" />
      );
      const container = getByTestId('base-question-container');
      const flattenedStyle = StyleSheet.flatten(container.props.style);
      expect(flattenedStyle.borderColor).toBe('#d32f2f');
    });
  });

  describe('Read-only State', () => {
    it('should apply read-only styling when readOnly is true', () => {
      const { getByTestId } = render(
        <BaseQuestion
          question={{
            ...mockQuestion,
            readOnly: true,
          }}
        />
      );
      const container = getByTestId('base-question-container');
      const flattenedStyle = StyleSheet.flatten(container.props.style);
      expect(flattenedStyle.opacity).toBe(0.6);
      expect(flattenedStyle.backgroundColor).toBe('#f5f5f5');
    });
  });

  describe('Children Rendering', () => {
    it('should render children when provided', () => {
      const { getByText } = render(
        <BaseQuestion question={mockQuestion}>
          <Text>Child Content</Text>
        </BaseQuestion>
      );
      expect(getByText('Child Content')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility label', () => {
      const { getByTestId } = render(
        <BaseQuestion
          question={{
            ...mockQuestion,
            title: 'Accessible Question',
            isRequired: true,
          }}
        />
      );
      const container = getByTestId('base-question-container');
      expect(container.props.accessibilityLabel).toBe(
        'Accessible Question, required'
      );
    });

    it('should indicate read-only state in accessibility', () => {
      const { getByTestId } = render(
        <BaseQuestion
          question={{
            ...mockQuestion,
            title: 'Read-only Question',
            readOnly: true,
          }}
        />
      );
      const container = getByTestId('base-question-container');
      expect(container.props.accessibilityLabel).toBe(
        'Read-only Question, read-only'
      );
    });
  });
});
