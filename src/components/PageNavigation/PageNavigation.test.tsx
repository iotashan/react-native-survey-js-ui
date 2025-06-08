import * as React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PageNavigation } from './PageNavigation';
import type { NavigationState } from '../../hooks/usePageNavigation';

describe('PageNavigation', () => {
  const mockOnNext = jest.fn();
  const mockOnPrevious = jest.fn();
  const mockOnComplete = jest.fn();

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { getByTestId } = render(
      <PageNavigation
        navigationState={defaultNavigationState}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        onComplete={mockOnComplete}
      />
    );

    expect(getByTestId('page-navigation')).toBeTruthy();
  });

  it('should show only Next button on first page', () => {
    const { getByText, queryByText } = render(
      <PageNavigation
        navigationState={defaultNavigationState}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        onComplete={mockOnComplete}
      />
    );

    expect(getByText('Next')).toBeTruthy();
    expect(queryByText('Previous')).toBeFalsy();
    expect(queryByText('Complete')).toBeFalsy();
  });

  it('should show Previous and Next buttons on middle page', () => {
    const middlePageState: NavigationState = {
      ...defaultNavigationState,
      currentPageNo: 1,
      isFirstPage: false,
      isLastPage: false,
      canGoPrevious: true,
    };

    const { getByText, queryByText } = render(
      <PageNavigation
        navigationState={middlePageState}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        onComplete={mockOnComplete}
      />
    );

    expect(getByText('Next')).toBeTruthy();
    expect(getByText('Previous')).toBeTruthy();
    expect(queryByText('Complete')).toBeFalsy();
  });

  it('should show Previous and Complete buttons on last page', () => {
    const lastPageState: NavigationState = {
      ...defaultNavigationState,
      currentPageNo: 2,
      isFirstPage: false,
      isLastPage: true,
      canGoPrevious: true,
      canGoNext: true,
    };

    const { getByText, queryByText } = render(
      <PageNavigation
        navigationState={lastPageState}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        onComplete={mockOnComplete}
      />
    );

    expect(getByText('Complete')).toBeTruthy();
    expect(getByText('Previous')).toBeTruthy();
    expect(queryByText('Next')).toBeFalsy();
  });

  it('should call onNext when Next button is pressed', () => {
    const { getByText } = render(
      <PageNavigation
        navigationState={defaultNavigationState}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        onComplete={mockOnComplete}
      />
    );

    fireEvent.press(getByText('Next'));
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it('should call onPrevious when Previous button is pressed', () => {
    const middlePageState: NavigationState = {
      ...defaultNavigationState,
      currentPageNo: 1,
      isFirstPage: false,
      canGoPrevious: true,
    };

    const { getByText } = render(
      <PageNavigation
        navigationState={middlePageState}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        onComplete={mockOnComplete}
      />
    );

    fireEvent.press(getByText('Previous'));
    expect(mockOnPrevious).toHaveBeenCalledTimes(1);
  });

  it('should call onComplete when Complete button is pressed', () => {
    const lastPageState: NavigationState = {
      ...defaultNavigationState,
      currentPageNo: 2,
      isFirstPage: false,
      isLastPage: true,
      canGoPrevious: true,
      canGoNext: true,
    };

    const { getByText } = render(
      <PageNavigation
        navigationState={lastPageState}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        onComplete={mockOnComplete}
      />
    );

    fireEvent.press(getByText('Complete'));
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons when navigation is disabled', () => {
    const disabledState: NavigationState = {
      ...defaultNavigationState,
      canGoNext: false,
    };

    const { getByText, getByLabelText } = render(
      <PageNavigation
        navigationState={disabledState}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        onComplete={mockOnComplete}
      />
    );

    // Get button by accessibility label instead of text
    const nextButton = getByLabelText('Go to next page');
    expect(nextButton.props.accessibilityState.disabled).toBe(true);
    
    // Also test that pressing disabled button doesn't call handler
    fireEvent.press(nextButton);
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('should show loading indicator when navigating', () => {
    const navigatingState: NavigationState = {
      ...defaultNavigationState,
      isNavigating: true,
    };

    const { getByTestId } = render(
      <PageNavigation
        navigationState={navigatingState}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        onComplete={mockOnComplete}
      />
    );

    expect(getByTestId('navigation-loading')).toBeTruthy();
  });

  it('should show validation error when present', () => {
    const errorState: NavigationState = {
      ...defaultNavigationState,
      validationError: 'Please fix the errors on this page',
    };

    const { getByTestId, getByText } = render(
      <PageNavigation
        navigationState={errorState}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        onComplete={mockOnComplete}
      />
    );

    expect(getByTestId('validation-error')).toBeTruthy();
    expect(getByText('Please fix the errors on this page')).toBeTruthy();
  });

  it('should disable buttons when navigating', () => {
    const navigatingState: NavigationState = {
      ...defaultNavigationState,
      currentPageNo: 1,
      isFirstPage: false,
      isLastPage: false,
      canGoPrevious: true,
      isNavigating: true,
    };

    const { getByText } = render(
      <PageNavigation
        navigationState={navigatingState}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        onComplete={mockOnComplete}
      />
    );

    fireEvent.press(getByText('Next'));
    fireEvent.press(getByText('Previous'));
    
    // Should not call handlers when navigating
    expect(mockOnNext).not.toHaveBeenCalled();
    expect(mockOnPrevious).not.toHaveBeenCalled();
  });

  it('should use custom button text props', () => {
    const lastPageState: NavigationState = {
      ...defaultNavigationState,
      currentPageNo: 1,
      isFirstPage: false,
      isLastPage: true,
      canGoPrevious: true,
      canGoNext: true,
    };

    const { getByText } = render(
      <PageNavigation
        navigationState={lastPageState}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        onComplete={mockOnComplete}
        nextText="Continue"
        previousText="Back"
        completeText="Submit"
      />
    );

    expect(getByText('Submit')).toBeTruthy();
    expect(getByText('Back')).toBeTruthy();
  });

  it('should have proper accessibility attributes', () => {
    const { getByTestId } = render(
      <PageNavigation
        navigationState={defaultNavigationState}
        onNext={mockOnNext}
        onPrevious={mockOnPrevious}
        onComplete={mockOnComplete}
      />
    );

    const container = getByTestId('page-navigation');
    expect(container.props.accessibilityRole).toBe('toolbar');
  });
});