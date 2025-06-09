import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import type { NavigationState } from '../../hooks/usePageNavigation';
import type { ValidationState } from '../../hooks/usePageValidation';

export interface PageNavigationProps {
  /**
   * Navigation state from usePageNavigation hook
   */
  navigationState: NavigationState;
  /**
   * Called when Next button is pressed
   */
  onNext: () => void;
  /**
   * Called when Previous button is pressed
   */
  onPrevious: () => void;
  /**
   * Called when Complete button is pressed
   */
  onComplete: () => void;
  /**
   * Validation state from usePageValidation hook
   */
  validationState?: ValidationState;
  /**
   * Custom text for Next button
   */
  nextText?: string;
  /**
   * Custom text for Previous button
   */
  previousText?: string;
  /**
   * Custom text for Complete button
   */
  completeText?: string;
  /**
   * Container style
   */
  style?: ViewStyle;
  /**
   * Button style
   */
  buttonStyle?: ViewStyle;
  /**
   * Button text style
   */
  buttonTextStyle?: TextStyle;
  /**
   * Disabled button style
   */
  disabledButtonStyle?: ViewStyle;
  /**
   * Disabled button text style
   */
  disabledButtonTextStyle?: TextStyle;
}

/**
 * Page navigation component with Previous, Next, and Complete buttons
 * Handles button visibility, disabled states, and loading indicators
 */
export const PageNavigation: React.FC<PageNavigationProps> = ({
  navigationState,
  onNext,
  onPrevious,
  onComplete,
  validationState,
  nextText = 'Next',
  previousText = 'Previous',
  completeText = 'Complete',
  style,
  buttonStyle,
  buttonTextStyle,
  disabledButtonStyle,
  disabledButtonTextStyle,
}) => {
  const {
    isFirstPage,
    isLastPage,
    canGoNext,
    canGoPrevious,
    isNavigating,
    validationError,
  } = navigationState;

  const showPrevious = !isFirstPage;
  const showNext = !isLastPage;
  const showComplete = isLastPage;

  const renderButton = (
    text: string,
    onPress: () => void,
    disabled: boolean,
    accessibilityLabel: string,
    isPrimary: boolean = false
  ) => {
    const isDisabled = disabled || isNavigating;

    return (
      <TouchableOpacity
        style={[
          styles.button,
          isPrimary && styles.primaryButton,
          buttonStyle,
          isDisabled && styles.disabledButton,
          isDisabled && disabledButtonStyle,
        ]}
        onPress={isDisabled ? undefined : onPress}
        disabled={isDisabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: isDisabled }}
      >
        <Text
          style={[
            styles.buttonText,
            isPrimary && styles.primaryButtonText,
            buttonTextStyle,
            isDisabled && styles.disabledButtonText,
            isDisabled && disabledButtonTextStyle,
          ]}
        >
          {text}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[styles.container, style]}
      testID="page-navigation"
      accessibilityRole="toolbar"
    >
      {isNavigating && (
        <View style={styles.loadingContainer} testID="navigation-loading">
          <ActivityIndicator size="small" color="#2196F3" />
        </View>
      )}

      {validationError && (
        <View style={styles.errorContainer} testID="validation-error">
          <Text style={styles.errorText}>{validationError}</Text>
        </View>
      )}

      {validationState?.hasErrors && (
        <View style={styles.errorContainer} testID="page-validation-errors">
          <Text style={styles.errorText}>Please fix the following errors:</Text>
          {Object.entries(validationState.errors).map(([questionName, errors]) => (
            <View key={questionName} style={styles.questionErrorContainer}>
              {errors.map((error, index) => (
                <Text key={index} style={styles.errorText}>• {error}</Text>
              ))}
            </View>
          ))}
        </View>
      )}

      <View style={styles.buttonContainer}>
        {showPrevious &&
          renderButton(
            previousText,
            onPrevious,
            !canGoPrevious,
            'Go to previous page'
          )}

        {showNext &&
          renderButton(
            nextText,
            onNext,
            !canGoNext,
            'Go to next page',
            true
          )}

        {showComplete &&
          renderButton(
            completeText,
            onComplete,
            !canGoNext,
            'Complete survey',
            true
          )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  primaryButtonText: {
    color: '#fff',
  },
  disabledButtonText: {
    color: '#999',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    right: 16,
    height: '100%',
    justifyContent: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 12,
    marginBottom: 12,
    borderRadius: 4,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  questionErrorContainer: {
    marginTop: 4,
  },
});