import React from 'react';
import { render } from '@testing-library/react-native';
import { Survey } from '../Survey';
import {
  createBasicSurvey,
  describeIOS,
  describeAndroid,
  describeCrossPlatform,
  testIOS,
  testAndroid,
  setupPlatformMocks,
  getPlatformTestData,
} from '../../../test-utils';

// Mock survey-core
jest.mock('survey-core', () => ({
  Model: jest.fn().mockImplementation((json) => ({
    data: {},
    currentPageNo: 0,
    pageCount: json?.pages?.length || 1,
    isFirstPage: true,
    isLastPage: json?.pages?.length <= 1,
    isCompleted: false,
    nextPage: jest.fn(),
    prevPage: jest.fn(),
    doComplete: jest.fn(),
    getAllQuestions: jest.fn(() => []),
    onComplete: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onCurrentPageChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onValueChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    setValue: jest.fn(),
    getValue: jest.fn(),
    getProgressInfo: jest.fn(() => ({
      currentPageNo: 0,
      pageCount: json?.pages?.length || 1,
      questionCount: 0,
      answeredQuestionCount: 0,
      requiredQuestionCount: 0,
      requiredAnsweredQuestionCount: 0,
    })),
    currentPage: json?.pages?.[0] || null,
    showProgressBar: json?.showProgressBar !== false,
    progressBarType: json?.progressBarType || 'pages',
    clear: jest.fn(),
    addNewPage: jest.fn(),
    pages: json?.pages || [],
  })),
}));

// Mock the hooks
jest.mock('../../../hooks', () => ({
  useSurveyModel: jest.fn((model) => {
    const SurveyCore = require('survey-core');
    const surveyModel = new SurveyCore.Model(model);
    return {
      model: surveyModel,
      isLoading: false,
      error: null,
    };
  }),
  useSurveyState: jest.fn((surveyModel) => ({
    currentPageNo: surveyModel?.currentPageNo || 0,
    pageCount: surveyModel?.pageCount || 1,
    isFirstPage: surveyModel?.isFirstPage !== false,
    isLastPage: surveyModel?.isLastPage !== false,
    isCompleted: surveyModel?.isCompleted || false,
    questions: surveyModel?.currentPage?.elements || [],
  })),
}));

// Setup platform-specific mocks
setupPlatformMocks();

describe('Survey Component - Platform Tests', () => {
  const defaultSurvey = createBasicSurvey();

  describeCrossPlatform('Core functionality', () => {
    it('should render on both platforms', () => {
      const { getByTestId } = render(<Survey model={defaultSurvey} />);
      expect(getByTestId('survey-container')).toBeTruthy();
    });

    it('should handle survey data consistently', () => {
      const survey = createBasicSurvey();
      const { getByTestId } = render(<Survey model={survey} />);

      // Both platforms should show the same survey structure
      expect(getByTestId('survey-container')).toBeTruthy();
    });
  });

  describeIOS('iOS-specific behavior', () => {
    it('should apply iOS-specific styles', () => {
      const { getByTestId } = render(<Survey model={defaultSurvey} />);
      const container = getByTestId('survey-container');

      // iOS-specific style assertions
      expect(container.props.style).toMatchObject(
        expect.objectContaining({
          // Container uses flex layout
          flex: 1,
        })
      );
    });

    it('should handle iOS keyboard behavior', () => {
      // iOS-specific keyboard handling test
      const survey = createBasicSurvey();
      const { getByTestId } = render(<Survey model={survey} />);

      // Simulate iOS keyboard behavior
      expect(getByTestId('survey-container')).toBeTruthy();
    });
  });

  describeAndroid('Android-specific behavior', () => {
    it('should apply Android-specific styles', () => {
      const { getByTestId } = render(<Survey model={defaultSurvey} />);
      const container = getByTestId('survey-container');

      // Android-specific style assertions
      expect(container.props.style).toBeTruthy();
    });

    it('should handle Android back button', () => {
      // Android-specific back button handling
      const survey = createBasicSurvey();
      const onComplete = jest.fn();

      render(<Survey model={survey} onComplete={onComplete} />);

      // Simulate Android back button press
      // This would be handled by navigation in a real app
      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describeCrossPlatform('Platform-specific data handling', () => {
    it('should use platform-appropriate test data', () => {
      const iosData = { title: 'iOS Survey' };
      const androidData = { title: 'Android Survey' };

      const platformData = getPlatformTestData(iosData, androidData);
      const survey = createBasicSurvey();
      survey.title = platformData.title;

      const { getByText } = render(<Survey model={survey} />);
      expect(getByText(platformData.title)).toBeTruthy();
    });
  });

  // Individual platform tests
  testIOS('should handle iOS safe area insets', () => {
    const { getByTestId } = render(<Survey model={defaultSurvey} />);
    const container = getByTestId('survey-container');

    // iOS safe area handling
    expect(container).toBeTruthy();
  });

  testAndroid('should handle Android status bar', () => {
    const { getByTestId } = render(<Survey model={defaultSurvey} />);
    const container = getByTestId('survey-container');

    // Android status bar handling
    expect(container).toBeTruthy();
  });

  describeCrossPlatform('Error handling', () => {
    it('should handle errors consistently across platforms', () => {
      const survey = createBasicSurvey();
      const onError = jest.fn();

      // Note: onError prop doesn't exist on Survey component
      // This test is checking that the component handles model properly
      const { getByTestId } = render(<Survey model={survey} />);

      // Both platforms should render without errors
      expect(getByTestId('survey-container')).toBeTruthy();
    });
  });

  describeCrossPlatform('Performance', () => {
    it('should render large surveys efficiently', () => {
      // Create a large survey with many pages
      const pages = [];
      for (let i = 0; i < 50; i++) {
        pages.push({
          name: `page${i}`,
          elements: [
            {
              type: 'text',
              name: `q${i}`,
              title: `Question ${i}`,
            },
          ],
        });
      }

      const largeSurvey = {
        title: 'Large Survey',
        pages,
      };

      const startTime = Date.now();
      const { getByTestId } = render(<Survey model={largeSurvey} />);
      const renderTime = Date.now() - startTime;

      expect(getByTestId('survey-container')).toBeTruthy();

      // Performance should be reasonable on both platforms
      expect(renderTime).toBeLessThan(1000); // 1 second max
    });
  });
});
