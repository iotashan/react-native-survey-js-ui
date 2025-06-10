import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import type { Model } from 'survey-core';

export interface NavigationConfig {
  showProgressBar?: string;
  progressBarType?: string;
  checkErrorsMode?: string;
  showNavigationButtons?: string;
  showTimerPanel?: string;
}

export interface NavigationPlaygroundProps {
  survey: Model;
  onConfigChange: (config: NavigationConfig) => void;
}

interface NavigationEvent {
  timestamp: string;
  type: string;
  details: any;
}

export const NavigationPlayground: React.FC<NavigationPlaygroundProps> = ({
  survey,
  onConfigChange,
}) => {
  const [navigationState, setNavigationState] = useState({
    currentPageNo: survey.currentPageNo || 0,
    pageCount: survey.pageCount || 0,
    visiblePageCount: survey.visiblePageCount || 0,
    isFirstPage: survey.isFirstPage,
    isLastPage: survey.isLastPage,
    isCompleted: survey.state === 'completed',
    currentPageName: survey.currentPage?.name || '',
    currentPageTitle: survey.currentPage?.title || '',
  });

  const [validationState, setValidationState] = useState({
    hasErrors: false,
    errorCount: 0,
    errors: {} as Record<string, string[]>,
  });

  const [events, setEvents] = useState<NavigationEvent[]>([]);
  
  // Configuration state
  const [showProgress, setShowProgress] = useState(survey.showProgressBar !== 'off');
  const [progressPosition, setProgressPosition] = useState(survey.showProgressBar || 'top');
  const [validationMode, setValidationMode] = useState(survey.checkErrorsMode || 'onNextPage');
  const [buttonPosition, setButtonPosition] = useState(survey.showNavigationButtons || 'bottom');

  // Add event to history
  const addEvent = useCallback((type: string, details: any) => {
    setEvents((prev) => [
      {
        timestamp: new Date().toLocaleTimeString(),
        type,
        details,
      },
      ...prev.slice(0, 9), // Keep last 10 events
    ]);
  }, []);

  // Update navigation state
  const updateNavigationState = useCallback(() => {
    setNavigationState({
      currentPageNo: survey.currentPageNo || 0,
      pageCount: survey.pageCount || 0,
      visiblePageCount: survey.visiblePageCount || 0,
      isFirstPage: survey.isFirstPage,
      isLastPage: survey.isLastPage,
      isCompleted: survey.state === 'completed',
      currentPageName: survey.currentPage?.name || '',
      currentPageTitle: survey.currentPage?.title || '',
    });

    // Update validation state
    const errors: Record<string, string[]> = {};
    let errorCount = 0;

    if (survey.currentPage) {
      survey.currentPage.questions.forEach((question) => {
        if (question.errors && question.errors.length > 0) {
          errors[question.name] = question.errors.map((e) => e.getText());
          errorCount += question.errors.length;
        }
      });
    }

    setValidationState({
      hasErrors: errorCount > 0,
      errorCount,
      errors,
    });
  }, [survey]);

  // Subscribe to survey events
  useEffect(() => {
    const handlePageChanged = (_sender: Model, options: any) => {
      updateNavigationState();
      addEvent('Page Changed', {
        from: options.oldCurrentPage?.name,
        to: options.newCurrentPage?.name,
        isNext: options.isNextPage,
        isPrev: options.isPrevPage,
      });
    };

    const handleValueChanged = (_sender: Model, options: any) => {
      addEvent('Value Changed', {
        question: options.name,
        value: options.value,
        oldValue: options.oldValue,
      });
    };

    const handleValidationError = (_sender: Model, options: any) => {
      updateNavigationState();
      addEvent('Validation Error', {
        errors: options.errors,
      });
    };

    const handleComplete = () => {
      updateNavigationState();
      addEvent('Survey Completed', {
        data: survey.data,
      });
    };

    // Subscribe to events
    survey.onCurrentPageChanged.add(handlePageChanged);
    survey.onValueChanged.add(handleValueChanged);
    survey.onValidatedErrorsOnCurrentPage.add(handleValidationError);
    survey.onComplete.add(handleComplete);

    // Initial state
    updateNavigationState();

    return () => {
      survey.onCurrentPageChanged.remove(handlePageChanged);
      survey.onValueChanged.remove(handleValueChanged);
      survey.onValidatedErrorsOnCurrentPage.remove(handleValidationError);
      survey.onComplete.remove(handleComplete);
    };
  }, [survey, addEvent, updateNavigationState]);

  // Handle configuration changes
  const handleProgressToggle = (value: boolean) => {
    setShowProgress(value);
    const newPosition = value ? progressPosition : 'off';
    onConfigChange({ showProgressBar: newPosition });
  };

  const handleProgressPositionChange = (position: string) => {
    setProgressPosition(position);
    if (showProgress) {
      onConfigChange({ showProgressBar: position });
    }
  };

  const handleValidationModeChange = (mode: string) => {
    setValidationMode(mode);
    onConfigChange({ checkErrorsMode: mode });
  };

  const handleButtonPositionChange = (position: string) => {
    setButtonPosition(position);
    onConfigChange({ showNavigationButtons: position });
  };

  return (
    <ScrollView style={styles.container} testID="navigation-playground">
      {/* Navigation State Display */}
      <View style={styles.section} testID="navigation-state-display">
        <Text style={styles.sectionTitle}>Navigation State</Text>
        
        <View style={styles.infoRow} testID="current-page-info">
          <Text style={styles.label}>Current Page:</Text>
          <Text style={styles.value}>
            {navigationState.currentPageNo + 1} of {navigationState.pageCount}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Page Name:</Text>
          <Text style={styles.value}>{navigationState.currentPageName}</Text>
        </View>

        {navigationState.currentPageTitle && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Page Title:</Text>
            <Text style={styles.value}>{navigationState.currentPageTitle}</Text>
          </View>
        )}

        <View style={styles.infoRow} testID="progress-info">
          <Text style={styles.label}>Progress:</Text>
          <Text style={styles.value}>
            {Math.round(((navigationState.currentPageNo + 1) / navigationState.pageCount) * 100)}%
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Visible Pages:</Text>
          <Text style={styles.value}>{navigationState.visiblePageCount}</Text>
        </View>
      </View>

      {/* Navigation Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigation Controls</Text>

        <View style={styles.controlRow} testID="show-progress-toggle">
          <Text style={styles.label}>Show Progress Bar:</Text>
          <Switch
            value={showProgress}
            onValueChange={handleProgressToggle}
            testID="progress-toggle-switch"
          />
        </View>

        {showProgress && (
          <View style={styles.controlRow}>
            <Text style={styles.label}>Progress Position:</Text>
            <View style={styles.buttonGroup}>
              {['top', 'bottom', 'both'].map((pos) => (
                <TouchableOpacity
                  key={pos}
                  style={[
                    styles.optionButton,
                    progressPosition === pos && styles.selectedButton,
                  ]}
                  onPress={() => handleProgressPositionChange(pos)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      progressPosition === pos && styles.selectedText,
                    ]}
                  >
                    {pos}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.controlRow} testID="validation-mode-selector">
          <Text style={styles.label}>Validation Mode:</Text>
          <View style={styles.buttonGroup}>
            {['onNextPage', 'onComplete', 'onValueChanged'].map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.optionButton,
                  validationMode === mode && styles.selectedButton,
                ]}
                onPress={() => handleValidationModeChange(mode)}
              >
                <Text
                  style={[
                    styles.optionText,
                    validationMode === mode && styles.selectedText,
                  ]}
                >
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.controlRow} testID="navigation-buttons-position">
          <Text style={styles.label}>Button Position:</Text>
          <View style={styles.buttonGroup}>
            {['bottom', 'top', 'both'].map((pos) => (
              <TouchableOpacity
                key={pos}
                style={[
                  styles.optionButton,
                  buttonPosition === pos && styles.selectedButton,
                ]}
                onPress={() => handleButtonPositionChange(pos)}
              >
                <Text
                  style={[
                    styles.optionText,
                    buttonPosition === pos && styles.selectedText,
                  ]}
                >
                  {pos}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Validation State */}
      <View style={styles.section} testID="validation-state">
        <Text style={styles.sectionTitle}>Validation State</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.label}>Has Errors:</Text>
          <Text style={[styles.value, validationState.hasErrors && styles.errorText]}>
            {validationState.hasErrors ? 'Yes' : 'No'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Validation Errors:</Text>
          <Text style={styles.value}>{validationState.errorCount}</Text>
        </View>

        {validationState.hasErrors && (
          <View style={styles.errorList}>
            {Object.entries(validationState.errors).map(([question, errors]) => (
              <View key={question} style={styles.errorItem}>
                <Text style={styles.errorQuestion}>{question}:</Text>
                {errors.map((error, index) => (
                  <Text key={index} style={styles.errorMessage}>• {error}</Text>
                ))}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Button States */}
      <View style={styles.section} testID="button-states">
        <Text style={styles.sectionTitle}>Button States</Text>
        
        <View style={styles.buttonStateRow}>
          <View style={styles.buttonState} testID="prev-button-state">
            <Text style={styles.buttonLabel}>Previous:</Text>
            <Text style={styles.buttonValue}>
              {navigationState.isFirstPage ? 'Hidden' : 'Visible'}
            </Text>
          </View>

          <View style={styles.buttonState} testID="next-button-state">
            <Text style={styles.buttonLabel}>Next:</Text>
            <Text style={styles.buttonValue}>
              {navigationState.isLastPage ? 'Hidden' : 'Visible'}
            </Text>
          </View>

          <View style={styles.buttonState}>
            <Text style={styles.buttonLabel}>Complete:</Text>
            <Text style={styles.buttonValue}>
              {navigationState.isLastPage ? 'Visible' : 'Hidden'}
            </Text>
          </View>
        </View>
      </View>

      {/* Event History */}
      <View style={styles.section} testID="event-history">
        <Text style={styles.sectionTitle}>Event History</Text>
        
        <ScrollView 
          style={styles.eventList} 
          testID="event-history-list"
          showsVerticalScrollIndicator={true}
        >
          {events.length === 0 ? (
            <Text style={styles.noEvents}>No events yet. Navigate to see events.</Text>
          ) : (
            events.map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <Text style={styles.eventTime}>[{event.timestamp}]</Text>
                <Text style={styles.eventType}>{event.type}</Text>
                <Text style={styles.eventDetails}>
                  {JSON.stringify(event.details, null, 2)}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  controlRow: {
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  optionText: {
    fontSize: 12,
    color: '#333',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '500',
  },
  errorText: {
    color: '#d32f2f',
  },
  errorList: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  errorItem: {
    marginBottom: 8,
  },
  errorQuestion: {
    fontSize: 13,
    fontWeight: '500',
    color: '#d32f2f',
  },
  errorMessage: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  buttonStateRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  buttonState: {
    alignItems: 'center',
  },
  buttonLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  buttonValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  eventList: {
    maxHeight: 200,
  },
  noEvents: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  eventItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  eventTime: {
    fontSize: 11,
    color: '#999',
  },
  eventType: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2196F3',
    marginVertical: 2,
  },
  eventDetails: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
  },
});