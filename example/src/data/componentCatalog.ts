import { panelDemoComponents } from './panelExamples';
import { QuestionCategory, ComponentInfo } from './types';

// Re-export for backward compatibility
export type { ComponentProperty, ComponentInfo } from './types';
export { QuestionCategory } from './types';

const baseComponentCatalog: ComponentInfo[] = [
  // Text Input Components
  {
    type: 'text',
    name: 'Text Input',
    description: 'Single-line text input for short answers',
    category: QuestionCategory.TextInput,
    icon: '📝',
    tags: ['input', 'text', 'string', 'basic'],
    properties: [
      {
        name: 'inputType',
        type: 'string',
        description: 'Type of text input',
        defaultValue: 'text',
        options: ['text', 'email', 'tel', 'url', 'number', 'password'],
      },
      {
        name: 'placeholder',
        type: 'string',
        description: 'Placeholder text when field is empty',
      },
      {
        name: 'maxLength',
        type: 'number',
        description: 'Maximum number of characters allowed',
      },
      {
        name: 'min',
        type: 'number',
        description: 'Minimum value for number input',
      },
      {
        name: 'max',
        type: 'number',
        description: 'Maximum value for number input',
      },
    ],
    example: {
      type: 'text',
      name: 'textExample',
      title: 'What is your name?',
      placeholder: 'Enter your full name',
      isRequired: true,
    },
  },
  {
    type: 'comment',
    name: 'Comment Box',
    description: 'Multi-line text input for longer responses',
    category: QuestionCategory.TextInput,
    icon: '💬',
    tags: ['input', 'text', 'multiline', 'textarea'],
    properties: [
      {
        name: 'rows',
        type: 'number',
        description: 'Number of visible text lines',
        defaultValue: 4,
      },
      {
        name: 'maxLength',
        type: 'number',
        description: 'Maximum number of characters allowed',
      },
      {
        name: 'placeholder',
        type: 'string',
        description: 'Placeholder text when field is empty',
      },
    ],
    example: {
      type: 'comment',
      name: 'commentExample',
      title: 'Please provide your feedback',
      placeholder: 'Your comments here...',
      // @ts-ignore - rows can be a number for comment questions
    },
  },
  {
    type: 'multipletext',
    name: 'Multiple Text',
    description: 'Multiple text inputs in a single question',
    category: QuestionCategory.TextInput,
    icon: '📋',
    tags: ['input', 'text', 'multiple', 'composite'],
    properties: [
      {
        name: 'items',
        type: 'array',
        description: 'Array of text input items',
        required: true,
      },
      {
        name: 'colCount',
        type: 'number',
        description: 'Number of columns to display items',
        defaultValue: 1,
      },
    ],
    example: {
      type: 'multipletext',
      name: 'multipleTextExample',
      title: 'Contact Information',
      items: [
        { name: 'firstName', title: 'First Name' },
        { name: 'lastName', title: 'Last Name' },
        { name: 'email', title: 'Email', inputType: 'email' },
        { name: 'phone', title: 'Phone', inputType: 'tel' },
      ],
    },
  },

  // Selection Components
  {
    type: 'radiogroup',
    name: 'Radio Group',
    description: 'Single choice selection from multiple options',
    category: QuestionCategory.Selection,
    icon: '🔘',
    tags: ['selection', 'single', 'choice', 'radio'],
    properties: [
      {
        name: 'choices',
        type: 'array',
        description: 'Array of choice options',
        required: true,
      },
      {
        name: 'hasOther',
        type: 'boolean',
        description: 'Show "Other" option with text input',
        defaultValue: false,
      },
      {
        name: 'otherText',
        type: 'string',
        description: 'Text for "Other" option',
        defaultValue: 'Other',
      },
      {
        name: 'colCount',
        type: 'number',
        description: 'Number of columns to display choices',
        defaultValue: 1,
      },
    ],
    example: {
      type: 'radiogroup',
      name: 'radiogroupExample',
      title: 'What is your favorite color?',
      choices: [
        { value: 'red', text: 'Red' },
        { value: 'green', text: 'Green' },
        { value: 'blue', text: 'Blue' },
      ],
      hasOther: true,
    },
  },
  {
    type: 'checkbox',
    name: 'Checkbox',
    description: 'Multiple choice selection with checkboxes',
    category: QuestionCategory.Selection,
    icon: '☑️',
    tags: ['selection', 'multiple', 'choice', 'checkbox'],
    properties: [
      {
        name: 'choices',
        type: 'array',
        description: 'Array of choice options',
        required: true,
      },
      {
        name: 'hasOther',
        type: 'boolean',
        description: 'Show "Other" option with text input',
        defaultValue: false,
      },
      {
        name: 'hasSelectAll',
        type: 'boolean',
        description: 'Show "Select All" option',
        defaultValue: false,
      },
      {
        name: 'maxSelectedChoices',
        type: 'number',
        description: 'Maximum number of choices that can be selected',
      },
    ],
    example: {
      type: 'checkbox',
      name: 'checkboxExample',
      title: 'Select your hobbies',
      choices: [
        { value: 'sports', text: 'Sports' },
        { value: 'music', text: 'Music' },
        { value: 'reading', text: 'Reading' },
        { value: 'gaming', text: 'Gaming' },
      ],
      hasSelectAll: true,
    },
  },
  {
    type: 'dropdown',
    name: 'Dropdown',
    description: 'Single choice selection from dropdown list',
    category: QuestionCategory.Selection,
    icon: '📂',
    tags: ['selection', 'single', 'dropdown', 'select'],
    properties: [
      {
        name: 'choices',
        type: 'array',
        description: 'Array of choice options',
        required: true,
      },
      {
        name: 'placeholder',
        type: 'string',
        description: 'Placeholder text when no selection',
        defaultValue: 'Select...',
      },
      {
        name: 'hasOther',
        type: 'boolean',
        description: 'Show "Other" option with text input',
        defaultValue: false,
      },
    ],
    example: {
      type: 'dropdown',
      name: 'dropdownExample',
      title: 'Select your country',
      placeholder: 'Choose a country...',
      choices: [
        { value: 'us', text: 'United States' },
        { value: 'uk', text: 'United Kingdom' },
        { value: 'ca', text: 'Canada' },
        { value: 'au', text: 'Australia' },
      ],
    },
  },
  {
    type: 'boolean',
    name: 'Boolean',
    description: 'Yes/No or True/False question',
    category: QuestionCategory.Selection,
    icon: '✅',
    tags: ['selection', 'boolean', 'yes/no', 'toggle'],
    properties: [
      {
        name: 'labelTrue',
        type: 'string',
        description: 'Label for true/yes value',
        defaultValue: 'Yes',
      },
      {
        name: 'labelFalse',
        type: 'string',
        description: 'Label for false/no value',
        defaultValue: 'No',
      },
      {
        name: 'renderAs',
        type: 'string',
        description: 'How to render the boolean input',
        defaultValue: 'radio',
        options: ['radio', 'checkbox', 'switch'],
      },
    ],
    example: {
      type: 'boolean',
      name: 'booleanExample',
      title: 'Do you agree to the terms and conditions?',
      labelTrue: 'I agree',
      labelFalse: 'I disagree',
    },
  },
  {
    type: 'imagepicker',
    name: 'Image Picker',
    description: 'Select one or more images from a list',
    category: QuestionCategory.Selection,
    icon: '🖼️',
    tags: ['selection', 'image', 'visual', 'picker'],
    properties: [
      {
        name: 'choices',
        type: 'array',
        description: 'Array of image choices',
        required: true,
      },
      {
        name: 'multiSelect',
        type: 'boolean',
        description: 'Allow multiple image selection',
        defaultValue: false,
      },
      {
        name: 'showLabel',
        type: 'boolean',
        description: 'Show labels under images',
        defaultValue: true,
      },
      {
        name: 'colCount',
        type: 'number',
        description: 'Number of columns to display images',
        defaultValue: 3,
      },
    ],
    example: {
      type: 'imagepicker',
      name: 'imagepickerExample',
      title: 'Choose your favorite fruit',
      multiSelect: false,
      choices: [
        {
          value: 'apple',
          text: 'Apple',
          // @ts-ignore - imageLink is supported by survey-core
          imageLink: 'https://via.placeholder.com/150?text=Apple',
        },
        {
          value: 'banana',
          text: 'Banana',
          // @ts-ignore - imageLink is supported by survey-core
          imageLink: 'https://via.placeholder.com/150?text=Banana',
        },
        {
          value: 'orange',
          text: 'Orange',
          // @ts-ignore - imageLink is supported by survey-core
          imageLink: 'https://via.placeholder.com/150?text=Orange',
        },
      ],
    },
  },

  // Rating Components
  {
    type: 'rating',
    name: 'Rating',
    description: 'Rating scale with customizable range',
    category: QuestionCategory.Rating,
    icon: '⭐',
    tags: ['rating', 'scale', 'stars', 'numeric'],
    properties: [
      {
        name: 'rateMin',
        type: 'number',
        description: 'Minimum rating value',
        defaultValue: 1,
      },
      {
        name: 'rateMax',
        type: 'number',
        description: 'Maximum rating value',
        defaultValue: 5,
      },
      {
        name: 'rateStep',
        type: 'number',
        description: 'Step between rating values',
        defaultValue: 1,
      },
      {
        name: 'minRateDescription',
        type: 'string',
        description: 'Description for minimum rating',
      },
      {
        name: 'maxRateDescription',
        type: 'string',
        description: 'Description for maximum rating',
      },
    ],
    example: {
      type: 'rating',
      name: 'ratingExample',
      title: 'How satisfied are you with our service?',
      rateMin: 1,
      rateMax: 5,
      minRateDescription: 'Very Dissatisfied',
      maxRateDescription: 'Very Satisfied',
    },
  },

  // Matrix Components
  {
    type: 'matrix',
    name: 'Matrix',
    description: 'Single choice matrix question',
    category: QuestionCategory.Matrix,
    icon: '📊',
    tags: ['matrix', 'grid', 'table', 'single'],
    properties: [
      {
        name: 'columns',
        type: 'array',
        description: 'Array of column definitions',
        required: true,
      },
      {
        name: 'rows',
        type: 'array',
        description: 'Array of row definitions',
        required: true,
      },
      {
        name: 'rowsOrder',
        type: 'string',
        description: 'Order of rows display',
        defaultValue: 'initial',
        options: ['initial', 'random'],
      },
    ],
    example: {
      type: 'matrix',
      name: 'matrixExample',
      title: 'Please rate the following aspects',
      columns: [
        { value: 'excellent', text: 'Excellent' },
        { value: 'good', text: 'Good' },
        { value: 'average', text: 'Average' },
        { value: 'poor', text: 'Poor' },
      ],
      rows: [
        { value: 'quality', text: 'Quality' },
        { value: 'price', text: 'Price' },
        { value: 'service', text: 'Service' },
      ],
    },
  },
  {
    type: 'matrixdropdown',
    name: 'Matrix Dropdown',
    description: 'Matrix with dropdown choices in cells',
    category: QuestionCategory.Matrix,
    icon: '📈',
    tags: ['matrix', 'grid', 'dropdown', 'complex'],
    properties: [
      {
        name: 'columns',
        type: 'array',
        description: 'Array of column definitions with cell types',
        required: true,
      },
      {
        name: 'rows',
        type: 'array',
        description: 'Array of row definitions',
        required: true,
      },
      {
        name: 'choices',
        type: 'array',
        description: 'Default choices for dropdown columns',
      },
    ],
    example: {
      type: 'matrixdropdown',
      name: 'matrixdropdownExample',
      title: 'Product evaluation',
      columns: [
        {
          // @ts-ignore - name is the correct property for columns
          name: 'quality',
          title: 'Quality',
          cellType: 'dropdown',
          choices: ['Excellent', 'Good', 'Average', 'Poor'],
        },
        {
          // @ts-ignore - name is the correct property for columns
          name: 'importance',
          title: 'Importance',
          cellType: 'rating',
          rateMax: 5,
        },
      ],
      rows: [
        { value: 'design', text: 'Design' },
        { value: 'features', text: 'Features' },
        { value: 'performance', text: 'Performance' },
      ],
    },
  },
  {
    type: 'matrixdynamic',
    name: 'Matrix Dynamic',
    description: 'Matrix where users can add/remove rows',
    category: QuestionCategory.Matrix,
    icon: '📉',
    tags: ['matrix', 'dynamic', 'addable', 'removable'],
    properties: [
      {
        name: 'columns',
        type: 'array',
        description: 'Array of column definitions',
        required: true,
      },
      {
        name: 'rowCount',
        type: 'number',
        description: 'Initial number of rows',
        defaultValue: 2,
      },
      {
        name: 'addRowText',
        type: 'string',
        description: 'Text for add row button',
        defaultValue: 'Add Row',
      },
      {
        name: 'removeRowText',
        type: 'string',
        description: 'Text for remove row button',
        defaultValue: 'Remove',
      },
      {
        name: 'minRowCount',
        type: 'number',
        description: 'Minimum number of rows',
        defaultValue: 0,
      },
      {
        name: 'maxRowCount',
        type: 'number',
        description: 'Maximum number of rows',
        defaultValue: 100,
      },
    ],
    example: {
      type: 'matrixdynamic',
      name: 'matrixdynamicExample',
      title: 'List your skills',
      columns: [
        // @ts-ignore - name is the correct property for columns
        { name: 'skill', title: 'Skill', cellType: 'text' },
        {
          // @ts-ignore - name is the correct property for columns
          name: 'experience',
          title: 'Years of Experience',
          cellType: 'text',
          inputType: 'number',
        },
        {
          // @ts-ignore - name is the correct property for columns
          name: 'level',
          title: 'Proficiency Level',
          cellType: 'dropdown',
          choices: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        },
      ],
      rowCount: 1,
      addRowText: 'Add another skill',
    },
  },

  // Advanced Components
  {
    type: 'panel',
    name: 'Panel',
    description: 'Group related questions together',
    category: QuestionCategory.Advanced,
    icon: '📦',
    tags: ['container', 'group', 'panel', 'section'],
    properties: [
      {
        name: 'elements',
        type: 'array',
        description: 'Array of questions within the panel',
        required: true,
      },
      {
        name: 'isExpanded',
        type: 'boolean',
        description: 'Whether panel is expanded by default',
        defaultValue: true,
      },
      {
        name: 'state',
        type: 'string',
        description: 'Panel state',
        defaultValue: 'expanded',
        options: ['expanded', 'collapsed', 'firstExpanded'],
      },
    ],
    example: {
      type: 'panel',
      name: 'panelExample',
      title: 'Personal Information',
      elements: [
        { type: 'text', name: 'firstName', title: 'First Name' },
        { type: 'text', name: 'lastName', title: 'Last Name' },
        { type: 'text', name: 'email', title: 'Email', inputType: 'email' },
      ],
    },
  },
  {
    type: 'paneldynamic',
    name: 'Panel Dynamic',
    description: 'Dynamic panels that users can add/remove',
    category: QuestionCategory.Advanced,
    icon: '📚',
    tags: ['container', 'dynamic', 'repeater', 'array'],
    properties: [
      {
        name: 'templateElements',
        type: 'array',
        description: 'Template questions for each panel',
        required: true,
      },
      {
        name: 'panelCount',
        type: 'number',
        description: 'Initial number of panels',
        defaultValue: 1,
      },
      {
        name: 'panelAddText',
        type: 'string',
        description: 'Text for add panel button',
        defaultValue: 'Add Panel',
      },
      {
        name: 'panelRemoveText',
        type: 'string',
        description: 'Text for remove panel button',
        defaultValue: 'Remove',
      },
      {
        name: 'minPanelCount',
        type: 'number',
        description: 'Minimum number of panels',
        defaultValue: 0,
      },
      {
        name: 'maxPanelCount',
        type: 'number',
        description: 'Maximum number of panels',
        defaultValue: 100,
      },
    ],
    example: {
      type: 'paneldynamic',
      name: 'paneldynamicExample',
      title: 'Previous Employment',
      templateElements: [
        { type: 'text', name: 'company', title: 'Company Name' },
        { type: 'text', name: 'position', title: 'Position' },
        { type: 'text', name: 'duration', title: 'Duration' },
      ],
      panelCount: 1,
      panelAddText: 'Add another job',
    },
  },
  {
    type: 'file',
    name: 'File Upload',
    description: 'Allow users to upload files',
    category: QuestionCategory.Advanced,
    icon: '📎',
    tags: ['file', 'upload', 'attachment', 'document'],
    properties: [
      {
        name: 'allowMultiple',
        type: 'boolean',
        description: 'Allow multiple file uploads',
        defaultValue: false,
      },
      {
        name: 'acceptedTypes',
        type: 'string',
        description: 'Accepted file types (e.g., ".pdf,.doc")',
        defaultValue: '*',
      },
      {
        name: 'maxSize',
        type: 'number',
        description: 'Maximum file size in KB',
        defaultValue: 0,
      },
      {
        name: 'storeDataAsText',
        type: 'boolean',
        description: 'Store file data as base64 text',
        defaultValue: true,
      },
    ],
    example: {
      type: 'file',
      name: 'fileExample',
      title: 'Upload your resume',
      acceptedTypes: '.pdf,.doc,.docx',
      maxSize: 5120,
      allowMultiple: false,
    },
  },

  // Display Components
  {
    type: 'html',
    name: 'HTML',
    description: 'Display custom HTML content',
    category: QuestionCategory.Display,
    icon: '📄',
    tags: ['display', 'html', 'content', 'static'],
    properties: [
      {
        name: 'html',
        type: 'string',
        description: 'HTML content to display',
        required: true,
      },
    ],
    example: {
      type: 'html',
      name: 'htmlExample',
      html: '<h3>Welcome to our survey!</h3><p>Please answer the following questions honestly.</p>',
    },
  },
  {
    type: 'expression',
    name: 'Expression',
    description: 'Display calculated or dynamic values',
    category: QuestionCategory.Display,
    icon: '🧮',
    tags: ['display', 'expression', 'calculated', 'dynamic'],
    properties: [
      {
        name: 'expression',
        type: 'string',
        description: 'Expression to evaluate',
        required: true,
      },
      {
        name: 'displayStyle',
        type: 'string',
        description: 'How to display the result',
        defaultValue: 'none',
        options: ['none', 'decimal', 'currency', 'percent'],
      },
      {
        name: 'currency',
        type: 'string',
        description: 'Currency code when displayStyle is currency',
        defaultValue: 'USD',
      },
    ],
    example: {
      type: 'expression',
      name: 'expressionExample',
      title: 'Total Score',
      expression: '{question1} + {question2} + {question3}',
      displayStyle: 'decimal',
    },
  },
];

// Merge panel demo components into the main catalog
export const componentCatalog: ComponentInfo[] = [
  ...baseComponentCatalog,
  ...panelDemoComponents,
];

// Helper functions
export function getCategorizedComponents(): Record<
  QuestionCategory,
  ComponentInfo[]
> {
  const categorized: Record<string, ComponentInfo[]> = {};

  Object.values(QuestionCategory).forEach((category) => {
    categorized[category] = [];
  });

  componentCatalog.forEach((component) => {
    const category = categorized[component.category];
    if (category) {
      category.push(component);
    }
  });

  return categorized as Record<QuestionCategory, ComponentInfo[]>;
}

export function searchComponents(query: string): ComponentInfo[] {
  if (!query.trim()) {
    return componentCatalog;
  }

  const lowerQuery = query.toLowerCase();

  return componentCatalog.filter((component) => {
    return (
      component.name.toLowerCase().includes(lowerQuery) ||
      component.type.toLowerCase().includes(lowerQuery) ||
      component.description.toLowerCase().includes(lowerQuery) ||
      component.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  });
}

export function getComponentByType(type: string): ComponentInfo | undefined {
  return componentCatalog.find((component) => component.type === type);
}
