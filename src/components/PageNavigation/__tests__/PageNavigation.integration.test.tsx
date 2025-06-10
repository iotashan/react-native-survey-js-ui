import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Model } from 'survey-core';
import { PageNavigation } from '../PageNavigation';
import { useNavigationState } from '../../../hooks/useNavigationState';
import { useSurveyState } from '../../../hooks/useSurveyState';

// Mock the hooks
jest.mock('../../../hooks/useNavigationState');
jest.mock('../../../hooks/useSurveyState');

describe('PageNavigation Integration with useNavigationState', () => {
  const mockUseNavigationState = useNavigationState as jest.MockedFunction<typeof useNavigationState>;
  const mockUseSurveyState = useSurveyState as jest.MockedFunction<typeof useSurveyState>;

  let mockNavigateNext: jest.Mock;
  let mockNavigatePrevious: jest.Mock;
  let mockCompleteSurvey: jest.Mock;
  let mockValidateCurrentPage: jest.Mock;

  beforeEach(() => {
    mockNavigateNext = jest.fn();
    mockNavigatePrevious = jest.fn();
    mockCompleteSurvey = jest.fn();
    mockValidateCurrentPage = jest.fn().mockReturnValue(true);

    // Mock survey state with validation
    mockUseSurveyState.mockReturnValue({
      data: {},
      currentPageNo: 0,
      pageCount: 3,
      isFirstPage: true,
      isLastPage: false,
      isCompleted: false,
      questions: [],
      validation: {
        hasErrors: false,
        errors: {},
        validationMessages: [],
        isValidating: false,
      },
      validateCurrentPage: mockValidateCurrentPage,
      validateAllPages: jest.fn(),
      clearValidationErrors: jest.fn(),
      validateQuestion: jest.fn(),
      clearErrors: jest.fn(),
      getQuestionErrors: jest.fn(),
    });
  });

  const renderPageNavigation = (navigationState: any) => {
    mockUseNavigationState.mockReturnValue({
      navigationState,
      navigateNext: mockNavigateNext,
      navigatePrevious: mockNavigatePrevious,
      completeSurvey: mockCompleteSurvey,
    });

    // Component wrapper that uses the hooks
    const TestComponent = () => {
      const model = {} as Model; // Mock model
      const surveyState = mockUseSurveyState(model);
      const { navigationState, navigateNext, navigatePrevious, completeSurvey } = mockUseNavigationState(model, surveyState.validation);

      return (
        <PageNavigation
          navigationState={{
            currentPageNo: navigationState.currentPageNo,
            pageCount: navigationState.pageCount,
            isFirstPage: navigationState.isFirstPage,
            isLastPage: navigationState.isLastPage,
            canGoNext: navigationState.canGoNext,
            canGoPrevious: navigationState.canGoPrevious,
            isNavigating: navigationState.isNavigating,
            validationError: navigationState.navigationError,
          }}
          onNext={() => navigateNext(surveyState.validateCurrentPage)}
          onPrevious={() => navigatePrevious()}
          onComplete={() => completeSurvey(surveyState.validateCurrentPage)}
          validationState={surveyState.validation}
        />
      );
    };

    return render(<TestComponent />);
  };

  describe('Multi-page Survey Navigation', () => {
    it('should navigate to next page with validation on first page', async () => {
      const { getByText } = renderPageNavigation({
        currentPageNo: 0,
        pageCount: 3,
        visiblePageCount: 3,
        isFirstPage: true,
        isLastPage: false,
        isSinglePage: false,
        isCompleted: false,
        isCompleting: false,
        isNavigating: false,
        navigationError: null,
        showPrevious: false,
        showNext: true,
        showComplete: false,
        canGoNext: true,
        canGoPrevious: false,
        canComplete: false,
      });

      const nextButton = getByText('Next');
      fireEvent.press(nextButton);

      await waitFor(() => {
        expect(mockNavigateNext).toHaveBeenCalledWith(mockValidateCurrentPage);
      });
    });

    it('should show both navigation buttons on middle page', () => {
      const { getByText } = renderPageNavigation({
        currentPageNo: 1,
        pageCount: 3,
        visiblePageCount: 3,
        isFirstPage: false,
        isLastPage: false,
        isSinglePage: false,
        isCompleted: false,
        isCompleting: false,
        isNavigating: false,
        navigationError: null,
        showPrevious: true,
        showNext: true,
        showComplete: false,
        canGoNext: true,
        canGoPrevious: true,
        canComplete: false,
      });

      expect(getByText('Previous')).toBeTruthy();
      expect(getByText('Next')).toBeTruthy();
    });

    it('should show complete button on last page', () => {
      const { getByText, queryByText } = renderPageNavigation({
        currentPageNo: 2,
        pageCount: 3,
        visiblePageCount: 3,
        isFirstPage: false,
        isLastPage: true,
        isSinglePage: false,
        isCompleted: false,
        isCompleting: false,
        isNavigating: false,
        navigationError: null,
        showPrevious: true,
        showNext: false,
        showComplete: true,
        canGoNext: false,
        canGoPrevious: true,
        canComplete: true,
      });

      expect(getByText('Previous')).toBeTruthy();
      expect(queryByText('Next')).toBeNull();
      expect(getByText('Complete')).toBeTruthy();
    });
  });

  describe('Single Page Survey', () => {
    it('should only show complete button for single page survey', () => {
      const { getByText, queryByText } = renderPageNavigation({
        currentPageNo: 0,
        pageCount: 1,
        visiblePageCount: 1,
        isFirstPage: true,
        isLastPage: true,
        isSinglePage: true,
        isCompleted: false,
        isCompleting: false,
        isNavigating: false,
        navigationError: null,
        showPrevious: false,
        showNext: false,
        showComplete: true,
        canGoNext: false,
        canGoPrevious: false,
        canComplete: true,
      });

      expect(queryByText('Previous')).toBeNull();
      expect(queryByText('Next')).toBeNull();
      expect(getByText('Complete')).toBeTruthy();
    });
  });

  describe('Validation Integration', () => {
    it('should disable next button when validation errors exist', () => {
      mockUseSurveyState.mockReturnValue({
        ...mockUseSurveyState(),
        validation: {
          hasErrors: true,
          errors: {
            question1: ['This field is required'],
          },
          validationMessages: [
            { questionName: 'question1', message: 'This field is required' },
          ],
          isValidating: false,
        },
      });

      const { getByText, getByTestId } = renderPageNavigation({
        currentPageNo: 0,
        pageCount: 3,
        visiblePageCount: 3,
        isFirstPage: true,
        isLastPage: false,
        isSinglePage: false,
        isCompleted: false,
        isCompleting: false,
        isNavigating: false,
        navigationError: null,
        showPrevious: false,
        showNext: true,
        showComplete: false,
        canGoNext: false, // Disabled due to validation errors
        canGoPrevious: false,
        canComplete: false,
      });

      const nextButton = getByText('Next');
      
      // The navigation state has canGoNext: false, so button should be disabled
      // Try to press the button
      fireEvent.press(nextButton);
      
      // Since button is disabled (canGoNext: false), navigation should not be called
      expect(mockNavigateNext).not.toHaveBeenCalled();

      // Should show validation errors
      expect(getByTestId('page-validation-errors')).toBeTruthy();
      expect(getByText('• This field is required')).toBeTruthy();
    });

    it('should show navigation error when validation fails', () => {
      const { getByText, getByTestId } = renderPageNavigation({
        currentPageNo: 0,
        pageCount: 3,
        visiblePageCount: 3,
        isFirstPage: true,
        isLastPage: false,
        isSinglePage: false,
        isCompleted: false,
        isCompleting: false,
        isNavigating: false,
        navigationError: 'Please complete all required fields',
        showPrevious: false,
        showNext: true,
        showComplete: false,
        canGoNext: true,
        canGoPrevious: false,
        canComplete: false,
      });

      expect(getByTestId('validation-error')).toBeTruthy();
      expect(getByText('Please complete all required fields')).toBeTruthy();
    });
  });

  describe('Navigation State', () => {
    it('should show loading indicator during navigation', () => {
      const { getByTestId } = renderPageNavigation({
        currentPageNo: 0,
        pageCount: 3,
        visiblePageCount: 3,
        isFirstPage: true,
        isLastPage: false,
        isSinglePage: false,
        isCompleted: false,
        isCompleting: false,
        isNavigating: true,
        navigationError: null,
        showPrevious: false,
        showNext: true,
        showComplete: false,
        canGoNext: false, // Disabled during navigation
        canGoPrevious: false,
        canComplete: false,
      });

      expect(getByTestId('navigation-loading')).toBeTruthy();
    });

    it('should handle completed survey state', () => {
      const { queryByText } = renderPageNavigation({
        currentPageNo: 2,
        pageCount: 3,
        visiblePageCount: 3,
        isFirstPage: false,
        isLastPage: true,
        isSinglePage: false,
        isCompleted: true,
        isCompleting: false,
        isNavigating: false,
        navigationError: null,
        showPrevious: false, // Hidden when completed
        showNext: false,
        showComplete: false, // Hidden when completed
        canGoNext: false,
        canGoPrevious: false,
        canComplete: false,
      });

      // The PageNavigation component uses its own logic for button visibility
      // It shows Previous button if !isFirstPage, Next if !isLastPage, Complete if isLastPage
      // So on last page, it will show Previous and Complete buttons regardless of our state
      const previousButton = queryByText('Previous');
      const nextButton = queryByText('Next');
      const completeButton = queryByText('Complete');
      
      // Based on PageNavigation's logic:
      // - Previous shown because !isFirstPage (false)
      // - Next hidden because isLastPage (true)
      // - Complete shown because isLastPage (true)
      expect(previousButton).toBeTruthy();
      expect(nextButton).toBeNull();
      expect(completeButton).toBeTruthy();
      
      // But they should be disabled due to the completed state
      fireEvent.press(previousButton);
      expect(mockNavigatePrevious).not.toHaveBeenCalled();
      
      fireEvent.press(completeButton);
      expect(mockCompleteSurvey).not.toHaveBeenCalled();
    });
  });
});