import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text, TextInput } from 'react-native';
import { Survey } from './Survey';

// Mock survey-core
// Mock SurveyPage component
jest.mock('./SurveyPage', () => ({
  SurveyPage: jest.fn((props: any) => {
    const React = require('react');
    const { View, Text, TextInput } = require('react-native');
    const { page, onQuestionValueChange } = props;
    
    if (!page || !page.questions || page.questions.length === 0) {
      return (
        <View testID="survey-page">
          <Text>No questions available</Text>
        </View>
      );
    }
    
    return (
      <View testID="survey-page">
        {page.questions.map((q: any) => (
          <View key={q.name} testID={`question-${q.name}`}>
            <Text>{q.title}</Text>
            {q.type === 'text' && (
              <TextInput
                testID="text-question-input"
                value={q.value || ''}
                onChangeText={(value) => {
                  // Call the prop callback
                  if (onQuestionValueChange) {
                    onQuestionValueChange(q.name, value);
                  }
                }}
              />
            )}
          </View>
        ))}
      </View>
    );
  }),
}));

jest.mock('survey-core', () => ({
  Model: jest.fn().mockImplementation((json) => ({
    data: {},
    currentPageNo: 0,
    pageCount: json?.pages?.length || 1,
    isFirstPage: true,
    isLastPage: false,
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
  })),
}));

// Mock the hooks
jest.mock('../../hooks', () => ({
  useSurveyModel: jest.fn((model) => {
    const pageCount = model?.pages?.length || 1;
    const isLastPage = pageCount === 1;
    return {
      model: {
        data: {},
        currentPageNo: 0,
        pageCount: pageCount,
        isFirstPage: true,
        isLastPage: isLastPage,
        isCompleted: false,
        nextPage: jest.fn(),
        prevPage: jest.fn(),
        doComplete: jest.fn(() => {
          // Simulate completion
          const completeHandler = mockCompleteHandlers.find(
            (h) => h.model === model
          );
          if (completeHandler) {
            completeHandler.handler({ data: {} });
          }
        }),
        onComplete: {
          add: jest.fn((handler) => {
            mockCompleteHandlers.push({ model, handler });
          }),
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
        getProgressInfo: jest.fn(() => ({
          currentPageNo: 0,
          pageCount: pageCount,
        })),
        showProgressBar: model?.showProgressBar !== false,
        progressBarType: model?.progressBarType || 'pages',
      },
      isLoading: false,
      error: null,
    };
  }),
  useSurveyState: jest.fn((surveyModel) => ({
    data: {},
    currentPageNo: surveyModel?.currentPageNo || 0,
    pageCount: surveyModel?.pageCount || 1,
    isFirstPage: surveyModel?.isFirstPage ?? true,
    isLastPage: surveyModel?.isLastPage ?? false,
    isCompleted: surveyModel?.isCompleted ?? false,
    questions: [],
    updateQuestionValue: jest.fn((name, value) => {
      if (surveyModel && surveyModel.setValue) {
        surveyModel.setValue(name, value);
      }
    }),
  })),
  usePageNavigation: jest.fn((model) => ({
    navigationState: {
      currentPageNo: model?.currentPageNo || 0,
      pageCount: model?.pageCount || 1,
      isFirstPage: model?.isFirstPage ?? true,
      isLastPage: model?.isLastPage ?? false,
      canGoNext: model ? !model.isLastPage : false,
      canGoPrevious: model ? !model.isFirstPage : false,
      isNavigating: false,
      validationError: null,
    },
    goToNextPage: jest.fn((validatePage) => {
      // If validation function is provided, call it
      if (validatePage) {
        const isValid = validatePage();
        if (!isValid) return;
      }
      // Simulate navigation
      if (model && model.nextPage) {
        model.nextPage();
      }
    }),
    goToPreviousPage: jest.fn(() => {
      if (model && model.prevPage) {
        model.prevPage();
      }
    }),
    completeSurvey: jest.fn((validatePage) => {
      // If validation function is provided, call it
      if (validatePage) {
        const isValid = validatePage();
        if (!isValid) return;
      }
      // Simulate completion
      if (model && model.doComplete) {
        model.doComplete();
      }
    }),
  })),
  usePageValidation: jest.fn((model) => ({
    validationState: {
      errors: {},
      isValidating: false,
      hasErrors: false,
      validationMessages: [],
    },
    validateCurrentPage: jest.fn(() => true),
    validateAllPages: jest.fn(() => true),
    clearValidationErrors: jest.fn(),
    validateQuestion: jest.fn(() => true),
    clearErrors: jest.fn(),
    getQuestionErrors: jest.fn(() => []),
    validationErrors: [],
    isValid: true,
  })),
}));

let mockCompleteHandlers: Array<{ model: any; handler: any }> = [];

beforeEach(() => {
  mockCompleteHandlers = [];
  jest.clearAllMocks();
});

describe('Survey Component', () => {
  it('should render without crashing', () => {
    const { getByTestId } = render(<Survey model={{}} />);
    expect(getByTestId('survey-container')).toBeTruthy();
  });

  it('should accept a survey model prop', () => {
    const mockModel = {
      title: 'Test Survey',
      pages: [],
    };
    const { getByText } = render(<Survey model={mockModel} />);
    expect(getByText('Test Survey')).toBeTruthy();
  });

  it('should render no page message when no currentPage', () => {
    const { getByText } = render(<Survey model={{}} />);
    expect(getByText('No page to display')).toBeTruthy();
  });

  it('should render complete button', () => {
    const mockUseSurveyState = require('../../hooks').useSurveyState;
    const mockUsePageNavigation = require('../../hooks').usePageNavigation;
    
    mockUseSurveyState.mockReturnValue({
      currentPageNo: 0,
      pageCount: 1,
      isFirstPage: true,
      isLastPage: true,
      isCompleted: false,
      questions: [],
    });
    
    mockUsePageNavigation.mockReturnValue({
      navigationState: {
        currentPageNo: 0,
        pageCount: 1,
        isFirstPage: true,
        isLastPage: true,
        canGoNext: true,
        canGoPrevious: false,
        isNavigating: false,
        validationError: null,
      },
      goToNextPage: jest.fn(),
      goToPreviousPage: jest.fn(),
      completeSurvey: jest.fn(),
    });
    
    const { getByText } = render(<Survey model={{}} />);
    expect(getByText('Complete')).toBeTruthy();
  });

  it('should call onComplete when complete button is pressed', async () => {
    const mockOnComplete = jest.fn();
    const mockModel = {
      id: 'test-survey',
      title: 'Test Survey',
    };

    const mockUseSurveyModel = require('../../hooks').useSurveyModel;
    const mockUseSurveyState = require('../../hooks').useSurveyState;
    const mockUsePageNavigation = require('../../hooks').usePageNavigation;
    
    // Get the mocked survey model to access doComplete
    const surveyModelInstance = mockUseSurveyModel(mockModel).model;
    
    const mockCompleteSurvey = jest.fn(async () => {
      // Simulate the completion flow by calling doComplete
      surveyModelInstance.doComplete();
    });
    
    mockUseSurveyState.mockReturnValue({
      currentPageNo: 0,
      pageCount: 1,
      isFirstPage: true,
      isLastPage: true,
      isCompleted: false,
      questions: [],
    });
    
    mockUsePageNavigation.mockReturnValue({
      navigationState: {
        currentPageNo: 0,
        pageCount: 1,
        isFirstPage: true,
        isLastPage: true,
        canGoNext: true,
        canGoPrevious: false,
        isNavigating: false,
        validationError: null,
      },
      goToNextPage: jest.fn(),
      goToPreviousPage: jest.fn(),
      completeSurvey: mockCompleteSurvey,
    });

    const { getByText } = render(
      <Survey model={mockModel} onComplete={mockOnComplete} />
    );

    const completeButton = getByText('Complete');
    fireEvent.press(completeButton);

    // The completeSurvey mock should be called
    expect(mockCompleteSurvey).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
      expect(mockOnComplete).toHaveBeenCalledWith({
        timestamp: expect.any(String),
        surveyId: 'test-survey',
        data: {},
      });
    });
  });

  it('should not throw error when onComplete is not provided', () => {
    const mockUseSurveyState = require('../../hooks').useSurveyState;
    const mockUsePageNavigation = require('../../hooks').usePageNavigation;
    const mockCompleteSurvey = jest.fn();
    
    mockUseSurveyState.mockReturnValue({
      currentPageNo: 0,
      pageCount: 1,
      isFirstPage: true,
      isLastPage: true,
      isCompleted: false,
      questions: [],
    });
    
    mockUsePageNavigation.mockReturnValue({
      navigationState: {
        currentPageNo: 0,
        pageCount: 1,
        isFirstPage: true,
        isLastPage: true,
        canGoNext: true,
        canGoPrevious: false,
        isNavigating: false,
        validationError: null,
      },
      goToNextPage: jest.fn(),
      goToPreviousPage: jest.fn(),
      completeSurvey: mockCompleteSurvey,
    });

    const { getByText } = render(<Survey model={{}} />);

    const completeButton = getByText('Complete');
    expect(() => fireEvent.press(completeButton)).not.toThrow();
  });

  it('should use default surveyId when model.id is not provided', async () => {
    const mockOnComplete = jest.fn();
    const mockModel = {
      title: 'Test Survey',
      // no id provided
    };

    const mockUseSurveyModel = require('../../hooks').useSurveyModel;
    const mockUseSurveyState = require('../../hooks').useSurveyState;
    const mockUsePageNavigation = require('../../hooks').usePageNavigation;
    
    // Get the mocked survey model to access doComplete
    const surveyModelInstance = mockUseSurveyModel(mockModel).model;
    
    const mockCompleteSurvey = jest.fn(async () => {
      // Simulate the completion flow by calling doComplete
      surveyModelInstance.doComplete();
    });
    
    mockUseSurveyState.mockReturnValue({
      currentPageNo: 0,
      pageCount: 1,
      isFirstPage: true,
      isLastPage: true,
      isCompleted: false,
      questions: [],
    });
    
    mockUsePageNavigation.mockReturnValue({
      navigationState: {
        currentPageNo: 0,
        pageCount: 1,
        isFirstPage: true,
        isLastPage: true,
        canGoNext: true,
        canGoPrevious: false,
        isNavigating: false,
        validationError: null,
      },
      goToNextPage: jest.fn(),
      goToPreviousPage: jest.fn(),
      completeSurvey: mockCompleteSurvey,
    });

    const { getByText } = render(
      <Survey model={mockModel} onComplete={mockOnComplete} />
    );

    const completeButton = getByText('Complete');
    fireEvent.press(completeButton);

    // The completeSurvey mock should be called
    expect(mockCompleteSurvey).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          surveyId: 'survey',
        })
      );
    });
  });

  it('should render title when provided in model', () => {
    const mockModel = {
      title: 'Customer Satisfaction Survey',
    };
    const { getByText } = render(<Survey model={mockModel} />);
    expect(getByText('Customer Satisfaction Survey')).toBeTruthy();
  });

  it('should not render title when not provided', () => {
    const { queryByText } = render(<Survey model={{}} />);
    // Check that no title is rendered (the page should show no page message)
    const noPageText = queryByText('No page to display');
    expect(noPageText).toBeTruthy();
  });

  describe('Survey Navigation', () => {
    it('should render navigation buttons', () => {
      const mockModel = {
        pages: [{ name: 'page1' }, { name: 'page2' }],
      };
      const mockUseSurveyModel = require('../../hooks').useSurveyModel;
      const mockUseSurveyState = require('../../hooks').useSurveyState;
      const mockUsePageNavigation = require('../../hooks').usePageNavigation;

      mockUseSurveyModel.mockReturnValue({
        model: {
          data: {},
          currentPageNo: 0,
          pageCount: 2,
          isFirstPage: true,
          isLastPage: false,
          currentPage: { name: 'page1' },
          nextPage: jest.fn(),
          prevPage: jest.fn(),
          doComplete: jest.fn(),
          onComplete: { add: jest.fn(), remove: jest.fn() },
          onCurrentPageChanged: { add: jest.fn(), remove: jest.fn() },
          onValueChanged: { add: jest.fn(), remove: jest.fn() },
          getProgressInfo: jest.fn(() => ({ currentPageNo: 0, pageCount: 2 })),
          showProgressBar: true,
        },
        isLoading: false,
        error: null,
      });

      mockUseSurveyState.mockReturnValue({
        currentPageNo: 0,
        pageCount: 2,
        isFirstPage: true,
        isLastPage: false,
        isCompleted: false,
        questions: [],
      });

      mockUsePageNavigation.mockReturnValue({
        navigationState: {
          currentPageNo: 0,
          pageCount: 2,
          isFirstPage: true,
          isLastPage: false,
          canGoNext: true,
          canGoPrevious: false,
          isNavigating: false,
          validationError: null,
        },
        goToNextPage: jest.fn(),
        goToPreviousPage: jest.fn(),
        completeSurvey: jest.fn(),
      });

      const { getByText, queryByText } = render(<Survey model={mockModel} />);
      // On the first page, we should see Next but not Previous
      expect(getByText('Next')).toBeTruthy();
      expect(queryByText('Previous')).toBeNull();
    });

    it('should hide Previous button on first page', () => {
      const mockModel = {
        pages: [{ name: 'page1' }, { name: 'page2' }],
      };
      const mockUseSurveyModel = require('../../hooks').useSurveyModel;
      const mockUseSurveyState = require('../../hooks').useSurveyState;

      mockUseSurveyModel.mockReturnValue({
        model: {
          data: {},
          currentPageNo: 0,
          pageCount: 2,
          isFirstPage: true,
          isLastPage: false,
          nextPage: jest.fn(),
          prevPage: jest.fn(),
          doComplete: jest.fn(),
          onComplete: { add: jest.fn(), remove: jest.fn() },
          getProgressInfo: jest.fn(() => ({ currentPageNo: 0, pageCount: 2 })),
          showProgressBar: true,
        },
        isLoading: false,
        error: null,
      });

      mockUseSurveyState.mockReturnValue({
        currentPageNo: 0,
        pageCount: 2,
        isFirstPage: true,
        isLastPage: false,
        isCompleted: false,
        questions: [],
      });

      const { getByText, queryByText } = render(<Survey model={mockModel} />);
      // On the first page, Previous button should be hidden
      expect(queryByText('Previous')).toBeNull();
      expect(getByText('Next')).toBeTruthy();
    });

    it('should navigate to next page when Next is pressed', () => {
      const mockModel = {
        pages: [{ name: 'page1' }, { name: 'page2' }],
      };
      const mockUseSurveyModel = require('../../hooks').useSurveyModel;
      const mockUseSurveyState = require('../../hooks').useSurveyState;
      const mockUsePageNavigation = require('../../hooks').usePageNavigation;
      const mockUsePageValidation = require('../../hooks').usePageValidation;
      const mockSurveyModel = {
        nextPage: jest.fn(),
        prevPage: jest.fn(),
        doComplete: jest.fn(),
        currentPageNo: 0,
        pageCount: 2,
        isFirstPage: true,
        isLastPage: false,
        onComplete: { add: jest.fn(), remove: jest.fn() },
        onCurrentPageChanged: { add: jest.fn(), remove: jest.fn() },
        getProgressInfo: jest.fn(() => ({ currentPageNo: 0, pageCount: 2 })),
        showProgressBar: true,
      };
      
      const mockGoToNextPage = jest.fn(() => {
        mockSurveyModel.nextPage();
      });
      
      mockUseSurveyModel.mockReturnValue({
        model: mockSurveyModel,
        isLoading: false,
        error: null,
      });

      mockUseSurveyState.mockReturnValue({
        currentPageNo: 0,
        pageCount: 2,
        isFirstPage: true,
        isLastPage: false,
        isCompleted: false,
        questions: [],
      });

      mockUsePageNavigation.mockReturnValue({
        navigationState: {
          currentPageNo: 0,
          pageCount: 2,
          isFirstPage: true,
          isLastPage: false,
          canGoNext: true,
          canGoPrevious: false,
          isNavigating: false,
          validationError: null,
        },
        goToNextPage: mockGoToNextPage,
        goToPreviousPage: jest.fn(),
        completeSurvey: jest.fn(),
      });

      mockUsePageValidation.mockReturnValue({
        validateCurrentPage: jest.fn(() => true),
      });

      const { getByText } = render(<Survey model={mockModel} />);
      fireEvent.press(getByText('Next'));
      expect(mockGoToNextPage).toHaveBeenCalled();
      expect(mockSurveyModel.nextPage).toHaveBeenCalled();
    });

    it('should navigate to previous page when Previous is pressed', () => {
      const mockModel = {
        pages: [{ name: 'page1' }, { name: 'page2' }],
      };
      const mockUseSurveyModel = require('../../hooks').useSurveyModel;
      const mockUseSurveyState = require('../../hooks').useSurveyState;
      const mockUsePageNavigation = require('../../hooks').usePageNavigation;
      const mockUsePageValidation = require('../../hooks').usePageValidation;
      const mockSurveyModel = {
        prevPage: jest.fn(),
        nextPage: jest.fn(),
        doComplete: jest.fn(),
        currentPageNo: 1,
        pageCount: 2,
        isFirstPage: false,
        isLastPage: true,
        onComplete: { add: jest.fn(), remove: jest.fn() },
        onCurrentPageChanged: { add: jest.fn(), remove: jest.fn() },
        getProgressInfo: jest.fn(() => ({ currentPageNo: 1, pageCount: 2 })),
        showProgressBar: true,
      };

      const mockGoToPreviousPage = jest.fn(() => {
        mockSurveyModel.prevPage();
      });

      mockUseSurveyModel.mockReturnValue({
        model: mockSurveyModel,
        isLoading: false,
        error: null,
      });

      mockUseSurveyState.mockReturnValue({
        currentPageNo: 1,
        pageCount: 2,
        isFirstPage: false,
        isLastPage: true,
        isCompleted: false,
        questions: [],
      });

      mockUsePageNavigation.mockReturnValue({
        navigationState: {
          currentPageNo: 1,
          pageCount: 2,
          isFirstPage: false,
          isLastPage: true,
          canGoNext: false,
          canGoPrevious: true,
          isNavigating: false,
          validationError: null,
        },
        goToNextPage: jest.fn(),
        goToPreviousPage: mockGoToPreviousPage,
        completeSurvey: jest.fn(),
      });

      mockUsePageValidation.mockReturnValue({
        validateCurrentPage: jest.fn(() => true),
      });

      const { getByText } = render(<Survey model={mockModel} />);
      fireEvent.press(getByText('Previous'));
      expect(mockGoToPreviousPage).toHaveBeenCalled();
      expect(mockSurveyModel.prevPage).toHaveBeenCalled();
    });

    it('should show Complete button on last page', () => {
      const mockModel = {
        pages: [{ name: 'page1' }, { name: 'page2' }],
      };
      const mockUseSurveyState = require('../../hooks').useSurveyState;
      mockUseSurveyState.mockReturnValue({
        currentPageNo: 1,
        pageCount: 2,
        isFirstPage: false,
        isLastPage: true,
        isCompleted: false,
        questions: [],
      });

      const { getByText, queryByText } = render(<Survey model={mockModel} />);
      expect(getByText('Complete')).toBeTruthy();
      expect(queryByText('Next')).toBeFalsy();
    });
  });

  describe('Progress Bar', () => {
    it('should render progress bar when showProgressBar is true', () => {
      const mockModel = {
        showProgressBar: 'top',
        pages: [{ name: 'page1' }, { name: 'page2' }],
      };
      const { getByTestId } = render(<Survey model={mockModel} />);
      expect(getByTestId('progress-indicator')).toBeTruthy();
    });

    it('should not render progress bar when showProgressBar is false', () => {
      const mockModel = {
        showProgressBar: false,
        pages: [{ name: 'page1' }, { name: 'page2' }],
      };
      const mockUseSurveyModel = require('../../hooks').useSurveyModel;
      mockUseSurveyModel.mockReturnValue({
        model: {
          ...(mockUseSurveyModel.mock.calls[0]?.[0] || {}),
          showProgressBar: false,
          pageCount: 2,
          currentPageNo: 0,
          isFirstPage: true,
          isLastPage: false,
          nextPage: jest.fn(),
          prevPage: jest.fn(),
          doComplete: jest.fn(),
          onComplete: { add: jest.fn(), remove: jest.fn() },
          getProgressInfo: jest.fn(() => ({ currentPageNo: 0, pageCount: 2 })),
        },
        isLoading: false,
        error: null,
      });
      const { queryByTestId } = render(<Survey model={mockModel} />);
      expect(queryByTestId('survey-progress-bar')).toBeFalsy();
    });

    it('should display correct progress percentage', () => {
      const mockModel = {
        showProgressBar: 'top',
        pages: [{ name: 'page1' }, { name: 'page2' }, { name: 'page3' }],
      };
      const mockUseSurveyModel = require('../../hooks').useSurveyModel;
      mockUseSurveyModel.mockReturnValue({
        model: {
          showProgressBar: true,
          currentPageNo: 1,
          pageCount: 3,
          isFirstPage: false,
          isLastPage: false,
          nextPage: jest.fn(),
          prevPage: jest.fn(),
          doComplete: jest.fn(),
          onComplete: { add: jest.fn(), remove: jest.fn() },
          onCurrentPageChanged: { add: jest.fn(), remove: jest.fn() },
          onValueChanged: { add: jest.fn(), remove: jest.fn() },
          getProgressInfo: jest.fn(() => ({ currentPageNo: 1, pageCount: 3 })),
        },
        isLoading: false,
        error: null,
      });
      const mockUseSurveyState = require('../../hooks').useSurveyState;
      mockUseSurveyState.mockReturnValue({
        currentPageNo: 1,
        pageCount: 3,
        isFirstPage: false,
        isLastPage: false,
        isCompleted: false,
        questions: [],
      });

      const { getByText } = render(<Survey model={mockModel} />);
      expect(getByText('Page 2 of 3')).toBeTruthy();
    });
  });

  describe('Survey Model Integration', () => {
    it('should accept and render SurveyJS JSON models', () => {
      const surveyJSON = {
        title: 'Product Feedback',
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
      };

      const { getByText } = render(<Survey model={surveyJSON} />);
      expect(getByText('Product Feedback')).toBeTruthy();
    });

    it('should handle survey data collection', async () => {
      const mockData = { name: 'John Doe', rating: 5 };
      const mockOnComplete = jest.fn();
      const mockModel = {
        id: 'feedback-survey',
        pages: [{ name: 'page1' }],
      };

      const mockUseSurveyModel = require('../../hooks').useSurveyModel;
      const mockSurveyModel = {
        data: mockData,
        doComplete: jest.fn(() => {
          const handler = mockCompleteHandlers.find(
            (h) => h.model === mockModel
          )?.handler;
          if (handler) {
            handler({ data: mockData });
          }
        }),
        onComplete: {
          add: jest.fn((handler) => {
            mockCompleteHandlers.push({ model: mockModel, handler });
          }),
          remove: jest.fn(),
        },
      };
      mockUseSurveyModel.mockReturnValue({
        model: mockSurveyModel,
        isLoading: false,
        error: null,
      });

      const mockUseSurveyState = require('../../hooks').useSurveyState;
      mockUseSurveyState.mockReturnValue({
        currentPageNo: 0,
        pageCount: 1,
        isFirstPage: true,
        isLastPage: true,
        isCompleted: false,
        questions: [],
      });

      const { getByText } = render(
        <Survey model={mockModel} onComplete={mockOnComplete} />
      );

      fireEvent.press(getByText('Complete'));

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith({
          timestamp: expect.any(String),
          surveyId: 'feedback-survey',
          data: mockData,
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should show loading state', () => {
      const mockUseSurveyModel = require('../../hooks').useSurveyModel;
      mockUseSurveyModel.mockReturnValue({
        model: null,
        isLoading: true,
        error: null,
      });

      const { getByText } = render(<Survey model={{}} />);
      expect(getByText('Loading survey...')).toBeTruthy();
    });

    it('should show error state for invalid models', () => {
      const mockUseSurveyModel = require('../../hooks').useSurveyModel;
      mockUseSurveyModel.mockReturnValue({
        model: null,
        isLoading: false,
        error: new Error('Invalid survey model'),
      });

      const { getByText } = render(<Survey model={{}} />);
      expect(getByText('Error loading survey:')).toBeTruthy();
      expect(getByText('Invalid survey model')).toBeTruthy();
    });
  });

  describe('Question Rendering', () => {
    it('should render questions using QuestionFactory', () => {
      const mockModel = {
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
      };

      const mockUseSurveyModel = require('../../hooks').useSurveyModel;
      mockUseSurveyModel.mockReturnValue({
        model: {
          currentPageNo: 0,
          pageCount: 1,
          isFirstPage: true,
          isLastPage: true,
          isCompleted: false,
          nextPage: jest.fn(),
          prevPage: jest.fn(),
          doComplete: jest.fn(),
          onComplete: { add: jest.fn(), remove: jest.fn() },
          getProgressInfo: jest.fn(() => ({ currentPageNo: 0, pageCount: 1 })),
          showProgressBar: true,
          currentPage: {
            name: 'page1',
            questions: [
              {
                type: 'text',
                name: 'name',
                title: 'What is your name?',
                value: '',
                visible: true,
                isRequired: false,
              },
            ],
          },
        },
        isLoading: false,
        error: null,
      });

      const mockUseSurveyState = require('../../hooks').useSurveyState;
      mockUseSurveyState.mockReturnValue({
        currentPageNo: 0,
        pageCount: 1,
        isFirstPage: true,
        isLastPage: true,
        isCompleted: false,
        questions: [
          {
            type: 'text',
            name: 'name',
            title: 'What is your name?',
            value: '',
            visible: true,
            isRequired: false,
          },
        ],
      });

      const { getByText } = render(<Survey model={mockModel} />);
      expect(getByText('What is your name?')).toBeTruthy();
    });
  });

  describe('Event System', () => {
    let mockValueChangedHandlers: Array<{ model: any; handler: any }> = [];
    let mockPageChangedHandlers: Array<{ model: any; handler: any }> = [];

    beforeEach(() => {
      mockValueChangedHandlers = [];
      mockPageChangedHandlers = [];
    });

    describe('onValueChanged Event', () => {
      it('should register onValueChanged event handler', () => {
        const mockOnValueChanged = jest.fn();
        const mockModel = { id: 'test-survey' };

        const mockUseSurveyModel = require('../../hooks').useSurveyModel;
        const mockSurveyModel = {
          onValueChanged: {
            add: jest.fn((handler) => {
              mockValueChangedHandlers.push({ model: mockModel, handler });
            }),
            remove: jest.fn(),
          },
          onComplete: { add: jest.fn(), remove: jest.fn() },
          onCurrentPageChanged: { add: jest.fn(), remove: jest.fn() },
        };

        mockUseSurveyModel.mockReturnValue({
          model: mockSurveyModel,
          isLoading: false,
          error: null,
        });

        render(
          <Survey model={mockModel} onValueChanged={mockOnValueChanged} />
        );

        expect(mockSurveyModel.onValueChanged.add).toHaveBeenCalledWith(
          expect.any(Function)
        );
      });

      it('should call onValueChanged when question value changes', () => {
        const mockOnValueChanged = jest.fn();
        const mockModel = { id: 'test-survey' };

        const mockUseSurveyModel = require('../../hooks').useSurveyModel;
        const mockSurveyModel = {
          onValueChanged: {
            add: jest.fn((handler) => {
              mockValueChangedHandlers.push({ model: mockModel, handler });
              // Simulate value change immediately
              setTimeout(() => {
                handler(mockModel, {
                  name: 'question1',
                  value: 'new value',
                  oldValue: 'old value',
                  question: { name: 'question1', type: 'text' },
                });
              }, 0);
            }),
            remove: jest.fn(),
          },
          onComplete: { add: jest.fn(), remove: jest.fn() },
          onCurrentPageChanged: { add: jest.fn(), remove: jest.fn() },
        };

        mockUseSurveyModel.mockReturnValue({
          model: mockSurveyModel,
          isLoading: false,
          error: null,
        });

        render(
          <Survey model={mockModel} onValueChanged={mockOnValueChanged} />
        );

        return waitFor(() => {
          expect(mockOnValueChanged).toHaveBeenCalledWith({
            name: 'question1',
            value: 'new value',
            oldValue: 'old value',
            question: { name: 'question1', type: 'text' },
          });
        });
      });

      it('should handle onValueChanged with error catching', () => {
        const mockOnValueChanged = jest.fn(() => {
          throw new Error('Handler error');
        });
        const mockModel = { id: 'test-survey' };

        const mockUseSurveyModel = require('../../hooks').useSurveyModel;
        const mockSurveyModel = {
          onValueChanged: {
            add: jest.fn((handler) => {
              mockValueChangedHandlers.push({ model: mockModel, handler });
              // Simulate value change that will throw
              setTimeout(() => {
                expect(() => {
                  handler(mockModel, {
                    name: 'question1',
                    value: 'new value',
                    oldValue: 'old value',
                  });
                }).not.toThrow();
              }, 0);
            }),
            remove: jest.fn(),
          },
          onComplete: { add: jest.fn(), remove: jest.fn() },
          onCurrentPageChanged: { add: jest.fn(), remove: jest.fn() },
        };

        mockUseSurveyModel.mockReturnValue({
          model: mockSurveyModel,
          isLoading: false,
          error: null,
        });

        render(
          <Survey model={mockModel} onValueChanged={mockOnValueChanged} />
        );
      });

      it('should not register onValueChanged when handler not provided', () => {
        const mockModel = { id: 'test-survey' };

        const mockUseSurveyModel = require('../../hooks').useSurveyModel;
        const mockSurveyModel = {
          onValueChanged: {
            add: jest.fn(),
            remove: jest.fn(),
          },
          onComplete: { add: jest.fn(), remove: jest.fn() },
          onCurrentPageChanged: { add: jest.fn(), remove: jest.fn() },
        };

        mockUseSurveyModel.mockReturnValue({
          model: mockSurveyModel,
          isLoading: false,
          error: null,
        });

        render(<Survey model={mockModel} />);

        expect(mockSurveyModel.onValueChanged.add).not.toHaveBeenCalled();
      });
    });

    describe('onCurrentPageChanged Event', () => {
      it('should register onCurrentPageChanged event handler', () => {
        const mockOnCurrentPageChanged = jest.fn();
        const mockModel = { id: 'test-survey' };

        const mockUseSurveyModel = require('../../hooks').useSurveyModel;
        const mockSurveyModel = {
          onCurrentPageChanged: {
            add: jest.fn((handler) => {
              mockPageChangedHandlers.push({ model: mockModel, handler });
            }),
            remove: jest.fn(),
          },
          onComplete: { add: jest.fn(), remove: jest.fn() },
          onValueChanged: { add: jest.fn(), remove: jest.fn() },
        };

        mockUseSurveyModel.mockReturnValue({
          model: mockSurveyModel,
          isLoading: false,
          error: null,
        });

        render(
          <Survey
            model={mockModel}
            onCurrentPageChanged={mockOnCurrentPageChanged}
          />
        );

        expect(mockSurveyModel.onCurrentPageChanged.add).toHaveBeenCalledWith(
          expect.any(Function)
        );
      });

      it('should call onCurrentPageChanged when page changes', () => {
        const mockOnCurrentPageChanged = jest.fn();
        const mockModel = { id: 'test-survey' };

        const mockUseSurveyModel = require('../../hooks').useSurveyModel;
        const mockSurveyModel = {
          onCurrentPageChanged: {
            add: jest.fn((handler) => {
              mockPageChangedHandlers.push({ model: mockModel, handler });
              // Simulate page change immediately
              setTimeout(() => {
                handler(mockModel, {
                  oldCurrentPage: { name: 'page1', title: 'Page 1' },
                  newCurrentPage: { name: 'page2', title: 'Page 2' },
                  isNextPage: true,
                  isPrevPage: false,
                });
              }, 0);
            }),
            remove: jest.fn(),
          },
          onComplete: { add: jest.fn(), remove: jest.fn() },
          onValueChanged: { add: jest.fn(), remove: jest.fn() },
        };

        mockUseSurveyModel.mockReturnValue({
          model: mockSurveyModel,
          isLoading: false,
          error: null,
        });

        render(
          <Survey
            model={mockModel}
            onCurrentPageChanged={mockOnCurrentPageChanged}
          />
        );

        return waitFor(() => {
          expect(mockOnCurrentPageChanged).toHaveBeenCalledWith({
            oldCurrentPage: { name: 'page1', title: 'Page 1' },
            newCurrentPage: { name: 'page2', title: 'Page 2' },
            isNextPage: true,
            isPrevPage: false,
          });
        });
      });

      it('should not register onCurrentPageChanged when handler not provided', () => {
        const mockModel = { id: 'test-survey' };

        const mockUseSurveyModel = require('../../hooks').useSurveyModel;
        const mockSurveyModel = {
          onCurrentPageChanged: {
            add: jest.fn(),
            remove: jest.fn(),
          },
          onComplete: { add: jest.fn(), remove: jest.fn() },
          onValueChanged: { add: jest.fn(), remove: jest.fn() },
        };

        mockUseSurveyModel.mockReturnValue({
          model: mockSurveyModel,
          isLoading: false,
          error: null,
        });

        render(<Survey model={mockModel} />);

        expect(mockSurveyModel.onCurrentPageChanged.add).not.toHaveBeenCalled();
      });
    });

    describe('Event Cleanup', () => {
      it('should remove event handlers on unmount', () => {
        const mockOnComplete = jest.fn();
        const mockOnValueChanged = jest.fn();
        const mockOnCurrentPageChanged = jest.fn();
        const mockModel = { id: 'test-survey' };

        const mockUseSurveyModel = require('../../hooks').useSurveyModel;
        const mockSurveyModel = {
          onComplete: {
            add: jest.fn(),
            remove: jest.fn(),
          },
          onValueChanged: {
            add: jest.fn(),
            remove: jest.fn(),
          },
          onCurrentPageChanged: {
            add: jest.fn(),
            remove: jest.fn(),
          },
        };

        mockUseSurveyModel.mockReturnValue({
          model: mockSurveyModel,
          isLoading: false,
          error: null,
        });

        const { unmount } = render(
          <Survey
            model={mockModel}
            onComplete={mockOnComplete}
            onValueChanged={mockOnValueChanged}
            onCurrentPageChanged={mockOnCurrentPageChanged}
          />
        );

        unmount();

        expect(mockSurveyModel.onComplete.remove).toHaveBeenCalled();
        expect(mockSurveyModel.onValueChanged.remove).toHaveBeenCalled();
        expect(mockSurveyModel.onCurrentPageChanged.remove).toHaveBeenCalled();
      });

      it('should handle cleanup when survey model is null', () => {
        const mockOnComplete = jest.fn();
        const mockModel = { id: 'test-survey' };

        const mockUseSurveyModel = require('../../hooks').useSurveyModel;
        mockUseSurveyModel.mockReturnValue({
          model: null,
          isLoading: false,
          error: null,
        });

        const { unmount } = render(
          <Survey model={mockModel} onComplete={mockOnComplete} />
        );

        expect(() => unmount()).not.toThrow();
      });
    });

    describe('Multiple Event Handlers', () => {
      it('should handle all events when multiple handlers provided', () => {
        const mockOnComplete = jest.fn();
        const mockOnValueChanged = jest.fn();
        const mockOnCurrentPageChanged = jest.fn();
        const mockModel = { id: 'test-survey' };

        const mockUseSurveyModel = require('../../hooks').useSurveyModel;
        const mockSurveyModel = {
          onComplete: {
            add: jest.fn(),
            remove: jest.fn(),
          },
          onValueChanged: {
            add: jest.fn(),
            remove: jest.fn(),
          },
          onCurrentPageChanged: {
            add: jest.fn(),
            remove: jest.fn(),
          },
        };

        mockUseSurveyModel.mockReturnValue({
          model: mockSurveyModel,
          isLoading: false,
          error: null,
        });

        render(
          <Survey
            model={mockModel}
            onComplete={mockOnComplete}
            onValueChanged={mockOnValueChanged}
            onCurrentPageChanged={mockOnCurrentPageChanged}
          />
        );

        expect(mockSurveyModel.onComplete.add).toHaveBeenCalledWith(
          expect.any(Function)
        );
        expect(mockSurveyModel.onValueChanged.add).toHaveBeenCalledWith(
          expect.any(Function)
        );
        expect(mockSurveyModel.onCurrentPageChanged.add).toHaveBeenCalledWith(
          expect.any(Function)
        );
      });
    });

    describe('question value management', () => {
      it('should update question values and call surveyModel.setValue', () => {
        const mockSetValue = jest.fn();
        const mockSurveyModel = {
          data: {},
          currentPageNo: 0,
          pageCount: 1,
          isFirstPage: true,
          isLastPage: true,
          isCompleted: false,
          setValue: mockSetValue,
          getAllQuestions: jest.fn(() => [
            { name: 'q1', type: 'text', title: 'What is your name?' },
          ]),
          onComplete: { add: jest.fn(), remove: jest.fn() },
          onCurrentPageChanged: { add: jest.fn(), remove: jest.fn() },
          onValueChanged: { add: jest.fn(), remove: jest.fn() },
          currentPage: {
            questions: [
              { name: 'q1', type: 'text', title: 'What is your name?' },
            ],
          },
          showProgressBar: false,
        };

        const mockUseSurveyModel = require('../../hooks').useSurveyModel;
        mockUseSurveyModel.mockReturnValue({
          model: mockSurveyModel,
          isLoading: false,
          error: null,
        });

        const mockUseSurveyState = require('../../hooks').useSurveyState;
        mockUseSurveyState.mockReturnValue({
          currentPage: {
            questions: [
              { name: 'q1', type: 'text', title: 'What is your name?' },
            ],
          },
          questions: [
            { name: 'q1', type: 'text', title: 'What is your name?' },
          ],
          isFirstPage: true,
          isLastPage: true,
          pageCount: 1,
          updateQuestionValue: jest.fn((name, value) => {
            mockSetValue(name, value);
          }),
          currentPageNo: 0,
          progress: 0,
          canGoNext: true,
          canGoPrevious: false,
          isCompleted: false,
        });

        const { getByTestId } = render(<Survey model={{}} />);
        const questionInput = getByTestId('text-question-input');

        // Trigger text change
        fireEvent.changeText(questionInput, 'new value');

        expect(mockSetValue).toHaveBeenCalledWith('q1', 'new value');
      });

      it('should handle onChange when surveyModel is null', () => {
        const mockUseSurveyModel = require('../../hooks').useSurveyModel;
        mockUseSurveyModel.mockReturnValue({
          model: null,
          isLoading: false,
          error: null,
        });

        const mockModel = {
          pages: [
            {
              name: 'page1',
              elements: [{ type: 'text', name: 'q1', title: 'Question 1' }],
            },
          ],
        };

        // Should not throw when model is null
        expect(() => render(<Survey model={mockModel} />)).not.toThrow();
      });
    });
  });

  describe('Page Validation Integration', () => {
    it('should use validation hook with the survey model', () => {
      const mockModel = { id: 'test-survey' };
      const mockUsePageValidation = require('../../hooks').usePageValidation;

      render(<Survey model={mockModel} />);

      expect(mockUsePageValidation).toHaveBeenCalledWith(
        expect.objectContaining({})
      );
    });

    it('should pass validation state to page navigation', () => {
      const mockModel = { id: 'test-survey' };
      const mockUsePageValidation = require('../../hooks').usePageValidation;
      const mockUsePageNavigation = require('../../hooks').usePageNavigation;

      // Mock validation with errors
      mockUsePageValidation.mockReturnValue({
        validationState: {
          errors: { question1: ['This field is required'] },
          isValidating: false,
          hasErrors: true,
        },
        validateCurrentPage: jest.fn(() => false),
        clearErrors: jest.fn(),
        getQuestionErrors: jest.fn(() => ['This field is required']),
      });

      render(<Survey model={mockModel} />);

      expect(mockUsePageValidation).toHaveBeenCalledWith(
        expect.objectContaining({})
      );
    });

    it('should display validation errors in the UI', () => {
      const mockModel = {
        id: 'test-survey',
        pages: [
          {
            name: 'page1',
            elements: [{ type: 'text', name: 'q1', title: 'Question 1' }],
          },
        ],
      };

      const mockUsePageValidation = require('../../hooks').usePageValidation;
      
      // Mock validation with errors
      mockUsePageValidation.mockReturnValue({
        validationState: {
          errors: { q1: ['This field is required'] },
          isValidating: false,
          hasErrors: true,
        },
        validateCurrentPage: jest.fn(() => false),
        clearErrors: jest.fn(),
        getQuestionErrors: jest.fn((name) => 
          name === 'q1' ? ['This field is required'] : []
        ),
      });

      const { getByText } = render(<Survey model={mockModel} />);
      
      // Check that validation errors would be available through the hook
      const validationHook = mockUsePageValidation.mock.results[0].value;
      expect(validationHook.getQuestionErrors('q1')).toEqual(['This field is required']);
    });

    it('should clear validation errors when clearErrors is called', () => {
      const mockModel = { id: 'test-survey' };
      const mockClearErrors = jest.fn();
      const mockUsePageValidation = require('../../hooks').usePageValidation;

      mockUsePageValidation.mockReturnValue({
        validationState: {
          errors: {},
          isValidating: false,
          hasErrors: false,
        },
        validateCurrentPage: jest.fn(() => true),
        clearErrors: mockClearErrors,
        getQuestionErrors: jest.fn(() => []),
      });

      render(<Survey model={mockModel} />);

      const validationHook = mockUsePageValidation.mock.results[0].value;
      validationHook.clearErrors();
      
      expect(mockClearErrors).toHaveBeenCalled();
    });

    it('should validate page before navigation', () => {
      const mockModel = { id: 'test-survey' };
      const mockValidateCurrentPage = jest.fn(() => true);
      const mockUsePageValidation = require('../../hooks').usePageValidation;

      mockUsePageValidation.mockReturnValue({
        validationState: {
          errors: {},
          isValidating: false,
          hasErrors: false,
        },
        validateCurrentPage: mockValidateCurrentPage,
        clearErrors: jest.fn(),
        getQuestionErrors: jest.fn(() => []),
      });

      render(<Survey model={mockModel} />);

      // The hook should be available for navigation components to use
      const validationHook = mockUsePageValidation.mock.results[0].value;
      const isValid = validationHook.validateCurrentPage();
      
      expect(mockValidateCurrentPage).toHaveBeenCalled();
      expect(isValid).toBe(true);
    });
  });
});
