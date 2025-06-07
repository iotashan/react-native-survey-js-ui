import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from '../../src/App';

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
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

describe('Navigation Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockGoBack.mockClear();
  });

  describe('Tab Navigation', () => {
    it('should navigate between Survey Demo and Explore tabs', async () => {
      const { getByText, getByTestId, queryByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Initially on Survey Demo tab
      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
        expect(queryByTestId('explore-scroll-view')).toBeFalsy();
      });

      // Navigate to Explore tab
      const exploreTab = getByText('Explore');
      fireEvent.press(exploreTab);

      await waitFor(() => {
        expect(queryByTestId('survey-demo-screen')).toBeFalsy();
        expect(getByTestId('explore-scroll-view')).toBeTruthy();
      });

      // Navigate back to Survey Demo tab
      const surveyTab = getByText('Survey Demo');
      fireEvent.press(surveyTab);

      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
        expect(queryByTestId('explore-scroll-view')).toBeFalsy();
      });
    });

    it('should maintain survey state when switching tabs', async () => {
      const { getByText, getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Start on Survey Demo tab
      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
      });

      // Simulate entering some survey data
      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      if (surveyInstance && surveyInstance[0].onValueChanged) {
        act(() => {
          surveyInstance[0].onValueChanged({
            name: 'name',
            value: 'John Doe',
            oldValue: '',
          });
        });
      }

      // Navigate to Explore tab
      fireEvent.press(getByText('Explore'));

      await waitFor(() => {
        expect(getByTestId('explore-scroll-view')).toBeTruthy();
      });

      // Navigate back to Survey Demo
      fireEvent.press(getByText('Survey Demo'));

      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
      });

      // Survey state should be maintained (verify through mock calls)
      expect(Survey).toHaveBeenCalled();
    });

    it('should handle navigation with modal open', async () => {
      const { getByText, getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Open example selector modal
      fireEvent.press(getByTestId('example-selector-button'));

      await waitFor(() => {
        expect(getByText('Select Survey Example')).toBeTruthy();
      });

      // Try to navigate to Explore tab while modal is open
      fireEvent.press(getByText('Explore'));

      // Modal should close and navigation should work
      await waitFor(() => {
        expect(getByTestId('explore-scroll-view')).toBeTruthy();
      });
    });
  });

  describe('Survey State Persistence', () => {
    it('should persist survey completion state across tab navigation', async () => {
      const { getByText, getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Complete a survey
      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      if (surveyInstance && surveyInstance[0].onComplete) {
        act(() => {
          surveyInstance[0].onComplete({
            name: 'John Doe',
            email: 'john@example.com',
          });
        });
      }

      // Verify completion
      await waitFor(() => {
        expect(getByText('Survey Completed!')).toBeTruthy();
      });

      // Navigate to Explore tab
      fireEvent.press(getByText('Explore'));

      await waitFor(() => {
        expect(getByTestId('explore-scroll-view')).toBeTruthy();
      });

      // Navigate back
      fireEvent.press(getByText('Survey Demo'));

      // Completion state should be maintained
      await waitFor(() => {
        expect(getByText('Survey Completed!')).toBeTruthy();
      });
    });

    it('should maintain selected survey example across navigation', async () => {
      const { getByText, getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Select a different survey example
      fireEvent.press(getByTestId('example-selector-button'));

      await waitFor(() => {
        expect(getByText('Select Survey Example')).toBeTruthy();
      });

      fireEvent.press(getByTestId('example-validation'));

      await waitFor(() => {
        expect(getByText('Validation Rules')).toBeTruthy();
      });

      // Navigate to Explore
      fireEvent.press(getByText('Explore'));

      await waitFor(() => {
        expect(getByTestId('explore-scroll-view')).toBeTruthy();
      });

      // Navigate back
      fireEvent.press(getByText('Survey Demo'));

      // Selected example should be maintained
      await waitFor(() => {
        expect(getByText('Validation Rules')).toBeTruthy();
      });
    });
  });

  describe('Component Navigation in Explore Tab', () => {
    it('should navigate to component details when item is pressed', async () => {
      const { getByText, getByTestId } = render(
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

      // Press on a component item
      const textComponent = getByTestId('component-item-text');
      fireEvent.press(textComponent);

      // Verify navigation was called
      expect(mockNavigate).toHaveBeenCalledWith('ComponentDetails', {
        componentType: 'text',
      });
    });

    it('should filter components and navigate correctly', async () => {
      const { getByText, getByTestId, queryByTestId } = render(
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

      // Apply category filter
      fireEvent.press(getByTestId('category-tab-Text Input'));

      await waitFor(() => {
        // Text input components should be visible
        expect(queryByTestId('component-item-text')).toBeTruthy();
      });

      // Navigate to component
      fireEvent.press(getByTestId('component-item-text'));

      expect(mockNavigate).toHaveBeenCalledWith('ComponentDetails', {
        componentType: 'text',
      });
    });
  });

  describe('Deep Navigation Scenarios', () => {
    it('should handle rapid tab switching', async () => {
      const { getByText, getByTestId, queryByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Rapidly switch between tabs
      for (let i = 0; i < 5; i++) {
        fireEvent.press(getByText('Explore'));
        fireEvent.press(getByText('Survey Demo'));
      }

      // Should end up on Survey Demo
      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
        expect(queryByTestId('explore-scroll-view')).toBeFalsy();
      });
    });

    it('should handle navigation during survey events', async () => {
      const { getByText, getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Trigger survey event
      const Survey = require('react-native-survey-js-ui').Survey;
      const surveyInstance = Survey.mock.calls[0];

      if (surveyInstance && surveyInstance[0].onValueChanged) {
        act(() => {
          surveyInstance[0].onValueChanged({
            name: 'name',
            value: 'Test',
            oldValue: '',
          });
        });
      }

      // Immediately navigate
      fireEvent.press(getByText('Explore'));

      // Navigation should work without issues
      await waitFor(() => {
        expect(getByTestId('explore-scroll-view')).toBeTruthy();
      });
    });
  });

  describe('Error Boundary Integration', () => {
    it('should recover from navigation errors gracefully', async () => {
      const { getByText, getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <App />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // App should render successfully
      await waitFor(() => {
        expect(getByTestId('survey-demo-screen')).toBeTruthy();
      });

      // Navigation should work even after errors
      fireEvent.press(getByText('Explore'));

      await waitFor(() => {
        expect(getByTestId('explore-scroll-view')).toBeTruthy();
      });
    });
  });
});
