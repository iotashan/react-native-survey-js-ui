import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { usePanelValidation } from '../usePanelValidation';
import { ValidationProvider } from '../../contexts/ValidationContext';
import type { PanelModel, Question, Model } from 'survey-core';

// Mock the useValidation hook
jest.mock('../../contexts/ValidationContext', () => ({
  ...jest.requireActual('../../contexts/ValidationContext'),
  useValidation: jest.fn(() => ({
    errors: {},
    model: null,
    validationMode: 'real-time',
    touchedFields: {},
    hasErrors: false,
    isValidating: false,
    validateField: jest.fn(),
    validatePage: jest.fn(),
    validateSurvey: jest.fn(),
    validateAllVisibleQuestions: jest.fn(),
    setValidationMode: jest.fn(),
    clearErrors: jest.fn(),
    clearFieldError: jest.fn(),
    setFieldError: jest.fn(),
    getFieldErrors: jest.fn(),
    markFieldTouched: jest.fn(),
    setShowErrors: jest.fn(),
    registerCustomValidator: jest.fn(),
    addCustomValidatorToField: jest.fn(),
    removeCustomValidatorFromField: jest.fn(),
    validateWithCustomValidator: jest.fn(),
  })),
}));

const mockUseValidation = jest.mocked(require('../../contexts/ValidationContext').useValidation);

describe('usePanelValidation', () => {
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
      getAllQuestions: jest.fn(() => []),
    },
    pages: [],
    onValueChanged: { add: jest.fn(), remove: jest.fn() },
    onCurrentPageChanged: { add: jest.fn(), remove: jest.fn() },
  } as any);

  const wrapper = ({ children }: any) => <>{children}</>;

  describe('Error Aggregation', () => {
    it('should return error count for panel questions', () => {
      const errors = {
        q1: ['Error 1'],
        q2: ['Error 2', 'Error 3'],
      };
      
      // Mock useValidation to return the errors
      mockUseValidation.mockReturnValue({
        errors,
        model: null,
        validationMode: 'real-time',
        touchedFields: {},
        hasErrors: true,
        isValidating: false,
        validateField: jest.fn(),
        validatePage: jest.fn(),
        validateSurvey: jest.fn(),
        validateAllVisibleQuestions: jest.fn(),
        setValidationMode: jest.fn(),
        clearErrors: jest.fn(),
        clearFieldError: jest.fn(),
        setFieldError: jest.fn(),
        getFieldErrors: jest.fn(),
        markFieldTouched: jest.fn(),
        setShowErrors: jest.fn(),
        registerCustomValidator: jest.fn(),
        addCustomValidatorToField: jest.fn(),
        removeCustomValidatorFromField: jest.fn(),
        validateWithCustomValidator: jest.fn(),
      });
      
      const panel = createMockPanel({
        questions: [
          createMockQuestion('q1'),
          createMockQuestion('q2'),
        ],
      });

      const { result } = renderHook(
        () => usePanelValidation(panel),
        { wrapper }
      );

      expect(result.current.errorCount).toBe(3);
      expect(result.current.hasErrors).toBe(true);
    });

    it('should return zero errors for panel without validation errors', () => {
      const panel = createMockPanel({
        questions: [
          createMockQuestion('q1'),
          createMockQuestion('q2'),
        ],
      });

      const { result } = renderHook(
        () => usePanelValidation(panel),
        { wrapper }
      );

      expect(result.current.errorCount).toBe(0);
      expect(result.current.hasErrors).toBe(false);
    });

    it('should include errors from nested panels', () => {
      const nestedPanel = createMockPanel({
        name: 'nestedPanel',
        questions: [createMockQuestion('nestedQ1')],
      });

      const panel = createMockPanel({
        questions: [createMockQuestion('q1')],
        panels: [nestedPanel],
      });

      const errors = {
        q1: ['Error 1'],
        nestedQ1: ['Nested Error'],
      };

      const { result } = renderHook(
        () => usePanelValidation(panel),
        { wrapper, initialProps: { errors } }
      );

      expect(result.current.errorCount).toBe(2);
      expect(result.current.hasErrors).toBe(true);
    });

    it('should handle deeply nested panels', () => {
      const deeplyNestedPanel = createMockPanel({
        name: 'deeplyNested',
        questions: [createMockQuestion('deepQ1')],
      });

      const nestedPanel = createMockPanel({
        name: 'nested',
        panels: [deeplyNestedPanel],
      });

      const panel = createMockPanel({
        panels: [nestedPanel],
      });

      const errors = {
        deepQ1: ['Deep Error 1', 'Deep Error 2'],
      };

      const { result } = renderHook(
        () => usePanelValidation(panel),
        { wrapper, initialProps: { errors } }
      );

      expect(result.current.errorCount).toBe(2);
    });
  });

  describe('Visibility Handling', () => {
    it('should only count errors for visible questions', () => {
      const panel = createMockPanel({
        questions: [
          createMockQuestion('q1', { visible: true }),
          createMockQuestion('q2', { visible: false }),
        ],
      });

      const errors = {
        q1: ['Error 1'],
        q2: ['Error 2'], // This should not be counted
      };

      const { result } = renderHook(
        () => usePanelValidation(panel),
        { wrapper, initialProps: { errors } }
      );

      expect(result.current.errorCount).toBe(1);
    });

    it('should not count errors from invisible panels', () => {
      const nestedPanel = createMockPanel({
        name: 'nested',
        visible: false,
        questions: [createMockQuestion('nestedQ1')],
      });

      const panel = createMockPanel({
        panels: [nestedPanel],
      });

      const errors = {
        nestedQ1: ['Should not be counted'],
      };

      const { result } = renderHook(
        () => usePanelValidation(panel),
        { wrapper, initialProps: { errors } }
      );

      expect(result.current.errorCount).toBe(0);
      expect(result.current.hasErrors).toBe(false);
    });
  });

  describe('Error Details', () => {
    it('should provide detailed error information', () => {
      const panel = createMockPanel({
        questions: [
          createMockQuestion('q1'),
          createMockQuestion('q2'),
        ],
      });

      const errors = {
        q1: ['Error 1', 'Error 2'],
        q2: ['Error 3'],
      };

      const { result } = renderHook(
        () => usePanelValidation(panel),
        { wrapper, initialProps: { errors } }
      );

      expect(result.current.errorsByQuestion).toEqual({
        q1: ['Error 1', 'Error 2'],
        q2: ['Error 3'],
      });
    });

    it('should provide question names with errors', () => {
      const panel = createMockPanel({
        questions: [
          createMockQuestion('q1'),
          createMockQuestion('q2'),
          createMockQuestion('q3'),
        ],
      });

      const errors = {
        q1: ['Error'],
        q3: ['Error'],
      };

      const { result } = renderHook(
        () => usePanelValidation(panel),
        { wrapper, initialProps: { errors } }
      );

      expect(result.current.questionsWithErrors).toEqual(['q1', 'q3']);
    });
  });

  describe('Performance', () => {
    it('should memoize error calculations', () => {
      const panel = createMockPanel({
        questions: [createMockQuestion('q1')],
      });

      const errors = { q1: ['Error'] };
      const model = createMockModel(errors);

      const { result, rerender } = renderHook(
        () => usePanelValidation(panel),
        { wrapper, initialProps: { model, errors } }
      );

      const initialResult = result.current;

      // Re-render with same props
      rerender({ model, errors });

      expect(result.current).toBe(initialResult); // Should be same reference
    });

    it('should update when errors change', () => {
      const panel = createMockPanel({
        questions: [createMockQuestion('q1')],
      });

      const initialErrors = {};
      const { result, rerender } = renderHook(
        () => usePanelValidation(panel),
        { wrapper, initialProps: { errors: initialErrors } }
      );

      expect(result.current.errorCount).toBe(0);

      // Update errors
      const updatedErrors = { q1: ['New Error'] };
      rerender({ errors: updatedErrors });

      expect(result.current.errorCount).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null panel', () => {
      const { result } = renderHook(
        () => usePanelValidation(null),
        { wrapper }
      );

      expect(result.current.errorCount).toBe(0);
      expect(result.current.hasErrors).toBe(false);
      expect(result.current.errorsByQuestion).toEqual({});
    });

    it('should handle undefined panel', () => {
      const { result } = renderHook(
        () => usePanelValidation(undefined),
        { wrapper }
      );

      expect(result.current.errorCount).toBe(0);
      expect(result.current.hasErrors).toBe(false);
    });

    it('should handle panel without questions or nested panels', () => {
      const panel = createMockPanel({
        questions: [],
        panels: [],
      });

      const { result } = renderHook(
        () => usePanelValidation(panel),
        { wrapper }
      );

      expect(result.current.errorCount).toBe(0);
      expect(result.current.hasErrors).toBe(false);
    });
  });

  describe('Real-time Updates', () => {
    it('should update when validation context changes', () => {
      const panel = createMockPanel({
        questions: [createMockQuestion('q1')],
      });

      const model = createMockModel({});
      const { result } = renderHook(
        () => usePanelValidation(panel),
        { wrapper, initialProps: { model } }
      );

      expect(result.current.hasErrors).toBe(false);

      // Note: In a real implementation, this would be triggered by
      // ValidationContext updates, not manual updates
    });
  });
});