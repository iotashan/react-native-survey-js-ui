import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from '../../src/App';
import { surveyExamples } from '../../src/data/surveyExamples';

// Mock navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// Mock safe area
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock the survey library
jest.mock('react-native-survey-js-ui');

// Mock React Native components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (style: any) => style,
    },
  };
});

describe('End-to-End Survey Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Survey Lifecycle', () => {
    it('should complete a basic survey from start to finish', async () => {
      const { getByTestId, getByText, queryByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Wait for app to load
      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
      });

      // Verify initial state
      expect(getByText('Survey Demo')).toBeTruthy();
      expect(getByText('Survey model valid: Yes ✓')).toBeTruthy();

      // The basic text survey should be selected by default
      const basicExample = surveyExamples[0];
      expect(getByText(basicExample.title)).toBeTruthy();

      // Simulate survey completion
      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      if (surveyInstance && surveyInstance[0].onComplete) {
        act(() => {
          surveyInstance[0].onComplete({
            name: 'John Doe',
            email: 'john@example.com',
            feedback: 'Great survey!',
          });
        });
      }

      // Verify completion state
      await waitFor(() => {
        expect(getByText('Survey Completed!')).toBeTruthy();
        expect(getByText('Submission Data:')).toBeTruthy();
      });

      // Check for reset button
      expect(getByTestId('reset-survey-button')).toBeTruthy();

      // Reset survey
      fireEvent.press(getByTestId('reset-survey-button'));

      // Verify survey is reset
      await waitFor(() => {
        expect(queryByText('Survey Completed!')).toBeFalsy();
        expect(getByText('Survey model valid: Yes ✓')).toBeTruthy();
      });
    });

    it('should handle survey example switching', async () => {
      const { getByTestId, getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Open example selector
      fireEvent.press(getByTestId('example-selector-button'));

      // Wait for modal to open
      await waitFor(() => {
        expect(getByText('Select Survey Example')).toBeTruthy();
      });

      // Select multiple choice example
      const multipleChoiceExample = surveyExamples.find(
        (ex) => ex.id === 'multiple-choice'
      );
      fireEvent.press(getByTestId(`example-${multipleChoiceExample!.id}`));

      // Verify example switched
      await waitFor(() => {
        expect(getByText(multipleChoiceExample!.title)).toBeTruthy();
        expect(getByText(multipleChoiceExample!.description)).toBeTruthy();
      });
    });

    it('should handle invalid survey model gracefully', async () => {
      const { getByTestId, getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Open example selector
      fireEvent.press(getByTestId('example-selector-button'));

      // Select invalid model example
      const invalidExample = surveyExamples.find(
        (ex) => ex.id === 'invalid-model'
      );
      fireEvent.press(getByTestId(`example-${invalidExample!.id}`));

      // Verify error handling
      await waitFor(() => {
        expect(getByText('Survey model valid: No ✗')).toBeTruthy();
        expect(getByText('Invalid Survey Model')).toBeTruthy();
        expect(
          getByText(/demonstrates the library's error handling capabilities/)
        ).toBeTruthy();
      });
    });
  });

  describe('Survey Event Handling Integration', () => {
    it('should track survey value changes', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
      });

      // Get survey instance and trigger value change
      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      if (surveyInstance && surveyInstance[0].onValueChanged) {
        act(() => {
          surveyInstance[0].onValueChanged({
            name: 'name',
            value: 'John',
            oldValue: '',
          });
        });
      }

      // Event logs should be visible after first event
      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
        // The event log is rendered in the component
      });
    });

    it('should track page navigation events', async () => {
      const { getByTestId, getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Switch to mixed types example (has multiple pages)
      fireEvent.press(getByTestId('example-selector-button'));

      await waitFor(() => {
        expect(getByText('Select Survey Example')).toBeTruthy();
      });

      const mixedExample = surveyExamples.find((ex) => ex.id === 'mixed-types');
      fireEvent.press(getByTestId(`example-${mixedExample!.id}`));

      await waitFor(() => {
        expect(getByText(mixedExample!.title)).toBeTruthy();
      });

      // Get survey instance and trigger page change
      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls.find(
        (call) => call[0].model === mixedExample!.model
      );

      if (surveyInstance && surveyInstance[0].onCurrentPageChanged) {
        act(() => {
          surveyInstance[0].onCurrentPageChanged({
            oldCurrentPage: { name: 'personal-info' },
            newCurrentPage: { name: 'preferences' },
            isNextPage: true,
            isPrevPage: false,
          });
        });
      }
    });
  });

  describe('Survey Code Display Integration', () => {
    it('should toggle JSON model display', async () => {
      const { getByTestId, getByText, queryByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
      });

      // Initially code should not be visible
      expect(queryByText('Survey JSON Model:')).toBeFalsy();

      // Show code
      fireEvent.press(getByTestId('show-code-button'));

      // Code should be visible
      await waitFor(() => {
        expect(getByText('Survey JSON Model:')).toBeTruthy();
        expect(getByText('Hide JSON Model')).toBeTruthy();
      });

      // Hide code
      fireEvent.press(getByTestId('show-code-button'));

      // Code should be hidden
      await waitFor(() => {
        expect(queryByText('Survey JSON Model:')).toBeFalsy();
        expect(getByText('Show JSON Model')).toBeTruthy();
      });
    });
  });

  describe('Multi-Page Survey Navigation', () => {
    it('should handle multi-page survey navigation', async () => {
      const { getByTestId, getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Switch to mixed types example
      fireEvent.press(getByTestId('example-selector-button'));

      await waitFor(() => {
        expect(getByText('Select Survey Example')).toBeTruthy();
      });

      const mixedExample = surveyExamples.find((ex) => ex.id === 'mixed-types');
      fireEvent.press(getByTestId(`example-${mixedExample!.id}`));

      await waitFor(() => {
        expect(getByText(mixedExample!.title)).toBeTruthy();
      });

      // Simulate navigation through pages
      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls.find(
        (call) => call[0].model === mixedExample!.model
      );

      // Navigate to page 2
      if (surveyInstance && surveyInstance[0].onCurrentPageChanged) {
        act(() => {
          surveyInstance[0].onCurrentPageChanged({
            oldCurrentPage: { name: 'personal-info' },
            newCurrentPage: { name: 'preferences' },
            isNextPage: true,
            isPrevPage: false,
          });
        });
      }

      // Complete the survey
      if (surveyInstance && surveyInstance[0].onComplete) {
        act(() => {
          surveyInstance[0].onComplete({
            name: 'John Doe',
            email: 'john@example.com',
            favoriteColor: 'blue',
            experienceRating: 5,
            receiveNewsletter: true,
            additionalComments: 'Great experience!',
          });
        });
      }

      // Verify completion
      await waitFor(() => {
        expect(getByText('Survey Completed!')).toBeTruthy();
      });
    });
  });
});
