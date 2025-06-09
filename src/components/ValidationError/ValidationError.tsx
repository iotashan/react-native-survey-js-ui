import * as React from 'react';
import {
  Text,
  Animated,
  StyleSheet,
  Platform,
  ViewStyle,
  TextStyle,
} from 'react-native';
import type { ValidationError as ValidationErrorType } from '../../hooks/usePageValidation';

export interface ValidationErrorProps {
  /**
   * Array of validation errors to display
   */
  errors?: ValidationErrorType[];
  /**
   * Whether to animate error appearance/disappearance
   */
  animated?: boolean;
  /**
   * Custom container style
   */
  style?: ViewStyle;
  /**
   * Custom text style for error messages
   */
  textStyle?: TextStyle;
  /**
   * Custom accessibility label
   */
  accessibilityLabel?: string;
}

/**
 * Filters out invalid error messages
 */
const filterValidErrors = (errors: ValidationErrorType[] | undefined): ValidationErrorType[] => {
  if (!errors) return [];
  
  return errors.filter(
    error => 
      error &&
      error.message &&
      typeof error.message === 'string' &&
      error.message.trim().length > 0
  );
};

/**
 * Generates accessibility label based on error count
 */
const generateAccessibilityLabel = (errors: ValidationErrorType[]): string => {
  if (errors.length === 0) return '';
  if (errors.length === 1) return `Validation error: ${errors[0]?.message || ''}`;
  return `Validation errors: ${errors.length} errors found`;
};

/**
 * ValidationError component for displaying validation error messages
 * Supports animations, accessibility, and multiple error display
 */
export const ValidationError: React.FC<ValidationErrorProps> = React.memo(({
  errors,
  animated = true,
  style,
  textStyle,
  accessibilityLabel,
}) => {
  const validErrors = filterValidErrors(errors);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Animation effect - must be called before early return
  React.useEffect(() => {
    if (animated && validErrors.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (validErrors.length === 0) {
      fadeAnim.setValue(0);
    }
  }, [fadeAnim, animated, validErrors.length]);

  // Don't render if no valid errors
  if (validErrors.length === 0) {
    return null;
  }

  const defaultAccessibilityLabel = generateAccessibilityLabel(validErrors);

  const containerStyle = [
    styles.container,
    style,
    animated && { opacity: fadeAnim },
  ];

  const renderError = (error: ValidationErrorType, index: number) => (
    <Text
      key={`${error.questionName}-${index}`}
      style={[styles.errorText, textStyle]}
      testID={`validation-error-text-${index}`}
    >
      {error.message}
    </Text>
  );

  return (
    <Animated.View
      style={containerStyle}
      testID="validation-error-container"
      accessibilityRole="alert"
      accessibilityLabel={accessibilityLabel || defaultAccessibilityLabel}
      accessibilityHint="Error message for form field"
    >
      {validErrors.map(renderError)}
    </Animated.View>
  );
});

ValidationError.displayName = 'ValidationError';

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    marginHorizontal: 2,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    lineHeight: 18,
    marginBottom: 2,
    flexWrap: 'wrap',
    ...Platform.select({
      ios: {
        fontWeight: '400',
      },
      android: {
        fontWeight: 'normal',
      },
    }),
  },
});