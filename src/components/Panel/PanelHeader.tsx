import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  AccessibilityInfo,
} from 'react-native';
import { PanelErrorIndicator } from './PanelErrorIndicator';

export interface PanelHeaderProps {
  title: string;
  description?: string;
  collapsible?: boolean;
  expanded?: boolean;
  initialExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  testID?: string;
  showIcon?: boolean;
  expandIcon?: React.ReactElement;
  collapseIcon?: React.ReactElement;
  /**
   * Number of validation errors in the panel
   */
  errorCount?: number;
  /**
   * Whether the panel has validation errors
   */
  hasErrors?: boolean;
  /**
   * Style for the error state
   */
  errorStyle?: ViewStyle;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({
  title,
  description,
  collapsible = false,
  expanded,
  initialExpanded = true,
  onToggle,
  style,
  titleStyle,
  descriptionStyle,
  testID = 'panel-header',
  showIcon = true,
  expandIcon,
  collapseIcon,
  errorCount = 0,
  hasErrors = false,
  errorStyle,
}) => {
  // Determine if component is controlled or uncontrolled
  const isControlled = expanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState(initialExpanded);
  const isExpanded = isControlled ? expanded : internalExpanded;

  // Animation value for icon rotation
  const rotateAnim = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  // Check for reduce motion preference
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then(setReduceMotion)
      .catch(() => setReduceMotion(false));
  }, []);

  // Animate icon when expanded state changes
  useEffect(() => {
    const duration = reduceMotion ? 0 : 300;
    
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration,
      useNativeDriver: true,
    }).start();
  }, [isExpanded, rotateAnim, reduceMotion]);

  const handlePress = () => {
    if (!collapsible) return;

    const newExpanded = !isExpanded;
    
    if (!isControlled) {
      setInternalExpanded(newExpanded);
    }
    
    onToggle?.(newExpanded);
  };

  const renderIcon = () => {
    if (!collapsible || !showIcon) return null;

    const spin = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    if (expandIcon && collapseIcon) {
      return isExpanded ? collapseIcon : expandIcon;
    }

    return (
      <Animated.Text
        style={[
          styles.defaultIcon,
          { transform: [{ rotate: spin }] },
        ]}
        testID={`${testID}-icon`}
      >
        ▼
      </Animated.Text>
    );
  };

  const accessibilityHint = isExpanded
    ? 'Double tap to collapse panel'
    : 'Double tap to expand panel';

  // Determine container styles based on error state
  const containerStyles = [
    styles.container,
    hasErrors && styles.containerError,
    hasErrors && errorStyle,
    style,
  ];

  // Create accessibility state
  const accessibilityState = collapsible 
    ? { expanded: isExpanded, invalid: hasErrors }
    : { invalid: hasErrors };

  // Create accessibility value for error count
  const accessibilityValue = hasErrors && errorCount > 0
    ? { text: `${errorCount} error${errorCount === 1 ? '' : 's'}` }
    : undefined;

  const renderErrorIndicator = () => {
    if (!hasErrors || errorCount <= 0) return null;
    
    return (
      <PanelErrorIndicator
        errorCount={errorCount}
        testID={`${testID}-error-indicator`}
        style={styles.errorIndicator}
      />
    );
  };

  if (!collapsible) {
    return (
      <View 
        style={containerStyles} 
        testID={testID}
        accessibilityState={accessibilityState}
        accessibilityValue={accessibilityValue}
      >
        <View style={styles.headerContent}>
          <View style={styles.textContainer}>
            <Text 
              style={[styles.title, titleStyle]} 
              testID={`${testID}-title`}
            >
              {title}
            </Text>
            {description && (
              <Text 
                style={[styles.description, descriptionStyle]}
                testID={`${testID}-description`}
              >
                {description}
              </Text>
            )}
          </View>
          <View style={styles.rightContent}>
            {renderErrorIndicator()}
            {renderIcon()}
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={containerStyles}
      testID={testID}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      accessibilityValue={accessibilityValue}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={`${title} panel header`}
    >
      <View style={styles.headerContent}>
        <View style={styles.textContainer}>
          <Text 
            style={[styles.title, titleStyle]} 
            testID={`${testID}-title`}
          >
            {title}
          </Text>
          {description && (
            <Text 
              style={[styles.description, descriptionStyle]}
              testID={`${testID}-description`}
            >
              {description}
            </Text>
          )}
        </View>
        <View style={styles.rightContent}>
          {renderErrorIndicator()}
          {renderIcon()}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  containerError: {
    borderColor: '#d32f2f',
    borderWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  defaultIcon: {
    fontSize: 18,
    color: '#666',
  },
  errorIndicator: {
    marginRight: 8,
  },
});