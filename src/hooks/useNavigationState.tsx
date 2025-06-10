import * as React from 'react';
const { useState, useEffect, useCallback, useMemo, useRef } = React;
import type { Model } from 'survey-core';
import type { ValidationState } from './useSurveyState';

export interface NavigationState {
  /**
   * Current page number (0-based)
   */
  currentPageNo: number;
  /**
   * Total number of pages
   */
  pageCount: number;
  /**
   * Number of visible pages
   */
  visiblePageCount: number;
  /**
   * Whether currently on first page
   */
  isFirstPage: boolean;
  /**
   * Whether currently on last page
   */
  isLastPage: boolean;
  /**
   * Whether this is a single page survey
   */
  isSinglePage: boolean;
  /**
   * Whether the survey is completed
   */
  isCompleted: boolean;
  /**
   * Whether the survey is in the process of completing
   */
  isCompleting: boolean;
  /**
   * Whether navigation is in progress
   */
  isNavigating: boolean;
  /**
   * Navigation error message
   */
  navigationError: string | null;
  /**
   * Whether to show previous button
   */
  showPrevious: boolean;
  /**
   * Whether to show next button
   */
  showNext: boolean;
  /**
   * Whether to show complete button
   */
  showComplete: boolean;
  /**
   * Whether can navigate to next page
   */
  canGoNext: boolean;
  /**
   * Whether can navigate to previous page
   */
  canGoPrevious: boolean;
  /**
   * Whether can complete the survey
   */
  canComplete: boolean;
}

export interface UseNavigationStateReturn {
  /**
   * Current navigation state
   */
  navigationState: NavigationState;
  /**
   * Navigate to next page with optional validation
   */
  navigateNext: (validatePage?: () => boolean) => Promise<void>;
  /**
   * Navigate to previous page
   */
  navigatePrevious: () => Promise<void>;
  /**
   * Complete the survey with optional validation
   */
  completeSurvey: (validatePage?: () => boolean) => Promise<void>;
}

/**
 * Hook for managing comprehensive navigation state with validation integration
 * Handles single-page surveys, completion flows, and complex button states
 * @param model - Survey model instance
 * @param validationState - Current validation state from useSurveyState
 * @returns Navigation state and control methods
 */
export function useNavigationState(
  model: Model | null,
  validationState: ValidationState
): UseNavigationStateReturn {
  // Use ref to track if navigation is in progress to prevent race conditions
  const isNavigatingRef = useRef(false);

  const [navigationState, setNavigationState] = useState<NavigationState>(() => {
    const visiblePageCount = model?.visiblePageCount || 0;
    const isSinglePage = visiblePageCount <= 1;
    const isFirstPage = model?.isFirstPage ?? true;
    const isLastPage = model?.isLastPage ?? true;
    const isCompleted = model?.getPropertyValue('isCompleted') === true;

    return {
      currentPageNo: model?.currentPageNo || 0,
      pageCount: model?.pageCount || 0,
      visiblePageCount,
      isFirstPage,
      isLastPage,
      isSinglePage,
      isCompleted,
      isCompleting: false,
      isNavigating: false,
      navigationError: null,
      showPrevious: !isFirstPage && !isSinglePage,
      showNext: !isLastPage && !isSinglePage && !isCompleted,
      showComplete: (isLastPage || isSinglePage) && !isCompleted,
      canGoNext: !isLastPage && !validationState.hasErrors && !validationState.isValidating,
      canGoPrevious: !isFirstPage && !validationState.isValidating,
      canComplete: (isLastPage || isSinglePage) && !validationState.hasErrors && !validationState.isValidating,
    };
  });

  // Calculate derived state based on model and validation
  const calculateNavigationState = useCallback((
    currentModel: Model | null,
    currentValidation: ValidationState
  ): NavigationState => {
    if (!currentModel) {
      return {
        currentPageNo: 0,
        pageCount: 0,
        visiblePageCount: 0,
        isFirstPage: true,
        isLastPage: true,
        isSinglePage: true,
        isCompleted: false,
        isCompleting: false,
        isNavigating: navigationState.isNavigating,
        navigationError: navigationState.navigationError,
        showPrevious: false,
        showNext: false,
        showComplete: false,
        canGoNext: false,
        canGoPrevious: false,
        canComplete: false,
      };
    }

    const visiblePageCount = currentModel.visiblePageCount || 0;
    const isSinglePage = visiblePageCount <= 1;
    const isFirstPage = currentModel.isFirstPage;
    const isLastPage = currentModel.isLastPage;
    const isCompleted = currentModel.getPropertyValue('isCompleted') === true || currentModel.state === 'completed';
    const checkErrorsMode = currentModel.checkErrorsMode || 'onNextPage';

    // Determine if validation should block navigation
    const hasBlockingErrors = currentValidation.hasErrors && checkErrorsMode !== 'onComplete';
    const isValidating = currentValidation.isValidating;

    return {
      currentPageNo: currentModel.currentPageNo || 0,
      pageCount: currentModel.pageCount || 0,
      visiblePageCount,
      isFirstPage,
      isLastPage,
      isSinglePage,
      isCompleted,
      isCompleting: navigationState.isCompleting,
      isNavigating: navigationState.isNavigating,
      navigationError: navigationState.navigationError,
      showPrevious: !isFirstPage && !isSinglePage,
      showNext: !isLastPage && !isSinglePage && !isCompleted,
      showComplete: (isLastPage || isSinglePage) && !isCompleted,
      canGoNext: !isLastPage && !hasBlockingErrors && !isValidating && !navigationState.isNavigating,
      canGoPrevious: !isFirstPage && !isValidating && !navigationState.isNavigating,
      canComplete: (isLastPage || isSinglePage) && !currentValidation.hasErrors && !isValidating && !navigationState.isNavigating,
    };
  }, [navigationState.isNavigating, navigationState.navigationError, navigationState.isCompleting]);

  // Update navigation state when model or validation changes
  useEffect(() => {
    setNavigationState(calculateNavigationState(model, validationState));
  }, [model, validationState, calculateNavigationState]);

  // Subscribe to survey events
  useEffect(() => {
    if (!model) return;

    const handlePageChanged = (sender: Model) => {
      setNavigationState(prev => ({
        ...calculateNavigationState(sender, validationState),
        navigationError: null, // Clear error on page change
        isNavigating: false,
      }));
    };

    const handleComplete = () => {
      setNavigationState(prev => ({
        ...prev,
        isCompleted: true,
        isCompleting: false,
        showNext: false,
        showComplete: false,
      }));
    };

    const handleCompleting = (_sender: Model, options: any) => {
      setNavigationState(prev => ({
        ...prev,
        isCompleting: true,
      }));
    };

    const handleAfterRenderPage = () => {
      // Update state after page render to ensure UI is in sync
      setNavigationState(calculateNavigationState(model, validationState));
    };

    // Subscribe to events
    model.onCurrentPageChanged.add(handlePageChanged);
    model.onComplete.add(handleComplete);
    
    if (model.onCompleting) {
      model.onCompleting.add(handleCompleting);
    }
    
    if (model.onAfterRenderPage) {
      model.onAfterRenderPage.add(handleAfterRenderPage);
    }

    // Cleanup
    return () => {
      model.onCurrentPageChanged.remove(handlePageChanged);
      model.onComplete.remove(handleComplete);
      
      if (model.onCompleting) {
        model.onCompleting.remove(handleCompleting);
      }
      
      if (model.onAfterRenderPage) {
        model.onAfterRenderPage.remove(handleAfterRenderPage);
      }
    };
  }, [model, validationState, calculateNavigationState]);

  /**
   * Navigate to next page with validation
   */
  const navigateNext = useCallback(async (validatePage?: () => boolean) => {
    if (!model || navigationState.isLastPage) {
      return;
    }

    // Check and set navigation lock atomically
    if (isNavigatingRef.current) {
      return;
    }
    isNavigatingRef.current = true;
    
    setNavigationState(prev => ({ ...prev, isNavigating: true, navigationError: null }));

    try {
      let isValid = true;

      // Use provided validation function
      if (validatePage) {
        isValid = validatePage();
      } else if (model.checkErrorsMode !== 'onComplete') {
        // Default validation if no function provided
        try {
          if (model.currentPage?.validate) {
            isValid = model.currentPage.validate(true, false);
          }
        } catch (error) {
          // Fallback if validation fails
          isValid = true;
        }
      }

      if (isValid) {
        model.nextPage();
        // Give a small delay to ensure state update is visible in tests
        await new Promise(resolve => setTimeout(resolve, 0));
        setNavigationState(prev => ({ ...prev, isNavigating: false, navigationError: null }));
      } else {
        setNavigationState(prev => ({
          ...prev,
          isNavigating: false,
          navigationError: 'Please complete all required fields',
        }));
      }
    } catch (error) {
      setNavigationState(prev => ({
        ...prev,
        isNavigating: false,
        navigationError: 'An error occurred during navigation',
      }));
    } finally {
      isNavigatingRef.current = false;
    }
  }, [model, navigationState.isLastPage]);

  /**
   * Navigate to previous page
   */
  const navigatePrevious = useCallback(async () => {
    if (!model || navigationState.isFirstPage) {
      return;
    }

    // Check and set navigation lock atomically
    if (isNavigatingRef.current) {
      return;
    }
    isNavigatingRef.current = true;
    
    setNavigationState(prev => ({ ...prev, isNavigating: true, navigationError: null }));

    try {
      model.prevPage();
      await new Promise(resolve => setTimeout(resolve, 0));
      setNavigationState(prev => ({ ...prev, isNavigating: false, navigationError: null }));
    } catch (error) {
      setNavigationState(prev => ({
        ...prev,
        isNavigating: false,
        navigationError: 'An error occurred during navigation',
      }));
    } finally {
      isNavigatingRef.current = false;
    }
  }, [model, navigationState.isFirstPage]);

  /**
   * Complete the survey with validation
   */
  const completeSurvey = useCallback(async (validatePage?: () => boolean) => {
    if (!model || (!navigationState.isLastPage && !navigationState.isSinglePage)) {
      return;
    }

    // Check and set navigation lock atomically
    if (isNavigatingRef.current) {
      return;
    }
    isNavigatingRef.current = true;
    
    setNavigationState(prev => ({ ...prev, isNavigating: true, isCompleting: true, navigationError: null }));

    try {
      let isValid = true;

      // Use provided validation function
      if (validatePage) {
        isValid = validatePage();
      } else {
        // Default validation
        try {
          if (model.completeLastPage) {
            isValid = model.completeLastPage();
          } else if (model.currentPage?.validate) {
            isValid = model.currentPage.validate(true, false);
          }
        } catch (error) {
          // Fallback if validation fails
          isValid = true;
        }
      }

      if (isValid) {
        if (model.completeLastPage && !model.completeLastPage()) {
          // completeLastPage returns false if validation failed
          setNavigationState(prev => ({
            ...prev,
            isNavigating: false,
            isCompleting: false,
            navigationError: 'Please complete all required fields before submitting',
          }));
        } else {
          // Survey completed successfully
          model.doComplete();
          await new Promise(resolve => setTimeout(resolve, 0));
          setNavigationState(prev => ({ 
            ...prev, 
            isNavigating: false,
            isCompleting: false,
            navigationError: null 
          }));
        }
      } else {
        setNavigationState(prev => ({
          ...prev,
          isNavigating: false,
          isCompleting: false,
          navigationError: 'Please complete all required fields before submitting',
        }));
      }
    } catch (error) {
      setNavigationState(prev => ({
        ...prev,
        isNavigating: false,
        isCompleting: false,
        navigationError: 'An error occurred while completing the survey',
      }));
    } finally {
      isNavigatingRef.current = false;
    }
  }, [model, navigationState.isLastPage, navigationState.isSinglePage]);

  return {
    navigationState,
    navigateNext,
    navigatePrevious,
    completeSurvey,
  };
}