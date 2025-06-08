import * as React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Model } from 'survey-core';
import { usePageNavigation } from '../usePageNavigation';

// Mock survey-core Model
jest.mock('survey-core', () => {
  const actualCore = jest.requireActual('survey-core');
  return {
    ...actualCore,
    Model: jest.fn().mockImplementation(() => ({
      currentPageNo: 0,
      pageCount: 3,
      isFirstPage: true,
      isLastPage: false,
      nextPage: jest.fn(),
      prevPage: jest.fn(),
      doComplete: jest.fn(),
      completeLastPage: jest.fn(),
      validate: jest.fn().mockReturnValue(true),
      currentPage: {
        hasErrors: false,
        validate: jest.fn().mockReturnValue(true),
      },
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
    })),
  };
});

describe('usePageNavigation', () => {
  let mockModel: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockModel = new Model({});
  });

  describe('Navigation State', () => {
    it('should return initial navigation state', () => {
      const { result } = renderHook(() => usePageNavigation(mockModel));

      expect(result.current.navigationState).toEqual({
        currentPageNo: 0,
        pageCount: 3,
        isFirstPage: true,
        isLastPage: false,
        canGoNext: true,
        canGoPrevious: false,
        isNavigating: false,
        validationError: null,
      });
    });

    it('should handle null model', () => {
      const { result } = renderHook(() => usePageNavigation(null));

      expect(result.current.navigationState).toEqual({
        currentPageNo: 0,
        pageCount: 0,
        isFirstPage: true,
        isLastPage: true,
        canGoNext: false,
        canGoPrevious: false,
        isNavigating: false,
        validationError: null,
      });
    });

    it('should update navigation state when page changes', () => {
      const { result } = renderHook(() => usePageNavigation(mockModel));

      // Simulate page change
      act(() => {
        mockModel.currentPageNo = 1;
        mockModel.isFirstPage = false;
        mockModel.isLastPage = false;
        
        const onPageChangedHandler = mockModel.onCurrentPageChanged.add.mock.calls[0][0];
        onPageChangedHandler(mockModel);
      });

      expect(result.current.navigationState.currentPageNo).toBe(1);
      expect(result.current.navigationState.isFirstPage).toBe(false);
      expect(result.current.navigationState.canGoPrevious).toBe(true);
    });

    it('should handle last page state', () => {
      mockModel.currentPageNo = 2;
      mockModel.isFirstPage = false;
      mockModel.isLastPage = true;

      const { result } = renderHook(() => usePageNavigation(mockModel));

      expect(result.current.navigationState.isLastPage).toBe(true);
      expect(result.current.navigationState.canGoNext).toBe(false);
    });

    it('should handle single page surveys', () => {
      mockModel.pageCount = 1;
      mockModel.isFirstPage = true;
      mockModel.isLastPage = true;

      const { result } = renderHook(() => usePageNavigation(mockModel));

      expect(result.current.navigationState.canGoNext).toBe(false);
      expect(result.current.navigationState.canGoPrevious).toBe(false);
    });
  });

  describe('Navigation Methods', () => {
    it('should navigate to next page with validation', async () => {
      const { result } = renderHook(() => usePageNavigation(mockModel));

      await act(async () => {
        await result.current.goToNextPage();
      });

      expect(mockModel.validate).toHaveBeenCalled();
      expect(mockModel.nextPage).toHaveBeenCalled();
    });

    it('should block navigation on validation errors', async () => {
      mockModel.validate.mockReturnValue(false);
      mockModel.currentPage.hasErrors = true;

      const { result } = renderHook(() => usePageNavigation(mockModel));

      await act(async () => {
        await result.current.goToNextPage();
      });

      expect(mockModel.validate).toHaveBeenCalled();
      expect(mockModel.nextPage).not.toHaveBeenCalled();
      expect(result.current.navigationState.validationError).toBeTruthy();
    });

    it('should navigate to previous page without validation', async () => {
      mockModel.currentPageNo = 1;
      mockModel.isFirstPage = false;

      const { result } = renderHook(() => usePageNavigation(mockModel));

      await act(async () => {
        await result.current.goToPreviousPage();
      });

      expect(mockModel.validate).not.toHaveBeenCalled();
      expect(mockModel.prevPage).toHaveBeenCalled();
    });

    it('should not navigate to previous page when on first page', async () => {
      const { result } = renderHook(() => usePageNavigation(mockModel));

      await act(async () => {
        await result.current.goToPreviousPage();
      });

      expect(mockModel.prevPage).not.toHaveBeenCalled();
    });

    it('should complete survey with validation', async () => {
      mockModel.currentPageNo = 2;
      mockModel.isLastPage = true;
      mockModel.completeLastPage.mockReturnValue(true);

      const { result } = renderHook(() => usePageNavigation(mockModel));

      await act(async () => {
        await result.current.completeSurvey();
      });

      expect(mockModel.completeLastPage).toHaveBeenCalled();
      expect(mockModel.doComplete).toHaveBeenCalled();
    });

    it('should block completion on validation errors', async () => {
      mockModel.currentPageNo = 2;
      mockModel.isLastPage = true;
      mockModel.completeLastPage.mockReturnValue(false);

      const { result } = renderHook(() => usePageNavigation(mockModel));

      await act(async () => {
        await result.current.completeSurvey();
      });

      expect(mockModel.completeLastPage).toHaveBeenCalled();
      expect(mockModel.doComplete).not.toHaveBeenCalled();
      expect(result.current.navigationState.validationError).toBeTruthy();
    });

    it('should show loading state during navigation', async () => {
      const { result } = renderHook(() => usePageNavigation(mockModel));

      // Test that loading state is false initially
      expect(result.current.navigationState.isNavigating).toBe(false);

      // Perform navigation
      await act(async () => {
        await result.current.goToNextPage();
      });

      // After navigation completes, loading state should be false again
      expect(result.current.navigationState.isNavigating).toBe(false);
      expect(mockModel.nextPage).toHaveBeenCalled();
    });
  });

  describe('Validation Error Handling', () => {
    it('should clear validation error on successful navigation', async () => {
      mockModel.validate.mockReturnValue(false);
      mockModel.currentPage.hasErrors = true;

      const { result } = renderHook(() => usePageNavigation(mockModel));

      // First attempt - should fail
      await act(async () => {
        await result.current.goToNextPage();
      });

      expect(result.current.navigationState.validationError).toBeTruthy();

      // Fix validation
      mockModel.validate.mockReturnValue(true);
      mockModel.currentPage.hasErrors = false;

      // Second attempt - should succeed
      await act(async () => {
        await result.current.goToNextPage();
      });

      expect(result.current.navigationState.validationError).toBeNull();
    });

    it('should handle validation errors from event', () => {
      const { result } = renderHook(() => usePageNavigation(mockModel));

      act(() => {
        const onValidationErrorHandler = mockModel.onValidatedErrorsOnCurrentPage.add.mock.calls[0][0];
        onValidationErrorHandler(mockModel, { errors: ['Field is required'] });
      });

      expect(result.current.navigationState.validationError).toBe('Please fix the errors on this page');
    });
  });

  describe('Edge Cases', () => {
    it('should handle model change', () => {
      const { result, rerender } = renderHook(
        ({ model }) => usePageNavigation(model),
        { initialProps: { model: mockModel } }
      );

      const newModel = new Model({});
      newModel.currentPageNo = 1;
      newModel.pageCount = 5;

      rerender({ model: newModel });

      expect(result.current.navigationState.currentPageNo).toBe(1);
      expect(result.current.navigationState.pageCount).toBe(5);
    });

    it('should cleanup event listeners on unmount', () => {
      const { unmount } = renderHook(() => usePageNavigation(mockModel));

      unmount();

      expect(mockModel.onCurrentPageChanged.remove).toHaveBeenCalled();
      expect(mockModel.onValidatedErrorsOnCurrentPage.remove).toHaveBeenCalled();
    });

    it('should handle async validation properly', async () => {
      mockModel.validate.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(true), 100);
        });
      });

      const { result } = renderHook(() => usePageNavigation(mockModel));

      await act(async () => {
        await result.current.goToNextPage();
      });

      expect(mockModel.nextPage).toHaveBeenCalled();
    });

    it('should handle read-only surveys', () => {
      mockModel.mode = 'display';

      const { result } = renderHook(() => usePageNavigation(mockModel));

      expect(result.current.navigationState.canGoNext).toBe(true); // Should allow navigation in read-only mode
    });
  });

  describe('Navigation Rules', () => {
    it('should determine correct button visibility for first page', () => {
      const { result } = renderHook(() => usePageNavigation(mockModel));

      expect(result.current.navigationState.canGoPrevious).toBe(false);
      expect(result.current.navigationState.canGoNext).toBe(true);
    });

    it('should determine correct button visibility for middle page', () => {
      mockModel.currentPageNo = 1;
      mockModel.isFirstPage = false;
      mockModel.isLastPage = false;

      const { result } = renderHook(() => usePageNavigation(mockModel));

      expect(result.current.navigationState.canGoPrevious).toBe(true);
      expect(result.current.navigationState.canGoNext).toBe(true);
    });

    it('should determine correct button visibility for last page', () => {
      mockModel.currentPageNo = 2;
      mockModel.isFirstPage = false;
      mockModel.isLastPage = true;

      const { result } = renderHook(() => usePageNavigation(mockModel));

      expect(result.current.navigationState.canGoPrevious).toBe(true);
      expect(result.current.navigationState.canGoNext).toBe(false);
    });
  });
});