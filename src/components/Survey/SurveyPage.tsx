import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { PageModel, Question } from 'survey-core';
import { QuestionFactory } from '../Questions';

export interface SurveyPageProps {
  page: PageModel;
  surveyId?: string;
  onQuestionValueChange?: (name: string, value: any) => void;
  questionErrors?: Record<string, string[]>; // Question-level errors from useSurveyState
}

export const SurveyPage: React.FC<SurveyPageProps> = ({ page, onQuestionValueChange, questionErrors }) => {
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
      
      <View style={styles.questionsContainer}>
        {visibleQuestions.length > 0 ? (
          visibleQuestions.map((question: Question) => {
            // Get question-level errors from the questionErrors prop (from useSurveyState)
            const questionErrorMessages = questionErrors?.[question.name] || [];
            const questionError = questionErrorMessages.length > 0 ? questionErrorMessages[0] : undefined;
            
            return (
              <View key={question.name} style={styles.questionWrapper}>
                <QuestionFactory
                  question={question}
                  value={question.value}
                  onChange={(value: any) => {
                    if (onQuestionValueChange) {
                      onQuestionValueChange(question.name, value);
                    }
                  }}
                  {...(questionError ? { error: questionError } : {})}
                />
              </View>
            );
          })
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