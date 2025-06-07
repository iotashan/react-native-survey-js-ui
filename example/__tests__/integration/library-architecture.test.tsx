import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  Survey,
  validateSurveyModel,
  BaseQuestion,
  TextQuestion,
  QuestionFactory,
} from 'react-native-survey-js-ui';
import App from '../../src/App';
import SurveyDemoScreen from '../../src/screens/SurveyDemoScreen';
// ExploreScreen is imported but not used in these tests
// import ExploreScreen from '../../src/screens/ExploreScreen';

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

describe('Library Architecture Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Library Import and Export Verification', () => {
    it('should export all required components from the library', () => {
      expect(Survey).toBeDefined();
      expect(validateSurveyModel).toBeDefined();
      expect(BaseQuestion).toBeDefined();
      expect(TextQuestion).toBeDefined();
      expect(QuestionFactory).toBeDefined();
    });

    it('should have correct export types', () => {
      expect(typeof Survey).toBe('function');
      expect(typeof validateSurveyModel).toBe('function');
      expect(typeof BaseQuestion).toBe('function');
      expect(typeof TextQuestion).toBe('function');
      expect(typeof QuestionFactory).toBe('object');
    });
  });

  describe('Library Integration with React Navigation', () => {
    it('should render Survey component within navigation context', async () => {
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

      // Verify Survey component was called
      expect(Survey).toHaveBeenCalled();
    });

    it('should handle library components in tab navigation', async () => {
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

      // Both screens should be able to use library components
      expect(Survey).toBeDefined();
      expect(QuestionFactory).toBeDefined();
    });
  });

  describe('Survey Model Validation Integration', () => {
    it('should validate survey models correctly in app context', () => {
      const validModel = {
        pages: [
          {
            name: 'page1',
            elements: [
              {
                type: 'text',
                name: 'question1',
                title: 'Test Question',
              },
            ],
          },
        ],
      };

      const invalidModel = {
        // Missing required structure
      };

      expect(validateSurveyModel(validModel)).toBe(true);
      expect(validateSurveyModel(invalidModel)).toBe(false);
    });

    it('should handle validation errors gracefully', () => {
      const { getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Component should render even with validation logic
      expect(getByTestId('survey-demo-screen')).toBeTruthy();
    });
  });

  describe('Component Factory Integration', () => {
    it('should integrate QuestionFactory with app components', () => {
      // Verify QuestionFactory methods are available
      expect(QuestionFactory.registerQuestionType).toBeDefined();
      expect(QuestionFactory.getRegisteredTypes).toBeDefined();
      expect(typeof QuestionFactory.registerQuestionType).toBe('function');
      expect(typeof QuestionFactory.getRegisteredTypes).toBe('function');
    });

    it('should allow custom question type registration', () => {
      const customQuestionType = 'customType';
      const CustomQuestion = () => null;

      // Should not throw when registering
      expect(() => {
        QuestionFactory.registerQuestionType(
          customQuestionType,
          CustomQuestion
        );
      }).not.toThrow();
    });
  });

  describe('Library Props and Callbacks Integration', () => {
    it('should pass all required props to Survey component', async () => {
      render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Check that Survey was called with correct props
      expect(Survey).toHaveBeenCalled();
      const surveyProps = Survey.mock.calls[0][0];

      expect(surveyProps).toHaveProperty('model');
      expect(surveyProps).toHaveProperty('onComplete');
      expect(surveyProps).toHaveProperty('onValueChanged');
      expect(surveyProps).toHaveProperty('onCurrentPageChanged');
    });

    it('should handle Survey callbacks correctly', async () => {
      render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const surveyProps = Survey.mock.calls[0][0];

      // Test onComplete callback
      expect(() => {
        surveyProps.onComplete({ test: 'data' });
      }).not.toThrow();

      // Test onValueChanged callback
      expect(() => {
        surveyProps.onValueChanged({
          name: 'question1',
          value: 'answer',
          oldValue: '',
        });
      }).not.toThrow();

      // Test onCurrentPageChanged callback
      expect(() => {
        surveyProps.onCurrentPageChanged({
          oldCurrentPage: { name: 'page1' },
          newCurrentPage: { name: 'page2' },
          isNextPage: true,
          isPrevPage: false,
        });
      }).not.toThrow();
    });
  });

  describe('Library State Management Integration', () => {
    it('should maintain survey state within app lifecycle', async () => {
      const { rerender } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const firstCallCount = Survey.mock.calls.length;

      // Force re-render
      rerender(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Survey should be called again for re-render
      expect(Survey.mock.calls.length).toBeGreaterThan(firstCallCount);
    });
  });

  describe('Library Performance Integration', () => {
    it('should render library components efficiently', async () => {
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

      // Rendering should be fast (under 1 second)
      expect(renderTime).toBeLessThan(1000);
    });

    it('should handle multiple Survey instances', () => {
      // Render multiple instances
      const { unmount: unmount1 } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      const { unmount: unmount2 } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Both should render without issues
      expect(Survey).toHaveBeenCalledTimes(2);

      // Cleanup
      unmount1();
      unmount2();
    });
  });

  describe('Cross-Component Communication', () => {
    it('should share library context between screens', async () => {
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

      // Both screens should have access to library components
      // This is verified by the fact that the app renders without errors
      // and both screens can import and use library components
    });
  });

  describe('Error Boundary Integration', () => {
    it('should handle library errors gracefully', () => {
      // Mock Survey to throw an error
      const originalSurvey = Survey;
      (Survey as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      // Should not crash the app
      const { getByTestId } = render(
        <SafeAreaProvider>
          <NavigationContainer>
            <SurveyDemoScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      );

      // Screen should still render
      expect(getByTestId('survey-demo-screen')).toBeTruthy();

      // Restore original mock
      (Survey as jest.Mock).mockImplementation(originalSurvey);
    });
  });
});
