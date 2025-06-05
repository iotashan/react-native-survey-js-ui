import type { SurveyModel, QuestionModel } from './index';

describe('Type Definitions', () => {
  it('should define SurveyModel interface', () => {
    const survey: SurveyModel = {
      title: 'Test Survey',
      pages: []
    };
    expect(survey).toBeDefined();
    expect(survey.title).toBe('Test Survey');
  });

  it('should define QuestionModel interface', () => {
    const question: QuestionModel = {
      name: 'q1',
      type: 'text',
      title: 'Test Question'
    };
    expect(question).toBeDefined();
    expect(question.name).toBe('q1');
    expect(question.type).toBe('text');
  });
});