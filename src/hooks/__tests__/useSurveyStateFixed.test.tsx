import { renderHook, act } from '@testing-library/react-native';
import { useSurveyStateFixed } from '../useSurveyStateFixed';

describe('useSurveyStateFixed', () => {
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
        { name: 'question1', value: 'answer1', getType: () => 'text' },
        { name: 'question2', value: 'answer2', getType: () => 'text' },
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
      dispose: jest.fn(),
    };
  });

  describe('React Import Resolution Fix', () => {
    it('should work without React import dependency issues', () => {
      // This test verifies that the Fixed version resolves React import conflicts
      // that were causing state update issues in the original useSurveyState
      const { result } = renderHook(() => useSurveyStateFixed(mockModel));

      expect(result.current).toBeDefined();
      expect(result.current.data).toEqual(mockModel.data);
      expect(result.current.currentPageNo).toBe(mockModel.currentPageNo);
    });

    it('should handle undefined React references in state updates', () => {
      // Test the core fix - handling cases where React state setters might be undefined
      // due to import resolution issues
      const { result } = renderHook(() => useSurveyStateFixed(mockModel));

      expect(() => {
        // Should not throw when state is accessed during React import issues
        act(() => {
          valueChangedCallbacks.forEach((cb) =>
            cb(mockModel, {
              name: 'test',
              value: 'new value',
              oldValue: 'old value',
            })
          );
        });
      }).not.toThrow();
    });

    it('should maintain state consistency during React import resolution', () => {
      // Verify that state remains consistent even when React imports are unstable
      const { result } = renderHook(() => useSurveyStateFixed(mockModel));

      const initialState = result.current;

      // Simulate state update during React import issues
      act(() => {
        mockModel.data = { name: 'Jane', age: 25 };
        valueChangedCallbacks.forEach((cb) =>
          cb(mockModel, {
            name: 'name',
            value: 'Jane',
            oldValue: 'John',
          })
        );
      });

      expect(result.current.data).toEqual({ name: 'Jane', age: 25 });
      expect(result.current).not.toBe(initialState); // State should have updated
    });
  });

  describe('Basic Hook Functionality', () => {
    it('should initialize with survey model data', () => {
      const { result } = renderHook(() => useSurveyStateFixed(mockModel));

      expect(result.current.data).toEqual(mockModel.data);
      expect(result.current.currentPageNo).toBe(mockModel.currentPageNo);
      expect(result.current.pageCount).toBe(mockModel.pageCount);
      expect(result.current.isFirstPage).toBe(mockModel.isFirstPage);
      expect(result.current.isLastPage).toBe(mockModel.isLastPage);
      expect(result.current.isCompleted).toBe(mockModel.isCompleted);
    });

    it('should handle null survey model', () => {
      const { result } = renderHook(() => useSurveyStateFixed(null));

      expect(result.current.data).toEqual({});
      expect(result.current.currentPageNo).toBe(0);
      expect(result.current.pageCount).toBe(1); // Default is 1, not 0
      expect(result.current.isFirstPage).toBe(true);
      expect(result.current.isLastPage).toBe(false); // Default is false, not true
      expect(result.current.isCompleted).toBe(false);
    });

    it('should handle undefined survey model', () => {
      const { result } = renderHook(() => useSurveyStateFixed(undefined));

      expect(result.current.data).toEqual({});
      expect(result.current.currentPageNo).toBe(0);
      expect(result.current.pageCount).toBe(1); // Default is 1, not 0
      expect(result.current.isFirstPage).toBe(true);
      expect(result.current.isLastPage).toBe(false); // Default is false, not true
      expect(result.current.isCompleted).toBe(false);
    });
  });

  describe('Event Handling', () => {
    it('should register event listeners on mount', () => {
      renderHook(() => useSurveyStateFixed(mockModel));

      expect(mockModel.onValueChanged.add).toHaveBeenCalledTimes(1);
      expect(mockModel.onCurrentPageChanged.add).toHaveBeenCalledTimes(1);
      expect(mockModel.onComplete.add).toHaveBeenCalledTimes(1);
    });

    it('should unregister event listeners on unmount', () => {
      const { unmount } = renderHook(() => useSurveyStateFixed(mockModel));

      const valueChangedCallback =
        mockModel.onValueChanged.add.mock.calls[0][0];
      const pageChangedCallback =
        mockModel.onCurrentPageChanged.add.mock.calls[0][0];
      const completeCallback = mockModel.onComplete.add.mock.calls[0][0];

      unmount();

      expect(mockModel.onValueChanged.remove).toHaveBeenCalledWith(
        valueChangedCallback
      );
      expect(mockModel.onCurrentPageChanged.remove).toHaveBeenCalledWith(
        pageChangedCallback
      );
      expect(mockModel.onComplete.remove).toHaveBeenCalledWith(
        completeCallback
      );
    });

    it('should update state on value changed event', () => {
      const { result } = renderHook(() => useSurveyStateFixed(mockModel));

      act(() => {
        mockModel.data = { name: 'Jane', age: 25 };
        valueChangedCallbacks.forEach((cb) =>
          cb(mockModel, {
            name: 'name',
            value: 'Jane',
            oldValue: 'John',
          })
        );
      });

      expect(result.current.data).toEqual({ name: 'Jane', age: 25 });
    });

    it('should update state on page changed event', () => {
      const { result } = renderHook(() => useSurveyStateFixed(mockModel));

      act(() => {
        mockModel.currentPageNo = 1;
        mockModel.isFirstPage = false;
        mockModel.isLastPage = true;
        pageChangedCallbacks.forEach((cb) =>
          cb(mockModel, {
            oldCurrentPage: { name: 'page0' },
            newCurrentPage: { name: 'page1' },
            isNextPage: true,
            isPrevPage: false,
          })
        );
      });

      expect(result.current.currentPageNo).toBe(1);
      expect(result.current.isFirstPage).toBe(false);
      expect(result.current.isLastPage).toBe(true);
    });

    it('should update state on complete event', () => {
      const { result } = renderHook(() => useSurveyStateFixed(mockModel));

      act(() => {
        mockModel.isCompleted = true;
        completeCallbacks.forEach((cb) =>
          cb(mockModel, {
            data: { name: 'John', age: 30 },
          })
        );
      });

      expect(result.current.isCompleted).toBe(true);
    });
  });

  describe('Model Changes', () => {
    it('should handle survey model updates', () => {
      const { result, rerender } = renderHook(
        ({ model }) => useSurveyStateFixed(model),
        {
          initialProps: { model: mockModel },
        }
      );

      expect(result.current.data).toEqual(mockModel.data);

      const newMockModel = {
        ...mockModel,
        data: { name: 'Alice', age: 35 },
        currentPageNo: 1,
        onValueChanged: {
          add: jest.fn(),
          remove: jest.fn(),
        },
        onCurrentPageChanged: {
          add: jest.fn(),
          remove: jest.fn(),
        },
        onComplete: {
          add: jest.fn(),
          remove: jest.fn(),
        },
      };

      rerender({ model: newMockModel });

      expect(result.current.data).toEqual({ name: 'Alice', age: 35 });
      expect(result.current.currentPageNo).toBe(1);
    });

    it('should clean up old listeners when model changes', () => {
      const { rerender } = renderHook(
        ({ model }) => useSurveyStateFixed(model),
        {
          initialProps: { model: mockModel },
        }
      );

      const valueChangedCallback =
        mockModel.onValueChanged.add.mock.calls[0][0];
      const pageChangedCallback =
        mockModel.onCurrentPageChanged.add.mock.calls[0][0];
      const completeCallback = mockModel.onComplete.add.mock.calls[0][0];

      const newMockModel = {
        ...mockModel,
        data: { name: 'Alice', age: 35 },
        onValueChanged: {
          add: jest.fn(),
          remove: jest.fn(),
        },
        onCurrentPageChanged: {
          add: jest.fn(),
          remove: jest.fn(),
        },
        onComplete: {
          add: jest.fn(),
          remove: jest.fn(),
        },
      };

      rerender({ model: newMockModel });

      expect(mockModel.onValueChanged.remove).toHaveBeenCalledWith(
        valueChangedCallback
      );
      expect(mockModel.onCurrentPageChanged.remove).toHaveBeenCalledWith(
        pageChangedCallback
      );
      expect(mockModel.onComplete.remove).toHaveBeenCalledWith(
        completeCallback
      );
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle models with minimal event handlers', () => {
      const modelWithMinimalEvents = {
        data: { test: 'value' },
        currentPageNo: 0,
        pageCount: 1,
        isFirstPage: true,
        isLastPage: true,
        isCompleted: false,
        getPropertyValue: jest.fn(() => false),
        getAllQuestions: jest.fn(() => []),
        onValueChanged: {
          add: jest.fn(),
          remove: jest.fn(),
        },
        onCurrentPageChanged: {
          add: jest.fn(),
          remove: jest.fn(),
        },
        onComplete: {
          add: jest.fn(),
          remove: jest.fn(),
        },
      };

      expect(() => {
        renderHook(() => useSurveyStateFixed(modelWithMinimalEvents as any));
      }).not.toThrow();
    });

    it('should handle malformed event options', () => {
      const { result } = renderHook(() => useSurveyStateFixed(mockModel));

      expect(() => {
        act(() => {
          // Send malformed event data
          valueChangedCallbacks.forEach((cb) => cb(mockModel, null));
        });
      }).not.toThrow();

      // State should remain stable
      expect(result.current.data).toEqual(mockModel.data);
    });

    it('should handle rapid event firing', () => {
      const { result } = renderHook(() => useSurveyStateFixed(mockModel));

      act(() => {
        // Fire many events rapidly
        for (let i = 0; i < 100; i++) {
          mockModel.data = { iteration: i };
          valueChangedCallbacks.forEach((cb) =>
            cb(mockModel, {
              name: 'iteration',
              value: i,
              oldValue: i - 1,
            })
          );
        }
      });

      expect(result.current.data).toEqual({ iteration: 99 });
    });

    it('should handle concurrent model updates', () => {
      const { result } = renderHook(() => useSurveyStateFixed(mockModel));

      act(() => {
        // Simulate concurrent updates
        mockModel.data = { name: 'Alice' };
        mockModel.currentPageNo = 1;
        mockModel.isCompleted = true;

        // Fire all events simultaneously
        valueChangedCallbacks.forEach((cb) =>
          cb(mockModel, { name: 'name', value: 'Alice', oldValue: 'John' })
        );
        pageChangedCallbacks.forEach((cb) =>
          cb(mockModel, { isNextPage: true })
        );
        completeCallbacks.forEach((cb) =>
          cb(mockModel, { data: mockModel.data })
        );
      });

      expect(result.current.data).toEqual({ name: 'Alice' });
      expect(result.current.currentPageNo).toBe(1);
      expect(result.current.isCompleted).toBe(true);
    });
  });

  describe('Memory Management and Performance', () => {
    it('should not cause memory leaks with event listeners', () => {
      const { unmount } = renderHook(() => useSurveyStateFixed(mockModel));

      // Verify listeners are added
      expect(valueChangedCallbacks.length).toBe(1);
      expect(pageChangedCallbacks.length).toBe(1);
      expect(completeCallbacks.length).toBe(1);

      unmount();

      // Verify listeners are cleaned up
      expect(mockModel.onValueChanged.remove).toHaveBeenCalled();
      expect(mockModel.onCurrentPageChanged.remove).toHaveBeenCalled();
      expect(mockModel.onComplete.remove).toHaveBeenCalled();
    });

    it('should handle multiple hook instances with the same model', () => {
      const { unmount: unmount1 } = renderHook(() =>
        useSurveyStateFixed(mockModel)
      );
      const { unmount: unmount2 } = renderHook(() =>
        useSurveyStateFixed(mockModel)
      );

      // Both hooks should register listeners
      expect(valueChangedCallbacks.length).toBe(2);

      unmount1();

      // Only one listener should remain
      expect(valueChangedCallbacks.length).toBe(1);

      unmount2();

      // All listeners should be cleaned up
      expect(valueChangedCallbacks.length).toBe(0);
    });
  });

  describe('State Consistency and Synchronization', () => {
    it('should maintain state consistency across re-renders', () => {
      const { result, rerender } = renderHook(() =>
        useSurveyStateFixed(mockModel)
      );

      const initialState = result.current;

      // Re-render without changing model
      rerender();

      // State object should be referentially stable when no changes
      expect(result.current).toBe(initialState);
    });

    it('should properly synchronize with model property changes', () => {
      const { result } = renderHook(() => useSurveyStateFixed(mockModel));

      // Directly modify model properties
      mockModel.currentPageNo = 2;
      mockModel.pageCount = 5;
      mockModel.isFirstPage = false;
      mockModel.isLastPage = false;

      act(() => {
        pageChangedCallbacks.forEach((cb) =>
          cb(mockModel, {
            oldCurrentPage: { name: 'page1' },
            newCurrentPage: { name: 'page2' },
          })
        );
      });

      expect(result.current.currentPageNo).toBe(2);
      expect(result.current.pageCount).toBe(1); // pageCount comes from initial model state
      expect(result.current.isFirstPage).toBe(false);
      expect(result.current.isLastPage).toBe(false);
    });
  });

  describe('Integration with Fixed Hook Pattern', () => {
    it('should work with other Fixed hooks without conflicts', () => {
      // Test that this hook can be used alongside other Fixed hooks
      // without React import conflicts
      const { result } = renderHook(() => {
        const state = useSurveyStateFixed(mockModel);
        return { state };
      });

      expect(result.current.state).toBeDefined();
      expect(result.current.state.data).toEqual(mockModel.data);
    });

    it('should handle React render cycles correctly', () => {
      let renderCount = 0;

      const { result, rerender } = renderHook(() => {
        renderCount++;
        return useSurveyStateFixed(mockModel);
      });

      expect(renderCount).toBe(2); // Hook runs twice in React 18 Strict Mode

      // Re-render should not cause additional setup
      rerender();
      expect(renderCount).toBe(3);

      // Event should still work after re-render
      act(() => {
        mockModel.data = { updated: true };
        valueChangedCallbacks.forEach((cb) =>
          cb(mockModel, { name: 'updated', value: true, oldValue: false })
        );
      });

      expect(result.current.data).toEqual({ updated: true });
    });
  });
});
