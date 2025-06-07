import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface SimpleSurveyProps {
  model: any;
  onComplete?: (result: any) => void;
}

export class SimpleSurvey extends React.Component<SimpleSurveyProps> {
  render() {
    const { model } = this.props;
    
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Simple Survey Component (No Hooks)</Text>
        <Text style={styles.debug}>React version: {React.version || 'undefined'}</Text>
        <Text style={styles.debug}>Model type: {typeof model}</Text>
        <Text style={styles.debug}>Component rendered successfully!</Text>
        {model && model.title && (
          <Text style={styles.surveyTitle}>{model.title}</Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  debug: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  surveyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    color: '#2196F3',
  },
});