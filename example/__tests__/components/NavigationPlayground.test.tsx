import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationPlayground } from '../../src/components/NavigationPlayground';

// Mock survey-core
jest.mock('survey-core', () => ({
  Model: jest.fn(),
}));

// Mock React Native components
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Switch: ({ value, onValueChange, testID }: any) => {
      return RN.TouchableOpacity({
        testID,
        onPress: () => onValueChange(!value),
        children: RN.Text({}, value ? 'ON' : 'OFF'),
      });
    },
  };
});

// Mock survey model
const createMockSurvey = () => {
  const survey = {
    pages: [
      {
        name: 'page1',
        elements: [{ type: 'text', name: 'q1' }],
      },
      {
        name: 'page2', 
        elements: [{ type: 'text', name: 'q2' }],
      },
      {
        name: 'page3',
        elements: [{ type: 'text', name: 'q3' }],
      },
    ],
    showProgressBar: 'top',
    checkErrorsMode: 'onNextPage',
    showNavigationButtons: 'bottom',
    pageCount: 3,
    currentPage: {
      name: 'page1',
      title: '',
      questions: [],
    },
    state: 'running',
    // Event handlers
    onCurrentPageChanged: { 
      add: jest.fn(), 
      remove: jest.fn(),
      fire: jest.fn(),
    },
    onValueChanged: { 
      add: jest.fn(), 
      remove: jest.fn(),
      fire: jest.fn(),
    },
    onValidatedErrorsOnCurrentPage: { 
      add: jest.fn(), 
      remove: jest.fn(),
      fire: jest.fn(),
    },
    onComplete: { 
      add: jest.fn(), 
      remove: jest.fn(),
      fire: jest.fn(),
    },
  } as any;
  
  // Mock some properties
  Object.defineProperty(survey, 'currentPageNo', { 
    get: jest.fn(() => 0),
    configurable: true,
  });
  Object.defineProperty(survey, 'visiblePageCount', { 
    get: jest.fn(() => 3),
    configurable: true,
  });
  Object.defineProperty(survey, 'isFirstPage', { 
    get: jest.fn(() => true),
    configurable: true,
  });
  Object.defineProperty(survey, 'isLastPage', { 
    get: jest.fn(() => false),
    configurable: true,
  });
  
  return survey;
};

describe('NavigationPlayground', () => {
  let mockSurvey: any;
  let mockOnConfigChange: jest.Mock;

  beforeEach(() => {
    mockSurvey = createMockSurvey();
    mockOnConfigChange = jest.fn();
  });

  it('should render navigation state correctly', () => {
    const { getByText, getByTestId } = render(
      <NavigationPlayground survey={mockSurvey} onConfigChange={mockOnConfigChange} />
    );

    // Check navigation state display
    expect(getByText('Navigation State')).toBeTruthy();
    expect(getByText('1 of 3')).toBeTruthy(); // Current page
    expect(getByText('page1')).toBeTruthy(); // Page name
    expect(getByText('33%')).toBeTruthy(); // Progress
    expect(getByText('3')).toBeTruthy(); // Visible pages
  });

  it('should display button states correctly', () => {
    const { getByText, getAllByText } = render(
      <NavigationPlayground survey={mockSurvey} onConfigChange={mockOnConfigChange} />
    );

    expect(getByText('Button States')).toBeTruthy();
    expect(getByText('Previous:')).toBeTruthy();
    expect(getByText('Hidden')).toBeTruthy(); // Previous hidden on first page
    expect(getByText('Next:')).toBeTruthy();
    expect(getAllByText('Visible').length).toBeGreaterThan(0); // Next visible
  });

  it('should toggle progress bar visibility', () => {
    const { getByTestId } = render(
      <NavigationPlayground survey={mockSurvey} onConfigChange={mockOnConfigChange} />
    );

    const progressToggle = getByTestId('progress-toggle-switch');
    
    // Toggle off
    fireEvent(progressToggle, 'onValueChange', false);
    expect(mockOnConfigChange).toHaveBeenCalledWith({ showProgressBar: 'off' });

    // Toggle on
    fireEvent(progressToggle, 'onValueChange', true);
    expect(mockOnConfigChange).toHaveBeenCalledWith({ showProgressBar: 'top' });
  });

  it('should change progress bar position', () => {
    const { getByText } = render(
      <NavigationPlayground survey={mockSurvey} onConfigChange={mockOnConfigChange} />
    );

    // Click bottom position
    fireEvent.press(getByText('bottom'));
    expect(mockOnConfigChange).toHaveBeenCalledWith({ showProgressBar: 'bottom' });

    // Click both position
    fireEvent.press(getByText('both'));
    expect(mockOnConfigChange).toHaveBeenCalledWith({ showProgressBar: 'both' });
  });

  it('should change validation mode', () => {
    const { getByText } = render(
      <NavigationPlayground survey={mockSurvey} onConfigChange={mockOnConfigChange} />
    );

    fireEvent.press(getByText('onComplete'));
    expect(mockOnConfigChange).toHaveBeenCalledWith({ checkErrorsMode: 'onComplete' });

    fireEvent.press(getByText('onValueChanged'));
    expect(mockOnConfigChange).toHaveBeenCalledWith({ checkErrorsMode: 'onValueChanged' });
  });

  it('should change navigation button position', () => {
    const { getAllByText } = render(
      <NavigationPlayground survey={mockSurvey} onConfigChange={mockOnConfigChange} />
    );

    // Find button position options (there are multiple 'bottom' texts)
    const topButtons = getAllByText('top');
    const navigationTopButton = topButtons[topButtons.length - 1]; // Last 'top' is for nav buttons
    
    fireEvent.press(navigationTopButton);
    expect(mockOnConfigChange).toHaveBeenCalledWith({ showNavigationButtons: 'top' });
  });

  it('should display validation errors when present', () => {
    // Create survey with errors
    const surveyWithErrors = createMockSurvey();
    const mockQuestion = {
      name: 'q1',
      errors: [
        { getText: () => 'Field is required' },
        { getText: () => 'Invalid format' },
      ],
    };
    
    if (surveyWithErrors.currentPage) {
      surveyWithErrors.currentPage.questions = [mockQuestion as any];
    }

    const { getByText } = render(
      <NavigationPlayground survey={surveyWithErrors} onConfigChange={mockOnConfigChange} />
    );

    expect(getByText('Validation State')).toBeTruthy();
    expect(getByText('Yes')).toBeTruthy(); // Has errors
    expect(getByText('2')).toBeTruthy(); // Error count
    expect(getByText('q1:')).toBeTruthy();
    expect(getByText('• Field is required')).toBeTruthy();
    expect(getByText('• Invalid format')).toBeTruthy();
  });

  it('should display event history', async () => {
    const { getByText, getByTestId } = render(
      <NavigationPlayground survey={mockSurvey} onConfigChange={mockOnConfigChange} />
    );

    expect(getByText('Event History')).toBeTruthy();
    expect(getByText('No events yet. Navigate to see events.')).toBeTruthy();

    // Simulate page change event
    const pageChangeHandler = mockSurvey.onCurrentPageChanged.fire as jest.Mock;
    pageChangeHandler?.(mockSurvey, {
      oldCurrentPage: { name: 'page1' },
      newCurrentPage: { name: 'page2' },
      isNextPage: true,
      isPrevPage: false,
    });

    await waitFor(() => {
      expect(getByText('Page Changed')).toBeTruthy();
    });
  });

  it('should handle surveys with no current page', () => {
    const surveyNoPage = createMockSurvey();
    surveyNoPage.currentPage = undefined;

    const { getByText } = render(
      <NavigationPlayground survey={surveyNoPage} onConfigChange={mockOnConfigChange} />
    );

    expect(getByText('Navigation State')).toBeTruthy();
    expect(getByText('No')).toBeTruthy(); // No validation errors
  });
});