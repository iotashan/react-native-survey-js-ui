import React, { createContext, useContext, ReactNode } from 'react';
import { usePanelState, UsePanelStateOptions, UsePanelStateReturn } from '../../hooks/usePanelState';

/**
 * Context for panel state management
 */
export interface PanelStateContextValue extends UsePanelStateReturn {
  /**
   * Whether state management is enabled
   */
  enabled: boolean;
}

/**
 * Default context value
 */
const defaultContextValue: PanelStateContextValue = {
  enabled: false,
  getPanelState: () => true,
  getEffectivePanelState: () => true,
  setPanelState: () => {},
  togglePanel: () => {},
  expandAll: () => {},
  collapseAll: () => {},
  getAllPanelStates: () => ({}),
  clearState: () => {},
  batchUpdate: () => {},
};

/**
 * React context for panel state
 */
export const PanelStateContext = createContext<PanelStateContextValue>(defaultContextValue);

/**
 * Hook to access panel state context
 */
export const usePanelStateContext = (): PanelStateContextValue => {
  return useContext(PanelStateContext);
};

/**
 * Provider props
 */
export interface PanelStateProviderProps extends UsePanelStateOptions {
  children: ReactNode;
  /**
   * Whether to enable state management (default: true)
   */
  enabled?: boolean;
}

/**
 * Panel state provider component
 */
export const PanelStateProvider: React.FC<PanelStateProviderProps> = ({
  children,
  enabled = true,
  ...options
}) => {
  const panelState = usePanelState(enabled ? options : {});

  const value: PanelStateContextValue = {
    enabled,
    ...panelState,
  };

  return (
    <PanelStateContext.Provider value={value}>
      {children}
    </PanelStateContext.Provider>
  );
};

/**
 * HOC to provide panel state management
 */
export function withPanelState<P extends object>(
  Component: React.ComponentType<P>,
  options?: UsePanelStateOptions
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <PanelStateProvider {...options}>
      <Component {...props} ref={ref} />
    </PanelStateProvider>
  ));

  WrappedComponent.displayName = `withPanelState(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}