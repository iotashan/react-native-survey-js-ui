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

export default function SurveyDemoScreen() {
  const [selectedExample, setSelectedExample] = useState<SurveyExample>(
    surveyExamples[0]!
  );
  const [showExampleSelector, setShowExampleSelector] = useState(false);
  const [surveyResults, setSurveyResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [eventLogs, setEventLogs] = useState<string[]>([]);
  const [submissionLogs, setSubmissionLogs] = useState<string[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');

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
    // Force re-render of Survey component by changing key
    setSelectedExample({ ...selectedExample });
  };

  // Check if current example uses submission modes
  const isSubmissionModeExample = ['realtime-submission', 'page-change-submission', 'value-change-submission'].includes(selectedExample.id);

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
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Survey Demo</Text>
          <Text style={styles.subtitle}>
            Demonstration of react-native-survey-js-ui library
          </Text>
        </View>

        {/* Example Selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.sectionTitle}>Current Example:</Text>
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowExampleSelector(true)}
            testID="example-selector-button"
          >
            <View>
              <Text style={styles.exampleTitle}>{selectedExample.title}</Text>
              <Text style={styles.exampleDescription}>
                {selectedExample.description}
              </Text>
            </View>
            <Text style={styles.chevron}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Validation Status */}
        <View
          style={[
            styles.status,
            { backgroundColor: isValid ? '#e8f5e8' : '#ffebee' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: isValid ? '#2e7d32' : '#d32f2f' },
            ]}
          >
            Survey model valid: {isValid ? 'Yes ✓' : 'No ✗'}
          </Text>
          {!isValid && (
            <Text style={styles.errorText}>
              This example demonstrates error handling for invalid models
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.codeButton]}
            onPress={() => setShowCode(!showCode)}
            testID="show-code-button"
          >
            <Text style={styles.actionButtonText}>
              {showCode ? 'Hide' : 'Show'} JSON Model
            </Text>
          </TouchableOpacity>
          {showResults && (
            <TouchableOpacity
              style={[styles.actionButton, styles.resetButton]}
              onPress={resetSurvey}
              testID="reset-survey-button"
            >
              <Text style={styles.actionButtonText}>Reset Survey</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Code Display */}
        {showCode && (
          <View style={styles.codeContainer}>
            <Text style={styles.codeTitle}>Survey JSON Model:</Text>
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
                {surveyExamples.map((example) => (
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
});
