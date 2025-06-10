import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { usePageValidation } from '../usePageValidation';
import type { Model, Question } from 'survey-core';

// Simple mock for testing enhanced required validation
const createMockModel = (questions: Partial<Question>[] = []): Model => {
  const mockQuestions = questions.map(q => ({
    name: q.name || 'question1',
    value: q.value || '',
    isRequired: q.isRequired || false,
    type: q.type || 'text',
    visible: q.visible !== false,
    title: q.title || 'Test Question',
    requiredErrorText: (q as any).requiredErrorText,
    validators: (q as any).validators || [],
    ...q
  }));

  const mockCurrentPage = {
    questions: mockQuestions,
    getQuestionByName: jest.fn((name: string) => 
      mockQuestions.find(q => q.name === name)
    ),
  };

  const model = {
    currentPage: mockCurrentPage,
    pages: [mockCurrentPage],
    onValueChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onCurrentPageChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
  } as unknown as Model;

  return model;
};

describe('usePageValidation - Enhanced Required Field Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Enhanced Required Field Detection', () => {
    it('should detect empty string values as invalid', () => {
      const model = createMockModel([
        { name: 'firstName', value: '', isRequired: true, type: 'text' }
      ]);

      const { result } = renderHook(() => usePageValidation(model));

      act(() => {
        const isValid = result.current.validateCurrentPage();
        expect(isValid).toBe(false);
      });

      expect(result.current.validationState.hasErrors).toBe(true);
      expect(result.current.validationState.errors.firstName).toContain('This field is required');
    });

    it('should detect whitespace-only values as invalid', () => {
      const model = createMockModel([
        { name: 'firstName', value: '   ', isRequired: true, type: 'text' }
      ]);

      const { result } = renderHook(() => usePageValidation(model));

      act(() => {
        result.current.validateCurrentPage();
      });

      expect(result.current.validationState.hasErrors).toBe(true);
      expect(result.current.validationState.errors.firstName).toContain('This field is required');
    });

    it('should detect empty arrays as invalid for checkbox questions', () => {
      const model = createMockModel([
        { name: 'interests', value: [], isRequired: true, type: 'checkbox' }
      ]);

      const { result } = renderHook(() => usePageValidation(model));

      act(() => {
        result.current.validateCurrentPage();
      });

      expect(result.current.validationState.hasErrors).toBe(true);
      expect(result.current.validationState.errors.interests).toContain('Please select at least one option');
    });

    it('should detect null and undefined values as invalid', () => {
      const model = createMockModel([
        { name: 'q1', value: null, isRequired: true, type: 'text' },
        { name: 'q2', value: undefined, isRequired: true, type: 'text' }
      ]);

      const { result } = renderHook(() => usePageValidation(model));

      act(() => {
        result.current.validateCurrentPage();
      });

      expect(result.current.validationState.hasErrors).toBe(true);
      expect(result.current.validationState.errors.q1).toContain('This field is required');
      expect(result.current.validationState.errors.q2).toContain('This field is required');
    });
  });

  describe('Custom Required Error Messages', () => {
    it('should use custom required error text when provided', () => {
      const model = createMockModel([
        { 
          name: 'email', 
          value: '', 
          isRequired: true, 
          type: 'text',
          requiredErrorText: 'Please provide your email address'
        }
      ]);

      const { result } = renderHook(() => usePageValidation(model));

      act(() => {
        result.current.validateCurrentPage();
      });

      expect(result.current.validationState.errors.email).toContain('Please provide your email address');
    });

    it('should generate contextual error messages for different question types', () => {
      const model = createMockModel([
        { name: 'radio1', value: '', isRequired: true, type: 'radiogroup' },
        { name: 'check1', value: [], isRequired: true, type: 'checkbox' },
        { name: 'dropdown1', value: '', isRequired: true, type: 'dropdown' },
        { name: 'rating1', value: '', isRequired: true, type: 'rating' }
      ]);

      const { result } = renderHook(() => usePageValidation(model));

      act(() => {
        result.current.validateCurrentPage();
      });

      expect(result.current.validationState.errors.radio1[0]).toBe('Please select an option');
      expect(result.current.validationState.errors.check1[0]).toBe('Please select at least one option');
      expect(result.current.validationState.errors.dropdown1[0]).toBe('Please select an option');
      expect(result.current.validationState.errors.rating1[0]).toBe('Please provide a rating');
    });
  });

  describe('Custom Validators', () => {
    it('should validate minimum selection count for checkbox', () => {
      const model = createMockModel([
        { 
          name: 'interests', 
          value: ['sports'], 
          isRequired: true, 
          type: 'checkbox',
          validators: [{
            type: 'answercount',
            minCount: 2,
            text: 'Please select at least 2 interests'
          }]
        }
      ]);

      const { result } = renderHook(() => usePageValidation(model));

      act(() => {
        result.current.validateCurrentPage();
      });

      expect(result.current.validationState.hasErrors).toBe(true);
      expect(result.current.validationState.errors.interests).toContain('Please select at least 2 interests');
    });

    it('should validate maximum selection count for checkbox', () => {
      const model = createMockModel([
        { 
          name: 'interests', 
          value: ['sports', 'music', 'art', 'travel'], 
          isRequired: true, 
          type: 'checkbox',
          validators: [{
            type: 'answercount',
            maxCount: 3,
            text: 'Please select no more than 3 interests'
          }]
        }
      ]);

      const { result } = renderHook(() => usePageValidation(model));

      act(() => {
        result.current.validateCurrentPage();
      });

      expect(result.current.validationState.hasErrors).toBe(true);
      expect(result.current.validationState.errors.interests).toContain('Please select no more than 3 interests');
    });
  });

  describe('Matrix Question Validation', () => {
    it('should validate empty matrix objects', () => {
      const model = createMockModel([
        { 
          name: 'satisfaction', 
          value: {}, 
          isRequired: true, 
          type: 'matrix'
        }
      ]);

      const { result } = renderHook(() => usePageValidation(model));

      act(() => {
        result.current.validateCurrentPage();
      });

      expect(result.current.validationState.hasErrors).toBe(true);
      expect(result.current.validationState.errors.satisfaction).toContain('Please answer all required rows');
    });

    it('should validate matrix with all empty values', () => {
      const model = createMockModel([
        { 
          name: 'satisfaction', 
          value: { row1: '', row2: null, row3: undefined }, 
          isRequired: true, 
          type: 'matrix'
        }
      ]);

      const { result } = renderHook(() => usePageValidation(model));

      act(() => {
        result.current.validateCurrentPage();
      });

      expect(result.current.validationState.hasErrors).toBe(true);
      expect(result.current.validationState.errors.satisfaction).toContain('Please answer all required rows');
    });

    it('should pass validation for matrix with at least one value', () => {
      const model = createMockModel([
        { 
          name: 'satisfaction', 
          value: { row1: 'good', row2: '', row3: undefined }, 
          isRequired: true, 
          type: 'matrix'
        }
      ]);

      const { result } = renderHook(() => usePageValidation(model));

      act(() => {
        const isValid = result.current.validateCurrentPage();
        expect(isValid).toBe(true);
      });

      expect(result.current.validationState.hasErrors).toBe(false);
    });
  });

  describe('Valid Values', () => {
    it('should pass validation for valid text input', () => {
      const model = createMockModel([
        { name: 'firstName', value: 'John', isRequired: true, type: 'text' }
      ]);

      const { result } = renderHook(() => usePageValidation(model));

      act(() => {
        const isValid = result.current.validateCurrentPage();
        expect(isValid).toBe(true);
      });

      expect(result.current.validationState.hasErrors).toBe(false);
    });

    it('should pass validation for valid checkbox selection', () => {
      const model = createMockModel([
        { name: 'interests', value: ['sports', 'music'], isRequired: true, type: 'checkbox' }
      ]);

      const { result } = renderHook(() => usePageValidation(model));

      act(() => {
        const isValid = result.current.validateCurrentPage();
        expect(isValid).toBe(true);
      });

      expect(result.current.validationState.hasErrors).toBe(false);
    });
  });
});