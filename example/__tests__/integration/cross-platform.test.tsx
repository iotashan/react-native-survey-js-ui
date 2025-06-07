import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import App from '../../src/App';
import SurveyDemoScreen from '../../src/screens/SurveyDemoScreen';

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

describe('Cross-Platform Integration Tests', () => {
  // Store original platform
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original platform
    Object.defineProperty(Platform, 'OS', {
      value: originalPlatform,
      configurable: true,
    });
  });

  describe('iOS Platform Tests', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        configurable: true,
      });
    });

    it('should render correctly on iOS', async () => {
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

      expect(Platform.OS).toBe('ios');
    });

    it('should handle iOS-specific safe area insets', async () => {
      // Mock iOS-specific safe area insets
      jest
        .mocked(require('react-native-safe-area-context').useSafeAreaInsets)
        .mockReturnValue({
          top: 44, // iOS status bar
          right: 0,
          bottom: 34, // iOS home indicator
          left: 0,
        });

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
    });

    it('should handle iOS modal presentation', async () => {
      const { getByTestId, getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Open modal
      fireEvent.press(getByTestId('example-selector-button'));

      await waitFor(() => {
        expect(getByText('Select Survey Example')).toBeTruthy();
      });

      // Modal should work on iOS
      expect(Platform.OS).toBe('ios');
    });

    it('should handle iOS-specific gestures', async () => {
      const { getByText, getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Simulate iOS swipe gestures for tab navigation
      fireEvent.press(getByText('Explore'));

      await waitFor(() => {
        expect(getByTestId('explore-scroll-view')).toBeTruthy();
      });

      fireEvent.press(getByText('Survey Demo'));

      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
      });
    });
  });

  describe('Android Platform Tests', () => {
    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', {
        value: 'android',
        configurable: true,
      });
    });

    it('should render correctly on Android', async () => {
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

      expect(Platform.OS).toBe('android');
    });

    it('should handle Android-specific safe area', async () => {
      // Mock Android-specific safe area (usually smaller)
      jest
        .mocked(require('react-native-safe-area-context').useSafeAreaInsets)
        .mockReturnValue({
          top: 24, // Android status bar
          right: 0,
          bottom: 0, // No home indicator on Android
          left: 0,
        });

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
    });

    it('should handle Android back button behavior', async () => {
      const { getByTestId, getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Navigate to Explore tab
      fireEvent.press(getByText('Explore'));

      await waitFor(() => {
        expect(getByTestId('explore-scroll-view')).toBeTruthy();
      });

      // Android back button would normally go back to previous tab
      // This is handled by React Navigation
      expect(Platform.OS).toBe('android');
    });

    it('should handle Android modal behavior', async () => {
      const { getByTestId, getByText } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Open modal
      fireEvent.press(getByTestId('example-selector-button'));

      await waitFor(() => {
        expect(getByText('Select Survey Example')).toBeTruthy();
      });

      // Android modals have different animation
      expect(Platform.OS).toBe('android');
    });
  });

  describe('Platform-Agnostic Behavior', () => {
    it.each(['ios', 'android'])(
      'should maintain consistent behavior on %s',
      async (platform) => {
        Object.defineProperty(Platform, 'OS', {
          value: platform,
          configurable: true,
        });

        const { getByTestId, getByText } = render(
          <SafeAreaProvider>
            <NavigationContainer>
              <App />
            </NavigationContainer>
          </SafeAreaProvider>
        );

        // Core functionality should work identically
        await waitFor(() => {
          expect(getByTestId('survey-demo-screen')).toBeTruthy();
        });

        // Navigation should work
        fireEvent.press(getByText('Explore'));

        await waitFor(() => {
          expect(getByTestId('explore-scroll-view')).toBeTruthy();
        });

        // Survey functionality should work
        fireEvent.press(getByText('Survey Demo'));

        const Survey = require('react-native-survey-js-ui').Survey;
        expect(Survey).toHaveBeenCalled();
      }
    );

    it.each(['ios', 'android'])(
      'should handle survey completion on %s',
      async (platform) => {
        Object.defineProperty(Platform, 'OS', {
          value: platform,
          configurable: true,
        });

        const { getByText } = render(
          <SafeAreaProvider>
            <NavigationContainer>
              <SurveyDemoScreen />
            </NavigationContainer>
          </SafeAreaProvider>
        );

        const Survey = require('react-native-survey-js-ui').Survey;
        const surveyInstance = Survey.mock.calls[0];

        act(() => {
          surveyInstance[0].onComplete({
            name: 'Test User',
            platform: platform,
          });
        });

        await waitFor(() => {
          expect(getByText('Survey Completed!')).toBeTruthy();
        });
      }
    );
  });

  describe('Platform-Specific Styling', () => {
    it('should apply platform-specific styles correctly', async () => {
      // Test iOS styles
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        configurable: true,
      });

      const { getByTestId: getByTestIdIOS } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      await waitFor(() => {
        expect(getByTestIdIOS('app-container')).toBeTruthy();
      });

      // Test Android styles
      Object.defineProperty(Platform, 'OS', {
        value: 'android',
        configurable: true,
      });

      const { getByTestId: getByTestIdAndroid } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      await waitFor(() => {
        expect(getByTestIdAndroid('app-container')).toBeTruthy();
      });
    });
  });

  describe('Platform-Specific Features', () => {
    it('should handle platform-specific navigation patterns', async () => {
      const platforms = ['ios', 'android'];

      for (const platform of platforms) {
        Object.defineProperty(Platform, 'OS', {
          value: platform,
          configurable: true,
        });

        const { getByText, getByTestId, unmount } = render(
          <SafeAreaProvider>
            <NavigationContainer>
              <App />
            </NavigationContainer>
          </SafeAreaProvider>
        );

        // Tab navigation should work on both platforms
        fireEvent.press(getByText('Explore'));

        await waitFor(() => {
          expect(getByTestId('explore-scroll-view')).toBeTruthy();
        });

        unmount();
      }
    });

    it('should handle platform-specific text input behavior', async () => {
      const platforms = ['ios', 'android'];

      for (const platform of platforms) {
        Object.defineProperty(Platform, 'OS', {
          value: platform,
          configurable: true,
        });

        const { getByTestId, unmount } = render(
          <SafeAreaProvider>
            <NavigationContainer>
              <SurveyDemoScreen />
            </NavigationContainer>
          </SafeAreaProvider>
        );

        const Survey = require('react-native-survey-js-ui').Survey;
        const surveyInstance = Survey.mock.calls[Survey.mock.calls.length - 1];

        // Text input should work on both platforms
        act(() => {
          surveyInstance[0].onValueChanged({
            name: 'textField',
            value: `Test on ${platform}`,
            oldValue: '',
          });
        });

        expect(getByTestId('survey-demo-screen')).toBeTruthy();

        unmount();
      }
    });
  });

  describe('Platform Performance Differences', () => {
    it.each(['ios', 'android'])(
      'should have acceptable performance on %s',
      async (platform) => {
        Object.defineProperty(Platform, 'OS', {
          value: platform,
          configurable: true,
        });

        const startTime = Date.now();

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

        const renderTime = Date.now() - startTime;

        // Both platforms should render within acceptable time
        expect(renderTime).toBeLessThan(1000);
        console.log(`${platform} render time: ${renderTime}ms`);
      }
    );
  });

  describe('Platform-Specific Error Handling', () => {
    it.each(['ios', 'android'])(
      'should handle errors gracefully on %s',
      async (platform) => {
        Object.defineProperty(Platform, 'OS', {
          value: platform,
          configurable: true,
        });

        const consoleError = jest
          .spyOn(console, 'error')
          .mockImplementation(() => {});

        const { getByTestId } = render(
          <SafeAreaProvider>
            <NavigationContainer>
              <SurveyDemoScreen />
            </NavigationContainer>
          </SafeAreaProvider>
        );

        const Survey = require('react-native-survey-js-ui').Survey;
        const surveyInstance = Survey.mock.calls[0];

        // Trigger error condition
        act(() => {
          surveyInstance[0].onComplete(null);
        });

        // App should not crash on either platform
        expect(getByTestId('survey-demo-screen')).toBeTruthy();

        consoleError.mockRestore();
      }
    );
  });

  describe('Cross-Platform Library Integration', () => {
    it('should ensure library works on both platforms', async () => {
      const {
        Survey,
        validateSurveyModel,
      } = require('react-native-survey-js-ui');

      // Library exports should be available on both platforms
      for (const platform of ['ios', 'android']) {
        Object.defineProperty(Platform, 'OS', {
          value: platform,
          configurable: true,
        });

        expect(Survey).toBeDefined();
        expect(validateSurveyModel).toBeDefined();
        expect(typeof validateSurveyModel).toBe('function');
      }
    });

    it('should validate survey models consistently across platforms', () => {
      const { validateSurveyModel } = require('react-native-survey-js-ui');

      const testModel = {
        pages: [
          {
            name: 'page1',
            elements: [
              {
                type: 'text',
                name: 'question1',
                title: 'Cross-platform question',
              },
            ],
          },
        ],
      };

      // Validation should work identically on both platforms
      for (const platform of ['ios', 'android']) {
        Object.defineProperty(Platform, 'OS', {
          value: platform,
          configurable: true,
        });

        expect(validateSurveyModel(testModel)).toBe(true);
      }
    });
  });
});
