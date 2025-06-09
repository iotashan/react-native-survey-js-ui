import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { usePanelState } from '../usePanelState';

describe('usePanelState', () => {
  describe('Basic State Management', () => {
    it('should initialize with default expanded state for all panels', () => {
      const { result } = renderHook(() => usePanelState());
      
      expect(result.current.getPanelState('panel1')).toBe(true);
      expect(result.current.getPanelState('panel2')).toBe(true);
    });

    it('should allow setting default expanded state', () => {
      const { result } = renderHook(() => usePanelState({ defaultExpanded: false }));
      
      expect(result.current.getPanelState('panel1')).toBe(false);
      expect(result.current.getPanelState('panel2')).toBe(false);
    });

    it('should toggle panel state', () => {
      const { result } = renderHook(() => usePanelState());
      
      act(() => {
        result.current.togglePanel('panel1');
      });
      
      expect(result.current.getPanelState('panel1')).toBe(false);
      
      act(() => {
        result.current.togglePanel('panel1');
      });
      
      expect(result.current.getPanelState('panel1')).toBe(true);
    });

    it('should set panel state explicitly', () => {
      const { result } = renderHook(() => usePanelState());
      
      act(() => {
        result.current.setPanelState('panel1', false);
      });
      
      expect(result.current.getPanelState('panel1')).toBe(false);
      
      act(() => {
        result.current.setPanelState('panel1', true);
      });
      
      expect(result.current.getPanelState('panel1')).toBe(true);
    });
  });

  describe('Bulk Operations', () => {
    it('should expand all panels', () => {
      const { result } = renderHook(() => usePanelState({ defaultExpanded: false }));
      
      // Set some panels to collapsed
      act(() => {
        result.current.setPanelState('panel1', false);
        result.current.setPanelState('panel2', false);
        result.current.setPanelState('panel3', false);
      });
      
      // Expand all
      act(() => {
        result.current.expandAll();
      });
      
      expect(result.current.getPanelState('panel1')).toBe(true);
      expect(result.current.getPanelState('panel2')).toBe(true);
      expect(result.current.getPanelState('panel3')).toBe(true);
    });

    it('should collapse all panels', () => {
      const { result } = renderHook(() => usePanelState());
      
      // Set some panels to expanded
      act(() => {
        result.current.setPanelState('panel1', true);
        result.current.setPanelState('panel2', true);
        result.current.setPanelState('panel3', true);
      });
      
      // Collapse all
      act(() => {
        result.current.collapseAll();
      });
      
      expect(result.current.getPanelState('panel1')).toBe(false);
      expect(result.current.getPanelState('panel2')).toBe(false);
      expect(result.current.getPanelState('panel3')).toBe(false);
    });

    it('should get all panel states', () => {
      const { result } = renderHook(() => usePanelState());
      
      act(() => {
        result.current.setPanelState('panel1', true);
        result.current.setPanelState('panel2', false);
        result.current.setPanelState('panel3', true);
      });
      
      const allStates = result.current.getAllPanelStates();
      
      expect(allStates).toEqual({
        panel1: true,
        panel2: false,
        panel3: true,
      });
    });
  });

  describe('Event Callbacks', () => {
    it('should call onPanelToggle callback when panel is toggled', () => {
      const onPanelToggle = jest.fn();
      const { result } = renderHook(() => usePanelState({ onPanelToggle }));
      
      act(() => {
        result.current.togglePanel('panel1');
      });
      
      expect(onPanelToggle).toHaveBeenCalledWith('panel1', false);
      
      act(() => {
        result.current.togglePanel('panel1');
      });
      
      expect(onPanelToggle).toHaveBeenCalledWith('panel1', true);
      expect(onPanelToggle).toHaveBeenCalledTimes(2);
    });

    it('should call onPanelToggle when setting panel state', () => {
      const onPanelToggle = jest.fn();
      const { result } = renderHook(() => usePanelState({ onPanelToggle }));
      
      act(() => {
        result.current.setPanelState('panel1', false);
      });
      
      expect(onPanelToggle).toHaveBeenCalledWith('panel1', false);
    });

    it('should not call onPanelToggle if state does not change', () => {
      const onPanelToggle = jest.fn();
      const { result } = renderHook(() => usePanelState({ onPanelToggle }));
      
      // Set initial state
      act(() => {
        result.current.setPanelState('panel1', true);
      });
      onPanelToggle.mockClear();
      
      // Set same state
      act(() => {
        result.current.setPanelState('panel1', true);
      });
      
      expect(onPanelToggle).not.toHaveBeenCalled();
    });

    it('should call onExpandAll callback', () => {
      const onExpandAll = jest.fn();
      const { result } = renderHook(() => usePanelState({ onExpandAll }));
      
      act(() => {
        result.current.expandAll();
      });
      
      expect(onExpandAll).toHaveBeenCalled();
    });

    it('should call onCollapseAll callback', () => {
      const onCollapseAll = jest.fn();
      const { result } = renderHook(() => usePanelState({ onCollapseAll }));
      
      act(() => {
        result.current.collapseAll();
      });
      
      expect(onCollapseAll).toHaveBeenCalled();
    });
  });

  describe('State Persistence', () => {
    it('should save state to persistence function if provided', () => {
      const saveState = jest.fn();
      const { result } = renderHook(() => usePanelState({ saveState }));
      
      act(() => {
        result.current.setPanelState('panel1', false);
      });
      
      expect(saveState).toHaveBeenCalledWith({
        panel1: false,
      });
    });

    it('should load initial state from persistence function', () => {
      const loadState = jest.fn(() => ({
        panel1: false,
        panel2: true,
        panel3: false,
      }));
      
      const { result } = renderHook(() => usePanelState({ loadState }));
      
      expect(loadState).toHaveBeenCalled();
      expect(result.current.getPanelState('panel1')).toBe(false);
      expect(result.current.getPanelState('panel2')).toBe(true);
      expect(result.current.getPanelState('panel3')).toBe(false);
    });

    it('should clear state', () => {
      const saveState = jest.fn();
      const { result } = renderHook(() => usePanelState({ saveState }));
      
      // Set some state
      act(() => {
        result.current.setPanelState('panel1', false);
        result.current.setPanelState('panel2', true);
      });
      
      // Clear state
      act(() => {
        result.current.clearState();
      });
      
      expect(result.current.getAllPanelStates()).toEqual({});
      expect(saveState).toHaveBeenLastCalledWith({});
    });
  });

  describe('Hierarchical State Management', () => {
    it('should support parent controlling child states', () => {
      const { result } = renderHook(() => usePanelState({ hierarchical: true }));
      
      act(() => {
        // Set parent panel to collapsed
        result.current.setPanelState('parent', false);
        // Try to expand child
        result.current.setPanelState('parent.child', true);
      });
      
      // Child should remain collapsed when parent is collapsed
      expect(result.current.getEffectivePanelState('parent.child', 'parent')).toBe(false);
    });

    it('should allow independent child states when parent is expanded', () => {
      const { result } = renderHook(() => usePanelState({ hierarchical: true }));
      
      act(() => {
        result.current.setPanelState('parent', true);
        result.current.setPanelState('parent.child', false);
      });
      
      expect(result.current.getEffectivePanelState('parent.child', 'parent')).toBe(false);
    });

    it('should collapse all children when parent collapses', () => {
      const { result } = renderHook(() => usePanelState({ 
        hierarchical: true,
        cascadeCollapse: true 
      }));
      
      act(() => {
        // Set up expanded hierarchy
        result.current.setPanelState('parent', true);
        result.current.setPanelState('parent.child1', true);
        result.current.setPanelState('parent.child2', true);
        
        // Collapse parent
        result.current.setPanelState('parent', false);
      });
      
      // Children should be collapsed
      expect(result.current.getPanelState('parent.child1')).toBe(false);
      expect(result.current.getPanelState('parent.child2')).toBe(false);
    });
  });

  describe('Performance', () => {
    it('should batch multiple state updates', () => {
      const onPanelToggle = jest.fn();
      const { result } = renderHook(() => usePanelState({ onPanelToggle }));
      
      act(() => {
        result.current.batchUpdate(() => {
          result.current.setPanelState('panel1', false);
          result.current.setPanelState('panel2', false);
          result.current.setPanelState('panel3', false);
        });
      });
      
      // Should have called the callback for each panel
      expect(onPanelToggle).toHaveBeenCalledWith('panel1', false);
      expect(onPanelToggle).toHaveBeenCalledWith('panel2', false);
      expect(onPanelToggle).toHaveBeenCalledWith('panel3', false);
      expect(onPanelToggle).toHaveBeenCalledTimes(3);
    });

    it('should handle large number of panels efficiently', () => {
      const { result } = renderHook(() => usePanelState());
      
      const startTime = Date.now();
      
      act(() => {
        // Create 1000 panels
        for (let i = 0; i < 1000; i++) {
          result.current.setPanelState(`panel${i}`, i % 2 === 0);
        }
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
      
      // Verify some states
      expect(result.current.getPanelState('panel0')).toBe(true);
      expect(result.current.getPanelState('panel1')).toBe(false);
      expect(result.current.getPanelState('panel999')).toBe(false);
    });
  });
});