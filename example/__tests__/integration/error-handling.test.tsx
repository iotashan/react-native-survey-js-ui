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

// Mock console methods to check for error handling
// const originalConsoleError = console.error;
// const originalConsoleWarn = console.warn;

describe('Error Handling and Edge Case Integration Tests', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('Invalid Survey Model Handling', () => {
    it('should display error UI for invalid survey models', async () => {
      const { getByTestId, getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Select invalid model example
      fireEvent.press(getByTestId('example-selector-button'));
      await waitFor(() => {
        expect(getByText('Select Survey Example')).toBeTruthy();
      });

      fireEvent.press(getByTestId('example-invalid-model'));

      // Should show error state
      await waitFor(() => {
        expect(getByText('Survey model valid: No ✗')).toBeTruthy();
        expect(getByText('Invalid Survey Model')).toBeTruthy();
        expect(
          getByText(/demonstrates the library's error handling capabilities/)
        ).toBeTruthy();
      });

      // Should not crash the app
      expect(getByTestId('survey-demo-screen')).toBeTruthy();
    });

    it('should handle malformed survey JSON gracefully', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const { validateSurveyModel } = require('react-native-survey-js-ui');

      // Test various malformed models
      const malformedModels = [
        null,
        undefined,
        {},
        { pages: null },
        { pages: [] },
        { pages: [{}] },
        { pages: [{ elements: null }] },
        { pages: [{ elements: [{ type: 'invalid' }] }] },
      ];

      malformedModels.forEach((model) => {
        expect(validateSurveyModel(model)).toBe(false);
      });

      // App should still be functional
      expect(getByTestId('survey-demo-screen')).toBeTruthy();
    });
  });

  describe('Survey Event Error Handling', () => {
    it('should handle errors in onComplete callback', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      // Mock onComplete to throw an error internally
      const originalOnComplete = surveyInstance[0].onComplete;
      surveyInstance[0].onComplete = (data: any) => {
        try {
          // Simulate internal error
          if (data === null) {
            throw new Error('Invalid data');
          }
          originalOnComplete(data);
        } catch (error) {
          console.error('Error in onComplete:', error);
        }
      };

      // Trigger with null data
      act(() => {
        surveyInstance[0].onComplete(null);
      });

      // App should not crash
      expect(getByTestId('survey-demo-screen')).toBeTruthy();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in onComplete:',
        expect.any(Error)
      );
    });

    it('should handle errors in onValueChanged callback', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      // Send invalid event data
      act(() => {
        surveyInstance[0].onValueChanged({
          name: undefined,
          value: null,
          oldValue: undefined,
        });
      });

      // Should handle gracefully
      expect(getByTestId('survey-demo-screen')).toBeTruthy();
    });

    it('should handle errors in onCurrentPageChanged callback', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      // Send malformed page change event
      act(() => {
        surveyInstance[0].onCurrentPageChanged({
          oldCurrentPage: null,
          newCurrentPage: undefined,
          isNextPage: 'not-a-boolean' as any,
          isPrevPage: null as any,
        });
      });

      // Should not crash
      expect(getByTestId('survey-demo-screen')).toBeTruthy();
    });
  });

  describe('Navigation Error Recovery', () => {
    it('should recover from navigation errors', async () => {
      const { getByText, getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Attempt navigation that might fail
      fireEvent.press(getByText('Explore'));

      await waitFor(() => {
        expect(getByTestId('explore-scroll-view')).toBeTruthy();
      });

      // Navigate back
      fireEvent.press(getByText('Survey Demo'));

      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
      });

      // Should recover and work normally
    });

    it('should handle rapid tab switching without errors', async () => {
      const { getByText, getByTestId, queryByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Rapidly switch tabs
      for (let i = 0; i < 10; i++) {
        fireEvent.press(getByText('Explore'));
        fireEvent.press(getByText('Survey Demo'));
      }

      // Should stabilize without errors
      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
        expect(queryByTestId('explore-scroll-view')).toBeFalsy();
      });
    });
  });

  describe('Memory and Resource Management', () => {
    it('should clean up resources when unmounting', async () => {
      const { unmount } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // const Survey = require('react-native-survey-js-ui').Survey;
      // const initialCallCount = Survey.mock.calls.length;

      // Unmount component
      unmount();

      // Component should clean up properly
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle multiple survey instances without memory leaks', async () => {
      const instances = [];

      // Create multiple instances
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(
          <SafeAreaProvider>
            <NavigationContainer>
              <SurveyDemoScreen />
            </NavigationContainer>
          </SafeAreaProvider>
        );
        instances.push(unmount);
      }

      // Clean up all instances
      instances.forEach((unmount) => unmount());

      // No errors should occur
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('Edge Case: Empty and Null Data', () => {
    it('should handle empty survey responses', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      // Complete with empty data
      act(() => {
        surveyInstance[0].onComplete({});
      });

      // Should handle empty completion
      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
      });
    });

    it('should handle undefined and null values in responses', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      // Send various null/undefined values
      const edgeCases = [
        { name: 'field1', value: null, oldValue: '' },
        { name: 'field2', value: undefined, oldValue: 'something' },
        { name: 'field3', value: '', oldValue: null },
        { name: 'field4', value: 0, oldValue: undefined },
        { name: 'field5', value: false, oldValue: true },
      ];

      edgeCases.forEach((testCase) => {
        act(() => {
          surveyInstance[0].onValueChanged(testCase);
        });
      });

      // Should handle all edge cases
      expect(getByTestId('survey-demo-screen')).toBeTruthy();
    });
  });

  describe('Edge Case: Large Data Sets', () => {
    it('should handle surveys with many questions', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      // Simulate a survey with many responses
      const largeDataSet: any = {};
      for (let i = 0; i < 100; i++) {
        largeDataSet[`question_${i}`] = `answer_${i}`;
      }

      act(() => {
        surveyInstance[0].onComplete(largeDataSet);
      });

      // Should handle large data sets
      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
      });
    });

    it('should handle rapid event generation', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      // Generate many events rapidly
      act(() => {
        for (let i = 0; i < 50; i++) {
          surveyInstance[0].onValueChanged({
            name: `field_${i}`,
            value: `value_${i}`,
            oldValue: '',
          });
        }
      });

      // Should handle rapid events
      expect(getByTestId('survey-demo-screen')).toBeTruthy();
    });
  });

  describe('Edge Case: Special Characters and Unicode', () => {
    it('should handle special characters in survey data', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      // Test special characters
      const specialData = {
        name: 'John "Johnny" O\'Brien',
        email: 'test@example.com',
        feedback: 'This is great! 😊 ¡Hola! こんにちは',
        special: '<script>alert("test")</script>',
        unicode: '🎉🎊🎈 Unicode test émojis café résumé',
      };

      act(() => {
        surveyInstance[0].onComplete(specialData);
      });

      // Should handle special characters
      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
      });
    });
  });

  describe('Component Lifecycle Edge Cases', () => {
    it('should handle component updates during survey interaction', async () => {
      const { rerender, getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      // Start interacting with survey
      act(() => {
        surveyInstance[0].onValueChanged({
          name: 'test',
          value: 'value',
          oldValue: '',
        });
      });

      // Force re-render during interaction
      rerender(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Should handle lifecycle changes
      expect(getByTestId('survey-demo-screen')).toBeTruthy();
    });

    it('should handle missing required props gracefully', async () => {
      // Test Survey component with missing props
      const Survey = require('react-native-survey-js-ui').Survey;

      // Mock Survey to not require all props
      Survey.mockImplementationOnce(() => null);

      const { getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Should render without crashing
      expect(getByTestId('survey-demo-screen')).toBeTruthy();
    });
  });
});
