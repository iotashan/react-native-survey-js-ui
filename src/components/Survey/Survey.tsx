import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type { 
  SurveyModel, 
  SurveyValueChangedHandler, 
  SurveyCurrentPageChangedHandler
} from '../../types';
import { useSurveyModel, useSurveyState } from '../../hooks';
import { QuestionFactory } from '../Questions';

export interface SurveyProps {
  model: SurveyModel;
  onComplete?: (result: any) => void;
  onValueChanged?: SurveyValueChangedHandler;
  onCurrentPageChanged?: SurveyCurrentPageChangedHandler;
}

export const Survey: React.FC<SurveyProps> = ({ 
  model, 
  onComplete, 
  onValueChanged, 
  onCurrentPageChanged 
}) => {
  const { model: surveyModel, isLoading, error } = useSurveyModel(model);
  const surveyState = useSurveyState(surveyModel);
  const [questionValues, setQuestionValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (surveyModel && onComplete) {
      const handleComplete = (sender: any) => {
        onComplete({
          timestamp: new Date().toISOString(),
          surveyId: model['id'] || 'survey',
          data: sender.data,
        });
      };

      surveyModel.onComplete.add(handleComplete);
      return () => {
        surveyModel.onComplete.remove(handleComplete);
      };
    }
    return undefined;
  }, [surveyModel, onComplete, model]);

  // Handle value changed events
  useEffect(() => {
    if (surveyModel && onValueChanged) {
      const handleValueChanged = (sender: any, options: any) => {
        try {
          // survey-core passes the event data as the second parameter or directly on sender
          const eventData = options || sender;
          onValueChanged({
            name: eventData?.name || '',
            value: eventData?.value,
            oldValue: eventData?.oldValue,
            question: eventData?.question,
          });
        } catch (error) {
          console.error('Error in onValueChanged handler:', error);
        }
      };

      surveyModel.onValueChanged.add(handleValueChanged);
      return () => {
        surveyModel.onValueChanged.remove(handleValueChanged);
      };
    }
    return undefined;
  }, [surveyModel, onValueChanged]);

  // Handle page changed events
  useEffect(() => {
    if (surveyModel && onCurrentPageChanged) {
      const handleCurrentPageChanged = (sender: any, options: any) => {
        try {
          // survey-core passes the event data as the second parameter or directly on sender
          const eventData = options || sender;
          onCurrentPageChanged({
            oldCurrentPage: eventData?.oldCurrentPage,
            newCurrentPage: eventData?.newCurrentPage,
            isNextPage: eventData?.isNextPage,
            isPrevPage: eventData?.isPrevPage,
          });
        } catch (error) {
          console.error('Error in onCurrentPageChanged handler:', error);
        }
      };

      surveyModel.onCurrentPageChanged.add(handleCurrentPageChanged);
      return () => {
        surveyModel.onCurrentPageChanged.remove(handleCurrentPageChanged);
      };
    }
    return undefined;
  }, [surveyModel, onCurrentPageChanged]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading survey...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading survey:</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
      </View>
    );
  }

  const handleComplete = () => {
    if (surveyModel) {
      // Trigger survey completion
      surveyModel.doComplete();
    }
  };

  const handleNext = () => {
    if (surveyModel && !surveyState.isLastPage) {
      surveyModel.nextPage();
    }
  };

  const handlePrevious = () => {
    if (surveyModel && !surveyState.isFirstPage) {
      surveyModel.prevPage();
    }
  };

  const showProgressBar = surveyModel?.showProgressBar !== false;
  const progressPercentage =
    surveyState.pageCount > 0
      ? ((surveyState.currentPageNo + 1) / surveyState.pageCount) * 100
      : 0;

  return (
    <View style={styles.container} testID="survey-container">
      {showProgressBar && (
        <View style={styles.progressContainer} testID="survey-progress-bar">
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progressPercentage}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            Page {surveyState.currentPageNo + 1} of {surveyState.pageCount}
          </Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {model.title && <Text style={styles.title}>{model.title}</Text>}

        {/* Render questions from current page */}
        {surveyState.questions.length > 0 ? (
          surveyState.questions.map((question) => (
            <QuestionFactory
              key={question.name}
              question={{ ...question, type: question.type || 'text' }}
              value={questionValues[question.name]}
              onChange={(value) => {
                setQuestionValues((prev) => ({
                  ...prev,
                  [question.name]: value,
                }));
                if (surveyModel) {
                  surveyModel.setValue(question.name, value);
                }
              }}
            />
          ))
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholder}>
              Survey-core integration active. Full rendering in future sprints.
            </Text>
            <Text style={styles.info}>
              Current Page: {surveyState.currentPageNo + 1}
            </Text>
            <Text style={styles.info}>
              Questions: {surveyState.questions.length}
            </Text>
            <Text style={styles.info}>
              Completed: {surveyState.isCompleted ? 'Yes' : 'No'}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.navigationContainer}>
        {!surveyState.isCompleted && (
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={[
                styles.navButton,
                surveyState.isFirstPage && styles.navButtonDisabled,
              ]}
              onPress={handlePrevious}
              disabled={surveyState.isFirstPage}
              accessibilityState={{ disabled: surveyState.isFirstPage }}
            >
              <Text
                style={[
                  styles.navButtonText,
                  surveyState.isFirstPage && styles.navButtonTextDisabled,
                ]}
              >
                Previous
              </Text>
            </TouchableOpacity>

            {surveyState.isLastPage ? (
              <TouchableOpacity
                style={[styles.navButton, styles.completeButton]}
                onPress={handleComplete}
              >
                <Text style={[styles.navButtonText, styles.completeButtonText]}>
                  Complete
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.navButton} onPress={handleNext}>
                <Text style={styles.navButtonText}>Next</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {surveyState.isCompleted && (
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>Survey Completed!</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  placeholderContainer: {
    paddingVertical: 20,
  },
  placeholder: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  completeButtonText: {
    color: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  info: {
    fontSize: 14,
    color: '#333',
    marginVertical: 4,
    textAlign: 'center',
  },
  progressContainer: {
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
  navigationContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2196F3',
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#ccc',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  navButtonTextDisabled: {
    color: '#999',
  },
  completedContainer: {
    alignItems: 'center',
    padding: 20,
  },
  completedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});
