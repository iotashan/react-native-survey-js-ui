import React, { createContext, useContext } from 'react';

/**
 * Context for tracking panel nesting hierarchy
 */
export interface PanelNestingContextValue {
  /**
   * Current nesting level (0 for root panels)
   */
  nestingLevel: number;
  
  /**
   * Path of panel names from root to current panel
   */
  panelPath: string[];
  
  /**
   * Set of panel names in the current render path (for circular reference detection)
   */
  panelNamesInPath: Set<string>;
  
  /**
   * Maximum allowed nesting depth
   */
  maxNestingDepth: number;
}

/**
 * Default context value for root panels
 */
const defaultContextValue: PanelNestingContextValue = {
  nestingLevel: 0,
  panelPath: [],
  panelNamesInPath: new Set(),
  maxNestingDepth: 10,
};

/**
 * React context for panel nesting information
 */
export const PanelNestingContext = createContext<PanelNestingContextValue>(defaultContextValue);

/**
 * Hook to access panel nesting context
 * @returns Current panel nesting context value
 */
export const usePanelNesting = (): PanelNestingContextValue => {
  return useContext(PanelNestingContext);
};

/**
 * Provider component for panel nesting context
 */
export interface PanelNestingProviderProps {
  children: React.ReactNode;
  nestingLevel: number;
  panelPath: string[];
  panelNamesInPath: Set<string>;
  maxNestingDepth?: number;
}

export const PanelNestingProvider: React.FC<PanelNestingProviderProps> = ({
  children,
  nestingLevel,
  panelPath,
  panelNamesInPath,
  maxNestingDepth = 10,
}) => {
  const value: PanelNestingContextValue = {
    nestingLevel,
    panelPath,
    panelNamesInPath,
    maxNestingDepth,
  };

  return (
    <PanelNestingContext.Provider value={value}>
      {children}
    </PanelNestingContext.Provider>
  );
};