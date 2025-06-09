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
            // @ts-ignore - rows can be a number for comment questions
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
            // @ts-ignore - rows can be a number for comment questions
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

// Multi-Page Demo Survey Example (using only text questions for now)
export const multiPageDemoSurvey: SurveyExample = {
  id: 'multi-page-demo',
  title: 'Multi-Page Demo Survey',
  description: 'Comprehensive multi-page survey demonstrating navigation flow',
  model: {
    title: 'Customer Experience Survey',
    description: 'Help us understand your experience with our services',
    showProgressBar: 'top',
    showQuestionNumbers: 'on',
    pages: [
      {
        name: 'welcome',
        title: 'Welcome',
        elements: [
          {
            type: 'text',
            name: 'participantName',
            title: 'Your Name (Optional)',
            placeHolder: 'Enter your name',
          },
          {
            type: 'text',
            name: 'email',
            title: 'Email Address (Optional)',
            placeHolder: 'email@example.com',
            validators: [
              {
                type: 'email',
                text: 'Please enter a valid email address',
              },
            ],
          },
        ],
      },
      {
        name: 'demographics',
        title: 'About You',
        elements: [
          {
            type: 'text',
            name: 'ageGroup',
            title: 'What is your age group? (18-24, 25-34, 35-44, 45-54, 55-64, 65+)',
            isRequired: true,
            placeHolder: 'e.g., 25-34',
          },
          {
            type: 'text',
            name: 'customerType',
            title: 'How would you describe yourself as a customer?',
            isRequired: true,
            placeHolder: 'e.g., New customer, Regular customer, Loyal customer',
          },
          {
            type: 'text',
            name: 'interests',
            title: 'Which of our services interest you most?',
            placeHolder: 'e.g., Product Development, Customer Support, etc.',
          },
        ],
      },
      {
        name: 'experience',
        title: 'Your Experience',
        elements: [
          {
            type: 'text',
            name: 'overallSatisfaction',
            title: 'Rate your overall satisfaction (1-10, where 10 is very satisfied)',
            isRequired: true,
            inputType: 'number',
            validators: [
              {
                type: 'numeric',
                minValue: 1,
                maxValue: 10,
                text: 'Please enter a number between 1 and 10',
              },
            ],
            placeHolder: 'Enter a number from 1 to 10',
          },
          {
            type: 'text',
            name: 'serviceQuality',
            title: 'How would you rate our service quality?',
            placeHolder: 'e.g., Excellent, Good, Fair, Poor',
          },
          {
            type: 'text',
            name: 'wouldRecommend',
            title: 'Would you recommend our services to others? (Yes/No)',
            isRequired: true,
            placeHolder: 'Yes or No',
          },
        ],
      },
      {
        name: 'feedback',
        title: 'Your Feedback',
        elements: [
          {
            type: 'text',
            name: 'improvements',
            title: 'What improvements would you like to see?',
            placeHolder: 'Please share your suggestions...',
          },
          {
            type: 'text',
            name: 'additionalComments',
            title: 'Any additional comments?',
            placeHolder: 'Feel free to share any other thoughts...',
          },
          {
            type: 'text',
            name: 'contactPreference',
            title: 'How would you prefer us to contact you for follow-up?',
            placeHolder: 'e.g., Email, Phone, Text message, Do not contact',
          },
        ],
      },
      {
        name: 'completion',
        title: 'Thank You!',
        elements: [
          {
            type: 'text',
            name: 'finalThoughts',
            title: 'Any final thoughts about your experience with us?',
            placeHolder: 'Thank you for your time and feedback!',
          },
          {
            type: 'text',
            name: 'subscribe',
            title: 'Would you like to subscribe to our newsletter? (Yes/No)',
            placeHolder: 'Yes or No',
          },
        ],
      },
    ],
  },
};

// Submission Mode Examples
export const realtimeSubmissionSurvey: SurveyExample = {
  id: 'realtime-submission',
  title: 'Real-time Submission Demo',
  description: 'Data is submitted continuously as you type (with debouncing)',
  model: {
    title: 'Real-time Data Collection',
    description: 'This form saves your progress automatically as you type',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'text',
            name: 'thoughts',
            title: 'Share your thoughts',
            description: 'Start typing to see real-time submission in action',
            placeHolder: 'Your thoughts are saved automatically...',
          },
          {
            type: 'rating',
            name: 'satisfaction',
            title: 'How satisfied are you?',
            rateMin: 1,
            rateMax: 10,
            rateStep: 1,
            minRateDescription: 'Not satisfied',
            maxRateDescription: 'Very satisfied',
          },
        ],
      },
    ],
  },
};

export const pageChangeSubmissionSurvey: SurveyExample = {
  id: 'page-change-submission',
  title: 'Page Change Submission Demo',
  description: 'Data is submitted at the end of each page',
  model: {
    title: 'Multi-step Registration',
    description: 'Your data is saved after each step',
    pages: [
      {
        name: 'personal',
        title: 'Personal Information',
        elements: [
          {
            type: 'text',
            name: 'firstName',
            title: 'First Name',
            isRequired: true,
          },
          {
            type: 'text',
            name: 'lastName',
            title: 'Last Name',
            isRequired: true,
          },
        ],
      },
      {
        name: 'contact',
        title: 'Contact Information',
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
            name: 'phone',
            title: 'Phone Number',
            placeHolder: '+1 (555) 123-4567',
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
            title: 'What are you interested in?',
            choices: [
              'Technology',
              'Sports',
              'Music',
              'Travel',
              'Food',
            ],
          },
        ],
      },
    ],
  },
};

export const valueChangeSubmissionSurvey: SurveyExample = {
  id: 'value-change-submission',
  title: 'Value Change Submission Demo',
  description: 'Data is submitted immediately on every field change',
  model: {
    title: 'Instant Feedback Form',
    description: 'Each answer is submitted immediately',
    pages: [
      {
        name: 'feedback',
        elements: [
          {
            type: 'radiogroup',
            name: 'rating',
            title: 'How would you rate our service?',
            choices: [
              { value: 'excellent', text: 'Excellent' },
              { value: 'good', text: 'Good' },
              { value: 'average', text: 'Average' },
              { value: 'poor', text: 'Poor' },
            ],
          },
          {
            type: 'boolean',
            name: 'recommend',
            title: 'Would you recommend us to others?',
          },
          {
            type: 'comment',
            name: 'comments',
            title: 'Additional comments',
            placeHolder: 'Any additional feedback...',
          },
        ],
      },
    ],
  },
};

// All survey examples
export const surveyExamples: SurveyExample[] = [
  basicTextSurvey,
  multipleChoiceSurvey,
  mixedTypesSurvey,
  validationSurvey,
  multiPageDemoSurvey,
  realtimeSubmissionSurvey,
  pageChangeSubmissionSurvey,
  valueChangeSubmissionSurvey,
  invalidModelExample,
];

export const getSurveyExampleById = (id: string): SurveyExample | undefined => {
  return surveyExamples.find((example) => example.id === id);
};
