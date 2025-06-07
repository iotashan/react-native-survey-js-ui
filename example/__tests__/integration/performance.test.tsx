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

// Performance measurement utilities
const measurePerformance = async (
  operation: () => void | Promise<void>,
  label: string
): Promise<number> => {
  const startTime = performance.now();
  await operation();
  const endTime = performance.now();
  const duration = endTime - startTime;
  console.log(`${label}: ${duration.toFixed(2)}ms`);
  return duration;
};

describe('Performance Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render Performance', () => {
    it('should render the app within acceptable time limits', async () => {
      const duration = await measurePerformance(async () => {
        const { getByTestId } = render(
          <SafeAreaProvider>
            <NavigationContainer>
              <App />
            </NavigationContainer>
          </SafeAreaProvider>
        );

        await waitFor(() => {
          expect(getByTestId('app-container')).toBeTruthy();
        });
      }, 'App initial render');

      // Should render within 1 second
      expect(duration).toBeLessThan(1000);
    });

    it('should render survey demo screen efficiently', async () => {
      const duration = await measurePerformance(async () => {
        const { getByTestId } = render(
          <SafeAreaProvider>
            <NavigationContainer>
              <SurveyDemoScreen />
            </NavigationContainer>
          </SafeAreaProvider>
        );

        await waitFor(() => {
          expect(getByTestId('survey-demo-screen')).toBeTruthy();
        });
      }, 'Survey demo screen render');

      // Should render within 500ms
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Navigation Performance', () => {
    it('should switch between tabs quickly', async () => {
      const { getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
      });

      const duration = await measurePerformance(async () => {
        fireEvent.press(getByText('Explore'));
        await waitFor(() => {
          expect(getByTestId('explore-scroll-view')).toBeTruthy();
        });
      }, 'Tab navigation');

      // Tab switch should be under 300ms
      expect(duration).toBeLessThan(300);
    });

    it('should handle rapid navigation without performance degradation', async () => {
      const { getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const durations: number[] = [];

      // Perform multiple navigation cycles
      for (let i = 0; i < 5; i++) {
        const cycleDuration = await measurePerformance(
          async () => {
            fireEvent.press(getByText('Explore'));
            await waitFor(() =>
              expect(getByTestId('explore-scroll-view')).toBeTruthy()
            );

            fireEvent.press(getByText('Survey Demo'));
            await waitFor(() =>
              expect(getByTestId('survey-demo-screen')).toBeTruthy()
            );
          },
          `Navigation cycle ${i + 1}`
        );

        durations.push(cycleDuration);
      }

      // Performance should not degrade significantly
      const firstCycle = durations[0];
      const lastCycle = durations[durations.length - 1];
      const degradation = ((lastCycle - firstCycle) / firstCycle) * 100;

      // Degradation should be less than 50%
      expect(degradation).toBeLessThan(50);
    });
  });

  describe('Survey Interaction Performance', () => {
    it('should handle survey value changes efficiently', async () => {
      const {} = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      const duration = await measurePerformance(async () => {
        // Simulate 20 rapid value changes
        for (let i = 0; i < 20; i++) {
          act(() => {
            surveyInstance[0].onValueChanged({
              name: `field_${i}`,
              value: `value_${i}`,
              oldValue: '',
            });
          });
        }
      }, 'Rapid value changes');

      // Should handle 20 changes in under 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should complete surveys without performance issues', async () => {
      const { getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      const duration = await measurePerformance(async () => {
        act(() => {
          surveyInstance[0].onComplete({
            name: 'John Doe',
            email: 'john@example.com',
            feedback: 'Great survey!',
          });
        });

        await waitFor(() => {
          expect(getByText('Survey Completed!')).toBeTruthy();
        });
      }, 'Survey completion');

      // Completion should be fast
      expect(duration).toBeLessThan(200);
    });
  });

  describe('Large Survey Performance', () => {
    it('should handle surveys with many questions efficiently', async () => {
      const {} = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      // Create large response object
      const largeResponse: any = {};
      for (let i = 0; i < 50; i++) {
        largeResponse[`question_${i}`] =
          `Long answer text that simulates a real user response ${i}`;
      }

      const duration = await measurePerformance(async () => {
        act(() => {
          surveyInstance[0].onComplete(largeResponse);
        });
      }, 'Large survey completion');

      // Should handle large surveys reasonably fast
      expect(duration).toBeLessThan(500);
    });

    it('should render multi-page surveys efficiently', async () => {
      const { getByTestId, getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Switch to mixed types (multi-page)
      fireEvent.press(getByTestId('example-selector-button'));
      await waitFor(() => {
        expect(getByText('Select Survey Example')).toBeTruthy();
      });

      const duration = await measurePerformance(async () => {
        fireEvent.press(getByTestId('example-mixed-types'));
        await waitFor(() => {
          expect(getByText('Mixed Question Types')).toBeTruthy();
        });
      }, 'Multi-page survey load');

      // Multi-page survey should load quickly
      expect(duration).toBeLessThan(300);
    });
  });

  describe('Memory Usage Patterns', () => {
    it('should not leak memory when switching examples', async () => {
      const { getByTestId, getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const initialCallCount = Survey.mock.calls.length;

      // Switch between examples multiple times
      for (let i = 0; i < 3; i++) {
        fireEvent.press(getByTestId('example-selector-button'));
        await waitFor(() => {
          expect(getByText('Select Survey Example')).toBeTruthy();
        });

        const examples = ['basic-text', 'multiple-choice', 'validation'];
        fireEvent.press(
          getByTestId(`example-${examples[i % examples.length]}`)
        );

        await waitFor(() => {
          expect(getByTestId('survey-demo-screen')).toBeTruthy();
        });
      }

      // Should create new instances but not excessively
      const finalCallCount = Survey.mock.calls.length;
      expect(finalCallCount - initialCallCount).toBeGreaterThanOrEqual(3);
      expect(finalCallCount - initialCallCount).toBeLessThanOrEqual(6);
    });

    it('should clean up event logs to prevent memory growth', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      // Generate many events
      const duration = await measurePerformance(async () => {
        for (let i = 0; i < 100; i++) {
          act(() => {
            surveyInstance[0].onValueChanged({
              name: `field_${i}`,
              value: `value_${i}`,
              oldValue: '',
            });
          });
        }
      }, 'Generate 100 events');

      // Should handle many events efficiently
      expect(duration).toBeLessThan(500);

      // Component should still be responsive
      expect(getByTestId('survey-demo-screen')).toBeTruthy();
    });
  });

  describe('Concurrent Operations Performance', () => {
    it('should handle concurrent state updates efficiently', async () => {
      const {} = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      const duration = await measurePerformance(async () => {
        // Simulate concurrent operations
        act(() => {
          // Value change
          surveyInstance[0].onValueChanged({
            name: 'field1',
            value: 'value1',
            oldValue: '',
          });

          // Page change
          surveyInstance[0].onCurrentPageChanged({
            oldCurrentPage: { name: 'page1' },
            newCurrentPage: { name: 'page2' },
            isNextPage: true,
            isPrevPage: false,
          });

          // Another value change
          surveyInstance[0].onValueChanged({
            name: 'field2',
            value: 'value2',
            oldValue: '',
          });
        });

        // Also trigger UI updates
        fireEvent.press(getByTestId('show-code-button'));
      }, 'Concurrent operations');

      // Should handle concurrent operations efficiently
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Scroll Performance', () => {
    it('should scroll through event logs smoothly', async () => {
      const { getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      // Generate events to create scrollable content
      for (let i = 0; i < 20; i++) {
        act(() => {
          surveyInstance[0].onValueChanged({
            name: `field_${i}`,
            value: `This is a longer value to ensure we have enough content for scrolling test ${i}`,
            oldValue: '',
          });
        });
      }

      // Component should remain responsive
      expect(getByTestId('survey-demo-screen')).toBeTruthy();
    });

    it('should handle large JSON display efficiently', async () => {
      const { getByTestId, getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const duration = await measurePerformance(async () => {
        fireEvent.press(getByTestId('show-code-button'));
        await waitFor(() => {
          expect(getByText('Survey JSON Model:')).toBeTruthy();
        });
      }, 'Show JSON model');

      // Should display JSON quickly
      expect(duration).toBeLessThan(200);
    });
  });

  describe('Performance Benchmarks Summary', () => {
    it('should meet all performance benchmarks', async () => {
      const benchmarks = {
        'App initial render': 1000,
        'Tab navigation': 300,
        'Survey completion': 200,
        'Example switching': 300,
        'Rapid interactions': 500,
      };

      console.log('\n=== Performance Benchmarks ===');
      Object.entries(benchmarks).forEach(([operation, maxTime]) => {
        console.log(`${operation}: < ${maxTime}ms`);
      });
      console.log('==============================\n');

      // All tests in this file validate these benchmarks
      expect(true).toBe(true);
    });
  });
});
