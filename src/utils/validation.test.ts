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
              title: 'Question 1'
            }
          ]
        }
      ]
    };
    expect(validateSurveyModel(validModel)).toBe(true);
  });

  it('should return false for invalid survey model', () => {
    const invalidModel = {} as SurveyModel;
    expect(validateSurveyModel(invalidModel)).toBe(false);
  });

  it('should return false for survey without pages', () => {
    const modelWithoutPages = {
      title: 'Survey'
    } as SurveyModel;
    expect(validateSurveyModel(modelWithoutPages)).toBe(false);
  });
});