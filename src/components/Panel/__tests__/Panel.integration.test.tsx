import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Panel } from '../Panel';
import type { PanelModel, PageModel, Question } from 'survey-core';

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

describe('Panel Integration with SurveyPage', () => {
  const createMockQuestion = (name: string, title?: string): Question => ({
    name,
    title: title || name,
    type: 'text',
    visible: true,
    value: undefined,
  });

  const createMockPanel = (overrides?: Partial<PanelModel>): PanelModel => ({
    name: 'panel1',
    title: 'Panel 1',
    description: 'Panel description',
    questions: [],
    panels: [],
    visible: true,
    ...overrides,
  });

  it('should demonstrate how Panel integrates with page structure', () => {
    // This shows how a page could contain panels
    const mockPage: PageModel = {
      name: 'page1',
      title: 'Page Title',
      questions: [createMockQuestion('q1', 'Direct Page Question')],
      panels: [
        createMockPanel({
          questions: [
            createMockQuestion('q2', 'Panel Question 1'),
            createMockQuestion('q3', 'Panel Question 2'),
          ],
        }),
      ],
    };

    // Render panel from page
    if (mockPage.panels && mockPage.panels[0]) {
      render(<Panel panel={mockPage.panels[0]} />);
      
      // Verify panel renders correctly
      expect(screen.getByTestId('panel-panel1')).toBeTruthy();
      expect(screen.getByText('Panel 1')).toBeTruthy();
      expect(screen.getByTestId('question-q2')).toBeTruthy();
      expect(screen.getByTestId('question-q3')).toBeTruthy();
    }
  });

  it('should handle complex page structure with multiple panels', () => {
    const nestedPanel = createMockPanel({
      name: 'nested-panel',
      title: 'Nested Panel',
      questions: [createMockQuestion('nested-q1', 'Nested Question')],
    });

    const mainPanel = createMockPanel({
      name: 'main-panel',
      title: 'Main Panel',
      questions: [createMockQuestion('main-q1', 'Main Question')],
      panels: [nestedPanel],
    });

    render(<Panel panel={mainPanel} />);

    // Verify hierarchical rendering
    expect(screen.getByTestId('panel-main-panel')).toBeTruthy();
    expect(screen.getByTestId('panel-nested-panel')).toBeTruthy();
    expect(screen.getByTestId('question-main-q1')).toBeTruthy();
    expect(screen.getByTestId('question-nested-q1')).toBeTruthy();
  });

  it('should demonstrate panel visibility control in page context', () => {
    const panel = createMockPanel({
      name: 'panel1',
      visible: true,
      questions: [createMockQuestion('q1')],
    });

    const { rerender } = render(<Panel panel={panel} />);
    expect(screen.getByTestId('panel-panel1')).toBeTruthy();
    expect(screen.getByTestId('question-q1')).toBeTruthy();

    // Change visibility
    panel.visible = false;
    rerender(<Panel panel={panel} />);
    expect(screen.queryByTestId('panel-panel1')).toBeNull();
    expect(screen.queryByTestId('question-q1')).toBeNull();

    // Make visible again
    panel.visible = true;
    rerender(<Panel panel={panel} />);
    expect(screen.getByTestId('panel-panel1')).toBeTruthy();
    expect(screen.getByTestId('question-q1')).toBeTruthy();
  });
});