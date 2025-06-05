import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Survey, validateSurveyModel } from 'react-native-survey-js-ui';
import type { SurveyModel } from 'react-native-survey-js-ui';

// Demo survey model for testing
const demoSurveyModel: SurveyModel = {
  pages: [
    {
      name: 'page1',
      elements: [
        {
          type: 'text',
          name: 'question1',
          title: 'What is your name?',
        },
        {
          type: 'text',
          name: 'question2',
          title: 'What is your favorite color?',
        },
      ],
    },
  ],
};

export default function SurveyDemoScreen() {
  const isValid = validateSurveyModel(demoSurveyModel);

  return (
    <ScrollView style={styles.container} testID="survey-demo-screen">
      <View style={styles.header}>
        <Text style={styles.title}>Survey Demo</Text>
        <Text style={styles.subtitle}>
          Demonstration of react-native-survey-js-ui library
        </Text>
      </View>

      <View style={styles.status}>
        <Text style={styles.statusText}>
          Survey model valid: {isValid ? 'Yes' : 'No'}
        </Text>
      </View>

      <View style={styles.surveyContainer}>
        <Survey model={demoSurveyModel} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  status: {
    padding: 16,
    backgroundColor: '#e8f5e8',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
  },
  surveyContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
});
