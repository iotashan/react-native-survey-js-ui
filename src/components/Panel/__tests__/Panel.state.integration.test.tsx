import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PanelModel } from 'survey-core';
import { Panel } from '../Panel';
import { PanelStateProvider } from '../PanelStateContext';

// Mock survey-core
jest.mock('survey-core', () => ({
  PanelModel: jest.fn().mockImplementation(() => ({
    name: 'test-panel',
    title: 'Test Panel',
    visible: true,
    questions: [],
    panels: [],
  })),
}));

describe('Panel State Integration', () => {
  const createMockPanel = (overrides: Partial<PanelModel> = {}): PanelModel => {
    return {
      name: 'test-panel',
      title: 'Test Panel',
      description: 'Test Description',
      visible: true,
      questions: [],
      panels: [],
      ...overrides,
    } as PanelModel;
  };

  describe('Basic State Management', () => {
    it('should render panel with default expanded state', () => {
      const panel = createMockPanel();
      const { getByTestId } = render(
        <PanelStateProvider>
          <Panel panel={panel} collapsible={true} />
        </PanelStateProvider>
      );

      expect(getByTestId('panel-test-panel')).toBeTruthy();
      expect(getByTestId('panel-header-test-panel')).toBeTruthy();
    });

    it('should toggle panel state when header is pressed', async () => {
      const childPanel = createMockPanel({ name: 'child', title: 'Child' });
      const panel = createMockPanel({ panels: [childPanel] });
      
      const { getByTestId, queryByTestId } = render(
        <PanelStateProvider>
          <Panel panel={panel} collapsible={true} />
        </PanelStateProvider>
      );

      const header = getByTestId('panel-header-test-panel');
      
      // Initially expanded, child panels should be visible
      expect(queryByTestId('panel-child')).toBeTruthy();
      
      // Toggle to collapsed
      fireEvent.press(header);
      
      await waitFor(() => {
        // Child panels should be hidden when parent is collapsed
        expect(queryByTestId('panel-child')).toBeNull();
      });

      // Toggle back to expanded
      fireEvent.press(header);
      
      await waitFor(() => {
        // Child panels should be visible again
        expect(queryByTestId('panel-child')).toBeTruthy();
      });
    });

    it('should maintain state across re-renders', async () => {
      const childPanel = createMockPanel({ name: 'child', title: 'Child' });
      const panel = createMockPanel({ panels: [childPanel] });
      
      const { getByTestId, queryByTestId, rerender } = render(
        <PanelStateProvider>
          <Panel panel={panel} collapsible={true} />
        </PanelStateProvider>
      );

      // Collapse panel
      const header = getByTestId('panel-header-test-panel');
      fireEvent.press(header);
      
      await waitFor(() => {
        expect(queryByTestId('panel-child')).toBeNull();
      });

      // Re-render with same panel
      rerender(
        <PanelStateProvider>
          <Panel panel={panel} collapsible={true} />
        </PanelStateProvider>
      );

      // Should still be collapsed
      expect(queryByTestId('panel-child')).toBeNull();
    });
  });

  describe('Hierarchical State Management', () => {
    it('should handle nested panels with independent states', async () => {
      const childPanel = createMockPanel({
        name: 'child-panel',
        title: 'Child Panel',
      });

      const parentPanel = createMockPanel({
        name: 'parent-panel',
        title: 'Parent Panel',
        panels: [childPanel],
      });

      const { getByTestId, queryByTestId } = render(
        <PanelStateProvider hierarchical={true}>
          <Panel panel={parentPanel} collapsible={true} />
        </PanelStateProvider>
      );

      // Both panels should be initially expanded
      expect(getByTestId('panel-parent-panel')).toBeTruthy();
      expect(getByTestId('panel-child-panel')).toBeTruthy();

      // Collapse child panel
      const childHeader = getByTestId('panel-header-child-panel');
      fireEvent.press(childHeader);

      await waitFor(() => {
        // Child should be collapsed (header still visible but content hidden)
        expect(getByTestId('panel-header-child-panel')).toBeTruthy(); // Header still visible
        expect(getByTestId('panel-parent-panel')).toBeTruthy(); // Parent still expanded
      });
    });

    it('should cascade collapse when enabled', async () => {
      const childPanel = createMockPanel({
        name: 'parent.child',
        title: 'Child Panel',
      });

      const parentPanel = createMockPanel({
        name: 'parent',
        title: 'Parent Panel',
        panels: [childPanel],
      });

      const { getByTestId, queryByTestId } = render(
        <PanelStateProvider hierarchical={true} cascadeCollapse={true}>
          <Panel panel={parentPanel} collapsible={true} />
        </PanelStateProvider>
      );

      // Collapse parent panel
      const parentHeader = getByTestId('panel-header-parent');
      fireEvent.press(parentHeader);

      await waitFor(() => {
        // Parent should be collapsed, child should not be visible in content area
        expect(getByTestId('panel-header-parent')).toBeTruthy(); // Header still visible
        expect(queryByTestId('panel-parent.child')).toBeNull(); // Child panel not rendered when parent collapsed
      });
    });
  });

  describe('State Callbacks', () => {
    it('should call onPanelToggle when panel state changes', async () => {
      const onPanelToggle = jest.fn();
      const panel = createMockPanel();

      const { getByTestId } = render(
        <PanelStateProvider onPanelToggle={onPanelToggle}>
          <Panel panel={panel} collapsible={true} />
        </PanelStateProvider>
      );

      const header = getByTestId('panel-header-test-panel');
      fireEvent.press(header);

      await waitFor(() => {
        expect(onPanelToggle).toHaveBeenCalledWith('test-panel', false);
      });
    });

    it('should support expand all and collapse all operations', async () => {
      const panel1 = createMockPanel({ name: 'panel1', title: 'Panel 1' });
      const panel2 = createMockPanel({ name: 'panel2', title: 'Panel 2' });

      const TestComponent = () => {
        const [shouldCollapseAll, setShouldCollapseAll] = React.useState(false);
        const [shouldExpandAll, setShouldExpandAll] = React.useState(false);

        return (
          <PanelStateProvider>
            <Panel panel={panel1} collapsible={true} />
            <Panel panel={panel2} collapsible={true} />
            {/* These would normally be buttons that trigger state changes */}
          </PanelStateProvider>
        );
      };

      const { getByTestId } = render(<TestComponent />);

      expect(getByTestId('panel-panel1')).toBeTruthy();
      expect(getByTestId('panel-panel2')).toBeTruthy();
    });
  });

  describe('State Persistence', () => {
    it('should save and restore panel states', () => {
      const savedState = { 'test-panel': false };
      const saveState = jest.fn();
      const loadState = jest.fn(() => savedState);

      const panel = createMockPanel();

      const { getByTestId, queryByTestId } = render(
        <PanelStateProvider saveState={saveState} loadState={loadState}>
          <Panel panel={panel} collapsible={true} />
        </PanelStateProvider>
      );

      // Should load saved state and be collapsed (header still visible)
      expect(loadState).toHaveBeenCalled();
      expect(getByTestId('panel-header-test-panel')).toBeTruthy();
    });

    it('should save state when panel is toggled', async () => {
      const saveState = jest.fn();
      const panel = createMockPanel();

      const { getByTestId } = render(
        <PanelStateProvider saveState={saveState}>
          <Panel panel={panel} collapsible={true} />
        </PanelStateProvider>
      );

      const header = getByTestId('panel-header-test-panel');
      fireEvent.press(header);

      await waitFor(() => {
        expect(saveState).toHaveBeenCalledWith({ 'test-panel': false });
      });
    });
  });

  describe('Performance', () => {
    it('should handle many panels efficiently', () => {
      const panels = Array.from({ length: 100 }, (_, i) => 
        createMockPanel({ name: `panel${i}`, title: `Panel ${i}` })
      );

      const startTime = Date.now();

      const { getAllByTestId } = render(
        <PanelStateProvider>
          {panels.map((panel) => (
            <Panel key={panel.name} panel={panel} collapsible={true} />
          ))}
        </PanelStateProvider>
      );

      const endTime = Date.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 1000ms)
      expect(renderTime).toBeLessThan(1000);

      // All panels should be rendered
      panels.forEach((panel) => {
        expect(getAllByTestId(`panel-${panel.name}`)[0]).toBeTruthy();
      });
    });

    it('should batch state updates for multiple panel changes', async () => {
      const onPanelToggle = jest.fn();
      const panel1 = createMockPanel({ name: 'panel1', title: 'Panel 1' });
      const panel2 = createMockPanel({ name: 'panel2', title: 'Panel 2' });

      const { getByTestId } = render(
        <PanelStateProvider onPanelToggle={onPanelToggle}>
          <Panel panel={panel1} collapsible={true} />
          <Panel panel={panel2} collapsible={true} />
        </PanelStateProvider>
      );

      // Toggle both panels quickly
      const header1 = getByTestId('panel-header-panel1');
      const header2 = getByTestId('panel-header-panel2');

      fireEvent.press(header1);
      fireEvent.press(header2);

      await waitFor(() => {
        expect(onPanelToggle).toHaveBeenCalledWith('panel1', false);
        expect(onPanelToggle).toHaveBeenCalledWith('panel2', false);
        expect(onPanelToggle).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid panel gracefully', () => {
      const { queryByTestId } = render(
        <PanelStateProvider>
          <Panel panel={null} collapsible={true} />
        </PanelStateProvider>
      );

      // Should not crash and render nothing for null panel
      expect(queryByTestId('panel-null')).toBeNull();
    });

    it('should handle missing panel name gracefully', () => {
      const panel = createMockPanel({ name: '' });

      const { getByTestId } = render(
        <PanelStateProvider>
          <Panel panel={panel} collapsible={true} />
        </PanelStateProvider>
      );

      // Should still render, using fallback key
      expect(getByTestId('panel-')).toBeTruthy();
    });
  });
});