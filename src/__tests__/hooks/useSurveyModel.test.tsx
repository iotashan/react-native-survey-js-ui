import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSurveyModel } from '../../hooks/useSurveyModel';
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

describe('useSurveyModel', () => {
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

  const mockModel = {
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
    toJSON: jest.fn().mockReturnValue(mockSurveyJson),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (SurveyModelManager.create as jest.Mock).mockReturnValue(mockModel);
  });

  it('should create survey model on mount', () => {
    const { result } = renderHook(() => useSurveyModel(mockSurveyJson));

    expect(SurveyModelManager.create).toHaveBeenCalledWith(
      expect.any(String),
      mockSurveyJson
    );
    expect(result.current.model).toBe(mockModel);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle initialization errors', async () => {
    const error = new Error('Failed to create model');
    (SurveyModelManager.create as jest.Mock).mockImplementationOnce(() => {
      throw error;
    });

    const { result } = renderHook(() => useSurveyModel(mockSurveyJson));

    await waitFor(() => {
      expect(result.current.error).toBe(error);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.model).toBeNull();
    });
  });

  it('should dispose model on unmount', () => {
    const { unmount } = renderHook(() => useSurveyModel(mockSurveyJson));

    unmount();

    expect(SurveyModelManager.dispose).toHaveBeenCalledWith(expect.any(String));
  });

  it('should update model when json changes', () => {
    const { rerender } = renderHook(({ json }) => useSurveyModel(json), {
      initialProps: { json: mockSurveyJson },
    });

    const newJson = { ...mockSurveyJson, title: 'Updated Survey' };

    rerender({ json: newJson });

    expect(SurveyModelManager.dispose).toHaveBeenCalled();
    expect(SurveyModelManager.create).toHaveBeenCalledTimes(2);
    expect(SurveyModelManager.create).toHaveBeenLastCalledWith(
      expect.any(String),
      newJson
    );
  });

  it('should not recreate model if json reference is same', () => {
    const { rerender } = renderHook(() => useSurveyModel(mockSurveyJson));

    rerender();

    expect(SurveyModelManager.create).toHaveBeenCalledTimes(1);
  });

  it('should handle null/undefined json', () => {
    const { result } = renderHook(() => useSurveyModel(null as any));

    expect(result.current.model).toBeNull();
    expect(result.current.error).toBeTruthy();
    expect(SurveyModelManager.create).not.toHaveBeenCalled();
  });

  it('should provide refresh method', async () => {
    const { result } = renderHook(() => useSurveyModel(mockSurveyJson));

    expect(SurveyModelManager.create).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(SurveyModelManager.dispose).toHaveBeenCalled();
      expect(SurveyModelManager.create).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle model id option', () => {
    const customId = 'custom-survey-id';
    renderHook(() => useSurveyModel(mockSurveyJson, { modelId: customId }));

    expect(SurveyModelManager.create).toHaveBeenCalledWith(
      customId,
      mockSurveyJson
    );
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => useSurveyModel(mockSurveyJson));

    // Since our implementation is synchronous, loading should be false after initial render
    expect(result.current.isLoading).toBe(false);
    expect(result.current.model).toBe(mockModel);
  });
});
