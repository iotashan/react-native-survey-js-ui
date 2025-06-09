export { Panel } from './Panel';
export type { PanelProps } from './Panel';
export { PanelHeader } from './PanelHeader';
export type { PanelHeaderProps } from './PanelHeader';
export { PanelNestingContext, usePanelNesting } from './PanelNestingContext';
export type { PanelNestingContextValue } from './PanelNestingContext';

// Export panel styling utilities
export { 
  panelStyles,
  getPanelContainerStyle,
  getNestedPanelStyle,
  getContentContainerStyle,
  ResponsiveBreakpoints,
  setupOrientationListener,
  removeOrientationListener
} from './panelStyles';

export type {
  PanelTheme,
  SpacingConfig,
  PanelStyleConfig
} from './panelStyles';