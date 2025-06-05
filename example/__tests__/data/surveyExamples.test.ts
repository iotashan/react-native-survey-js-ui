import {
  surveyExamples,
  basicTextSurvey,
  multipleChoiceSurvey,
  mixedTypesSurvey,
  validationSurvey,
  invalidModelExample,
  getSurveyExampleById,
} from '../../src/data/surveyExamples';

describe('surveyExamples', () => {
  describe('Survey Examples Structure', () => {
    it('exports all expected survey examples', () => {
      expect(surveyExamples).toHaveLength(5);
      expect(surveyExamples).toContain(basicTextSurvey);
      expect(surveyExamples).toContain(multipleChoiceSurvey);
      expect(surveyExamples).toContain(mixedTypesSurvey);
      expect(surveyExamples).toContain(validationSurvey);
      expect(surveyExamples).toContain(invalidModelExample);
    });

    it('each example has required properties', () => {
      surveyExamples.forEach((example) => {
        expect(example).toHaveProperty('id');
        expect(example).toHaveProperty('title');
        expect(example).toHaveProperty('description');
        expect(example).toHaveProperty('model');

        expect(typeof example.id).toBe('string');
        expect(typeof example.title).toBe('string');
        expect(typeof example.description).toBe('string');
        expect(typeof example.model).toBe('object');
      });
    });

    it('all examples have unique IDs', () => {
      const ids = surveyExamples.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Basic Text Survey', () => {
    it('has correct structure', () => {
      expect(basicTextSurvey.id).toBe('basic-text');
      expect(basicTextSurvey.title).toBe('Basic Text Survey');
      expect(basicTextSurvey.model.title).toBe('Customer Feedback Form');
      expect(basicTextSurvey.model.pages).toHaveLength(1);
    });

    it('contains expected questions', () => {
      const elements = basicTextSurvey.model.pages[0].elements;
      expect(elements).toHaveLength(3);

      expect(elements[0].type).toBe('text');
      expect(elements[0].name).toBe('customerName');
      expect(elements[0].isRequired).toBe(true);

      expect(elements[1].type).toBe('text');
      expect(elements[1].name).toBe('email');
      expect(elements[1].validators).toBeDefined();

      expect(elements[2].type).toBe('comment');
      expect(elements[2].name).toBe('feedback');
    });
  });

  describe('Multiple Choice Survey', () => {
    it('has correct structure', () => {
      expect(multipleChoiceSurvey.id).toBe('multiple-choice');
      expect(multipleChoiceSurvey.model.pages).toHaveLength(1);
    });

    it('contains different choice question types', () => {
      const elements = multipleChoiceSurvey.model.pages[0].elements;
      expect(elements).toHaveLength(3);

      expect(elements[0].type).toBe('radiogroup');
      expect(elements[0].choices).toHaveLength(4);

      expect(elements[1].type).toBe('checkbox');
      expect(elements[1].choices).toHaveLength(6);

      expect(elements[2].type).toBe('dropdown');
      expect(elements[2].choices).toHaveLength(5);
    });
  });

  describe('Mixed Types Survey', () => {
    it('has multiple pages', () => {
      expect(mixedTypesSurvey.model.pages).toHaveLength(2);
      expect(mixedTypesSurvey.model.showQuestionNumbers).toBe('on');
    });

    it('contains various question types across pages', () => {
      const page1Elements = mixedTypesSurvey.model.pages[0].elements;
      const page2Elements = mixedTypesSurvey.model.pages[1].elements;

      expect(page1Elements).toHaveLength(2);
      expect(page2Elements).toHaveLength(3);

      // Check for rating and boolean types in page 2
      expect(page2Elements[0].type).toBe('rating');
      expect(page2Elements[1].type).toBe('boolean');
    });
  });

  describe('Validation Survey', () => {
    it('has validation rules on all fields', () => {
      const elements = validationSurvey.model.pages[0].elements;

      // Username validation
      expect(elements[0].validators).toBeDefined();
      expect(elements[0].validators[0].type).toBe('regex');

      // Age validation
      expect(elements[1].validators).toBeDefined();
      expect(elements[1].validators[0].type).toBe('numeric');
      expect(elements[1].validators[0].minValue).toBe(18);
      expect(elements[1].validators[0].maxValue).toBe(100);

      // Password validation
      expect(elements[2].validators).toBeDefined();
      expect(elements[2].validators[0].minLength).toBe(8);

      // Confirm password validation
      expect(elements[3].validators).toBeDefined();
      expect(elements[3].validators[0].type).toBe('expression');
    });
  });

  describe('Invalid Model Example', () => {
    it('has missing required pages property', () => {
      expect(invalidModelExample.model.pages).toBeUndefined();
      expect(invalidModelExample.model.title).toBe(
        'This survey has an invalid structure'
      );
    });
  });

  describe('getSurveyExampleById', () => {
    it('returns correct example for valid ID', () => {
      const example = getSurveyExampleById('basic-text');
      expect(example).toBe(basicTextSurvey);
    });

    it('returns undefined for invalid ID', () => {
      const example = getSurveyExampleById('non-existent');
      expect(example).toBeUndefined();
    });

    it('works for all example IDs', () => {
      surveyExamples.forEach((example) => {
        const retrieved = getSurveyExampleById(example.id);
        expect(retrieved).toBe(example);
      });
    });
  });
});
