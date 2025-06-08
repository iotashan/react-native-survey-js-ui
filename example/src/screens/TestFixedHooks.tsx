import React from 'react';
import { View, Text } from 'react-native';
import {
  useSurveyModelFixed,
  useSurveyStateFixed,
} from 'react-native-survey-js-ui';

export default function TestFixedHooks() {
  const testModel = {
    pages: [
      {
        elements: [
          {
            type: 'text',
            name: 'name',
            title: 'What is your name?',
          },
        ],
      },
    ],
  };

  try {
    // Test if the fixed hooks work
    const { model, isLoading, error } = useSurveyModelFixed(testModel);
    const surveyState = useSurveyStateFixed(model);

    return (
      <View style={{ padding: 20 }}>
        <Text>Fixed Hooks Test</Text>
        <Text>Model Loading: {isLoading ? 'Yes' : 'No'}</Text>
        <Text>Model Created: {model ? 'Yes' : 'No'}</Text>
        <Text>State Created: {surveyState ? 'Yes' : 'No'}</Text>
        <Text>Error: {error ? error.message : 'None'}</Text>
      </View>
    );
  } catch (err: any) {
    return (
      <View style={{ padding: 20 }}>
        <Text>Fixed Hooks Test Failed!</Text>
        <Text style={{ color: 'red' }}>Error: {err.message}</Text>
        <Text>Stack: {err.stack}</Text>
      </View>
    );
  }
}
