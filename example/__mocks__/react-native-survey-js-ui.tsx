import React from 'react';
import { View, Text } from 'react-native';

export const Survey = ({ testID }: { testID?: string }) => (
  <View testID={testID}>
    <Text>Mock Survey Component</Text>
  </View>
);

export const validateSurveyModel = jest.fn((model) => {
  // Basic validation - check if model has pages
  if (
    !model ||
    !model.pages ||
    !Array.isArray(model.pages) ||
    model.pages.length === 0
  ) {
    return false;
  }
  return true;
});

export default {
  Survey,
  validateSurveyModel,
};
