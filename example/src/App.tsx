import { Text, View, StyleSheet } from 'react-native';
import { Survey, validateSurveyModel } from 'react-native-survey-js-ui';
import type { SurveyModel } from 'react-native-survey-js-ui';

// Simple test survey model
const testSurveyModel: SurveyModel = {
  pages: [
    {
      name: 'page1',
      elements: [
        {
          type: 'text',
          name: 'question1',
          title: 'What is your name?',
        },
      ],
    },
  ],
};

export default function App() {
  const isValid = validateSurveyModel(testSurveyModel);

  return (
    <View style={styles.container}>
      <Text>React Native Survey JS UI</Text>
      <Text>Library loaded successfully!</Text>
      <Text>Survey model valid: {isValid ? 'Yes' : 'No'}</Text>
      <Survey model={testSurveyModel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
