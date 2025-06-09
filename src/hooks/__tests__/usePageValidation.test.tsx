import * as React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { Model } from 'survey-core';
import { usePageValidation } from '../usePageValidation';

// Mock survey-core
jest.mock('survey-core', () => ({
  Model: jest.fn().mockImplementation(() => ({
    currentPage: {
      validate: jest.fn(),
      hasErrors: false,
      errors: [],
      questions: [],
    },
    validate: jest.fn(),
    hasErrors: jest.fn(),
    onValidateQuestion: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onValueChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onCurrentPageChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    getQuestionByName: jest.fn(),
    pages: [],
  })),
}));

describe('usePageValidation', () => {
  let mockModel: jest.Mocked<Model>;

  beforeEach(() => {
    mockModel = new Model({}) as jest.Mocked<Model>;
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return initial validation state when model is null', () => {
      const { result } = renderHook(() => usePageValidation(null));

      expect(result.current.validationState).toEqual({
        errors: {},
        isValidating: false,
        hasErrors: false,
        validationMessages: [],
      });
    });

    it('should return initial validation state when model is provided', () => {
      const { result } = renderHook(() => usePageValidation(mockModel));

      expect(result.current.validationState).toEqual({
        errors: {},
        isValidating: false,
        hasErrors: false,
        validationMessages: [],
      });
    });
  });

  describe('Page Validation', () => {
    it('should validate current page successfully', async () => {
      mockModel.currentPage.validate = jest.fn().mockReturnValue(true);
      mockModel.currentPage.hasErrors = false;

      const { result } = renderHook(() => usePageValidation(mockModel));

      await act(async () => {
        const isValid = result.current.validateCurrentPage();
        expect(isValid).toBe(true);
      });

      expect(mockModel.currentPage.validate).toHaveBeenCalledWith(true, false);
    });

    it('should handle validation errors', async () => {
      const mockErrors = [
        { text: 'This field is required' },
      ];
      
      mockModel.currentPage.validate = jest.fn().mockReturnValue(false);
      mockModel.currentPage.hasErrors = true;
      mockModel.currentPage.errors = mockErrors;

      const { result } = renderHook(() => usePageValidation(mockModel));

      await act(async () => {
        const isValid = result.current.validateCurrentPage();
        expect(isValid).toBe(false);
      });

      expect(result.current.validationState.hasErrors).toBe(true);
    });

    it('should fallback to manual validation when validate method fails', async () => {
      mockModel.currentPage.validate = jest.fn().mockImplementation(() => {
        throw new Error('Validation error');
      });

      const { result } = renderHook(() => usePageValidation(mockModel));

      await act(async () => {
        const isValid = result.current.validateCurrentPage();
        expect(isValid).toBe(true); // Should fallback to true on error
      });
    });
  });

  describe('Error Management', () => {
    it('should clear errors for specific question', () => {
      const { result } = renderHook(() => usePageValidation(mockModel));

      // Set initial errors
      act(() => {
        result.current.validationState.errors = {
          question1: ['Error 1'],
          question2: ['Error 2'],
        };
      });

      act(() => {
        result.current.clearErrors('question1');
      });

      expect(result.current.getQuestionErrors('question1')).toEqual([]);
      expect(result.current.getQuestionErrors('question2')).toEqual(['Error 2']);
    });

    it('should clear all errors when no question name provided', () => {
      const { result } = renderHook(() => usePageValidation(mockModel));

      // Set initial errors
      act(() => {
        result.current.validationState.errors = {
          question1: ['Error 1'],
          question2: ['Error 2'],
        };
      });

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.validationState.errors).toEqual({});
      expect(result.current.validationState.hasErrors).toBe(false);
    });

    it('should get question errors correctly', () => {
      const { result } = renderHook(() => usePageValidation(mockModel));

      // Mock validation state with errors
      act(() => {
        result.current.validationState.errors = {
          question1: ['Error 1', 'Error 2'],
        };
      });

      const errors = result.current.getQuestionErrors('question1');
      expect(errors).toEqual(['Error 1', 'Error 2']);

      const noErrors = result.current.getQuestionErrors('nonexistent');
      expect(noErrors).toEqual([]);
    });
  });

  describe('Event Handling', () => {
    it('should register event handlers on model', () => {
      renderHook(() => usePageValidation(mockModel));

      expect(mockModel.onValidateQuestion.add).toHaveBeenCalled();
      expect(mockModel.onValueChanged.add).toHaveBeenCalled();
    });

    it('should handle value change events', () => {
      const { result } = renderHook(() => usePageValidation(mockModel));

      // Simulate value change
      const valueChangedHandler = (mockModel.onValueChanged.add as jest.Mock).mock.calls[0][0];
      
      act(() => {
        valueChangedHandler(mockModel, { name: 'question1' });
      });

      // Should clear errors for the changed question
      expect(result.current.getQuestionErrors('question1')).toEqual([]);
    });

    it('should handle question validation events', () => {
      const mockQuestion = {
        name: 'question1',
        errors: [{ text: 'Validation error' }],
      };
      
      mockModel.getQuestionByName = jest.fn().mockReturnValue(mockQuestion);

      const { result } = renderHook(() => usePageValidation(mockModel));

      // Simulate validation event
      const validateHandler = (mockModel.onValidateQuestion.add as jest.Mock).mock.calls[0][0];
      
      act(() => {
        validateHandler(mockModel, { name: 'question1' });
      });

      expect(result.current.getQuestionErrors('question1')).toEqual(['Validation error']);
    });

    it('should clean up event handlers on unmount', () => {
      const { unmount } = renderHook(() => usePageValidation(mockModel));

      unmount();

      expect(mockModel.onValidateQuestion.remove).toHaveBeenCalled();
      expect(mockModel.onValueChanged.remove).toHaveBeenCalled();
    });
  });

  describe('All Pages Validation', () => {
    it('should validate all pages successfully', () => {
      mockModel.validate = jest.fn().mockReturnValue(true);

      const { result } = renderHook(() => usePageValidation(mockModel));

      act(() => {
        const isValid = result.current.validateAllPages();
        expect(isValid).toBe(true);
      });

      expect(mockModel.validate).toHaveBeenCalled();
    });

    it('should handle validation errors across all pages', () => {
      mockModel.validate = jest.fn().mockReturnValue(false);
      mockModel.hasErrors = jest.fn().mockReturnValue(true);

      const { result } = renderHook(() => usePageValidation(mockModel));

      act(() => {
        const isValid = result.current.validateAllPages();
        expect(isValid).toBe(false);
      });
    });
  });

  describe('Question Validation', () => {
    it('should validate individual question', () => {
      const mockQuestion = {
        name: 'question1',
        value: 'test',
        isRequired: true,
        hasErrors: jest.fn().mockReturnValue(false),
      };

      mockModel.currentPage.getQuestionByName = jest.fn().mockReturnValue(mockQuestion);

      const { result } = renderHook(() => usePageValidation(mockModel));

      act(() => {
        const isValid = result.current.validateQuestion('question1');
        expect(isValid).toBe(true);
      });

      expect(mockModel.currentPage.getQuestionByName).toHaveBeenCalledWith('question1');
    });

    it('should return true for non-existent question', () => {
      mockModel.currentPage.getQuestionByName = jest.fn().mockReturnValue(null);

      const { result } = renderHook(() => usePageValidation(mockModel));

      act(() => {
        const isValid = result.current.validateQuestion('nonexistent');
        expect(isValid).toBe(true);
      });
    });
  });
});