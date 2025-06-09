import React, { useState } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { PanelHeader } from '../PanelHeader';

describe('PanelHeader Integration', () => {
  it('should work with Panel component for collapsible functionality', () => {
    const PanelWithHeader = () => {
      const [expanded, setExpanded] = useState(true);

      return (
        <View testID="panel-container">
          <PanelHeader
            title="Survey Questions"
            description="Please answer all questions"
            collapsible
            expanded={expanded}
            onToggle={setExpanded}
            testID="panel-header"
          />
          {expanded && (
            <View testID="panel-content">
              <Text>Question 1</Text>
              <Text>Question 2</Text>
            </View>
          )}
        </View>
      );
    };

    const { getByTestId, queryByTestId } = render(<PanelWithHeader />);

    // Initially expanded
    expect(getByTestId('panel-content')).toBeTruthy();

    // Collapse panel
    fireEvent.press(getByTestId('panel-header'));

    // Content should be hidden
    expect(queryByTestId('panel-content')).toBeNull();

    // Expand panel again
    fireEvent.press(getByTestId('panel-header'));

    // Content should be visible again
    expect(getByTestId('panel-content')).toBeTruthy();
  });

  it('should handle multiple panels independently', () => {
    const MultiplePanels = () => {
      const [expanded1, setExpanded1] = useState(true);
      const [expanded2, setExpanded2] = useState(false);

      return (
        <View>
          <View testID="panel-1">
            <PanelHeader
              title="Personal Information"
              collapsible
              expanded={expanded1}
              onToggle={setExpanded1}
              testID="header-1"
            />
            {expanded1 && <Text testID="content-1">Personal content</Text>}
          </View>

          <View testID="panel-2">
            <PanelHeader
              title="Contact Details"
              collapsible
              expanded={expanded2}
              onToggle={setExpanded2}
              testID="header-2"
            />
            {expanded2 && <Text testID="content-2">Contact content</Text>}
          </View>
        </View>
      );
    };

    const { getByTestId, queryByTestId } = render(<MultiplePanels />);

    // Initial states
    expect(getByTestId('content-1')).toBeTruthy();
    expect(queryByTestId('content-2')).toBeNull();

    // Toggle first panel
    fireEvent.press(getByTestId('header-1'));
    expect(queryByTestId('content-1')).toBeNull();
    expect(queryByTestId('content-2')).toBeNull();

    // Toggle second panel
    fireEvent.press(getByTestId('header-2'));
    expect(queryByTestId('content-1')).toBeNull();
    expect(getByTestId('content-2')).toBeTruthy();
  });

  it('should maintain state when parent re-renders', async () => {
    const ParentComponent = () => {
      const [parentState, setParentState] = useState(0);
      const [panelExpanded, setPanelExpanded] = useState(true);

      return (
        <View>
          <Text testID="parent-state">{parentState}</Text>
          <PanelHeader
            title="Settings"
            collapsible
            expanded={panelExpanded}
            onToggle={setPanelExpanded}
            testID="settings-header"
          />
          <Text
            testID="trigger-rerender"
            onPress={() => setParentState(parentState + 1)}
          >
            Trigger Re-render
          </Text>
        </View>
      );
    };

    const { getByTestId } = render(<ParentComponent />);

    // Toggle panel to collapsed
    fireEvent.press(getByTestId('settings-header'));
    
    await waitFor(() => {
      expect(getByTestId('settings-header').props.accessibilityState).toEqual({
        expanded: false,
      });
    });

    // Trigger parent re-render
    fireEvent.press(getByTestId('trigger-rerender'));

    // Panel should remain collapsed
    expect(getByTestId('settings-header').props.accessibilityState).toEqual({
      expanded: false,
    });
  });

  it('should work with custom icons in real usage', () => {
    const ChevronDown = () => <Text>▼</Text>;
    const ChevronUp = () => <Text>▲</Text>;

    const { getByTestId } = render(
      <PanelHeader
        title="Advanced Options"
        collapsible
        expandIcon={<ChevronDown />}
        collapseIcon={<ChevronUp />}
        testID="advanced-header"
      />
    );

    const header = getByTestId('advanced-header');
    expect(header).toBeTruthy();

    // Toggle should work with custom icons
    fireEvent.press(header);
    expect(header.props.accessibilityState).toEqual({ expanded: false });
  });
});