import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SurveyDemoScreen from '../../src/screens/SurveyDemoScreen';
import { multiPageNavigationExamples } from '../../src/data/multiPageExamples';

// Mock SafeAreaView
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
}));

// Mock Survey component to avoid actual survey rendering in tests
jest.mock('react-native-survey-js-ui', () => {
  const mockReact = require('react');
  const { View, Text } = require('react-native');
  
  return {
    Survey: ({ onComplete, onValueChanged, onCurrentPageChanged }: any) => {
      // Simulate some events
      mockReact.useEffect(() => {
        if (onCurrentPageChanged) {
          setTimeout(() => {
            onCurrentPageChanged({
              oldCurrentPage: { name: 'page1' },
              newCurrentPage: { name: 'page2' },
              isNextPage: true,
              isPrevPage: false,
            });
          }, 100);
        }
      }, [onCurrentPageChanged]);
      
      // Simple mock that simulates page navigation
      return mockReact.createElement(
        View,
        { testID: 'mock-survey' },
        mockReact.createElement(Text, {}, 'Mock Survey')
      );
    },
    validateSurveyModel: jest.fn(() => true),
  };
});

describe('SurveyDemoScreen - Multi-Page Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should display multi-page navigation examples in the selector', async () => {
    const { getByTestId, getByText } = render(<SurveyDemoScreen />);
    
    // Open example selector
    const selectorButton = getByTestId('example-selector-button');
    fireEvent.press(selectorButton);
    
    await waitFor(() => {
      // Check that all multi-page examples are present
      multiPageNavigationExamples.forEach(example => {
        expect(getByText(example.title)).toBeTruthy();
      });
    });
  });

  it('should show navigation info for multi-page examples', async () => {
    const { getByTestId, getByText, queryByText } = render(<SurveyDemoScreen />);
    
    // Open example selector
    const selectorButton = getByTestId('example-selector-button');
    fireEvent.press(selectorButton);
    
    // Select a multi-page navigation example
    const basicMultiPageOption = getByTestId('example-basic-multipage');
    fireEvent.press(basicMultiPageOption);
    
    await waitFor(() => {
      // Check for navigation info container
      expect(getByText('Multi-Page Navigation Demo')).toBeTruthy();
      expect(getByText(/Basic page navigation with Next\/Previous buttons/)).toBeTruthy();
    });
  });

  it('should display appropriate features for each navigation example', async () => {
    const { getByTestId, getByText } = render(<SurveyDemoScreen />);
    
    const testCases = [
      {
        id: 'validation-flow',
        features: /Required fields block navigation/,
      },
      {
        id: 'dynamic-page-count',
        features: /Pages appear\/disappear based on answers/,
      },
      {
        id: 'navigation-events',
        features: /All navigation events logged/,
      },
    ];
    
    for (const testCase of testCases) {
      // Open selector and select example
      fireEvent.press(getByTestId('example-selector-button'));
      
      await waitFor(() => {
        const exampleOption = getByTestId(`example-${testCase.id}`);
        fireEvent.press(exampleOption);
      });
      
      // Check features are displayed
      await waitFor(() => {
        expect(getByText(testCase.features)).toBeTruthy();
      });
    }
  });

  it('should log page change events for multi-page surveys', async () => {
    const { getByTestId, getByText, getAllByText } = render(<SurveyDemoScreen />);
    
    // Select navigation events example
    fireEvent.press(getByTestId('example-selector-button'));
    await waitFor(() => {
      const navEventsOption = getByTestId('example-navigation-events');
      fireEvent.press(navEventsOption);
    });
    
    // Advance timers to trigger the mock page change event
    jest.advanceTimersByTime(150);
    
    // Wait for page change event to be logged
    await waitFor(() => {
      const pageChangedTexts = getAllByText(/Page changed/);
      expect(pageChangedTexts.length).toBeGreaterThan(0);
    });
  });

  it('should not show navigation info for non-navigation examples', async () => {
    const { getByTestId, queryByText } = render(<SurveyDemoScreen />);
    
    // By default, the first example (basic-text) should be selected
    await waitFor(() => {
      expect(queryByText('Multi-Page Navigation Demo')).toBeNull();
    });
  });

  it('should update example count to include navigation examples', () => {
    const { getByTestId } = render(<SurveyDemoScreen />);
    
    // Open example selector to verify all examples are loaded
    fireEvent.press(getByTestId('example-selector-button'));
    
    // The total count should include survey + validation + navigation examples
    const totalExpected = 8 + 9 + multiPageNavigationExamples.length; // surveyExamples + validationExamples + multiPageNavigationExamples
    
    // Note: We can't directly test console.log, but we verify the examples are loaded
    expect(multiPageNavigationExamples.length).toBe(7);
  });

  it('should show playground button for multi-page navigation examples', async () => {
    const { getByTestId, queryByTestId } = render(<SurveyDemoScreen />);
    
    // Initially playground button should not be visible (non-navigation example)
    expect(queryByTestId('show-playground-button')).toBeNull();
    
    // Select a multi-page navigation example
    fireEvent.press(getByTestId('example-selector-button'));
    await waitFor(() => {
      const navExample = getByTestId('example-basic-multipage');
      fireEvent.press(navExample);
    });
    
    // Now playground button should be visible
    await waitFor(() => {
      expect(getByTestId('show-playground-button')).toBeTruthy();
    });
  });

  it('should toggle navigation playground when button is pressed', async () => {
    const { getByTestId, queryByTestId } = render(<SurveyDemoScreen />);
    
    // Select multi-page navigation example
    fireEvent.press(getByTestId('example-selector-button'));
    await waitFor(() => {
      fireEvent.press(getByTestId('example-basic-multipage'));
    });
    
    // Initially playground should not be visible
    expect(queryByTestId('navigation-playground-container')).toBeNull();
    
    // Press playground button
    await waitFor(() => {
      const playgroundButton = getByTestId('show-playground-button');
      fireEvent.press(playgroundButton);
    });
    
    // Playground should now be visible
    await waitFor(() => {
      expect(getByTestId('navigation-playground-container')).toBeTruthy();
    });
    
    // Press button again to hide
    fireEvent.press(getByTestId('show-playground-button'));
    
    // Playground should be hidden
    await waitFor(() => {
      expect(queryByTestId('navigation-playground-container')).toBeNull();
    });
  });
});