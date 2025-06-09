import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import type { SubmissionStatus as SubmissionStatusType, SubmissionResult } from '../../types';

export interface SubmissionStatusProps {
  /** Current submission status */
  status: SubmissionStatusType;
  /** Last submission result */
  lastResult?: SubmissionResult | null;
  /** Retry count for failed submissions */
  retryCount?: number;
  /** Whether to show the status indicator */
  visible?: boolean;
  /** Callback when retry button is pressed */
  onRetry?: () => void;
  /** Custom style for the container */
  style?: any;
}

/**
 * Component to display submission status with visual feedback
 */
export const SubmissionStatus: React.FC<SubmissionStatusProps> = ({
  status,
  lastResult,
  retryCount = 0,
  visible = true,
  onRetry,
  style,
}) => {
  if (!visible) {
    return null;
  }

  const getStatusConfig = (): any => {
    switch (status) {
      case 'idle':
        return null; // Don't show anything for idle state
      
      case 'pending':
        return {
          color: '#2196F3',
          backgroundColor: '#E3F2FD',
          icon: <ActivityIndicator size="small" color="#2196F3" />,
          text: 'Saving...',
          showRetry: false,
        };
      
      case 'success':
        return {
          color: '#4CAF50',
          backgroundColor: '#E8F5E8',
          icon: '✓',
          text: 'Saved successfully',
          showRetry: false,
        };
      
      case 'error':
        return {
          color: '#F44336',
          backgroundColor: '#FFEBEE',
          icon: '✗',
          text: lastResult?.error?.message || 'Save failed',
          showRetry: true,
        };
      
      case 'retrying':
        return {
          color: '#FF9800',
          backgroundColor: '#FFF3E0',
          icon: <ActivityIndicator size="small" color="#FF9800" />,
          text: `Retrying... (${retryCount})`,
          showRetry: false,
        };
      
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  
  if (!config) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor }, style]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {typeof config.icon === 'string' ? (
            <Text style={[styles.iconText, { color: config.color }]}>
              {config.icon}
            </Text>
          ) : (
            config.icon
          )}
        </View>
        
        <Text style={[styles.text, { color: config.color }]}>
          {config.text}
        </Text>
        
        {config.showRetry && onRetry && (
          <TouchableOpacity
            style={[styles.retryButton, { borderColor: config.color }]}
            onPress={onRetry}
            testID="submission-retry-button"
          >
            <Text style={[styles.retryText, { color: config.color }]}>
              Retry
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginVertical: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 8,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
  },
});