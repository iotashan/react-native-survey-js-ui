import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { SurveyModel } from '../../types';

export interface SurveyProps {
  model: SurveyModel;
}

export const Survey: React.FC<SurveyProps> = ({ model }) => {
  return (
    <View style={styles.container} testID="survey-container">
      {model.title && <Text style={styles.title}>{model.title}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});