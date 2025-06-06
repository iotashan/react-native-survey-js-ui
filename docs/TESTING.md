# Testing Guide for react-native-survey-js-ui

This guide covers the comprehensive testing infrastructure and mock utilities available for testing components that use survey-core.

## Table of Contents
- [Mock Infrastructure Overview](#mock-infrastructure-overview)
- [Using Survey-Core Mocks](#using-survey-core-mocks)
- [React Native Component Mocks](#react-native-component-mocks)
- [Test Utilities](#test-utilities)
- [Testing Patterns](#testing-patterns)
- [Best Practices](#best-practices)

## Mock Infrastructure Overview

The library provides a sophisticated mocking system that allows testing components in isolation from survey-core and React Native dependencies.

### Directory Structure
```
src/
├── __mocks__/
│   ├── survey-core/          # Survey-core mocks
│   │   ├── index.ts         # Main export file
│   │   ├── Model.mock.ts    # MockSurveyModel implementation
│   │   └── __tests__/       # Tests for mocks
│   └── react-native/        # React Native component mocks
└── test-utils/              # Testing utilities
    ├── surveyFactories.ts   # Survey JSON factories
    ├── mockEventSystem.ts   # Event system mocks
    ├── mockScenarios.ts     # Test scenarios
    └── index.ts            # Main exports
```

## Using Survey-Core Mocks

### MockSurveyModel

The `MockSurveyModel` provides a realistic implementation of survey-core's Model class:

```typescript
import { MockSurveyModel } from '@/test-utils';

// Create a mock model
const model = new MockSurveyModel({
  pages: [{
    elements: [{
      type: 'text',
      name: 'username',
      title: 'What is your username?'
    }]
  }]
});

// Test value changes
model.setValue('username', 'john_doe');
expect(model.getValue('username')).toBe('john_doe');

// Test events
const handler = jest.fn();
model.onValueChanged.add(handler);
model.setValue('username', 'jane_doe');
expect(handler).toHaveBeenCalledWith(model, {
  name: 'username',
  value: 'jane_doe',
  oldValue: 'john_doe'
});
```

### Event System

The mock includes a complete event system that mirrors survey-core:

```typescript
// Available events
model.onComplete
model.onValueChanged
model.onCurrentPageChanged
model.onPageVisibleChanged
model.onQuestionVisibleChanged

// Testing navigation events
const pageHandler = jest.fn();
model.onCurrentPageChanged.add(pageHandler);
model.nextPage();
expect(pageHandler).toHaveBeenCalled();
```

## React Native Component Mocks

Mock React Native components for unit testing:

```typescript
// Components are automatically mocked via jest.setup.js
import { render } from '@testing-library/react-native';
import { TextInput } from 'react-native';

// TextInput is mocked but behaves like real component
const { getByTestId } = render(
  <TextInput testID="input" value="test" />
);
expect(getByTestId('input').props.value).toBe('test');
```

## Test Utilities

### Survey Factories

Create consistent test data with factory functions:

```typescript
import {
  createBasicSurvey,
  createMultiPageSurvey,
  createMixedQuestionSurvey,
  createConditionalSurvey
} from '@/test-utils';

// Basic survey with one text question
const basic = createBasicSurvey();

// Multi-page survey
const multiPage = createMultiPageSurvey(3); // 3 pages

// Survey with various question types
const mixed = createMixedQuestionSurvey();

// Survey with conditional logic
const conditional = createConditionalSurvey();
```

### Mock Scenarios

Apply pre-configured test scenarios:

```typescript
import { createModelWithScenario, scenarios } from '@/test-utils';

// Create model in loading state
const loadingModel = createModelWithScenario(
  surveyJson,
  scenarios.loading
);

// Create completed survey
const completedModel = createModelWithScenario(
  surveyJson,
  scenarios.completed
);

// Available scenarios:
// - loading
// - validationError
// - completed
// - multiPage
// - conditionalVisibility
// - asyncData
// - customValidation
// - readOnly
// - networkError
```

### Mock Event System

Test event-driven behavior:

```typescript
import {
  createMockEvent,
  MockEventEmitter,
  waitForEvent,
  expectEventFired
} from '@/test-utils';

// Create event emitter
const emitter = new MockEventEmitter();

// Wait for async event
const result = await waitForEvent(emitter, 'complete', 1000);

// Assert event was fired
expectEventFired(model.onComplete, { isCompleted: true });
```

## Testing Patterns

### Testing Components with Survey Model

```typescript
import { render } from '@testing-library/react-native';
import { Survey } from '@/components/Survey';
import { createBasicSurvey, MockSurveyModel } from '@/test-utils';

describe('Survey Component', () => {
  let model: MockSurveyModel;
  
  beforeEach(() => {
    const json = createBasicSurvey();
    model = new MockSurveyModel(json);
  });
  
  it('should render survey questions', () => {
    const { getByText } = render(<Survey model={model} />);
    expect(getByText('What is your name?')).toBeTruthy();
  });
  
  it('should handle value changes', () => {
    const { getByTestId } = render(<Survey model={model} />);
    const input = getByTestId('question-name');
    
    fireEvent.changeText(input, 'John Doe');
    
    expect(model.getValue('name')).toBe('John Doe');
  });
});
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useSurveyState } from '@/hooks';
import { MockSurveyModel } from '@/test-utils';

describe('useSurveyState', () => {
  it('should track survey state changes', () => {
    const model = new MockSurveyModel(surveyJson);
    const { result } = renderHook(() => useSurveyState(model));
    
    // Initial state
    expect(result.current.currentPageNo).toBe(0);
    expect(result.current.isCompleted).toBe(false);
    
    // Simulate completion
    act(() => {
      model.completeLastPage();
    });
    
    expect(result.current.isCompleted).toBe(true);
  });
});
```

### Testing with Scenarios

```typescript
import { applyScenario, scenarios } from '@/test-utils';

it('should handle validation errors', () => {
  const model = new MockSurveyModel(surveyJson);
  applyScenario(model, scenarios.validationError);
  
  const { getByText } = render(<Survey model={model} />);
  
  expect(getByText('Name is required')).toBeTruthy();
  expect(getByText('Email is invalid')).toBeTruthy();
});
```

## Best Practices

### 1. Use Factory Functions

Always use factory functions for creating test data:

```typescript
// Good
const survey = createBasicSurvey({ title: 'My Survey' });

// Avoid
const survey = {
  title: 'My Survey',
  pages: [{ elements: [...] }]
};
```

### 2. Test Event Handlers

Always test that event handlers are properly connected:

```typescript
const handler = jest.fn();
model.onValueChanged.add(handler);

// Perform action
model.setValue('question1', 'answer');

// Verify handler was called
expect(handler).toHaveBeenCalledWith(model, {
  name: 'question1',
  value: 'answer'
});

// Clean up
model.onValueChanged.remove(handler);
```

### 3. Use Type-Safe Mocks

Leverage TypeScript for type-safe mocking:

```typescript
import { Model } from 'survey-core';
import { MockSurveyModel } from '@/test-utils';

// MockSurveyModel implements Model interface
const model: Model = new MockSurveyModel(json);
```

### 4. Clean Up After Tests

Always dispose models and clean up:

```typescript
afterEach(() => {
  model.dispose();
  jest.clearAllMocks();
});
```

### 5. Test Edge Cases

Use scenarios to test edge cases:

```typescript
describe('Survey error handling', () => {
  it.each([
    ['network error', scenarios.networkError],
    ['validation error', scenarios.validationError],
  ])('should handle %s', (name, scenario) => {
    const model = createModelWithScenario(json, scenario);
    // Test error handling
  });
});
```

### 6. Isolate Component Tests

Test components in isolation using mocks:

```typescript
// Mock the hook instead of creating real model
jest.mock('@/hooks/useSurveyModel', () => ({
  useSurveyModel: () => ({
    model: mockModel,
    isLoading: false,
    error: null
  })
}));
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/components/Survey/Survey.test.tsx
```

## Debugging Tests

### Enable Verbose Logging

```typescript
// In your test
console.log('Model state:', {
  data: model.data,
  currentPage: model.currentPageNo,
  questions: model.getAllQuestions()
});
```

### Use Debug Helper

```typescript
import { debug } from '@testing-library/react-native';

const { debug } = render(<Survey model={model} />);
debug(); // Prints component tree
```

### Check Mock Calls

```typescript
// See all calls to a mock
console.log('setValue calls:', model.setValue.mock.calls);

// Check specific call
expect(model.setValue).toHaveBeenNthCalledWith(
  1, 'question1', 'value1'
);
```