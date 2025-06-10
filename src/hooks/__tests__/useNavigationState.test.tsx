import * as React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { Model } from 'survey-core';
import { useNavigationState } from '../useNavigationState';
import type { ValidationState } from '../useSurveyState';

// Mock survey-core
jest.mock('survey-core', () => ({
  Model: jest.fn(),
}));

describe('useNavigationState', () => {
  let mockModel: any;
  let mockValidationState: ValidationState;

  beforeEach(() => {
    // Reset mock model
    mockModel = {
      currentPageNo: 0,
      pageCount: 3,
      visiblePageCount: 3,
      isFirstPage: true,
      isLastPage: false,
      state: 'running',
      currentPage: {
        questions: [],
      },
      checkErrorsMode: 'onNextPage',
      nextPage: jest.fn(),
      prevPage: jest.fn(),
      completeLastPage: jest.fn(),
      doComplete: jest.fn(),
      onCurrentPageChanged: {
        add: jest.fn(),
        remove: jest.fn(),
      },
      onComplete: {
        add: jest.fn(),
        remove: jest.fn(),
      },
      onCompleting: {
        add: jest.fn(),
        remove: jest.fn(),
      },
      onAfterRenderPage: {
        add: jest.fn(),
        remove: jest.fn(),
      },
      getPropertyValue: jest.fn((prop) => {
        if (prop === 'isCompleted') return false;
        return null;
      }),
    };

    mockValidationState = {
      hasErrors: false,
      errors: {},
      validationMessages: [],
      isValidating: false,
    };
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      expect(result.current.navigationState).toEqual({
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
    });

    it('should handle null model', () => {
      const { result } = renderHook(() => 
        useNavigationState(null, mockValidationState)
      );

      expect(result.current.navigationState).toEqual({
        currentPageNo: 0,
        pageCount: 0,
        visiblePageCount: 0,
        isFirstPage: true,
        isLastPage: true,
        isSinglePage: true,
        isCompleted: false,
        isCompleting: false,
        isNavigating: false,
        navigationError: null,
        showPrevious: false,
        showNext: false,
        showComplete: false,
        canGoNext: false,
        canGoPrevious: false,
        canComplete: false,
      });
    });
  });

  describe('Single Page Survey', () => {
    beforeEach(() => {
      mockModel.visiblePageCount = 1;
      mockModel.pageCount = 1;
      mockModel.isFirstPage = true;
      mockModel.isLastPage = true;
    });

    it('should detect single page survey', () => {
      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      expect(result.current.navigationState.isSinglePage).toBe(true);
    });

    it('should hide navigation buttons for single page', () => {
      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      expect(result.current.navigationState.showPrevious).toBe(false);
      expect(result.current.navigationState.showNext).toBe(false);
      expect(result.current.navigationState.showComplete).toBe(true);
    });

    it('should allow completion on single page', () => {
      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      expect(result.current.navigationState.canComplete).toBe(true);
    });
  });

  describe('Multi-Page Navigation', () => {
    it('should show next button on first page', () => {
      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      expect(result.current.navigationState.showPrevious).toBe(false);
      expect(result.current.navigationState.showNext).toBe(true);
      expect(result.current.navigationState.canGoNext).toBe(true);
    });

    it('should show both buttons on middle page', () => {
      mockModel.currentPageNo = 1;
      mockModel.isFirstPage = false;
      mockModel.isLastPage = false;

      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      expect(result.current.navigationState.showPrevious).toBe(true);
      expect(result.current.navigationState.showNext).toBe(true);
      expect(result.current.navigationState.canGoPrevious).toBe(true);
      expect(result.current.navigationState.canGoNext).toBe(true);
    });

    it('should show complete button on last page', () => {
      mockModel.currentPageNo = 2;
      mockModel.isFirstPage = false;
      mockModel.isLastPage = true;

      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      expect(result.current.navigationState.showPrevious).toBe(true);
      expect(result.current.navigationState.showNext).toBe(false);
      expect(result.current.navigationState.showComplete).toBe(true);
      expect(result.current.navigationState.canComplete).toBe(true);
    });
  });

  describe('Validation Integration', () => {
    it('should disable next when validation errors exist', () => {
      mockValidationState.hasErrors = true;
      mockValidationState.errors = {
        question1: ['This field is required'],
      };

      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      expect(result.current.navigationState.canGoNext).toBe(false);
    });

    it('should allow next when checkErrorsMode is onComplete', () => {
      mockValidationState.hasErrors = true;
      mockModel.checkErrorsMode = 'onComplete';

      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      expect(result.current.navigationState.canGoNext).toBe(true);
    });

    it('should disable complete when validation errors exist', () => {
      mockModel.currentPageNo = 2;
      mockModel.isLastPage = true;
      mockValidationState.hasErrors = true;

      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      expect(result.current.navigationState.canComplete).toBe(false);
    });

    it('should disable navigation during validation', () => {
      mockValidationState.isValidating = true;

      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      expect(result.current.navigationState.canGoNext).toBe(false);
      expect(result.current.navigationState.canGoPrevious).toBe(false);
      expect(result.current.navigationState.canComplete).toBe(false);
    });
  });

  describe('Navigation Methods', () => {
    it('should handle next page navigation', async () => {
      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      await act(async () => {
        await result.current.navigateNext();
      });

      expect(mockModel.nextPage).toHaveBeenCalled();
    });

    it('should validate before next page navigation', async () => {
      const validateFn = jest.fn().mockReturnValue(true);
      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      await act(async () => {
        await result.current.navigateNext(validateFn);
      });

      expect(validateFn).toHaveBeenCalled();
      expect(mockModel.nextPage).toHaveBeenCalled();
    });

    it('should not navigate next if validation fails', async () => {
      const validateFn = jest.fn().mockReturnValue(false);
      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      await act(async () => {
        await result.current.navigateNext(validateFn);
      });

      expect(validateFn).toHaveBeenCalled();
      expect(mockModel.nextPage).not.toHaveBeenCalled();
      expect(result.current.navigationState.navigationError).toBe(
        'Please complete all required fields'
      );
    });

    it('should handle previous page navigation', async () => {
      mockModel.currentPageNo = 1;
      mockModel.isFirstPage = false;

      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      await act(async () => {
        await result.current.navigatePrevious();
      });

      expect(mockModel.prevPage).toHaveBeenCalled();
    });

    it('should handle survey completion', async () => {
      mockModel.currentPageNo = 2;
      mockModel.isLastPage = true;

      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      await act(async () => {
        await result.current.completeSurvey();
      });

      expect(mockModel.completeLastPage).toHaveBeenCalled();
    });

    it('should validate before completion', async () => {
      mockModel.currentPageNo = 2;
      mockModel.isLastPage = true;
      const validateFn = jest.fn().mockReturnValue(true);

      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      await act(async () => {
        await result.current.completeSurvey(validateFn);
      });

      expect(validateFn).toHaveBeenCalled();
      expect(mockModel.completeLastPage).toHaveBeenCalled();
    });
  });

  describe('State Transitions', () => {
    it('should set isNavigating during navigation', async () => {
      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      // Initially should not be navigating
      expect(result.current.navigationState.isNavigating).toBe(false);

      await act(async () => {
        await result.current.navigateNext();
      });

      // Should have called nextPage and reset isNavigating
      expect(mockModel.nextPage).toHaveBeenCalled();
      expect(result.current.navigationState.isNavigating).toBe(false);
    });

    it('should clear navigation error on successful navigation', async () => {
      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      // Set an error first
      act(() => {
        result.current.navigationState.navigationError = 'Test error';
      });

      await act(async () => {
        await result.current.navigateNext();
      });

      expect(result.current.navigationState.navigationError).toBeNull();
    });

    it('should handle completion state transitions', async () => {
      mockModel.currentPageNo = 2;
      mockModel.isLastPage = true;
      mockModel.completeLastPage.mockReturnValue(true);

      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      await act(async () => {
        await result.current.completeSurvey();
      });

      expect(result.current.navigationState.isCompleting).toBe(false);
    });
  });

  describe('Event Handlers', () => {
    it('should update state on page change', () => {
      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      // Get the handler that was registered
      const handler = mockModel.onCurrentPageChanged.add.mock.calls[0][0];

      // Simulate page change
      act(() => {
        mockModel.currentPageNo = 1;
        mockModel.isFirstPage = false;
        handler(mockModel);
      });

      expect(result.current.navigationState.currentPageNo).toBe(1);
      expect(result.current.navigationState.isFirstPage).toBe(false);
    });

    it('should handle completion event', () => {
      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      // Get the handler that was registered
      const handler = mockModel.onComplete.add.mock.calls[0][0];

      act(() => {
        handler(mockModel);
      });

      expect(result.current.navigationState.isCompleted).toBe(true);
    });

    it('should handle completing event', () => {
      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      // Get the handler that was registered
      const handler = mockModel.onCompleting.add.mock.calls[0][0];

      act(() => {
        handler(mockModel, { allowComplete: true });
      });

      expect(result.current.navigationState.isCompleting).toBe(true);
    });

    it('should cleanup event handlers on unmount', () => {
      const { unmount } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      unmount();

      expect(mockModel.onCurrentPageChanged.remove).toHaveBeenCalled();
      expect(mockModel.onComplete.remove).toHaveBeenCalled();
      expect(mockModel.onCompleting.remove).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid navigation attempts', async () => {
      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      // Attempt multiple navigations simultaneously
      await act(async () => {
        const promises = [
          result.current.navigateNext(),
          result.current.navigateNext(),
          result.current.navigateNext(),
        ];
        await Promise.all(promises);
      });

      // Should only navigate once
      expect(mockModel.nextPage).toHaveBeenCalledTimes(1);
    });

    it('should handle navigation errors gracefully', async () => {
      mockModel.nextPage.mockImplementation(() => {
        throw new Error('Navigation failed');
      });

      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      await act(async () => {
        await result.current.navigateNext();
      });

      expect(result.current.navigationState.navigationError).toBe(
        'An error occurred during navigation'
      );
      expect(result.current.navigationState.isNavigating).toBe(false);
    });

    it('should handle survey in preview mode', () => {
      mockModel.mode = 'preview';

      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      // In preview mode, navigation should still work
      expect(result.current.navigationState.canGoNext).toBe(true);
    });

    it('should handle completed survey state', () => {
      mockModel.getPropertyValue = jest.fn((prop) => {
        if (prop === 'isCompleted') return true;
        return null;
      });
      mockModel.state = 'completed';

      const { result } = renderHook(() => 
        useNavigationState(mockModel, mockValidationState)
      );

      expect(result.current.navigationState.isCompleted).toBe(true);
      expect(result.current.navigationState.showNext).toBe(false);
      expect(result.current.navigationState.showComplete).toBe(false);
    });
  });
});