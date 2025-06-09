/**
 * Configurable mock scenarios for different test cases
 * Provides presets for common testing scenarios
 */

import { MockSurveyModel } from '../__mocks__/survey-core/Model.mock';

export interface MockScenarioConfig {
  name: string;
  description: string;
  setup: (model: MockSurveyModel) => void;
  validate?: (model: MockSurveyModel) => void;
}

/**
 * Scenario: Survey is loading
 */
export const loadingScenario: MockScenarioConfig = {
  name: 'loading',
  description: 'Survey is in loading state',
  setup: (model) => {
    // Simulate async loading by not having questions ready
    model.getAllQuestions = jest.fn().mockReturnValue([]);
    // Note: isLoading is not a property of survey-core Model
  },
};

/**
 * Scenario: Survey has validation errors
 */
export const validationErrorScenario: MockScenarioConfig = {
  name: 'validationError',
  description: 'Survey has validation errors on current page',
  setup: (_model) => {
    // Note: hasErrors and getAllErrors are not properties of survey-core Model
    // Would need to mock at question level for validation
  },
};

/**
 * Scenario: Survey is completed
 */
export const completedScenario: MockScenarioConfig = {
  name: 'completed',
  description: 'Survey has been completed',
  setup: (model) => {
    model.isCompleted = true;
    // Note: completedHtml is not a property of our MockSurveyModel
    model.data = {
      name: 'John Doe',
      email: 'john@example.com',
      satisfaction: 5,
    };
  },
};

/**
 * Scenario: Multi-page survey navigation
 */
export const multiPageScenario: MockScenarioConfig = {
  name: 'multiPage',
  description: 'Survey with multiple pages for navigation testing',
  setup: (model) => {
    model.pageCount = 3;
    model.currentPageNo = 1; // Middle page
    model.isFirstPage = false;
    model.isLastPage = false;
    // Note: visiblePageCount is not a property of our MockSurveyModel

    // Mock navigation methods
    model.nextPage = jest.fn().mockImplementation(() => {
      if (model.currentPageNo < model.pageCount - 1) {
        model.currentPageNo++;
        model.isFirstPage = false;
        model.isLastPage = model.currentPageNo === model.pageCount - 1;
        (model.onCurrentPageChanged as any).fire(model, {});
        return true;
      }
      return false;
    });

    model.prevPage = jest.fn().mockImplementation(() => {
      if (model.currentPageNo > 0) {
        model.currentPageNo--;
        model.isFirstPage = model.currentPageNo === 0;
        model.isLastPage = false;
        (model.onCurrentPageChanged as any).fire(model, {});
        return true;
      }
      return false;
    });
  },
};

/**
 * Scenario: Survey with conditional visibility
 */
export const conditionalVisibilityScenario: MockScenarioConfig = {
  name: 'conditionalVisibility',
  description: 'Survey with questions that show/hide based on conditions',
  setup: (model) => {
    const questions = [
      {
        name: 'hasExperience',
        value: 'Yes',
        type: 'radiogroup',
        title: 'Do you have experience?',
        visible: true,
        getType: () => 'radiogroup',
      },
      {
        name: 'yearsExperience',
        value: undefined,
        type: 'text',
        title: 'How many years?',
        visible: true, // Visible because hasExperience = Yes
        visibleIf: '{hasExperience} = "Yes"',
        getType: () => 'text',
      },
    ];

    model.getAllQuestions = jest.fn().mockReturnValue(questions);

    // Simulate value change affecting visibility
    const originalSetValue = model.setValue.bind(model);
    model.setValue = jest.fn().mockImplementation((name, value) => {
      originalSetValue(name, value);

      if (name === 'hasExperience') {
        (questions[1] as any).visible = value === 'Yes';
        (model.onQuestionVisibleChanged as any).fire(model, {
          question: questions[1],
          name: 'yearsExperience',
          visible: value === 'Yes',
        });
      }
    });
  },
};

/**
 * Scenario: Survey with async data loading
 */
export const asyncDataScenario: MockScenarioConfig = {
  name: 'asyncData',
  description: 'Survey that loads choices from external source',
  setup: (model) => {
    // Note: isLoadingChoices and onChoicesLoaded are not properties of our MockSurveyModel
    // Simulate async choice loading
    setTimeout(() => {
      const question = model.getQuestionByName('country');
      if (question) {
        (question as any).choices = ['USA', 'Canada', 'UK', 'Australia'];
      }
    }, 100);
  },
};

/**
 * Scenario: Survey with custom validation
 */
export const customValidationScenario: MockScenarioConfig = {
  name: 'customValidation',
  description: 'Survey with custom validation logic',
  setup: (model) => {
    // Note: onValidateQuestion and validateQuestion are not properties of our MockSurveyModel
    // Add validation logic
    (model as any).validateQuestion = jest.fn().mockImplementation((name: string) => {
      const errors = [];
      const value = model.getValue(name);

      if (name === 'age' && value) {
        const age = parseInt(value, 10);
        if (isNaN(age) || age < 18 || age > 120) {
          errors.push({ error: 'Age must be between 18 and 120' });
        }
      }

      if (name === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push({ error: 'Invalid email format' });
        }
      }

      return errors;
    });
  },
};

/**
 * Scenario: Survey in read-only mode
 */
export const readOnlyScenario: MockScenarioConfig = {
  name: 'readOnly',
  description: 'Survey in read-only/review mode',
  setup: (model) => {
    // Note: mode and isReadOnly are not properties of our MockSurveyModel
    (model as any).mode = 'display';
    (model as any).isReadOnly = true;

    // Pre-populate with data
    model.data = {
      name: 'John Doe',
      email: 'john@example.com',
      country: 'USA',
      satisfaction: 4,
    };

    // Override setValue to prevent changes
    model.setValue = jest.fn();
  },
};

/**
 * Scenario: Survey with network error
 */
export const networkErrorScenario: MockScenarioConfig = {
  name: 'networkError',
  description: 'Survey encounters network error during submission',
  setup: (model) => {
    // Note: onServerValidateQuestions is not a property of our MockSurveyModel

    model.completeLastPage = jest.fn().mockImplementation(() => {
      throw new Error('Network request failed');
    });
  },
};

/**
 * Apply a scenario to a mock model
 */
export function applyScenario(
  model: MockSurveyModel,
  scenario: MockScenarioConfig
): void {
  scenario.setup(model);
}

/**
 * Create a model with a specific scenario
 */
export function createModelWithScenario(
  json: any,
  scenario: MockScenarioConfig
): MockSurveyModel {
  const model = new MockSurveyModel(json);
  applyScenario(model, scenario);
  return model;
}

/**
 * Scenario registry for easy access
 */
export const scenarios = {
  loading: loadingScenario,
  validationError: validationErrorScenario,
  completed: completedScenario,
  multiPage: multiPageScenario,
  conditionalVisibility: conditionalVisibilityScenario,
  asyncData: asyncDataScenario,
  customValidation: customValidationScenario,
  readOnly: readOnlyScenario,
  networkError: networkErrorScenario,
};

/**
 * Get scenario by name
 */
export function getScenario(name: string): MockScenarioConfig | undefined {
  return scenarios[name as keyof typeof scenarios];
}

/**
 * List all available scenarios
 */
export function listScenarios(): string[] {
  return Object.keys(scenarios);
}
