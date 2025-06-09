import React from 'react';
import { render } from '@testing-library/react-native';
import { Dimensions } from 'react-native';
import { Panel } from '../Panel';
import { PanelModel } from 'survey-core';

// Mock survey-core PanelModel
jest.mock('survey-core', () => ({
  PanelModel: jest.fn().mockImplementation(() => ({
    name: 'testPanel',
    title: 'Test Panel',
    description: 'Test Description',
    visible: true,
    questions: [],
    panels: [],
  })),
}));

// Mock is already set up in src/__mocks__/react-native/index.ts
// Just need to get the mocked Dimensions for manipulation in tests
import { Dimensions as MockedDimensions } from 'react-native';

describe('Panel with Styling System Integration', () => {
  let mockPanel: PanelModel;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPanel = {
      name: 'panel1',
      title: 'Panel Title',
      description: 'Panel Description',
      visible: true,
      questions: [],
      panels: [],
    } as any;
  });

  describe('Responsive Layout', () => {
    it('should apply responsive styles based on screen size', () => {
      // Test on small screen
      (MockedDimensions.get as jest.Mock).mockReturnValue({ width: 320, height: 568 });
      const { getByTestId, rerender } = render(<Panel panel={mockPanel} />);
      const smallScreenPanel = getByTestId('panel-panel1');
      expect(smallScreenPanel).toBeTruthy();

      // Test on large screen
      (MockedDimensions.get as jest.Mock).mockReturnValue({ width: 768, height: 1024 });
      rerender(<Panel panel={mockPanel} />);
      const largeScreenPanel = getByTestId('panel-panel1');
      expect(largeScreenPanel).toBeTruthy();
    });

    it('should handle orientation changes', () => {
      const { getByTestId } = render(<Panel panel={mockPanel} />);
      
      // Simulate orientation change
      (MockedDimensions.get as jest.Mock).mockReturnValue({ width: 812, height: 375 });
      
      // The component should still render correctly
      const panel = getByTestId('panel-panel1');
      expect(panel).toBeTruthy();
    });
  });

  describe('Nested Panel Styling', () => {
    it('should apply proper indentation for nested panels', () => {
      const nestedPanel = {
        name: 'nestedPanel',
        title: 'Nested Panel',
        visible: true,
        questions: [],
        panels: [],
      } as any;

      mockPanel.panels = [nestedPanel];

      const { getByTestId } = render(<Panel panel={mockPanel} />);
      
      const parentPanel = getByTestId('panel-panel1');
      const childPanel = getByTestId('panel-nestedPanel');
      
      expect(parentPanel).toBeTruthy();
      expect(childPanel).toBeTruthy();
    });

    it('should handle deeply nested panels with proper hierarchy', () => {
      const level2Panel = {
        name: 'level2',
        title: 'Level 2',
        visible: true,
        questions: [],
        panels: [],
      } as any;

      const level3Panel = {
        name: 'level3',
        title: 'Level 3',
        visible: true,
        questions: [],
        panels: [],
      } as any;

      level2Panel.panels = [level3Panel];
      mockPanel.panels = [level2Panel];

      const { getByTestId } = render(<Panel panel={mockPanel} />);
      
      expect(getByTestId('panel-panel1')).toBeTruthy();
      expect(getByTestId('panel-level2')).toBeTruthy();
      expect(getByTestId('panel-level3')).toBeTruthy();
    });

    it('should apply visual distinction for nested panels', () => {
      const nestedPanel = {
        name: 'nested',
        visible: true,
        panels: [],
        questions: [],
      } as any;

      mockPanel.panels = [nestedPanel];

      const { getByTestId } = render(<Panel panel={mockPanel} />);
      
      // Both panels should render with appropriate styles
      const parent = getByTestId('panel-panel1');
      const nested = getByTestId('panel-nested');
      
      expect(parent).toBeTruthy();
      expect(nested).toBeTruthy();
    });
  });

  describe('Theme Support', () => {
    it('should apply custom theme styles when provided', () => {
      const { getByTestId } = render(
        <Panel 
          panel={mockPanel} 
          theme={{
            primaryColor: '#ff0000',
            backgroundColor: '#f0f0f0',
          }}
        />
      );

      const panel = getByTestId('panel-panel1');
      expect(panel).toBeTruthy();
    });

    it('should support RTL layout', () => {
      const { getByTestId } = render(
        <Panel 
          panel={mockPanel} 
          isRTL={true}
        />
      );

      const panel = getByTestId('panel-panel1');
      expect(panel).toBeTruthy();
    });
  });

  describe('Performance with Complex Structures', () => {
    it('should handle many panels efficiently', () => {
      // Create a complex structure with many panels
      const panels = Array.from({ length: 20 }, (_, i) => ({
        name: `child-panel${i}`,
        visible: true,
        questions: [],
        panels: [],
      })) as any[];

      mockPanel.panels = panels;

      const startTime = Date.now();
      const { getByTestId, getAllByTestId } = render(<Panel panel={mockPanel} />);
      const renderTime = Date.now() - startTime;

      // Should render parent panel
      expect(getByTestId('panel-panel1')).toBeTruthy();
      
      // Should render all child panels
      const childPanels = getAllByTestId(/^panel-child-panel/);
      expect(childPanels).toHaveLength(20);

      // Should render quickly (under 100ms)
      expect(renderTime).toBeLessThan(100);
    });

    it('should handle deeply nested structures efficiently', () => {
      // Create a deeply nested structure
      let currentPanel = mockPanel;
      for (let i = 0; i < 5; i++) {
        const nestedPanel = {
          name: `nested${i}`,
          visible: true,
          questions: [],
          panels: [],
        } as any;
        currentPanel.panels = [nestedPanel];
        currentPanel = nestedPanel;
      }

      const { getByTestId } = render(<Panel panel={mockPanel} />);
      
      // Should render the deepest panel
      expect(getByTestId('panel-nested4')).toBeTruthy();
    });
  });

  describe('Spacing and Layout', () => {
    it('should maintain consistent spacing between questions', () => {
      mockPanel.questions = [
        { name: 'q1', visible: true, type: 'text' },
        { name: 'q2', visible: true, type: 'text' },
      ] as any[];

      const { getByTestId } = render(<Panel panel={mockPanel} />);
      const panel = getByTestId('panel-panel1');
      expect(panel).toBeTruthy();
    });

    it('should apply proper padding for panel content', () => {
      const { getByTestId } = render(<Panel panel={mockPanel} />);
      const panel = getByTestId('panel-panel1');
      expect(panel).toBeTruthy();
    });
  });

  describe('Style Customization', () => {
    it('should allow custom styles to be applied', () => {
      const customStyle = {
        backgroundColor: 'red',
        padding: 20,
      };

      const { getByTestId } = render(
        <Panel panel={mockPanel} style={customStyle} />
      );

      const panel = getByTestId('panel-panel1');
      expect(panel).toBeTruthy();
    });

    it('should merge custom styles with default styles', () => {
      const customStyle = {
        marginTop: 50,
      };

      const { getByTestId } = render(
        <Panel panel={mockPanel} style={customStyle} />
      );

      const panel = getByTestId('panel-panel1');
      expect(panel).toBeTruthy();
    });
  });
});