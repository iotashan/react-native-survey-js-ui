import { validateSurveyModel } from './validation';
import type { SurveyModel } from '../types';

describe('validateSurveyModel', () => {
  it('should return true for valid survey model', () => {
    const validModel: SurveyModel = {
      pages: [
        {
          elements: [
            {
              name: 'q1',
              type: 'text',
              title: 'Question 1',
            },
          ],
        },
      ],
    };
    expect(validateSurveyModel(validModel)).toBe(true);
  });

  it('should return false for invalid survey model', () => {
    const invalidModel = {} as SurveyModel;
    expect(validateSurveyModel(invalidModel)).toBe(false);
  });

  it('should return false for survey without pages', () => {
    const modelWithoutPages = {
      title: 'Survey',
    } as SurveyModel;
    expect(validateSurveyModel(modelWithoutPages)).toBe(false);
  });

  it('should return false for null model', () => {
    expect(validateSurveyModel(null as any)).toBe(false);
  });

  it('should return false for undefined model', () => {
    expect(validateSurveyModel(undefined as any)).toBe(false);
  });

  it('should return false for non-object model', () => {
    expect(validateSurveyModel('string' as any)).toBe(false);
    expect(validateSurveyModel(123 as any)).toBe(false);
  });

  it('should return false for pages that are not an array', () => {
    const modelWithInvalidPages = {
      pages: 'not an array',
    } as any;
    expect(validateSurveyModel(modelWithInvalidPages)).toBe(false);
  });

  it('should return false for page without elements array', () => {
    const modelWithPageWithoutElements: SurveyModel = {
      pages: [
        {
          name: 'page1',
        } as any,
      ],
    };
    expect(validateSurveyModel(modelWithPageWithoutElements)).toBe(false);
  });

  it('should return false for page with non-array elements', () => {
    const modelWithInvalidElements: SurveyModel = {
      pages: [
        {
          elements: 'not an array',
        } as any,
      ],
    };
    expect(validateSurveyModel(modelWithInvalidElements)).toBe(false);
  });

  it('should return false for element without name', () => {
    const modelWithElementWithoutName: SurveyModel = {
      pages: [
        {
          elements: [
            {
              type: 'text',
            } as any,
          ],
        },
      ],
    };
    expect(validateSurveyModel(modelWithElementWithoutName)).toBe(false);
  });

  it('should return false for element without type', () => {
    const modelWithElementWithoutType: SurveyModel = {
      pages: [
        {
          elements: [
            {
              name: 'q1',
            } as any,
          ],
        },
      ],
    };
    expect(validateSurveyModel(modelWithElementWithoutType)).toBe(false);
  });

  it('should return true for empty pages array', () => {
    const modelWithEmptyPages: SurveyModel = {
      pages: [],
    };
    expect(validateSurveyModel(modelWithEmptyPages)).toBe(true);
  });

  it('should return true for page with empty elements array', () => {
    const modelWithEmptyElements: SurveyModel = {
      pages: [
        {
          elements: [],
        },
      ],
    };
    expect(validateSurveyModel(modelWithEmptyElements)).toBe(true);
  });
});
