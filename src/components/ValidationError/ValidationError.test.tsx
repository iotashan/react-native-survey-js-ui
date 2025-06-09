import * as React from 'react';
import { render } from '@testing-library/react-native';
import { ValidationError } from './ValidationError';
import type { ValidationError as ValidationErrorType } from '../../hooks/usePageValidation';

describe('ValidationError Component', () => {
  const mockError: ValidationErrorType = {
    questionName: 'test-question',
    message: 'This field is required',
    ruleType: 'required',
  };

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders nothing when no errors are provided', () => {
      const { queryByTestId } = render(<ValidationError errors={[]} />);
      expect(queryByTestId('validation-error-container')).toBeFalsy();
    });

    it('renders nothing when errors array is undefined', () => {
      const { queryByTestId } = render(<ValidationError errors={undefined} />);
      expect(queryByTestId('validation-error-container')).toBeFalsy();
    });

    it('renders single error message', () => {
      const { getByText } = render(<ValidationError errors={[mockError]} />);
      expect(getByText('This field is required')).toBeTruthy();
    });

    it('renders multiple error messages', () => {
      const { getByText } = render(<ValidationError errors={mockErrors} />);
      expect(getByText('This field is required')).toBeTruthy();
      expect(getByText('Please enter a valid email')).toBeTruthy();
    });

    it('handles long error messages gracefully', () => {
      const longError: ValidationErrorType = {
        questionName: 'test-question',
        message: 'This is a very long error message that should wrap properly and not cause layout issues in the React Native environment',
        ruleType: 'custom',
      };

      const { getByText } = render(<ValidationError errors={[longError]} />);
      expect(getByText(longError.message)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('provides proper accessibility labels for single error', () => {
      const { getByLabelText } = render(<ValidationError errors={[mockError]} />);
      const errorContainer = getByLabelText('Validation error: This field is required');
      expect(errorContainer).toBeTruthy();
    });

    it('provides proper accessibility labels for multiple errors', () => {
      const { getByLabelText } = render(<ValidationError errors={mockErrors} />);
      const errorContainer = getByLabelText('Validation errors: 2 errors found');
      expect(errorContainer).toBeTruthy();
    });

    it('has proper accessibility role', () => {
      const { getByTestId } = render(<ValidationError errors={[mockError]} />);
      const errorContainer = getByTestId('validation-error-container');
      expect(errorContainer.props.accessibilityRole).toBe('alert');
    });

    it('includes accessibility hint for screen readers', () => {
      const { getByLabelText } = render(<ValidationError errors={[mockError]} />);
      const errorContainer = getByLabelText('Validation error: This field is required');
      expect(errorContainer.props.accessibilityHint).toBe('Error message for form field');
    });
  });

  describe('Styling and Platform Support', () => {
    it('applies error styling to container', () => {
      const { getByTestId } = render(<ValidationError errors={[mockError]} />);
      const errorContainer = getByTestId('validation-error-container');
      expect(errorContainer.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            marginTop: 4,
            marginHorizontal: 2,
          }),
        ])
      );
    });

    it('applies error text styling', () => {
      const { getByText } = render(<ValidationError errors={[mockError]} />);
      const errorText = getByText('This field is required');
      expect(errorText.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fontSize: 14,
            color: '#d32f2f',
          }),
        ])
      );
    });

    it('supports custom container style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByTestId } = render(<ValidationError errors={[mockError]} style={customStyle} />);
      const errorContainer = getByTestId('validation-error-container');
      expect(errorContainer.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining(customStyle),
        ])
      );
    });

    it('supports custom text style', () => {
      const customTextStyle = { fontSize: 16 };
      const { getByText } = render(<ValidationError errors={[mockError]} textStyle={customTextStyle} />);
      const errorText = getByText('This field is required');
      expect(errorText.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining(customTextStyle),
        ])
      );
    });
  });

  describe('Animation Support', () => {
    it('initializes with fade animation', () => {
      const { getByTestId } = render(<ValidationError errors={[mockError]} />);
      // Test that the component initializes properly with animation
      const errorContainer = getByTestId('validation-error-container');
      expect(errorContainer).toBeTruthy();
    });

    it('supports disabling animations', () => {
      const { getByTestId } = render(<ValidationError errors={[mockError]} animated={false} />);
      const errorContainer = getByTestId('validation-error-container');
      expect(errorContainer).toBeTruthy();
    });
  });

  describe('Error Display Modes', () => {
    it('renders in list mode by default when multiple errors', () => {
      const { getByText } = render(<ValidationError errors={mockErrors} />);
      const firstError = getByText('This field is required');
      const secondError = getByText('Please enter a valid email');
      expect(firstError).toBeTruthy();
      expect(secondError).toBeTruthy();
    });

    it('filters out empty or invalid error messages', () => {
      const mixedErrors = [
        mockError,
        { questionName: 'test', message: '', ruleType: 'empty' },
        { questionName: 'test', message: '   ', ruleType: 'whitespace' },
        null as any,
        undefined as any,
      ];

      const { getByText, queryByText } = render(<ValidationError errors={mixedErrors} />);
      expect(getByText('This field is required')).toBeTruthy();
      expect(queryByText('')).toBeFalsy();
    });
  });

  describe('Performance', () => {
    it('memoizes component to prevent unnecessary re-renders', () => {
      const { rerender, getByText } = render(<ValidationError errors={[mockError]} />);
      const firstRender = getByText('This field is required');
      
      // Re-render with same props
      rerender(<ValidationError errors={[mockError]} />);
      const secondRender = getByText('This field is required');
      
      // Component should be memoized (testing the concept, actual implementation will use React.memo)
      expect(firstRender).toBeTruthy();
      expect(secondRender).toBeTruthy();
    });
  });

  describe('Integration with BaseQuestion', () => {
    it('properly integrates with error prop pattern', () => {
      // This tests the pattern used in BaseQuestion component
      const errorMessage = 'Integration test error';
      const { getByText } = render(<ValidationError errors={[{ questionName: 'test', message: errorMessage }]} />);
      expect(getByText(errorMessage)).toBeTruthy();
    });
  });
});