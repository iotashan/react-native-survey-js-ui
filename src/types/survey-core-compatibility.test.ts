/**
 * Tests to verify compatibility with survey-core types
 * Note: We only test type compatibility, not runtime behavior
 */
import type { SurveyModel, QuestionModel } from './index';

describe('Survey-Core Compatibility', () => {
  it('should accept survey-core JSON format', () => {
    // This is a typical SurveyJS JSON structure
    const surveyJSON = {
      title: 'Customer Satisfaction Survey',
      pages: [
        {
          name: 'page1',
          elements: [
            {
              type: 'text',
              name: 'name',
              title: 'What is your name?',
              isRequired: true,
            },
            {
              type: 'radiogroup',
              name: 'satisfaction',
              title: 'How satisfied are you?',
              choices: [
                'Very Satisfied',
                'Satisfied',
                'Neutral',
                'Dissatisfied',
              ],
            },
          ],
        },
      ],
      showProgressBar: 'top',
      showQuestionNumbers: 'on',
    };

    // Our types should accept this structure
    const survey: SurveyModel = surveyJSON;
    expect(survey.title).toBe('Customer Satisfaction Survey');
    expect(survey.pages).toHaveLength(1);
    expect(survey.pages[0].elements).toHaveLength(2);
  });

  it('should support survey-core question types', () => {
    const questions: QuestionModel[] = [
      { name: 'q1', type: 'text' },
      { name: 'q2', type: 'radiogroup', choices: ['Yes', 'No'] },
      { name: 'q3', type: 'checkbox', choices: ['A', 'B', 'C'] },
      { name: 'q4', type: 'dropdown', choices: ['Option 1', 'Option 2'] },
      { name: 'q5', type: 'comment' },
      { name: 'q6', type: 'rating', rateMin: 1, rateMax: 5 },
      { name: 'q7', type: 'boolean' },
      {
        name: 'q8',
        type: 'matrix',
        columns: ['Col1', 'Col2'],
        rows: ['Row1', 'Row2'],
      },
      { name: 'q9', type: 'file' },
      { name: 'q10', type: 'imagepicker' },
    ];

    questions.forEach((q) => {
      expect(q.name).toBeDefined();
      expect(q.type).toBeDefined();
    });
  });

  it('should support survey-core validator types', () => {
    const question: QuestionModel = {
      name: 'email',
      type: 'text',
      validators: [
        { type: 'email' },
        { type: 'required' },
        { type: 'regex', regex: '^[A-Za-z]+$' },
        { type: 'numeric', minValue: 0, maxValue: 100 },
        { type: 'text', minLength: 5, maxLength: 50 },
        { type: 'expression', expression: '{age} >= 18' },
      ],
    };

    expect(question.validators).toHaveLength(6);
  });

  it('should support survey-core trigger types', () => {
    const survey: SurveyModel = {
      pages: [],
      triggers: [
        { type: 'complete', expression: '{score} > 80' },
        { type: 'setvalue', expression: '{q1} = "yes"' },
        { type: 'copyvalue', expression: '{q2} empty' },
        { type: 'skip', expression: '{age} < 18' },
        { type: 'runexpression', expression: '{total} > 100' },
      ],
    };

    expect(survey.triggers).toHaveLength(5);
  });

  it('should support conditional visibility expressions', () => {
    const question: QuestionModel = {
      name: 'followup',
      type: 'text',
      visibleIf: '{primaryQuestion} = "yes"',
      enableIf: '{age} >= 18',
      requiredIf: '{importance} = "high"',
    };

    expect(question.visibleIf).toBeDefined();
    expect(question.enableIf).toBeDefined();
    expect(question.requiredIf).toBeDefined();
  });

  it('should support survey themes and styling', () => {
    const survey: SurveyModel = {
      pages: [],
      showProgressBar: 'top',
      progressBarType: 'questions',
      showTimerPanel: 'bottom',
      maxTimeToFinish: 600,
      firstPageIsStarted: true,
      startSurveyText: 'Start Survey',
      pagePrevText: 'Previous',
      pageNextText: 'Next',
      completeText: 'Submit',
    };

    expect(survey.showProgressBar).toBe('top');
    expect(survey.maxTimeToFinish).toBe(600);
  });

  it('should support matrix question types', () => {
    const matrixQuestion: QuestionModel = {
      name: 'satisfaction_matrix',
      type: 'matrix',
      title: 'Please rate the following',
      columns: [
        { value: '1', text: 'Strongly Disagree' },
        { value: '2', text: 'Disagree' },
        { value: '3', text: 'Neutral' },
        { value: '4', text: 'Agree' },
        { value: '5', text: 'Strongly Agree' },
      ],
      rows: [
        { value: 'quality', text: 'Quality of Service' },
        { value: 'value', text: 'Value for Money' },
        { value: 'support', text: 'Customer Support' },
      ],
      isAllRowRequired: true,
    };

    expect(matrixQuestion.columns).toHaveLength(5);
    expect(matrixQuestion.rows).toHaveLength(3);
  });

  it('should support calculated values', () => {
    const survey: SurveyModel = {
      pages: [],
      calculatedValues: [
        {
          name: 'total',
          expression: '{q1} + {q2} + {q3}',
        },
        {
          name: 'average',
          expression: '({q1} + {q2} + {q3}) / 3',
          includeIntoResult: true,
        },
      ],
    };

    expect(survey.calculatedValues).toHaveLength(2);
    expect(survey.calculatedValues![1].includeIntoResult).toBe(true);
  });

  it('should support panel and panel dynamic types', () => {
    const panelQuestion: QuestionModel = {
      name: 'address_panel',
      type: 'panel',
      title: 'Address Information',
      elements: [
        { name: 'street', type: 'text', title: 'Street' },
        { name: 'city', type: 'text', title: 'City' },
        { name: 'zip', type: 'text', title: 'ZIP Code' },
      ] as any,
    };

    const panelDynamicQuestion: QuestionModel = {
      name: 'contacts',
      type: 'paneldynamic',
      title: 'Add your contacts',
      templateElements: [
        { name: 'name', type: 'text', title: 'Name' },
        { name: 'email', type: 'text', title: 'Email', inputType: 'email' },
      ] as any,
      panelCount: 1,
      minPanelCount: 1,
      maxPanelCount: 10,
    };

    expect(panelQuestion.type).toBe('panel');
    expect(panelDynamicQuestion.type).toBe('paneldynamic');
  });

  it('should support localization features', () => {
    const survey: SurveyModel = {
      locale: 'en',
      pages: [
        {
          elements: [
            {
              name: 'greeting',
              type: 'text',
              title: {
                default: 'What is your name?',
                en: 'What is your name?',
                fr: 'Quel est votre nom?',
                es: '¿Cuál es tu nombre?',
              } as any,
            },
          ],
        },
      ],
    };

    expect(survey.locale).toBe('en');
  });

  it('should support survey completion settings', () => {
    const survey: SurveyModel = {
      pages: [],
      completedHtml: '<h1>Thank you for completing the survey!</h1>',
      completedBeforeHtml:
        '<p>Please review your answers before submitting.</p>',
      completedHtmlOnCondition: [
        {
          expression: '{score} > 90',
          html: '<h1>Excellent! You scored above 90%</h1>',
        },
        {
          expression: '{score} > 70',
          html: '<h1>Good job! You scored above 70%</h1>',
        },
      ],
      showCompletedPage: true,
      navigateToUrl: 'https://example.com/thank-you',
      navigateToUrlOnCondition: [
        {
          expression: '{userType} = "premium"',
          url: 'https://example.com/premium-thanks',
        },
      ],
    };

    expect(survey.completedHtml).toBeDefined();
    expect(survey.completedHtmlOnCondition).toHaveLength(2);
    expect(survey.navigateToUrlOnCondition).toHaveLength(1);
  });

  it('should support various data collection features', () => {
    const survey: SurveyModel = {
      pages: [],
      sendResultOnPageNext: true,
      showProgressBar: 'bottom',
      progressBarType: 'pages',
      storeOthersAsComment: true,
      maxTextLength: 500,
      maxOthersLength: 100,
      clearInvisibleValues: 'onHidden',
      checkErrorsMode: 'onValueChanged',
      textUpdateMode: 'onTyping',
    };

    expect(survey.clearInvisibleValues).toBe('onHidden');
  });
});

