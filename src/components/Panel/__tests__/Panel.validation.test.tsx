import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Panel } from '../Panel';
import { ValidationProvider } from '../../../contexts/ValidationContext';
import type { PanelModel, Question, Model } from 'survey-core';

// Mock QuestionFactory
jest.mock('../../Questions/QuestionFactory', () => ({
  QuestionFactory: ({ question }: { question: Question }) => {
    const mockTestID = `question-${question.name}`;
    return (
      <div testID={mockTestID}>
        Question: {question.title || question.name}
      </div>
    );
  },
}));

// Mock the usePanelValidation hook
jest.mock('../../../hooks/usePanelValidation', () => ({
  usePanelValidation: jest.fn(() => ({
    errorCount: 0,
    hasErrors: false,
    errorsByQuestion: {},
    questionsWithErrors: [],
  })),
}));

const mockUsePanelValidation = jest.mocked(require('../../../hooks/usePanelValidation').usePanelValidation);

describe('Panel Validation Error Display', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockQuestion = (name: string, overrides?: Partial<Question>): Question => ({
    name,
    title: `Question ${name}`,
    type: 'text',
    visible: true,
    isRequired: false,
    value: undefined,
    hasErrors: () => false,
    errors: [],
    ...overrides,
  });

  const createMockPanel = (overrides?: Partial<PanelModel>): PanelModel => ({
    name: 'testPanel',
    title: 'Test Panel',
    questions: [],
    panels: [],
    visible: true,
    ...overrides,
  });

  const createMockModel = (errors: Record<string, string[]> = {}): Model => ({
    currentPage: {
      name: 'page1',
      questions: [],
      getQuestionByName: jest.fn(),
    },
    pages: [],
    onValueChanged: { add: jest.fn(), remove: jest.fn() },
    onCurrentPageChanged: { add: jest.fn(), remove: jest.fn() },
  } as any);

  describe('Error Indicator Display', () => {
    it('should display error indicator in panel header when panel contains questions with errors', async () => {
      // Mock the validation hook to return errors
      mockUsePanelValidation.mockReturnValue({
        errorCount: 2,
        hasErrors: true,
        errorsByQuestion: {
          q1: ['This field is required'],
          q2: ['Invalid format'],
        },
        questionsWithErrors: ['q1', 'q2'],
      });

      const mockModel = createMockModel({
        q1: ['This field is required'],
        q2: ['Invalid format'],
      });

      const panel = createMockPanel({
        questions: [
          createMockQuestion('q1', { isRequired: true }),
          createMockQuestion('q2'),
        ],
      });

      render(
        <ValidationProvider model={mockModel}>
          <Panel panel={panel} collapsible />
        </ValidationProvider>
      );

      // Check for error indicator in panel header
      await waitFor(() => {
        expect(screen.getByTestId('panel-header-testPanel-error-indicator')).toBeTruthy();
      });

      // Check error count
      const errorIndicator = screen.getByTestId('panel-header-testPanel-error-indicator-count');
      expect(errorIndicator).toHaveTextContent('2');
    });

    it('should not display error indicator when panel has no questions with errors', () => {
      // Mock the validation hook to return no errors
      mockUsePanelValidation.mockReturnValue({
        errorCount: 0,
        hasErrors: false,
        errorsByQuestion: {},
        questionsWithErrors: [],
      });

      const mockModel = createMockModel({});
      const panel = createMockPanel({
        questions: [
          createMockQuestion('q1'),
          createMockQuestion('q2'),
        ],
      });

      render(
        <ValidationProvider model={mockModel}>
          <Panel panel={panel} collapsible />
        </ValidationProvider>
      );

      // Check that error indicator is not present
      expect(screen.queryByTestId('panel-header-testPanel-error-indicator')).toBeNull();
    });

    it('should update error indicator when validation state changes', async () => {
      const panel = createMockPanel({
        questions: [
          createMockQuestion('q1', { isRequired: true }),
        ],
      });

      // Initially mock no errors
      mockUsePanelValidation.mockReturnValue({
        errorCount: 0,
        hasErrors: false,
        errorsByQuestion: {},
        questionsWithErrors: [],
      });

      const mockModel = createMockModel({});

      const { rerender } = render(
        <ValidationProvider model={mockModel}>
          <Panel panel={panel} collapsible />
        </ValidationProvider>
      );

      // Initially no errors
      expect(screen.queryByTestId('panel-header-testPanel-error-indicator')).toBeNull();

      // Update mock to return errors
      mockUsePanelValidation.mockReturnValue({
        errorCount: 1,
        hasErrors: true,
        errorsByQuestion: {
          q1: ['This field is required'],
        },
        questionsWithErrors: ['q1'],
      });

      // Update model with errors
      const updatedModel = createMockModel({
        q1: ['This field is required'],
      });

      rerender(
        <ValidationProvider model={updatedModel}>
          <Panel panel={panel} collapsible />
        </ValidationProvider>
      );

      // Check for error indicator
      await waitFor(() => {
        expect(screen.getByTestId('panel-header-testPanel-error-indicator')).toBeTruthy();
      });
    });
  });

  describe('Nested Panel Error Propagation', () => {
    it('should propagate errors from nested panels to parent panel', async () => {
      // Mock validation hook to return errors for parent panel (including nested)
      mockUsePanelValidation.mockReturnValue({
        errorCount: 1,
        hasErrors: true,
        errorsByQuestion: {
          nestedQ1: ['Error in nested question'],
        },
        questionsWithErrors: ['nestedQ1'],
      });

      const mockModel = createMockModel({
        nestedQ1: ['Error in nested question'],
      });

      const nestedPanel = createMockPanel({
        name: 'nestedPanel',
        title: 'Nested Panel',
        questions: [
          createMockQuestion('nestedQ1', { isRequired: true }),
        ],
      });

      const parentPanel = createMockPanel({
        name: 'parentPanel',
        title: 'Parent Panel',
        panels: [nestedPanel],
      });

      render(
        <ValidationProvider model={mockModel}>
          <Panel panel={parentPanel} collapsible />
        </ValidationProvider>
      );

      // Parent panel should show error indicator
      await waitFor(() => {
        expect(screen.getByTestId('panel-header-parentPanel-error-indicator')).toBeTruthy();
      });

      // Error count should include nested errors
      const errorCount = screen.getByTestId('panel-header-parentPanel-error-indicator-count');
      expect(errorCount).toHaveTextContent('1');
    });

    it('should aggregate errors from multiple nested panels', async () => {
      const mockModel = createMockModel({
        nestedQ1: ['Error 1'],
        nestedQ2: ['Error 2'],
        nestedQ3: ['Error 3', 'Error 4'],
      });

      const nestedPanel1 = createMockPanel({
        name: 'nested1',
        questions: [createMockQuestion('nestedQ1')],
      });

      const nestedPanel2 = createMockPanel({
        name: 'nested2',
        questions: [
          createMockQuestion('nestedQ2'),
          createMockQuestion('nestedQ3'),
        ],
      });

      const parentPanel = createMockPanel({
        panels: [nestedPanel1, nestedPanel2],
      });

      render(
        <ValidationProvider model={mockModel}>
          <Panel panel={parentPanel} collapsible />
        </ValidationProvider>
      );

      // Check total error count
      await waitFor(() => {
        const errorCount = screen.getByTestId('panel-header-testPanel-error-indicator-count');
        expect(errorCount).toHaveTextContent('4');
      });
    });
  });

  describe('Auto-Expand Functionality', () => {
    it('should auto-expand collapsed panel when it contains validation errors', async () => {
      const mockModel = createMockModel({
        q1: ['This field is required'],
      });

      const panel = createMockPanel({
        questions: [createMockQuestion('q1', { isRequired: true })],
      });

      render(
        <ValidationProvider model={mockModel}>
          <Panel panel={panel} collapsible initialExpanded={false} />
        </ValidationProvider>
      );

      // Panel should auto-expand when it has errors
      await waitFor(() => {
        const questionElement = screen.getByTestId('question-q1');
        expect(questionElement).toBeTruthy(); // Content is visible
      });
    });

    it('should not auto-expand when autoExpandOnError is disabled', () => {
      const mockModel = createMockModel({
        q1: ['This field is required'],
      });

      const panel = createMockPanel({
        questions: [createMockQuestion('q1', { isRequired: true })],
      });

      render(
        <ValidationProvider model={mockModel}>
          <Panel 
            panel={panel} 
            collapsible 
            initialExpanded={false}
            autoExpandOnError={false}
          />
        </ValidationProvider>
      );

      // Panel should remain collapsed
      expect(screen.queryByTestId('question-q1')).toBeNull();
    });
  });

  describe('Visual Error States', () => {
    it('should apply error styles to panel header when panel contains errors', async () => {
      const mockModel = createMockModel({
        q1: ['Error'],
      });

      const panel = createMockPanel({
        questions: [createMockQuestion('q1')],
      });

      render(
        <ValidationProvider model={mockModel}>
          <Panel panel={panel} collapsible />
        </ValidationProvider>
      );

      await waitFor(() => {
        const header = screen.getByTestId('panel-header-testPanel');
        expect(header).toHaveStyle({ 
          borderColor: '#d32f2f',
          borderWidth: 1
        });
      });
    });

    it('should show error badge with proper styling', async () => {
      const mockModel = createMockModel({
        q1: ['Error 1'],
        q2: ['Error 2'],
      });

      const panel = createMockPanel({
        questions: [
          createMockQuestion('q1'),
          createMockQuestion('q2'),
        ],
      });

      render(
        <ValidationProvider model={mockModel}>
          <Panel panel={panel} collapsible />
        </ValidationProvider>
      );

      await waitFor(() => {
        const errorIndicator = screen.getByTestId('panel-header-testPanel-error-indicator');
        expect(errorIndicator).toHaveStyle({
          backgroundColor: '#d32f2f',
          borderRadius: 12,
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for error states', async () => {
      const mockModel = createMockModel({
        q1: ['This field is required'],
      });

      const panel = createMockPanel({
        questions: [createMockQuestion('q1')],
      });

      render(
        <ValidationProvider model={mockModel}>
          <Panel panel={panel} collapsible />
        </ValidationProvider>
      );

      await waitFor(() => {
        const header = screen.getByTestId('panel-header-testPanel');
        expect(header).toHaveAccessibilityState({ invalid: true });
        expect(header).toHaveAccessibilityValue({ text: '1 error' });
      });
    });

    it('should announce error count changes to screen readers', async () => {
      const mockModel = createMockModel({});
      const panel = createMockPanel({
        questions: [createMockQuestion('q1', { isRequired: true })],
      });

      const { rerender } = render(
        <ValidationProvider model={mockModel}>
          <Panel panel={panel} collapsible />
        </ValidationProvider>
      );

      // Add errors
      const updatedModel = createMockModel({
        q1: ['This field is required'],
      });

      rerender(
        <ValidationProvider model={updatedModel}>
          <Panel panel={panel} collapsible />
        </ValidationProvider>
      );

      await waitFor(() => {
        const errorIndicator = screen.getByTestId('panel-header-testPanel-error-indicator');
        expect(errorIndicator).toHaveAccessibilityLiveRegion('polite');
      });
    });
  });

  describe('Real-time vs On-Submit Validation Modes', () => {
    it('should display errors in real-time mode immediately', async () => {
      const mockModel = createMockModel({
        q1: ['Invalid input'],
      });

      const panel = createMockPanel({
        questions: [createMockQuestion('q1')],
      });

      render(
        <ValidationProvider model={mockModel} initialMode="real-time">
          <Panel panel={panel} collapsible />
        </ValidationProvider>
      );

      // Errors should be visible immediately
      await waitFor(() => {
        expect(screen.getByTestId('panel-header-testPanel-error-indicator')).toBeTruthy();
      });
    });

    it('should not display errors in on-submit mode until submission', () => {
      const mockModel = createMockModel({});
      const panel = createMockPanel({
        questions: [createMockQuestion('q1', { isRequired: true, value: '' })],
      });

      render(
        <ValidationProvider model={mockModel} initialMode="on-submit">
          <Panel panel={panel} collapsible />
        </ValidationProvider>
      );

      // No errors should be visible before submission
      expect(screen.queryByTestId('panel-header-testPanel-error-indicator')).toBeNull();
    });
  });

  describe('Performance', () => {
    it('should memoize error calculations to prevent unnecessary re-renders', () => {
      const mockModel = createMockModel({
        q1: ['Error'],
      });

      const panel = createMockPanel({
        questions: [createMockQuestion('q1')],
      });

      const renderSpy = jest.fn();
      const TestComponent = () => {
        renderSpy();
        return <Panel panel={panel} collapsible />;
      };

      const { rerender } = render(
        <ValidationProvider model={mockModel}>
          <TestComponent />
        </ValidationProvider>
      );

      const initialRenderCount = renderSpy.mock.calls.length;

      // Re-render with same props
      rerender(
        <ValidationProvider model={mockModel}>
          <TestComponent />
        </ValidationProvider>
      );

      // Should not trigger additional renders
      expect(renderSpy.mock.calls.length).toBe(initialRenderCount);
    });
  });
});