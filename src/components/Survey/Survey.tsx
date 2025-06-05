import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import type { SurveyModel } from '../../types';

export interface SurveyProps {
  model: SurveyModel;
  onComplete?: (result: any) => void;
}

export const Survey: React.FC<SurveyProps> = ({ model, onComplete }) => {
  const handleComplete = () => {
    // For now, return a mock result
    // In a real implementation, this would collect form data
    if (onComplete) {
      onComplete({
        timestamp: new Date().toISOString(),
        surveyId: model['id'] || 'survey',
        data: {
          // Mock data for demonstration
          mockResponse: 'This is a placeholder response',
        },
      });
    }
  };

  return (
    <View style={styles.container} testID="survey-container">
      {model.title && <Text style={styles.title}>{model.title}</Text>}
      <Text style={styles.placeholder}>
        Survey rendering will be implemented in future sprints.
      </Text>
      <Text style={styles.placeholder}>
        This is a demonstration of the Survey Demo tab functionality.
      </Text>
      <View style={styles.completeButton}>
        <Button title="Complete Survey" onPress={handleComplete} />
      </View>
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
  placeholder: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  completeButton: {
    marginTop: 20,
  },
});
