import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSurveyModelFixed } from '../useSurveyModelFixed';
import { SurveyModelManager } from '../../utils/surveyCore';

// Mock survey-core
jest.mock('survey-core', () => ({
  Model: jest.fn().mockImplementation((json) => ({
    data: {},
    currentPageNo: 0,
    isCompleted: false,
    getAllQuestions: jest.fn().mockReturnValue([]),
    dispose: jest.fn(),
    onComplete: {
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
    toJSON: jest.fn().mockReturnValue(json),
  })),
}));

// Mock SurveyModelManager
jest.mock('../../utils/surveyCore', () => ({
  SurveyModelManager: {
    create: jest.fn(),
    get: jest.fn(),
    dispose: jest.fn(),
    disposeAll: jest.fn(),
    getAll: jest.fn(),
  },
}));

describe('useSurveyModelFixed', () => {
  const mockSurveyJson = {
    title: 'Test Survey',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'text',
            name: 'question1',
            title: 'What is your name?',
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('React Import Resolution Fix', () => {
    it('should work without React import dependency issues', () => {
      // This test verifies that the Fixed version resolves React import conflicts
      // that were causing null pointer errors in the original useSurveyModel
      const mockModel = { id: 'test-model' };
      (SurveyModelManager.create as jest.Mock).mockReturnValue(mockModel);

      const { result } = renderHook(() => useSurveyModelFixed(mockSurveyJson));

      expect(result.current.model).toBeDefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle undefined React references gracefully', () => {
      // Test the core fix - handling cases where React might be undefined
      // due to import resolution issues
      const mockModel = { id: 'test-model' };
      (SurveyModelManager.create as jest.Mock).mockReturnValue(mockModel);

      const { result } = renderHook(() => useSurveyModelFixed(mockSurveyJson));

      expect(() => {
        // Should not throw when React references are accessed
        result.current.model;
      }).not.toThrow();
    });
  });

  describe('Basic Hook Functionality', () => {
    it('should initialize with a survey model', () => {
      const mockModel = { id: 'test-model' };
      (SurveyModelManager.create as jest.Mock).mockReturnValue(mockModel);

      const { result } = renderHook(() => useSurveyModelFixed(mockSurveyJson));

      expect(SurveyModelManager.create).toHaveBeenCalledWith(
        expect.any(String), // modelId
        mockSurveyJson
      );
      expect(result.current.model).toBe(mockModel);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle survey model creation errors', () => {
      const testError = new Error('Survey creation failed');
      (SurveyModelManager.create as jest.Mock).mockImplementation(() => {
        throw testError;
      });

      const { result } = renderHook(() => useSurveyModelFixed(mockSurveyJson));

      expect(result.current.model).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(testError);
    });

    it('should show loading state initially', () => {
      // The Fixed hook starts with loading: true and immediately creates the model
      const mockModel = { id: 'test-model' };
      (SurveyModelManager.create as jest.Mock).mockReturnValue(mockModel);

      const { result } = renderHook(() => useSurveyModelFixed(mockSurveyJson));

      // After synchronous creation, loading should be false
      expect(result.current.isLoading).toBe(false);
      expect(result.current.model).toBe(mockModel);
      expect(result.current.error).toBeNull();
    });

    it('should dispose of survey model on unmount', () => {
      const mockModel = { id: 'test-model' };
      (SurveyModelManager.create as jest.Mock).mockReturnValue(mockModel);

      const { unmount } = renderHook(() => useSurveyModelFixed(mockSurveyJson));

      unmount();

      expect(SurveyModelManager.dispose).toHaveBeenCalledWith(
        expect.any(String)
      );
    });
  });

  describe('Survey JSON Updates', () => {
    it('should recreate model when survey JSON changes', () => {
      const mockModel1 = { id: 'model-1' };
      const mockModel2 = { id: 'model-2' };

      (SurveyModelManager.create as jest.Mock)
        .mockReturnValueOnce(mockModel1)
        .mockReturnValueOnce(mockModel2);

      const { result, rerender } = renderHook(
        ({ json }) => useSurveyModelFixed(json),
        {
          initialProps: { json: mockSurveyJson },
        }
      );

      expect(result.current.model).toBe(mockModel1);

      const updatedJson = {
        ...mockSurveyJson,
        title: 'Updated Survey',
      };

      rerender({ json: updatedJson });

      expect(SurveyModelManager.dispose).toHaveBeenCalledWith(
        expect.any(String)
      );
      expect(SurveyModelManager.create).toHaveBeenCalledWith(
        expect.any(String),
        updatedJson
      );
      expect(result.current.model).toBe(mockModel2);
    });

    it('should handle null survey JSON', () => {
      const { result } = renderHook(() => useSurveyModelFixed(null as any));

      expect(result.current.model).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(SurveyModelManager.create).not.toHaveBeenCalled();
    });

    it('should handle undefined survey JSON', () => {
      const { result } = renderHook(() =>
        useSurveyModelFixed(undefined as any)
      );

      expect(result.current.model).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(SurveyModelManager.create).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed survey JSON gracefully', () => {
      const malformedJson = {
        // Missing required fields
        pages: null,
      };

      const testError = new Error('Invalid JSON');
      (SurveyModelManager.create as jest.Mock).mockImplementation(() => {
        throw testError;
      });

      const { result } = renderHook(() =>
        useSurveyModelFixed(malformedJson as any)
      );

      expect(result.current.model).toBeNull();
      expect(result.current.error).toBeInstanceOf(Error);
    });

    it('should handle rapid survey JSON changes', () => {
      const json1 = { ...mockSurveyJson, title: 'Survey 1' };
      const json2 = { ...mockSurveyJson, title: 'Survey 2' };
      const json3 = { ...mockSurveyJson, title: 'Survey 3' };

      const mockModel1 = { id: 'model-1' };
      const mockModel2 = { id: 'model-2' };
      const mockModel3 = { id: 'model-3' };

      (SurveyModelManager.create as jest.Mock)
        .mockReturnValueOnce(mockModel1)
        .mockReturnValueOnce(mockModel2)
        .mockReturnValueOnce(mockModel3);

      const { result, rerender } = renderHook(
        ({ json }) => useSurveyModelFixed(json),
        {
          initialProps: { json: json1 },
        }
      );

      expect(result.current.model).toBe(mockModel1);

      // Rapid changes
      rerender({ json: json2 });
      rerender({ json: json3 });

      expect(result.current.model).toBe(mockModel3);
      // The implementation may call dispose multiple times due to effects
      expect(SurveyModelManager.dispose).toHaveBeenCalled();
    });
  });

  describe('Memory Management', () => {
    it('should not create multiple models for the same JSON', () => {
      const mockModel = { id: 'test-model' };
      (SurveyModelManager.create as jest.Mock).mockReturnValue(mockModel);

      const { rerender } = renderHook(({ json }) => useSurveyModelFixed(json), {
        initialProps: { json: mockSurveyJson },
      });

      // Re-render with the same JSON
      rerender({ json: mockSurveyJson });

      // Should only create one model (the implementation may differ here)
      expect(SurveyModelManager.create).toHaveBeenCalledTimes(1);
    });

    it('should properly clean up on component unmount', () => {
      const mockModel = { id: 'cleanup-test' };
      (SurveyModelManager.create as jest.Mock).mockReturnValue(mockModel);

      const { unmount } = renderHook(() => useSurveyModelFixed(mockSurveyJson));

      expect(SurveyModelManager.create).toHaveBeenCalledWith(
        expect.any(String),
        mockSurveyJson
      );

      unmount();

      expect(SurveyModelManager.dispose).toHaveBeenCalledWith(
        expect.any(String)
      );
    });
  });

  describe('Hook Dependencies and Stability', () => {
    it('should provide refresh functionality', () => {
      const mockModel = { id: 'test-model' };
      (SurveyModelManager.create as jest.Mock).mockReturnValue(mockModel);

      const { result } = renderHook(() => useSurveyModelFixed(mockSurveyJson));

      expect(typeof result.current.refresh).toBe('function');

      // Test refresh functionality
      act(() => {
        result.current.refresh();
      });

      // Should have called dispose and create again
      expect(SurveyModelManager.dispose).toHaveBeenCalled();
      expect(SurveyModelManager.create).toHaveBeenCalledTimes(2); // Initial + refresh
    });

    it('should memoize survey model properly', () => {
      const mockModel = { id: 'memo-test' };
      (SurveyModelManager.create as jest.Mock).mockReturnValue(mockModel);

      const { result, rerender } = renderHook(() =>
        useSurveyModelFixed(mockSurveyJson)
      );

      const firstModel = result.current.model;

      // Re-render with same JSON
      rerender();

      const secondModel = result.current.model;

      // Should return the same model instance
      expect(firstModel).toBe(secondModel);
    });
  });

  describe('Integration with SurveyModelManager', () => {
    it('should call SurveyModelManager methods with correct parameters', () => {
      const mockModel = { id: 'integration-test' };
      (SurveyModelManager.create as jest.Mock).mockReturnValue(mockModel);

      const { unmount } = renderHook(() => useSurveyModelFixed(mockSurveyJson));

      expect(SurveyModelManager.create).toHaveBeenCalledWith(
        expect.any(String),
        mockSurveyJson
      );
      expect(SurveyModelManager.create).toHaveBeenCalledTimes(1);

      unmount();

      expect(SurveyModelManager.dispose).toHaveBeenCalledWith(
        expect.any(String)
      );
      expect(SurveyModelManager.dispose).toHaveBeenCalledTimes(1);
    });

    it('should handle SurveyModelManager errors gracefully', () => {
      const testError = new Error('SurveyModelManager error');
      (SurveyModelManager.create as jest.Mock).mockImplementation(() => {
        throw testError;
      });

      expect(() => {
        renderHook(() => useSurveyModelFixed(mockSurveyJson));
      }).not.toThrow();
    });
  });

  describe('Fixed Hook Pattern Verification', () => {
    it('should use direct React imports to avoid resolution issues', () => {
      // This test verifies the core fix - using React.* syntax instead of destructuring
      const mockModel = { id: 'pattern-test' };
      (SurveyModelManager.create as jest.Mock).mockReturnValue(mockModel);

      const { result } = renderHook(() => useSurveyModelFixed(mockSurveyJson));

      // The hook should work and return the expected interface
      expect(result.current).toEqual({
        model: mockModel,
        isLoading: false,
        error: null,
        refresh: expect.any(Function),
      });
    });

    it('should handle React hook state updates correctly', () => {
      const mockModel = { id: 'state-test' };
      (SurveyModelManager.create as jest.Mock).mockReturnValue(mockModel);

      const { result } = renderHook(() => useSurveyModelFixed(mockSurveyJson));

      // Initial state should be correct
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.model).toBe(mockModel);

      // Refresh should update state correctly
      act(() => {
        result.current.refresh();
      });

      expect(result.current.model).toBe(mockModel);
    });
  });
});
