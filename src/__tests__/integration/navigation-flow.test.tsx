import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Survey } from '../../components/Survey';
import { PageNavigation } from '../../components/PageNavigation';
import { usePageNavigation } from '../../hooks/usePageNavigation';

// Mock survey-core module
jest.mock('survey-core', () => {
  const mockModel = {
    currentPageNo: 0,
    pageCount: 3,
    isFirstPage: true,
    isLastPage: false,
    currentPage: {
      name: 'page1',
      title: 'Page 1',
      hasErrors: false,
      validate: jest.fn().mockReturnValue(true),
    },
    pages: [],
    nextPage: jest.fn(),
    prevPage: jest.fn(),
    doComplete: jest.fn(),
    completeLastPage: jest.fn(),
    validate: jest.fn().mockReturnValue(true),
    onCurrentPageChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onValidatedErrorsOnCurrentPage: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onComplete: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onPropertyChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onValueChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    progressText: 'Page 1 of 3',
    isNavigatingForward: false,
    setValue: jest.fn(),
    getValue: jest.fn(),
    getAllQuestions: jest.fn().mockReturnValue([]),
    getQuestionByName: jest.fn(),
    getPropertyValue: jest.fn((name) => {
      if (name === 'isCompleted') return false;
      return undefined;
    }),
  };

  // Mock Model constructor
  const Model = jest.fn((json) => {
    const instance = { 
      ...mockModel,
      // Override methods to track state changes
      nextPage: jest.fn(function() {
        if (this.currentPageNo < this.pageCount - 1) {
          this.currentPageNo++;
          this.isFirstPage = this.currentPageNo === 0;
          this.isLastPage = this.currentPageNo === this.pageCount - 1;
          this.currentPage = this.pages[this.currentPageNo] || {
            name: `page${this.currentPageNo + 1}`,
            title: `Page ${this.currentPageNo + 1}`,
            hasErrors: false,
            validate: jest.fn().mockReturnValue(true),
          };
          // Trigger event listeners
          const handlers = this.onCurrentPageChanged.add.mock.calls;
          handlers.forEach(([handler]) => handler && handler());
        }
      }),
      prevPage: jest.fn(function() {
        if (this.currentPageNo > 0) {
          this.currentPageNo--;
          this.isFirstPage = this.currentPageNo === 0;
          this.isLastPage = this.currentPageNo === this.pageCount - 1;
          this.currentPage = this.pages[this.currentPageNo] || {
            name: `page${this.currentPageNo + 1}`,
            title: `Page ${this.currentPageNo + 1}`,
            hasErrors: false,
            validate: jest.fn().mockReturnValue(true),
          };
          // Trigger event listeners
          const handlers = this.onCurrentPageChanged.add.mock.calls;
          handlers.forEach(([handler]) => handler && handler());
        }
      }),
    };
    
    if (json?.pages) {
      instance.pageCount = json.pages.length;
      instance.pages = json.pages.map((page: any, index: number) => ({
        ...page,
        visibleIndex: index,
        hasErrors: false,
        validate: jest.fn().mockReturnValue(true),
      }));
      instance.isFirstPage = true;
      instance.isLastPage = instance.pageCount === 1;
      instance.currentPage = instance.pages[0] || mockModel.currentPage;
    }
    
    // Bind methods to instance
    instance.nextPage = instance.nextPage.bind(instance);
    instance.prevPage = instance.prevPage.bind(instance);
    
    return instance;
  });

  return { Model };
});

// Import Model after mocking
import { Model } from 'survey-core';

// Mock components
jest.mock('../../components/Survey/SurveyPage', () => ({
  SurveyPage: ({ page }: any) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return (
      <View testID={`survey-page-${page.name}`}>
        <Text>{page.title || page.name}</Text>
      </View>
    );
  },
}));

// Helper component to test hook integration
const TestNavigationFlow: React.FC<{ model: Model }> = ({ model }) => {
  const { navigationState, goToNextPage, goToPreviousPage, completeSurvey } = usePageNavigation(model);
  
  return (
    <PageNavigation
      navigationState={navigationState}
      onNext={goToNextPage}
      onPrevious={goToPreviousPage}
      onComplete={completeSurvey}
    />
  );
};

describe('Navigation Flow Integration', () => {
  const createMultiPageSurvey = () => {
    return new Model({
      pages: [
        {
          name: 'page1',
          title: 'Page 1',
          elements: [
            {
              type: 'text',
              name: 'name',
              title: 'What is your name?',
              isRequired: true,
            },
          ],
        },
        {
          name: 'page2',
          title: 'Page 2',
          elements: [
            {
              type: 'text',
              name: 'email',
              title: 'What is your email?',
              isRequired: true,
            },
          ],
        },
        {
          name: 'page3',
          title: 'Page 3',
          elements: [
            {
              type: 'text',
              name: 'comments',
              title: 'Any comments?',
            },
          ],
        },
      ],
    });
  };

  describe('Complete Navigation Flow', () => {
    it('should navigate through multi-page survey', async () => {
      const model = createMultiPageSurvey();
      const onComplete = jest.fn();

      const { getByText, getByTestId, queryByText } = render(
        <>
          <Survey model={model} onComplete={onComplete} />
          <TestNavigationFlow model={model} />
        </>
      );

      // Initial state - Page 1
      expect(getByTestId('survey-page-page1')).toBeTruthy();
      expect(queryByText('Previous')).toBeNull();
      expect(getByText('Next')).toBeTruthy();

      // Try to go next without filling required field
      fireEvent.press(getByText('Next'));
      await waitFor(() => {
        expect(getByTestId('survey-page-page1')).toBeTruthy(); // Still on page 1
      });

      // Fill required field and go to next page
      model.setValue('name', 'John Doe');
      fireEvent.press(getByText('Next'));

      await waitFor(() => {
        expect(getByTestId('survey-page-page2')).toBeTruthy();
      });
      expect(getByText('Previous')).toBeTruthy();
      expect(getByText('Next')).toBeTruthy();

      // Go back to previous page
      fireEvent.press(getByText('Previous'));
      await waitFor(() => {
        expect(getByTestId('survey-page-page1')).toBeTruthy();
      });

      // Go forward again
      fireEvent.press(getByText('Next'));
      await waitFor(() => {
        expect(getByTestId('survey-page-page2')).toBeTruthy();
      });

      // Fill page 2 and continue
      model.setValue('email', 'john@example.com');
      fireEvent.press(getByText('Next'));

      await waitFor(() => {
        expect(getByTestId('survey-page-page3')).toBeTruthy();
      });
      expect(queryByText('Next')).toBeNull();
      expect(getByText('Complete')).toBeTruthy();

      // Complete the survey
      fireEvent.press(getByText('Complete'));
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });

    it('should block navigation on validation errors', async () => {
      const model = createMultiPageSurvey();
      
      const { getByText, getByTestId, queryByTestId } = render(
        <>
          <Survey model={model} />
          <TestNavigationFlow model={model} />
        </>
      );

      // Try to navigate without filling required field
      fireEvent.press(getByText('Next'));

      await waitFor(() => {
        expect(getByTestId('validation-error')).toBeTruthy();
      });

      // Should still be on page 1
      expect(getByTestId('survey-page-page1')).toBeTruthy();
      expect(queryByTestId('survey-page-page2')).toBeNull();
    });

    it('should handle single page survey', () => {
      const model = new Model({
        pages: [
          {
            name: 'page1',
            elements: [
              {
                type: 'text',
                name: 'name',
                title: 'What is your name?',
              },
            ],
          },
        ],
      });

      const { getByText, queryByText } = render(
        <>
          <Survey model={model} />
          <TestNavigationFlow model={model} />
        </>
      );

      // Should show only Complete button
      expect(queryByText('Previous')).toBeNull();
      expect(queryByText('Next')).toBeNull();
      expect(getByText('Complete')).toBeTruthy();
    });

    it('should update progress correctly', () => {
      const model = createMultiPageSurvey();
      model.showProgressBar = 'top';

      const { getByText, getByTestId } = render(<Survey model={model} />);

      // Check initial progress
      expect(getByText('Page 1 of 3')).toBeTruthy();
      const progressBar = getByTestId('survey-progress-bar');
      expect(progressBar).toBeTruthy();

      // Navigate to next page
      model.setValue('name', 'John');
      model.nextPage();

      // Progress should update
      expect(getByText('Page 2 of 3')).toBeTruthy();
    });

    it('should disable navigation during async operations', async () => {
      const model = createMultiPageSurvey();
      
      // Mock async validation
      let resolveValidation: (value: boolean) => void;
      model.validate = jest.fn(() => {
        return new Promise<boolean>((resolve) => {
          resolveValidation = resolve;
        });
      });

      const { getByText, getByTestId } = render(
        <>
          <Survey model={model} />
          <TestNavigationFlow model={model} />
        </>
      );

      // Start navigation
      model.setValue('name', 'John');
      fireEvent.press(getByText('Next'));

      // Should show loading state
      await waitFor(() => {
        expect(getByTestId('navigation-loading')).toBeTruthy();
      });

      // Complete validation
      resolveValidation!(true);

      // Should navigate after validation completes
      await waitFor(() => {
        expect(getByTestId('survey-page-page2')).toBeTruthy();
      });
    });
  });

  describe('State Synchronization', () => {
    it('should sync navigation state with survey model', () => {
      const model = createMultiPageSurvey();
      
      const { getByText, rerender } = render(<TestNavigationFlow model={model} />);

      // Initial state
      expect(getByText('Next')).toBeTruthy();

      // Change model state directly
      model.currentPageNo = 1;

      // Re-render to trigger state update
      rerender(<TestNavigationFlow model={model} />);

      // Navigation buttons should update
      expect(getByText('Previous')).toBeTruthy();
      expect(getByText('Next')).toBeTruthy();

      // Go to last page
      model.currentPageNo = 2;
      rerender(<TestNavigationFlow model={model} />);

      expect(getByText('Complete')).toBeTruthy();
    });

    it('should handle model changes', () => {
      const model1 = createMultiPageSurvey();
      const model2 = new Model({
        pages: [{ name: 'single', elements: [] }],
      });

      const { getByText, queryByText, rerender } = render(
        <TestNavigationFlow model={model1} />
      );

      // Multi-page survey
      expect(getByText('Next')).toBeTruthy();

      // Switch to single-page survey
      rerender(<TestNavigationFlow model={model2} />);

      // Should update to single page navigation
      expect(queryByText('Next')).toBeNull();
      expect(getByText('Complete')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle navigation errors gracefully', async () => {
      const model = createMultiPageSurvey();
      model.nextPage = jest.fn(() => {
        throw new Error('Navigation failed');
      });

      const { getByText, getByTestId } = render(
        <>
          <Survey model={model} />
          <TestNavigationFlow model={model} />
        </>
      );

      model.setValue('name', 'John');
      fireEvent.press(getByText('Next'));

      await waitFor(() => {
        expect(getByTestId('validation-error')).toBeTruthy();
        expect(getByText('An error occurred during navigation')).toBeTruthy();
      });
    });

    it('should recover from validation errors', async () => {
      const model = createMultiPageSurvey();
      
      const { getByText, getByTestId, queryByTestId } = render(
        <>
          <Survey model={model} />
          <TestNavigationFlow model={model} />
        </>
      );

      // First attempt without required field
      fireEvent.press(getByText('Next'));
      await waitFor(() => {
        expect(getByTestId('validation-error')).toBeTruthy();
      });

      // Fill required field
      model.setValue('name', 'John');
      
      // Second attempt should succeed
      fireEvent.press(getByText('Next'));
      await waitFor(() => {
        expect(getByTestId('survey-page-page2')).toBeTruthy();
        expect(queryByTestId('validation-error')).toBeNull();
      });
    });
  });
});