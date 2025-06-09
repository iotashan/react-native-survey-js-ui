import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Panel } from './Panel';
import { PanelModel, Question } from 'survey-core';

// Mock QuestionFactory
jest.mock('../Questions/QuestionFactory', () => ({
  QuestionFactory: ({ question }: { question: Question }) => {
    const mockTestID = `question-${question.name}`;
    return (
      <div testID={mockTestID}>
        {question.name}: {question.title || question.name}
      </div>
    );
  },
}));

describe('Panel Component', () => {
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

  describe('Basic Rendering', () => {
    it('should render nothing when panel is null', () => {
      const { toJSON } = render(<Panel panel={null} />);
      expect(toJSON()).toBeNull();
    });

    it('should render nothing when panel is undefined', () => {
      const { toJSON } = render(<Panel panel={undefined} />);
      expect(toJSON()).toBeNull();
    });

    it('should render nothing when panel is not visible', () => {
      const panel = createMockPanel({ visible: false });
      const { toJSON } = render(<Panel panel={panel} />);
      expect(toJSON()).toBeNull();
    });

    it('should render panel container when visible', () => {
      const panel = createMockPanel();
      render(<Panel panel={panel} />);
      
      const panelContainer = screen.getByTestId('panel-testPanel');
      expect(panelContainer).toBeTruthy();
    });

    it('should render panel title when provided', () => {
      const panel = createMockPanel({ title: 'My Panel Title' });
      render(<Panel panel={panel} />);
      
      const title = screen.getByText('My Panel Title');
      expect(title).toBeTruthy();
    });

    it('should render panel description when provided', () => {
      const panel = createMockPanel({ description: 'My panel description' });
      render(<Panel panel={panel} />);
      
      const description = screen.getByText('My panel description');
      expect(description).toBeTruthy();
    });

    it('should not render title section when title is not provided', () => {
      const panel = createMockPanel({ title: undefined });
      render(<Panel panel={panel} />);
      
      const titleSection = screen.queryByTestId('panel-title-testPanel');
      expect(titleSection).toBeNull();
    });

    it('should not render description when not provided', () => {
      const panel = createMockPanel({ description: undefined });
      render(<Panel panel={panel} />);
      
      const description = screen.queryByTestId('panel-description-testPanel');
      expect(description).toBeNull();
    });
  });

  describe('Question Rendering', () => {
    it('should render questions from panel.questions array', () => {
      const questions = [
        createMockQuestion('q1', 'Question 1'),
        createMockQuestion('q2', 'Question 2'),
        createMockQuestion('q3', 'Question 3'),
      ];
      const panel = createMockPanel({ questions });
      render(<Panel panel={panel} />);

      expect(screen.getByTestId('question-q1')).toBeTruthy();
      expect(screen.getByTestId('question-q2')).toBeTruthy();
      expect(screen.getByTestId('question-q3')).toBeTruthy();
    });

    it('should filter out invisible questions', () => {
      const questions = [
        createMockQuestion('q1', 'Question 1'),
        { ...createMockQuestion('q2', 'Question 2'), visible: false },
        createMockQuestion('q3', 'Question 3'),
      ];
      const panel = createMockPanel({ questions });
      render(<Panel panel={panel} />);

      expect(screen.getByTestId('question-q1')).toBeTruthy();
      expect(screen.queryByTestId('question-q2')).toBeNull();
      expect(screen.getByTestId('question-q3')).toBeTruthy();
    });

    it('should handle empty questions array', () => {
      const panel = createMockPanel({ questions: [] });
      const { toJSON } = render(<Panel panel={panel} />);
      
      // Panel should still render but without questions
      const panelContainer = screen.getByTestId('panel-testPanel');
      expect(panelContainer).toBeTruthy();
      expect(panelContainer.children.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Nested Panel Rendering', () => {
    it('should render nested panels from panel.panels array', () => {
      const nestedPanel1 = createMockPanel({
        name: 'nested1',
        title: 'Nested Panel 1',
      });
      const nestedPanel2 = createMockPanel({
        name: 'nested2',
        title: 'Nested Panel 2',
      });
      const panel = createMockPanel({
        panels: [nestedPanel1, nestedPanel2],
      });

      render(<Panel panel={panel} />);

      expect(screen.getByTestId('panel-nested1')).toBeTruthy();
      expect(screen.getByTestId('panel-nested2')).toBeTruthy();
      expect(screen.getByText('Nested Panel 1')).toBeTruthy();
      expect(screen.getByText('Nested Panel 2')).toBeTruthy();
    });

    it('should filter out invisible nested panels', () => {
      const nestedPanel1 = createMockPanel({
        name: 'nested1',
        title: 'Nested Panel 1',
      });
      const nestedPanel2 = createMockPanel({
        name: 'nested2',
        title: 'Nested Panel 2',
        visible: false,
      });
      const panel = createMockPanel({
        panels: [nestedPanel1, nestedPanel2],
      });

      render(<Panel panel={panel} />);

      expect(screen.getByTestId('panel-nested1')).toBeTruthy();
      expect(screen.queryByTestId('panel-nested2')).toBeNull();
    });

    it('should render deeply nested panels', () => {
      const deeplyNested = createMockPanel({
        name: 'deeply-nested',
        title: 'Deeply Nested Panel',
        questions: [createMockQuestion('deep-q1', 'Deep Question 1')],
      });
      const nestedPanel = createMockPanel({
        name: 'nested',
        title: 'Nested Panel',
        panels: [deeplyNested],
      });
      const panel = createMockPanel({
        panels: [nestedPanel],
      });

      render(<Panel panel={panel} />);

      expect(screen.getByTestId('panel-nested')).toBeTruthy();
      expect(screen.getByTestId('panel-deeply-nested')).toBeTruthy();
      expect(screen.getByTestId('question-deep-q1')).toBeTruthy();
    });

    it('should render both questions and nested panels', () => {
      const questions = [
        createMockQuestion('q1', 'Question 1'),
        createMockQuestion('q2', 'Question 2'),
      ];
      const nestedPanel = createMockPanel({
        name: 'nested',
        title: 'Nested Panel',
        questions: [createMockQuestion('nested-q1', 'Nested Question 1')],
      });
      const panel = createMockPanel({
        questions,
        panels: [nestedPanel],
      });

      render(<Panel panel={panel} />);

      // Check parent panel questions
      expect(screen.getByTestId('question-q1')).toBeTruthy();
      expect(screen.getByTestId('question-q2')).toBeTruthy();
      
      // Check nested panel and its questions
      expect(screen.getByTestId('panel-nested')).toBeTruthy();
      expect(screen.getByTestId('question-nested-q1')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle panels with only nested panels (no questions)', () => {
      const nestedPanel = createMockPanel({
        name: 'nested',
        title: 'Nested Only',
      });
      const panel = createMockPanel({
        questions: [],
        panels: [nestedPanel],
      });

      render(<Panel panel={panel} />);

      expect(screen.getByTestId('panel-testPanel')).toBeTruthy();
      expect(screen.getByTestId('panel-nested')).toBeTruthy();
    });

    it('should handle panels with neither questions nor nested panels', () => {
      const panel = createMockPanel({
        questions: [],
        panels: [],
      });

      render(<Panel panel={panel} />);

      const panelContainer = screen.getByTestId('panel-testPanel');
      expect(panelContainer).toBeTruthy();
    });

    it('should handle null/undefined in questions array', () => {
      const questions = [
        createMockQuestion('q1', 'Question 1'),
        null as any,
        undefined as any,
        createMockQuestion('q2', 'Question 2'),
      ];
      const panel = createMockPanel({ questions });

      render(<Panel panel={panel} />);

      expect(screen.getByTestId('question-q1')).toBeTruthy();
      expect(screen.getByTestId('question-q2')).toBeTruthy();
    });

    it('should handle null/undefined in panels array', () => {
      const nestedPanel = createMockPanel({
        name: 'nested',
        title: 'Valid Nested Panel',
      });
      const panels = [
        null as any,
        nestedPanel,
        undefined as any,
      ];
      const panel = createMockPanel({ panels });

      render(<Panel panel={panel} />);

      expect(screen.getByTestId('panel-nested')).toBeTruthy();
    });
  });

  describe('Component Integration', () => {
    it('should follow established component patterns', () => {
      const panel = createMockPanel();
      render(<Panel panel={panel} />);
      
      // Should have proper testID for testing
      expect(screen.getByTestId('panel-testPanel')).toBeTruthy();
    });

    it('should integrate with QuestionFactory for question rendering', () => {
      const questions = [createMockQuestion('q1', 'Question 1')];
      const panel = createMockPanel({ questions });
      
      render(<Panel panel={panel} />);
      
      // QuestionFactory should be called for each question
      expect(screen.getByTestId('question-q1')).toBeTruthy();
      // Check that the question content is rendered (matches mock output)
      const questionElement = screen.getByTestId('question-q1');
      expect(questionElement).toHaveTextContent('q1: Question 1');
    });
  });
});