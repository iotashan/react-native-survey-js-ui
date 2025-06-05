import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { QuestionModel } from '../../../types';

export interface BaseQuestionProps {
  question: QuestionModel;
}

export const BaseQuestion: React.FC<BaseQuestionProps> = ({ question }) => {
  return (
    <View style={styles.container} testID="base-question-container">
      <Text style={styles.title}>{question.title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  title: {
    fontSize: 16,
    marginBottom: 8,
  },
});
