import * as React from 'react';
import { render } from '@testing-library/react-native';
import { ValidationError } from '../ValidationError';
import { BaseQuestion } from '../../Questions/BaseQuestion/BaseQuestion';
import type { ValidationError as ValidationErrorType } from '../../../hooks/usePageValidation';

// Mock question for BaseQuestion integration
const mockQuestion = {
  name: 'test-question',
  title: 'Test Question',
  isRequired: true,
  visible: true,
  readOnly: false,
  description: 'Test description',
};

describe('ValidationError Integration Tests', () => {
  const mockErrors: ValidationErrorType[] = [
    {
      questionName: 'test-question',
      message: 'This field is required',
      ruleType: 'required',
    },
    {
      questionName: 'test-question',
      message: 'Please enter a valid email',
      ruleType: 'format',
    },
  ];

  describe('BaseQuestion Integration', () => {
    it('integrates with BaseQuestion error display', () => {
      const { getAllByText, getByTestId } = render(
        <BaseQuestion question={mockQuestion} error="This field is required">
          <ValidationError errors={[mockErrors[0]]} />
        </BaseQuestion>
      );

      // Check that both BaseQuestion error and ValidationError are rendered
      const errorTexts = getAllByText('This field is required');
      expect(errorTexts).toHaveLength(2); // One from BaseQuestion, one from ValidationError
      expect(getByTestId('validation-error-container')).toBeTruthy();
    });

    it('handles multiple errors in BaseQuestion context', () => {
      const { getByText } = render(
        <BaseQuestion question={mockQuestion}>
          <ValidationError errors={mockErrors} />
        </BaseQuestion>
      );

      expect(getByText('This field is required')).toBeTruthy();
      expect(getByText('Please enter a valid email')).toBeTruthy();
    });
  });

  describe('Real-world Usage Patterns', () => {
    it('handles validation state changes correctly', () => {
      const { rerender, getByText, queryByTestId } = render(
        <ValidationError errors={[]} />
      );

      // Initially no errors
      expect(queryByTestId('validation-error-container')).toBeFalsy();

      // Add error
      rerender(<ValidationError errors={[mockErrors[0]]} />);
      expect(getByText('This field is required')).toBeTruthy();

      // Clear error
      rerender(<ValidationError errors={[]} />);
      expect(queryByTestId('validation-error-container')).toBeFalsy();
    });

    it('handles error message updates', () => {
      const initialError: ValidationErrorType = {
        questionName: 'test',
        message: 'Initial error',
        ruleType: 'custom',
      };

      const updatedError: ValidationErrorType = {
        questionName: 'test',
        message: 'Updated error',
        ruleType: 'custom',
      };

      const { rerender, getByText, queryByText } = render(
        <ValidationError errors={[initialError]} />
      );

      expect(getByText('Initial error')).toBeTruthy();

      rerender(<ValidationError errors={[updatedError]} />);
      expect(queryByText('Initial error')).toBeFalsy();
      expect(getByText('Updated error')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles malformed error objects gracefully', () => {
      const malformedErrors = [
        { questionName: 'test', message: 'Valid error' },
        { questionName: 'test' }, // Missing message
        { message: 'Missing question name' }, // Missing questionName
        null,
        undefined,
        'string instead of object',
        { questionName: 'test', message: '' }, // Empty message
        { questionName: 'test', message: '   ' }, // Whitespace only
      ] as any;

      const { getByText, queryByText } = render(
        <ValidationError errors={malformedErrors} />
      );

      // Only the valid error should be rendered
      expect(getByText('Valid error')).toBeTruthy();
      expect(queryByText('')).toBeFalsy();
    });

    it('handles rapidly changing error states', () => {
      const { rerender, getByText, queryByTestId } = render(
        <ValidationError errors={[]} />
      );

      // Rapid state changes
      for (let i = 0; i < 5; i++) {
        rerender(<ValidationError errors={mockErrors} />);
        expect(getByText('This field is required')).toBeTruthy();
        
        rerender(<ValidationError errors={[]} />);
        expect(queryByTestId('validation-error-container')).toBeFalsy();
      }
    });
  });

  describe('Performance Validation', () => {
    it('renders large numbers of errors efficiently', () => {
      const manyErrors: ValidationErrorType[] = Array.from({ length: 50 }, (_, i) => ({
        questionName: 'test',
        message: `Error message ${i + 1}`,
        ruleType: 'custom',
      }));

      const { getByText, getByTestId } = render(
        <ValidationError errors={manyErrors} />
      );

      expect(getByTestId('validation-error-container')).toBeTruthy();
      expect(getByText('Error message 1')).toBeTruthy();
      expect(getByText('Error message 50')).toBeTruthy();
    });
  });
});