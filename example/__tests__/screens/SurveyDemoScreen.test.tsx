// Test the SurveyDemoScreen functionality and data integrity

describe('SurveyDemoScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component File Structure', () => {
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
  });

  describe('Survey Examples Data Validation', () => {
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

      surveyExamples.forEach((example: any) => {
        expect(example).toHaveProperty('id');
        expect(example).toHaveProperty('title');
        expect(example).toHaveProperty('description');
        expect(example).toHaveProperty('model');

        // Validate example structure
        expect(typeof example.id).toBe('string');
        expect(typeof example.title).toBe('string');
        expect(typeof example.description).toBe('string');
        expect(typeof example.model).toBe('object');
      });
    });

    test('each survey example has unique id', () => {
      const { surveyExamples } = require('../../src/data/surveyExamples');
      const ids = surveyExamples.map((example: any) => example.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    test('basic survey examples have valid models', () => {
      const { surveyExamples } = require('../../src/data/surveyExamples');
      const { validateSurveyModel } = require('react-native-survey-js-ui');

      // Test valid examples
      const validExamples = surveyExamples.filter(
        (example: any) => example.id !== 'invalid-model'
      );

      validExamples.forEach((example: any) => {
        expect(validateSurveyModel(example.model)).toBe(true);
      });
    });

    test('invalid model example properly demonstrates error handling', () => {
      const { surveyExamples } = require('../../src/data/surveyExamples');
      const { validateSurveyModel } = require('react-native-survey-js-ui');

      const invalidExample = surveyExamples.find(
        (example: any) => example.id === 'invalid-model'
      );

      expect(invalidExample).toBeDefined();
      expect(validateSurveyModel(invalidExample.model)).toBe(false);
    });

    test('getSurveyExampleById returns correct examples', () => {
      const { getSurveyExampleById } = require('../../src/data/surveyExamples');

      const basicExample = getSurveyExampleById('basic-text');
      expect(basicExample).toBeDefined();
      expect(basicExample?.id).toBe('basic-text');

      const nonExistent = getSurveyExampleById('non-existent');
      expect(nonExistent).toBeUndefined();
    });
  });

  describe('Survey Model Content Validation', () => {
    test('basic text survey has proper question types', () => {
      const { getSurveyExampleById } = require('../../src/data/surveyExamples');
      const basicExample = getSurveyExampleById('basic-text');

      expect(basicExample.model.pages).toHaveLength(1);
      const elements = basicExample.model.pages[0].elements;

      // Should have text, email, and comment questions
      const questionTypes = elements.map((el: any) => el.type);
      expect(questionTypes).toContain('text');
      expect(questionTypes).toContain('comment');
    });

    test('multiple choice survey has proper choice questions', () => {
      const { getSurveyExampleById } = require('../../src/data/surveyExamples');
      const multipleChoiceExample = getSurveyExampleById('multiple-choice');

      expect(multipleChoiceExample.model.pages).toHaveLength(1);
      const elements = multipleChoiceExample.model.pages[0].elements;

      // Should have radiogroup, checkbox, and dropdown questions
      const questionTypes = elements.map((el: any) => el.type);
      expect(questionTypes).toContain('radiogroup');
      expect(questionTypes).toContain('checkbox');
      expect(questionTypes).toContain('dropdown');
    });

    test('mixed types survey demonstrates various question types', () => {
      const { getSurveyExampleById } = require('../../src/data/surveyExamples');
      const mixedExample = getSurveyExampleById('mixed-types');

      expect(mixedExample.model.pages).toHaveLength(2);

      // Collect all question types across pages
      const allElements = mixedExample.model.pages.flatMap(
        (page: any) => page.elements
      );
      const questionTypes = allElements.map((el: any) => el.type);

      // Should demonstrate various types
      expect(questionTypes).toContain('text');
      expect(questionTypes).toContain('dropdown');
      expect(questionTypes).toContain('rating');
      expect(questionTypes).toContain('boolean');
      expect(questionTypes).toContain('comment');
    });

    test('validation survey has proper validation rules', () => {
      const { getSurveyExampleById } = require('../../src/data/surveyExamples');
      const validationExample = getSurveyExampleById('validation');

      const elements = validationExample.model.pages[0].elements;

      // Check for validation rules
      const elementsWithValidators = elements.filter(
        (el: any) => el.validators && el.validators.length > 0
      );

      expect(elementsWithValidators.length).toBeGreaterThan(0);

      // Should have different validator types
      const validatorTypes = elementsWithValidators.flatMap((el: any) =>
        el.validators.map((v: any) => v.type)
      );
      expect(validatorTypes).toContain('regex');
      expect(validatorTypes).toContain('numeric');
    });
  });

  describe('Library Integration Tests', () => {
    test('library mock functions are properly configured', () => {
      const {
        Survey,
        validateSurveyModel,
      } = require('react-native-survey-js-ui');

      expect(Survey).toBeDefined();
      expect(typeof Survey).toBe('function');
      expect(validateSurveyModel).toBeDefined();
      expect(typeof validateSurveyModel).toBe('function');
    });

    test('component module structure is correct', () => {
      // Test the module export exists and is valid structure
      const fs = require('fs');
      const path = require('path');
      const componentPath = path.join(
        __dirname,
        '../../src/screens/SurveyDemoScreen.tsx'
      );
      const content = fs.readFileSync(componentPath, 'utf8');

      // Check that key imports and exports are present
      expect(content).toContain('export default function SurveyDemoScreen');
      expect(content).toContain('import { Survey, validateSurveyModel }');
      expect(content).toContain('surveyExamples');
    });
  });

  describe('Demo Screen Features Validation', () => {
    test('screen demonstrates comprehensive survey functionality', () => {
      const { surveyExamples } = require('../../src/data/surveyExamples');

      // Should have multiple examples to demonstrate different features
      expect(surveyExamples.length).toBeGreaterThanOrEqual(4);

      // Should include various survey patterns
      const titles = surveyExamples.map((ex: any) => ex.title.toLowerCase());
      const hasBasicDemo = titles.some(
        (title: string) => title.includes('basic') || title.includes('text')
      );
      const hasMultipleChoice = titles.some(
        (title: string) =>
          title.includes('multiple') || title.includes('choice')
      );
      const hasValidation = titles.some((title: string) =>
        title.includes('validation')
      );
      const hasError = titles.some(
        (title: string) => title.includes('invalid') || title.includes('error')
      );

      expect(hasBasicDemo).toBe(true);
      expect(hasMultipleChoice).toBe(true);
      expect(hasValidation).toBe(true);
      expect(hasError).toBe(true);
    });

    test('includes multi-page demo showing navigation flow', () => {
      const { getSurveyExampleById } = require('../../src/data/surveyExamples');
      const multiPageDemo = getSurveyExampleById('multi-page-demo');

      expect(multiPageDemo).toBeDefined();
      expect(multiPageDemo.title).toBe('Multi-Page Demo Survey');
      expect(multiPageDemo.model.pages).toHaveLength(5);
      
      // Verify page names for navigation demo
      const pageNames = multiPageDemo.model.pages.map((page: any) => page.name);
      expect(pageNames).toEqual(['welcome', 'demographics', 'experience', 'feedback', 'completion']);
      
      // Should have progress and numbering enabled for better UX
      expect(multiPageDemo.model.showProgressBar).toBe('top');
      expect(multiPageDemo.model.showQuestionNumbers).toBe('on');
    });

    test('survey examples provide good developer learning experience', () => {
      const { surveyExamples } = require('../../src/data/surveyExamples');

      surveyExamples.forEach((example: any) => {
        // Each example should have meaningful title and description
        expect(example.title.length).toBeGreaterThan(5);
        expect(example.description.length).toBeGreaterThan(10);

        // Should demonstrate clear use cases
        expect(example.model.title).toBeDefined();
        expect(typeof example.model.title).toBe('string');
      });
    });
  });
});
