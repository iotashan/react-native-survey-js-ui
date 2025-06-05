import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { QuestionFactory } from './QuestionFactory';
import type { QuestionModel } from '../../../types';

// Mock question components
jest.mock('../TextQuestion', () => ({
  TextQuestion: ({ question }: any) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return (
      <View testID="text-question">
        <Text>{question.name}</Text>
      </View>
    );
  },
}));

jest.mock('../BaseQuestion', () => ({
  BaseQuestion: ({ question }: any) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return (
      <View testID="base-question">
        <Text>{question.name}</Text>
      </View>
    );
  },
}));

describe('QuestionFactory', () => {
  const mockQuestion: QuestionModel = {
    name: 'q1',
    type: 'text',
    title: 'Test Question',
  };

  describe('Question Type Registration', () => {
    beforeEach(() => {
      // Clear registry before each test
      QuestionFactory.clearRegistry();
    });

    it('should render registered question type', () => {
      const MockComponent = ({ question }: any) => (
        <View testID="mock-question">
          <Text>{question.name}</Text>
        </View>
      );
      
      QuestionFactory.registerQuestionType('custom', MockComponent);
      
      const { getByTestId } = render(
        <QuestionFactory
          question={{ ...mockQuestion, type: 'custom' }}
        />
      );
      
      expect(getByTestId('mock-question')).toBeTruthy();
    });

    it('should fall back to BaseQuestion for unknown types', () => {
      const { getByTestId } = render(
        <QuestionFactory
          question={{ ...mockQuestion, type: 'unknown' }}
        />
      );
      
      expect(getByTestId('base-question')).toBeTruthy();
    });

    it('should override existing question type registration', () => {
      const FirstComponent = ({ question }: any) => (
        <View testID="first-component">
          <Text>{question.name}</Text>
        </View>
      );
      const SecondComponent = ({ question }: any) => (
        <View testID="second-component">
          <Text>{question.name}</Text>
        </View>
      );
      
      QuestionFactory.registerQuestionType('custom', FirstComponent);
      QuestionFactory.registerQuestionType('custom', SecondComponent);
      
      const { getByTestId, queryByTestId } = render(
        <QuestionFactory
          question={{ ...mockQuestion, type: 'custom' }}
        />
      );
      
      expect(queryByTestId('first-component')).toBeNull();
      expect(getByTestId('second-component')).toBeTruthy();
    });
  });

  describe('Built-in Question Types', () => {
    it('should render TextQuestion for text type', () => {
      const { getByTestId } = render(
        <QuestionFactory
          question={{ ...mockQuestion, type: 'text' }}
        />
      );
      
      expect(getByTestId('text-question')).toBeTruthy();
    });
  });

  describe('Props Passing', () => {
    it('should pass question prop to rendered component', () => {
      const { getByText } = render(
        <QuestionFactory question={mockQuestion} />
      );
      
      expect(getByText('q1')).toBeTruthy();
    });

    it('should pass error prop to rendered component', () => {
      const MockComponent = ({ error }: any) => (
        <Text>{error}</Text>
      );
      
      QuestionFactory.registerQuestionType('error-test', MockComponent);
      
      const { getByText } = render(
        <QuestionFactory
          question={{ ...mockQuestion, type: 'error-test' }}
          error="Test error"
        />
      );
      
      expect(getByText('Test error')).toBeTruthy();
    });

    it('should pass onChange prop to rendered component', () => {
      const onChange = jest.fn();
      const MockComponent = ({ onChange: handleChange }: any) => {
        handleChange('new value');
        return <Text>Mock</Text>;
      };
      
      QuestionFactory.registerQuestionType('change-test', MockComponent);
      
      render(
        <QuestionFactory
          question={{ ...mockQuestion, type: 'change-test' }}
          onChange={onChange}
        />
      );
      
      expect(onChange).toHaveBeenCalledWith('new value');
    });

    it('should pass value prop to rendered component', () => {
      const MockComponent = ({ value }: any) => (
        <Text>{value}</Text>
      );
      
      QuestionFactory.registerQuestionType('value-test', MockComponent);
      
      const { getByText } = render(
        <QuestionFactory
          question={{ ...mockQuestion, type: 'value-test' }}
          value="Test value"
        />
      );
      
      expect(getByText('Test value')).toBeTruthy();
    });
  });

  describe('Registry Methods', () => {
    it('should return list of registered question types', () => {
      QuestionFactory.clearRegistry();
      QuestionFactory.registerQuestionType('type1', () => null);
      QuestionFactory.registerQuestionType('type2', () => null);
      
      const types = QuestionFactory.getRegisteredTypes();
      expect(types).toContain('type1');
      expect(types).toContain('type2');
      expect(types).toContain('text'); // Built-in type
    });

    it('should check if question type is registered', () => {
      QuestionFactory.clearRegistry();
      QuestionFactory.registerQuestionType('custom', () => null);
      
      expect(QuestionFactory.isTypeRegistered('custom')).toBe(true);
      expect(QuestionFactory.isTypeRegistered('unknown')).toBe(false);
      expect(QuestionFactory.isTypeRegistered('text')).toBe(true); // Built-in
    });
  });

  describe('Console Warnings', () => {
    const originalWarn = console.warn;
    let warnMock: jest.Mock;

    beforeEach(() => {
      warnMock = jest.fn();
      console.warn = warnMock;
    });

    afterEach(() => {
      console.warn = originalWarn;
    });

    it('should warn when rendering unknown question type', () => {
      render(
        <QuestionFactory
          question={{ ...mockQuestion, type: 'unknown' }}
        />
      );
      
      expect(warnMock).toHaveBeenCalledWith(
        'Unknown question type: unknown. Falling back to BaseQuestion.'
      );
    });
  });
});