import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export const Survey = ({
  testID,
  onComplete,
  onValueChanged,
  onCurrentPageChanged,
}: {
  testID?: string;
  onComplete?: (data: any) => void;
  onValueChanged?: (data: any) => void;
  onCurrentPageChanged?: (data: any) => void;
}) => (
  <View testID={testID || 'mocked-survey'}>
    <Text>Mock Survey Component</Text>
    {onComplete && (
      <TouchableOpacity
        testID="mock-complete-button"
        onPress={() => onComplete({ test: 'data' })}
      >
        <Text>Complete Survey</Text>
      </TouchableOpacity>
    )}
    {onValueChanged && (
      <TouchableOpacity
        testID="mock-value-change-button"
        onPress={() =>
          onValueChanged({ name: 'test', value: 'new', oldValue: 'old' })
        }
      >
        <Text>Change Value</Text>
      </TouchableOpacity>
    )}
    {onCurrentPageChanged && (
      <TouchableOpacity
        testID="mock-page-change-button"
        onPress={() =>
          onCurrentPageChanged({
            oldCurrentPage: { name: 'page1' },
            newCurrentPage: { name: 'page2' },
            isNextPage: true,
            isPrevPage: false,
          })
        }
      >
        <Text>Change Page</Text>
      </TouchableOpacity>
    )}
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
