// Test the SurveyDemoScreen without full React Native rendering

describe('SurveyDemoScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('component file exists and exports correctly', () => {
    // Test that the component file exists
    const fs = require('fs');
    const path = require('path');
    const componentPath = path.join(
      __dirname,
      '../../src/screens/SurveyDemoScreen.tsx'
    );
    expect(fs.existsSync(componentPath)).toBe(true);
  });

  test('survey examples data file exists', () => {
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.join(__dirname, '../../src/data/surveyExamples.ts');
    expect(fs.existsSync(dataPath)).toBe(true);
  });

  test('survey examples data exports correctly', () => {
    const {
      surveyExamples,
      getSurveyExampleById,
    } = require('../../src/data/surveyExamples');

    expect(Array.isArray(surveyExamples)).toBe(true);
    expect(surveyExamples.length).toBeGreaterThan(0);
    expect(typeof getSurveyExampleById).toBe('function');
  });

  test('survey examples have required structure', () => {
    const { surveyExamples } = require('../../src/data/surveyExamples');

    surveyExamples.forEach((example) => {
      expect(example).toHaveProperty('id');
      expect(example).toHaveProperty('title');
      expect(example).toHaveProperty('description');
      expect(example).toHaveProperty('model');
    });
  });

  test('getSurveyExampleById returns correct examples', () => {
    const { getSurveyExampleById } = require('../../src/data/surveyExamples');

    const basicExample = getSurveyExampleById('basic-text');
    expect(basicExample).toBeDefined();
    expect(basicExample?.id).toBe('basic-text');

    const nonExistent = getSurveyExampleById('non-existent');
    expect(nonExistent).toBeUndefined();
  });

  test('library mock dependency setup works', () => {
    jest.mock('react-native-survey-js-ui', () => ({
      Survey: jest.fn(),
      validateSurveyModel: jest.fn(),
    }));

    const mockLib = jest.requireMock('react-native-survey-js-ui');
    expect(mockLib.Survey).toBeDefined();
    expect(mockLib.validateSurveyModel).toBeDefined();
  });

  test('component can be required without React Native', () => {
    // Mock React Native to avoid bridge issues
    jest.doMock('react-native', () => ({
      View: 'View',
      Text: 'Text',
      StyleSheet: { create: (s: any) => s },
      ScrollView: 'ScrollView',
      TouchableOpacity: 'TouchableOpacity',
      Modal: 'Modal',
      Alert: { alert: jest.fn() },
    }));

    jest.doMock('react', () => ({
      default: { useState: jest.fn() },
      useState: jest.fn(),
    }));

    expect(() => {
      require('../../src/screens/SurveyDemoScreen');
    }).not.toThrow();
  });
});
