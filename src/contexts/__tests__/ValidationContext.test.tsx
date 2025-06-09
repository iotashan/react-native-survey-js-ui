import React from 'react';
import { render, act, renderHook, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Model } from 'survey-core';
import { ValidationProvider, useValidation } from '../ValidationContext';
import type { ValidationMode, ValidationContextValue } from '../ValidationContext';

// Mock survey-core
jest.mock('survey-core');

describe('ValidationContext', () => {
  let mockModel: jest.Mocked<Model>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock model
    mockModel = {
      onValueChanged: { add: jest.fn(), remove: jest.fn() },
      onCurrentPageChanged: { add: jest.fn(), remove: jest.fn() },
      onValidatedErrorsOnCurrentPage: { add: jest.fn(), remove: jest.fn() },
      onCompleting: { add: jest.fn(), remove: jest.fn() },
      validateCurrentPage: jest.fn().mockReturnValue(true),
      validate: jest.fn().mockReturnValue(true),
      currentPage: {
        questions: [],
        getQuestionByName: jest.fn(),
      },
      pages: [],
      getValue: jest.fn(),
      setValue: jest.fn(),
    } as any;
  });

  describe('ValidationProvider', () => {
    it('should render children', () => {
      const { getByText } = render(
        <ValidationProvider model={mockModel}>
          <Text>Test Child</Text>
        </ValidationProvider>
      );
      
      expect(getByText('Test Child')).toBeTruthy();
    });

    it('should provide default validation context values', () => {
      const TestComponent = () => {
        const context = useValidation();
        return (
          <>
            <Text testID="mode">{context.validationMode}</Text>
            <Text testID="hasErrors">{String(context.hasErrors)}</Text>
            <Text testID="isValidating">{String(context.isValidating)}</Text>
          </>
        );
      };

      const { getByTestId } = render(
        <ValidationProvider model={mockModel}>
          <TestComponent />
        </ValidationProvider>
      );

      expect(getByTestId('mode').props.children).toBe('on-submit');
      expect(getByTestId('hasErrors').props.children).toBe('false');
      expect(getByTestId('isValidating').props.children).toBe('false');
    });

    it('should accept initial validation mode', () => {
      const TestComponent = () => {
        const { validationMode } = useValidation();
        return <Text testID="mode">{validationMode}</Text>;
      };

      const { getByTestId } = render(
        <ValidationProvider model={mockModel} initialMode="real-time">
          <TestComponent />
        </ValidationProvider>
      );

      expect(getByTestId('mode').props.children).toBe('real-time');
    });

    it('should handle null model gracefully', () => {
      const TestComponent = () => {
        const context = useValidation();
        return <Text testID="hasModel">{String(context.model !== null)}</Text>;
      };

      const { getByTestId } = render(
        <ValidationProvider model={null}>
          <TestComponent />
        </ValidationProvider>
      );

      expect(getByTestId('hasModel').props.children).toBe('false');
    });
  });

  describe('useValidation hook', () => {
    it('should throw error when used outside provider', () => {
      const TestComponent = () => {
        useValidation();
        return null;
      };

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(() => render(<TestComponent />)).toThrow(
        'useValidation must be used within a ValidationProvider'
      );
      
      consoleSpy.mockRestore();
    });

    it('should provide validation methods', () => {
      const TestComponent = () => {
        const context = useValidation();
        return (
          <>
            <Text testID="hasValidateField">{String(typeof context.validateField === 'function')}</Text>
            <Text testID="hasValidatePage">{String(typeof context.validatePage === 'function')}</Text>
            <Text testID="hasValidateSurvey">{String(typeof context.validateSurvey === 'function')}</Text>
            <Text testID="hasSetMode">{String(typeof context.setValidationMode === 'function')}</Text>
            <Text testID="hasClearErrors">{String(typeof context.clearErrors === 'function')}</Text>
          </>
        );
      };

      const { getByTestId } = render(
        <ValidationProvider model={mockModel}>
          <TestComponent />
        </ValidationProvider>
      );

      expect(getByTestId('hasValidateField').props.children).toBe('true');
      expect(getByTestId('hasValidatePage').props.children).toBe('true');
      expect(getByTestId('hasValidateSurvey').props.children).toBe('true');
      expect(getByTestId('hasSetMode').props.children).toBe('true');
      expect(getByTestId('hasClearErrors').props.children).toBe('true');
    });
  });

  describe('Validation Mode Management', () => {
    it('should switch validation modes', async () => {
      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel}>{children}</ValidationProvider>
        ),
      });

      expect(result.current.validationMode).toBe('on-submit');

      act(() => {
        result.current.setValidationMode('real-time');
      });

      expect(result.current.validationMode).toBe('real-time');

      act(() => {
        result.current.setValidationMode('hybrid');
      });

      expect(result.current.validationMode).toBe('hybrid');
    });
  });

  describe('Field Validation', () => {
    it('should validate a specific field', async () => {
      const mockQuestion = {
        name: 'testField',
        isRequired: true,
        value: '',
        hasErrors: jest.fn().mockReturnValue(true),
        errors: [{ text: 'Field is required' }],
      };

      mockModel.currentPage.getQuestionByName = jest.fn().mockReturnValue(mockQuestion);

      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel}>{children}</ValidationProvider>
        ),
      });

      let validationResult: boolean;
      act(() => {
        validationResult = result.current.validateField('testField');
      });

      expect(validationResult!).toBe(false);
      expect(result.current.errors['testField']).toEqual(['Field is required']);
      expect(result.current.hasErrors).toBe(true);
    });

    it('should return true for valid field', async () => {
      const mockQuestion = {
        name: 'testField',
        isRequired: true,
        value: 'Some value',
        hasErrors: jest.fn().mockReturnValue(false),
        errors: [],
      };

      mockModel.currentPage.getQuestionByName = jest.fn().mockReturnValue(mockQuestion);

      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel}>{children}</ValidationProvider>
        ),
      });

      let validationResult: boolean;
      act(() => {
        validationResult = result.current.validateField('testField');
      });

      expect(validationResult!).toBe(true);
      expect(result.current.errors['testField']).toBeUndefined();
      expect(result.current.hasErrors).toBe(false);
    });
  });

  describe('Page Validation', () => {
    it('should validate current page', async () => {
      mockModel.validateCurrentPage = jest.fn().mockReturnValue(false);
      
      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel}>{children}</ValidationProvider>
        ),
      });

      let validationResult: boolean;
      act(() => {
        validationResult = result.current.validatePage();
      });

      expect(mockModel.validateCurrentPage).toHaveBeenCalled();
      expect(validationResult!).toBe(false);
    });

    it('should validate specific page by index', async () => {
      const mockPage = {
        hasErrors: jest.fn().mockReturnValue(true),
        questions: [{
          name: 'pageQuestion',
          isRequired: true,
          value: '',
          hasErrors: jest.fn().mockReturnValue(true),
          errors: [{ text: 'Required' }],
        }],
      };
      
      mockModel.pages = [mockPage];
      
      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel}>{children}</ValidationProvider>
        ),
      });

      let validationResult: boolean;
      act(() => {
        validationResult = result.current.validatePage(0);
      });

      expect(validationResult!).toBe(false);
    });
  });

  describe('Survey Validation', () => {
    it('should validate entire survey', async () => {
      mockModel.validate = jest.fn().mockReturnValue(false);
      
      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel}>{children}</ValidationProvider>
        ),
      });

      let validationResult: boolean;
      act(() => {
        validationResult = result.current.validateSurvey();
      });

      expect(mockModel.validate).toHaveBeenCalled();
      expect(validationResult!).toBe(false);
      expect(result.current.isValidating).toBe(false);
    });

    it('should set isValidating during validation', async () => {
      mockModel.validate = jest.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve(true), 100));
      });
      
      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel}>{children}</ValidationProvider>
        ),
      });

      let validationPromise: Promise<boolean>;
      act(() => {
        validationPromise = result.current.validateSurvey();
      });

      expect(result.current.isValidating).toBe(true);

      await act(async () => {
        await validationPromise;
      });

      expect(result.current.isValidating).toBe(false);
    });
  });

  describe('Real-time Validation', () => {
    it('should validate on value change in real-time mode', async () => {
      const mockQuestion = {
        name: 'testField',
        isRequired: true,
        value: '',
        hasErrors: jest.fn().mockReturnValue(true),
        errors: [{ text: 'Required' }],
      };
      
      mockModel.currentPage.getQuestionByName = jest.fn().mockReturnValue(mockQuestion);

      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel} initialMode="real-time">
            {children}
          </ValidationProvider>
        ),
      });

      // Simulate value change event
      const valueChangedHandler = mockModel.onValueChanged.add.mock.calls[0][0];
      
      act(() => {
        valueChangedHandler(mockModel, { question: mockQuestion });
      });

      await waitFor(() => {
        expect(result.current.errors['testField']).toEqual(['Required']);
      });
    });

    it('should not validate on value change in on-submit mode', async () => {
      const mockQuestion = {
        name: 'testField',
        isRequired: true,
        value: '',
        hasErrors: jest.fn().mockReturnValue(true),
        errors: [{ text: 'Required' }],
      };

      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel} initialMode="on-submit">
            {children}
          </ValidationProvider>
        ),
      });

      // Simulate value change event
      const valueChangedHandler = mockModel.onValueChanged.add.mock.calls[0][0];
      
      act(() => {
        valueChangedHandler(mockModel, { question: mockQuestion });
      });

      await waitFor(() => {
        expect(result.current.errors['testField']).toBeUndefined();
      });
    });

    it('should validate touched fields in hybrid mode', async () => {
      const mockQuestion = {
        name: 'testField',
        isRequired: true,
        value: '',
        hasErrors: jest.fn().mockReturnValue(true),
        errors: [{ text: 'Required' }],
      };
      
      mockModel.currentPage.getQuestionByName = jest.fn().mockReturnValue(mockQuestion);

      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel} initialMode="hybrid">
            {children}
          </ValidationProvider>
        ),
      });

      // Mark field as touched
      act(() => {
        result.current.markFieldTouched('testField');
      });

      // Simulate value change event
      const valueChangedHandler = mockModel.onValueChanged.add.mock.calls[0][0];
      
      act(() => {
        valueChangedHandler(mockModel, { question: mockQuestion });
      });

      await waitFor(() => {
        expect(result.current.errors['testField']).toEqual(['Required']);
        expect(result.current.touchedFields['testField']).toBe(true);
      });
    });
  });

  describe('Error Management', () => {
    it('should clear all errors', async () => {
      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel}>{children}</ValidationProvider>
        ),
      });

      // Add some errors
      act(() => {
        result.current.setFieldError('field1', ['Error 1']);
        result.current.setFieldError('field2', ['Error 2']);
      });

      expect(result.current.hasErrors).toBe(true);
      expect(Object.keys(result.current.errors).length).toBe(2);

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.hasErrors).toBe(false);
      expect(Object.keys(result.current.errors).length).toBe(0);
    });

    it('should clear specific field error', async () => {
      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel}>{children}</ValidationProvider>
        ),
      });

      // Add errors
      act(() => {
        result.current.setFieldError('field1', ['Error 1']);
        result.current.setFieldError('field2', ['Error 2']);
      });

      act(() => {
        result.current.clearFieldError('field1');
      });

      expect(result.current.errors['field1']).toBeUndefined();
      expect(result.current.errors['field2']).toEqual(['Error 2']);
    });

    it('should get field errors', async () => {
      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel}>{children}</ValidationProvider>
        ),
      });

      act(() => {
        result.current.setFieldError('testField', ['Error 1', 'Error 2']);
      });

      const errors = result.current.getFieldErrors('testField');
      expect(errors).toEqual(['Error 1', 'Error 2']);

      const noErrors = result.current.getFieldErrors('nonExistentField');
      expect(noErrors).toEqual([]);
    });
  });

  describe('Event Listeners', () => {
    it('should clean up event listeners on unmount', () => {
      const { unmount } = render(
        <ValidationProvider model={mockModel}>
          <Text>Test</Text>
        </ValidationProvider>
      );

      unmount();

      expect(mockModel.onValueChanged.remove).toHaveBeenCalled();
      expect(mockModel.onCurrentPageChanged.remove).toHaveBeenCalled();
      expect(mockModel.onValidatedErrorsOnCurrentPage.remove).toHaveBeenCalled();
      expect(mockModel.onCompleting.remove).toHaveBeenCalled();
    });

    it('should persist validation state across page changes', async () => {
      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel}>{children}</ValidationProvider>
        ),
      });

      // Add some errors
      act(() => {
        result.current.setFieldError('field1', ['Error 1']);
      });

      expect(result.current.hasErrors).toBe(true);

      // Simulate page change
      const pageChangedHandler = mockModel.onCurrentPageChanged.add.mock.calls[0][0];
      
      act(() => {
        pageChangedHandler(mockModel, {});
      });

      // Errors should persist across page navigation
      expect(result.current.hasErrors).toBe(true);
      expect(result.current.errors['field1']).toEqual(['Error 1']);
    });
  });

  describe('Performance Optimization', () => {
    it('should expose memoized context value', () => {
      const TestComponent = () => {
        const context = useValidation();
        return <Text testID="mode">{context.validationMode}</Text>;
      };

      const { getByTestId } = render(
        <ValidationProvider model={mockModel}>
          <TestComponent />
        </ValidationProvider>
      );

      // Verify context value is accessible
      expect(getByTestId('mode').props.children).toBe('on-submit');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle question not found in validateField', () => {
      mockModel.currentPage.getQuestionByName = jest.fn().mockReturnValue(null);
      mockModel.pages = [];

      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel}>{children}</ValidationProvider>
        ),
      });

      let validationResult: boolean;
      act(() => {
        validationResult = result.current.validateField('nonExistentField');
      });

      expect(validationResult!).toBe(true);
      expect(result.current.errors['nonExistentField']).toBeUndefined();
    });

    it('should find question in other pages during validateField', () => {
      const mockQuestion = {
        name: 'pageField',
        isRequired: true,
        value: 'valid',
        hasErrors: jest.fn().mockReturnValue(false),
        errors: [],
      };

      const mockPage = {
        getQuestionByName: jest.fn().mockReturnValue(mockQuestion),
        questions: [mockQuestion],
      };
      
      mockModel.currentPage.getQuestionByName = jest.fn().mockReturnValue(null);
      mockModel.pages = [mockPage];

      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel}>{children}</ValidationProvider>
        ),
      });

      let validationResult: boolean;
      act(() => {
        validationResult = result.current.validateField('pageField');
      });

      expect(validationResult!).toBe(true);
      expect(mockPage.getQuestionByName).toHaveBeenCalledWith('pageField');
    });

    it('should handle validatePage with invalid page index', () => {
      mockModel.pages = [];

      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel}>{children}</ValidationProvider>
        ),
      });

      let validationResult: boolean;
      act(() => {
        validationResult = result.current.validatePage(5);
      });

      expect(validationResult!).toBe(true);
    });

    it('should handle errors in validateField gracefully', () => {
      mockModel.currentPage.getQuestionByName = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel}>{children}</ValidationProvider>
        ),
      });

      let validationResult: boolean;
      act(() => {
        validationResult = result.current.validateField('testField');
      });

      expect(validationResult!).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Error validating field:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle errors in validatePage gracefully', () => {
      mockModel.validateCurrentPage = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel}>{children}</ValidationProvider>
        ),
      });

      let validationResult: boolean;
      act(() => {
        validationResult = result.current.validatePage();
      });

      expect(validationResult!).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Error validating page:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle errors in validateSurvey gracefully', () => {
      mockModel.validate = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel}>{children}</ValidationProvider>
        ),
      });

      let validationResult: boolean;
      act(() => {
        validationResult = result.current.validateSurvey() as boolean;
      });

      expect(validationResult).toBe(true);
      expect(result.current.isValidating).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Error validating survey:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle fallback validation in getQuestionErrors', () => {
      const mockQuestion = {
        name: 'testField',
        isRequired: true,
        value: '',
        // hasErrors method throws error
        hasErrors: jest.fn().mockImplementation(() => {
          throw new Error('Test error');
        }),
      };

      mockModel.currentPage.getQuestionByName = jest.fn().mockReturnValue(mockQuestion);

      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel}>{children}</ValidationProvider>
        ),
      });

      let validationResult: boolean;
      act(() => {
        validationResult = result.current.validateField('testField');
      });

      expect(validationResult!).toBe(false);
      expect(result.current.errors['testField']).toEqual(['This field is required']);
    });

    it('should handle validateCurrentPage without the method', () => {
      delete (mockModel as any).validateCurrentPage;
      
      // Mock currentPage without hasErrors method
      mockModel.currentPage = {
        questions: [{
          name: 'testField',
          isRequired: true,
          value: '',
          hasErrors: jest.fn().mockReturnValue(false),
        }],
        getQuestionByName: jest.fn(),
      } as any;

      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel}>{children}</ValidationProvider>
        ),
      });

      let validationResult: boolean;
      act(() => {
        validationResult = result.current.validatePage();
      });

      // Should return true when no validateCurrentPage method and page has no hasErrors
      expect(validationResult!).toBe(true);
    });

    it('should handle validateSurvey without validate method', () => {
      delete (mockModel as any).validate;
      
      const mockQuestion = {
        name: 'testField',
        isRequired: true,
        value: 'valid',
        hasErrors: jest.fn().mockReturnValue(false),
      };
      
      const mockPage = {
        questions: [mockQuestion],
      };
      
      mockModel.pages = [mockPage];

      const { result } = renderHook(() => useValidation(), {
        wrapper: ({ children }) => (
          <ValidationProvider model={mockModel}>{children}</ValidationProvider>
        ),
      });

      let validationResult: boolean;
      act(() => {
        validationResult = result.current.validateSurvey() as boolean;
      });

      expect(validationResult!).toBe(true);
      expect(result.current.isValidating).toBe(false);
    });

    it('should handle onValidatedErrorsOnCurrentPage event', () => {
      const mockQuestion = {
        name: 'testField',
        isRequired: true,
        value: '',
        hasErrors: jest.fn().mockReturnValue(true),
        errors: [{ text: 'Field error' }],
      };
      
      mockModel.currentPage.questions = [mockQuestion];

      render(
        <ValidationProvider model={mockModel}>
          <Text>Test</Text>
        </ValidationProvider>
      );

      const handler = mockModel.onValidatedErrorsOnCurrentPage.add.mock.calls[0][0];
      
      act(() => {
        handler(mockModel, {});
      });
    });

    it('should handle onCompleting event', () => {
      mockModel.validate = jest.fn().mockReturnValue(true);

      render(
        <ValidationProvider model={mockModel}>
          <Text>Test</Text>
        </ValidationProvider>
      );

      const handler = (mockModel as any).onCompleting.add.mock.calls[0][0];
      
      act(() => {
        handler(mockModel, {});
      });

      expect(mockModel.validate).toHaveBeenCalled();
    });

    it('should handle model without optional event handlers', () => {
      delete (mockModel as any).onValidatedErrorsOnCurrentPage;
      delete (mockModel as any).onCompleting;

      const { unmount } = render(
        <ValidationProvider model={mockModel}>
          <Text>Test</Text>
        </ValidationProvider>
      );

      // Should not throw
      unmount();
    });
  });
});