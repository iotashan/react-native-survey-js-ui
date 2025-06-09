import type { SurveyModel } from 'react-native-survey-js-ui';
import { SurveyExample } from './surveyExamples';

// Required Fields Validation Example
export const requiredFieldsExample: SurveyExample = {
  id: 'required-fields',
  title: 'Required Fields Validation',
  description: 'Demonstrates different types of required field validation',
  model: {
    title: 'Required Fields Demo',
    pages: [
      {
        name: 'page1',
        title: 'Personal Information',
        elements: [
          {
            type: 'text',
            name: 'firstName',
            title: 'First Name',
            isRequired: true,
            requiredErrorText: 'First name is required',
          },
          {
            type: 'text',
            name: 'lastName',
            title: 'Last Name',
            isRequired: true,
            requiredErrorText: 'Last name is required',
          },
          {
            type: 'radiogroup',
            name: 'gender',
            title: 'Gender',
            isRequired: true,
            choices: ['Male', 'Female', 'Other', 'Prefer not to say'],
            requiredErrorText: 'Please select your gender',
          },
          {
            type: 'checkbox',
            name: 'interests',
            title: 'Select your interests (at least 2)',
            isRequired: true,
            choices: ['Sports', 'Music', 'Reading', 'Travel', 'Cooking', 'Gaming'],
            validators: [
              {
                type: 'answercount',
                minCount: 2,
                text: 'Please select at least 2 interests',
              },
            ],
          },
        ],
      },
      {
        name: 'page2',
        title: 'Contact Information',
        elements: [
          {
            type: 'text',
            name: 'email',
            title: 'Email Address',
            inputType: 'email',
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
            inputType: 'tel',
            isRequired: true,
            validators: [
              {
                type: 'regex',
                regex: '^[0-9]{10}$',
                text: 'Please enter a 10-digit phone number',
              },
            ],
          },
          {
            type: 'comment',
            name: 'address',
            title: 'Address',
            isRequired: true,
            requiredErrorText: 'Address is required',
            rows: 3,
          },
        ],
      },
    ],
    showProgressBar: 'top',
    firstPageIsStarted: false,
  },
};

// Real-time vs On-Submit Validation Example
export const validationModesExample: SurveyExample = {
  id: 'validation-modes',
  title: 'Validation Modes',
  description: 'Compare real-time vs on-submit validation behavior',
  model: {
    title: 'Validation Modes Demo',
    checkErrorsMode: 'onValueChanged', // Real-time validation
    pages: [
      {
        name: 'page1',
        title: 'Real-time Validation',
        description: 'Errors appear as you type',
        elements: [
          {
            type: 'text',
            name: 'username',
            title: 'Username (4-12 characters)',
            isRequired: true,
            validators: [
              {
                type: 'text',
                minLength: 4,
                maxLength: 12,
                text: 'Username must be between 4 and 12 characters',
              },
            ],
          },
          {
            type: 'text',
            name: 'password',
            title: 'Password (min 8 characters, must include number)',
            inputType: 'password',
            isRequired: true,
            validators: [
              {
                type: 'regex',
                regex: '^(?=.*[0-9]).{8,}$',
                text: 'Password must be at least 8 characters and include a number',
              },
            ],
          },
          {
            type: 'text',
            name: 'confirmPassword',
            title: 'Confirm Password',
            inputType: 'password',
            isRequired: true,
            validators: [
              {
                type: 'expression',
                expression: '{password} = {confirmPassword}',
                text: 'Passwords do not match',
              },
            ],
          },
        ],
      },
    ],
  },
};

// Custom Validation Example
export const customValidationExample: SurveyExample = {
  id: 'custom-validation',
  title: 'Custom Validation Rules',
  description: 'Advanced validation with custom rules and expressions',
  model: {
    title: 'Custom Validation Demo',
    pages: [
      {
        name: 'page1',
        title: 'Business Rules Validation',
        elements: [
          {
            type: 'text',
            name: 'age',
            title: 'Age',
            inputType: 'number',
            isRequired: true,
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
            name: 'income',
            title: 'Annual Income',
            inputType: 'number',
            isRequired: true,
            validators: [
              {
                type: 'numeric',
                minValue: 0,
                text: 'Income cannot be negative',
              },
            ],
          },
          {
            type: 'text',
            name: 'creditLimit',
            title: 'Requested Credit Limit',
            inputType: 'number',
            isRequired: true,
            validators: [
              {
                type: 'expression',
                expression: '{creditLimit} <= {income} * 0.3',
                text: 'Credit limit cannot exceed 30% of annual income',
              },
            ],
          },
          {
            type: 'dropdown',
            name: 'country',
            title: 'Country',
            isRequired: true,
            choices: ['USA', 'Canada', 'UK', 'Australia', 'Other'],
          },
          {
            type: 'text',
            name: 'zipCode',
            title: 'ZIP/Postal Code',
            isRequired: true,
            validators: [
              {
                type: 'expression',
                expression: "({country} != 'USA') or regex({zipCode}, '^[0-9]{5}$')",
                text: 'US ZIP code must be 5 digits',
              },
              {
                type: 'expression',
                expression: "({country} != 'Canada') or regex({zipCode}, '^[A-Z][0-9][A-Z] ?[0-9][A-Z][0-9]$')",
                text: 'Canadian postal code format: A1A 1A1',
              },
            ],
          },
        ],
      },
    ],
  },
};

// Complex Multi-Page Validation Example
export const complexValidationExample: SurveyExample = {
  id: 'complex-validation',
  title: 'Complex Multi-Page Form',
  description: 'Comprehensive validation across multiple pages with dependencies',
  model: {
    title: 'Job Application Form',
    pages: [
      {
        name: 'personalInfo',
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
            name: 'birthDate',
            title: 'Date of Birth (MM/DD/YYYY)',
            isRequired: true,
            validators: [
              {
                type: 'regex',
                regex: '^(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])/[0-9]{4}$',
                text: 'Please enter date in MM/DD/YYYY format',
              },
            ],
          },
          {
            type: 'radiogroup',
            name: 'citizenship',
            title: 'Are you legally authorized to work in this country?',
            isRequired: true,
            choices: ['Yes', 'No'],
          },
          {
            type: 'text',
            name: 'workPermit',
            title: 'Work Permit Number',
            visibleIf: "{citizenship} = 'No'",
            isRequired: true,
            requiredIf: "{citizenship} = 'No'",
          },
        ],
      },
      {
        name: 'education',
        title: 'Education',
        elements: [
          {
            type: 'dropdown',
            name: 'highestEducation',
            title: 'Highest Level of Education',
            isRequired: true,
            choices: [
              'High School',
              "Bachelor's Degree",
              "Master's Degree",
              'PhD',
              'Other',
            ],
          },
          {
            type: 'text',
            name: 'fieldOfStudy',
            title: 'Field of Study',
            visibleIf: "{highestEducation} != 'High School'",
            isRequired: true,
            requiredIf: "{highestEducation} != 'High School'",
          },
          {
            type: 'text',
            name: 'graduationYear',
            title: 'Graduation Year',
            inputType: 'number',
            isRequired: true,
            validators: [
              {
                type: 'numeric',
                minValue: 1950,
                maxValue: new Date().getFullYear(),
                text: 'Please enter a valid graduation year',
              },
            ],
          },
        ],
      },
      {
        name: 'experience',
        title: 'Work Experience',
        elements: [
          {
            type: 'radiogroup',
            name: 'hasExperience',
            title: 'Do you have relevant work experience?',
            isRequired: true,
            choices: ['Yes', 'No'],
          },
          {
            type: 'text',
            name: 'yearsOfExperience',
            title: 'Years of Experience',
            inputType: 'number',
            visibleIf: "{hasExperience} = 'Yes'",
            isRequired: true,
            requiredIf: "{hasExperience} = 'Yes'",
            validators: [
              {
                type: 'numeric',
                minValue: 0,
                maxValue: 50,
                text: 'Please enter valid years of experience',
              },
            ],
          },
          {
            type: 'comment',
            name: 'experienceDescription',
            title: 'Describe your relevant experience',
            visibleIf: "{hasExperience} = 'Yes'",
            isRequired: true,
            requiredIf: "{hasExperience} = 'Yes'",
            validators: [
              {
                type: 'text',
                minLength: 50,
                text: 'Please provide at least 50 characters describing your experience',
              },
            ],
            rows: 5,
          },
        ],
      },
    ],
    showProgressBar: 'top',
    progressBarType: 'questions',
    completeText: 'Submit Application',
  },
};

// Error Message Customization Example
export const errorCustomizationExample: SurveyExample = {
  id: 'error-customization',
  title: 'Error Message Customization',
  description: 'Customize validation error messages and display',
  model: {
    title: 'Custom Error Messages Demo',
    pages: [
      {
        name: 'page1',
        title: 'Customized Validation Messages',
        elements: [
          {
            type: 'text',
            name: 'productCode',
            title: 'Product Code',
            isRequired: true,
            requiredErrorText: '⚠️ Product code is mandatory',
            validators: [
              {
                type: 'regex',
                regex: '^[A-Z]{3}-[0-9]{4}$',
                text: '❌ Invalid format. Use: ABC-1234',
              },
            ],
            placeholder: 'XXX-0000',
          },
          {
            type: 'text',
            name: 'quantity',
            title: 'Quantity',
            inputType: 'number',
            isRequired: true,
            requiredErrorText: '📦 Please specify quantity',
            validators: [
              {
                type: 'numeric',
                minValue: 1,
                maxValue: 999,
                text: '🔢 Quantity must be between 1 and 999',
              },
            ],
          },
          {
            type: 'text',
            name: 'discountCode',
            title: 'Discount Code (Optional)',
            validators: [
              {
                type: 'regex',
                regex: '^(SAVE[0-9]{2}|DISCOUNT[0-9]{2}|)$',
                text: '🏷️ Invalid discount code format',
              },
            ],
          },
        ],
      },
    ],
  },
};

// All validation examples
export const validationExamples: SurveyExample[] = [
  requiredFieldsExample,
  validationModesExample,
  customValidationExample,
  complexValidationExample,
  errorCustomizationExample,
];