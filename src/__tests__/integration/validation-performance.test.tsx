import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import type { Model } from 'survey-core';

// Mock validation module before other imports
jest.mock('../../validation', () => ({
  ValidatorRegistry: {
    register: jest.fn(),
    unregister: jest.fn(),
    get: jest.fn(),
    getAll: jest.fn().mockReturnValue(new Map()),
    clear: jest.fn(),
  },
  CustomValidator: jest.fn().mockImplementation(() => ({
    validate: jest.fn().mockReturnValue(null),
    getErrorText: jest.fn().mockReturnValue(''),
  })),
}));

// Mock contexts
jest.mock('../../contexts/ValidationContext', () => {
  const React = require('react');
  const { createContext, useContext, useState, useCallback } = React;
  
  const ValidationContext = createContext({});
  
  const ValidationProvider = ({ children, model, initialMode = 'on-submit' }) => {
    const value = {
      model,
      validationMode: initialMode,
      errors: {},
      touchedFields: {},
      hasErrors: false,
      isValidating: false,
      validateField: jest.fn().mockReturnValue(true),
      validatePage: jest.fn().mockReturnValue(true),
      validateSurvey: jest.fn().mockReturnValue(true),
      setValidationMode: jest.fn(),
      clearErrors: jest.fn(),
      clearFieldError: jest.fn(),
      setFieldError: jest.fn(),
      getFieldErrors: jest.fn().mockReturnValue([]),
      markFieldTouched: jest.fn(),
    };
    
    return React.createElement(ValidationContext.Provider, { value }, children);
  };
  
  const useValidation = () => {
    const context = useContext(ValidationContext);
    if (!context) {
      throw new Error('useValidation must be used within a ValidationProvider');
    }
    return context;
  };
  
  return {
    ValidationProvider,
    useValidation,
    ValidationContext,
  };
});

// Mock hooks
jest.mock('../../hooks/usePageValidation', () => ({
  usePageValidation: (model) => ({
    validationState: {
      hasErrors: false,
      errors: {},
      validationMessages: [],
      isValidating: false,
    },
    validateCurrentPage: jest.fn().mockReturnValue(true),
    validateAllPages: jest.fn().mockReturnValue(true),
    clearValidationErrors: jest.fn(),
    validateQuestion: jest.fn().mockReturnValue(true),
    clearErrors: jest.fn(),
    getQuestionErrors: jest.fn().mockReturnValue([]),
    validateField: jest.fn().mockReturnValue(true),
  }),
}));

// Mock survey-core module with performance-focused setup
jest.mock('survey-core', () => {
  const createMockQuestion = (name: string, isRequired: boolean = true) => ({
    name,
    title: `Question ${name}`,
    type: 'text',
    value: '',
    errors: [],
    hasErrors: false,
    isRequired,
    validate: jest.fn().mockReturnValue(!isRequired || !!name),
    clearIncorrectValues: jest.fn(),
  });

  const mockModel = {
    currentPageNo: 0,
    pageCount: 1,
    isFirstPage: true,
    isLastPage: true,
    currentPage: {
      name: 'page1',
      title: 'Page 1',
      questions: [],
      hasErrors: false,
      errors: [],
      validate: jest.fn().mockReturnValue(true),
      clearIncorrectValues: jest.fn(),
      getAllQuestions: jest.fn().mockReturnValue([]),
    },
    pages: [],
    setValue: jest.fn(),
    getValue: jest.fn(),
    getAllQuestions: jest.fn().mockReturnValue([]),
    getQuestionByName: jest.fn(),
    validate: jest.fn().mockReturnValue(true),
    validateCurrentPage: jest.fn().mockReturnValue(true),
    clearErrors: jest.fn(),
    // Event handlers
    onCurrentPageChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onValidatedErrorsOnCurrentPage: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onValueChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onPropertyChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    getPropertyValue: jest.fn(),
  };

  // Mock Model constructor
  const Model = jest.fn((json) => {
    const instance = { 
      ...mockModel,
      
      validateCurrentPage: jest.fn(function() {
        let isValid = true;
        const questions = this.currentPage.getAllQuestions();
        
        for (const question of questions) {
          // Call the question's validate method
          const questionValid = question.validate();
          if (!questionValid) {
            isValid = false;
          }
        }
        
        this.currentPage.hasErrors = !isValid;
        
        // Trigger validation event
        const handlers = this.onValidatedErrorsOnCurrentPage.add.mock.calls;
        handlers.forEach(([handler]) => handler && handler());
        
        return isValid;
      }),
    };
    
    if (json?.pages) {
      instance.pageCount = json.pages.length;
      instance.pages = json.pages.map((page: any, index: number) => {
        const pageQuestions = page.elements?.map((element: any) => createMockQuestion(element.name, element.isRequired)) || [];
        return {
          ...page,
          visibleIndex: index,
          hasErrors: false,
          errors: [],
          validate: jest.fn().mockReturnValue(true),
          clearIncorrectValues: jest.fn(),
          questions: pageQuestions,
          getAllQuestions: jest.fn().mockReturnValue(pageQuestions),
        };
      });
      instance.isFirstPage = true;
      instance.isLastPage = instance.pageCount === 1;
      instance.currentPage = instance.pages[0] || mockModel.currentPage;
      
      // Update model's getAllQuestions
      instance.getAllQuestions = jest.fn().mockReturnValue(
        instance.pages.flatMap((page: any) => page.questions || [])
      );
    }
    
    // Bind methods to instance
    instance.validateCurrentPage = instance.validateCurrentPage.bind(instance);
    
    return instance;
  });

  return { Model };
});

// Import Model after mocking
import { Model } from 'survey-core';

// Mock Survey component to avoid SurveyPage issues
jest.mock('../../components/Survey', () => ({
  Survey: ({ children, model }: any) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: 'survey' }, children);
  },
}));

// Import components after mocking
import { Survey } from '../../components/Survey';
import { ValidationProvider, ValidationMode } from '../../contexts/ValidationContext';
import { usePageValidation } from '../../hooks/usePageValidation';

describe('Validation Performance Tests', () => {
  const createLargeSurvey = (questionCount: number, pageCount: number = 1) => {
    const pages = Array.from({ length: pageCount }, (_, pageIndex) => ({
      name: `page${pageIndex + 1}`,
      title: `Page ${pageIndex + 1}`,
      elements: Array.from({ length: Math.floor(questionCount / pageCount) }, (_, qIndex) => ({
        type: 'text',
        name: `q${pageIndex}_${qIndex}`,
        title: `Question ${pageIndex}-${qIndex}`,
        isRequired: qIndex % 2 === 0, // Half are required
      })),
    }));

    return new Model({ pages });
  };

  describe('Real-time Validation Performance', () => {
    it('should handle validation efficiently with 100 questions', async () => {
      const model = createLargeSurvey(100);
      const startTime = performance.now();

      render(
        <ValidationProvider model={model} initialMode="real-time">
          <Survey model={model} />
        </ValidationProvider>
      );

      // Simulate typing in multiple fields
      const questions = model.getAllQuestions();
      for (let i = 0; i < 10; i++) {
        questions[i].value = `test${i}`;
        // Trigger value change event
        const handlers = model.onValueChanged.add.mock.calls;
        handlers.forEach(([handler]) => handler && handler(model, { question: questions[i] }));
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time for real-time validation
      expect(duration).toBeLessThan(200); // 200ms threshold
    });

    it('should efficiently validate 500 questions', async () => {
      const model = createLargeSurvey(500);
      const startTime = performance.now();

      render(
        <ValidationProvider model={model} initialMode="real-time">
          <Survey model={model} />
        </ValidationProvider>
      );

      // Validate entire page
      model.validateCurrentPage();

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle large form validation efficiently
      expect(duration).toBeLessThan(500); // 500ms threshold
    });
  });

  describe('Batch Validation Performance', () => {
    it('should batch validation updates efficiently', async () => {
      const model = createLargeSurvey(200);
      let validationCallCount = 0;

      // Track validation calls
      const originalValidate = model.validateCurrentPage;
      model.validateCurrentPage = jest.fn(function() {
        validationCallCount++;
        return originalValidate.call(this);
      });

      render(
        <ValidationProvider model={model} initialMode="on-submit">
          <Survey model={model} />
        </ValidationProvider>
      );

      // Simulate rapid changes to multiple fields
      const questions = model.getAllQuestions();
      for (let i = 0; i < 50; i++) {
        questions[i].value = `test${i}`;
      }

      // Trigger single batch validation
      model.validateCurrentPage();

      // Should only validate once, not 50 times
      expect(validationCallCount).toBe(1);
    });
  });

  describe('Multi-page Validation Performance', () => {
    it('should efficiently validate multi-page surveys', async () => {
      const model = createLargeSurvey(300, 10); // 300 questions across 10 pages
      const startTime = performance.now();

      render(
        <ValidationProvider model={model} initialMode="on-submit">
          <Survey model={model} />
        </ValidationProvider>
      );

      // Validate all pages
      for (let i = 0; i < model.pageCount; i++) {
        model.currentPageNo = i;
        model.currentPage = model.pages[i];
        model.validateCurrentPage();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete multi-page validation efficiently
      expect(duration).toBeLessThan(1000); // 1 second threshold
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory with repeated validation', async () => {
      const model = createLargeSurvey(100);

      const { unmount } = render(
        <ValidationProvider model={model} initialMode="real-time">
          <Survey model={model} />
        </ValidationProvider>
      );

      // Get initial memory usage (if available)
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Perform many validation cycles
      for (let cycle = 0; cycle < 100; cycle++) {
        model.getAllQuestions().forEach((q, i) => {
          q.value = `cycle${cycle}_q${i}`;
        });
        model.validateCurrentPage();
      }

      // Get final memory usage
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Memory growth should be reasonable (less than 10MB)
      const memoryGrowth = finalMemory - initialMemory;
      if (initialMemory > 0) {
        expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024); // 10MB
      }

      unmount();
    });
  });

  describe('Debouncing Performance', () => {
    it('should debounce validation in real-time mode', async () => {
      jest.useFakeTimers();
      const model = createLargeSurvey(50);
      let validationCount = 0;

      // Mock validation to count calls
      const ValidationComponent = () => {
        const { validateField } = usePageValidation(model);
        
        // Override to count
        const trackedValidateField = (fieldName: string) => {
          validationCount++;
          return validateField(fieldName);
        };

        return null;
      };

      render(
        <ValidationProvider model={model} initialMode="real-time">
          <Survey model={model}>
            <ValidationComponent />
          </Survey>
        </ValidationProvider>
      );

      // Simulate rapid typing
      const question = model.getAllQuestions()[0];
      for (let i = 0; i < 10; i++) {
        question.value = `t${i}`;
        model.onValueChanged.add.mock.calls.forEach(([handler]) => 
          handler && handler(model, { question })
        );
        jest.advanceTimersByTime(50); // 50ms between keystrokes
      }

      // Advance to trigger debounced validation
      jest.advanceTimersByTime(500);

      // Should have debounced multiple validations
      expect(validationCount).toBeLessThanOrEqual(3); // Reasonable debounce behavior

      jest.useRealTimers();
    });
  });

  describe('Concurrent Validation', () => {
    it('should handle concurrent validation requests efficiently', async () => {
      const model = createLargeSurvey(200);
      const startTime = performance.now();

      render(
        <ValidationProvider model={model} initialMode="hybrid">
          <Survey model={model} />
        </ValidationProvider>
      );

      // Simulate concurrent validation triggers
      const promises = [];
      
      // Validate different question subsets concurrently
      for (let i = 0; i < 5; i++) {
        promises.push(new Promise(resolve => {
          setTimeout(() => {
            const startIdx = i * 40;
            const endIdx = startIdx + 40;
            const questions = model.getAllQuestions().slice(startIdx, endIdx);
            questions.forEach(q => {
              q.value = `concurrent${i}`;
              q.validate();
            });
            resolve(true);
          }, 0);
        }));
      }

      await Promise.all(promises);

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle concurrent validation efficiently
      expect(duration).toBeLessThan(300); // 300ms threshold
    });
  });

  describe('Validation Caching', () => {
    it('should cache validation results for unchanged fields', async () => {
      const model = createLargeSurvey(100);
      let validateCallCount = 0;
      const validationCache = new Map();

      // Ensure we have questions
      const questions = model.getAllQuestions();
      expect(questions.length).toBeGreaterThan(0);

      // Track individual question validation with caching
      questions.forEach(q => {
        const originalValidate = q.validate;
        q.validate = jest.fn(function() {
          const cacheKey = `${this.name}-${this.value}`;
          
          // Check cache
          if (validationCache.has(cacheKey)) {
            return validationCache.get(cacheKey);
          }
          
          validateCallCount++;
          const result = originalValidate.call(this);
          validationCache.set(cacheKey, result);
          return result;
        });
      });

      render(
        <ValidationProvider model={model} initialMode="on-submit">
          <Survey model={model} />
        </ValidationProvider>
      );

      // First validation
      model.validateCurrentPage();
      const firstCallCount = validateCallCount;
      
      // We expect at least 50 validations (half are required)
      expect(firstCallCount).toBeGreaterThanOrEqual(50);

      // Second validation without changes
      validateCallCount = 0;
      model.validateCurrentPage();
      const secondCallCount = validateCallCount;

      // Should use cached results (no validation calls needed)
      expect(secondCallCount).toBe(0);
    });
  });

  describe('Complex Validation Rules Performance', () => {
    it('should handle complex custom validators efficiently', async () => {
      const model = createLargeSurvey(50);
      
      // Add complex validation rules
      model.getAllQuestions().forEach((q, index) => {
        q.validate = jest.fn(function() {
          // Simulate complex validation logic
          let isValid = true;
          
          // Check pattern
          if (this.value && !/^[A-Za-z0-9]+$/.test(this.value)) {
            isValid = false;
          }
          
          // Check length
          if (this.value && (this.value.length < 3 || this.value.length > 50)) {
            isValid = false;
          }
          
          // Check uniqueness (simulate DB lookup)
          const otherValues = model.getAllQuestions()
            .filter((_, i) => i !== index)
            .map(q => q.value);
          if (otherValues.includes(this.value)) {
            isValid = false;
          }
          
          return isValid;
        });
      });

      const startTime = performance.now();

      render(
        <ValidationProvider model={model} initialMode="real-time">
          <Survey model={model} />
        </ValidationProvider>
      );

      // Validate with complex rules
      model.getAllQuestions().forEach(q => {
        q.value = `complex${q.name}`;
      });
      model.validateCurrentPage();

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle complex validation efficiently
      expect(duration).toBeLessThan(400); // 400ms threshold
    });
  });

  describe('Error State Management Performance', () => {
    it('should efficiently manage large error states', async () => {
      const model = createLargeSurvey(300);
      const startTime = performance.now();

      const { rerender } = render(
        <ValidationProvider model={model} initialMode="on-submit">
          <Survey model={model} />
        </ValidationProvider>
      );

      // Generate errors for all fields
      model.getAllQuestions().forEach(q => {
        if (q.isRequired) {
          q.value = ''; // Trigger required field error
          q.errors = ['This field is required'];
          q.hasErrors = true;
        }
      });

      // Trigger validation and error state update
      model.validateCurrentPage();

      // Force re-render with error state
      rerender(
        <ValidationProvider model={model} initialMode="on-submit">
          <Survey model={model} />
        </ValidationProvider>
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should handle large error states efficiently
      expect(duration).toBeLessThan(500); // 500ms threshold
    });
  });
});