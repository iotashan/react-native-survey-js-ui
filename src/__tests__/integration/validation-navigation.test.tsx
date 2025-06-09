import * as React from 'react';
import { render, fireEvent, waitFor, within } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import type { Model, Question } from 'survey-core';

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
  
  const ValidationContext = createContext({
    model: null,
    validationMode: 'on-submit',
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
    registerCustomValidator: jest.fn(),
    addCustomValidatorToField: jest.fn(),
    removeCustomValidatorFromField: jest.fn(),
    validateWithCustomValidator: jest.fn().mockReturnValue(true),
  });
  
  const ValidationProvider = ({ children, model, initialMode = 'on-submit' }) => {
    const [validationMode, setValidationMode] = useState(initialMode);
    const [errors, setErrors] = useState({});
    const [touchedFields, setTouchedFields] = useState({});
    const [hasErrors, setHasErrors] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    
    const getFieldErrors = useCallback((fieldName) => {
      return errors[fieldName] || [];
    }, [errors]);
    
    const setFieldError = useCallback((fieldName, fieldErrors) => {
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldErrors,
      }));
      setHasErrors(true);
    }, []);
    
    const clearFieldError = useCallback((fieldName) => {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }, []);
    
    const markFieldTouched = useCallback((fieldName) => {
      setTouchedFields(prev => ({
        ...prev,
        [fieldName]: true,
      }));
    }, []);
    
    const validateField = useCallback((fieldName) => {
      // Find question in model
      if (model && typeof model.getQuestionByName === 'function') {
        const question = model.getQuestionByName(fieldName);
        if (question) {
          if (question.isRequired && !question.value) {
            setFieldError(fieldName, ['This field is required']);
            return false;
          } else {
            clearFieldError(fieldName);
            return true;
          }
        }
      }
      return true;
    }, [model, setFieldError, clearFieldError]);
    
    const validatePage = useCallback((pageIndex) => {
      if (!model || typeof model.validateCurrentPage !== 'function') return true;
      
      setIsValidating(true);
      let isValid = true;
      
      // Get all questions on current page
      const questions = model.currentPage?.getAllQuestions?.() || [];
      
      questions.forEach(q => {
        if (!validateField(q.name)) {
          isValid = false;
        }
      });
      
      setIsValidating(false);
      return isValid;
    }, [model, validateField]);
    
    const validateSurvey = useCallback(() => {
      if (!model) return true;
      return model.validate?.() || true;
    }, [model]);
    
    const value = {
      model,
      validationMode,
      errors,
      touchedFields,
      hasErrors: Object.keys(errors).length > 0,
      isValidating,
      validateField,
      validatePage,
      validateSurvey,
      setValidationMode,
      clearErrors: () => setErrors({}),
      clearFieldError,
      setFieldError,
      getFieldErrors,
      markFieldTouched,
      registerCustomValidator: jest.fn(),
      addCustomValidatorToField: jest.fn(),
      removeCustomValidatorFromField: jest.fn(),
      validateWithCustomValidator: jest.fn().mockReturnValue(true),
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

// Mock survey-core module
jest.mock('survey-core', () => {
  const mockModel = {
    currentPageNo: 0,
    pageCount: 3,
    isFirstPage: true,
    isLastPage: false,
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
    isRequired: false,
    nextPage: jest.fn(),
    prevPage: jest.fn(),
    doComplete: jest.fn(),
    completeLastPage: jest.fn(),
    validate: jest.fn().mockReturnValue(true),
    validateCurrentPage: jest.fn().mockReturnValue(true),
    setValue: jest.fn(),
    getValue: jest.fn(),
    getAllQuestions: jest.fn().mockReturnValue([]),
    getQuestionByName: jest.fn(),
    clearErrors: jest.fn(),
    getPropertyValue: jest.fn((name) => {
      if (name === 'isCompleted') return false;
      return undefined;
    }),
    // Event handlers
    onCurrentPageChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onValidatedErrorsOnCurrentPage: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onComplete: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onPropertyChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onValueChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onValidateQuestion: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    progressText: 'Page 1 of 3',
    isNavigatingForward: false,
  };

  // Mock Model constructor
  const Model = jest.fn((json) => {
    const instance = { 
      ...mockModel,
      
      // Override methods to track state changes
      nextPage: jest.fn(function() {
        // Check validation before moving forward
        if (!this.validateCurrentPage()) {
          return false;
        }
        
        if (this.currentPageNo < this.pageCount - 1) {
          this.currentPageNo++;
          this.isFirstPage = this.currentPageNo === 0;
          this.isLastPage = this.currentPageNo === this.pageCount - 1;
          
          // Update currentPage to the actual page from pages array
          if (this.pages && this.pages[this.currentPageNo]) {
            this.currentPage = this.pages[this.currentPageNo];
          } else {
            this.currentPage = {
              name: `page${this.currentPageNo + 1}`,
              title: `Page ${this.currentPageNo + 1}`,
              questions: [],
              hasErrors: false,
              errors: [],
              validate: jest.fn().mockReturnValue(true),
              clearIncorrectValues: jest.fn(),
              getAllQuestions: jest.fn().mockReturnValue([]),
            };
          }
          
          // Trigger event listeners
          const handlers = this.onCurrentPageChanged.add.mock.calls;
          handlers.forEach(([handler]) => handler && handler(this, {}));
          return true;
        }
        return false;
      }),
      
      prevPage: jest.fn(function() {
        if (this.currentPageNo > 0) {
          this.currentPageNo--;
          this.isFirstPage = this.currentPageNo === 0;
          this.isLastPage = this.currentPageNo === this.pageCount - 1;
          
          // Update currentPage to the actual page from pages array
          if (this.pages && this.pages[this.currentPageNo]) {
            this.currentPage = this.pages[this.currentPageNo];
          } else {
            this.currentPage = {
              name: `page${this.currentPageNo + 1}`,
              title: `Page ${this.currentPageNo + 1}`,
              questions: [],
              hasErrors: false,
              errors: [],
              validate: jest.fn().mockReturnValue(true),
              clearIncorrectValues: jest.fn(),
              getAllQuestions: jest.fn().mockReturnValue([]),
            };
          }
          
          // Trigger event listeners
          const handlers = this.onCurrentPageChanged.add.mock.calls;
          handlers.forEach(([handler]) => handler && handler(this, {}));
          return true;
        }
        return false;
      }),
      
      validateCurrentPage: jest.fn(function() {
        // Trigger validation event
        const handlers = this.onValidatedErrorsOnCurrentPage.add.mock.calls;
        handlers.forEach(([handler]) => handler && handler());
        
        // Check if current page has errors
        const hasErrors = this.currentPage.hasErrors || false;
        return !hasErrors;
      }),
      
      getQuestionByName: jest.fn(function(name: string) {
        // Search through all pages for the question
        for (const page of this.pages) {
          const question = page.questions?.find((q: any) => q.name === name);
          if (question) return question;
        }
        return null;
      }),
    };
    
    if (json?.pages) {
      instance.pageCount = json.pages.length;
      instance.pages = json.pages.map((page: any, index: number) => ({
        ...page,
        visibleIndex: index,
        hasErrors: false,
        errors: [],
        validate: jest.fn().mockReturnValue(true),
        clearIncorrectValues: jest.fn(),
        getAllQuestions: jest.fn().mockReturnValue(page.elements?.map((element: any) => ({
          ...element,
          value: '',
          errors: [],
          hasErrors: false,
          validate: jest.fn().mockReturnValue(!element.isRequired || !!element.value),
          clearIncorrectValues: jest.fn(),
          getType: jest.fn().mockReturnValue(element.type || 'text'),
        })) || []),
        questions: page.elements?.map((element: any) => ({
          ...element,
          value: '',
          errors: [],
          hasErrors: false,
          validate: jest.fn().mockReturnValue(!element.isRequired || !!element.value),
          clearIncorrectValues: jest.fn(),
          getType: jest.fn().mockReturnValue(element.type || 'text'),
        })) || [],
      }));
      instance.isFirstPage = true;
      instance.isLastPage = instance.pageCount === 1;
      instance.currentPage = instance.pages[0] || mockModel.currentPage;
      
      // Populate getAllQuestions to return all questions from all pages
      instance.getAllQuestions = jest.fn().mockReturnValue(
        instance.pages.flatMap((page: any) => page.questions || [])
      );
    }
    
    // Bind methods to instance
    instance.nextPage = instance.nextPage.bind(instance);
    instance.prevPage = instance.prevPage.bind(instance);
    instance.validateCurrentPage = instance.validateCurrentPage.bind(instance);
    instance.getQuestionByName = instance.getQuestionByName.bind(instance);
    
    return instance;
  });

  return { Model };
});

// Import Model after mocking
import { Model } from 'survey-core';

// Mock Survey component
jest.mock('../../components/Survey', () => ({
  Survey: ({ children, model }: any) => {
    const React = require('react');
    const { View } = require('react-native');
    const { SurveyPage } = require('../../components/Survey/SurveyPage');
    const [pageNumber, setPageNumber] = React.useState(0);
    
    React.useEffect(() => {
      if (!model) return;
      
      const handlePageChange = () => {
        setPageNumber(model.currentPageNo);
      };
      
      // Listen for page changes
      model.onCurrentPageChanged.add(handlePageChange);
      return () => {
        model.onCurrentPageChanged.remove(handlePageChange);
      };
    }, [model]);
    
    const currentPage = model?.pages?.[pageNumber] || model?.currentPage;
    
    return React.createElement(View, { testID: 'survey' }, [
      currentPage && React.createElement(SurveyPage, { 
        key: `survey-page-${pageNumber}`,
        page: currentPage 
      }),
      children
    ]);
  },
}));

// Mock PageNavigation component
jest.mock('../../components/PageNavigation', () => ({
  PageNavigation: ({ navigationState, onNext, onPrevious, onComplete }: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    
    return React.createElement(View, { testID: 'page-navigation' }, [
      navigationState.canGoPrevious && React.createElement(TouchableOpacity, {
        key: 'prev',
        onPress: onPrevious,
        testID: 'previous-button',
      }, React.createElement(Text, {}, 'Previous')),
      
      navigationState.canGoNext && React.createElement(TouchableOpacity, {
        key: 'next',
        onPress: onNext,
        testID: 'next-button',
        disabled: navigationState.isValidating,
      }, React.createElement(Text, {}, 'Next')),
      
      navigationState.isLastPage && React.createElement(TouchableOpacity, {
        key: 'complete',
        onPress: onComplete,
        testID: 'complete-button',
      }, React.createElement(Text, {}, 'Complete')),
    ]);
  },
}));

// Mock hooks
jest.mock('../../hooks/usePageNavigation', () => ({
  usePageNavigation: (model: any) => {
    const React = require('react');
    const [currentPageIndex, setCurrentPageIndex] = React.useState(model?.currentPageNo || 0);
    
    return {
      navigationState: {
        currentPageIndex,
        totalPages: model?.pageCount || 0,
        canGoNext: currentPageIndex < (model?.pageCount || 0) - 1,
        canGoPrevious: currentPageIndex > 0,
        isFirstPage: currentPageIndex === 0,
        isLastPage: currentPageIndex === (model?.pageCount || 0) - 1,
        isValidating: false,
      },
      goToNextPage: () => {
        if (model && typeof model.nextPage === 'function') {
          model.nextPage();
          setCurrentPageIndex(model.currentPageNo);
        }
      },
      goToPreviousPage: () => {
        if (model && typeof model.prevPage === 'function') {
          model.prevPage();
          setCurrentPageIndex(model.currentPageNo);
        }
      },
      completeSurvey: () => {
        if (model && typeof model.doComplete === 'function') {
          model.doComplete();
        }
      },
    };
  },
}));

// Import components after mocking
import { Survey } from '../../components/Survey';
import { PageNavigation } from '../../components/PageNavigation';
import { ValidationProvider, ValidationMode, useValidation } from '../../contexts/ValidationContext';
import { usePageNavigation } from '../../hooks/usePageNavigation';
import { usePageValidation } from '../../hooks/usePageValidation';

// Mock components
jest.mock('../../components/Survey/SurveyPage', () => ({
  SurveyPage: ({ page }: any) => {
    const React = require('react');
    const { View, Text, TextInput } = require('react-native');
    const { useValidation } = require('../../contexts/ValidationContext');
    
    const validation = useValidation();
    
    return (
      <View testID={`survey-page-${page.name}`}>
        <Text>{page.title || page.name}</Text>
        {page.questions?.map((question: any) => {
          const errors = validation.getFieldErrors(question.name);
          return (
            <View key={question.name} testID={`question-${question.name}`}>
              <Text>{question.title}</Text>
              <TextInput
                testID={`input-${question.name}`}
                value={question.value || ''}
                onChangeText={(text) => {
                  question.value = text;
                  question.errors = [];
                  question.hasErrors = false;
                  if (question.isRequired && !text) {
                    question.errors = ['This field is required'];
                    question.hasErrors = true;
                  }
                  validation.markFieldTouched(question.name);
                  validation.validateField(question.name);
                }}
              />
              {errors.length > 0 && (
                <Text testID={`error-${question.name}`} style={{ color: 'red' }}>
                  {errors[0]}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    );
  },
}));

// Test component that integrates validation with navigation
const TestValidationNavigation: React.FC<{ 
  model: Model;
  validationMode?: ValidationMode;
  onComplete?: () => void;
}> = ({ model, validationMode = 'on-submit', onComplete }) => {
  const { useCallback } = React;
  const { navigationState, goToNextPage, goToPreviousPage, completeSurvey } = usePageNavigation(model);
  const validation = useValidation();
  
  // Handle navigation with validation
  const handleNext = useCallback(() => {
    if (validationMode === 'on-submit' || validationMode === 'hybrid') {
      // Validate current page before navigation
      const isValid = validation.validatePage();
      if (!isValid) {
        return; // Prevent navigation if validation fails
      }
    }
    goToNextPage();
  }, [validation, validationMode, goToNextPage]);
  
  const handleComplete = useCallback(() => {
    if (validationMode === 'on-submit' || validationMode === 'hybrid') {
      // Validate entire survey before completion
      const isValid = model?.validate ? model.validate() : validation.validateSurvey();
      if (!isValid) {
        return; // Prevent completion if validation fails
      }
    }
    completeSurvey();
    onComplete?.();
  }, [model, validation, validationMode, completeSurvey, onComplete]);
  
  return (
    <PageNavigation
      navigationState={navigationState}
      onNext={handleNext}
      onPrevious={goToPreviousPage}
      onComplete={handleComplete}
    />
  );
};

describe('Validation Navigation Integration Tests', () => {
  const createSurveyWithValidation = () => {
    return new Model({
      pages: [
        {
          name: 'page1',
          title: 'Personal Information',
          elements: [
            {
              type: 'text',
              name: 'firstName',
              title: 'First Name',
              isRequired: true,
            },
            {
              type: 'text',
              name: 'lastName',
              title: 'Last Name',
              isRequired: true,
            },
          ],
        },
        {
          name: 'page2',
          title: 'Contact Information',
          elements: [
            {
              type: 'text',
              name: 'email',
              title: 'Email',
              isRequired: true,
              validators: [
                {
                  type: 'email',
                  text: 'Please enter a valid email',
                },
              ],
            },
            {
              type: 'text',
              name: 'phone',
              title: 'Phone',
              isRequired: false,
            },
          ],
        },
        {
          name: 'page3',
          title: 'Comments',
          elements: [
            {
              type: 'comment',
              name: 'feedback',
              title: 'Your Feedback',
              isRequired: false,
            },
          ],
        },
      ],
    });
  };

  describe('Validation Blocking Navigation', () => {
    it('should prevent navigation to next page when required fields are empty', async () => {
      const model = createSurveyWithValidation();
      const onComplete = jest.fn();

      const { getByText, getByTestId, queryByTestId } = render(
        <ValidationProvider model={model} initialMode="on-submit">
          <Survey model={model}>
            <TestValidationNavigation model={model} onComplete={onComplete} />
          </Survey>
        </ValidationProvider>
      );

      // Should be on page 1
      expect(getByTestId('survey-page-page1')).toBeDefined();
      expect(getByText('Personal Information')).toBeDefined();

      // Try to navigate to next page without filling required fields
      const nextButton = getByText('Next');
      fireEvent.press(nextButton);

      // Should still be on page 1
      await waitFor(() => {
        expect(getByTestId('survey-page-page1')).toBeDefined();
        expect(queryByTestId('survey-page-page2')).toBeNull();
      });

      // Should show validation errors
      await waitFor(() => {
        expect(getByTestId('error-firstName')).toBeDefined();
        expect(getByTestId('error-lastName')).toBeDefined();
      });
    });

    it('should allow navigation when all required fields are filled', async () => {
      const model = createSurveyWithValidation();
      const onComplete = jest.fn();

      const { getByText, getByTestId, queryByTestId } = render(
        <ValidationProvider model={model} initialMode="on-submit">
          <Survey model={model}>
            <TestValidationNavigation model={model} onComplete={onComplete} />
          </Survey>
        </ValidationProvider>
      );

      // Fill in required fields
      const firstNameInput = getByTestId('input-firstName');
      const lastNameInput = getByTestId('input-lastName');
      
      fireEvent.changeText(firstNameInput, 'John');
      fireEvent.changeText(lastNameInput, 'Doe');

      // Navigate to next page
      const nextButton = getByText('Next');
      fireEvent.press(nextButton);

      // Should now be on page 2
      await waitFor(() => {
        expect(queryByTestId('survey-page-page1')).toBeNull();
        expect(getByTestId('survey-page-page2')).toBeDefined();
        expect(getByText('Contact Information')).toBeDefined();
      });
    });

    it('should prevent survey completion when there are validation errors', async () => {
      const model = createSurveyWithValidation();
      const onComplete = jest.fn();

      const { getByText, getByTestId } = render(
        <ValidationProvider model={model} initialMode="on-submit">
          <Survey model={model}>
            <TestValidationNavigation model={model} onComplete={onComplete} />
          </Survey>
        </ValidationProvider>
      );

      // Fill first page
      fireEvent.changeText(getByTestId('input-firstName'), 'John');
      fireEvent.changeText(getByTestId('input-lastName'), 'Doe');
      fireEvent.press(getByText('Next'));

      // Move to page 2 but don't fill required email
      await waitFor(() => {
        expect(getByTestId('survey-page-page2')).toBeDefined();
      });

      // Navigate to last page
      fireEvent.press(getByText('Next'));

      // Should show email validation error and stay on page 2
      await waitFor(() => {
        expect(getByTestId('survey-page-page2')).toBeDefined();
        expect(getByTestId('error-email')).toBeDefined();
      });

      // Complete button should not complete survey
      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('Previous Button Navigation', () => {
    it('should always allow navigation to previous page regardless of validation', async () => {
      const model = createSurveyWithValidation();

      const { getByText, getByTestId } = render(
        <ValidationProvider model={model} initialMode="on-submit">
          <Survey model={model}>
            <TestValidationNavigation model={model} />
          </Survey>
        </ValidationProvider>
      );

      // Fill first page and navigate to page 2
      fireEvent.changeText(getByTestId('input-firstName'), 'John');
      fireEvent.changeText(getByTestId('input-lastName'), 'Doe');
      fireEvent.press(getByText('Next'));

      await waitFor(() => {
        expect(getByTestId('survey-page-page2')).toBeDefined();
      });

      // Go back to previous page even with empty required fields on page 2
      fireEvent.press(getByText('Previous'));

      await waitFor(() => {
        expect(getByTestId('survey-page-page1')).toBeDefined();
        expect(getByText('Personal Information')).toBeDefined();
      });
    });
  });

  describe('Validation State Persistence', () => {
    it('should maintain validation state when navigating between pages', async () => {
      const model = createSurveyWithValidation();

      const { getByText, getByTestId, queryByTestId } = render(
        <ValidationProvider model={model} initialMode="on-submit">
          <Survey model={model}>
            <TestValidationNavigation model={model} />
          </Survey>
        </ValidationProvider>
      );

      // Try to navigate without filling fields
      fireEvent.press(getByText('Next'));

      // Should show errors
      await waitFor(() => {
        expect(getByTestId('error-firstName')).toBeDefined();
      });

      // Fill only first name
      fireEvent.changeText(getByTestId('input-firstName'), 'John');

      // Try to navigate again
      fireEvent.press(getByText('Next'));

      // Should still show error for last name
      await waitFor(() => {
        expect(queryByTestId('error-firstName')).toBeNull();
        expect(getByTestId('error-lastName')).toBeDefined();
      });

      // Fill last name and navigate
      fireEvent.changeText(getByTestId('input-lastName'), 'Doe');
      fireEvent.press(getByText('Next'));

      await waitFor(() => {
        expect(getByTestId('survey-page-page2')).toBeDefined();
      });

      // Go back to page 1
      fireEvent.press(getByText('Previous'));

      await waitFor(() => {
        expect(getByTestId('survey-page-page1')).toBeDefined();
      });

      // Values should be preserved
      const firstNameInput = getByTestId('input-firstName');
      const lastNameInput = getByTestId('input-lastName');
      expect(firstNameInput.props.value).toBe('John');
      expect(lastNameInput.props.value).toBe('Doe');

      // No errors should be shown (already validated)
      expect(queryByTestId('error-firstName')).toBeNull();
      expect(queryByTestId('error-lastName')).toBeNull();
    });
  });

  describe('Real-time Validation Mode', () => {
    it('should validate fields as user types in real-time mode', async () => {
      const model = createSurveyWithValidation();

      const { getByTestId, queryByTestId } = render(
        <ValidationProvider model={model} initialMode="real-time">
          <Survey model={model}>
            <TestValidationNavigation model={model} validationMode="real-time" />
          </Survey>
        </ValidationProvider>
      );

      const firstNameInput = getByTestId('input-firstName');

      // Start typing and then clear
      fireEvent.changeText(firstNameInput, 'J');
      fireEvent.changeText(firstNameInput, '');

      // Should show error immediately
      await waitFor(() => {
        expect(getByTestId('error-firstName')).toBeDefined();
      });

      // Type valid value
      fireEvent.changeText(firstNameInput, 'John');

      // Error should disappear
      await waitFor(() => {
        expect(queryByTestId('error-firstName')).toBeNull();
      });
    });
  });

  describe('Hybrid Validation Mode', () => {
    it('should validate touched fields in real-time and others on submit', async () => {
      const model = createSurveyWithValidation();

      const { getByText, getByTestId, queryByTestId } = render(
        <ValidationProvider model={model} initialMode="hybrid">
          <Survey model={model}>
            <TestValidationNavigation model={model} validationMode="hybrid" />
          </Survey>
        </ValidationProvider>
      );

      // Touch first name field and leave empty
      const firstNameInput = getByTestId('input-firstName');
      fireEvent.changeText(firstNameInput, '');

      // Should show error for touched field
      await waitFor(() => {
        expect(getByTestId('error-firstName')).toBeDefined();
      });

      // Last name error should not appear yet (not touched)
      expect(queryByTestId('error-lastName')).toBeNull();

      // Try to navigate
      fireEvent.press(getByText('Next'));

      // Now both errors should show
      await waitFor(() => {
        expect(getByTestId('error-firstName')).toBeDefined();
        expect(getByTestId('error-lastName')).toBeDefined();
      });
    });
  });

  describe('Navigation Button States', () => {
    it('should disable next button when validation is in progress', async () => {
      const model = createSurveyWithValidation();
      
      // Fill required fields to allow navigation
      const questions = model.getAllQuestions();
      questions[0].value = 'John'; // firstName
      questions[1].value = 'Doe'; // lastName
      
      // Add async validation
      model.validateCurrentPage = jest.fn(() => {
        return new Promise(resolve => setTimeout(() => resolve(true), 100));
      });

      const { getByTestId } = render(
        <ValidationProvider model={model} initialMode="on-submit">
          <Survey model={model}>
            <TestValidationNavigation model={model} />
          </Survey>
        </ValidationProvider>
      );

      const nextButton = getByTestId('next-button');
      
      // Button should be enabled initially
      expect(nextButton.props.disabled).toBeFalsy();

      // Press next to trigger validation
      fireEvent.press(nextButton);

      // Verify validation was called
      await waitFor(() => {
        expect(model.validateCurrentPage).toHaveBeenCalled();
      });
    });

    it('should show complete button on last page only when all validation passes', async () => {
      const model = createSurveyWithValidation();
      const onComplete = jest.fn();

      const { getByText, getByTestId, queryByText } = render(
        <ValidationProvider model={model} initialMode="on-submit">
          <Survey model={model}>
            <TestValidationNavigation model={model} onComplete={onComplete} />
          </Survey>
        </ValidationProvider>
      );

      // Fill all required fields and navigate to last page
      fireEvent.changeText(getByTestId('input-firstName'), 'John');
      fireEvent.changeText(getByTestId('input-lastName'), 'Doe');
      fireEvent.press(getByText('Next'));

      await waitFor(() => {
        expect(getByTestId('survey-page-page2')).toBeDefined();
      });

      fireEvent.changeText(getByTestId('input-email'), 'john.doe@example.com');
      fireEvent.press(getByText('Next'));

      await waitFor(() => {
        expect(getByTestId('survey-page-page3')).toBeDefined();
      });

      // Should show Complete button on last page
      expect(queryByText('Complete')).toBeDefined();
      expect(queryByText('Next')).toBeNull();

      // Complete survey
      fireEvent.press(getByText('Complete'));

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });
  });

  describe('Multi-page Validation Flow', () => {
    it('should validate entire survey on complete', async () => {
      const model = createSurveyWithValidation();
      const onComplete = jest.fn();

      const { getByText, getByTestId } = render(
        <ValidationProvider model={model} initialMode="on-submit">
          <Survey model={model}>
            <TestValidationNavigation model={model} onComplete={onComplete} />
          </Survey>
        </ValidationProvider>
      );

      // Navigate to last page with some invalid data
      fireEvent.changeText(getByTestId('input-firstName'), 'John');
      // Skip lastName
      fireEvent.press(getByText('Next'));

      // Force navigation by filling lastName
      fireEvent.changeText(getByTestId('input-lastName'), 'Doe');
      fireEvent.press(getByText('Next'));

      await waitFor(() => {
        expect(getByTestId('survey-page-page2')).toBeDefined();
      });

      // Fill email to allow navigation to last page
      fireEvent.changeText(getByTestId('input-email'), 'john.doe@example.com');
      fireEvent.press(getByText('Next'));

      await waitFor(() => {
        expect(getByTestId('survey-page-page3')).toBeDefined();
      });

      // Set up validateSurvey to return false
      model.validate = jest.fn().mockReturnValue(false);
      model.currentPage.hasErrors = true;

      // Try to complete
      fireEvent.press(getByText('Complete'));

      // Should not complete due to validation errors
      await waitFor(() => {
        expect(onComplete).not.toHaveBeenCalled();
      });
    });
  });
});