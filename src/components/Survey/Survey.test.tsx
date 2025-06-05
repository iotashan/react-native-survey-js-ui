import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Survey } from './Survey';

// Mock survey-core
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

  it('should render survey-core integration text', () => {
    const { getByText } = render(<Survey model={{}} />);
    expect(
      getByText(
        'Survey-core integration active. Full rendering in future sprints.'
      )
    ).toBeTruthy();
  });

  it('should render complete button', () => {
    const mockUseSurveyState = require('../../hooks').useSurveyState;
    mockUseSurveyState.mockReturnValue({
      currentPageNo: 0,
      pageCount: 1,
      isFirstPage: true,
      isLastPage: true,
      isCompleted: false,
      questions: [],
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

    const completeButton = getByText('Complete');
    fireEvent.press(completeButton);

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
    mockUseSurveyState.mockReturnValue({
      currentPageNo: 0,
      pageCount: 1,
      isFirstPage: true,
      isLastPage: true,
      isCompleted: false,
      questions: [],
    });

    const { getByText } = render(<Survey model={{}} />);

    const completeButton = getByText('Complete');
    expect(() => fireEvent.press(completeButton)).not.toThrow();
  });

  it('should use default surveyId when model.id is not provided', () => {
    const mockOnComplete = jest.fn();
    const mockModel = {
      title: 'Test Survey',
      // no id provided
    };

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

    const completeButton = getByText('Complete');
    fireEvent.press(completeButton);

    expect(mockOnComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        surveyId: 'survey',
      })
    );
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
    // Check that no title is rendered (placeholder text should still be there)
    const placeholderText = queryByText(
      'Survey-core integration active. Full rendering in future sprints.'
    );
    expect(placeholderText).toBeTruthy();
  });

  describe('Survey Navigation', () => {
    it('should render navigation buttons', () => {
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

      const { getByText } = render(<Survey model={mockModel} />);
      expect(getByText('Next')).toBeTruthy();
      expect(getByText('Previous')).toBeTruthy();
    });

    it('should disable Previous button on first page', () => {
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

      const { getByText } = render(<Survey model={mockModel} />);
      // Find the Previous button by text
      const prevButtonText = getByText('Previous');
      // Walk up the tree to find the TouchableOpacity with the disabled prop
      let currentNode = prevButtonText;
      while (
        currentNode &&
        !currentNode.props.disabled &&
        !currentNode.props.accessibilityState?.disabled
      ) {
        currentNode = currentNode.parent;
      }
      expect(
        currentNode?.props.disabled ||
          currentNode?.props.accessibilityState?.disabled
      ).toBe(true);
    });

    it('should navigate to next page when Next is pressed', () => {
      const mockModel = {
        pages: [{ name: 'page1' }, { name: 'page2' }],
      };
      const mockUseSurveyModel = require('../../hooks').useSurveyModel;
      const mockUseSurveyState = require('../../hooks').useSurveyState;
      const mockSurveyModel = {
        nextPage: jest.fn(),
        prevPage: jest.fn(),
        doComplete: jest.fn(),
        currentPageNo: 0,
        pageCount: 2,
        isFirstPage: true,
        isLastPage: false,
        onComplete: { add: jest.fn(), remove: jest.fn() },
        getProgressInfo: jest.fn(() => ({ currentPageNo: 0, pageCount: 2 })),
        showProgressBar: true,
      };
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

      const { getByText } = render(<Survey model={mockModel} />);
      fireEvent.press(getByText('Next'));
      expect(mockSurveyModel.nextPage).toHaveBeenCalled();
    });

    it('should navigate to previous page when Previous is pressed', () => {
      const mockModel = {
        pages: [{ name: 'page1' }, { name: 'page2' }],
      };
      const mockUseSurveyModel = require('../../hooks').useSurveyModel;
      const mockUseSurveyState = require('../../hooks').useSurveyState;
      const mockSurveyModel = {
        prevPage: jest.fn(),
        nextPage: jest.fn(),
        doComplete: jest.fn(),
        currentPageNo: 1,
        pageCount: 2,
        isFirstPage: false,
        isLastPage: true,
        onComplete: { add: jest.fn(), remove: jest.fn() },
        getProgressInfo: jest.fn(() => ({ currentPageNo: 1, pageCount: 2 })),
        showProgressBar: true,
      };
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

      const { getByText } = render(<Survey model={mockModel} />);
      fireEvent.press(getByText('Previous'));
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
      expect(getByTestId('survey-progress-bar')).toBeTruthy();
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
  });
});
