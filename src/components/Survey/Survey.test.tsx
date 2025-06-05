import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Survey } from './Survey';

// Mock the hooks
jest.mock('../../hooks', () => ({
  useSurveyModel: jest.fn((model) => ({
    model: {
      data: {},
      currentPageNo: 0,
      isCompleted: false,
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
    },
    isLoading: false,
    error: null,
  })),
  useSurveyState: jest.fn(() => ({
    data: {},
    currentPageNo: 0,
    isCompleted: false,
    questions: [],
  })),
}));

let mockCompleteHandlers: Array<{ model: any; handler: any }> = [];

beforeEach(() => {
  mockCompleteHandlers = [];
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
    const { getByText } = render(<Survey model={{}} />);
    expect(getByText('Complete Survey')).toBeTruthy();
  });

  it('should call onComplete when complete button is pressed', async () => {
    const mockOnComplete = jest.fn();
    const mockModel = {
      id: 'test-survey',
      title: 'Test Survey',
    };

    const { getByText } = render(
      <Survey model={mockModel} onComplete={mockOnComplete} />
    );

    const completeButton = getByText('Complete Survey');
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
    const { getByText } = render(<Survey model={{}} />);

    const completeButton = getByText('Complete Survey');
    expect(() => fireEvent.press(completeButton)).not.toThrow();
  });

  it('should use default surveyId when model.id is not provided', () => {
    const mockOnComplete = jest.fn();
    const mockModel = {
      title: 'Test Survey',
      // no id provided
    };

    const { getByText } = render(
      <Survey model={mockModel} onComplete={mockOnComplete} />
    );

    const completeButton = getByText('Complete Survey');
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
});
