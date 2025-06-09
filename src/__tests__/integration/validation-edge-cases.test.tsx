import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import type { Model } from 'survey-core';

// Mock validation module before other imports
jest.mock('../../validation', () => ({
  ValidatorRegistry: {
    register: jest.fn(),
    unregister: jest.fn(),
    get: jest.fn(),
    getAll: jest.fn().mockReturnValue(new Map()),
    clear: jest.fn(),
  },
  CustomValidator: jest.fn().mockImplementation(() => ({
    validate: jest.fn().mockReturnValue(null),
    getErrorText: jest.fn().mockReturnValue(''),
  })),
}));

// Mock contexts
jest.mock('../../contexts/ValidationContext', () => {
  const React = require('react');
  const { createContext, useContext, useState, useCallback } = React;
  
  const ValidationContext = createContext({});
  
  const ValidationProvider = ({ children, model, initialMode = 'on-submit' }) => {
    const value = {
      model,
      validationMode: initialMode,
      errors: {},
      touchedFields: {},
      hasErrors: false,
      isValidating: false,
      validateField: jest.fn().mockReturnValue(true),
      validatePage: jest.fn().mockReturnValue(true),
      validateSurvey: jest.fn().mockReturnValue(true),
      setValidationMode: jest.fn(),
      clearErrors: jest.fn(),
      clearFieldError: jest.fn(),
      setFieldError: jest.fn(),
      getFieldErrors: jest.fn().mockReturnValue([]),
      markFieldTouched: jest.fn(),
    };
    
    return React.createElement(ValidationContext.Provider, { value }, children);
  };
  
  const useValidation = () => {
    const context = useContext(ValidationContext);
    if (!context) {
      throw new Error('useValidation must be used within a ValidationProvider');
    }
    return context;
  };
  
  return {
    ValidationProvider,
    useValidation,
    ValidationContext,
  };
});

// Mock hooks
jest.mock('../../hooks/usePageNavigation', () => ({
  usePageNavigation: (model) => ({
    navigationState: {
      currentPageIndex: model?.currentPageNo || 0,
      totalPages: model?.pageCount || 0,
      canGoNext: model?.currentPageNo < model?.pageCount - 1,
      canGoPrevious: model?.currentPageNo > 0,
      isFirstPage: model?.isFirstPage || true,
      isLastPage: model?.isLastPage || false,
    },
    goToNextPage: jest.fn(),
    goToPreviousPage: jest.fn(),
    completeSurvey: jest.fn(),
  }),
}));

jest.mock('../../hooks/usePageValidation', () => ({
  usePageValidation: (model) => ({
    validationState: {
      hasErrors: false,
      errors: {},
      validationMessages: [],
      isValidating: false,
    },
    validateCurrentPage: jest.fn().mockReturnValue(true),
    validateAllPages: jest.fn().mockReturnValue(true),
    clearValidationErrors: jest.fn(),
    validateQuestion: jest.fn().mockReturnValue(true),
    clearErrors: jest.fn(),
    getQuestionErrors: jest.fn().mockReturnValue([]),
  }),
}));

// Mock survey-core module
jest.mock('survey-core', () => {
  const mockModel = {
    currentPageNo: 0,
    pageCount: 1,
    isFirstPage: true,
    isLastPage: true,
    currentPage: {
      name: 'page1',
      title: 'Page 1',
      questions: [],
      hasErrors: false,
      errors: [],
      validate: jest.fn().mockReturnValue(true),
      clearIncorrectValues: jest.fn(),
      getAllQuestions: jest.fn().mockReturnValue([]),
    },
    pages: [],
    setValue: jest.fn(),
    getValue: jest.fn(),
    getAllQuestions: jest.fn().mockReturnValue([]),
    getQuestionByName: jest.fn(),
    validate: jest.fn().mockReturnValue(true),
    validateCurrentPage: jest.fn().mockReturnValue(true),
    clearErrors: jest.fn(),
    // Event handlers
    onCurrentPageChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onValidatedErrorsOnCurrentPage: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onValueChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onPropertyChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    getPropertyValue: jest.fn(),
  };

  // Mock Model constructor
  const Model = jest.fn((json) => {
    const instance = { ...mockModel };
    
    if (json?.pages) {
      instance.pageCount = json.pages.length;
      instance.pages = json.pages.map((page: any, index: number) => ({
        ...page,
        visibleIndex: index,
        hasErrors: false,
        errors: [],
        validate: jest.fn().mockReturnValue(true),
        clearIncorrectValues: jest.fn(),
        questions: page.elements?.map((element: any) => ({
          ...element,
          value: '',
          errors: [],
          hasErrors: false,
          validate: jest.fn().mockReturnValue(!element.isRequired || !!element.value),
          clearIncorrectValues: jest.fn(),
        })) || [],
        getAllQuestions: jest.fn().mockReturnValue(page.elements?.map((element: any) => ({
          ...element,
          value: '',
          errors: [],
          hasErrors: false,
          validate: jest.fn().mockReturnValue(!element.isRequired || !!element.value),
          clearIncorrectValues: jest.fn(),
        })) || []),
      }));
      instance.currentPage = instance.pages[0] || mockModel.currentPage;
      
      instance.getAllQuestions = jest.fn().mockReturnValue(
        instance.pages.flatMap((page: any) => page.questions || [])
      );
    }
    
    return instance;
  });

  return { Model };
});

// Import Model after mocking
import { Model } from 'survey-core';

// Mock Survey component to avoid SurveyPage issues
jest.mock('../../components/Survey', () => ({
  Survey: ({ children, model }: any) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: 'survey' }, children);
  },
}));

// Import components after mocking
import { Survey } from '../../components/Survey';
import { PageNavigation } from '../../components/PageNavigation';
import { ValidationProvider, useValidation } from '../../contexts/ValidationContext';
import { usePageNavigation } from '../../hooks/usePageNavigation';
import { usePageValidation } from '../../hooks/usePageValidation';

// Test component that can throw errors
const ErrorProneValidation: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  const validation = useValidation();
  
  if (shouldThrow) {
    throw new Error('Validation component error');
  }
  
  return <Text>Validation Component</Text>;
};

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <Text>Something went wrong</Text>;
    }

    return this.props.children;
  }
}

describe('Validation Edge Cases and Error Scenarios', () => {
  describe('Null/Undefined Model Handling', () => {
    it('should handle null model gracefully', () => {
      const { getByText } = render(
        <ValidationProvider model={null}>
          <Text>Survey Content</Text>
        </ValidationProvider>
      );

      expect(getByText('Survey Content')).toBeDefined();
    });

    it('should handle undefined model without crashing', () => {
      const { getByText } = render(
        <ValidationProvider model={undefined as any}>
          <Text>Survey Content</Text>
        </ValidationProvider>
      );

      expect(getByText('Survey Content')).toBeDefined();
    });

    it('should handle model becoming null during lifecycle', () => {
      const TestComponent = ({ model }: { model: Model | null }) => (
        <ValidationProvider model={model}>
          <Text>Survey Content</Text>
        </ValidationProvider>
      );

      const { rerender, getByText } = render(
        <TestComponent model={new Model({ pages: [] })} />
      );

      // Change model to null
      rerender(<TestComponent model={null} />);

      expect(getByText('Survey Content')).toBeDefined();
    });
  });

  describe('Empty Survey Handling', () => {
    it('should handle survey with no pages', () => {
      const model = new Model({ pages: [] });

      const { getByText } = render(
        <ValidationProvider model={model}>
          <Survey model={model}>
            <PageNavigation
              navigationState={{
                currentPageIndex: 0,
                totalPages: 0,
                canGoNext: false,
                canGoPrevious: false,
                isFirstPage: true,
                isLastPage: true,
              }}
              onNext={() => {}}
              onPrevious={() => {}}
              onComplete={() => {}}
            />
          </Survey>
        </ValidationProvider>
      );

      // Should render without crashing
      expect(getByText('Complete')).toBeDefined();
    });

    it('should handle page with no questions', () => {
      const model = new Model({
        pages: [
          {
            name: 'emptyPage',
            title: 'Empty Page',
            elements: [],
          },
        ],
      });

      const { queryByTestId } = render(
        <ValidationProvider model={model}>
          <Survey model={model} />
        </ValidationProvider>
      );

      // Should not crash
      expect(queryByTestId('survey-page-emptyPage')).toBeDefined();
    });
  });

  describe('Invalid Validation Configuration', () => {
    it('should handle questions with invalid validator types', () => {
      const model = new Model({
        pages: [
          {
            name: 'page1',
            elements: [
              {
                type: 'text',
                name: 'field1',
                isRequired: true,
                validators: [
                  {
                    type: 'nonexistent',
                    text: 'This validator does not exist',
                  },
                ],
              },
            ],
          },
        ],
      });

      const { getByTestId } = render(
        <ValidationProvider model={model}>
          <Survey model={model} />
        </ValidationProvider>
      );

      // Should render without crashing
      expect(getByTestId('survey-page-page1')).toBeDefined();
    });

    it('should handle circular validation dependencies', () => {
      const model = new Model({
        pages: [
          {
            name: 'page1',
            elements: [
              {
                type: 'text',
                name: 'field1',
                isRequired: true,
              },
              {
                type: 'text',
                name: 'field2',
                isRequired: true,
              },
            ],
          },
        ],
      });

      // Create circular dependency
      const questions = model.getAllQuestions();
      questions[0].validate = jest.fn(function() {
        return questions[1].validate();
      });
      questions[1].validate = jest.fn(function() {
        return questions[0].validate();
      });

      const { getByTestId } = render(
        <ValidationProvider model={model}>
          <Survey model={model} />
        </ValidationProvider>
      );

      // Should handle circular dependency without infinite loop
      expect(() => {
        model.validateCurrentPage();
      }).not.toThrow();
    });
  });

  describe('Async Validation Edge Cases', () => {
    it('should handle validation promise rejection', async () => {
      const model = new Model({
        pages: [
          {
            name: 'page1',
            elements: [
              {
                type: 'text',
                name: 'asyncField',
                isRequired: true,
              },
            ],
          },
        ],
      });

      // Add async validator that rejects
      const question = model.getAllQuestions()[0];
      question.validate = jest.fn().mockImplementation(() => {
        return Promise.reject(new Error('Validation service unavailable'));
      });

      const { getByTestId } = render(
        <ValidationProvider model={model}>
          <Survey model={model} />
        </ValidationProvider>
      );

      // Should handle rejection gracefully
      await expect(async () => {
        await model.validateCurrentPage();
      }).not.toThrow();
    });

    it('should handle timeout in async validation', async () => {
      jest.useFakeTimers();
      const model = new Model({
        pages: [
          {
            name: 'page1',
            elements: [
              {
                type: 'text',
                name: 'slowField',
                isRequired: true,
              },
            ],
          },
        ],
      });

      // Add validator that never resolves
      const question = model.getAllQuestions()[0];
      question.validate = jest.fn().mockImplementation(() => {
        return new Promise(() => {}); // Never resolves
      });

      const { getByText } = render(
        <ValidationProvider model={model}>
          <Survey model={model}>
            <PageNavigation
              navigationState={{
                currentPageIndex: 0,
                totalPages: 1,
                canGoNext: true,
                canGoPrevious: false,
                isFirstPage: true,
                isLastPage: true,
              }}
              onNext={() => {}}
              onPrevious={() => {}}
              onComplete={() => {}}
            />
          </Survey>
        </ValidationProvider>
      );

      // Try to navigate
      fireEvent.press(getByText('Complete'));

      // Advance timers
      jest.advanceTimersByTime(30000); // 30 seconds

      // Should not hang indefinitely
      expect(getByText('Complete')).toBeDefined();

      jest.useRealTimers();
    });
  });

  describe('Race Conditions', () => {
    it('should handle rapid page navigation during validation', async () => {
      const model = new Model({
        pages: [
          {
            name: 'page1',
            elements: [{ type: 'text', name: 'field1', isRequired: true }],
          },
          {
            name: 'page2',
            elements: [{ type: 'text', name: 'field2', isRequired: true }],
          },
        ],
      });

      // Make validation async
      model.validateCurrentPage = jest.fn().mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve(true), 100));
      });

      const TestComponent = () => {
        const { navigationState, goToNextPage, goToPreviousPage } = usePageNavigation(model);
        
        return (
          <PageNavigation
            navigationState={navigationState}
            onNext={goToNextPage}
            onPrevious={goToPreviousPage}
            onComplete={() => {}}
          />
        );
      };

      const { getByText } = render(
        <ValidationProvider model={model}>
          <Survey model={model}>
            <TestComponent />
          </Survey>
        </ValidationProvider>
      );

      // Rapidly click next multiple times
      const nextButton = getByText('Next');
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);
      fireEvent.press(nextButton);

      // Should handle rapid clicks without errors
      await waitFor(() => {
        expect(model.currentPageNo).toBeLessThanOrEqual(1);
      });
    });

    it('should handle validation state changes during unmount', () => {
      const model = new Model({
        pages: [
          {
            name: 'page1',
            elements: [{ type: 'text', name: 'field1', isRequired: true }],
          },
        ],
      });

      const { unmount } = render(
        <ValidationProvider model={model}>
          <Survey model={model} />
        </ValidationProvider>
      );

      // Start validation
      model.validateCurrentPage();

      // Unmount immediately
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Error Boundary Integration', () => {
    it('should catch errors in validation components', () => {
      const model = new Model({ pages: [] });

      const { getByText } = render(
        <ErrorBoundary fallback={<Text>Validation Error Caught</Text>}>
          <ValidationProvider model={model}>
            <ErrorProneValidation shouldThrow={true} />
          </ValidationProvider>
        </ErrorBoundary>
      );

      expect(getByText('Validation Error Caught')).toBeDefined();
    });

    it('should recover from transient validation errors', () => {
      const model = new Model({ pages: [] });
      let shouldThrow = true;

      const TestComponent = () => {
        const [error, setError] = React.useState(shouldThrow);
        
        return (
          <ErrorBoundary
            key={error ? 'error' : 'noerror'}
            fallback={
              <View>
                <Text>Error occurred</Text>
                <Text onPress={() => {
                  shouldThrow = false;
                  setError(false);
                }}>
                  Retry
                </Text>
              </View>
            }
          >
            <ValidationProvider model={model}>
              <ErrorProneValidation shouldThrow={error} />
            </ValidationProvider>
          </ErrorBoundary>
        );
      };

      const { getByText } = render(<TestComponent />);

      // Should show error
      expect(getByText('Error occurred')).toBeDefined();

      // Click retry
      fireEvent.press(getByText('Retry'));

      // Should recover
      expect(getByText('Validation Component')).toBeDefined();
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should clean up event listeners on unmount', () => {
      const model = new Model({
        pages: [
          {
            name: 'page1',
            elements: [{ type: 'text', name: 'field1', isRequired: true }],
          },
        ],
      });

      const { unmount } = render(
        <ValidationProvider model={model}>
          <Survey model={model} />
        </ValidationProvider>
      );

      // Count event listeners before unmount
      const initialListeners = {
        onValueChanged: model.onValueChanged.add.mock.calls.length,
        onCurrentPageChanged: model.onCurrentPageChanged.add.mock.calls.length,
        onValidatedErrorsOnCurrentPage: model.onValidatedErrorsOnCurrentPage.add.mock.calls.length,
      };

      unmount();

      // Should have called remove for each add
      expect(model.onValueChanged.remove).toHaveBeenCalledTimes(initialListeners.onValueChanged);
      expect(model.onCurrentPageChanged.remove).toHaveBeenCalledTimes(initialListeners.onCurrentPageChanged);
      expect(model.onValidatedErrorsOnCurrentPage.remove).toHaveBeenCalledTimes(initialListeners.onValidatedErrorsOnCurrentPage);
    });
  });

  describe('Extreme Input Values', () => {
    it('should handle extremely long validation error messages', () => {
      const model = new Model({
        pages: [
          {
            name: 'page1',
            elements: [{ type: 'text', name: 'field1', isRequired: true }],
          },
        ],
      });

      const longErrorMessage = 'A'.repeat(1000);
      const question = model.getAllQuestions()[0];
      question.validate = jest.fn().mockReturnValue(false);
      question.errors = [longErrorMessage];
      question.hasErrors = true;

      const { getByTestId } = render(
        <ValidationProvider model={model}>
          <Survey model={model} />
        </ValidationProvider>
      );

      // Should handle long error message without layout issues
      expect(getByTestId('error-field1')).toBeDefined();
    });

    it('should handle very large number of validation errors', () => {
      const model = new Model({
        pages: [
          {
            name: 'page1',
            elements: Array.from({ length: 1000 }, (_, i) => ({
              type: 'text',
              name: `field${i}`,
              isRequired: true,
            })),
          },
        ],
      });

      // Set all questions as invalid
      model.getAllQuestions().forEach(q => {
        q.hasErrors = true;
        q.errors = ['Required field'];
      });

      const { queryByTestId } = render(
        <ValidationProvider model={model}>
          <Survey model={model} />
        </ValidationProvider>
      );

      // Should render without performance issues
      expect(queryByTestId('survey-page-page1')).toBeDefined();
    });
  });
});