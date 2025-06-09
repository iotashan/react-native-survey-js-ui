import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import PanelDemoScreen from '../../src/screens/PanelDemoScreen';

// Mock dependencies
jest.mock('react-native-survey-js-ui', () => ({
  Survey: ({ onComplete }: any) => {
    const MockSurvey = () => (
      <MockView testID="survey-component">
        <MockTouchableOpacity
          testID="complete-survey"
          onPress={() => onComplete({ test: 'result' })}
        >
          <MockText>Complete Survey</MockText>
        </MockTouchableOpacity>
      </MockView>
    );
    return <MockSurvey />;
  },
  Panel: ({ children, title }: any) => (
    <MockView testID="panel-component">
      <MockText>{title}</MockText>
      {children}
    </MockView>
  ),
  useSurveyModel: (json: any) => ({
    model: {
      getAllPanels: () => [
        { state: 'expanded', setState: jest.fn() },
        { state: 'collapsed', setState: jest.fn() },
      ],
    },
    error: null,
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

const MockView = 'View' as any;
const MockText = 'Text' as any;
const MockTouchableOpacity = 'TouchableOpacity' as any;
const MockSwitch = 'Switch' as any;

describe('PanelDemoScreen', () => {
  const mockNavigation = {
    goBack: jest.fn(),
  };

  const mockRoute = {
    params: {
      componentType: 'panel-basic',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render basic panel demo correctly', () => {
    const { getByText, queryByText } = render(
      <PanelDemoScreen route={mockRoute} navigation={mockNavigation} />
    );

    expect(getByText('Basic Panel')).toBeTruthy();
    expect(getByText('Simple panel with questions')).toBeTruthy();
    expect(getByText('Live Demo:')).toBeTruthy();
    expect(getByText('Properties:')).toBeTruthy();
    expect(getByText('Best Practices:')).toBeTruthy();
  });

  it('should handle navigation back', () => {
    const { getByText } = render(
      <PanelDemoScreen route={mockRoute} navigation={mockNavigation} />
    );

    const backButton = getByText('← Back');
    fireEvent.press(backButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('should toggle code visibility', () => {
    const { getByText, queryByText, UNSAFE_getByProps } = render(
      <PanelDemoScreen route={mockRoute} navigation={mockNavigation} />
    );

    // Code should be visible by default
    expect(queryByText('Code Example:')).toBeTruthy();

    // Find and toggle the switch
    const switches = UNSAFE_getByProps({ value: true });
    fireEvent(switches, 'onValueChange', false);

    // Code should be hidden
    expect(queryByText('Code Example:')).toBeFalsy();
  });

  it('should show toggle all button for collapsible panels', () => {
    const collapsibleRoute = {
      params: {
        componentType: 'panel-collapsible',
      },
    };

    const { getByText } = render(
      <PanelDemoScreen route={collapsibleRoute} navigation={mockNavigation} />
    );

    expect(getByText('Collapse All')).toBeTruthy();
  });

  it('should handle survey completion', async () => {
    const { getByTestId } = render(
      <PanelDemoScreen route={mockRoute} navigation={mockNavigation} />
    );

    const completeSurveyButton = getByTestId('complete-survey');
    fireEvent.press(completeSurveyButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Survey Completed',
        expect.stringContaining('test'),
        expect.any(Array)
      );
    });
  });

  it('should display properties for panel demo', () => {
    const { getByText } = render(
      <PanelDemoScreen route={mockRoute} navigation={mockNavigation} />
    );

    // Check for basic panel properties
    expect(getByText('title')).toBeTruthy();
    expect(getByText('description')).toBeTruthy();
    expect(getByText('elements *')).toBeTruthy();
  });

  it('should handle unknown panel type', () => {
    const unknownRoute = {
      params: {
        componentType: 'panel-unknown',
      },
    };

    const { getByText } = render(
      <PanelDemoScreen route={unknownRoute} navigation={mockNavigation} />
    );

    expect(getByText('Panel demo not found')).toBeTruthy();
  });

  it('should render performance test panel when enabled', () => {
    const { UNSAFE_getAllByProps, getByText } = render(
      <PanelDemoScreen route={mockRoute} navigation={mockNavigation} />
    );

    // Find the performance test switch
    const switches = UNSAFE_getAllByProps({ value: false });
    const performanceSwitch = switches.find((s: any) => 
      s.parent?.children?.some((child: any) => 
        child?.props?.children === 'Performance Test'
      )
    );

    if (performanceSwitch) {
      fireEvent(performanceSwitch, 'onValueChange', true);
      
      // Should now show performance test panel
      expect(getByText('Performance Test Panel')).toBeTruthy();
    }
  });

  it('should display best practices', () => {
    const { getByText } = render(
      <PanelDemoScreen route={mockRoute} navigation={mockNavigation} />
    );

    expect(getByText('• Use panels to group related questions together')).toBeTruthy();
    expect(getByText('• Keep nesting levels reasonable (max 3-4 levels)')).toBeTruthy();
    expect(getByText('• Provide clear titles and descriptions for panels')).toBeTruthy();
  });
});