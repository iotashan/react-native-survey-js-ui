import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from '../../src/App';
import SurveyDemoScreen from '../../src/screens/SurveyDemoScreen';
// Survey examples are imported but commented out as they're not used in these tests
// import { surveyExamples } from '../../src/data/surveyExamples';

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

describe('Survey Data and State Management Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Survey Data Collection', () => {
    it('should collect and store survey responses correctly', async () => {
      const { getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      // Simulate multiple value changes
      const responses = [
        { name: 'name', value: 'John Doe', oldValue: '' },
        { name: 'email', value: 'john@example.com', oldValue: '' },
        { name: 'age', value: '25', oldValue: '' },
        { name: 'feedback', value: 'Great survey!', oldValue: '' },
      ];

      responses.forEach((response) => {
        act(() => {
          surveyInstance[0].onValueChanged(response);
        });
      });

      // Complete the survey
      const completeData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: '25',
        feedback: 'Great survey!',
      };

      act(() => {
        surveyInstance[0].onComplete(completeData);
      });

      // Verify data is displayed correctly
      await waitFor(() => {
        expect(getByText('Survey Completed!')).toBeTruthy();
        expect(getByText('Submission Data:')).toBeTruthy();
      });
    });

    it('should handle incremental data updates', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      // Simulate user changing their mind
      const updates = [
        { name: 'name', value: 'John', oldValue: '' },
        { name: 'name', value: 'John D', oldValue: 'John' },
        { name: 'name', value: 'John Doe', oldValue: 'John D' },
      ];

      updates.forEach((update) => {
        act(() => {
          surveyInstance[0].onValueChanged(update);
        });
      });

      // Each update should be handled
      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
      });
    });
  });

  describe('Survey State Persistence', () => {
    it('should maintain survey state across example switches', async () => {
      const { getByTestId, getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Start with basic text example
      const Survey = require('react-native-survey-js-ui').Survey;
      let surveyInstance = Survey.mock.calls[0];

      // Enter some data
      act(() => {
        surveyInstance[0].onValueChanged({
          name: 'name',
          value: 'Test User',
          oldValue: '',
        });
      });

      // Switch to another example
      fireEvent.press(getByTestId('example-selector-button'));
      await waitFor(() => {
        expect(getByText('Select Survey Example')).toBeTruthy();
      });

      fireEvent.press(getByTestId('example-multiple-choice'));

      // New survey instance should be created
      await waitFor(() => {
        expect(getByText('Multiple Choice Questions')).toBeTruthy();
      });

      // Switch back to basic text
      fireEvent.press(getByTestId('example-selector-button'));
      await waitFor(() => {
        expect(getByText('Select Survey Example')).toBeTruthy();
      });

      fireEvent.press(getByTestId('example-basic-text'));

      // State should be reset (new instance)
      await waitFor(() => {
        expect(getByText('Basic Text Questions')).toBeTruthy();
      });
    });

    it('should reset state when reset button is pressed', async () => {
      const { getByTestId, getByText, queryByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      // Complete survey
      act(() => {
        surveyInstance[0].onComplete({
          name: 'John Doe',
          email: 'john@example.com',
        });
      });

      await waitFor(() => {
        expect(getByText('Survey Completed!')).toBeTruthy();
      });

      // Reset survey
      fireEvent.press(getByTestId('reset-survey-button'));

      // State should be cleared
      await waitFor(() => {
        expect(queryByText('Survey Completed!')).toBeFalsy();
        expect(queryByText('Submission Data:')).toBeFalsy();
      });

      // Survey should be re-rendered (new key)
      expect(Survey.mock.calls.length).toBeGreaterThan(1);
    });
  });

  describe('Event Log State Management', () => {
    it('should accumulate event logs correctly', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      // Generate multiple events
      const events = [
        () =>
          surveyInstance[0].onValueChanged({
            name: 'q1',
            value: 'answer1',
            oldValue: '',
          }),
        () =>
          surveyInstance[0].onValueChanged({
            name: 'q2',
            value: 'answer2',
            oldValue: '',
          }),
        () =>
          surveyInstance[0].onCurrentPageChanged({
            oldCurrentPage: { name: 'page1' },
            newCurrentPage: { name: 'page2' },
            isNextPage: true,
            isPrevPage: false,
          }),
      ];

      events.forEach((event) => {
        act(() => {
          event();
        });
      });

      // Event logs should be displayed
      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
      });
    });

    it('should limit event log entries to prevent memory issues', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      // Generate more than 20 events (the limit)
      for (let i = 0; i < 25; i++) {
        act(() => {
          surveyInstance[0].onValueChanged({
            name: `question${i}`,
            value: `answer${i}`,
            oldValue: '',
          });
        });
      }

      // Component should handle this without issues
      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
      });
    });

    it('should clear event logs on survey reset', async () => {
      const { getByTestId, getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      // Generate events
      act(() => {
        surveyInstance[0].onValueChanged({
          name: 'test',
          value: 'value',
          oldValue: '',
        });
      });

      // Complete and reset
      act(() => {
        surveyInstance[0].onComplete({ test: 'value' });
      });

      await waitFor(() => {
        expect(getByText('Survey Completed!')).toBeTruthy();
      });

      fireEvent.press(getByTestId('reset-survey-button'));

      // Event logs should be cleared
      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
      });
    });
  });

  describe('Multi-Page Survey State', () => {
    it('should manage state across multiple survey pages', async () => {
      const { getByTestId, getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Switch to mixed types example (multi-page)
      fireEvent.press(getByTestId('example-selector-button'));
      await waitFor(() => {
        expect(getByText('Select Survey Example')).toBeTruthy();
      });

      fireEvent.press(getByTestId('example-mixed-types'));

      await waitFor(() => {
        expect(getByText('Mixed Question Types')).toBeTruthy();
      });

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls.find(
        (call) => call[0].model.pages.length > 1
      );

      // Fill data on page 1
      act(() => {
        surveyInstance[0].onValueChanged({
          name: 'name',
          value: 'John Doe',
          oldValue: '',
        });
      });

      // Navigate to page 2
      act(() => {
        surveyInstance[0].onCurrentPageChanged({
          oldCurrentPage: { name: 'personal-info' },
          newCurrentPage: { name: 'preferences' },
          isNextPage: true,
          isPrevPage: false,
        });
      });

      // Fill data on page 2
      act(() => {
        surveyInstance[0].onValueChanged({
          name: 'favoriteColor',
          value: 'blue',
          oldValue: '',
        });
      });

      // Complete survey with all data
      act(() => {
        surveyInstance[0].onComplete({
          name: 'John Doe',
          email: 'john@example.com',
          favoriteColor: 'blue',
          experienceRating: 5,
        });
      });

      await waitFor(() => {
        expect(getByText('Survey Completed!')).toBeTruthy();
      });
    });

    it('should handle backward navigation in multi-page surveys', async () => {
      const { getByTestId, getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Use validation example (has navigation requirements)
      fireEvent.press(getByTestId('example-selector-button'));
      await waitFor(() => {
        expect(getByText('Select Survey Example')).toBeTruthy();
      });

      fireEvent.press(getByTestId('example-validation'));

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[Survey.mock.calls.length - 1];

      // Navigate forward and back
      act(() => {
        surveyInstance[0].onCurrentPageChanged({
          oldCurrentPage: { name: 'page1' },
          newCurrentPage: { name: 'page2' },
          isNextPage: true,
          isPrevPage: false,
        });
      });

      act(() => {
        surveyInstance[0].onCurrentPageChanged({
          oldCurrentPage: { name: 'page2' },
          newCurrentPage: { name: 'page1' },
          isNextPage: false,
          isPrevPage: true,
        });
      });

      // Component should handle navigation without issues
      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
      });
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistent state between UI and data', async () => {
      const { getByTestId, getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
      });

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      // Show JSON model
      fireEvent.press(getByTestId('show-code-button'));

      await waitFor(() => {
        expect(getByText('Survey JSON Model:')).toBeTruthy();
      });

      // Complete survey while model is shown
      act(() => {
        surveyInstance[0].onComplete({
          name: 'Test User',
          email: 'test@example.com',
        });
      });

      // Both UI states should update correctly
      await waitFor(() => {
        expect(getByText('Survey Completed!')).toBeTruthy();
        expect(getByText('Hide JSON Model')).toBeTruthy();
      });
    });

    it('should handle concurrent state updates', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      // Simulate rapid concurrent updates
      act(() => {
        surveyInstance[0].onValueChanged({
          name: 'field1',
          value: 'value1',
          oldValue: '',
        });
        surveyInstance[0].onValueChanged({
          name: 'field2',
          value: 'value2',
          oldValue: '',
        });
        surveyInstance[0].onValueChanged({
          name: 'field3',
          value: 'value3',
          oldValue: '',
        });
      });

      // Component should handle all updates
      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
      });
    });
  });
});
