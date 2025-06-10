import type { SurveyExample } from './surveyExamples';

// Basic Multi-Page Navigation Example
export const basicMultiPageExample: SurveyExample = {
  id: 'basic-multipage',
  title: 'Basic Multi-Page Navigation',
  description: 'Simple page navigation with Next/Previous buttons',
  model: {
    title: 'Customer Satisfaction Survey',
    showProgressBar: 'top',
    pages: [
      {
        name: 'page1',
        title: 'Welcome',
        elements: [
          {
            type: 'text',
            name: 'name',
            title: 'What is your name?',
            placeHolder: 'Enter your name',
          },
          {
            type: 'text',
            name: 'email',
            title: 'What is your email?',
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
        name: 'page2',
        title: 'Your Experience',
        elements: [
          {
            type: 'rating',
            name: 'satisfaction',
            title: 'How satisfied are you with our service?',
            rateMin: 1,
            rateMax: 5,
            minRateDescription: 'Very Unsatisfied',
            maxRateDescription: 'Very Satisfied',
          },
          {
            type: 'comment',
            name: 'feedback',
            title: 'Any additional feedback?',
            // @ts-ignore - rows can be a number for comment questions
            rows: 4,
            placeHolder: 'Your feedback helps us improve...',
          },
        ],
      },
      {
        name: 'page3',
        title: 'Thank You',
        elements: [
          {
            type: 'boolean',
            name: 'recommend',
            title: 'Would you recommend us to others?',
          },
          {
            type: 'checkbox',
            name: 'contactMethods',
            title: 'How would you like us to contact you?',
            choices: ['Email', 'Phone', 'Text', 'Do not contact'],
          },
        ],
      },
    ],
  },
};

// Validation Flow Example
export const validationFlowExample: SurveyExample = {
  id: 'validation-flow',
  title: 'Page Validation Example',
  description: 'Demonstrates validation before page change',
  model: {
    title: 'Registration Form with Validation',
    showProgressBar: 'bottom',
    checkErrorsMode: 'onNextPage',
    pages: [
      {
        name: 'personal',
        title: 'Personal Information',
        elements: [
          {
            type: 'text',
            name: 'firstName',
            title: 'First Name *',
            isRequired: true,
            requiredErrorText: 'First name is required',
          },
          {
            type: 'text',
            name: 'lastName',
            title: 'Last Name *',
            isRequired: true,
            requiredErrorText: 'Last name is required',
          },
          {
            type: 'text',
            name: 'age',
            title: 'Age *',
            isRequired: true,
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
        ],
      },
      {
        name: 'account',
        title: 'Account Setup',
        elements: [
          {
            type: 'text',
            name: 'username',
            title: 'Username *',
            isRequired: true,
            validators: [
              {
                type: 'regex',
                regex: '^[a-zA-Z0-9_]{4,20}$',
                text: 'Username must be 4-20 characters, alphanumeric and underscore only',
              },
            ],
          },
          {
            type: 'text',
            name: 'password',
            title: 'Password *',
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
            title: 'Confirm Password *',
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
      {
        name: 'preferences',
        title: 'Preferences',
        elements: [
          {
            type: 'radiogroup',
            name: 'newsletter',
            title: 'Subscribe to newsletter?',
            choices: ['Yes', 'No'],
            defaultValue: 'Yes',
          },
          {
            type: 'checkbox',
            name: 'interests',
            title: 'Select your interests',
            choices: ['Technology', 'Sports', 'Music', 'Travel', 'Food', 'Art'],
          },
        ],
      },
    ],
  },
};

// Dynamic Page Count Example
export const dynamicPageCountExample: SurveyExample = {
  id: 'dynamic-page-count',
  title: 'Dynamic Page Count',
  description: 'Pages shown/hidden based on answers',
  model: {
    title: 'Product Survey with Dynamic Pages',
    showProgressBar: 'top',
    progressBarType: 'questions',
    pages: [
      {
        name: 'initial',
        title: 'Initial Questions',
        elements: [
          {
            type: 'radiogroup',
            name: 'productUser',
            title: 'Are you a current user of our product?',
            isRequired: true,
            choices: ['Yes', 'No'],
          },
          {
            type: 'radiogroup',
            name: 'userType',
            title: 'What type of user are you?',
            choices: ['Individual', 'Business', 'Enterprise'],
            visibleIf: '{productUser} = "Yes"',
          },
        ],
      },
      {
        name: 'currentUser',
        title: 'Current User Questions',
        visibleIf: '{productUser} = "Yes"',
        elements: [
          {
            type: 'rating',
            name: 'satisfaction',
            title: 'How satisfied are you with our product?',
            rateMin: 1,
            rateMax: 10,
          },
          {
            type: 'checkbox',
            name: 'featuresUsed',
            title: 'Which features do you use?',
            choices: ['Feature A', 'Feature B', 'Feature C', 'Feature D'],
          },
        ],
      },
      {
        name: 'businessQuestions',
        title: 'Business User Questions',
        visibleIf: '{userType} = "Business" or {userType} = "Enterprise"',
        elements: [
          {
            type: 'text',
            name: 'companyName',
            title: 'Company Name',
          },
          {
            type: 'text',
            name: 'teamSize',
            title: 'Team Size',
            inputType: 'number',
          },
        ],
      },
      {
        name: 'potentialUser',
        title: 'Potential User Questions',
        visibleIf: '{productUser} = "No"',
        elements: [
          {
            type: 'radiogroup',
            name: 'interestedInProduct',
            title: 'Are you interested in trying our product?',
            choices: ['Yes', 'No', 'Maybe'],
          },
          {
            type: 'comment',
            name: 'whatWouldMakeYouTry',
            title: 'What would make you want to try our product?',
            visibleIf: '{interestedInProduct} = "Maybe"',
            // @ts-ignore - rows can be a number for comment questions
            rows: 3,
          },
        ],
      },
      {
        name: 'finalPage',
        title: 'Final Questions',
        elements: [
          {
            type: 'boolean',
            name: 'contactMe',
            title: 'May we contact you for follow-up?',
          },
          {
            type: 'text',
            name: 'contactEmail',
            title: 'Contact Email',
            visibleIf: '{contactMe} = true',
            validators: [
              {
                type: 'email',
                text: 'Please provide a valid email',
              },
            ],
          },
        ],
      },
    ],
  },
};

// Conditional Pages Example
export const conditionalPagesExample: SurveyExample = {
  id: 'conditional-pages',
  title: 'Conditional Page Display',
  description: 'Complex conditional logic for page visibility',
  model: {
    title: 'Insurance Quote Form',
    showProgressBar: 'bottom',
    pages: [
      {
        name: 'insuranceType',
        title: 'Insurance Type',
        elements: [
          {
            type: 'radiogroup',
            name: 'insuranceCategory',
            title: 'What type of insurance are you looking for?',
            isRequired: true,
            choices: ['Auto', 'Home', 'Life', 'Health'],
          },
        ],
      },
      {
        name: 'autoInsurance',
        title: 'Auto Insurance Details',
        visibleIf: '{insuranceCategory} = "Auto"',
        elements: [
          {
            type: 'text',
            name: 'vehicleMake',
            title: 'Vehicle Make',
            isRequired: true,
          },
          {
            type: 'text',
            name: 'vehicleModel',
            title: 'Vehicle Model',
            isRequired: true,
          },
          {
            type: 'text',
            name: 'vehicleYear',
            title: 'Vehicle Year',
            isRequired: true,
            inputType: 'number',
            validators: [
              {
                type: 'numeric',
                minValue: 1900,
                maxValue: 2025,
                text: 'Please enter a valid year',
              },
            ],
          },
        ],
      },
      {
        name: 'homeInsurance',
        title: 'Home Insurance Details',
        visibleIf: '{insuranceCategory} = "Home"',
        elements: [
          {
            type: 'text',
            name: 'homeAddress',
            title: 'Property Address',
            isRequired: true,
          },
          {
            type: 'radiogroup',
            name: 'homeType',
            title: 'Type of Home',
            choices: ['Single Family', 'Condo', 'Townhouse', 'Mobile Home'],
          },
          {
            type: 'text',
            name: 'homeValue',
            title: 'Estimated Home Value',
            inputType: 'number',
            placeHolder: 'Enter amount in USD',
          },
        ],
      },
      {
        name: 'lifeInsurance',
        title: 'Life Insurance Details',
        visibleIf: '{insuranceCategory} = "Life"',
        elements: [
          {
            type: 'text',
            name: 'coverageAmount',
            title: 'Desired Coverage Amount',
            inputType: 'number',
            isRequired: true,
          },
          {
            type: 'radiogroup',
            name: 'termLength',
            title: 'Term Length',
            choices: ['10 years', '20 years', '30 years', 'Whole Life'],
          },
          {
            type: 'boolean',
            name: 'smoker',
            title: 'Do you smoke?',
          },
        ],
      },
      {
        name: 'commonInfo',
        title: 'Personal Information',
        elements: [
          {
            type: 'text',
            name: 'fullName',
            title: 'Full Name',
            isRequired: true,
          },
          {
            type: 'text',
            name: 'phone',
            title: 'Phone Number',
            isRequired: true,
            inputType: 'tel',
          },
          {
            type: 'text',
            name: 'email',
            title: 'Email Address',
            isRequired: true,
            validators: [
              {
                type: 'email',
                text: 'Please enter a valid email',
              },
            ],
          },
        ],
      },
    ],
  },
};

// Empty Page Handling Example
export const emptyPageHandlingExample: SurveyExample = {
  id: 'empty-page-handling',
  title: 'Empty Page Handling',
  description: 'Demonstrates handling of pages with no visible questions',
  model: {
    title: 'Conditional Question Survey',
    showProgressBar: 'top',
    pages: [
      {
        name: 'page1',
        title: 'Initial Selection',
        elements: [
          {
            type: 'radiogroup',
            name: 'showQuestions',
            title: 'Do you want to answer additional questions?',
            choices: ['Yes', 'No'],
            defaultValue: 'No',
          },
        ],
      },
      {
        name: 'page2',
        title: 'Optional Questions',
        elements: [
          {
            type: 'text',
            name: 'optionalQuestion1',
            title: 'First optional question',
            visibleIf: '{showQuestions} = "Yes"',
          },
          {
            type: 'text',
            name: 'optionalQuestion2',
            title: 'Second optional question',
            visibleIf: '{showQuestions} = "Yes"',
          },
          {
            type: 'comment',
            name: 'optionalComments',
            title: 'Additional comments',
            visibleIf: '{showQuestions} = "Yes"',
            // @ts-ignore - rows can be a number for comment questions
            rows: 3,
          },
        ],
      },
      {
        name: 'page3',
        title: 'Final Page',
        elements: [
          {
            type: 'boolean',
            name: 'subscribe',
            title: 'Subscribe to updates?',
          },
        ],
      },
    ],
  },
};

// Complex Validation Chain Example
export const complexValidationExample: SurveyExample = {
  id: 'complex-validation-navigation',
  title: 'Complex Validation Chains',
  description: 'Multiple validation rules and cross-field validation',
  model: {
    title: 'Advanced Registration Form',
    showProgressBar: 'both',
    checkErrorsMode: 'onNextPage',
    pages: [
      {
        name: 'personalInfo',
        title: 'Personal Information',
        elements: [
          {
            type: 'text',
            name: 'firstName',
            title: 'First Name',
            isRequired: true,
            validators: [
              {
                type: 'text',
                minLength: 2,
                maxLength: 50,
                text: 'Name must be between 2 and 50 characters',
              },
            ],
          },
          {
            type: 'text',
            name: 'lastName',
            title: 'Last Name',
            isRequired: true,
            validators: [
              {
                type: 'text',
                minLength: 2,
                maxLength: 50,
                text: 'Name must be between 2 and 50 characters',
              },
            ],
          },
          {
            type: 'text',
            name: 'birthDate',
            title: 'Birth Date (MM/DD/YYYY)',
            isRequired: true,
            placeHolder: 'MM/DD/YYYY',
            validators: [
              {
                type: 'regex',
                regex: '^(0[1-9]|1[0-2])\\/(0[1-9]|[12][0-9]|3[01])\\/(19|20)\\d{2}$',
                text: 'Please enter date in MM/DD/YYYY format',
              },
            ],
          },
        ],
      },
      {
        name: 'contactInfo',
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
            name: 'confirmEmail',
            title: 'Confirm Email',
            isRequired: true,
            validators: [
              {
                type: 'expression',
                expression: '{email} = {confirmEmail}',
                text: 'Email addresses must match',
              },
            ],
          },
          {
            type: 'text',
            name: 'phone',
            title: 'Phone Number',
            isRequired: true,
            placeHolder: '(555) 123-4567',
            validators: [
              {
                type: 'regex',
                regex: '^\\(?[0-9]{3}\\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}$',
                text: 'Please enter a valid phone number',
              },
            ],
          },
        ],
      },
      {
        name: 'securityInfo',
        title: 'Security Information',
        elements: [
          {
            type: 'text',
            name: 'password',
            title: 'Create Password',
            isRequired: true,
            inputType: 'password',
            description: 'Must be at least 8 characters with uppercase, lowercase, and number',
            validators: [
              {
                type: 'regex',
                regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$',
                text: 'Password must contain uppercase, lowercase, and number',
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
          {
            type: 'text',
            name: 'securityQuestion',
            title: 'Security Question',
            isRequired: true,
            placeHolder: 'Enter your own security question',
          },
          {
            type: 'text',
            name: 'securityAnswer',
            title: 'Security Answer',
            isRequired: true,
            validators: [
              {
                type: 'text',
                minLength: 3,
                text: 'Answer must be at least 3 characters',
              },
            ],
          },
        ],
      },
    ],
  },
};

// Navigation Event Handling Example
export const navigationEventsExample: SurveyExample = {
  id: 'navigation-events',
  title: 'Navigation Event Handling',
  description: 'Demonstrates all navigation events and states',
  model: {
    title: 'Navigation Event Demo',
    showProgressBar: 'top',
    showTimerPanel: 'top',
    maxTimeToFinish: 300, // 5 minutes
    pages: [
      {
        name: 'intro',
        title: 'Introduction',
        elements: [
          {
            type: 'html',
            name: 'introText',
            html: '<p>This survey demonstrates navigation events. Watch the event logs as you navigate!</p>',
          },
          {
            type: 'radiogroup',
            name: 'ready',
            title: 'Are you ready to begin?',
            choices: ['Yes', 'No'],
            defaultValue: 'Yes',
          },
        ],
      },
      {
        name: 'page1',
        title: 'First Question Page',
        elements: [
          {
            type: 'text',
            name: 'field1',
            title: 'Enter any text (tracks value change events)',
            placeHolder: 'Type here to trigger events',
          },
          {
            type: 'rating',
            name: 'rating1',
            title: 'Rate this feature (1-5)',
            rateMin: 1,
            rateMax: 5,
          },
        ],
      },
      {
        name: 'page2',
        title: 'Validation Page',
        elements: [
          {
            type: 'text',
            name: 'requiredField',
            title: 'Required field (try to skip)',
            isRequired: true,
            requiredErrorText: 'This field blocks navigation when empty',
          },
          {
            type: 'checkbox',
            name: 'options',
            title: 'Select at least one option',
            choices: ['Option A', 'Option B', 'Option C'],
            validators: [
              {
                type: 'answercount',
                minCount: 1,
                text: 'Please select at least one option',
              },
            ],
          },
        ],
      },
      {
        name: 'page3',
        title: 'Final Page',
        elements: [
          {
            type: 'boolean',
            name: 'complete',
            title: 'Ready to complete the survey?',
            defaultValue: true,
          },
          {
            type: 'comment',
            name: 'finalComments',
            title: 'Any final comments?',
            // @ts-ignore - rows can be a number for comment questions
            rows: 3,
          },
        ],
      },
    ],
  },
};

// Export all multi-page navigation examples
export const multiPageNavigationExamples: SurveyExample[] = [
  basicMultiPageExample,
  validationFlowExample,
  dynamicPageCountExample,
  conditionalPagesExample,
  emptyPageHandlingExample,
  complexValidationExample,
  navigationEventsExample,
];

// Helper to get example by ID
export const getMultiPageExampleById = (id: string): SurveyExample | undefined => {
  return multiPageNavigationExamples.find((example) => example.id === id);
};

/**
 * Multi-Page Navigation Examples Documentation
 * 
 * This file contains comprehensive examples demonstrating multi-page navigation
 * features in the react-native-survey-js-ui library.
 * 
 * Examples included:
 * 
 * 1. Basic Multi-Page Navigation
 *    - Simple page flow with Next/Previous buttons
 *    - Progress bar showing current position
 *    - Page titles and descriptions
 * 
 * 2. Page Validation Example
 *    - Required fields that block navigation
 *    - Real-time validation feedback
 *    - Cross-field validation (password confirmation)
 * 
 * 3. Dynamic Page Count
 *    - Pages shown/hidden based on user answers
 *    - Dynamic progress tracking
 *    - Conditional page visibility with visibleIf
 * 
 * 4. Conditional Page Display
 *    - Complex branching logic
 *    - Different paths based on initial selection
 *    - Insurance quote form example
 * 
 * 5. Empty Page Handling
 *    - Pages with all questions hidden
 *    - Automatic skip to next visible page
 *    - Smooth navigation experience
 * 
 * 6. Complex Validation Chains
 *    - Multiple validation rules per field
 *    - Custom error messages
 *    - Advanced validation patterns (regex, expression)
 * 
 * 7. Navigation Event Handling
 *    - Complete event tracking
 *    - Timer panel demonstration
 *    - All navigation events logged in real-time
 * 
 * Interactive Playground Features:
 * - Toggle progress bar visibility and position
 * - Change validation modes (onNextPage, onComplete, onValueChanged)
 * - Adjust navigation button positions
 * - View real-time navigation state
 * - Monitor validation errors
 * - Track all survey events
 */