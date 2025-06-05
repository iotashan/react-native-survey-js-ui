import { renderHook, act } from '@testing-library/react-native';
import { useSurveyState } from '../../hooks/useSurveyState';

describe('useSurveyState', () => {
  let mockModel: any;
  let valueChangedCallbacks: ((sender: any, options: any) => void)[] = [];
  let pageChangedCallbacks: ((sender: any, options: any) => void)[] = [];
  let completeCallbacks: ((sender: any, options: any) => void)[] = [];

  beforeEach(() => {
    valueChangedCallbacks = [];
    pageChangedCallbacks = [];
    completeCallbacks = [];

    mockModel = {
      data: { name: 'John', age: 30 },
      currentPageNo: 0,
      pageCount: 1,
      isFirstPage: true,
      isLastPage: false,
      isCompleted: false,
      getPropertyValue: jest.fn((prop) => {
        if (prop === 'isCompleted') return false;
        return null;
      }),
      getAllQuestions: jest.fn().mockReturnValue([
        { name: 'question1', value: 'answer1' },
        { name: 'question2', value: 'answer2' },
      ]),
      onValueChanged: {
        add: jest.fn((cb) => valueChangedCallbacks.push(cb)),
        remove: jest.fn((cb) => {
          const index = valueChangedCallbacks.indexOf(cb);
          if (index > -1) valueChangedCallbacks.splice(index, 1);
        }),
      },
      onCurrentPageChanged: {
        add: jest.fn((cb) => pageChangedCallbacks.push(cb)),
        remove: jest.fn((cb) => {
          const index = pageChangedCallbacks.indexOf(cb);
          if (index > -1) pageChangedCallbacks.splice(index, 1);
        }),
      },
      onComplete: {
        add: jest.fn((cb) => completeCallbacks.push(cb)),
        remove: jest.fn((cb) => {
          const index = completeCallbacks.indexOf(cb);
          if (index > -1) completeCallbacks.splice(index, 1);
        }),
      },
    };
  });

  it('should return initial survey state', () => {
    const { result } = renderHook(() => useSurveyState(mockModel));

    expect(result.current).toEqual({
      data: { name: 'John', age: 30 },
      currentPageNo: 0,
      pageCount: 1,
      isFirstPage: true,
      isLastPage: false,
      isCompleted: false,
      questions: [
        { name: 'question1', value: 'answer1' },
        { name: 'question2', value: 'answer2' },
      ],
    });
  });

  it('should handle null model', () => {
    const { result } = renderHook(() => useSurveyState(null));

    expect(result.current).toEqual({
      data: {},
      currentPageNo: 0,
      pageCount: 1,
      isFirstPage: true,
      isLastPage: false,
      isCompleted: false,
      questions: [],
    });
  });

  it('should subscribe to value changes', () => {
    const { result } = renderHook(() => useSurveyState(mockModel));

    expect(mockModel.onValueChanged.add).toHaveBeenCalled();

    // Simulate value change
    act(() => {
      mockModel.data = { ...mockModel.data, name: 'Jane' };
      valueChangedCallbacks.forEach((cb) =>
        cb(mockModel, { name: 'name', value: 'Jane' })
      );
    });

    expect(result.current.data).toEqual({ name: 'Jane', age: 30 });
  });

  it('should subscribe to page changes', () => {
    const { result } = renderHook(() => useSurveyState(mockModel));

    expect(mockModel.onCurrentPageChanged.add).toHaveBeenCalled();

    // Simulate page change
    act(() => {
      mockModel.currentPageNo = 1;
      pageChangedCallbacks.forEach((cb) =>
        cb(mockModel, { oldValue: 0, newValue: 1 })
      );
    });

    expect(result.current.currentPageNo).toBe(1);
  });

  it('should subscribe to completion', () => {
    const { result } = renderHook(() => useSurveyState(mockModel));

    expect(mockModel.onComplete.add).toHaveBeenCalled();

    // Simulate completion
    act(() => {
      mockModel.isCompleted = true;
      mockModel.getPropertyValue = jest.fn((prop) => {
        if (prop === 'isCompleted') return true;
        return null;
      });
      completeCallbacks.forEach((cb) => cb(mockModel, {}));
    });

    expect(result.current.isCompleted).toBe(true);
  });

  it('should update questions when values change', () => {
    const { result } = renderHook(() => useSurveyState(mockModel));

    // Update questions mock
    mockModel.getAllQuestions.mockReturnValue([
      { name: 'question1', value: 'updated answer' },
      { name: 'question2', value: 'answer2' },
    ]);

    // Simulate value change
    act(() => {
      valueChangedCallbacks.forEach((cb) =>
        cb(mockModel, { name: 'question1', value: 'updated answer' })
      );
    });

    expect(result.current.questions).toEqual([
      { name: 'question1', value: 'updated answer' },
      { name: 'question2', value: 'answer2' },
    ]);
  });

  it('should cleanup event listeners on unmount', () => {
    const { unmount } = renderHook(() => useSurveyState(mockModel));

    unmount();

    expect(mockModel.onValueChanged.remove).toHaveBeenCalled();
    expect(mockModel.onCurrentPageChanged.remove).toHaveBeenCalled();
    expect(mockModel.onComplete.remove).toHaveBeenCalled();
  });

  it('should handle model change', () => {
    const { result, rerender } = renderHook(
      ({ model }) => useSurveyState(model),
      {
        initialProps: { model: mockModel },
      }
    );

    const newModel = {
      ...mockModel,
      data: { different: 'data' },
      currentPageNo: 2,
      getPropertyValue: jest.fn((prop) => {
        if (prop === 'isCompleted') return false;
        return null;
      }),
    };

    rerender({ model: newModel });

    expect(result.current.data).toEqual({ different: 'data' });
    expect(result.current.currentPageNo).toBe(2);
  });

  it('should remove old listeners when model changes', () => {
    const { rerender } = renderHook(({ model }) => useSurveyState(model), {
      initialProps: { model: mockModel },
    });

    const newModel = {
      ...mockModel,
      onValueChanged: {
        add: jest.fn(),
        remove: jest.fn(),
      },
    };

    rerender({ model: newModel });

    expect(mockModel.onValueChanged.remove).toHaveBeenCalled();
    expect(mockModel.onCurrentPageChanged.remove).toHaveBeenCalled();
    expect(mockModel.onComplete.remove).toHaveBeenCalled();
  });
});
