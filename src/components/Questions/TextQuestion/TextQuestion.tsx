import React from 'react';
import { View, TextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { BaseQuestion } from '../BaseQuestion';
import type { QuestionComponentProps } from '../QuestionFactory';

export const TextQuestion: React.FC<QuestionComponentProps> = ({
  question,
  value,
  onChange,
  error,
}) => {
  // Map input types to React Native keyboard types
  const getKeyboardType = (): KeyboardTypeOptions => {
    switch (question.inputType) {
      case 'email':
        return 'email-address';
      case 'number':
        return 'numeric';
      case 'tel':
        return 'phone-pad';
      case 'url':
        return 'url';
      default:
        return 'default';
    }
  };

  const isMultiline = question.type === 'comment';
  const placeholder = question.placeholder || 'Enter your answer';

  return (
    <View testID="text-question-container">
      <BaseQuestion question={question} error={error}>
        <TextInput
          testID="text-question-input"
          style={[
            styles.input,
            isMultiline && styles.multilineInput,
            error && styles.inputError,
            question.readOnly && styles.inputReadOnly,
          ]}
          value={value || ''}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#999"
          editable={!question.readOnly}
          keyboardType={getKeyboardType()}
          multiline={isMultiline}
          numberOfLines={isMultiline ? 4 : 1}
          textAlignVertical={isMultiline ? 'top' : 'center'}
          accessibilityLabel={question.title}
          accessibilityHint={question.isRequired ? 'Required field' : undefined}
        />
      </BaseQuestion>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    minHeight: 40,
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  inputError: {
    borderColor: '#d32f2f',
  },
  inputReadOnly: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
});
