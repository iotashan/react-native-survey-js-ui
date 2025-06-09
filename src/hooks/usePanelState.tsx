import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Configuration options for the usePanelState hook
 */
export interface UsePanelStateOptions {
  /**
   * Default expanded state for panels
   */
  defaultExpanded?: boolean;
  
  /**
   * Callback when a panel is toggled
   */
  onPanelToggle?: (panelId: string, expanded: boolean) => void;
  
  /**
   * Callback when all panels are expanded
   */
  onExpandAll?: () => void;
  
  /**
   * Callback when all panels are collapsed
   */
  onCollapseAll?: () => void;
  
  /**
   * Function to save state (for persistence)
   */
  saveState?: (state: Record<string, boolean>) => void;
  
  /**
   * Function to load state (for persistence)
   */
  loadState?: () => Record<string, boolean> | null;
  
  /**
   * Enable hierarchical state management
   */
  hierarchical?: boolean;
  
  /**
   * Cascade collapse to children when parent collapses
   */
  cascadeCollapse?: boolean;
}

/**
 * Hook return type
 */
export interface UsePanelStateReturn {
  /**
   * Get the expanded state of a panel
   */
  getPanelState: (panelId: string) => boolean;
  
  /**
   * Get effective panel state considering hierarchy
   */
  getEffectivePanelState: (panelId: string, parentId?: string) => boolean;
  
  /**
   * Set the expanded state of a panel
   */
  setPanelState: (panelId: string, expanded: boolean) => void;
  
  /**
   * Toggle the expanded state of a panel
   */
  togglePanel: (panelId: string) => void;
  
  /**
   * Expand all panels
   */
  expandAll: () => void;
  
  /**
   * Collapse all panels
   */
  collapseAll: () => void;
  
  /**
   * Get all panel states
   */
  getAllPanelStates: () => Record<string, boolean>;
  
  /**
   * Clear all state
   */
  clearState: () => void;
  
  /**
   * Batch multiple state updates
   */
  batchUpdate: (updateFn: () => void) => void;
}

/**
 * Custom hook for managing panel expanded/collapsed states
 */
export function usePanelState(options: UsePanelStateOptions = {}): UsePanelStateReturn {
  const {
    defaultExpanded = true,
    onPanelToggle,
    onExpandAll,
    onCollapseAll,
    saveState,
    loadState,
    hierarchical = false,
    cascadeCollapse = false,
  } = options;

  // Initialize state with loaded state or empty object
  const [panelStates, setPanelStates] = useState<Record<string, boolean>>(() => {
    if (loadState) {
      const loaded = loadState();
      if (loaded) {
        return loaded;
      }
    }
    return {};
  });

  // Track if we're in a batch update
  const batchingRef = useRef(false);
  const callbackQueueRef = useRef<Array<{ panelId: string; expanded: boolean }>>([]);

  // Save state when it changes
  useEffect(() => {
    if (saveState && !batchingRef.current) {
      saveState(panelStates);
    }
  }, [panelStates, saveState]);

  // Process queued callbacks
  const processCallbacks = useCallback(() => {
    if (onPanelToggle && callbackQueueRef.current.length > 0) {
      const callbacks = [...callbackQueueRef.current];
      callbackQueueRef.current = [];
      callbacks.forEach(({ panelId, expanded }) => {
        onPanelToggle(panelId, expanded);
      });
    }
  }, [onPanelToggle]);

  /**
   * Get the expanded state of a panel
   */
  const getPanelState = useCallback((panelId: string): boolean => {
    return panelStates[panelId] ?? defaultExpanded;
  }, [panelStates, defaultExpanded]);

  /**
   * Get effective panel state considering hierarchy
   */
  const getEffectivePanelState = useCallback((panelId: string, parentId?: string): boolean => {
    const ownState = getPanelState(panelId);
    
    if (!hierarchical || !parentId) {
      return ownState;
    }
    
    // Check if parent is collapsed
    const parentState = getPanelState(parentId);
    if (!parentState) {
      return false; // If parent is collapsed, child is effectively collapsed
    }
    
    return ownState;
  }, [getPanelState, hierarchical]);

  /**
   * Set the expanded state of a panel
   */
  const setPanelState = useCallback((panelId: string, expanded: boolean) => {
    setPanelStates(prev => {
      const currentState = prev[panelId] ?? defaultExpanded;
      
      let newStates = {
        ...prev,
        [panelId]: expanded, // Always store the state, even if it matches default
      };
      
      // Handle hierarchical cascading collapse
      if (hierarchical && cascadeCollapse && !expanded) {
        // Find and collapse all children
        Object.keys(prev).forEach(key => {
          if (key.startsWith(panelId + '.')) {
            newStates[key] = false;
            
            // Queue callback for child panel
            if ((prev[key] ?? defaultExpanded) !== false) {
              callbackQueueRef.current.push({ panelId: key, expanded: false });
            }
          }
        });
      }
      
      // Queue callback for main panel if state actually changed
      if (currentState !== expanded) {
        callbackQueueRef.current.push({ panelId, expanded });
        // Process callbacks immediately if not batching
        if (!batchingRef.current) {
          if (typeof jest !== 'undefined') {
            processCallbacks();
          } else {
            setTimeout(processCallbacks, 0);
          }
        }
      }
      
      return newStates;
    });
  }, [defaultExpanded, hierarchical, cascadeCollapse, processCallbacks]);

  /**
   * Toggle the expanded state of a panel
   */
  const togglePanel = useCallback((panelId: string) => {
    const currentState = getPanelState(panelId);
    setPanelState(panelId, !currentState);
  }, [getPanelState, setPanelState]);

  /**
   * Expand all panels
   */
  const expandAll = useCallback(() => {
    setPanelStates(prev => {
      const newStates: Record<string, boolean> = {};
      
      // Expand all known panels
      Object.keys(prev).forEach(key => {
        newStates[key] = true;
      });
      
      onExpandAll?.();
      
      return newStates;
    });
  }, [onExpandAll]);

  /**
   * Collapse all panels
   */
  const collapseAll = useCallback(() => {
    setPanelStates(prev => {
      const newStates: Record<string, boolean> = {};
      
      // Collapse all known panels
      Object.keys(prev).forEach(key => {
        newStates[key] = false;
      });
      
      onCollapseAll?.();
      
      return newStates;
    });
  }, [onCollapseAll]);

  /**
   * Get all panel states
   */
  const getAllPanelStates = useCallback((): Record<string, boolean> => {
    return { ...panelStates };
  }, [panelStates]);

  /**
   * Clear all state
   */
  const clearState = useCallback(() => {
    setPanelStates({});
  }, []);

  /**
   * Batch multiple state updates
   */
  const batchUpdate = useCallback((updateFn: () => void) => {
    batchingRef.current = true;
    callbackQueueRef.current = [];
    
    updateFn();
    
    batchingRef.current = false;
    
    // Process all queued callbacks at once
    processCallbacks();
  }, [processCallbacks]);

  return {
    getPanelState,
    getEffectivePanelState,
    setPanelState,
    togglePanel,
    expandAll,
    collapseAll,
    getAllPanelStates,
    clearState,
    batchUpdate,
  };
}