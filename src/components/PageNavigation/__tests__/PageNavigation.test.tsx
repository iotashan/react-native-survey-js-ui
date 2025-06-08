import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PageNavigation } from '../PageNavigation';
import type { NavigationState } from '../../../hooks/usePageNavigation';

describe('PageNavigation', () => {
  const defaultNavigationState: NavigationState = {
    currentPageNo: 0,
    pageCount: 3,
    isFirstPage: true,
    isLastPage: false,
    canGoNext: true,
    canGoPrevious: false,
    isNavigating: false,
    validationError: null,
  };

  const mockHandlers = {
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    onComplete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Button Rendering', () => {
    it('should render Next button on non-last page', () => {
      const { getByText, queryByText } = render(
        <PageNavigation
          navigationState={defaultNavigationState}
          {...mockHandlers}
        />
      );

      expect(getByText('Next')).toBeTruthy();
      expect(queryByText('Complete')).toBeNull();
    });

    it('should render Complete button on last page', () => {
      const { getByText, queryByText } = render(
        <PageNavigation
          navigationState={{
            ...defaultNavigationState,
            currentPageNo: 2,
            isFirstPage: false,
            isLastPage: true,
            canGoNext: false,
            canGoPrevious: true,
          }}
          {...mockHandlers}
        />
      );

      expect(getByText('Complete')).toBeTruthy();
      expect(queryByText('Next')).toBeNull();
    });

    it('should render Previous button when not on first page', () => {
      const { getByText } = render(
        <PageNavigation
          navigationState={{
            ...defaultNavigationState,
            currentPageNo: 1,
            isFirstPage: false,
            canGoPrevious: true,
          }}
          {...mockHandlers}
        />
      );

      expect(getByText('Previous')).toBeTruthy();
    });

    it('should not render Previous button on first page', () => {
      const { queryByText } = render(
        <PageNavigation
          navigationState={defaultNavigationState}
          {...mockHandlers}
        />
      );

      expect(queryByText('Previous')).toBeNull();
    });

    it('should render only Complete button for single page survey', () => {
      const { getByText, queryByText } = render(
        <PageNavigation
          navigationState={{
            ...defaultNavigationState,
            pageCount: 1,
            isFirstPage: true,
            isLastPage: true,
            canGoNext: false,
            canGoPrevious: false,
          }}
          {...mockHandlers}
        />
      );

      expect(getByText('Complete')).toBeTruthy();
      expect(queryByText('Next')).toBeNull();
      expect(queryByText('Previous')).toBeNull();
    });

    it('should support custom button text', () => {
      const { getByText } = render(
        <PageNavigation
          navigationState={{
            ...defaultNavigationState,
            currentPageNo: 1,
            isFirstPage: false,
            canGoPrevious: true,
          }}
          {...mockHandlers}
          nextText="Continue"
          previousText="Back"
        />
      );

      expect(getByText('Continue')).toBeTruthy();
      expect(getByText('Back')).toBeTruthy();
    });
  });

  describe('Button States', () => {
    it('should disable buttons when navigating', () => {
      const { getByLabelText } = render(
        <PageNavigation
          navigationState={{
            ...defaultNavigationState,
            isNavigating: true,
          }}
          {...mockHandlers}
        />
      );

      const nextButton = getByLabelText('Go to next page');
      expect(nextButton.props.disabled).toBe(true);
    });

    it('should show loading indicator when navigating', () => {
      const { getByTestId } = render(
        <PageNavigation
          navigationState={{
            ...defaultNavigationState,
            isNavigating: true,
          }}
          {...mockHandlers}
        />
      );

      expect(getByTestId('navigation-loading')).toBeTruthy();
    });

    it('should disable Next when canGoNext is false', () => {
      const { getByLabelText } = render(
        <PageNavigation
          navigationState={{
            ...defaultNavigationState,
            canGoNext: false,
          }}
          {...mockHandlers}
        />
      );

      const nextButton = getByLabelText('Go to next page');
      expect(nextButton.props.disabled).toBe(true);
    });

    it('should disable Previous when canGoPrevious is false', () => {
      const { getByLabelText } = render(
        <PageNavigation
          navigationState={{
            ...defaultNavigationState,
            currentPageNo: 1,
            isFirstPage: false,
            canGoPrevious: false,
          }}
          {...mockHandlers}
        />
      );

      const prevButton = getByLabelText('Go to previous page');
      expect(prevButton.props.disabled).toBe(true);
    });
  });

  describe('Click Handlers', () => {
    it('should call onNext when Next button is clicked', () => {
      const { getByText } = render(
        <PageNavigation
          navigationState={defaultNavigationState}
          {...mockHandlers}
        />
      );

      fireEvent.press(getByText('Next'));
      expect(mockHandlers.onNext).toHaveBeenCalledTimes(1);
    });

    it('should call onPrevious when Previous button is clicked', () => {
      const { getByText } = render(
        <PageNavigation
          navigationState={{
            ...defaultNavigationState,
            currentPageNo: 1,
            isFirstPage: false,
            canGoPrevious: true,
          }}
          {...mockHandlers}
        />
      );

      fireEvent.press(getByText('Previous'));
      expect(mockHandlers.onPrevious).toHaveBeenCalledTimes(1);
    });

    it('should call onComplete when Complete button is clicked', () => {
      const { getByText } = render(
        <PageNavigation
          navigationState={{
            ...defaultNavigationState,
            isLastPage: true,
            canGoNext: true, // Complete button should work even if canGoNext is true
          }}
          {...mockHandlers}
        />
      );

      fireEvent.press(getByText('Complete'));
      expect(mockHandlers.onComplete).toHaveBeenCalledTimes(1);
    });

    it('should not call handlers when buttons are disabled', () => {
      const { getByLabelText } = render(
        <PageNavigation
          navigationState={{
            ...defaultNavigationState,
            isNavigating: true,
          }}
          {...mockHandlers}
        />
      );

      const nextButton = getByLabelText('Go to next page');
      // Button should be disabled
      expect(nextButton.props.disabled).toBe(true);
      
      // In React Native, disabled TouchableOpacity still fires press events
      // but our component should handle this internally
      fireEvent.press(nextButton);
      expect(mockHandlers.onNext).not.toHaveBeenCalled();
    });
  });

  describe('Validation Error Display', () => {
    it('should display validation error when present', () => {
      const { getByText } = render(
        <PageNavigation
          navigationState={{
            ...defaultNavigationState,
            validationError: 'Please complete all required fields',
          }}
          {...mockHandlers}
        />
      );

      expect(getByText('Please complete all required fields')).toBeTruthy();
    });

    it('should not display error section when no error', () => {
      const { queryByTestId } = render(
        <PageNavigation
          navigationState={defaultNavigationState}
          {...mockHandlers}
        />
      );

      expect(queryByTestId('validation-error')).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = render(
        <PageNavigation
          navigationState={{
            ...defaultNavigationState,
            currentPageNo: 1,
            isFirstPage: false,
            canGoPrevious: true,
          }}
          {...mockHandlers}
        />
      );

      expect(getByLabelText('Go to next page')).toBeTruthy();
      expect(getByLabelText('Go to previous page')).toBeTruthy();
    });

    it('should have disabled accessibility state', () => {
      const { getByLabelText } = render(
        <PageNavigation
          navigationState={{
            ...defaultNavigationState,
            canGoNext: false,
          }}
          {...mockHandlers}
        />
      );

      const nextButton = getByLabelText('Go to next page');
      expect(nextButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('should have proper role for navigation container', () => {
      const { getByTestId } = render(
        <PageNavigation
          navigationState={defaultNavigationState}
          {...mockHandlers}
        />
      );

      const container = getByTestId('page-navigation');
      expect(container.props.accessibilityRole).toBe('navigation');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom container style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByTestId } = render(
        <PageNavigation
          navigationState={defaultNavigationState}
          {...mockHandlers}
          style={customStyle}
        />
      );

      const container = getByTestId('page-navigation');
      expect(container.props.style).toContainEqual(customStyle);
    });

    it('should apply custom button styles', () => {
      const buttonStyle = { borderRadius: 10 };
      const { getByLabelText } = render(
        <PageNavigation
          navigationState={defaultNavigationState}
          {...mockHandlers}
          buttonStyle={buttonStyle}
        />
      );

      const nextButton = getByLabelText('Go to next page');
      // Check that custom button style is applied
      const appliedStyles = Array.isArray(nextButton.props.style) 
        ? nextButton.props.style.flat() 
        : [nextButton.props.style];
      expect(appliedStyles).toContainEqual(expect.objectContaining(buttonStyle));
    });
  });
});