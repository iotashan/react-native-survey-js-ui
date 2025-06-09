import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Animated, AccessibilityInfo, Text } from 'react-native';
import { PanelHeader } from './PanelHeader';

describe('PanelHeader', () => {
  let mockTiming: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Animated.timing
    mockTiming = jest.fn(() => ({
      start: jest.fn((callback) => callback && callback({ finished: true })),
    }));
    
    jest.spyOn(Animated, 'timing').mockImplementation(mockTiming);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render with title only', () => {
      const { getByText, queryByTestId } = render(
        <PanelHeader title="Test Panel" />
      );

      expect(getByText('Test Panel')).toBeTruthy();
      expect(queryByTestId('panel-header-description')).toBeNull();
    });

    it('should render with title and description', () => {
      const { getByText, getByTestId } = render(
        <PanelHeader 
          title="Test Panel" 
          description="This is a test description"
        />
      );

      expect(getByText('Test Panel')).toBeTruthy();
      expect(getByText('This is a test description')).toBeTruthy();
      expect(getByTestId('panel-header-description')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <PanelHeader 
          title="Test Panel"
          testID="custom-panel-header"
        />
      );

      expect(getByTestId('custom-panel-header')).toBeTruthy();
      expect(getByTestId('custom-panel-header-title')).toBeTruthy();
    });

    it('should apply custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByTestId } = render(
        <PanelHeader 
          title="Test Panel"
          style={customStyle}
          testID="styled-header"
        />
      );

      const header = getByTestId('styled-header');
      expect(header.props.style).toEqual(expect.arrayContaining([
        expect.objectContaining(customStyle)
      ]));
    });
  });

  describe('Collapse/Expand Functionality', () => {
    it('should toggle expanded state when pressed', () => {
      const onToggle = jest.fn();
      const { getByTestId } = render(
        <PanelHeader 
          title="Test Panel"
          collapsible
          onToggle={onToggle}
          testID="collapsible-header"
        />
      );

      const header = getByTestId('collapsible-header');
      fireEvent.press(header);

      expect(onToggle).toHaveBeenCalledWith(false);
    });

    it('should start in collapsed state when initialExpanded is false', () => {
      const { getByTestId } = render(
        <PanelHeader 
          title="Test Panel"
          collapsible
          initialExpanded={false}
          testID="collapsed-header"
        />
      );

      const icon = getByTestId('collapsed-header-icon');
      expect(icon.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ transform: expect.any(Array) })
        ])
      );
    });

    it('should not be interactive when not collapsible', () => {
      const onToggle = jest.fn();
      const { getByTestId } = render(
        <PanelHeader 
          title="Test Panel"
          collapsible={false}
          onToggle={onToggle}
          testID="non-collapsible"
        />
      );

      const header = getByTestId('non-collapsible');
      fireEvent.press(header);

      expect(onToggle).not.toHaveBeenCalled();
    });

    it('should render custom expand/collapse icons', () => {
      const ExpandIcon = () => <Text testID="expand-icon">+</Text>;
      const CollapseIcon = () => <Text testID="collapse-icon">-</Text>;
      
      const { getByTestId, queryByTestId } = render(
        <PanelHeader 
          title="Test Panel"
          collapsible
          expandIcon={<ExpandIcon />}
          collapseIcon={<CollapseIcon />}
          initialExpanded={false}
        />
      );

      // When collapsed (not expanded), should show expand icon
      expect(getByTestId('expand-icon')).toBeTruthy();
      expect(queryByTestId('collapse-icon')).toBeNull();

      // Toggle to expanded state
      fireEvent.press(getByTestId('panel-header'));

      // When expanded, should show collapse icon
      waitFor(() => {
        expect(queryByTestId('expand-icon')).toBeNull();
        expect(getByTestId('collapse-icon')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility role and state', () => {
      const { getByTestId } = render(
        <PanelHeader 
          title="Test Panel"
          collapsible
          testID="accessible-header"
        />
      );

      const header = getByTestId('accessible-header');
      expect(header.props.accessibilityRole).toBe('button');
      expect(header.props.accessibilityState).toEqual({ expanded: true });
    });

    it('should have proper accessibility state when collapsed', () => {
      const { getByTestId } = render(
        <PanelHeader 
          title="Test Panel"
          collapsible
          initialExpanded={false}
          testID="accessible-header-collapsed"
        />
      );

      const header = getByTestId('accessible-header-collapsed');
      expect(header.props.accessibilityState).toEqual({ expanded: false });
    });

    it('should have proper accessibility hint', () => {
      const { getByTestId } = render(
        <PanelHeader 
          title="Test Panel"
          collapsible
          testID="hint-header"
        />
      );

      const header = getByTestId('hint-header');
      expect(header.props.accessibilityHint).toBe('Double tap to collapse panel');
    });

    it('should update accessibility hint based on state', () => {
      const { getByTestId, rerender } = render(
        <PanelHeader 
          title="Test Panel"
          collapsible
          initialExpanded={false}
          testID="hint-header"
        />
      );

      const header = getByTestId('hint-header');
      expect(header.props.accessibilityHint).toBe('Double tap to expand panel');

      fireEvent.press(header);

      rerender(
        <PanelHeader 
          title="Test Panel"
          collapsible
          initialExpanded={true}
          testID="hint-header"
        />
      );

      expect(header.props.accessibilityHint).toBe('Double tap to collapse panel');
    });

    it('should have accessibility label with title', () => {
      const { getByTestId } = render(
        <PanelHeader 
          title="Survey Settings"
          collapsible
          testID="label-header"
        />
      );

      const header = getByTestId('label-header');
      expect(header.props.accessibilityLabel).toBe('Survey Settings panel header');
    });
  });

  describe('Animation', () => {
    it('should animate icon rotation on toggle', async () => {
      const { getByTestId } = render(
        <PanelHeader 
          title="Test Panel"
          collapsible
          testID="animated-header"
        />
      );

      const header = getByTestId('animated-header');
      
      fireEvent.press(header);

      await waitFor(() => {
        expect(mockTiming).toHaveBeenCalledWith(
          expect.any(Animated.Value),
          expect.objectContaining({
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        );
      });
    });

    it('should respect reduceMotion preference', async () => {
      AccessibilityInfo.isReduceMotionEnabled.mockResolvedValueOnce(true);

      const { getByTestId } = render(
        <PanelHeader 
          title="Test Panel"
          collapsible
          testID="reduced-motion-header"
        />
      );

      // Wait for the component to check reduce motion preference
      await waitFor(() => {
        expect(AccessibilityInfo.isReduceMotionEnabled).toHaveBeenCalled();
      });

      const header = getByTestId('reduced-motion-header');
      fireEvent.press(header);

      await waitFor(() => {
        expect(mockTiming).toHaveBeenCalledWith(
          expect.any(Animated.Value),
          expect.objectContaining({
            duration: 0,
          })
        );
      });
    });
  });

  describe('State Management', () => {
    it('should handle controlled state', () => {
      const onToggle = jest.fn();
      const { getByTestId, rerender } = render(
        <PanelHeader 
          title="Test Panel"
          collapsible
          expanded={true}
          onToggle={onToggle}
          testID="controlled-header"
        />
      );

      const header = getByTestId('controlled-header');
      fireEvent.press(header);

      expect(onToggle).toHaveBeenCalledWith(false);

      // State should not change without prop update
      expect(header.props.accessibilityState).toEqual({ expanded: true });

      // Update prop to reflect state change
      rerender(
        <PanelHeader 
          title="Test Panel"
          collapsible
          expanded={false}
          onToggle={onToggle}
          testID="controlled-header"
        />
      );

      expect(header.props.accessibilityState).toEqual({ expanded: false });
    });

    it('should handle uncontrolled state', () => {
      const onToggle = jest.fn();
      const { getByTestId } = render(
        <PanelHeader 
          title="Test Panel"
          collapsible
          onToggle={onToggle}
          testID="uncontrolled-header"
        />
      );

      const header = getByTestId('uncontrolled-header');
      expect(header.props.accessibilityState).toEqual({ expanded: true });

      fireEvent.press(header);

      expect(onToggle).toHaveBeenCalledWith(false);
      // In uncontrolled mode, the state should update immediately
      // But we need to wait for the state to update
      waitFor(() => {
        expect(header.props.accessibilityState).toEqual({ expanded: false });
      });
    });
  });

  describe('Icon Customization', () => {
    it('should use default chevron icon when no custom icons provided', () => {
      const { getByTestId } = render(
        <PanelHeader 
          title="Test Panel"
          collapsible
          testID="default-icon-header"
        />
      );

      const icon = getByTestId('default-icon-header-icon');
      expect(icon).toBeTruthy();
      expect(icon.props.children).toBe('▼');
    });

    it('should render without icon when showIcon is false', () => {
      const { queryByTestId } = render(
        <PanelHeader 
          title="Test Panel"
          collapsible
          showIcon={false}
          testID="no-icon-header"
        />
      );

      const icon = queryByTestId('no-icon-header-icon');
      expect(icon).toBeNull();
    });
  });
});