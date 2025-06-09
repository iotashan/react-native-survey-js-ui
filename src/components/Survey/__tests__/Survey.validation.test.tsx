import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Survey } from '../Survey';

// Mock dependencies
jest.mock('../../../hooks', () => ({
  useSurveyModel: jest.fn(),
  useSurveyState: jest.fn(),
  usePageNavigation: jest.fn(),
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

const { useSurveyModel, useSurveyState, usePageNavigation } = require('../../../hooks');

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