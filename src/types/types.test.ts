import {
  type SurveyModel,
  type PageModel,
  type QuestionModel,
  type ValidatorModel,
  type QuestionType,
  type SurveyData,
  type SurveyResult,
  type SurveyEvent,
  type SurveyTheme,
  type ChoiceItem,
  type MatrixRow,
  type MatrixColumn,
  type LocalizableString,
  type SurveyTrigger,
  type SurveyCalculatedValue,
  type SurveyVariable,
  type SurveyCompletedOptions,
  type SurveyMode,
  isSurveyModel,
  isPageModel,
  isQuestionModel,
} from './index';

describe('Type Definitions', () => {
  describe('SurveyModel', () => {
    it('should define basic survey properties', () => {
      const survey: SurveyModel = {
        title: 'Test Survey',
        description: 'A test survey',
        pages: [],
        locale: 'en',
        showProgressBar: 'top',
        showQuestionNumbers: 'on',
      };
      expect(survey).toBeDefined();
      expect(survey.title).toBe('Test Survey');
      expect(survey.description).toBe('A test survey');
      expect(survey.locale).toBe('en');
    });

    it('should support navigation properties', () => {
      const survey: SurveyModel = {
        pages: [],
        showNavigationButtons: true,
        showPrevButton: true,
        showCompleteButton: true,
        showPageTitles: true,
        showPageNumbers: true,
        navigateToUrl: 'https://example.com',
        navigateToUrlOnCondition: [
          {
            expression: '{score} > 80',
            url: 'https://example.com/success',
          },
        ],
      };
      expect(survey.showNavigationButtons).toBe(true);
      expect(survey.navigateToUrlOnCondition).toHaveLength(1);
    });

    it('should support survey timing properties', () => {
      const survey: SurveyModel = {
        pages: [],
        showTimerPanel: 'top',
        showTimerPanelMode: 'survey',
        maxTimeToFinish: 300,
        maxTimeToFinishPage: 60,
      };
      expect(survey.showTimerPanel).toBe('top');
      expect(survey.maxTimeToFinish).toBe(300);
    });

    it('should support completion properties', () => {
      const survey: SurveyModel = {
        pages: [],
        completedHtml: '<h1>Thank you!</h1>',
        completedBeforeHtml: '<p>Please review your answers</p>',
        loadingHtml: '<p>Loading...</p>',
        completedHtmlOnCondition: [
          {
            expression: '{score} > 90',
            html: '<h1>Excellent!</h1>',
          },
        ],
      };
      expect(survey.completedHtml).toBe('<h1>Thank you!</h1>');
      expect(survey.completedHtmlOnCondition).toHaveLength(1);
    });

    it('should support survey data and mode', () => {
      const survey: SurveyModel = {
        pages: [],
        mode: 'edit',
        data: { q1: 'answer1', q2: 'answer2' },
        clearInvisibleValues: 'onHidden',
        questionsOnPageMode: 'standard',
      };
      expect(survey.mode).toBe('edit');
      expect(survey.data).toEqual({ q1: 'answer1', q2: 'answer2' });
    });

    it('should support triggers and calculatedValues', () => {
      const survey: SurveyModel = {
        pages: [],
        triggers: [
          {
            type: 'complete',
            expression: '{score} > 80',
          },
        ],
        calculatedValues: [
          {
            name: 'score',
            expression: '{q1} + {q2}',
          },
        ],
        variables: [
          {
            name: 'var1',
            value: 100,
          },
        ],
      };
      expect(survey.triggers).toHaveLength(1);
      expect(survey.calculatedValues).toHaveLength(1);
      expect(survey.variables).toHaveLength(1);
    });
  });

  describe('PageModel', () => {
    it('should define basic page properties', () => {
      const page: PageModel = {
        name: 'page1',
        title: 'First Page',
        description: 'This is the first page',
        elements: [],
        visible: true,
        visibleIf: '{age} >= 18',
      };
      expect(page.name).toBe('page1');
      expect(page.visible).toBe(true);
    });

    it('should support page navigation properties', () => {
      const page: PageModel = {
        elements: [],
        navigationButtonsVisibility: 'show',
        maxTimeToFinish: 120,
        questionsOrder: 'random',
        navigationTitle: 'Personal Info',
        navigationDescription: 'Please fill in your details',
      };
      expect(page.navigationButtonsVisibility).toBe('show');
      expect(page.questionsOrder).toBe('random');
    });

    it('should support page conditions', () => {
      const page: PageModel = {
        elements: [],
        enableIf: '{consent} = true',
        requiredIf: '{category} = "important"',
      };
      expect(page.enableIf).toBe('{consent} = true');
      expect(page.requiredIf).toBe('{category} = "important"');
    });
  });

  describe('QuestionModel', () => {
    it('should define basic question properties', () => {
      const question: QuestionModel = {
        name: 'q1',
        type: 'text',
        title: 'Test Question',
        description: 'Please answer this question',
        isRequired: true,
        visible: true,
        visibleIf: '{age} >= 18',
        validators: [],
      };
      expect(question.name).toBe('q1');
      expect(question.type).toBe('text');
      expect(question.isRequired).toBe(true);
    });

    it('should support question state properties', () => {
      const question: QuestionModel = {
        name: 'q1',
        type: 'text',
        readOnly: false,
        enableIf: '{consent} = true',
        requiredIf: '{category} = "required"',
        defaultValue: 'Default text',
        correctAnswer: 'Correct',
        startWithNewLine: true,
        indent: 2,
        width: '50%',
      };
      expect(question.readOnly).toBe(false);
      expect(question.defaultValue).toBe('Default text');
      expect(question.width).toBe('50%');
    });

    it('should support question validation', () => {
      const question: QuestionModel = {
        name: 'email',
        type: 'text',
        validators: [
          { type: 'email', text: 'Please enter a valid email' },
          { type: 'required', text: 'Email is required' },
        ],
        requiredErrorText: 'This field is required',
        inputType: 'email',
        placeholder: 'Enter your email',
      };
      expect(question.validators).toHaveLength(2);
      expect(question.inputType).toBe('email');
    });

    it('should support choice questions', () => {
      const question: QuestionModel = {
        name: 'q1',
        type: 'radiogroup',
        choices: [
          { value: '1', text: 'Option 1' },
          { value: '2', text: 'Option 2' },
          'Option 3',
        ],
        choicesOrder: 'random',
        hasOther: true,
        otherText: 'Other (please specify)',
        hasNone: true,
        noneText: 'None of the above',
      };
      expect(question.choices).toHaveLength(3);
      expect(question.hasOther).toBe(true);
    });

    it('should support rating questions', () => {
      const question: QuestionModel = {
        name: 'rating1',
        type: 'rating',
        rateMin: 1,
        rateMax: 10,
        rateStep: 1,
        minRateDescription: 'Poor',
        maxRateDescription: 'Excellent',
      };
      expect(question.rateMin).toBe(1);
      expect(question.rateMax).toBe(10);
    });

    it('should support matrix questions', () => {
      const question: QuestionModel = {
        name: 'matrix1',
        type: 'matrix',
        columns: [
          { value: '1', text: 'Strongly Disagree' },
          { value: '2', text: 'Disagree' },
          { value: '3', text: 'Neutral' },
          { value: '4', text: 'Agree' },
          { value: '5', text: 'Strongly Agree' },
        ],
        rows: [
          { value: 'quality', text: 'Product Quality' },
          { value: 'support', text: 'Customer Support' },
          { value: 'value', text: 'Value for Money' },
        ],
        isAllRowRequired: true,
      };
      expect(question.columns).toHaveLength(5);
      expect(question.rows).toHaveLength(3);
      expect(question.isAllRowRequired).toBe(true);
    });
  });

  describe('ValidatorModel', () => {
    it('should define email validator', () => {
      const validator: ValidatorModel = {
        type: 'email',
        text: 'Please enter a valid email address',
      };
      expect(validator.type).toBe('email');
    });

    it('should define numeric validator', () => {
      const validator: ValidatorModel = {
        type: 'numeric',
        text: 'Please enter a number',
        minValue: 0,
        maxValue: 100,
      };
      expect(validator.type).toBe('numeric');
      expect(validator.minValue).toBe(0);
      expect(validator.maxValue).toBe(100);
    });

    it('should define text length validator', () => {
      const validator: ValidatorModel = {
        type: 'text',
        text: 'Text must be between 5 and 50 characters',
        minLength: 5,
        maxLength: 50,
      };
      expect(validator.type).toBe('text');
      expect(validator.minLength).toBe(5);
    });

    it('should define regex validator', () => {
      const validator: ValidatorModel = {
        type: 'regex',
        text: 'Please enter a valid phone number',
        regex: '^\\d{3}-\\d{3}-\\d{4}$',
      };
      expect(validator.type).toBe('regex');
      expect(validator.regex).toBeDefined();
    });

    it('should define expression validator', () => {
      const validator: ValidatorModel = {
        type: 'expression',
        text: 'Age must be 18 or older',
        expression: '{age} >= 18',
      };
      expect(validator.type).toBe('expression');
      expect(validator.expression).toBe('{age} >= 18');
    });
  });

  describe('QuestionType', () => {
    it('should accept all valid question types', () => {
      const types: QuestionType[] = [
        'text',
        'radiogroup',
        'checkbox',
        'dropdown',
        'comment',
        'rating',
        'boolean',
        'matrix',
        'matrixdropdown',
        'matrixdynamic',
        'multipletext',
        'panel',
        'paneldynamic',
        'html',
        'expression',
        'file',
        'imagepicker',
        'ranking',
        'image',
        'empty',
        'signaturepad',
      ];
      expect(types).toHaveLength(21);
    });
  });

  describe('Survey Events', () => {
    it('should define survey event types', () => {
      const completeEvent: SurveyEvent = {
        type: 'complete',
        data: { isCompleted: true },
        sender: {} as any,
      };
      expect(completeEvent.type).toBe('complete');

      const valueChangedEvent: SurveyEvent = {
        type: 'valueChanged',
        name: 'q1',
        value: 'new value',
        oldValue: 'old value',
        sender: {} as any,
      };
      expect(valueChangedEvent.name).toBe('q1');
      expect(valueChangedEvent.value).toBe('new value');
    });
  });

  describe('Survey Data and Results', () => {
    it('should define survey data structure', () => {
      const data: SurveyData = {
        q1: 'answer1',
        q2: ['option1', 'option2'],
        q3: { row1: 'col1', row2: 'col2' },
        q4: 5,
        q5: true,
      };
      expect(data.q1).toBe('answer1');
      expect(Array.isArray(data.q2)).toBe(true);
    });

    it('should define survey result structure', () => {
      const result: SurveyResult = {
        data: { q1: 'answer1' },
        isCompleted: true,
        completedAt: new Date().toISOString(),
        timeSpent: 300,
      };
      expect(result.isCompleted).toBe(true);
      expect(result.timeSpent).toBe(300);
    });
  });

  describe('Survey Theme', () => {
    it('should define survey theme structure', () => {
      const theme: SurveyTheme = {
        themeName: 'custom',
        colorPalette: 'light',
        isPanelless: false,
        backgroundImage: 'url(image.jpg)',
        backgroundOpacity: 0.8,
        cssVariables: {
          '--primary-color': '#007bff',
          '--background-color': '#f8f9fa',
        },
      };
      expect(theme.themeName).toBe('custom');
      expect(theme.colorPalette).toBe('light');
      expect(theme.cssVariables['--primary-color']).toBe('#007bff');
    });
  });

  describe('Supporting Types', () => {
    it('should define ChoiceItem', () => {
      const choice: ChoiceItem = {
        value: '1',
        text: 'Option 1',
        visibleIf: '{showAdvanced} = true',
        enableIf: '{canSelect} = true',
      };
      expect(choice.value).toBe('1');
      expect(choice.text).toBe('Option 1');
    });

    it('should define MatrixRow and MatrixColumn', () => {
      const row: MatrixRow = {
        value: 'row1',
        text: 'First Row',
        visibleIf: '{showRow1} = true',
      };
      const column: MatrixColumn = {
        value: 'col1',
        text: 'Column 1',
        width: '150px',
      };
      expect(row.value).toBe('row1');
      expect(column.width).toBe('150px');
    });

    it('should define LocalizableString', () => {
      const localizable: LocalizableString = {
        default: 'Hello',
        en: 'Hello',
        fr: 'Bonjour',
        es: 'Hola',
      };
      expect(localizable.en).toBe('Hello');
      expect(localizable.fr).toBe('Bonjour');
    });

    it('should define SurveyTrigger', () => {
      const trigger: SurveyTrigger = {
        type: 'complete',
        expression: '{score} > 80',
        name: 'highScoreTrigger',
      };
      expect(trigger.type).toBe('complete');
      expect(trigger.expression).toBe('{score} > 80');
    });

    it('should define SurveyCalculatedValue', () => {
      const calculated: SurveyCalculatedValue = {
        name: 'totalScore',
        expression: '{q1} + {q2} + {q3}',
        includeIntoResult: true,
      };
      expect(calculated.name).toBe('totalScore');
      expect(calculated.includeIntoResult).toBe(true);
    });

    it('should define SurveyVariable', () => {
      const variable: SurveyVariable = {
        name: 'currentYear',
        value: 2025,
      };
      expect(variable.name).toBe('currentYear');
      expect(variable.value).toBe(2025);
    });
  });

  describe('Type Guards', () => {
    it('should identify SurveyModel', () => {
      const survey = { pages: [], title: 'Test' };
      const notSurvey = { title: 'Test' };

      expect(isSurveyModel(survey)).toBe(true);
      expect(isSurveyModel(notSurvey)).toBe(false);
      expect(isSurveyModel(null)).toBe(false);
      expect(isSurveyModel(undefined)).toBe(false);
    });

    it('should identify PageModel', () => {
      const page = { elements: [], title: 'Page 1' };
      const notPage = { title: 'Page 1' };

      expect(isPageModel(page)).toBe(true);
      expect(isPageModel(notPage)).toBe(false);
      expect(isPageModel(null)).toBe(false);
    });

    it('should identify QuestionModel', () => {
      const question = { name: 'q1', type: 'text' };
      const notQuestion1 = { name: 'q1' };
      const notQuestion2 = { type: 'text' };

      expect(isQuestionModel(question)).toBe(true);
      expect(isQuestionModel(notQuestion1)).toBe(false);
      expect(isQuestionModel(notQuestion2)).toBe(false);
    });
  });

  describe('Enums and Constants', () => {
    it('should define SurveyMode enum', () => {
      const modes: SurveyMode[] = ['edit', 'display', 'preview'];
      expect(modes).toHaveLength(3);
    });

    it('should define SurveyCompletedOptions', () => {
      const options: SurveyCompletedOptions = {
        showDataSaving: true,
        showDataSavingClear: true,
        showDataSavingSuccess: true,
        showDataSavingError: true,
      };
      expect(options.showDataSaving).toBe(true);
    });
  });
});
