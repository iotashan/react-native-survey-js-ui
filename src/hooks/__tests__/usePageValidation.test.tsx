import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { usePageValidation } from '../usePageValidation';
import type { Model, QuestionBase, Page } from 'survey-core';

// Mock survey-core Model
const createMockModel = (options: Partial<{
  currentPage: Partial<Page>;
  pages: Partial<Page>[];
  questions: Partial<QuestionBase>[];
  hasValidationMethods: boolean;
}> = {}): Model => {
  const {
    currentPage,
    pages = [],
    questions = [],
    hasValidationMethods = false
  } = options;

  const mockQuestions = questions.map(q => ({
    name: q.name || 'question1',
    value: q.value || '',
    isRequired: q.isRequired || false,
    hasErrors: hasValidationMethods ? jest.fn(() => false) : undefined,
    errors: hasValidationMethods ? [] : undefined,
    ...q
  }));

  const mockCurrentPage = {
    questions: mockQuestions,
    getQuestionByName: jest.fn((name: string) => 
      mockQuestions.find(q => q.name === name)
    ),
    hasErrors: hasValidationMethods ? jest.fn(() => false) : undefined,
    ...currentPage
  };

  const model = {
    currentPage: mockCurrentPage,
    pages: pages.length > 0 ? pages : [mockCurrentPage],
    onValueChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onCurrentPageChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onValidatedErrorsOnCurrentPage: hasValidationMethods ? {
      add: jest.fn(),
      remove: jest.fn(),
    } : undefined,
    validateCurrentPage: hasValidationMethods ? jest.fn(() => true) : undefined,
    hasErrors: hasValidationMethods ? jest.fn(() => false) : undefined,
    validate: hasValidationMethods ? jest.fn(() => true) : undefined,
  } as unknown as Model;

  return model;
};

describe('usePageValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with empty validation state when no model provided', () => {
      const { result } = renderHook(() => usePageValidation(null));

      expect(result.current.validationState).toEqual({
        hasErrors: false,
        errors: {},
        validationMessages: [],
        isValidating: false,
      });
    });

    it('should initialize with empty validation state for valid model', () => {
      const model = createMockModel();
      const { result } = renderHook(() => usePageValidation(model));

      expect(result.current.validationState).toEqual({
        hasErrors: false,
        errors: {},
        validationMessages: [],
        isValidating: false,
      });
    });

    it('should subscribe to model events during initialization', () => {
      const model = createMockModel({ hasValidationMethods: true });
      renderHook(() => usePageValidation(model));

      expect(model.onValueChanged.add).toHaveBeenCalled();
      expect(model.onCurrentPageChanged.add).toHaveBeenCalled();
      expect((model as any).onValidatedErrorsOnCurrentPage.add).toHaveBeenCalled();
    });

    it('should handle models without advanced validation events', () => {
      const model = createMockModel({ hasValidationMethods: false });
      renderHook(() => usePageValidation(model));

      expect(model.onValueChanged.add).toHaveBeenCalled();
      expect(model.onCurrentPageChanged.add).toHaveBeenCalled();
    });
  });

  describe('Event Handling', () => {
    it('should handle value changed events', () => {
      const model = createMockModel({
        questions: [
          { name: 'q1', value: '', isRequired: true }
        ]
      });
      
      const { result } = renderHook(() => usePageValidation(model));

      // Simulate value changed event
      const valueChangedHandler = (model.onValueChanged.add as jest.Mock).mock.calls[0][0];
      
      act(() => {
        valueChangedHandler(model, { 
          question: { 
            name: 'q1', 
            value: '', 
            isRequired: true 
          } 
        });
      });

      expect(result.current.validationState.hasErrors).toBe(true);
      expect(result.current.validationState.errors.q1).toContain('This field is required');
    });

    it('should clear errors when page changes', () => {
      const model = createMockModel({
        questions: [
          { name: 'q1', value: '', isRequired: true }
        ]
      });
      
      const { result } = renderHook(() => usePageValidation(model));

      // First, create some errors
      const valueChangedHandler = (model.onValueChanged.add as jest.Mock).mock.calls[0][0];
      act(() => {
        valueChangedHandler(model, { 
          question: { 
            name: 'q1', 
            value: '', 
            isRequired: true 
          } 
        });
      });

      expect(result.current.validationState.hasErrors).toBe(true);

      // Then simulate page change
      const pageChangedHandler = (model.onCurrentPageChanged.add as jest.Mock).mock.calls[0][0];
      act(() => {
        pageChangedHandler();
      });

      expect(result.current.validationState.hasErrors).toBe(false);
      expect(result.current.validationState.errors).toEqual({});
    });
  });

  describe('Validation Methods', () => {
    describe('validateCurrentPage', () => {
      it('should return true for model without current page', () => {
        const model = createMockModel();
        model.currentPage = null as any;
        
        const { result } = renderHook(() => usePageValidation(model));

        act(() => {
          const isValid = result.current.validateCurrentPage();
          expect(isValid).toBe(true);
        });
      });

      it('should use survey-core validation when available', () => {
        const model = createMockModel({ hasValidationMethods: true });
        (model as any).validateCurrentPage = jest.fn(() => true);
        
        const { result } = renderHook(() => usePageValidation(model));

        act(() => {
          const isValid = result.current.validateCurrentPage();
          expect(isValid).toBe(true);
          expect((model as any).validateCurrentPage).toHaveBeenCalled();
        });
      });

      it('should validate required fields when survey-core methods unavailable', () => {
        const model = createMockModel({
          questions: [
            { name: 'q1', value: '', isRequired: true },
            { name: 'q2', value: 'filled', isRequired: true }
          ]
        });
        
        const { result } = renderHook(() => usePageValidation(model));

        act(() => {
          const isValid = result.current.validateCurrentPage();
          expect(isValid).toBe(false);
        });

        expect(result.current.validationState.hasErrors).toBe(true);
        expect(result.current.validationState.errors.q1).toContain('This field is required');
        expect(result.current.validationState.errors.q2).toBeUndefined();
      });

      it('should set isValidating state during validation', () => {
        const model = createMockModel();
        const { result } = renderHook(() => usePageValidation(model));

        act(() => {
          result.current.validateCurrentPage();
        });

        expect(result.current.validationState.isValidating).toBe(false);
      });
    });

    describe('validateAllPages', () => {
      it('should return true for null model', () => {
        const { result } = renderHook(() => usePageValidation(null));

        act(() => {
          const isValid = result.current.validateAllPages();
          expect(isValid).toBe(true);
        });
      });

      it('should use survey-core hasErrors when available', () => {
        const model = createMockModel({ hasValidationMethods: true });
        (model as any).hasErrors = jest.fn(() => false);
        
        const { result } = renderHook(() => usePageValidation(model));

        act(() => {
          const isValid = result.current.validateAllPages();
          expect(isValid).toBe(true);
          expect((model as any).hasErrors).toHaveBeenCalled();
        });
      });

      it('should validate all pages and questions when methods unavailable', () => {
        const page1Questions = [
          { name: 'q1', value: 'filled', isRequired: true }
        ];
        const page2Questions = [
          { name: 'q2', value: '', isRequired: true }
        ];

        const model = createMockModel({
          pages: [
            { questions: page1Questions },
            { questions: page2Questions }
          ]
        });
        
        const { result } = renderHook(() => usePageValidation(model));

        act(() => {
          const isValid = result.current.validateAllPages();
          expect(isValid).toBe(false);
        });
      });
    });

    describe('validateQuestion', () => {
      it('should return true for non-existent question', () => {
        const model = createMockModel();
        const { result } = renderHook(() => usePageValidation(model));

        act(() => {
          const isValid = result.current.validateQuestion('nonexistent');
          expect(isValid).toBe(true);
        });
      });

      it('should validate specific question and update state', () => {
        const model = createMockModel({
          questions: [
            { name: 'q1', value: '', isRequired: true }
          ]
        });
        
        const { result } = renderHook(() => usePageValidation(model));

        act(() => {
          const isValid = result.current.validateQuestion('q1');
          expect(isValid).toBe(false);
        });

        expect(result.current.validationState.errors.q1).toContain('This field is required');
      });

      it('should use survey-core hasErrors when available', () => {
        const mockQuestion = {
          name: 'q1',
          value: 'test',
          isRequired: true,
          hasErrors: jest.fn(() => false)
        };

        const model = createMockModel({
          hasValidationMethods: true,
          questions: [mockQuestion]
        });
        
        const { result } = renderHook(() => usePageValidation(model));

        act(() => {
          const isValid = result.current.validateQuestion('q1');
          expect(isValid).toBe(true);
          expect(mockQuestion.hasErrors).toHaveBeenCalled();
        });
      });
    });

    describe('clearValidationErrors', () => {
      it('should clear all validation errors', () => {
        const model = createMockModel({
          questions: [
            { name: 'q1', value: '', isRequired: true }
          ]
        });
        
        const { result } = renderHook(() => usePageValidation(model));

        // First create some errors
        act(() => {
          result.current.validateCurrentPage();
        });

        expect(result.current.validationState.hasErrors).toBe(true);

        // Then clear them
        act(() => {
          result.current.clearValidationErrors();
        });

        expect(result.current.validationState).toEqual({
          hasErrors: false,
          errors: {},
          validationMessages: [],
          isValidating: false,
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', () => {
      const model = createMockModel();
      // Mock console.error to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Force an error by making getQuestionByName throw
      (model.currentPage as any).getQuestionByName = jest.fn(() => {
        throw new Error('Test error');
      });
      
      const { result } = renderHook(() => usePageValidation(model));

      act(() => {
        const isValid = result.current.validateQuestion('q1');
        expect(isValid).toBe(true); // Should fallback to true
      });

      consoleSpy.mockRestore();
    });

    it('should handle missing survey-core methods gracefully', () => {
      const model = createMockModel({
        questions: [
          { name: 'q1', value: '', isRequired: true }
        ]
      });
      
      // Remove all survey-core methods
      delete (model as any).validateCurrentPage;
      delete (model.currentPage as any).hasErrors;
      delete (model as any).hasErrors;
      delete (model as any).validate;
      
      const { result } = renderHook(() => usePageValidation(model));

      // Should still work with fallback validation
      act(() => {
        const isValid = result.current.validateCurrentPage();
        expect(isValid).toBe(false);
      });

      expect(result.current.validationState.hasErrors).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const model = createMockModel({ hasValidationMethods: true });
      const { unmount } = renderHook(() => usePageValidation(model));

      unmount();

      expect(model.onValueChanged.remove).toHaveBeenCalled();
      expect(model.onCurrentPageChanged.remove).toHaveBeenCalled();
      expect((model as any).onValidatedErrorsOnCurrentPage.remove).toHaveBeenCalled();
    });

    it('should handle cleanup when model changes to null', () => {
      const model = createMockModel();
      const { result, rerender } = renderHook(
        ({ model }) => usePageValidation(model),
        { initialProps: { model } }
      );

      // Change model to null
      rerender({ model: null });

      expect(result.current.validationState).toEqual({
        hasErrors: false,
        errors: {},
        validationMessages: [],
        isValidating: false,
      });
    });
  });
});