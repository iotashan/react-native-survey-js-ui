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

  if (!collapsible) {
    return (
      <View style={[styles.container, style]} testID={testID}>
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
          {renderIcon()}
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      testID={testID}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ expanded: isExpanded }}
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
        {renderIcon()}
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
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
});