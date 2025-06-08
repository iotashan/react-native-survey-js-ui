import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SurveyPage } from './SurveyPage';
import type { PageModel, Question } from 'survey-core';
import { QuestionFactory } from '../Questions';

// Mock the hooks (not needed for this component)

// Mock QuestionFactory
jest.mock('../Questions', () => ({
  QuestionFactory: jest.fn(() => null),
}));

describe('SurveyPage', () => {
  const mockOnQuestionValueChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockQuestion = (overrides: Partial<Question> = {}): Question => {
    return {
      name: 'q1',
      title: 'Question 1',
      visible: true,
      value: undefined,
      ...overrides,
    } as Question;
  };

  const createMockPage = (overrides: Partial<PageModel> = {}): PageModel => {
    return {
      name: 'page1',
      title: 'Page Title',
      description: 'Page Description',
      questions: [createMockQuestion()],
      ...overrides,
    } as PageModel;
  };

  describe('Component Rendering Tests', () => {
    it('should render page with single question', () => {
      const mockQuestion = createMockQuestion();
      const mockPage = createMockPage({
        questions: [mockQuestion],
      });

      render(<SurveyPage page={mockPage} />);

      expect(screen.getByTestId('survey-page')).toBeTruthy();
      expect(QuestionFactory).toHaveBeenCalledWith(
        expect.objectContaining({
          question: mockQuestion,
          value: undefined,
          onChange: expect.any(Function),
        }),
        {}
      );
    });

    it('should render page with multiple questions', () => {
      const questions = [
        createMockQuestion({ name: 'q1', title: 'Question 1' }),
        createMockQuestion({ name: 'q2', title: 'Question 2' }),
        createMockQuestion({ name: 'q3', title: 'Question 3' }),
      ];
      const mockPage = createMockPage({ questions });

      render(<SurveyPage page={mockPage} />);

      expect(QuestionFactory).toHaveBeenCalledTimes(3);
      questions.forEach((question) => {
        expect(QuestionFactory).toHaveBeenCalledWith(
          expect.objectContaining({
            question,
            value: undefined,
            onChange: expect.any(Function),
          }),
          {}
        );
      });
    });

    it('should handle empty page gracefully', () => {
      const mockPage = createMockPage({ questions: [] });

      render(<SurveyPage page={mockPage} />);

      expect(screen.getByTestId('empty-page-message')).toBeTruthy();
      expect(screen.getByText('No questions available on this page')).toBeTruthy();
      expect(QuestionFactory).not.toHaveBeenCalled();
    });

    it('should render page title and description when available', () => {
      const mockPage = createMockPage({
        title: 'Test Page Title',
        description: 'Test Page Description',
      });

      render(<SurveyPage page={mockPage} />);

      expect(screen.getByTestId('page-title')).toBeTruthy();
      expect(screen.getByText('Test Page Title')).toBeTruthy();
      expect(screen.getByTestId('page-description')).toBeTruthy();
      expect(screen.getByText('Test Page Description')).toBeTruthy();
    });

    it('should not render title when not provided', () => {
      const mockPage = createMockPage({ title: undefined });

      render(<SurveyPage page={mockPage} />);

      expect(screen.queryByTestId('page-title')).toBeNull();
    });

    it('should not render description when not provided', () => {
      const mockPage = createMockPage({ description: undefined });

      render(<SurveyPage page={mockPage} />);

      expect(screen.queryByTestId('page-description')).toBeNull();
    });
  });

  describe('Integration Tests', () => {
    it('should call onQuestionValueChange when question value changes', () => {
      const mockQuestion = createMockQuestion();
      const mockPage = createMockPage({ questions: [mockQuestion] });

      render(<SurveyPage page={mockPage} onQuestionValueChange={mockOnQuestionValueChange} />);

      const factoryCall = (QuestionFactory as jest.Mock).mock.calls[0][0];
      factoryCall.onChange('new-value');
      
      expect(mockOnQuestionValueChange).toHaveBeenCalledWith('q1', 'new-value');
    });

    it('should filter out invisible questions', () => {
      const questions = [
        createMockQuestion({ name: 'q1', visible: true }),
        createMockQuestion({ name: 'q2', visible: false }),
        createMockQuestion({ name: 'q3', visible: true }),
      ];
      const mockPage = createMockPage({ questions });

      render(<SurveyPage page={mockPage} />);

      expect(QuestionFactory).toHaveBeenCalledTimes(2);
      expect(QuestionFactory).toHaveBeenCalledWith(
        expect.objectContaining({
          question: questions[0],
        }),
        {}
      );
      expect(QuestionFactory).toHaveBeenCalledWith(
        expect.objectContaining({
          question: questions[2],
        }),
        {}
      );
    });

    it('should pass question value and onChange handler to QuestionFactory', () => {
      const mockQuestion = createMockQuestion({ value: 'test-value' });
      const mockPage = createMockPage({ questions: [mockQuestion] });

      render(<SurveyPage page={mockPage} onQuestionValueChange={mockOnQuestionValueChange} />);

      const factoryCall = (QuestionFactory as jest.Mock).mock.calls[0][0];
      expect(factoryCall.value).toBe('test-value');
      expect(typeof factoryCall.onChange).toBe('function');
    });
  });

  describe('Edge Case Tests', () => {
    it('should handle null page model', () => {
      render(<SurveyPage page={null as any} />);

      expect(screen.queryByTestId('survey-page')).toBeNull();
      expect(QuestionFactory).not.toHaveBeenCalled();
    });

    it('should handle undefined page model', () => {
      render(<SurveyPage page={undefined as any} />);

      expect(screen.queryByTestId('survey-page')).toBeNull();
      expect(QuestionFactory).not.toHaveBeenCalled();
    });

    it('should handle page with all invisible questions', () => {
      const questions = [
        createMockQuestion({ name: 'q1', visible: false }),
        createMockQuestion({ name: 'q2', visible: false }),
      ];
      const mockPage = createMockPage({ questions });

      render(<SurveyPage page={mockPage} />);

      expect(screen.getByTestId('empty-page-message')).toBeTruthy();
      expect(QuestionFactory).not.toHaveBeenCalled();
    });

    it('should pass surveyId prop when provided', () => {
      const mockPage = createMockPage();

      render(<SurveyPage page={mockPage} surveyId="test-survey-123" />);

      expect(screen.getByTestId('survey-page')).toBeTruthy();
    });
  });
});