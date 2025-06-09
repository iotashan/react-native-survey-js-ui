import { StyleSheet, Dimensions, ViewStyle } from 'react-native';

// Responsive breakpoint utilities
export class ResponsiveBreakpoints {
  private listeners: Array<() => void> = [];
  private screenWidth: number;

  constructor() {
    this.screenWidth = Dimensions.get('window').width;
  }

  get isSmall(): boolean {
    return this.screenWidth < 375;
  }

  get isMedium(): boolean {
    return this.screenWidth >= 375 && this.screenWidth < 768;
  }

  get isLarge(): boolean {
    return this.screenWidth >= 768;
  }

  addListener(callback: () => void): void {
    this.listeners.push(callback);
  }

  removeListener(callback: () => void): void {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  update(): void {
    this.screenWidth = Dimensions.get('window').width;
    this.listeners.forEach(callback => callback());
  }
}

// Theme configuration interface
export interface PanelTheme {
  primaryColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  shadowColor?: string;
  nestedBorderColor?: string;
}

// Spacing configuration
export interface SpacingConfig {
  small?: number;
  medium?: number;
  large?: number;
}

// Panel style configuration
export interface PanelStyleConfig {
  theme?: PanelTheme;
  spacing?: SpacingConfig;
  isRTL?: boolean;
}

// Default theme values
const defaultTheme: Required<PanelTheme> = {
  primaryColor: '#1976d2',
  backgroundColor: '#ffffff',
  borderColor: '#e0e0e0',
  textColor: '#333333',
  shadowColor: '#000',
  nestedBorderColor: '#e3f2fd',
};

// Default spacing values
const defaultSpacing: Required<SpacingConfig> = {
  small: 8,
  medium: 16,
  large: 24,
};

// Memoization cache for style calculations
const styleCache = new Map<string, ViewStyle[]>();

// Base panel styles
const createPanelStyles = (config?: PanelStyleConfig) => {
  const theme = { ...defaultTheme, ...config?.theme };
  const spacing = { ...defaultSpacing, ...config?.spacing };

  return StyleSheet.create({
    container: {
      marginBottom: spacing.medium,
      borderWidth: 1,
      borderColor: theme.borderColor,
      backgroundColor: theme.backgroundColor,
      borderRadius: 8,
      // Shadow for iOS
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      // Elevation for Android
      elevation: 3,
    },
    contentContainer: {
      paddingHorizontal: spacing.medium,
      paddingVertical: spacing.small * 1.5,
    },
    nestedPanel: {
      // Nested panels have reduced shadow/elevation
      shadowOpacity: 0.05,
      elevation: 1,
      // Slightly different background for visual hierarchy
      backgroundColor: '#fafafa',
    },
    questionSpacing: {
      marginBottom: spacing.small * 1.5,
    },
    hiddenPanel: {
      display: 'none' as 'none',
    },
  });
};

// Export base styles
export const panelStyles = {
  ...createPanelStyles(),
  withTheme: (config: PanelStyleConfig) => createPanelStyles(config),
};

// Get panel container styles based on configuration
export const getPanelContainerStyle = (options: {
  nestingLevel: number;
  customStyle?: ViewStyle;
  isVisible?: boolean;
  config?: PanelStyleConfig;
}): ViewStyle[] => {
  const { nestingLevel, customStyle, isVisible = true, config } = options;
  
  // Check cache
  const cacheKey = `container-${nestingLevel}-${isVisible}-${JSON.stringify(config)}`;
  if (styleCache.has(cacheKey) && !customStyle) {
    return styleCache.get(cacheKey)!;
  }

  const styles = config ? createPanelStyles(config) : panelStyles;
  const result: ViewStyle[] = [styles.container];

  if (nestingLevel > 0) {
    result.push(styles.nestedPanel);
  }

  if (!isVisible) {
    result.push(styles.hiddenPanel);
  }

  if (customStyle) {
    result.push(customStyle);
  }

  // Cache result if no custom style
  if (!customStyle) {
    styleCache.set(cacheKey, result);
  }

  return result;
};

// Get nested panel indentation styles
export const getNestedPanelStyle = (
  nestingLevel: number, 
  config?: PanelStyleConfig
): ViewStyle => {
  const breakpoints = new ResponsiveBreakpoints();
  const spacing = { ...defaultSpacing, ...config?.spacing };
  const theme = { ...defaultTheme, ...config?.theme };
  const isRTL = config?.isRTL || false;

  // Calculate indentation based on screen size
  let indentMultiplier = spacing.medium;
  if (breakpoints.isSmall) {
    indentMultiplier = spacing.small;
  }

  // Cap maximum indentation to prevent excessive nesting
  const maxIndent = spacing.medium * 4;
  const indent = Math.min(nestingLevel * indentMultiplier, maxIndent);

  const style: ViewStyle = {
    marginTop: spacing.small,
    borderLeftWidth: nestingLevel > 0 ? 3 : 0,
    borderLeftColor: theme.nestedBorderColor,
    paddingLeft: nestingLevel > 0 ? spacing.small : 0,
  };

  // Apply indentation to appropriate side based on RTL
  if (isRTL) {
    style.marginRight = indent;
    style.borderRightWidth = style.borderLeftWidth;
    style.borderRightColor = style.borderLeftColor;
    style.paddingRight = style.paddingLeft;
    delete style.borderLeftWidth;
    delete style.borderLeftColor;
    delete style.paddingLeft;
  } else {
    style.marginLeft = indent;
  }

  return style;
};

// Get content container styles
export const getContentContainerStyle = (options: {
  nestingLevel: number;
  isCollapsed?: boolean;
  config?: PanelStyleConfig;
}): ViewStyle => {
  const { nestingLevel, isCollapsed = false, config } = options;
  const spacing = { ...defaultSpacing, ...config?.spacing };
  const styles = config ? createPanelStyles(config) : panelStyles;

  if (isCollapsed) {
    return styles.hiddenPanel;
  }

  // Reduce padding for deeply nested panels
  const paddingReduction = Math.min(nestingLevel * 2, 8);
  
  return {
    ...styles.contentContainer,
    paddingHorizontal: Math.max(spacing.medium - paddingReduction, spacing.small),
    paddingVertical: Math.max((spacing.small * 1.5) - paddingReduction / 2, spacing.small),
  };
};

// Orientation change listener setup
let orientationSubscription: any = null;

export const setupOrientationListener = (callback: () => void): void => {
  if (orientationSubscription) {
    orientationSubscription.remove();
  }
  
  orientationSubscription = Dimensions.addEventListener('change', callback);
};

export const removeOrientationListener = (): void => {
  if (orientationSubscription) {
    orientationSubscription.remove();
    orientationSubscription = null;
  }
};