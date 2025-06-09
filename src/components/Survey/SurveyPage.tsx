import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { PageModel, Question } from 'survey-core';
import { QuestionFactory } from '../Questions';
import { useValidation } from '../../contexts/ValidationContext';

export interface SurveyPageProps {
  page: PageModel;
  surveyId?: string;
  onQuestionValueChange?: (name: string, value: any) => void;
}

export const SurveyPage: React.FC<SurveyPageProps> = ({ page, onQuestionValueChange }) => {
  const { validationState } = useValidation();
  
  if (!page) {
    return null;
  }

  const visibleQuestions = page.questions?.filter((q: Question) => q.visible) || [];

  return (
    <View style={styles.container} testID="survey-page">
      {page.title && (
        <Text style={styles.title} testID="page-title">
          {page.title}
        </Text>
      )}
      {page.description && (
        <Text style={styles.description} testID="page-description">
          {page.description}
        </Text>
      )}
      
      {/* Validation Summary */}
      {validationState.showErrors && validationState.hasErrors && (
        <View style={styles.validationSummary} testID="validation-summary">
          <Text style={styles.validationSummaryTitle}>Please fix the following errors:</Text>
          {validationState.validationMessages.map((error, index) => (
            <Text key={index} style={styles.validationSummaryMessage}>
              • {error.message}
            </Text>
          ))}
        </View>
      )}
      
      <View style={styles.questionsContainer}>
        {visibleQuestions.length > 0 ? (
          visibleQuestions.map((question: Question) => (
            <View key={question.name} style={styles.questionWrapper}>
              <QuestionFactory
                question={question}
                value={question.value}
                onChange={(value: any) => {
                  if (onQuestionValueChange) {
                    onQuestionValueChange(question.name, value);
                  }
                }}
              />
            </View>
          ))
        ) : (
          <Text style={styles.emptyText} testID="empty-page-message">
            No questions available on this page
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  validationSummary: {
    backgroundColor: '#ffebee',
    borderColor: '#d32f2f',
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  validationSummaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  validationSummaryMessage: {
    fontSize: 12,
    color: '#d32f2f',
    marginBottom: 4,
  },
  questionsContainer: {
    flex: 1,
  },
  questionWrapper: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});