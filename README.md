# react-native-survey-js-ui

Native mobile UI components for SurveyJS Form Library - iOS and Android only, no WebView dependencies

## Version Compatibility

This library includes a custom-built version of survey-core with React Native compatibility fixes. The table below shows which version of survey-core is included with each release:

| react-native-survey-js-ui | survey-core | Release Date | Notes |
|---------------------------|-------------|--------------|-------|
| 0.1.0                     | 2.1.1       | 2025-06-07   | Initial release with React Native fixes |

### Survey-Core Compatibility

We maintain our own build of survey-core with the following React Native compatibility fixes:
- Fixed `window.addEventListener` calls in drag-drop functionality
- Fixed `document.head` access in settings initialization
- Added minimal window/document polyfills for React Native environment
- Ensured proper module resolution for React Native bundlers

**Note**: This library is locked to specific survey-core versions to ensure compatibility. Each release is thoroughly tested with the corresponding survey-core version.

## Installation

```sh
npm install react-native-survey-js-ui
```

### Peer Dependencies

This library requires the following peer dependencies to be installed in your React Native project:

- `react` (any version)
- `react-native` (any version)

These dependencies are not bundled with the library and must be provided by your application.

## Usage

```js
import { Survey } from 'react-native-survey-js-ui';
import type { SurveyModel } from 'react-native-survey-js-ui';

const surveyModel: SurveyModel = {
  pages: [
    {
      name: 'page1',
      elements: [
        {
          type: 'text',
          name: 'question1',
          title: 'What is your name?',
        },
      ],
    },
  ],
};

// In your component
<Survey model={surveyModel} />
```

## Event Handling

The Survey component supports event handlers to respond to user interactions:

```js
<Survey 
  model={surveyModel}
  onComplete={(result) => console.log('Survey completed:', result)}
  onValueChanged={(event) => console.log('Value changed:', event)}
  onCurrentPageChanged={(event) => console.log('Page changed:', event)}
/>
```

For detailed event documentation and examples, see [Event System Documentation](docs/EVENTS.md).

## API Reference

### Components

#### Survey

The main Survey component for rendering SurveyJS models in React Native.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `model` | `SurveyModel` | ✓ | The survey configuration object |
| `onComplete` | `(result: SurveyCompleteEvent) => void` | | Called when survey is completed |
| `onValueChanged` | `(event: SurveyValueChangedEvent) => void` | | Called when any question value changes |
| `onCurrentPageChanged` | `(event: SurveyCurrentPageChangedEvent) => void` | | Called when page navigation occurs |

**Example:**
```tsx
import { Survey, type SurveyModel } from 'react-native-survey-js-ui';

const surveyModel: SurveyModel = {
  pages: [{
    elements: [{
      type: 'text',
      name: 'firstName',
      title: 'What is your first name?'
    }]
  }]
};

<Survey
  model={surveyModel}
  onComplete={(result) => {
    console.log('Survey data:', result.data);
  }}
  onValueChanged={(event) => {
    console.log(`${event.name} changed to:`, event.value);
  }}
/>
```

#### SimpleSurvey

A simplified Survey component with minimal configuration options.

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `model` | `SurveyModel` | ✓ | The survey configuration object |
| `onComplete` | `(result: SurveyCompleteEvent) => void` | | Called when survey is completed |

**Example:**
```tsx
import { SimpleSurvey } from 'react-native-survey-js-ui';

<SimpleSurvey
  model={surveyModel}
  onComplete={(result) => console.log(result)}
/>
```

### Hooks

#### useSurveyModel

Hook for managing SurveyJS model state and lifecycle.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | `SurveyModel` | ✓ | Initial survey model |
| `options` | `UseSurveyModelOptions` | | Configuration options |

**Returns:** `UseSurveyModelResult`

**Example:**
```tsx
import { useSurveyModel } from 'react-native-survey-js-ui';

function MySurveyComponent() {
  const { surveyModel, isCompleted, data } = useSurveyModel(initialModel, {
    autoNavigateToNextPage: true
  });

  return (
    <Survey model={surveyModel} />
  );
}
```

#### useSurveyState

Hook for managing survey state and data.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `initialData` | `SurveyData` | | Initial survey data |

**Returns:** `SurveyState`

**Example:**
```tsx
import { useSurveyState } from 'react-native-survey-js-ui';

function MyComponent() {
  const { data, setData, isCompleted } = useSurveyState({
    firstName: 'John'
  });

  return (
    <Survey
      model={surveyModel}
      onValueChanged={(event) => {
        setData(prev => ({ ...prev, [event.name]: event.value }));
      }}
    />
  );
}
```

### Utilities

#### validateSurveyModel

Validates a survey model for correctness and compatibility.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | `any` | ✓ | The survey model to validate |

**Returns:** `boolean` - True if model is valid

**Example:**
```tsx
import { validateSurveyModel } from 'react-native-survey-js-ui';

const isValid = validateSurveyModel(surveyModel);
if (!isValid) {
  console.error('Invalid survey model');
}
```

#### initializeSurveyCore

Initializes the SurveyJS core with React Native polyfills.

**Returns:** `void`

**Example:**
```tsx
import { initializeSurveyCore } from 'react-native-survey-js-ui';

// Call once before using surveys
initializeSurveyCore();
```

#### createSurveyModel

Creates a SurveyJS model instance from a model definition.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | `SurveyModel` | ✓ | The survey model definition |

**Returns:** Survey model instance

#### SurveyModelManager

Utility class for managing multiple survey models.

**Methods:**

- `create(model: SurveyModel)` - Create a new survey model
- `dispose(model)` - Clean up survey model resources
- `getById(id: string)` - Get model by identifier

### TypeScript Types

The library provides comprehensive TypeScript definitions:

#### Core Types

- `SurveyModel` - Main survey configuration interface
- `PageModel` - Survey page definition
- `QuestionModel` - Question configuration
- `SurveyData` - Survey response data
- `SurveyResult` - Complete survey result

#### Event Types

- `SurveyCompleteEvent` - Survey completion event
- `SurveyValueChangedEvent` - Question value change event
- `SurveyCurrentPageChangedEvent` - Page navigation event

#### Component Types

- `SurveyProps` - Survey component props
- `SimpleSurveyProps` - SimpleSurvey component props
- `BaseQuestionProps` - Base question component props

#### Hook Types

- `UseSurveyModelOptions` - useSurveyModel configuration
- `UseSurveyModelResult` - useSurveyModel return type
- `SurveyState` - useSurveyState return type

#### Question Types

- `QuestionType` - Union of supported question types
- `ChoiceItem` - Choice option for selection questions
- `ValidatorModel` - Question validation rules
- `MatrixRow`, `MatrixColumn` - Matrix question definitions

## Usage Examples

### Basic Text Survey

```tsx
import React from 'react';
import { View } from 'react-native';
import { Survey, type SurveyModel } from 'react-native-survey-js-ui';

const textSurvey: SurveyModel = {
  pages: [{
    elements: [
      {
        type: 'text',
        name: 'firstName',
        title: 'What is your first name?',
        isRequired: true
      },
      {
        type: 'text',
        name: 'email',
        title: 'What is your email address?',
        inputType: 'email',
        validators: [
          { type: 'email', text: 'Please enter a valid email address' }
        ]
      }
    ]
  }]
};

export default function BasicSurvey() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Survey
        model={textSurvey}
        onComplete={(result) => {
          console.log('User data:', result.data);
          // Handle survey completion
        }}
      />
    </View>
  );
}
```

### Multiple Choice Survey

```tsx
import React from 'react';
import { Survey, type SurveyModel } from 'react-native-survey-js-ui';

const choiceSurvey: SurveyModel = {
  pages: [{
    elements: [
      {
        type: 'radiogroup',
        name: 'favoriteColor',
        title: 'What is your favorite color?',
        choices: [
          { value: 'red', text: 'Red' },
          { value: 'blue', text: 'Blue' },
          { value: 'green', text: 'Green' },
          { value: 'yellow', text: 'Yellow' }
        ]
      },
      {
        type: 'checkbox',
        name: 'hobbies',
        title: 'What are your hobbies? (Select all that apply)',
        choices: [
          'Reading',
          'Gaming',
          'Sports',
          'Music',
          'Travel'
        ],
        hasOther: true,
        otherText: 'Other (please specify)'
      }
    ]
  }]
};

export default function ChoiceSurvey() {
  return (
    <Survey
      model={choiceSurvey}
      onValueChanged={(event) => {
        console.log(`${event.name} changed to:`, event.value);
      }}
    />
  );
}
```

### Multi-Page Survey with Navigation

```tsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Survey, type SurveyModel } from 'react-native-survey-js-ui';

const multiPageSurvey: SurveyModel = {
  title: 'Customer Feedback Survey',
  showProgressBar: 'top',
  showPageNumbers: true,
  pages: [
    {
      name: 'personalInfo',
      title: 'Personal Information',
      elements: [
        {
          type: 'text',
          name: 'name',
          title: 'Full Name',
          isRequired: true
        },
        {
          type: 'dropdown',
          name: 'age',
          title: 'Age Range',
          choices: ['18-24', '25-34', '35-44', '45-54', '55+']
        }
      ]
    },
    {
      name: 'feedback',
      title: 'Your Feedback',
      elements: [
        {
          type: 'rating',
          name: 'satisfaction',
          title: 'How satisfied are you with our service?',
          rateMin: 1,
          rateMax: 5,
          minRateDescription: 'Very Unsatisfied',
          maxRateDescription: 'Very Satisfied'
        },
        {
          type: 'comment',
          name: 'suggestions',
          title: 'Any suggestions for improvement?',
          placeholder: 'Please share your thoughts...'
        }
      ]
    }
  ]
};

export default function MultiPageSurvey() {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      <Text>Page {currentPage + 1} of 2</Text>
      <Survey
        model={multiPageSurvey}
        onCurrentPageChanged={(event) => {
          setCurrentPage(event.newCurrentPage?.name === 'feedback' ? 1 : 0);
        }}
        onComplete={(result) => {
          console.log('Survey completed!', result.data);
        }}
      />
    </View>
  );
}
```

### Survey with Conditional Logic

```tsx
import React from 'react';
import { Survey, type SurveyModel } from 'react-native-survey-js-ui';

const conditionalSurvey: SurveyModel = {
  pages: [{
    elements: [
      {
        type: 'boolean',
        name: 'hasJob',
        title: 'Are you currently employed?'
      },
      {
        type: 'text',
        name: 'jobTitle',
        title: 'What is your job title?',
        visibleIf: '{hasJob} = true',
        isRequired: true
      },
      {
        type: 'text',
        name: 'company',
        title: 'What company do you work for?',
        visibleIf: '{hasJob} = true'
      },
      {
        type: 'radiogroup',
        name: 'jobSearch',
        title: 'Are you actively looking for work?',
        visibleIf: '{hasJob} = false',
        choices: [
          'Yes, actively searching',
          'Yes, but not urgently',
          'No, not looking'
        ]
      }
    ]
  }]
};

export default function ConditionalSurvey() {
  return (
    <Survey
      model={conditionalSurvey}
      onValueChanged={(event) => {
        // This will show/hide questions based on the hasJob answer
        console.log('Survey updated:', event.name, event.value);
      }}
    />
  );
}
```

### Survey with Custom Validation

```tsx
import React from 'react';
import { Survey, type SurveyModel } from 'react-native-survey-js-ui';

const validationSurvey: SurveyModel = {
  pages: [{
    elements: [
      {
        type: 'text',
        name: 'password',
        title: 'Create a password',
        inputType: 'password',
        validators: [
          {
            type: 'regex',
            text: 'Password must be at least 8 characters with numbers and letters',
            regex: '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$'
          }
        ]
      },
      {
        type: 'text',
        name: 'confirmPassword',
        title: 'Confirm your password',
        inputType: 'password',
        validators: [
          {
            type: 'expression',
            text: 'Passwords do not match',
            expression: '{confirmPassword} = {password}'
          }
        ]
      },
      {
        type: 'text',
        name: 'age',
        title: 'Your age',
        inputType: 'number',
        validators: [
          {
            type: 'numeric',
            text: 'Age must be between 13 and 120',
            minValue: 13,
            maxValue: 120
          }
        ]
      }
    ]
  }]
};

export default function ValidationSurvey() {
  return (
    <Survey model={validationSurvey} />
  );
}
```

### TypeScript Integration Example

```tsx
import React from 'react';
import { 
  Survey, 
  type SurveyModel, 
  type SurveyCompleteEvent,
  type SurveyValueChangedEvent,
  validateSurveyModel 
} from 'react-native-survey-js-ui';

// Define your survey data type
interface CustomerData {
  name: string;
  email: string;
  rating: number;
  feedback?: string;
}

const customerSurvey: SurveyModel = {
  pages: [{
    elements: [
      {
        type: 'text',
        name: 'name',
        title: 'Your Name',
        isRequired: true
      },
      {
        type: 'text',
        name: 'email',
        title: 'Email Address',
        inputType: 'email',
        isRequired: true
      },
      {
        type: 'rating',
        name: 'rating',
        title: 'Rate our service',
        rateMin: 1,
        rateMax: 5
      },
      {
        type: 'comment',
        name: 'feedback',
        title: 'Additional feedback'
      }
    ]
  }]
};

export default function TypeScriptSurvey() {
  const handleComplete = (event: SurveyCompleteEvent) => {
    // Type-safe access to survey data
    const data = event.data as CustomerData;
    console.log('Customer name:', data.name);
    console.log('Customer email:', data.email);
    console.log('Rating:', data.rating);
  };

  const handleValueChanged = (event: SurveyValueChangedEvent) => {
    console.log(`Field ${event.name} changed to:`, event.value);
  };

  // Validate before rendering
  if (!validateSurveyModel(customerSurvey)) {
    return <Text>Invalid survey configuration</Text>;
  }

  return (
    <Survey
      model={customerSurvey}
      onComplete={handleComplete}
      onValueChanged={handleValueChanged}
    />
  );
}
```

## Documentation

### User Documentation
- [Event System](docs/EVENTS.md) - Comprehensive guide to handling survey events

### Developer Documentation
- [Development Guide](docs/DEVELOPMENT.md) - Development workflow and best practices
- [Build Guide](docs/BUILD.md) - Building and releasing the library

### Testing and TDD Documentation
This project follows strict Test-Driven Development (TDD) practices. All contributions must adhere to TDD principles:

- **[TDD Workflow Guide](docs/TDD_WORKFLOW.md)** - Complete TDD process and principles
- **[TDD Integration Guide](docs/TDD_INTEGRATION_GUIDE.md)** - Integrating TDD into development workflow
- **[React Native Testing Best Practices](docs/REACT_NATIVE_TESTING_BEST_PRACTICES.md)** - Library-specific testing patterns
- **[Mock Usage Guide](docs/MOCK_USAGE_GUIDE.md)** - Comprehensive mocking strategies
- **[Test Organization Conventions](docs/TEST_ORGANIZATION_CONVENTIONS.md)** - Structure and naming standards
- **[Test Templates](docs/TEST_TEMPLATES.md)** - Ready-to-use test templates
- **[TDD Code Review Checklist](docs/TDD_CODE_REVIEW_CHECKLIST.md)** - Ensuring TDD compliance
- **[Testing Troubleshooting FAQ](docs/TESTING_TROUBLESHOOTING_FAQ.md)** - Common issues and solutions

### TDD Requirements
- **CRITICAL**: All code must follow the Red-Green-Refactor cycle
- **Coverage**: >90% code coverage required for all new code
- **Tests First**: No implementation without corresponding tests
- **Quality**: Tests must validate behavior, not just achieve coverage

## Troubleshooting

### Common Issues

#### Survey Not Rendering

**Problem**: Survey component renders but shows blank content.

**Solutions**:
1. Verify your survey model has valid structure:
   ```tsx
   import { validateSurveyModel } from 'react-native-survey-js-ui';
   
   if (!validateSurveyModel(yourModel)) {
     console.error('Invalid survey model');
   }
   ```

2. Ensure survey model has at least one page with elements:
   ```tsx
   const validModel = {
     pages: [{
       elements: [{
         type: 'text',
         name: 'question1',
         title: 'Your question'
       }]
     }]
   };
   ```

#### TypeScript Type Errors

**Problem**: TypeScript compilation errors when using the library.

**Solutions**:
1. Import types explicitly:
   ```tsx
   import { Survey, type SurveyModel } from 'react-native-survey-js-ui';
   ```

2. Ensure your tsconfig.json includes proper module resolution:
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "esModuleInterop": true,
       "allowSyntheticDefaultImports": true
     }
   }
   ```

#### Metro Bundler Issues

**Problem**: Metro cannot resolve the module or shows bundling errors.

**Solutions**:
1. Clear Metro cache:
   ```bash
   npx react-native start --reset-cache
   ```

2. Add to your metro.config.js if using custom configuration:
   ```js
   module.exports = {
     resolver: {
       alias: {
         'react-native-survey-js-ui': path.resolve(__dirname, 'node_modules/react-native-survey-js-ui')
       }
     }
   };
   ```

#### React Native Version Compatibility

**Problem**: Library not working with specific React Native versions.

**Solutions**:
1. Check peer dependency compatibility in package.json
2. This library requires React Native 0.60+ for auto-linking
3. For older versions, manual linking may be required

#### Survey Events Not Firing

**Problem**: onComplete, onValueChanged handlers not being called.

**Solutions**:
1. Ensure handlers are defined as functions:
   ```tsx
   const handleComplete = (result) => {
     console.log('Survey completed:', result);
   };
   
   <Survey model={model} onComplete={handleComplete} />
   ```

2. Check that survey model has proper question names:
   ```tsx
   {
     type: 'text',
     name: 'uniqueName', // Must have unique name
     title: 'Question'
   }
   ```

### Performance Issues

#### Large Surveys Loading Slowly

**Solutions**:
1. Split large surveys into multiple pages
2. Use conditional logic to reduce visible questions
3. Consider lazy loading for complex question types

#### Memory Leaks

**Solutions**:
1. Properly dispose of survey models:
   ```tsx
   import { disposeSurveyModel } from 'react-native-survey-js-ui';
   
   useEffect(() => {
     return () => {
       if (surveyModel) {
         disposeSurveyModel(surveyModel);
       }
     };
   }, [surveyModel]);
   ```

### FAQ

#### Q: Can I use this library with Expo?
A: Yes, this library is compatible with Expo managed and bare workflows. No native linking is required.

#### Q: Does this library support all SurveyJS question types?
A: Currently, the library supports basic question types (text, radiogroup, checkbox, dropdown, etc.). Advanced question types are being added progressively. Check the latest version for supported types.

#### Q: Can I customize the UI styling?
A: Yes, the library provides styling options and theming support. See the theming documentation for details.

#### Q: Is offline functionality supported?
A: Yes, this library works completely offline since it renders natively without WebView dependencies.

#### Q: How do I migrate from SurveyJS React?
A: The API is largely compatible. Main changes:
1. Import from `react-native-survey-js-ui` instead of `survey-react`
2. Some web-specific properties may not be supported
3. Styling uses React Native style objects instead of CSS

#### Q: Can I use this in TypeScript projects?
A: Yes, the library includes comprehensive TypeScript definitions and is built with TypeScript.

#### Q: How do I handle survey data persistence?
A: The library provides survey data through completion events. You handle persistence:
```tsx
<Survey
  model={model}
  onComplete={(result) => {
    // Save to AsyncStorage, database, or API
    AsyncStorage.setItem('surveyData', JSON.stringify(result.data));
  }}
/>
```

#### Q: Are there size limitations for surveys?
A: There are no hard limits, but for best performance:
- Keep individual pages under 20 questions
- Use pagination for longer surveys
- Consider conditional logic to reduce visible questions

#### Q: How do I report bugs or request features?
A: Please use the [GitHub Issues](https://github.com/iotashan/react-native-survey-js-ui/issues) page for bug reports and feature requests.

## Integration Examples

### React Navigation Integration

```tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Survey } from 'react-native-survey-js-ui';

const Stack = createStackNavigator();

function SurveyScreen({ route, navigation }) {
  const { surveyModel } = route.params;

  return (
    <Survey
      model={surveyModel}
      onComplete={(result) => {
        // Navigate to results screen with data
        navigation.navigate('Results', { data: result.data });
      }}
    />
  );
}

export default function App() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Survey" component={SurveyScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
    </Stack.Navigator>
  );
}
```

### Redux Integration

```tsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Survey } from 'react-native-survey-js-ui';
import { saveSurveyData, updateSurveyProgress } from './surveySlice';

export default function ReduxSurvey() {
  const dispatch = useDispatch();
  const surveyModel = useSelector(state => state.survey.currentModel);

  return (
    <Survey
      model={surveyModel}
      onValueChanged={(event) => {
        dispatch(updateSurveyProgress({
          questionName: event.name,
          value: event.value
        }));
      }}
      onComplete={(result) => {
        dispatch(saveSurveyData(result.data));
      }}
    />
  );
}
```

### AsyncStorage Integration

```tsx
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Survey, type SurveyModel } from 'react-native-survey-js-ui';

export default function PersistentSurvey({ surveyModel }: { surveyModel: SurveyModel }) {
  const [savedData, setSavedData] = useState(null);

  useEffect(() => {
    // Load saved data on component mount
    AsyncStorage.getItem('survey_progress')
      .then(data => {
        if (data) {
          setSavedData(JSON.parse(data));
        }
      })
      .catch(console.error);
  }, []);

  // Update the model with saved data if available
  const modelWithData = savedData 
    ? { ...surveyModel, data: savedData }
    : surveyModel;

  return (
    <Survey
      model={modelWithData}
      onValueChanged={(event) => {
        // Save progress after each change
        AsyncStorage.setItem('survey_progress', JSON.stringify({
          ...savedData,
          [event.name]: event.value
        }));
        setSavedData(prev => ({ ...prev, [event.name]: event.value }));
      }}
      onComplete={(result) => {
        // Clear saved progress on completion
        AsyncStorage.removeItem('survey_progress');
        console.log('Survey completed:', result.data);
      }}
    />
  );
}
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
