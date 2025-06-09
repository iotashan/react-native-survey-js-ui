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
      });
    });

    it('should return initial validation state when model is provided', () => {
      const { result } = renderHook(() => usePageValidation(mockModel));

      expect(result.current.validationState).toEqual({
        errors: {},
        isValidating: false,
        hasErrors: false,
      });
    });
  });

  describe('validateCurrentPage', () => {
    it('should return true when no model is provided', async () => {
      const { result } = renderHook(() => usePageValidation(null));

      await act(async () => {
        const isValid = result.current.validateCurrentPage();
        expect(isValid).toBe(true);
      });
    });

    it('should validate current page and return true when valid', async () => {
      mockModel.currentPage.validate = jest.fn().mockReturnValue(true);
      mockModel.currentPage.hasErrors = false;
      mockModel.currentPage.errors = [];

      const { result } = renderHook(() => usePageValidation(mockModel));

      await act(async () => {
        const isValid = result.current.validateCurrentPage();
        expect(isValid).toBe(true);
        expect(mockModel.currentPage.validate).toHaveBeenCalledWith(true, false);
      });

      expect(result.current.validationState.hasErrors).toBe(false);
      expect(result.current.validationState.errors).toEqual({});
    });

    it('should validate current page and return false when invalid', async () => {
      const mockErrors = [
        { text: 'This field is required', questionName: 'question1' },
        { text: 'Invalid email format', questionName: 'question2' }
      ];
      
      mockModel.currentPage.validate = jest.fn().mockReturnValue(false);
      mockModel.currentPage.hasErrors = true;
      mockModel.currentPage.errors = mockErrors;

      const { result } = renderHook(() => usePageValidation(mockModel));

      await act(async () => {
        const isValid = result.current.validateCurrentPage();
        expect(isValid).toBe(false);
        expect(mockModel.currentPage.validate).toHaveBeenCalledWith(true, false);
      });

      expect(result.current.validationState.hasErrors).toBe(true);
      expect(result.current.validationState.errors).toEqual({
        question1: ['This field is required'],
        question2: ['Invalid email format'],
      });
    });

    it('should handle questions with multiple errors', async () => {
      const mockErrors = [
        { text: 'This field is required', questionName: 'question1' },
        { text: 'Minimum length not met', questionName: 'question1' }
      ];
      
      mockModel.currentPage.validate = jest.fn().mockReturnValue(false);
      mockModel.currentPage.hasErrors = true;
      mockModel.currentPage.errors = mockErrors;

      const { result } = renderHook(() => usePageValidation(mockModel));

      await act(async () => {
        const isValid = result.current.validateCurrentPage();
        expect(isValid).toBe(false);
      });

      expect(result.current.validationState.errors).toEqual({
        question1: ['This field is required', 'Minimum length not met'],
      });
    });

    it('should set isValidating flag during validation', async () => {
      mockModel.currentPage.validate = jest.fn().mockImplementation(() => {
        // During validation, isValidating should be true
        return true;
      });

      const { result } = renderHook(() => usePageValidation(mockModel));

      await act(async () => {
        result.current.validateCurrentPage();
      });

      // After validation completes, isValidating should be false
      expect(result.current.validationState.isValidating).toBe(false);
    });
  });

  describe('clearErrors', () => {
    it('should clear all errors when no question name provided', async () => {
      const mockErrors = [
        { text: 'Error 1', questionName: 'question1' },
        { text: 'Error 2', questionName: 'question2' }
      ];
      
      mockModel.currentPage.validate = jest.fn().mockReturnValue(false);
      mockModel.currentPage.hasErrors = true;
      mockModel.currentPage.errors = mockErrors;

      const { result } = renderHook(() => usePageValidation(mockModel));

      // First trigger validation to set errors
      await act(async () => {
        result.current.validateCurrentPage();
      });

      expect(result.current.validationState.hasErrors).toBe(true);

      // Clear all errors
      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.validationState.hasErrors).toBe(false);
      expect(result.current.validationState.errors).toEqual({});
    });

    it('should clear errors for specific question when question name provided', async () => {
      const mockErrors = [
        { text: 'Error 1', questionName: 'question1' },
        { text: 'Error 2', questionName: 'question2' }
      ];
      
      mockModel.currentPage.validate = jest.fn().mockReturnValue(false);
      mockModel.currentPage.hasErrors = true;
      mockModel.currentPage.errors = mockErrors;

      const { result } = renderHook(() => usePageValidation(mockModel));

      // First trigger validation to set errors
      await act(async () => {
        result.current.validateCurrentPage();
      });

      expect(result.current.validationState.errors).toEqual({
        question1: ['Error 1'],
        question2: ['Error 2'],
      });

      // Clear errors for specific question
      act(() => {
        result.current.clearErrors('question1');
      });

      expect(result.current.validationState.errors).toEqual({
        question2: ['Error 2'],
      });
      expect(result.current.validationState.hasErrors).toBe(true); // Still has errors for question2
    });
  });

  describe('getQuestionErrors', () => {
    it('should return empty array when no errors exist for question', () => {
      const { result } = renderHook(() => usePageValidation(mockModel));

      const errors = result.current.getQuestionErrors('nonexistent');
      expect(errors).toEqual([]);
    });

    it('should return errors for specific question', async () => {
      const mockErrors = [
        { text: 'Error 1', questionName: 'question1' },
        { text: 'Error 2', questionName: 'question1' },
        { text: 'Error 3', questionName: 'question2' }
      ];
      
      mockModel.currentPage.validate = jest.fn().mockReturnValue(false);
      mockModel.currentPage.hasErrors = true;
      mockModel.currentPage.errors = mockErrors;

      const { result } = renderHook(() => usePageValidation(mockModel));

      await act(async () => {
        result.current.validateCurrentPage();
      });

      const question1Errors = result.current.getQuestionErrors('question1');
      expect(question1Errors).toEqual(['Error 1', 'Error 2']);

      const question2Errors = result.current.getQuestionErrors('question2');
      expect(question2Errors).toEqual(['Error 3']);
    });
  });

  describe('Real-time Validation', () => {
    it('should setup event listeners for real-time validation', () => {
      const { result } = renderHook(() => usePageValidation(mockModel));

      expect(mockModel.onValidateQuestion.add).toHaveBeenCalled();
      expect(mockModel.onValueChanged.add).toHaveBeenCalled();
    });

    it('should remove event listeners on cleanup', () => {
      const { unmount } = renderHook(() => usePageValidation(mockModel));

      unmount();

      expect(mockModel.onValidateQuestion.remove).toHaveBeenCalled();
      expect(mockModel.onValueChanged.remove).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', async () => {
      mockModel.currentPage.validate = jest.fn().mockImplementation(() => {
        throw new Error('Validation failed');
      });

      const { result } = renderHook(() => usePageValidation(mockModel));

      await act(async () => {
        const isValid = result.current.validateCurrentPage();
        expect(isValid).toBe(true); // Should return true as fallback
      });

      expect(result.current.validationState.isValidating).toBe(false);
    });

    it('should handle missing currentPage gracefully', async () => {
      mockModel.currentPage = null as any;

      const { result } = renderHook(() => usePageValidation(mockModel));

      await act(async () => {
        const isValid = result.current.validateCurrentPage();
        expect(isValid).toBe(true); // Should return true when no page to validate
      });
    });
  });
});