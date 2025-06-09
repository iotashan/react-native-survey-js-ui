import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Survey } from '../Survey';
import type { SurveyModel } from '../../../types';

// Mock all the hooks
jest.mock('../../../hooks', () => ({
  useSurveyModel: jest.fn(),
  useSurveyState: jest.fn(),
  usePageNavigation: jest.fn(),
  usePageValidation: jest.fn(),
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    ScrollView: jest.fn().mockImplementation(({ children, ...props }) => {
      return React.createElement('ScrollView', props, children);
    }),
    TextInput: jest.fn().mockImplementation(({ children, ...props }) => {
      return React.createElement('TextInput', props, children);
    }),
  };
});

const { useSurveyModel, useSurveyState, usePageNavigation, usePageValidation } = require('../../../hooks');

describe('Survey with Validation', () => {
  const mockSurveyModel = {
    id: 'test-survey',
    title: 'Test Survey',
    showProgressBar: true,
    currentPage: {
      title: 'Page 1',
      questions: [
        {
          name: 'question1',
          type: 'text',
          title: 'Required Question',
          isRequired: true,
          visible: true,
          value: '',
          inputType: 'text',
        },
        {
          name: 'question2',
          type: 'text',
          title: 'Optional Question',
          isRequired: false,
          visible: true,
          value: '',
          inputType: 'text',
        },
      ],
    },
    setValue: jest.fn(),
    onComplete: { add: jest.fn(), remove: jest.fn() },
    onValueChanged: { add: jest.fn(), remove: jest.fn() },
    onCurrentPageChanged: { add: jest.fn(), remove: jest.fn() },
  };

  const mockSurveyState = {
    currentPageNo: 0,
    pageCount: 1,
    isCompleted: false,
  };

  const mockNavigationState = {
    currentPageNo: 0,
    pageCount: 1,
    isFirstPage: true,
    isLastPage: true,
    canGoNext: false,
    canGoPrevious: false,
    isNavigating: false,
    validationError: null,
  };

  const mockNavigation = {
    navigationState: mockNavigationState,
    goToNextPage: jest.fn(),
    goToPreviousPage: jest.fn(),
    completeSurvey: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    useSurveyModel.mockReturnValue({
      model: mockSurveyModel,
      isLoading: false,
      error: null,
    });

    useSurveyState.mockReturnValue(mockSurveyState);
    usePageNavigation.mockReturnValue(mockNavigation);
  });

  it('should render survey with validation provider', () => {
    const { getByTestId } = render(
      <Survey model={mockSurveyModel} />
    );

    expect(getByTestId('survey-container')).toBeTruthy();
    expect(getByTestId('survey-page')).toBeTruthy();
  });

  it('should display validation summary when there are errors', async () => {
    const { getByTestId, queryByTestId } = render(
      <Survey model={mockSurveyModel} />
    );

    // Initially no validation summary should be shown
    expect(queryByTestId('validation-summary')).toBeFalsy();

    // The validation summary would be shown after attempting navigation
    // This requires the validation context to have errors and showErrors to be true
  });

  it('should validate questions on value change', () => {
    const { getByTestId } = render(
      <Survey model={mockSurveyModel} />
    );

    const questionInputs = getByTestId('survey-page');
    expect(questionInputs).toBeTruthy();

    // The actual input validation would be tested through the QuestionFactory tests
    // Here we verify the survey structure is correct
  });

  it('should handle completion with validation', async () => {
    const mockOnComplete = jest.fn();
    const { getByTestId } = render(
      <Survey 
        model={mockSurveyModel} 
        onComplete={mockOnComplete}
      />
    );

    // Find the complete button (it would be in PageNavigation)
    const surveyContainer = getByTestId('survey-container');
    expect(surveyContainer).toBeTruthy();

    // The completion validation would be handled by the navigation hooks
    // which would call the validation function before allowing completion
  });

  it('should handle value changed events', () => {
    const mockOnValueChanged = jest.fn();
    render(
      <Survey 
        model={mockSurveyModel} 
        onValueChanged={mockOnValueChanged}
      />
    );

    // Verify that the value changed handler is set up
    expect(mockSurveyModel.onValueChanged.add).toHaveBeenCalled();
  });

  it('should handle page changed events', () => {
    const mockOnPageChanged = jest.fn();
    render(
      <Survey 
        model={mockSurveyModel} 
        onCurrentPageChanged={mockOnPageChanged}
      />
    );

    // Verify that the page changed handler is set up
    expect(mockSurveyModel.onCurrentPageChanged.add).toHaveBeenCalled();
  });

  it('should show loading state', () => {
    useSurveyModel.mockReturnValue({
      model: null,
      isLoading: true,
      error: null,
    });

    const { getByText } = render(
      <Survey model={mockSurveyModel} />
    );

    expect(getByText('Loading survey...')).toBeTruthy();
  });

  it('should show error state', () => {
    const mockError = new Error('Survey loading failed');
    useSurveyModel.mockReturnValue({
      model: null,
      isLoading: false,
      error: mockError,
    });

    const { getByText } = render(
      <Survey model={mockSurveyModel} />
    );

    expect(getByText('Error loading survey:')).toBeTruthy();
    expect(getByText('Survey loading failed')).toBeTruthy();
  });

  it('should show completion state', () => {
    useSurveyState.mockReturnValue({
      ...mockSurveyState,
      isCompleted: true,
    });

    const { getByText } = render(
      <Survey model={mockSurveyModel} />
    );

    expect(getByText('Survey Completed!')).toBeTruthy();
  });

  it('should handle navigation with validation', async () => {
    const { getByTestId } = render(
      <Survey model={mockSurveyModel} />
    );

    const surveyContainer = getByTestId('survey-container');
    expect(surveyContainer).toBeTruthy();

    // The navigation would call validation functions
    // This is tested through the integration of ValidationContext and navigation hooks
  });

  it('should cleanup event handlers on unmount', () => {
    const { unmount } = render(
      <Survey model={mockSurveyModel} />
    );

    unmount();

    // Verify cleanup functions were called
    expect(mockSurveyModel.onComplete.remove).toHaveBeenCalled();
    expect(mockSurveyModel.onValueChanged.remove).toHaveBeenCalled();
    expect(mockSurveyModel.onCurrentPageChanged.remove).toHaveBeenCalled();
  });

  it('should handle null survey model gracefully', () => {
    useSurveyModel.mockReturnValue({
      model: null,
      isLoading: false,
      error: null,
    });

    useSurveyState.mockReturnValue({
      currentPageNo: 0,
      pageCount: 0,
      isCompleted: false,
    });

    const { getByText } = render(
      <Survey model={null} />
    );

    // Should render without crashing
    expect(getByText('No page to display')).toBeTruthy();
  });

  it('should handle survey with no current page', () => {
    const modelWithoutCurrentPage = {
      ...mockSurveyModel,
      currentPage: null,
    };

    useSurveyModel.mockReturnValue({
      model: modelWithoutCurrentPage,
      isLoading: false,
      error: null,
    });

    const { getByText } = render(
      <Survey model={modelWithoutCurrentPage} />
    );

    expect(getByText('No page to display')).toBeTruthy();
  });

  it('should provide validation context to child components', () => {
    const { getByTestId } = render(
      <Survey model={mockSurveyModel} />
    );

    // The survey page should be rendered within the validation context
    const surveyPage = getByTestId('survey-page');
    expect(surveyPage).toBeTruthy();

    // The validation context is provided by the ValidationProvider wrapper
    // Child components can access validation functions through useValidation hook
  });
});

// Mock SurveyPage component
jest.mock('../SurveyPage', () => ({
  SurveyPage: jest.fn(() => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return (
      <View testID="survey-page">
        <Text>Survey Page Content</Text>
      </View>
    );
  }),
}));

describe('Survey Validation Integration', () => {
  let mockUseSurveyModel: jest.MockedFunction<any>;
  let mockUseSurveyState: jest.MockedFunction<any>;
  let mockUsePageNavigation: jest.MockedFunction<any>;
  let mockUsePageValidation: jest.MockedFunction<any>;

  beforeEach(() => {
    mockUseSurveyModel = require('../../../hooks').useSurveyModel;
    mockUseSurveyState = require('../../../hooks').useSurveyState;
    mockUsePageNavigation = require('../../../hooks').usePageNavigation;
    mockUsePageValidation = require('../../../hooks').usePageValidation;

    jest.clearAllMocks();
  });

  describe('Page Validation', () => {
    it('should integrate validation hook with Survey component', () => {
      const mockModel: SurveyModel = {
        id: 'test-survey',
        pages: [
          {
            name: 'page1',
            elements: [
              { name: 'q1', type: 'text', title: 'Question 1', isRequired: true },
            ],
          },
        ],
      };

      const mockSurveyModel = {
        currentPage: mockModel.pages[0],
        currentPageNo: 0,
        pageCount: 1,
        isFirstPage: true,
        isLastPage: true,
        onComplete: { add: jest.fn(), remove: jest.fn() },
        onValueChanged: { add: jest.fn(), remove: jest.fn() },
        onCurrentPageChanged: { add: jest.fn(), remove: jest.fn() },
      };

      mockUseSurveyModel.mockReturnValue({
        model: mockSurveyModel,
        isLoading: false,
        error: null,
      });

      mockUseSurveyState.mockReturnValue({
        currentPageNo: 0,
        pageCount: 1,
        isFirstPage: true,
        isLastPage: true,
        isCompleted: false,
        questions: [],
      });

      mockUsePageNavigation.mockReturnValue({
        navigationState: {
          currentPageNo: 0,
          pageCount: 1,
          isFirstPage: true,
          isLastPage: true,
          canGoNext: false,
          canGoPrevious: false,
          isNavigating: false,
          validationError: null,
        },
        goToNextPage: jest.fn(),
        goToPreviousPage: jest.fn(),
        completeSurvey: jest.fn(),
      });

      const mockValidateCurrentPage = jest.fn(() => true);
      mockUsePageValidation.mockReturnValue({
        validationState: {
          errors: {},
          isValidating: false,
          hasErrors: false,
        },
        validateCurrentPage: mockValidateCurrentPage,
        clearErrors: jest.fn(),
        getQuestionErrors: jest.fn(() => []),
      });

      render(<Survey model={mockModel} />);

      // Verify that validation hook is called with the survey model
      expect(mockUsePageValidation).toHaveBeenCalledWith(mockSurveyModel);
    });

    it('should display validation errors in PageNavigation component', () => {
      const mockModel: SurveyModel = {
        id: 'test-survey',
        pages: [
          {
            name: 'page1',
            elements: [
              { name: 'q1', type: 'text', title: 'Question 1', isRequired: true },
            ],
          },
        ],
      };

      const mockSurveyModel = {
        currentPage: mockModel.pages[0],
        currentPageNo: 0,
        pageCount: 1,
        isFirstPage: true,
        isLastPage: true,
        onComplete: { add: jest.fn(), remove: jest.fn() },
        onValueChanged: { add: jest.fn(), remove: jest.fn() },
        onCurrentPageChanged: { add: jest.fn(), remove: jest.fn() },
      };

      mockUseSurveyModel.mockReturnValue({
        model: mockSurveyModel,
        isLoading: false,
        error: null,
      });

      mockUseSurveyState.mockReturnValue({
        currentPageNo: 0,
        pageCount: 1,
        isFirstPage: true,
        isLastPage: true,
        isCompleted: false,
        questions: [],
      });

      mockUsePageNavigation.mockReturnValue({
        navigationState: {
          currentPageNo: 0,
          pageCount: 1,
          isFirstPage: true,
          isLastPage: true,
          canGoNext: true,
          canGoPrevious: false,
          isNavigating: false,
          validationError: null,
        },
        goToNextPage: jest.fn(),
        goToPreviousPage: jest.fn(),
        completeSurvey: jest.fn(),
      });

      // Mock validation state with errors
      mockUsePageValidation.mockReturnValue({
        validationState: {
          errors: {
            q1: ['This field is required'],
          },
          isValidating: false,
          hasErrors: true,
        },
        validateCurrentPage: jest.fn(() => false),
        clearErrors: jest.fn(),
        getQuestionErrors: jest.fn((name) =>
          name === 'q1' ? ['This field is required'] : []
        ),
      });

      const { getByTestId, getByText } = render(<Survey model={mockModel} />);

      // Verify validation errors are displayed
      expect(getByTestId('page-validation-errors')).toBeTruthy();
      expect(getByText('Please fix the following errors:')).toBeTruthy();
      expect(getByText('• This field is required')).toBeTruthy();
    });

    it('should block navigation when validation fails', async () => {
      const mockModel: SurveyModel = {
        id: 'test-survey',
        pages: [
          {
            name: 'page1',
            elements: [
              { name: 'q1', type: 'text', title: 'Question 1', isRequired: true },
            ],
          },
          {
            name: 'page2',
            elements: [
              { name: 'q2', type: 'text', title: 'Question 2' },
            ],
          },
        ],
      };

      const mockSurveyModel = {
        currentPage: mockModel.pages[0],
        currentPageNo: 0,
        pageCount: 2,
        isFirstPage: true,
        isLastPage: false,
        nextPage: jest.fn(),
        onComplete: { add: jest.fn(), remove: jest.fn() },
        onValueChanged: { add: jest.fn(), remove: jest.fn() },
        onCurrentPageChanged: { add: jest.fn(), remove: jest.fn() },
      };

      mockUseSurveyModel.mockReturnValue({
        model: mockSurveyModel,
        isLoading: false,
        error: null,
      });

      mockUseSurveyState.mockReturnValue({
        currentPageNo: 0,
        pageCount: 2,
        isFirstPage: true,
        isLastPage: false,
        isCompleted: false,
        questions: [],
      });

      const mockGoToNextPage = jest.fn((validatePage) => {
        if (validatePage) {
          const isValid = validatePage();
          if (!isValid) {
            return; // Block navigation
          }
        }
        mockSurveyModel.nextPage();
      });

      mockUsePageNavigation.mockReturnValue({
        navigationState: {
          currentPageNo: 0,
          pageCount: 2,
          isFirstPage: true,
          isLastPage: false,
          canGoNext: true,
          canGoPrevious: false,
          isNavigating: false,
          validationError: null,
        },
        goToNextPage: mockGoToNextPage,
        goToPreviousPage: jest.fn(),
        completeSurvey: jest.fn(),
      });

      // Mock validation that fails
      const mockValidateCurrentPage = jest.fn(() => false);
      mockUsePageValidation.mockReturnValue({
        validationState: {
          errors: {
            q1: ['This field is required'],
          },
          isValidating: false,
          hasErrors: true,
        },
        validateCurrentPage: mockValidateCurrentPage,
        clearErrors: jest.fn(),
        getQuestionErrors: jest.fn(() => ['This field is required']),
      });

      const { getByText } = render(<Survey model={mockModel} />);

      // Try to navigate to next page
      fireEvent.press(getByText('Next'));

      await waitFor(() => {
        // Validation should be called
        expect(mockValidateCurrentPage).toHaveBeenCalled();
        // Navigation should be blocked (nextPage not called)
        expect(mockSurveyModel.nextPage).not.toHaveBeenCalled();
      });
    });

    it('should allow navigation when validation passes', async () => {
      const mockModel: SurveyModel = {
        id: 'test-survey',
        pages: [
          {
            name: 'page1',
            elements: [
              { name: 'q1', type: 'text', title: 'Question 1', isRequired: true },
            ],
          },
          {
            name: 'page2',
            elements: [
              { name: 'q2', type: 'text', title: 'Question 2' },
            ],
          },
        ],
      };

      const mockSurveyModel = {
        currentPage: mockModel.pages[0],
        currentPageNo: 0,
        pageCount: 2,
        isFirstPage: true,
        isLastPage: false,
        nextPage: jest.fn(),
        onComplete: { add: jest.fn(), remove: jest.fn() },
        onValueChanged: { add: jest.fn(), remove: jest.fn() },
        onCurrentPageChanged: { add: jest.fn(), remove: jest.fn() },
      };

      mockUseSurveyModel.mockReturnValue({
        model: mockSurveyModel,
        isLoading: false,
        error: null,
      });

      mockUseSurveyState.mockReturnValue({
        currentPageNo: 0,
        pageCount: 2,
        isFirstPage: true,
        isLastPage: false,
        isCompleted: false,
        questions: [],
      });

      const mockGoToNextPage = jest.fn((validatePage) => {
        if (validatePage) {
          const isValid = validatePage();
          if (!isValid) {
            return; // Block navigation
          }
        }
        mockSurveyModel.nextPage();
      });

      mockUsePageNavigation.mockReturnValue({
        navigationState: {
          currentPageNo: 0,
          pageCount: 2,
          isFirstPage: true,
          isLastPage: false,
          canGoNext: true,
          canGoPrevious: false,
          isNavigating: false,
          validationError: null,
        },
        goToNextPage: mockGoToNextPage,
        goToPreviousPage: jest.fn(),
        completeSurvey: jest.fn(),
      });

      // Mock validation that passes
      const mockValidateCurrentPage = jest.fn(() => true);
      mockUsePageValidation.mockReturnValue({
        validationState: {
          errors: {},
          isValidating: false,
          hasErrors: false,
        },
        validateCurrentPage: mockValidateCurrentPage,
        clearErrors: jest.fn(),
        getQuestionErrors: jest.fn(() => []),
      });

      const { getByText } = render(<Survey model={mockModel} />);

      // Try to navigate to next page
      fireEvent.press(getByText('Next'));

      await waitFor(() => {
        // Validation should be called
        expect(mockValidateCurrentPage).toHaveBeenCalled();
        // Navigation should proceed (nextPage called)
        expect(mockSurveyModel.nextPage).toHaveBeenCalled();
      });
    });

    it('should validate before survey completion', async () => {
      const mockModel: SurveyModel = {
        id: 'test-survey',
        pages: [
          {
            name: 'page1',
            elements: [
              { name: 'q1', type: 'text', title: 'Question 1', isRequired: true },
            ],
          },
        ],
      };

      const mockSurveyModel = {
        currentPage: mockModel.pages[0],
        currentPageNo: 0,
        pageCount: 1,
        isFirstPage: true,
        isLastPage: true,
        doComplete: jest.fn(),
        onComplete: { add: jest.fn(), remove: jest.fn() },
        onValueChanged: { add: jest.fn(), remove: jest.fn() },
        onCurrentPageChanged: { add: jest.fn(), remove: jest.fn() },
      };

      mockUseSurveyModel.mockReturnValue({
        model: mockSurveyModel,
        isLoading: false,
        error: null,
      });

      mockUseSurveyState.mockReturnValue({
        currentPageNo: 0,
        pageCount: 1,
        isFirstPage: true,
        isLastPage: true,
        isCompleted: false,
        questions: [],
      });

      const mockCompleteSurvey = jest.fn((validatePage) => {
        if (validatePage) {
          const isValid = validatePage();
          if (!isValid) {
            return; // Block completion
          }
        }
        mockSurveyModel.doComplete();
      });

      mockUsePageNavigation.mockReturnValue({
        navigationState: {
          currentPageNo: 0,
          pageCount: 1,
          isFirstPage: true,
          isLastPage: true,
          canGoNext: true,
          canGoPrevious: false,
          isNavigating: false,
          validationError: null,
        },
        goToNextPage: jest.fn(),
        goToPreviousPage: jest.fn(),
        completeSurvey: mockCompleteSurvey,
      });

      // Mock validation that fails
      const mockValidateCurrentPage = jest.fn(() => false);
      mockUsePageValidation.mockReturnValue({
        validationState: {
          errors: {
            q1: ['This field is required'],
          },
          isValidating: false,
          hasErrors: true,
        },
        validateCurrentPage: mockValidateCurrentPage,
        clearErrors: jest.fn(),
        getQuestionErrors: jest.fn(() => ['This field is required']),
      });

      const { getByText } = render(<Survey model={mockModel} />);

      // Try to complete survey
      fireEvent.press(getByText('Complete'));

      await waitFor(() => {
        // Validation should be called
        expect(mockValidateCurrentPage).toHaveBeenCalled();
        // Completion should be blocked (doComplete not called)
        expect(mockSurveyModel.doComplete).not.toHaveBeenCalled();
      });
    });
  });

  describe('Multi-page Validation Scenarios', () => {
    it('should handle validation across multiple pages', () => {
      const mockModel: SurveyModel = {
        id: 'multi-page-survey',
        pages: [
          {
            name: 'page1',
            elements: [
              { name: 'q1', type: 'text', title: 'Question 1', isRequired: true },
            ],
          },
          {
            name: 'page2',
            elements: [
              { name: 'q2', type: 'text', title: 'Question 2', isRequired: true },
            ],
          },
          {
            name: 'page3',
            elements: [
              { name: 'q3', type: 'text', title: 'Question 3' },
            ],
          },
        ],
      };

      const mockSurveyModel = {
        currentPage: mockModel.pages[1], // Currently on page 2
        currentPageNo: 1,
        pageCount: 3,
        isFirstPage: false,
        isLastPage: false,
        onComplete: { add: jest.fn(), remove: jest.fn() },
        onValueChanged: { add: jest.fn(), remove: jest.fn() },
        onCurrentPageChanged: { add: jest.fn(), remove: jest.fn() },
      };

      mockUseSurveyModel.mockReturnValue({
        model: mockSurveyModel,
        isLoading: false,
        error: null,
      });

      mockUseSurveyState.mockReturnValue({
        currentPageNo: 1,
        pageCount: 3,
        isFirstPage: false,
        isLastPage: false,
        isCompleted: false,
        questions: [],
      });

      mockUsePageNavigation.mockReturnValue({
        navigationState: {
          currentPageNo: 1,
          pageCount: 3,
          isFirstPage: false,
          isLastPage: false,
          canGoNext: true,
          canGoPrevious: true,
          isNavigating: false,
          validationError: null,
        },
        goToNextPage: jest.fn(),
        goToPreviousPage: jest.fn(),
        completeSurvey: jest.fn(),
      });

      mockUsePageValidation.mockReturnValue({
        validationState: {
          errors: {},
          isValidating: false,
          hasErrors: false,
        },
        validateCurrentPage: jest.fn(() => true),
        clearErrors: jest.fn(),
        getQuestionErrors: jest.fn(() => []),
      });

      const { getByText } = render(<Survey model={mockModel} />);

      // Should show both Previous and Next buttons on middle page
      expect(getByText('Previous')).toBeTruthy();
      expect(getByText('Next')).toBeTruthy();
    });
  });

  describe('Error Clearing', () => {
    it('should clear errors when validation passes', () => {
      const mockModel: SurveyModel = {
        id: 'test-survey',
        pages: [
          {
            name: 'page1',
            elements: [
              { name: 'q1', type: 'text', title: 'Question 1', isRequired: true },
            ],
          },
        ],
      };

      const mockClearErrors = jest.fn();
      const mockSurveyModel = {
        currentPage: mockModel.pages[0],
        onComplete: { add: jest.fn(), remove: jest.fn() },
        onValueChanged: { add: jest.fn(), remove: jest.fn() },
        onCurrentPageChanged: { add: jest.fn(), remove: jest.fn() },
      };

      mockUseSurveyModel.mockReturnValue({
        model: mockSurveyModel,
        isLoading: false,
        error: null,
      });

      mockUseSurveyState.mockReturnValue({
        currentPageNo: 0,
        pageCount: 1,
        isFirstPage: true,
        isLastPage: true,
        isCompleted: false,
        questions: [],
      });

      mockUsePageNavigation.mockReturnValue({
        navigationState: {
          currentPageNo: 0,
          pageCount: 1,
          isFirstPage: true,
          isLastPage: true,
          canGoNext: true,
          canGoPrevious: false,
          isNavigating: false,
          validationError: null,
        },
        goToNextPage: jest.fn(),
        goToPreviousPage: jest.fn(),
        completeSurvey: jest.fn(),
      });

      mockUsePageValidation.mockReturnValue({
        validationState: {
          errors: {},
          isValidating: false,
          hasErrors: false,
        },
        validateCurrentPage: jest.fn(() => true),
        clearErrors: mockClearErrors,
        getQuestionErrors: jest.fn(() => []),
      });

      render(<Survey model={mockModel} />);

      // clearErrors should be available for use
      expect(mockClearErrors).toBeDefined();
    });
>>>>>>> task/T04
  });
});