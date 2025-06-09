import type { QuestionModel, PanelModel } from 'react-native-survey-js-ui';
import { ComponentInfo, QuestionCategory } from './types';

// Panel example data for the component catalog
export const panelDemoComponents: ComponentInfo[] = [
  // Basic Panel
  {
    type: 'panel-basic',
    name: 'Basic Panel',
    description: 'Simple panel with questions',
    category: QuestionCategory.Layout,
    icon: '📦',
    tags: ['layout', 'container', 'group', 'basic'],
    properties: [
      {
        name: 'title',
        type: 'string',
        description: 'Panel title text',
        required: false,
      },
      {
        name: 'description',
        type: 'string',
        description: 'Panel description text',
        required: false,
      },
      {
        name: 'elements',
        type: 'array',
        description: 'Questions contained in the panel',
        required: true,
      },
    ],
    example: {
      type: 'panel',
      name: 'personalInfoPanel',
      title: 'Personal Information',
      description: 'Please provide your basic details',
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
        {
          type: 'text',
          name: 'email',
          title: 'Email Address',
          inputType: 'email',
          validators: [
            {
              type: 'email',
              text: 'Please enter a valid email',
            },
          ],
        },
      ],
    } as PanelModel,
  },

  // Nested Panels
  {
    type: 'panel-nested',
    name: 'Nested Panels',
    description: 'Panels within panels demonstration',
    category: QuestionCategory.Layout,
    icon: '🗂️',
    tags: ['layout', 'container', 'hierarchy', 'nested'],
    properties: [
      {
        name: 'elements',
        type: 'array',
        description: 'Can contain questions or other panels',
        required: true,
      },
      {
        name: 'nestingLevel',
        type: 'number',
        description: 'Current nesting depth (managed automatically)',
        defaultValue: 0,
      },
    ],
    example: {
      type: 'panel',
      name: 'parentPanel',
      title: 'Employee Information',
      elements: [
        {
          type: 'panel',
          name: 'basicInfo',
          title: 'Basic Details',
          elements: [
            {
              type: 'text',
              name: 'employeeId',
              title: 'Employee ID',
              isRequired: true,
            },
            {
              type: 'text',
              name: 'department',
              title: 'Department',
            },
          ],
        },
        {
          type: 'panel',
          name: 'contactInfo',
          title: 'Contact Information',
          elements: [
            {
              type: 'panel',
              name: 'primaryContact',
              title: 'Primary Contact',
              elements: [
                {
                  type: 'text',
                  name: 'workPhone',
                  title: 'Work Phone',
                  inputType: 'tel',
                },
                {
                  type: 'text',
                  name: 'workEmail',
                  title: 'Work Email',
                  inputType: 'email',
                },
              ],
            },
            {
              type: 'panel',
              name: 'emergencyContact',
              title: 'Emergency Contact',
              elements: [
                {
                  type: 'text',
                  name: 'emergencyName',
                  title: 'Contact Name',
                },
                {
                  type: 'text',
                  name: 'emergencyPhone',
                  title: 'Contact Phone',
                  inputType: 'tel',
                },
              ],
            },
          ],
        },
      ],
    } as PanelModel,
  },

  // Collapsible Panels
  {
    type: 'panel-collapsible',
    name: 'Collapsible Panels',
    description: 'Expandable and collapsible panel examples',
    category: QuestionCategory.Layout,
    icon: '🔽',
    tags: ['layout', 'container', 'interactive', 'collapsible'],
    properties: [
      {
        name: 'state',
        type: 'string',
        description: 'Panel expansion state',
        defaultValue: 'expanded',
        options: ['expanded', 'collapsed', 'firstExpanded'],
      },
      {
        name: 'isExpanded',
        type: 'boolean',
        description: 'Whether panel is currently expanded',
        defaultValue: true,
      },
    ],
    example: {
      type: 'panel',
      name: 'preferencesPanel',
      title: 'User Preferences',
      state: 'collapsed',
      elements: [
        {
          type: 'boolean',
          name: 'notifications',
          title: 'Enable notifications',
          defaultValue: true,
        },
        {
          type: 'radiogroup',
          name: 'theme',
          title: 'App Theme',
          choices: ['Light', 'Dark', 'Auto'],
          defaultValue: 'Auto',
        },
        {
          type: 'dropdown',
          name: 'language',
          title: 'Language',
          choices: [
            { value: 'en', text: 'English' },
            { value: 'es', text: 'Spanish' },
            { value: 'fr', text: 'French' },
          ],
          defaultValue: 'en',
        },
      ],
    } as PanelModel,
  },

  // Panel Styling
  {
    type: 'panel-styled',
    name: 'Panel Styling',
    description: 'Different panel visual styles',
    category: QuestionCategory.Layout,
    icon: '🎨',
    tags: ['layout', 'container', 'styling', 'visual'],
    properties: [
      {
        name: 'cssClasses',
        type: 'object',
        description: 'Custom CSS classes for styling',
        required: false,
      },
      {
        name: 'indent',
        type: 'number',
        description: 'Indentation level for nested panels',
        defaultValue: 0,
      },
    ],
    example: {
      type: 'panel',
      name: 'styledPanel',
      title: 'Survey Feedback',
      description: 'Help us improve by sharing your thoughts',
      // Custom styling would be applied through the Panel component's style props
      elements: [
        {
          type: 'rating',
          name: 'satisfaction',
          title: 'Overall Satisfaction',
          rateMin: 1,
          rateMax: 5,
          minRateDescription: 'Very Unsatisfied',
          maxRateDescription: 'Very Satisfied',
        },
        {
          type: 'comment',
          name: 'suggestions',
          title: 'Suggestions for Improvement',
          // @ts-ignore - rows can be a number for comment questions
          rows: 4,
        },
      ],
    } as PanelModel,
  },

  // Dynamic Panel State
  {
    type: 'panel-dynamic-state',
    name: 'Dynamic Panel State',
    description: 'Panels with interactive state management',
    category: QuestionCategory.Layout,
    icon: '⚡',
    tags: ['layout', 'container', 'interactive', 'state'],
    properties: [
      {
        name: 'visibleIf',
        type: 'string',
        description: 'Expression to control panel visibility',
        required: false,
      },
      {
        name: 'enableIf',
        type: 'string',
        description: 'Expression to control panel enable state',
        required: false,
      },
    ],
    example: {
      type: 'panel',
      name: 'conditionalPanel',
      title: 'Additional Information',
      visibleIf: '{showAdditionalInfo} = true',
      elements: [
        {
          type: 'text',
          name: 'additionalDetails',
          title: 'Please provide more details',
        },
        {
          type: 'boolean',
          name: 'agreeToTerms',
          title: 'I agree to the additional terms',
          isRequired: true,
        },
      ],
    } as PanelModel,
  },

  // Empty Panel Handling
  {
    type: 'panel-empty',
    name: 'Empty Panel',
    description: 'Demonstration of empty panel behavior',
    category: QuestionCategory.Layout,
    icon: '📭',
    tags: ['layout', 'container', 'empty', 'edge-case'],
    properties: [
      {
        name: 'showTitle',
        type: 'boolean',
        description: 'Whether to show title when panel is empty',
        defaultValue: true,
      },
    ],
    example: {
      type: 'panel',
      name: 'emptyPanel',
      title: 'This Panel Has No Questions',
      description: 'Panels can exist without elements for conditional content',
      elements: [],
    } as PanelModel,
  },
];

// Performance test panel with many elements
export const performanceTestPanel: PanelModel = {
  type: 'panel',
  name: 'performancePanel',
  title: 'Performance Test Panel',
  description: 'Large panel with many nested elements for performance testing',
  elements: Array.from({ length: 20 }, (_, i) => ({
    type: 'panel',
    name: `section${i + 1}`,
    title: `Section ${i + 1}`,
    state: i === 0 ? 'expanded' : 'collapsed',
    elements: Array.from({ length: 5 }, (_, j) => ({
      type: 'text',
      name: `field_${i}_${j}`,
      title: `Field ${j + 1}`,
      placeHolder: `Enter value for field ${j + 1}`,
    })),
  })) as QuestionModel[],
};

// Interactive panel demo configuration
export interface PanelDemoConfig {
  showCode: boolean;
  allowToggleAll: boolean;
  enablePerformanceTest: boolean;
  showStateDebug: boolean;
}

export const defaultPanelDemoConfig: PanelDemoConfig = {
  showCode: true,
  allowToggleAll: true,
  enablePerformanceTest: false,
  showStateDebug: false,
};

// Helper to create a panel demo survey model
export function createPanelDemoSurvey(panels: PanelModel[]) {
  return {
    title: 'Panel Component Demonstration',
    showProgressBar: 'off',
    pages: [
      {
        name: 'panelDemoPage',
        elements: panels,
      },
    ],
  };
}

// Code snippets for each panel type
export const panelCodeSnippets = {
  'panel-basic': `<Panel
  title="Personal Information"
  description="Please provide your basic details"
>
  <TextQuestion name="firstName" title="First Name" />
  <TextQuestion name="lastName" title="Last Name" />
  <TextQuestion name="email" title="Email" />
</Panel>`,

  'panel-nested': `<Panel title="Employee Information">
  <Panel title="Basic Details">
    <TextQuestion name="employeeId" title="Employee ID" />
    <TextQuestion name="department" title="Department" />
  </Panel>
  <Panel title="Contact Information">
    <Panel title="Primary Contact">
      <TextQuestion name="workPhone" title="Work Phone" />
      <TextQuestion name="workEmail" title="Work Email" />
    </Panel>
  </Panel>
</Panel>`,

  'panel-collapsible': `<Panel
  title="User Preferences"
  state="collapsed"
  onToggle={(expanded) => console.log('Panel expanded:', expanded)}
>
  <BooleanQuestion name="notifications" title="Enable notifications" />
  <RadioGroupQuestion name="theme" title="App Theme" />
  <DropdownQuestion name="language" title="Language" />
</Panel>`,

  'panel-styled': `<Panel
  title="Survey Feedback"
  description="Help us improve"
  style={{
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  }}
>
  <RatingQuestion name="satisfaction" title="Overall Satisfaction" />
  <CommentQuestion name="suggestions" title="Suggestions" />
</Panel>`,

  'panel-dynamic-state': `<Panel
  title="Additional Information"
  visibleIf="{showAdditionalInfo} = true"
>
  <TextQuestion name="details" title="More details" />
  <BooleanQuestion name="agree" title="I agree" />
</Panel>`,

  'panel-empty': `<Panel
  title="Conditional Content Panel"
  description="Content will appear based on conditions"
  elements={conditionalElements}
/>`,
};