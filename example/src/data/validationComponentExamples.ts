import { ComponentInfo } from './types';
import { QuestionCategory } from './types';

// Validation Component Examples
export const validationComponentExamples: ComponentInfo[] = [
  // Required Field Example
  {
    type: 'text-required',
    name: 'Required Text Input',
    description: 'Text input with required field validation',
    category: QuestionCategory.TextInput,
    icon: '✅',
    tags: ['validation', 'required', 'text', 'input'],
    properties: [
      {
        name: 'isRequired',
        type: 'boolean',
        description: 'Makes the field mandatory',
        defaultValue: true,
      },
      {
        name: 'requiredErrorText',
        type: 'string',
        description: 'Custom error message for required validation',
        defaultValue: 'This field is required',
      },
    ],
    example: {
      type: 'text',
      name: 'requiredFieldExample',
      title: 'Your Name (Required)',
      isRequired: true,
      requiredErrorText: 'Please enter your name',
      placeholder: 'John Doe',
    },
  },

  // Email Validation Example
  {
    type: 'text-email',
    name: 'Email with Validation',
    description: 'Email input with format validation',
    category: QuestionCategory.TextInput,
    icon: '📧',
    tags: ['validation', 'email', 'format', 'input'],
    properties: [
      {
        name: 'inputType',
        type: 'string',
        description: 'Input type for keyboard and validation',
        defaultValue: 'email',
      },
      {
        name: 'validators',
        type: 'array',
        description: 'Array of validators to apply',
      },
    ],
    example: {
      type: 'text',
      name: 'emailValidationExample',
      title: 'Email Address',
      inputType: 'email',
      isRequired: true,
      validators: [
        {
          type: 'email',
          text: 'Please enter a valid email address',
        },
      ],
      placeholder: 'user@example.com',
    },
  },

  // Numeric Range Validation
  {
    type: 'text-numeric',
    name: 'Number with Range',
    description: 'Numeric input with min/max validation',
    category: QuestionCategory.TextInput,
    icon: '🔢',
    tags: ['validation', 'numeric', 'range', 'input'],
    properties: [
      {
        name: 'inputType',
        type: 'string',
        description: 'Input type for numeric keyboard',
        defaultValue: 'number',
      },
      {
        name: 'validators',
        type: 'array',
        description: 'Numeric range validators',
      },
    ],
    example: {
      type: 'text',
      name: 'ageValidationExample',
      title: 'Your Age',
      inputType: 'number',
      isRequired: true,
      validators: [
        {
          type: 'numeric',
          minValue: 18,
          maxValue: 120,
          text: 'Age must be between 18 and 120',
        },
      ],
      placeholder: '25',
    },
  },

  // Text Length Validation
  {
    type: 'text-length',
    name: 'Text with Length Limits',
    description: 'Text input with character length validation',
    category: QuestionCategory.TextInput,
    icon: '📏',
    tags: ['validation', 'length', 'text', 'limits'],
    properties: [
      {
        name: 'validators',
        type: 'array',
        description: 'Text length validators',
      },
      {
        name: 'maxLength',
        type: 'number',
        description: 'Maximum character limit',
      },
    ],
    example: {
      type: 'text',
      name: 'usernameValidationExample',
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
      maxLength: 12,
      placeholder: 'johndoe',
    },
  },

  // Regex Pattern Validation
  {
    type: 'text-pattern',
    name: 'Pattern Validation',
    description: 'Text input with regex pattern validation',
    category: QuestionCategory.TextInput,
    icon: '🔤',
    tags: ['validation', 'regex', 'pattern', 'format'],
    properties: [
      {
        name: 'validators',
        type: 'array',
        description: 'Regex pattern validators',
      },
    ],
    example: {
      type: 'text',
      name: 'phoneValidationExample',
      title: 'Phone Number (10 digits)',
      inputType: 'tel',
      isRequired: true,
      validators: [
        {
          type: 'regex',
          regex: '^[0-9]{10}$',
          text: 'Please enter a 10-digit phone number',
        },
      ],
      placeholder: '1234567890',
    },
  },

  // Checkbox with Minimum Selection
  {
    type: 'checkbox-min',
    name: 'Checkbox Min Selection',
    description: 'Checkbox with minimum selection validation',
    category: QuestionCategory.Selection,
    icon: '☑️',
    tags: ['validation', 'checkbox', 'minimum', 'selection'],
    properties: [
      {
        name: 'validators',
        type: 'array',
        description: 'Answer count validators',
      },
    ],
    example: {
      type: 'checkbox',
      name: 'interestsValidationExample',
      title: 'Select at least 2 interests',
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
  },

  // Expression-based Validation
  {
    type: 'text-expression',
    name: 'Expression Validation',
    description: 'Field with expression-based validation',
    category: QuestionCategory.Advanced,
    icon: '🧮',
    tags: ['validation', 'expression', 'conditional', 'advanced'],
    properties: [
      {
        name: 'validators',
        type: 'array',
        description: 'Expression validators',
      },
    ],
    example: {
      type: 'text',
      name: 'confirmPasswordExample',
      title: 'Confirm Password',
      inputType: 'password',
      isRequired: true,
      validators: [
        {
          type: 'expression',
          expression: '{password} = {confirmPasswordExample}',
          text: 'Passwords do not match',
        },
      ],
      placeholder: 'Re-enter password',
    },
  },

  // Real-time Validation Mode
  {
    type: 'text-realtime',
    name: 'Real-time Validation',
    description: 'Input with immediate validation feedback',
    category: QuestionCategory.Advanced,
    icon: '⚡',
    tags: ['validation', 'realtime', 'immediate', 'feedback'],
    properties: [
      {
        name: 'checkErrorsMode',
        type: 'string',
        description: 'When to check for errors',
        defaultValue: 'onValueChanged',
      },
    ],
    example: {
      type: 'text',
      name: 'realtimeValidationExample',
      title: 'Live Email Validation',
      inputType: 'email',
      isRequired: true,
      validators: [
        {
          type: 'email',
          text: 'Invalid email format',
        },
      ],
      placeholder: 'See errors as you type...',
      // This would be set at the survey level
      // checkErrorsMode: 'onValueChanged',
    },
  },

  // Custom Validation Message
  {
    type: 'text-custom-error',
    name: 'Custom Error Messages',
    description: 'Validation with customized error messages',
    category: QuestionCategory.Advanced,
    icon: '💬',
    tags: ['validation', 'custom', 'error', 'messages'],
    properties: [
      {
        name: 'requiredErrorText',
        type: 'string',
        description: 'Custom required field error',
      },
      {
        name: 'validators',
        type: 'array',
        description: 'Validators with custom messages',
      },
    ],
    example: {
      type: 'text',
      name: 'customErrorExample',
      title: 'Product Code',
      isRequired: true,
      requiredErrorText: '⚠️ Product code is mandatory',
      validators: [
        {
          type: 'regex',
          regex: '^[A-Z]{3}-[0-9]{4}$',
          text: '❌ Invalid format. Expected: ABC-1234',
        },
      ],
      placeholder: 'ABC-1234',
    },
  },

  // Conditional Validation
  {
    type: 'text-conditional',
    name: 'Conditional Validation',
    description: 'Validation that depends on other fields',
    category: QuestionCategory.Advanced,
    icon: '🔀',
    tags: ['validation', 'conditional', 'dynamic', 'dependent'],
    properties: [
      {
        name: 'visibleIf',
        type: 'string',
        description: 'Condition for field visibility',
      },
      {
        name: 'requiredIf',
        type: 'string',
        description: 'Condition for field requirement',
      },
    ],
    example: {
      type: 'text',
      name: 'conditionalValidationExample',
      title: 'Work Permit Number',
      visibleIf: "{citizenship} = 'No'",
      requiredIf: "{citizenship} = 'No'",
      isRequired: true,
      placeholder: 'Enter permit number if not a citizen',
    },
  },
];