/**
 * Factory functions for creating test survey JSON models
 * Provides consistent test data across the test suite
 */

import { SurveyJSON } from '../types/SurveyTypes';

/**
 * Create a basic survey with single text question
 */
export function createBasicSurvey(overrides?: Partial<SurveyJSON>): SurveyJSON {
  return {
    title: 'Basic Test Survey',
    description: 'A simple survey for testing',
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
        ],
      },
    ],
    ...overrides,
  };
}

/**
 * Create a multi-page survey
 */
export function createMultiPageSurvey(pageCount: number = 3): SurveyJSON {
  const pages = Array.from({ length: pageCount }, (_, i) => ({
    name: `page${i + 1}`,
    title: `Page ${i + 1}`,
    elements: [
      {
        type: 'text',
        name: `question${i + 1}`,
        title: `Question on page ${i + 1}`,
      },
    ],
  }));

  return {
    title: 'Multi-Page Survey',
    pages,
    showProgressBar: 'top',
    showQuestionNumbers: 'on',
  };
}

/**
 * Create a survey with various question types
 */
export function createMixedQuestionSurvey(): SurveyJSON {
  return {
    title: 'Mixed Question Types Survey',
    pages: [
      {
        name: 'demographics',
        title: 'Demographics',
        elements: [
          {
            type: 'text',
            name: 'fullName',
            title: 'Full Name',
            isRequired: true,
          },
          {
            type: 'dropdown',
            name: 'country',
            title: 'Country',
            choices: ['USA', 'Canada', 'UK', 'Other'],
            hasOther: true,
          },
          {
            type: 'radiogroup',
            name: 'gender',
            title: 'Gender',
            choices: ['Male', 'Female', 'Other', 'Prefer not to say'],
          },
        ],
      },
      {
        name: 'preferences',
        title: 'Preferences',
        elements: [
          {
            type: 'checkbox',
            name: 'interests',
            title: 'What are your interests?',
            choices: ['Sports', 'Music', 'Reading', 'Technology', 'Travel'],
          },
          {
            type: 'rating',
            name: 'satisfaction',
            title: 'How satisfied are you?',
            rateMin: 1,
            rateMax: 5,
          },
          {
            type: 'comment',
            name: 'feedback',
            title: 'Additional feedback',
            // @ts-ignore - rows is valid for comment type
            rows: 4,
          },
        ],
      },
    ],
  };
}

/**
 * Create a survey with conditional logic
 */
export function createConditionalSurvey(): SurveyJSON {
  return {
    title: 'Conditional Logic Survey',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'radiogroup',
            name: 'hasExperience',
            title: 'Do you have experience with React Native?',
            choices: ['Yes', 'No'],
            isRequired: true,
          },
          {
            type: 'text',
            name: 'yearsExperience',
            title: 'How many years of experience?',
            visibleIf: '{hasExperience} = "Yes"',
            inputType: 'number',
          },
          {
            type: 'radiogroup',
            name: 'learningInterest',
            title: 'Would you like to learn React Native?',
            choices: ['Yes', 'No', 'Maybe'],
            visibleIf: '{hasExperience} = "No"',
          },
        ],
      },
    ],
  };
}

/**
 * Create a survey with validation rules
 */
export function createValidationSurvey(): SurveyJSON {
  return {
    title: 'Validation Test Survey',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'text',
            name: 'email',
            title: 'Email Address',
            isRequired: true,
            validators: [
              {
                type: 'email',
                text: 'Please enter a valid email address',
              },
            ],
          },
          {
            type: 'text',
            name: 'age',
            title: 'Age',
            inputType: 'number',
            validators: [
              {
                type: 'numeric',
                minValue: 18,
                maxValue: 120,
                text: 'Age must be between 18 and 120',
              },
            ],
          },
          {
            type: 'text',
            name: 'phone',
            title: 'Phone Number',
            validators: [
              {
                type: 'regex',
                regex: '^[0-9]{3}-[0-9]{3}-[0-9]{4}$',
                text: 'Please enter phone in format: 123-456-7890',
              },
            ],
          },
        ],
      },
    ],
  };
}

/**
 * Create a minimal survey for quick tests
 */
export function createMinimalSurvey(): SurveyJSON {
  return {
    pages: [
      {
        elements: [
          {
            type: 'text',
            name: 'q1',
          },
        ],
      },
    ],
  };
}

/**
 * Create survey with specific question type
 */
export function createSurveyWithQuestionType(
  type: string,
  questionConfig?: any
): SurveyJSON {
  return {
    title: `${type} Question Test`,
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type,
            name: 'testQuestion',
            title: `Test ${type} question`,
            ...questionConfig,
          },
        ],
      },
    ],
  };
}

/**
 * Create survey with custom theme
 */
export function createThemedSurvey(): SurveyJSON {
  return {
    title: 'Themed Survey',
    theme: {
      colorPalette: 'dark',
      fontSize: 16,
      cornerRadius: 8,
    },
    pages: [
      {
        elements: [
          {
            type: 'text',
            name: 'themedQuestion',
            title: 'This question uses custom theme',
          },
        ],
      },
    ],
  };
}

/**
 * Utility to add questions to existing survey
 */
export function addQuestionToSurvey(
  survey: SurveyJSON,
  question: any,
  pageIndex: number = 0
): SurveyJSON {
  const updatedSurvey = { ...survey };
  if (!updatedSurvey.pages[pageIndex]) {
    updatedSurvey.pages[pageIndex] = { elements: [] };
  }
  updatedSurvey.pages[pageIndex].elements.push(question);
  return updatedSurvey;
}

/**
 * Create survey with specific error scenario
 */
export function createErrorSurvey(
  scenario: 'invalid' | 'empty' | 'circular'
): any {
  switch (scenario) {
    case 'invalid':
      return { notAValidSurvey: true };
    case 'empty':
      return {};
    case 'circular':
      const circular: any = { pages: [] };
      circular.self = circular; // Creates circular reference
      return circular;
    default:
      return null;
  }
}
