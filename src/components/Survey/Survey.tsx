import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
} from 'react-native';
import type { SurveyModel } from '../../types';
import { useSurveyModel, useSurveyState } from '../../hooks';

export interface SurveyProps {
  model: SurveyModel;
  onComplete?: (result: any) => void;
}

export const Survey: React.FC<SurveyProps> = ({ model, onComplete }) => {
  const { model: surveyModel, isLoading, error } = useSurveyModel(model);
  const surveyState = useSurveyState(surveyModel);

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

  return (
    <View style={styles.container} testID="survey-container">
      {model.title && <Text style={styles.title}>{model.title}</Text>}
      <Text style={styles.placeholder}>
        Survey-core integration active. Full rendering in future sprints.
      </Text>
      <Text style={styles.info}>
        Current Page: {surveyState.currentPageNo + 1}
      </Text>
      <Text style={styles.info}>Questions: {surveyState.questions.length}</Text>
      <Text style={styles.info}>
        Completed: {surveyState.isCompleted ? 'Yes' : 'No'}
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
});
