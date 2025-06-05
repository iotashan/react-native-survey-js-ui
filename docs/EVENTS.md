# Event System Documentation

This document describes the event system in react-native-survey-js-ui and how to use it in your applications.

## Overview

The Survey component provides event handlers that bridge survey-core events with React Native components. This allows you to respond to survey interactions in real-time.

## Available Events

### onValueChanged

Fires when a question value is changed by the user.

**Type Definition:**
```typescript
interface SurveyValueChangedEvent {
  name: string;           // Question name that changed
  value: any;            // New value
  oldValue?: any;        // Previous value
  question?: QuestionModel; // Question object that changed
}

type SurveyValueChangedHandler = (event: SurveyValueChangedEvent) => void;
```

**Usage:**
```tsx
import { Survey } from 'react-native-survey-js-ui';

const handleValueChanged = (event) => {
  console.log(`Question ${event.name} changed from ${event.oldValue} to ${event.value}`);
  
  // Example: Real-time validation
  if (event.name === 'email' && !isValidEmail(event.value)) {
    showValidationError('Please enter a valid email address');
  }
  
  // Example: Conditional logic
  if (event.name === 'hasChildren' && event.value === true) {
    enableChildrenSection();
  }
};

<Survey 
  model={surveyModel} 
  onValueChanged={handleValueChanged}
/>
```

### onCurrentPageChanged

Fires when the user navigates between survey pages.

**Type Definition:**
```typescript
interface SurveyCurrentPageChangedEvent {
  oldCurrentPage?: PageModel;  // Previous page object
  newCurrentPage?: PageModel;  // New current page object
  isNextPage?: boolean;        // Whether this is forward navigation
  isPrevPage?: boolean;        // Whether this is backward navigation
}

type SurveyCurrentPageChangedHandler = (event: SurveyCurrentPageChangedEvent) => void;
```

**Usage:**
```tsx
const handlePageChanged = (event) => {
  console.log(`Navigated from ${event.oldCurrentPage?.name} to ${event.newCurrentPage?.name}`);
  
  // Example: Track progress
  updateProgressAnalytics(event.newCurrentPage?.name);
  
  // Example: Auto-save on page change
  if (event.isNextPage) {
    autoSaveSurveyData();
  }
  
  // Example: Show page-specific help
  showHelpForPage(event.newCurrentPage?.name);
};

<Survey 
  model={surveyModel} 
  onCurrentPageChanged={handlePageChanged}
/>
```

### onComplete

Fires when the survey is completed (existing functionality, enhanced).

**Usage:**
```tsx
const handleSurveyComplete = (result) => {
  console.log('Survey completed:', result);
  
  // Example: Submit to server
  submitSurveyToServer(result.data);
  
  // Example: Show completion screen
  navigation.navigate('SurveyComplete', { result });
  
  // Example: Analytics tracking
  trackSurveyCompletion(result.surveyId, result.timestamp);
};

<Survey 
  model={surveyModel} 
  onComplete={handleSurveyComplete}
/>
```

## Complete Example

Here's a comprehensive example showing all event handlers:

```tsx
import React, { useState } from 'react';
import { Survey } from 'react-native-survey-js-ui';

export default function SurveyScreen() {
  const [eventLog, setEventLog] = useState([]);
  
  const addLogEntry = (type, data) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLog(prev => [`[${timestamp}] ${type}: ${JSON.stringify(data)}`, ...prev]);
  };

  const handleValueChanged = (event) => {
    addLogEntry('Value Changed', {
      question: event.name,
      newValue: event.value,
      oldValue: event.oldValue
    });
    
    // Real-time logic
    if (event.name === 'urgency' && event.value === 'high') {
      // Trigger immediate notification
      scheduleUrgentFollowUp();
    }
  };

  const handlePageChanged = (event) => {
    addLogEntry('Page Changed', {
      from: event.oldCurrentPage?.name,
      to: event.newCurrentPage?.name,
      direction: event.isNextPage ? 'forward' : 'backward'
    });
    
    // Page-specific logic
    if (event.newCurrentPage?.name === 'contact-info') {
      preloadContactValidation();
    }
  };

  const handleComplete = (result) => {
    addLogEntry('Survey Completed', result);
    
    // Submit and navigate
    submitSurvey(result.data).then(() => {
      navigation.navigate('ThankYou');
    });
  };

  return (
    <Survey 
      model={surveyModel}
      onValueChanged={handleValueChanged}
      onCurrentPageChanged={handlePageChanged}
      onComplete={handleComplete}
    />
  );
}
```

## Best Practices

### Error Handling

All event handlers are wrapped in try-catch blocks internally. If your handler throws an error, it will be logged to the console but won't break the survey flow:

```tsx
const handleValueChanged = (event) => {
  try {
    // Your event handling logic
    processValueChange(event);
  } catch (error) {
    // This is handled automatically by the library
    // The error will be logged, but survey continues working
    console.warn('Error in value change handler:', error);
  }
};
```

### Performance Considerations

- Event handlers are called for every user interaction
- Keep handlers lightweight to avoid blocking the UI
- Use debouncing for expensive operations:

```tsx
import { useMemo } from 'react';
import { debounce } from 'lodash';

const handleValueChanged = useMemo(
  () => debounce((event) => {
    // Expensive operation (API call, complex validation, etc.)
    performExpensiveValidation(event.value);
  }, 300),
  []
);
```

### Memory Management

Event handlers are automatically cleaned up when the Survey component unmounts. You don't need to manually remove listeners.

### TypeScript Support

All event types are fully typed. Import the types for better development experience:

```tsx
import { 
  SurveyValueChangedEvent, 
  SurveyCurrentPageChangedEvent 
} from 'react-native-survey-js-ui';

const handleValueChanged = (event: SurveyValueChangedEvent) => {
  // Full TypeScript support with autocompletion
  console.log(event.name, event.value);
};
```

## Common Use Cases

### Real-time Validation
```tsx
const handleValueChanged = (event) => {
  if (event.name === 'email') {
    const isValid = validateEmail(event.value);
    setEmailError(isValid ? null : 'Invalid email format');
  }
};
```

### Conditional Logic
```tsx
const handleValueChanged = (event) => {
  if (event.name === 'hasVehicle' && event.value === false) {
    // Skip vehicle-related questions
    skipToSection('transportation-alternatives');
  }
};
```

### Progress Tracking
```tsx
const handlePageChanged = (event) => {
  if (event.isNextPage) {
    const progress = calculateProgress(event.newCurrentPage);
    updateProgressBar(progress);
  }
};
```

### Data Persistence
```tsx
const handleValueChanged = (event) => {
  // Auto-save every answer
  saveAnswerToStorage(event.name, event.value);
};
```

### Analytics
```tsx
const handlePageChanged = (event) => {
  analytics.track('survey_page_viewed', {
    page: event.newCurrentPage?.name,
    direction: event.isNextPage ? 'forward' : 'backward'
  });
};
```