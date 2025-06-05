import type { SurveyModel } from 'react-native-survey-js-ui';

export interface SurveyExample {
  id: string;
  title: string;
  description: string;
  model: SurveyModel;
}

// Basic Text Survey Example
export const basicTextSurvey: SurveyExample = {
  id: 'basic-text',
  title: 'Basic Text Survey',
  description: 'Simple text input with validation',
  model: {
    title: 'Customer Feedback Form',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'text',
            name: 'customerName',
            title: 'What is your name?',
            isRequired: true,
            placeHolder: 'Enter your full name',
          },
          {
            type: 'text',
            name: 'email',
            title: 'What is your email address?',
            isRequired: true,
            validators: [
              {
                type: 'email',
                text: 'Please enter a valid email address',
              },
            ],
            placeHolder: 'email@example.com',
          },
          {
            type: 'comment',
            name: 'feedback',
            title: 'Please share your feedback',
            rows: 4,
            placeHolder: 'Tell us what you think...',
          },
        ],
      },
    ],
  },
};

// Multiple Choice Survey Example
export const multipleChoiceSurvey: SurveyExample = {
  id: 'multiple-choice',
  title: 'Multiple Choice Survey',
  description: 'Radio buttons and checkboxes demonstration',
  model: {
    title: 'Product Preferences Survey',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'radiogroup',
            name: 'favoriteProduct',
            title: 'Which is your favorite product?',
            isRequired: true,
            choices: ['Product A', 'Product B', 'Product C', 'Product D'],
          },
          {
            type: 'checkbox',
            name: 'features',
            title:
              'Which features are most important to you? (Select all that apply)',
            choices: [
              'Easy to use',
              'Good performance',
              'Nice design',
              'Good documentation',
              'Active community',
              'Regular updates',
            ],
          },
          {
            type: 'dropdown',
            name: 'experience',
            title: 'How long have you been using our products?',
            isRequired: true,
            choices: [
              'Less than 6 months',
              '6 months to 1 year',
              '1-2 years',
              '2-5 years',
              'More than 5 years',
            ],
          },
        ],
      },
    ],
  },
};

// Mixed Question Types Survey
export const mixedTypesSurvey: SurveyExample = {
  id: 'mixed-types',
  title: 'Mixed Question Types',
  description: 'Combination of different question types',
  model: {
    title: 'Employee Satisfaction Survey',
    showQuestionNumbers: 'on',
    pages: [
      {
        name: 'page1',
        title: 'Basic Information',
        elements: [
          {
            type: 'text',
            name: 'employeeId',
            title: 'Employee ID',
            isRequired: true,
            inputType: 'number',
          },
          {
            type: 'dropdown',
            name: 'department',
            title: 'Department',
            isRequired: true,
            choices: [
              'Engineering',
              'Sales',
              'Marketing',
              'HR',
              'Finance',
              'Operations',
            ],
          },
        ],
      },
      {
        name: 'page2',
        title: 'Job Satisfaction',
        elements: [
          {
            type: 'rating',
            name: 'jobSatisfaction',
            title: 'How satisfied are you with your current job?',
            isRequired: true,
            rateMin: 1,
            rateMax: 5,
            minRateDescription: 'Very Dissatisfied',
            maxRateDescription: 'Very Satisfied',
          },
          {
            type: 'boolean',
            name: 'wouldRecommend',
            title: 'Would you recommend this company to a friend?',
            isRequired: true,
          },
          {
            type: 'comment',
            name: 'improvements',
            title: 'What improvements would you suggest?',
            rows: 5,
          },
        ],
      },
    ],
  },
};

// Validation Example Survey
export const validationSurvey: SurveyExample = {
  id: 'validation',
  title: 'Validation Example',
  description: 'Required fields and validation rules',
  model: {
    title: 'Registration Form',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'text',
            name: 'username',
            title: 'Username',
            isRequired: true,
            validators: [
              {
                type: 'regex',
                regex: '^[a-zA-Z0-9_]{3,20}$',
                text: 'Username must be 3-20 characters, alphanumeric and underscore only',
              },
            ],
          },
          {
            type: 'text',
            name: 'age',
            title: 'Age',
            isRequired: true,
            inputType: 'number',
            validators: [
              {
                type: 'numeric',
                minValue: 18,
                maxValue: 100,
                text: 'Age must be between 18 and 100',
              },
            ],
          },
          {
            type: 'text',
            name: 'password',
            title: 'Password',
            isRequired: true,
            inputType: 'password',
            validators: [
              {
                type: 'text',
                minLength: 8,
                text: 'Password must be at least 8 characters',
              },
            ],
          },
          {
            type: 'text',
            name: 'confirmPassword',
            title: 'Confirm Password',
            isRequired: true,
            inputType: 'password',
            validators: [
              {
                type: 'expression',
                expression: '{password} = {confirmPassword}',
                text: 'Passwords must match',
              },
            ],
          },
        ],
      },
    ],
  },
};

// Error Scenario - Invalid Model
export const invalidModelExample: SurveyExample = {
  id: 'invalid-model',
  title: 'Invalid Model Example',
  description: 'Demonstrates error handling for invalid survey models',
  model: {
    // Missing required 'pages' property to demonstrate error handling
    title: 'This survey has an invalid structure',
  } as SurveyModel, // Type assertion to bypass compile-time check for demo purposes
};

// All survey examples
export const surveyExamples: SurveyExample[] = [
  basicTextSurvey,
  multipleChoiceSurvey,
  mixedTypesSurvey,
  validationSurvey,
  invalidModelExample,
];

export const getSurveyExampleById = (id: string): SurveyExample | undefined => {
  return surveyExamples.find((example) => example.id === id);
};
