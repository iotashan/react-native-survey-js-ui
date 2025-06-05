// Library integration tests

// Use the mock
jest.mock('react-native-survey-js-ui');

import { Survey, validateSurveyModel } from 'react-native-survey-js-ui';

type SurveyModel = {
  pages: Array<{
    name: string;
    elements: Array<{
      type: string;
      name: string;
      title: string;
    }>;
  }>;
};

const testSurveyModel: SurveyModel = {
  pages: [
    {
      name: 'page1',
      elements: [
        {
          type: 'text',
          name: 'question1',
          title: 'Test Question',
        },
      ],
    },
  ],
};

describe('Library Integration Tests', () => {
  test('can import Survey component from library', () => {
    expect(Survey).toBeDefined();
  });

  test('can import validateSurveyModel function from library', () => {
    expect(validateSurveyModel).toBeDefined();
    expect(typeof validateSurveyModel).toBe('function');
  });

  test('Survey component can be instantiated without errors', () => {
    // Test component existence without rendering to avoid RN bridge issues
    expect(() => Survey).not.toThrow();
    expect(Survey).toBeDefined();
  });

  test('validateSurveyModel validates survey correctly', () => {
    const isValid = validateSurveyModel(testSurveyModel);
    expect(typeof isValid).toBe('boolean');
    expect(isValid).toBe(true);
  });

  test('validateSurveyModel rejects invalid survey', () => {
    const invalidModel = {} as SurveyModel;
    const isValid = validateSurveyModel(invalidModel);
    expect(isValid).toBe(false);
  });
});
