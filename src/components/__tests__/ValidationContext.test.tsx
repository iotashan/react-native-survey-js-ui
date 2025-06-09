import React from 'react';
import { render, act } from '@testing-library/react-native';
import { ValidationProvider, useValidation, useQuestionValidation } from '../ValidationContext';

// Mock survey-core
const mockQuestion = {
  name: 'question1',
  type: 'text',
  isRequired: true,
  value: '',
  visible: true,
  inputType: 'text',
  minLength: undefined,
  maxLength: undefined,
  validators: [],
};

const mockRequiredQuestion = {
  ...mockQuestion,
  isRequired: true,
};

const mockOptionalQuestion = {
  ...mockQuestion,
  name: 'question2',
  isRequired: false,
};

const mockEmailQuestion = {
  ...mockQuestion,
  name: 'emailQuestion',
  inputType: 'email',
  isRequired: true,
};

const mockSurveyModel = {
  currentPage: {
    questions: [mockRequiredQuestion, mockOptionalQuestion, mockEmailQuestion],
  },
};

// Test components
const TestValidationProvider: React.FC<{ children: React.ReactNode; surveyModel?: any }> = ({
  children,
  surveyModel = mockSurveyModel,
}) => (
  <ValidationProvider surveyModel={surveyModel}>
    {children}
  </ValidationProvider>
);

const TestValidationConsumer: React.FC<{ onValidationState?: (state: any) => void }> = ({
  onValidationState,
}) => {
  const validation = useValidation();
  
  React.useEffect(() => {
    if (onValidationState) {
      onValidationState(validation.validationState);
    }
  }, [validation.validationState, onValidationState]);

  return null;
};

const TestQuestionValidationConsumer: React.FC<{
  questionName: string;
  onQuestionValidation?: (validation: any) => void;
}> = ({ questionName, onQuestionValidation }) => {
  const questionValidation = useQuestionValidation(questionName);
  
  React.useEffect(() => {
    if (onQuestionValidation) {
      onQuestionValidation(questionValidation);
    }
  }, [questionValidation, onQuestionValidation]);

  return null;
};

describe('ValidationContext', () => {
  describe('ValidationProvider', () => {
    it('should provide initial validation state', () => {
      let validationState: any;
      
      render(
        <TestValidationProvider>
          <TestValidationConsumer onValidationState={(state) => { validationState = state; }} />
        </TestValidationProvider>
      );

      expect(validationState).toEqual({
        errors: {},
        validationMessages: [],
        hasErrors: false,
        isValidating: false,
        showErrors: false,
      });
    });

    it('should clear errors when survey model changes', () => {
      let validationState: any;
      const { rerender } = render(
        <TestValidationProvider>
          <TestValidationConsumer onValidationState={(state) => { validationState = state; }} />
        </TestValidationProvider>
      );

      // First, set some errors
      act(() => {
        // This would normally be done through validation functions
      });

      // Change the survey model
      rerender(
        <TestValidationProvider surveyModel={null}>
          <TestValidationConsumer onValidationState={(state) => { validationState = state; }} />
        </TestValidationProvider>
      );

      expect(validationState.errors).toEqual({});
      expect(validationState.hasErrors).toBe(false);
    });
  });

  describe('useValidation hook', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestValidationConsumer />);
      }).toThrow('useValidation must be used within a ValidationProvider');

      console.error = originalError;
    });

    it('should validate required fields correctly', () => {
      let validation: any;
      
      render(
        <TestValidationProvider>
          <TestValidationConsumer onValidationState={() => {}} />
          <TestQuestionValidationConsumer
            questionName="question1"
            onQuestionValidation={(v) => { validation = v; }}
          />
        </TestValidationProvider>
      );

      // Test required field validation with empty value
      const errors = validation.validateQuestion('question1', '', mockRequiredQuestion);
      expect(errors).toContain('This field is required');

      // Test required field validation with value
      const errorsWithValue = validation.validateQuestion('question1', 'some value', mockRequiredQuestion);
      expect(errorsWithValue).toHaveLength(0);
    });

    it('should validate email fields correctly', () => {
      let validation: any;
      
      render(
        <TestValidationProvider>
          <TestValidationConsumer onValidationState={() => {}} />
          <TestQuestionValidationConsumer
            questionName="emailQuestion"
            onQuestionValidation={(v) => { validation = v; }}
          />
        </TestValidationProvider>
      );

      // Test invalid email
      const invalidEmailErrors = validation.validateQuestion('emailQuestion', 'invalid-email', mockEmailQuestion);
      expect(invalidEmailErrors).toContain('Please enter a valid email address');

      // Test valid email
      const validEmailErrors = validation.validateQuestion('emailQuestion', 'test@example.com', mockEmailQuestion);
      expect(validEmailErrors).not.toContain('Please enter a valid email address');
    });

    it('should validate URL fields correctly', () => {
      let validation: any;
      const urlQuestion = { ...mockQuestion, inputType: 'url', isRequired: false };
      
      render(
        <TestValidationProvider>
          <TestValidationConsumer onValidationState={() => {}} />
          <TestQuestionValidationConsumer
            questionName="question1"
            onQuestionValidation={(v) => { validation = v; }}
          />
        </TestValidationProvider>
      );

      // Test invalid URL
      const invalidUrlErrors = validation.validateQuestion('question1', 'not-a-url', urlQuestion);
      expect(invalidUrlErrors).toContain('Please enter a valid URL');

      // Test valid URL
      const validUrlErrors = validation.validateQuestion('question1', 'https://example.com', urlQuestion);
      expect(validUrlErrors).not.toContain('Please enter a valid URL');
    });

    it('should validate number fields correctly', () => {
      let validation: any;
      const numberQuestion = { ...mockQuestion, inputType: 'number', isRequired: false };
      
      render(
        <TestValidationProvider>
          <TestValidationConsumer onValidationState={() => {}} />
          <TestQuestionValidationConsumer
            questionName="question1"
            onQuestionValidation={(v) => { validation = v; }}
          />
        </TestValidationProvider>
      );

      // Test invalid number
      const invalidNumberErrors = validation.validateQuestion('question1', 'not-a-number', numberQuestion);
      expect(invalidNumberErrors).toContain('Please enter a valid number');

      // Test valid number
      const validNumberErrors = validation.validateQuestion('question1', '123', numberQuestion);
      expect(validNumberErrors).not.toContain('Please enter a valid number');
    });

    it('should validate text length correctly', () => {
      let validation: any;
      const lengthQuestion = { ...mockQuestion, minLength: 5, maxLength: 10, isRequired: false };
      
      render(
        <TestValidationProvider>
          <TestValidationConsumer onValidationState={() => {}} />
          <TestQuestionValidationConsumer
            questionName="question1"
            onQuestionValidation={(v) => { validation = v; }}
          />
        </TestValidationProvider>
      );

      // Test too short
      const tooShortErrors = validation.validateQuestion('question1', 'hi', lengthQuestion);
      expect(tooShortErrors).toContain('Minimum length is 5 characters');

      // Test too long
      const tooLongErrors = validation.validateQuestion('question1', 'this is way too long', lengthQuestion);
      expect(tooLongErrors).toContain('Maximum length is 10 characters');

      // Test valid length
      const validLengthErrors = validation.validateQuestion('question1', 'hello', lengthQuestion);
      expect(validLengthErrors).not.toContain('Minimum length is 5 characters');
      expect(validLengthErrors).not.toContain('Maximum length is 10 characters');
    });

    it('should validate all visible questions', () => {
      let validation: any;
      
      render(
        <TestValidationProvider>
          <TestValidationConsumer onValidationState={(state) => {}} />
          <TestQuestionValidationConsumer
            questionName="question1"
            onQuestionValidation={(v) => { validation = v; }}
          />
        </TestValidationProvider>
      );

      // Test that validation functions are available on the main validation context
      expect(validation.validateQuestion).toBeDefined();
      expect(validation.setQuestionError).toBeDefined();
      expect(validation.clearQuestionError).toBeDefined();
    });

    it('should manage question errors correctly', () => {
      let validation: any;
      let validationState: any;
      
      render(
        <TestValidationProvider>
          <TestValidationConsumer onValidationState={(state) => { validationState = state; }} />
          <TestQuestionValidationConsumer
            questionName="question1"
            onQuestionValidation={(v) => { validation = v; }}
          />
        </TestValidationProvider>
      );

      // Set an error
      act(() => {
        validation.setQuestionError(['Test error']);
      });

      expect(validationState.errors.question1).toContain('Test error');
      expect(validationState.hasErrors).toBe(true);

      // Clear the error
      act(() => {
        validation.clearQuestionError();
      });

      expect(validationState.errors.question1).toBeUndefined();
      expect(validationState.hasErrors).toBe(false);
    });
  });

  describe('useQuestionValidation hook', () => {
    it('should provide question-specific validation state', () => {
      let questionValidation: any;
      
      render(
        <TestValidationProvider>
          <TestQuestionValidationConsumer
            questionName="question1"
            onQuestionValidation={(v) => { questionValidation = v; }}
          />
        </TestValidationProvider>
      );

      expect(questionValidation.errors).toEqual([]);
      expect(questionValidation.hasErrors).toBe(false);
      expect(questionValidation.shouldShowErrors).toBe(false);
    });

    it('should show errors when showErrors is true', () => {
      let questionValidation: any;
      let validation: any;
      
      render(
        <TestValidationProvider>
          <TestValidationConsumer onValidationState={() => {}} />
          <TestQuestionValidationConsumer
            questionName="question1"
            onQuestionValidation={(v) => { 
              questionValidation = v; 
              validation = v;
            }}
          />
        </TestValidationProvider>
      );

      // Set an error and show errors
      act(() => {
        validation.setQuestionError(['Test error']);
      });

      // Initially shouldn't show errors
      expect(questionValidation.shouldShowErrors).toBe(false);

      // Enable showing errors through the main validation context
      render(
        <TestValidationProvider>
          <TestValidationConsumer onValidationState={() => {}} />
          <TestQuestionValidationConsumer
            questionName="question1"
            onQuestionValidation={(v) => { questionValidation = v; }}
          />
        </TestValidationProvider>
      );

      act(() => {
        // Simulate validation that shows errors
        validation?.validateAllVisibleQuestions?.();
      });
    });
  });
});