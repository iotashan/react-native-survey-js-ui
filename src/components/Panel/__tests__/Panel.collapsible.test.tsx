import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Panel } from '../Panel';
import { PanelModel, Question } from 'survey-core';

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

describe('Panel Component - Collapsible Functionality', () => {
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

  describe('Collapsible Behavior', () => {
    it('should render as collapsible when collapsible prop is true', () => {
      const panel = createMockPanel({
        questions: [createMockQuestion('q1', 'Question 1')],
      });
      
      render(<Panel panel={panel} collapsible={true} />);
      
      const header = screen.getByTestId('panel-header-testPanel');
      expect(header).toBeTruthy();
      expect(header.props.accessibilityRole).toBe('button');
    });

    it('should show content by default when collapsible', () => {
      const panel = createMockPanel({
        questions: [createMockQuestion('q1', 'Question 1')],
      });
      
      render(<Panel panel={panel} collapsible={true} />);
      
      expect(screen.getByTestId('question-q1')).toBeTruthy();
    });

    it('should hide content when collapsed', () => {
      const panel = createMockPanel({
        questions: [createMockQuestion('q1', 'Question 1')],
      });
      
      render(<Panel panel={panel} collapsible={true} />);
      
      const header = screen.getByTestId('panel-header-testPanel');
      fireEvent.press(header);
      
      expect(screen.queryByTestId('question-q1')).toBeNull();
    });

    it('should toggle content visibility on header press', () => {
      const panel = createMockPanel({
        questions: [createMockQuestion('q1', 'Question 1')],
      });
      
      render(<Panel panel={panel} collapsible={true} />);
      
      const header = screen.getByTestId('panel-header-testPanel');
      
      // Initially expanded
      expect(screen.getByTestId('question-q1')).toBeTruthy();
      
      // Collapse
      fireEvent.press(header);
      expect(screen.queryByTestId('question-q1')).toBeNull();
      
      // Expand again
      fireEvent.press(header);
      expect(screen.getByTestId('question-q1')).toBeTruthy();
    });

    it('should respect initialExpanded prop', () => {
      const panel = createMockPanel({
        questions: [createMockQuestion('q1', 'Question 1')],
      });
      
      render(<Panel panel={panel} collapsible={true} initialExpanded={false} />);
      
      expect(screen.queryByTestId('question-q1')).toBeNull();
    });

    it('should not be collapsible when collapsible prop is false', () => {
      const panel = createMockPanel({
        questions: [createMockQuestion('q1', 'Question 1')],
      });
      
      render(<Panel panel={panel} collapsible={false} />);
      
      // Should use PanelHeader but not be interactive
      const header = screen.getByTestId('panel-header-testPanel');
      expect(header.props.accessibilityRole).toBeUndefined();
      
      // Content should always be visible
      expect(screen.getByTestId('question-q1')).toBeTruthy();
    });
  });

  describe('Nested Panels with Collapsible', () => {
    it('should propagate collapsible prop to nested panels', () => {
      const nestedPanel = createMockPanel({
        name: 'nested',
        title: 'Nested Panel',
        questions: [createMockQuestion('nested-q1')],
      });
      
      const panel = createMockPanel({
        panels: [nestedPanel],
      });
      
      render(<Panel panel={panel} collapsible={true} />);
      
      const nestedHeader = screen.getByTestId('panel-header-nested');
      expect(nestedHeader.props.accessibilityRole).toBe('button');
    });

    it('should maintain independent collapse state for nested panels', () => {
      const nestedPanel1 = createMockPanel({
        name: 'nested1',
        title: 'Nested Panel 1',
        questions: [createMockQuestion('q1')],
      });
      
      const nestedPanel2 = createMockPanel({
        name: 'nested2',
        title: 'Nested Panel 2',
        questions: [createMockQuestion('q2')],
      });
      
      const panel = createMockPanel({
        panels: [nestedPanel1, nestedPanel2],
      });
      
      render(<Panel panel={panel} collapsible={true} />);
      
      // Collapse first nested panel
      fireEvent.press(screen.getByTestId('panel-header-nested1'));
      
      expect(screen.queryByTestId('question-q1')).toBeNull();
      expect(screen.getByTestId('question-q2')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle panel with no content gracefully', () => {
      const panel = createMockPanel({
        questions: [],
        panels: [],
      });
      
      render(<Panel panel={panel} collapsible={true} />);
      
      const header = screen.getByTestId('panel-header-testPanel');
      expect(header).toBeTruthy();
      
      // Toggling should work even with no content
      fireEvent.press(header);
      expect(header.props.accessibilityState).toEqual({ expanded: false });
    });

    it('should show description in header when title exists', () => {
      const panel = createMockPanel({
        title: 'Panel Title',
        description: 'Panel Description',
      });
      
      render(<Panel panel={panel} />);
      
      expect(screen.getByText('Panel Title')).toBeTruthy();
      expect(screen.getByText('Panel Description')).toBeTruthy();
      expect(screen.queryByTestId('panel-description-testPanel')).toBeNull();
    });

    it('should show standalone description when no title', () => {
      const panel = createMockPanel({
        title: undefined,
        description: 'Standalone Description',
      });
      
      render(<Panel panel={panel} />);
      
      expect(screen.getByTestId('panel-description-testPanel')).toBeTruthy();
      expect(screen.getByText('Standalone Description')).toBeTruthy();
    });
  });
});