import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

export type ProgressIndicatorMode = 'bar' | 'text' | 'percentage' | 'both';

export interface ProgressIndicatorProps {
  /**
   * Current page number (0-based)
   */
  currentPage: number;
  /**
   * Total number of pages
   */
  totalPages: number;
  /**
   * Display mode for the progress indicator
   */
  mode: ProgressIndicatorMode;
  /**
   * Whether the progress indicator is visible
   */
  visible: boolean;
  /**
   * Custom accessibility label
   */
  accessibilityLabel?: string;
  /**
   * Container style
   */
  style?: ViewStyle;
  /**
   * Progress bar style
   */
  barStyle?: ViewStyle;
  /**
   * Progress fill style
   */
  fillStyle?: ViewStyle;
  /**
   * Progress text style
   */
  textStyle?: TextStyle;
}

/**
 * Calculates the progress percentage with bounds checking
 */
const calculateProgress = (currentPage: number, totalPages: number): number => {
  if (totalPages <= 0) return 0;
  if (currentPage < 0) return 0;
  if (currentPage >= totalPages) return 100;
  
  return Math.round(((currentPage + 1) / totalPages) * 100 * 100) / 100; // Round to 2 decimal places
};

/**
 * Formats progress percentage for display
 */
const formatPercentage = (percentage: number): string => {
  return `${Math.round(percentage)}%`;
};

/**
 * Formats page information for display
 */
const formatPageText = (currentPage: number, totalPages: number): string => {
  const displayPage = Math.max(1, Math.min(currentPage + 1, totalPages));
  const displayTotal = Math.max(1, totalPages);
  return `Page ${displayPage} of ${displayTotal}`;
};

/**
 * Progress indicator component with multiple display modes
 * Supports bar, text, percentage, and combined display
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = React.memo(({
  currentPage,
  totalPages,
  mode,
  visible,
  accessibilityLabel,
  style,
  barStyle,
  fillStyle,
  textStyle,
}) => {
  if (!visible) {
    return null;
  }

  const progressPercentage = calculateProgress(currentPage, totalPages);
  const showBar = mode === 'bar' || mode === 'both';
  const showText = mode === 'text' || mode === 'both';
  const showPercentage = mode === 'percentage';

  const defaultAccessibilityLabel = 
    `Survey progress: ${formatPageText(currentPage, totalPages)}, ${formatPercentage(progressPercentage)} complete`;

  const renderProgressBar = () => (
    <View style={[styles.progressBar, barStyle]} testID="progress-bar">
      <View
        style={[
          styles.progressFill,
          fillStyle,
          { width: `${progressPercentage}%` }
        ]}
        testID="progress-fill"
      />
    </View>
  );

  const renderProgressText = () => {
    let textContent: string;
    
    if (showPercentage) {
      textContent = formatPercentage(progressPercentage);
    } else {
      textContent = formatPageText(currentPage, totalPages);
    }

    return (
      <Text style={[styles.progressText, textStyle]} testID="progress-text">
        {textContent}
      </Text>
    );
  };

  return (
    <View
      style={[styles.container, style]}
      testID="progress-indicator"
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: progressPercentage,
      }}
      accessibilityLabel={accessibilityLabel || defaultAccessibilityLabel}
    >
      {showBar && renderProgressBar()}
      {(showText || showPercentage) && renderProgressText()}
    </View>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});