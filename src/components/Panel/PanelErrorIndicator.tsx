import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  AccessibilityInfo,
} from 'react-native';

export interface PanelErrorIndicatorTheme {
  errorColor?: string;
  errorTextColor?: string;
}

export interface PanelErrorIndicatorProps {
  /**
   * Number of errors to display
   */
  errorCount: number;
  
  /**
   * Whether to animate the appearance/disappearance
   */
  animated?: boolean;
  
  /**
   * Custom container style
   */
  style?: ViewStyle;
  
  /**
   * Custom text style
   */
  textStyle?: TextStyle;
  
  /**
   * Test ID for testing
   */
  testID?: string;
  
  /**
   * Custom accessibility label
   */
  accessibilityLabel?: string;
  
  /**
   * Live region priority for screen reader announcements
   */
  liveRegion?: 'none' | 'polite' | 'assertive';
  
  /**
   * Theme configuration
   */
  theme?: PanelErrorIndicatorTheme;
}

/**
 * Component to display error count indicator for panels
 * Shows a badge with the number of validation errors
 */
export const PanelErrorIndicator: React.FC<PanelErrorIndicatorProps> = ({
  errorCount,
  animated = true,
  style,
  textStyle,
  testID = 'panel-error-indicator',
  accessibilityLabel,
  liveRegion = 'polite',
  theme,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const prevCountRef = useRef(errorCount);
  
  // Don't render if no errors
  if (errorCount <= 0) {
    return null;
  }
  
  // Animation effect
  useEffect(() => {
    if (animated) {
      // Fade in animation
      const animations = Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]);
      
      // Handle test environment where start might not exist
      if (animations && typeof animations.start === 'function') {
        animations.start();
      }
    } else {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
    }
  }, [animated, fadeAnim, scaleAnim]);
  
  // Pulse animation when count changes
  useEffect(() => {
    if (animated && prevCountRef.current !== errorCount && prevCountRef.current > 0) {
      const sequence = Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]);
      
      // Handle test environment where start might not exist
      if (sequence.start) {
        sequence.start();
      }
    }
    prevCountRef.current = errorCount;
  }, [errorCount, animated, scaleAnim]);
  
  // Format error count display
  const displayCount = errorCount > 99 ? '99+' : String(errorCount);
  
  // Generate accessibility label
  const defaultAccessibilityLabel = errorCount === 1 
    ? '1 validation error' 
    : `${errorCount} validation errors`;
  
  // Apply theme
  const backgroundColor = theme?.errorColor || '#d32f2f';
  const color = theme?.errorTextColor || '#ffffff';
  
  const containerStyle: Animated.AnimatedProps<ViewStyle> = [
    styles.container,
    { backgroundColor },
    style,
    animated && {
      opacity: fadeAnim,
      transform: [{ scale: scaleAnim }],
    },
  ];
  
  const errorTextStyle = [
    styles.errorText,
    { color },
    textStyle,
  ];
  
  return (
    <Animated.View
      style={containerStyle}
      testID={testID}
      accessibilityRole="alert"
      accessibilityLabel={accessibilityLabel || defaultAccessibilityLabel}
      accessibilityLiveRegion={liveRegion}
    >
      <Text style={errorTextStyle} testID={`${testID}-count`}>
        {displayCount}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#d32f2f',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});