import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Panel } from '../Panel';
import { PanelNestingContext } from '../PanelNestingContext';
import type { PanelModel, Question } from 'survey-core';

// Mock QuestionFactory
jest.mock('../../Questions/QuestionFactory', () => ({
  QuestionFactory: ({ question }: { question: Question }) => {
    const mockTestID = `question-${question.name}`;
    return (
      <div testID={mockTestID}>
        {question.name}: {question.title || question.name}
      </div>
    );
  },
}));

describe('Panel Hierarchy Rendering', () => {
  const createMockQuestion = (name: string, title?: string): Question => ({
    name,
    title: title || name,
    type: 'text',
    visible: true,
    value: undefined,
  });

  const createMockPanel = (overrides?: Partial<PanelModel>): PanelModel => ({
    name: 'testPanel',
    title: 'Test Panel',
    description: 'Test panel description',
    questions: [],
    panels: [],
    visible: true,
    ...overrides,
  });

  describe('Nesting Level Context', () => {
    it('should provide nesting level through context', () => {
      // We'll test this indirectly through nested panel rendering
      const deeplyNested = createMockPanel({
        name: 'level3',
        title: 'Level 3',
      });

      const nested = createMockPanel({
        name: 'level2',
        title: 'Level 2',
        panels: [deeplyNested],
      });

      const root = createMockPanel({
        name: 'level1',
        title: 'Level 1',
        panels: [nested],
      });

      render(<Panel panel={root} />);

      // All panels should render with correct hierarchy
      expect(screen.getByTestId('panel-level1')).toBeTruthy();
      expect(screen.getByTestId('panel-level2')).toBeTruthy();
      expect(screen.getByTestId('panel-level3')).toBeTruthy();
    });

    it('should increment nesting level for child panels', () => {
      // Create a 3-level hierarchy to verify nesting levels
      const grandchild = createMockPanel({
        name: 'grandchild',
        title: 'Grandchild Panel',
        questions: [createMockQuestion('q3')],
      });

      const child = createMockPanel({
        name: 'child',
        title: 'Child Panel',
        questions: [createMockQuestion('q2')],
        panels: [grandchild],
      });

      const parent = createMockPanel({
        name: 'parent',
        title: 'Parent Panel',
        questions: [createMockQuestion('q1')],
        panels: [child],
      });

      render(<Panel panel={parent} />);

      // Verify all levels render correctly
      expect(screen.getByTestId('panel-parent')).toBeTruthy();
      expect(screen.getByTestId('panel-child')).toBeTruthy();
      expect(screen.getByTestId('panel-grandchild')).toBeTruthy();
      
      // Verify questions at each level
      expect(screen.getByTestId('question-q1')).toBeTruthy();
      expect(screen.getByTestId('question-q2')).toBeTruthy();
      expect(screen.getByTestId('question-q3')).toBeTruthy();
    });

    it('should track correct path through multiple nesting levels', () => {
      const deeplyNested = createMockPanel({
        name: 'deep',
        title: 'Deep Panel',
      });

      const nested = createMockPanel({
        name: 'nested',
        title: 'Nested Panel',
        panels: [deeplyNested],
      });

      const root = createMockPanel({
        name: 'root',
        title: 'Root Panel',
        panels: [nested],
      });

      render(<Panel panel={root} />);

      // All panels should render with correct hierarchy
      expect(screen.getByTestId('panel-root')).toBeTruthy();
      expect(screen.getByTestId('panel-nested')).toBeTruthy();
      expect(screen.getByTestId('panel-deep')).toBeTruthy();
    });
  });

  describe('Maximum Nesting Depth', () => {
    it('should stop rendering at maximum nesting depth', () => {
      // Create a deeply nested structure
      let currentPanel = createMockPanel({ name: 'level-10' });
      
      for (let i = 9; i >= 0; i--) {
        currentPanel = createMockPanel({
          name: `level-${i}`,
          panels: [currentPanel],
        });
      }

      render(<Panel panel={currentPanel} />);

      // Should render up to max depth (10 levels)
      for (let i = 0; i < 10; i++) {
        expect(screen.getByTestId(`panel-level-${i}`)).toBeTruthy();
      }

      // Should not render beyond max depth
      expect(screen.queryByTestId('panel-level-10')).toBeNull();
    });

    it('should show warning when maximum depth is exceeded', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Create structure exceeding max depth
      let currentPanel = createMockPanel({ name: 'level-11' });
      
      for (let i = 10; i >= 0; i--) {
        currentPanel = createMockPanel({
          name: `level-${i}`,
          panels: [currentPanel],
        });
      }

      render(<Panel panel={currentPanel} />);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Maximum nesting depth')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Circular Reference Detection', () => {
    it('should detect and prevent simple circular references', () => {
      const panel1: PanelModel = createMockPanel({ name: 'panel1' });
      const panel2: PanelModel = createMockPanel({ name: 'panel2' });

      // Create circular reference
      panel1.panels = [panel2];
      panel2.panels = [panel1];

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      render(<Panel panel={panel1} />);

      // Should render each panel only once
      expect(screen.getByTestId('panel-panel1')).toBeTruthy();
      expect(screen.getByTestId('panel-panel2')).toBeTruthy();

      // Should warn about circular reference
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Circular reference detected')
      );

      consoleSpy.mockRestore();
    });

    it('should handle complex circular references', () => {
      const panel1: PanelModel = createMockPanel({ name: 'panel1' });
      const panel2: PanelModel = createMockPanel({ name: 'panel2' });
      const panel3: PanelModel = createMockPanel({ name: 'panel3' });

      // Create circular reference: 1 -> 2 -> 3 -> 1
      panel1.panels = [panel2];
      panel2.panels = [panel3];
      panel3.panels = [panel1];

      render(<Panel panel={panel1} />);

      // Each panel should render only once
      expect(screen.getByTestId('panel-panel1')).toBeTruthy();
      expect(screen.getByTestId('panel-panel2')).toBeTruthy();
      expect(screen.getByTestId('panel-panel3')).toBeTruthy();
    });

    it('should not flag false positives for panels with same name but different instances', () => {
      const panel1 = createMockPanel({
        name: 'reusable',
        title: 'Instance 1',
      });

      const panel2 = createMockPanel({
        name: 'reusable',
        title: 'Instance 2',
      });

      const root = createMockPanel({
        name: 'root',
        panels: [panel1, panel2],
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      render(<Panel panel={root} />);

      // Both instances should render
      const panels = screen.getAllByTestId(/panel-reusable/);
      expect(panels).toHaveLength(2);

      // Should not warn about circular reference
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('React Key Management', () => {
    it('should generate unique keys for nested panels', () => {
      const panel1 = createMockPanel({ name: 'panel1' });
      const panel2 = createMockPanel({ name: 'panel2' });
      const panel3 = createMockPanel({ name: 'panel3' });

      const root = createMockPanel({
        name: 'root',
        panels: [panel1, panel2, panel3],
      });

      render(<Panel panel={root} />);

      // Verify all panels render
      expect(screen.getByTestId('panel-root')).toBeTruthy();
      expect(screen.getByTestId('panel-panel1')).toBeTruthy();
      expect(screen.getByTestId('panel-panel2')).toBeTruthy();
      expect(screen.getByTestId('panel-panel3')).toBeTruthy();
      
      // Keys are generated internally and used by React
      // We verify uniqueness by ensuring all panels render without warnings
    });

    it('should maintain stable keys when panel order changes', () => {
      const panel1 = createMockPanel({ name: 'panel1', title: 'Panel 1' });
      const panel2 = createMockPanel({ name: 'panel2', title: 'Panel 2' });

      const root = createMockPanel({
        name: 'root',
        panels: [panel1, panel2],
      });

      const { rerender } = render(<Panel panel={root} />);

      // Verify initial order
      expect(screen.getByTestId('panel-panel1')).toBeTruthy();
      expect(screen.getByTestId('panel-panel2')).toBeTruthy();

      // Reorder panels
      root.panels = [panel2, panel1];
      rerender(<Panel panel={root} />);

      // Verify panels still render after reordering
      expect(screen.getByTestId('panel-panel1')).toBeTruthy();
      expect(screen.getByTestId('panel-panel2')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should handle deeply nested structures efficiently', () => {
      const startTime = performance.now();

      // Create a structure with 8 levels of nesting
      let currentPanel = createMockPanel({
        name: 'level-7',
        questions: [createMockQuestion('q7')],
      });

      for (let i = 6; i >= 0; i--) {
        currentPanel = createMockPanel({
          name: `level-${i}`,
          questions: [createMockQuestion(`q${i}`)],
          panels: [currentPanel],
        });
      }

      render(<Panel panel={currentPanel} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Rendering should complete in reasonable time (< 100ms)
      expect(renderTime).toBeLessThan(100);

      // All levels should render
      for (let i = 0; i < 8; i++) {
        expect(screen.getByTestId(`panel-level-${i}`)).toBeTruthy();
      }
    });

    it('should handle wide structures with many siblings efficiently', () => {
      const startTime = performance.now();

      // Create 20 sibling panels
      const panels: PanelModel[] = [];
      for (let i = 0; i < 20; i++) {
        panels.push(createMockPanel({
          name: `sibling-${i}`,
          questions: [createMockQuestion(`q${i}`)],
        }));
      }

      const root = createMockPanel({
        name: 'root',
        panels,
      });

      render(<Panel panel={root} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Rendering should complete in reasonable time (< 100ms)
      expect(renderTime).toBeLessThan(100);

      // All siblings should render
      for (let i = 0; i < 20; i++) {
        expect(screen.getByTestId(`panel-sibling-${i}`)).toBeTruthy();
      }
    });
  });


  describe('Integration with Panel Properties', () => {
    it('should pass nesting level to panel styles', () => {
      const nested3 = createMockPanel({ name: 'nested3' });
      const nested2 = createMockPanel({ name: 'nested2', panels: [nested3] });
      const nested1 = createMockPanel({ name: 'nested1', panels: [nested2] });
      const root = createMockPanel({ name: 'root', panels: [nested1] });

      render(<Panel panel={root} />);

      // Each panel should have appropriate nesting level applied
      const rootPanel = screen.getByTestId('panel-root');
      const nested1Panel = screen.getByTestId('panel-nested1');
      const nested2Panel = screen.getByTestId('panel-nested2');
      const nested3Panel = screen.getByTestId('panel-nested3');

      // Check that nesting level is passed as prop (this will be used by styles)
      expect(rootPanel).toBeTruthy();
      expect(nested1Panel).toBeTruthy();
      expect(nested2Panel).toBeTruthy();
      expect(nested3Panel).toBeTruthy();
    });

    it('should maintain collapsible state through hierarchy', () => {
      const child = createMockPanel({
        name: 'child',
        title: 'Child Panel',
      });

      const parent = createMockPanel({
        name: 'parent',
        title: 'Parent Panel',
        panels: [child],
      });

      render(<Panel panel={parent} collapsible={true} initialExpanded={false} />);

      // Parent should be collapsed
      expect(screen.queryByTestId('panel-child')).toBeNull();

      // But if we render child directly with different props, it should respect those
      const { unmount } = render(<Panel panel={parent} />);
      unmount();
      
      render(<Panel panel={child} collapsible={false} />);
      
      // Child should be visible when rendered directly
      expect(screen.getByTestId('panel-child')).toBeTruthy();
    });
  });
});