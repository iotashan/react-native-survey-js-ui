import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { QuestionModel } from '../../../types';

export interface BaseQuestionProps {
  question: QuestionModel;
  error?: string;
  children?: React.ReactNode;
}

export const BaseQuestion: React.FC<BaseQuestionProps> = ({
  question,
  error,
  children,
}) => {
  // Handle visibility
  if (question.visible === false) {
    return null;
  }

  // Build accessibility label
  const accessibilityParts = [question.title];
  if (question.isRequired) {
    accessibilityParts.push('required');
  }
  if (question.readOnly) {
    accessibilityParts.push('read-only');
  }
  const accessibilityLabel = accessibilityParts.filter(Boolean).join(', ');

  // Combine styles
  const containerStyles = [
    styles.container,
    error && styles.containerError,
    question.readOnly && styles.containerReadOnly,
  ];

  return (
    <View
      style={containerStyles}
      testID="base-question-container"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          {question.title}
          {question.isRequired && <Text style={styles.required}> *</Text>}
        </Text>
      </View>

      {question.description && (
        <Text style={styles.description} testID="question-description">
          {question.description}
        </Text>
      )}

      {children}

      {error && (
        <Text style={styles.error} testID="question-error">
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  containerError: {
    borderColor: '#d32f2f',
  },
  containerReadOnly: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  required: {
    fontSize: 16,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  error: {
    fontSize: 14,
    color: '#d32f2f',
    marginTop: 4,
  },
});
