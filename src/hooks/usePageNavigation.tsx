import * as React from 'react';
const { useState, useEffect, useCallback } = React;
import type { Model } from 'survey-core';

export interface NavigationState {
  currentPageNo: number;
  pageCount: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isNavigating: boolean;
  validationError: string | null;
}

export interface UsePageNavigationReturn {
  navigationState: NavigationState;
  goToNextPage: (validatePage?: () => boolean) => Promise<void>;
  goToPreviousPage: () => Promise<void>;
  completeSurvey: (validatePage?: () => boolean) => Promise<void>;
}

/**
 * Hook for managing survey page navigation with validation
 * Provides navigation methods and state for controlling survey flow
 * @param model - Survey model instance
 * @returns Navigation state and control methods
 */
export function usePageNavigation(model: Model | null): UsePageNavigationReturn {
  const [navigationState, setNavigationState] = useState<NavigationState>(() => ({
    currentPageNo: model?.currentPageNo || 0,
    pageCount: model?.pageCount || 0,
    isFirstPage: model?.isFirstPage ?? true,
    isLastPage: model?.isLastPage ?? true,
    canGoNext: model ? !model.isLastPage : false,
    canGoPrevious: model ? !model.isFirstPage : false,
    isNavigating: false,
    validationError: null,
  }));

  // Update navigation state when model changes
  useEffect(() => {
    if (!model) {
      setNavigationState({
        currentPageNo: 0,
        pageCount: 0,
        isFirstPage: true,
        isLastPage: true,
        canGoNext: false,
        canGoPrevious: false,
        isNavigating: false,
        validationError: null,
      });
      return;
    }

    // Initial state update
    setNavigationState((prev) => ({
      ...prev,
      currentPageNo: model.currentPageNo || 0,
      pageCount: model.pageCount || 0,
      isFirstPage: model.isFirstPage,
      isLastPage: model.isLastPage,
      canGoNext: !model.isLastPage,
      canGoPrevious: !model.isFirstPage,
    }));

    // Event handlers
    const handlePageChanged = (sender: Model) => {
      setNavigationState((prev) => ({
        ...prev,
        currentPageNo: sender.currentPageNo || 0,
        isFirstPage: sender.isFirstPage,
        isLastPage: sender.isLastPage,
        canGoNext: !sender.isLastPage,
        canGoPrevious: !sender.isFirstPage,
        validationError: null, // Clear validation error on page change
      }));
    };

    const handleValidationError = () => {
      setNavigationState((prev) => ({
        ...prev,
        validationError: 'Please fix the errors on this page',
      }));
    };

    // Subscribe to events
    model.onCurrentPageChanged.add(handlePageChanged);
    
    // Note: onValidatedErrorsOnCurrentPage may not exist in all survey-core versions
    if ((model as any).onValidatedErrorsOnCurrentPage) {
      (model as any).onValidatedErrorsOnCurrentPage.add(handleValidationError);
    }

    // Cleanup
    return () => {
      model.onCurrentPageChanged.remove(handlePageChanged);
      if ((model as any).onValidatedErrorsOnCurrentPage) {
        (model as any).onValidatedErrorsOnCurrentPage.remove(handleValidationError);
      }
    };
  }, [model]);

  /**
   * Navigate to the next page with validation
   */
  const goToNextPage = useCallback(async (validatePage?: () => boolean) => {
    if (!model || navigationState.isLastPage || navigationState.isNavigating) {
      return;
    }

    setNavigationState((prev) => ({ ...prev, isNavigating: true }));

    try {
      let isValid = true;
      
      // Use provided validation function if available
      if (validatePage) {
        isValid = validatePage();
      } else {
        // Fallback to basic validation approach
        try {
          // Use hasErrors if available, otherwise assume valid
          if ((model as any).hasErrors) {
            isValid = !(model as any).hasErrors();
          }
          // Check current page validation if available
          if (model.currentPage && (model.currentPage as any).hasErrors) {
            isValid = isValid && !(model.currentPage as any).hasErrors();
          }
        } catch (error) {
          // Fallback: assume valid if validation methods don't exist
          isValid = true;
        }
      }
      
      if (isValid) {
        model.nextPage();
        setNavigationState((prev) => ({ 
          ...prev, 
          isNavigating: false,
          validationError: null 
        }));
      } else {
        setNavigationState((prev) => ({
          ...prev,
          isNavigating: false,
          validationError: 'Please complete all required fields',
        }));
      }
    } catch (error) {
      setNavigationState((prev) => ({
        ...prev,
        isNavigating: false,
        validationError: 'An error occurred during navigation',
      }));
    }
  }, [model, navigationState.isLastPage, navigationState.isNavigating]);

  /**
   * Navigate to the previous page without validation
   */
  const goToPreviousPage = useCallback(async () => {
    if (!model || navigationState.isFirstPage || navigationState.isNavigating) {
      return;
    }

    setNavigationState((prev) => ({ ...prev, isNavigating: true }));

    try {
      model.prevPage();
      setNavigationState((prev) => ({ 
        ...prev, 
        isNavigating: false,
        validationError: null 
      }));
    } catch (error) {
      setNavigationState((prev) => ({
        ...prev,
        isNavigating: false,
        validationError: 'An error occurred during navigation',
      }));
    }
  }, [model, navigationState.isFirstPage, navigationState.isNavigating]);

  /**
   * Complete the survey with final validation
   */
  const completeSurvey = useCallback(async (validatePage?: () => boolean) => {
    if (!model || !navigationState.isLastPage || navigationState.isNavigating) {
      return;
    }

    setNavigationState((prev) => ({ ...prev, isNavigating: true }));

    try {
      let isValid = true;
      
      // Use provided validation function if available
      if (validatePage) {
        isValid = validatePage();
      } else {
        // Fallback to basic validation approach
        try {
          // Use completeLastPage if available, otherwise use doComplete directly
          if ((model as any).completeLastPage) {
            isValid = (model as any).completeLastPage();
          } else if ((model as any).hasErrors) {
            isValid = !(model as any).hasErrors();
          }
        } catch (error) {
          // Fallback: proceed with completion if validation methods don't exist
          isValid = true;
        }
      }
      
      if (isValid) {
        model.doComplete();
        setNavigationState((prev) => ({ 
          ...prev, 
          isNavigating: false,
          validationError: null 
        }));
      } else {
        setNavigationState((prev) => ({
          ...prev,
          isNavigating: false,
          validationError: 'Please complete all required fields before submitting',
        }));
      }
    } catch (error) {
      setNavigationState((prev) => ({
        ...prev,
        isNavigating: false,
        validationError: 'An error occurred while completing the survey',
      }));
    }
  }, [model, navigationState.isLastPage, navigationState.isNavigating]);

  return {
    navigationState,
    goToNextPage,
    goToPreviousPage,
    completeSurvey,
  };
}