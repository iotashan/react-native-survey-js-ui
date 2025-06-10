import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Survey, 
  validateSurveyModel,
  type SubmissionOptions,
  type SubmissionEvent,
  type SubmissionResult,
  type SubmissionStatus,
} from 'react-native-survey-js-ui';
import { surveyExamples, type SurveyExample } from '../data/surveyExamples';
import { validationExamples } from '../data/validationExamples';
import { multiPageNavigationExamples } from '../data/multiPageExamples';
import { NavigationPlayground, type NavigationConfig } from '../components/NavigationPlayground';

// Combine all examples
const allExamples: SurveyExample[] = [
  ...surveyExamples,
  ...validationExamples,
  ...multiPageNavigationExamples,
];

console.log('Total number of examples:', allExamples.length);
console.log('Validation examples count:', validationExamples.length);

export default function SurveyDemoScreen() {
  const [selectedExample, setSelectedExample] = useState<SurveyExample>(
    allExamples[0]!
  );
  const [showExampleSelector, setShowExampleSelector] = useState(false);
  const [surveyResults, setSurveyResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [eventLogs, setEventLogs] = useState<string[]>([]);
  const [submissionLogs, setSubmissionLogs] = useState<string[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [showPlayground, setShowPlayground] = useState(false);
  const [surveyModel, setSurveyModel] = useState<any>(null);

  const isValid = validateSurveyModel(selectedExample.model);

  const handleSurveyComplete = (result: any) => {
    setSurveyResults(result);
    setShowResults(true);
    addEventLog('Survey completed', result);
  };

  const handleValueChanged = (event: any) => {
    addEventLog('Value changed', {
      question: event.name,
      newValue: event.value,
      oldValue: event.oldValue,
    });
    console.log('Survey value changed:', event);
  };

  const handleCurrentPageChanged = (event: any) => {
    addEventLog('Page changed', {
      from: event.oldCurrentPage?.name || 'unknown',
      to: event.newCurrentPage?.name || 'unknown',
      isNext: event.isNextPage,
      isPrev: event.isPrevPage,
    });
    console.log('Survey page changed:', event);
  };

  const addEventLog = (eventType: string, data: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${eventType}: ${JSON.stringify(data)}`;
    setEventLogs((prev) => [logEntry, ...prev].slice(0, 20)); // Keep only last 20 events
  };

  const addSubmissionLog = (eventType: string, data: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${eventType}: ${JSON.stringify(data, null, 2)}`;
    setSubmissionLogs((prev) => [logEntry, ...prev].slice(0, 10)); // Keep only last 10 submissions
  };

  // Determine submission options based on selected example
  const getSubmissionOptions = (): SubmissionOptions => {
    switch (selectedExample.id) {
      case 'realtime-submission':
        return {
          mode: 'realtime',
          debounceDelay: 1000, // 1 second debounce
          showStatus: true,
        };
      case 'page-change-submission':
        return {
          mode: 'onPageChange',
          showStatus: true,
        };
      case 'value-change-submission':
        return {
          mode: 'onValueChange',
          showStatus: true,
        };
      default:
        return {
          mode: 'onComplete',
          showStatus: true,
        };
    }
  };

  // Submission event handlers
  const handleSubmissionEvent = (event: SubmissionEvent) => {
    addSubmissionLog('Submission Event', {
      trigger: event.trigger,
      data: event.data,
      attempt: event.attempt,
      triggerQuestion: event.triggerQuestion,
      triggerPage: event.triggerPage,
    });
  };

  const handleSubmissionResult = (result: SubmissionResult) => {
    addSubmissionLog('Submission Result', {
      success: result.success,
      error: result.error,
      trigger: result.event.trigger,
    });
  };

  const handleSubmissionStatusChange = (status: SubmissionStatus, result?: SubmissionResult) => {
    setSubmissionStatus(status);
    addSubmissionLog('Status Change', { status, hasError: !!result?.error });
  };

  const handleExampleSelect = (example: SurveyExample) => {
    setSelectedExample(example);
    setShowExampleSelector(false);
    setSurveyResults(null);
    setShowResults(false);
  };

  const resetSurvey = () => {
    setSurveyResults(null);
    setShowResults(false);
    setEventLogs([]);
    setSubmissionLogs([]);
    setSubmissionStatus('idle');
    setShowPlayground(false);
    // Force re-render of Survey component by changing key
    setSelectedExample({ ...selectedExample });
  };

  const handlePlaygroundConfigChange = (config: NavigationConfig) => {
    if (surveyModel) {
      // Apply configuration changes to the survey model
      if (config.showProgressBar !== undefined) {
        surveyModel.showProgressBar = config.showProgressBar;
      }
      if (config.progressBarType !== undefined) {
        surveyModel.progressBarType = config.progressBarType;
      }
      if (config.checkErrorsMode !== undefined) {
        surveyModel.checkErrorsMode = config.checkErrorsMode;
      }
      if (config.showNavigationButtons !== undefined) {
        surveyModel.showNavigationButtons = config.showNavigationButtons;
      }
      if (config.showTimerPanel !== undefined) {
        surveyModel.showTimerPanel = config.showTimerPanel;
      }
      // Force re-render
      setSurveyModel({ ...surveyModel });
    }
  };

  // Check if current example uses submission modes
  const isSubmissionModeExample = ['realtime-submission', 'page-change-submission', 'value-change-submission'].includes(selectedExample.id);
  
  // Check if current example is a multi-page navigation demo
  const isMultiPageNavigationExample = multiPageNavigationExamples.some(e => e.id === selectedExample.id);

  // Get status color helper
  const getStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case 'pending':
        return { color: '#2196F3' };
      case 'success':
        return { color: '#4CAF50' };
      case 'error':
        return { color: '#F44336' };
      case 'retrying':
        return { color: '#FF9800' };
      default:
        return { color: '#666' };
    }
  };

  return (
    <SafeAreaView style={styles.container} testID="survey-demo-screen">
      <ScrollView style={styles.scrollContainer} testID="survey-demo-scroll">
        <View style={styles.header} testID="header-section">
          <Text style={styles.title} testID="screen-title">Survey Demo</Text>
          <Text style={styles.subtitle} testID="screen-subtitle">
            Demonstration of react-native-survey-js-ui library
          </Text>
        </View>

        {/* Example Selector */}
        <View style={styles.selectorContainer} testID="example-selector-section">
          <Text style={styles.sectionTitle} testID="current-example-label">Current Example:</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowExampleSelector(true)}
            testID="example-selector-button"
            accessibilityLabel={`Select survey example. Current: ${selectedExample.title}`}
          >
            <View testID="selected-example-info">
              <Text style={styles.exampleTitle} testID="selected-example-title">{selectedExample.title}</Text>
              <Text style={styles.exampleDescription} testID="selected-example-description">
                {selectedExample.description}
              </Text>
            </View>
            <Text style={styles.chevron} testID="selector-chevron">▼</Text>
          </TouchableOpacity>
        </View>

        {/* Validation Status */}
        <View
          style={[
            styles.status,
            { backgroundColor: isValid ? '#e8f5e8' : '#ffebee' },
          ]}
          testID="validation-status"
        >
          <Text
            style={[
              styles.statusText,
              { color: isValid ? '#2e7d32' : '#d32f2f' },
            ]}
            testID="validation-status-text"
          >
            Survey model valid: {isValid ? 'Yes ✓' : 'No ✗'}
          </Text>
          {!isValid && (
            <Text style={styles.errorText} testID="validation-error-text">
              This example demonstrates error handling for invalid models
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons} testID="action-buttons-container">
          <TouchableOpacity
            style={[styles.actionButton, styles.codeButton]}
            onPress={() => setShowCode(!showCode)}
            testID="show-code-button"
            accessibilityLabel={showCode ? 'Hide JSON model' : 'Show JSON model'}
          >
            <Text style={styles.actionButtonText} testID="show-code-button-text">
              {showCode ? 'Hide' : 'Show'} JSON Model
            </Text>
          </TouchableOpacity>
          {isMultiPageNavigationExample && !showResults && (
            <TouchableOpacity
              style={[styles.actionButton, styles.playgroundButton]}
              onPress={() => setShowPlayground(!showPlayground)}
              testID="show-playground-button"
              accessibilityLabel={showPlayground ? 'Hide playground' : 'Show playground'}
            >
              <Text style={styles.actionButtonText} testID="show-playground-button-text">
                {showPlayground ? 'Hide' : 'Show'} Playground
              </Text>
            </TouchableOpacity>
          )}
          {showResults && (
            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton]}
              onPress={resetSurvey}
              testID="reset-survey-button"
              accessibilityLabel="Reset survey to initial state"
            >
              <Text style={styles.actionButtonText} testID="reset-button-text">Reset Survey</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Code Display */}
        {showCode && (
          <View style={styles.codeContainer} testID="code-container">
            <Text style={styles.codeTitle} testID="code-title">Survey JSON Model:</Text>
            <ScrollView
              horizontal
              style={styles.codeScrollView}
              showsHorizontalScrollIndicator={true}
            >
              <Text style={styles.codeText}>
                {JSON.stringify(selectedExample.model, null, 2)}
              </Text>
            </ScrollView>
          </View>
        )}

        {/* Navigation Playground */}
        {showPlayground && surveyModel && (
          <View style={styles.playgroundContainer} testID="navigation-playground-container">
            <Text style={styles.playgroundTitle}>Navigation Playground</Text>
            <NavigationPlayground
              survey={surveyModel}
              onConfigChange={handlePlaygroundConfigChange}
            />
          </View>
        )}

        {/* Multi-Page Navigation Info */}
        {isMultiPageNavigationExample && (
          <View style={styles.navigationInfoContainer}>
            <Text style={styles.navigationInfoTitle}>Multi-Page Navigation Demo</Text>
            <Text style={styles.navigationInfoDescription}>
              This example demonstrates multi-page navigation features. Watch the event logs below to see navigation events in action.
            </Text>
            {selectedExample.id === 'basic-multipage' && (
              <Text style={styles.navigationFeatureText}>
                • Basic page navigation with Next/Previous buttons{'\n'}
                • Progress bar showing current position{'\n'}
                • Page titles and smooth transitions
              </Text>
            )}
            {selectedExample.id === 'validation-flow' && (
              <Text style={styles.navigationFeatureText}>
                • Required fields block navigation{'\n'}
                • Validation errors shown before page change{'\n'}
                • Cross-field validation support
              </Text>
            )}
            {selectedExample.id === 'dynamic-page-count' && (
              <Text style={styles.navigationFeatureText}>
                • Pages appear/disappear based on answers{'\n'}
                • Dynamic progress tracking{'\n'}
                • Conditional page visibility
              </Text>
            )}
            {selectedExample.id === 'conditional-pages' && (
              <Text style={styles.navigationFeatureText}>
                • Complex conditional logic{'\n'}
                • Different paths based on selections{'\n'}
                • Smart page flow management
              </Text>
            )}
            {selectedExample.id === 'empty-page-handling' && (
              <Text style={styles.navigationFeatureText}>
                • Handles pages with no visible questions{'\n'}
                • Automatic skip to next visible page{'\n'}
                • Smooth navigation experience
              </Text>
            )}
            {selectedExample.id === 'complex-validation-navigation' && (
              <Text style={styles.navigationFeatureText}>
                • Multiple validation rules per field{'\n'}
                • Cross-field validation{'\n'}
                • Custom error messages
              </Text>
            )}
            {selectedExample.id === 'navigation-events' && (
              <Text style={styles.navigationFeatureText}>
                • All navigation events logged{'\n'}
                • Timer panel demonstration{'\n'}
                • Complete event tracking
              </Text>
            )}
          </View>
        )}

        {/* Submission Mode Info */}
        {isSubmissionModeExample && (
          <View style={styles.submissionInfoContainer}>
            <Text style={styles.submissionInfoTitle}>
              Submission Mode: {getSubmissionOptions().mode}
            </Text>
            <Text style={styles.submissionInfoDescription}>
              {selectedExample.id === 'realtime-submission' && 
                'Data is submitted continuously with 1-second debouncing'}
              {selectedExample.id === 'page-change-submission' && 
                'Data is submitted when moving between pages'}
              {selectedExample.id === 'value-change-submission' && 
                'Data is submitted immediately on every field change'}
            </Text>
            <Text style={[styles.submissionStatusText, getStatusColor(submissionStatus)]}>
              Status: {submissionStatus}
            </Text>
          </View>
        )}

        {/* Event Logs Section */}
        {eventLogs.length > 0 && (
          <View style={styles.eventLogsContainer}>
            <Text style={styles.eventLogsTitle}>Event Logs (Live Demo)</Text>
            <ScrollView
              style={styles.eventLogsScrollView}
              showsVerticalScrollIndicator={true}
            >
              {eventLogs.map((log, index) => (
                <Text key={index} style={styles.eventLogText}>
                  {log}
                </Text>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Submission Logs Section */}
        {submissionLogs.length > 0 && (
          <View style={styles.submissionLogsContainer}>
            <Text style={styles.submissionLogsTitle}>Submission Logs (Real-time)</Text>
            <ScrollView
              style={styles.submissionLogsScrollView}
              showsVerticalScrollIndicator={true}
            >
              {submissionLogs.map((log, index) => (
                <Text key={index} style={styles.submissionLogText}>
                  {log}
                </Text>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Survey or Results */}
        {showResults ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Survey Completed!</Text>
            <Text style={styles.resultsSubtitle}>Submission Data:</Text>
            <ScrollView
              style={styles.resultsScrollView}
              showsVerticalScrollIndicator={true}
            >
              <Text style={styles.resultsText}>
                {JSON.stringify(surveyResults, null, 2)}
              </Text>
            </ScrollView>
          </View>
        ) : (
          <View style={styles.surveyContainer}>
            {isValid ? (
              <Survey
                key={selectedExample.id}
                model={selectedExample.model}
                onComplete={handleSurveyComplete}
                onValueChanged={handleValueChanged}
                onCurrentPageChanged={handleCurrentPageChanged}
                submissionOptions={isSubmissionModeExample ? getSubmissionOptions() : undefined}
                onSubmissionEvent={isSubmissionModeExample ? handleSubmissionEvent : undefined}
                onSubmissionResult={isSubmissionModeExample ? handleSubmissionResult : undefined}
                onSubmissionStatusChange={isSubmissionModeExample ? handleSubmissionStatusChange : undefined}
                onModelLoaded={(model) => setSurveyModel(model)}
              />
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Invalid Survey Model</Text>
                <Text style={styles.errorDescription}>
                  The survey model is invalid and cannot be rendered. This
                  demonstrates the library's error handling capabilities.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Example Selector Modal */}
        <Modal
          visible={showExampleSelector}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowExampleSelector(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Survey Example</Text>
              <ScrollView style={styles.exampleList}>
                {allExamples.map((example) => (
                  <TouchableOpacity
                    key={example.id}
                    style={[
                      styles.exampleItem,
                      selectedExample.id === example.id &&
                        styles.selectedExampleItem,
                    ]}
                    onPress={() => handleExampleSelect(example)}
                    testID={`example-${example.id}`}
                  >
                    <Text style={styles.exampleItemTitle}>{example.title}</Text>
                    <Text style={styles.exampleItemDescription}>
                      {example.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowExampleSelector(false)}
              >
                <Text style={styles.modalCloseButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  selectorContainer: {
    margin: 16,
  },
  selectorButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exampleDescription: {
    fontSize: 14,
    color: '#666',
  },
  chevron: {
    fontSize: 18,
    color: '#666',
  },
  status: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    color: '#d32f2f',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  codeButton: {
    backgroundColor: '#2196F3',
  },
  resetButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  codeContainer: {
    margin: 16,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 16,
  },
  codeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  codeScrollView: {
    maxHeight: 300,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#d4d4d4',
    lineHeight: 18,
  },
  surveyContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    minHeight: 200,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#d32f2f',
    marginBottom: 12,
  },
  errorDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  resultsContainer: {
    margin: 16,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 16,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  resultsScrollView: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 12,
    maxHeight: 300,
  },
  resultsText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
  eventLogsContainer: {
    margin: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  eventLogsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  eventLogsScrollView: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 12,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  eventLogText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#495057',
    lineHeight: 16,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  exampleList: {
    marginBottom: 20,
  },
  exampleItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  selectedExampleItem: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  exampleItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exampleItemDescription: {
    fontSize: 14,
    color: '#666',
  },
  modalCloseButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submissionInfoContainer: {
    margin: 16,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  submissionInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  submissionInfoDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    lineHeight: 20,
  },
  submissionStatusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submissionLogsContainer: {
    margin: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  submissionLogsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 12,
  },
  submissionLogsScrollView: {
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 12,
    maxHeight: 250,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  submissionLogText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#495057',
    lineHeight: 14,
    marginBottom: 6,
  },
  navigationInfoContainer: {
    margin: 16,
    backgroundColor: '#f3e5f5',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#9c27b0',
  },
  navigationInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6a1b9a',
    marginBottom: 8,
  },
  navigationInfoDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
    lineHeight: 20,
  },
  navigationFeatureText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  playgroundButton: {
    backgroundColor: '#9c27b0',
  },
  playgroundContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  playgroundTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
});
