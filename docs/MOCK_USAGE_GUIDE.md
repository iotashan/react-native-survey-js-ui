# Mock Usage Guide for React Native Survey Library

This guide provides comprehensive patterns and examples for using mocks effectively in React Native library testing, with specific focus on survey-core and React Native component mocking strategies.

## Table of Contents

- [Mock Strategy Overview](#mock-strategy-overview)
- [Survey-Core Mocking](#survey-core-mocking)
- [React Native Component Mocks](#react-native-component-mocks)
- [Advanced Mock Patterns](#advanced-mock-patterns)
- [Mock Utilities and Helpers](#mock-utilities-and-helpers)
- [Testing Scenarios with Mocks](#testing-scenarios-with-mocks)
- [Mock Validation and Maintenance](#mock-validation-and-maintenance)
- [Common Mock Pitfalls](#common-mock-pitfalls)

## Mock Strategy Overview

### Principles of Effective Mocking

1. **Realistic Behavior**: Mocks should behave like real implementations
2. **Minimal but Complete**: Mock only what you need, but completely
3. **Predictable**: Mocks should produce consistent, testable results
4. **Maintainable**: Keep mocks simple and easy to understand
5. **Verifiable**: Ability to assert on mock interactions

### Mock Hierarchy

```
Application Tests
├── Integration Mocks (minimal, real-like)
├── Component Mocks (behavior-focused)
└── Unit Mocks (isolated, precise)
```

### When to Mock vs Not Mock

```typescript
// DO Mock:
- External dependencies (survey-core)
- React Native platform APIs
- Network requests
- File system operations
- Device-specific features

// DON'T Mock:
- Your own library code
- Basic React components
- Standard JavaScript objects
- Simple utility functions
```

## Survey-Core Mocking

### MockSurveyModel Implementation

The core mock that mimics survey-core's Model class:

```typescript
// src/__mocks__/survey-core/MockSurveyModel.ts

export class MockSurveyModel {
  public data: Record<string, any> = {};
  public currentPageNo: number = 0;
  public state: 'loading' | 'running' | 'completed' = 'running';
  
  // Event system
  public onValueChanged = new MockEvent();
  public onComplete = new MockEvent();
  public onCurrentPageChanged = new MockEvent();
  
  constructor(public json: any = {}) {
    this.pages = json.pages || [];
    this.questions = this.extractQuestions();
  }
  
  // Core methods
  getValue(name: string): any {
    return this.data[name];
  }
  
  setValue(name: string, value: any): void {
    const oldValue = this.data[name];
    this.data[name] = value;
    
    // Trigger event
    this.onValueChanged.fire(this, {
      name,
      value,
      oldValue,
      question: this.getQuestionByName(name)
    });
  }
  
  // Navigation
  nextPage(): boolean {
    if (this.currentPageNo < this.pages.length - 1) {
      this.currentPageNo++;
      this.onCurrentPageChanged.fire(this, {
        oldCurrentPage: this.pages[this.currentPageNo - 1],
        newCurrentPage: this.pages[this.currentPageNo]
      });
      return true;
    }
    return false;
  }
  
  prevPage(): boolean {
    if (this.currentPageNo > 0) {
      this.currentPageNo--;
      this.onCurrentPageChanged.fire(this, {
        oldCurrentPage: this.pages[this.currentPageNo + 1],
        newCurrentPage: this.pages[this.currentPageNo]
      });
      return true;
    }
    return false;
  }
  
  // Completion
  completeLastPage(): void {
    this.state = 'completed';
    this.onComplete.fire(this, {
      isCompleted: true,
      data: this.data
    });
  }
  
  // Validation
  hasErrors(): boolean {
    return this.getErrors().length > 0;
  }
  
  getErrors(): Array<{ question: string, error: string }> {
    const errors = [];
    
    this.questions.forEach(question => {
      if (question.isRequired && !this.getValue(question.name)) {
        errors.push({
          question: question.name,
          error: `${question.title} is required`
        });
      }
    });
    
    return errors;
  }
  
  // Utility methods
  private extractQuestions(): any[] {
    const questions = [];
    this.pages.forEach(page => {
      if (page.elements) {
        questions.push(...page.elements);
      }
    });
    return questions;
  }
  
  private getQuestionByName(name: string): any {
    return this.questions.find(q => q.name === name);
  }
  
  dispose(): void {
    this.onValueChanged.clear();
    this.onComplete.clear();
    this.onCurrentPageChanged.clear();
  }
}
```

### MockEvent System

```typescript
// src/__mocks__/survey-core/MockEvent.ts

export class MockEvent<T = any> {
  private handlers: Array<(sender: any, options: T) => void> = [];
  
  add(handler: (sender: any, options: T) => void): void {
    this.handlers.push(handler);
  }
  
  remove(handler: (sender: any, options: T) => void): void {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }
  
  fire(sender: any, options: T): void {
    this.handlers.forEach(handler => {
      try {
        handler(sender, options);
      } catch (error) {
        console.error('Error in event handler:', error);
      }
    });
  }
  
  clear(): void {
    this.handlers = [];
  }
  
  get isEmpty(): boolean {
    return this.handlers.length === 0;
  }
  
  get length(): number {
    return this.handlers.length;
  }
}
```

### Using MockSurveyModel in Tests

```typescript
// Basic usage
describe('Survey Component', () => {
  let mockModel: MockSurveyModel;
  
  beforeEach(() => {
    mockModel = new MockSurveyModel({
      pages: [{
        elements: [{
          type: 'text',
          name: 'firstName',
          title: 'First Name',
          isRequired: true
        }]
      }]
    });
  });
  
  afterEach(() => {
    mockModel.dispose();
  });
  
  it('should update model when input changes', () => {
    const { getByTestId } = render(<Survey model={mockModel} />);
    const input = getByTestId('question-firstName');
    
    fireEvent.changeText(input, 'John');
    
    expect(mockModel.getValue('firstName')).toBe('John');
  });
  
  it('should trigger events on value change', () => {
    const eventHandler = jest.fn();
    mockModel.onValueChanged.add(eventHandler);
    
    mockModel.setValue('firstName', 'Jane');
    
    expect(eventHandler).toHaveBeenCalledWith(mockModel, {
      name: 'firstName',
      value: 'Jane',
      oldValue: undefined,
      question: expect.objectContaining({ name: 'firstName' })
    });
  });
});
```

## React Native Component Mocks

### Core React Native Mocks

```typescript
// jest.setup.js - Global React Native mocks

// Text Component
jest.mock('react-native/Libraries/Text/Text', () => {
  const React = require('react');
  return React.forwardRef((props, ref) => {
    return React.createElement('Text', { ...props, ref });
  });
});

// TextInput Component
jest.mock('react-native/Libraries/Components/TextInput/TextInput', () => {
  const React = require('react');
  return React.forwardRef((props, ref) => {
    return React.createElement('TextInput', {
      ...props,
      ref,
      onChangeText: props.onChangeText || (() => {}),
      value: props.value || '',
    });
  });
});

// TouchableOpacity
jest.mock('react-native/Libraries/Components/Touchable/TouchableOpacity', () => {
  const React = require('react');
  return React.forwardRef((props, ref) => {
    return React.createElement('TouchableOpacity', {
      ...props,
      ref,
      onPress: props.onPress || (() => {}),
    });
  });
});

// ScrollView
jest.mock('react-native/Libraries/Components/ScrollView/ScrollView', () => {
  const React = require('react');
  return React.forwardRef((props, ref) => {
    return React.createElement('ScrollView', { ...props, ref });
  });
});
```

### Platform-Specific Mocks

```typescript
// Mock Platform for cross-platform testing
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios', // Default to iOS
  select: (platforms) => platforms.ios || platforms.default,
  Version: '14.0',
}));

// Dynamic platform testing
const mockPlatform = (os: 'ios' | 'android') => {
  jest.doMock('react-native/Libraries/Utilities/Platform', () => ({
    OS: os,
    select: (platforms) => platforms[os] || platforms.default,
    Version: os === 'ios' ? '14.0' : '30',
  }));
};

// Usage in tests
describe('Platform-specific behavior', () => {
  it('should render iOS styles', () => {
    mockPlatform('ios');
    const { getByTestId } = render(<PlatformComponent />);
    // Test iOS-specific behavior
  });
  
  it('should render Android styles', () => {
    mockPlatform('android');
    const { getByTestId } = render(<PlatformComponent />);
    // Test Android-specific behavior
  });
});
```

### Dimensions Mock

```typescript
// Mock Dimensions for responsive testing
const mockDimensions = (width: number, height: number) => {
  jest.doMock('react-native/Libraries/Utilities/Dimensions', () => ({
    get: jest.fn().mockReturnValue({ width, height }),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
};

// Usage
describe('Responsive behavior', () => {
  it('should adapt to phone size', () => {
    mockDimensions(375, 667); // iPhone 8
    const { getByTestId } = render(<ResponsiveComponent />);
    expect(getByTestId('container').props.style.flexDirection).toBe('column');
  });
  
  it('should adapt to tablet size', () => {
    mockDimensions(768, 1024); // iPad
    const { getByTestId } = render(<ResponsiveComponent />);
    expect(getByTestId('container').props.style.flexDirection).toBe('row');
  });
});
```

## Advanced Mock Patterns

### State-Aware Mocks

```typescript
// Mock that maintains state across interactions
class StatefulMock {
  private state: any = {};
  
  setState(key: string, value: any): void {
    this.state[key] = value;
  }
  
  getState(key: string): any {
    return this.state[key];
  }
  
  reset(): void {
    this.state = {};
  }
}

// Usage in AsyncStorage mock
const createAsyncStorageMock = () => {
  const storage = new Map<string, string>();
  
  return {
    getItem: jest.fn((key: string) => 
      Promise.resolve(storage.get(key) || null)
    ),
    setItem: jest.fn((key: string, value: string) => {
      storage.set(key, value);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      storage.delete(key);
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      storage.clear();
      return Promise.resolve();
    }),
    // Test utilities
    __getStorage: () => storage,
    __reset: () => storage.clear(),
  };
};
```

### Configurable Mocks

```typescript
// Mock that can be configured per test
interface MockConfig {
  shouldFail?: boolean;
  delay?: number;
  response?: any;
}

const createConfigurableMock = (defaultConfig: MockConfig = {}) => {
  let config = { ...defaultConfig };
  
  const mockFunction = jest.fn(async (...args) => {
    if (config.delay) {
      await new Promise(resolve => setTimeout(resolve, config.delay));
    }
    
    if (config.shouldFail) {
      throw new Error('Mock configured to fail');
    }
    
    return config.response;
  });
  
  // Configuration methods
  mockFunction.configure = (newConfig: Partial<MockConfig>) => {
    config = { ...config, ...newConfig };
  };
  
  mockFunction.reset = () => {
    config = { ...defaultConfig };
    mockFunction.mockClear();
  };
  
  return mockFunction;
};

// Usage
describe('Network requests', () => {
  const mockFetch = createConfigurableMock({ response: { data: 'success' } });
  
  beforeEach(() => {
    mockFetch.reset();
  });
  
  it('should handle successful requests', async () => {
    const result = await mockFetch('/api/data');
    expect(result).toEqual({ data: 'success' });
  });
  
  it('should handle failed requests', async () => {
    mockFetch.configure({ shouldFail: true });
    
    await expect(mockFetch('/api/data')).rejects.toThrow('Mock configured to fail');
  });
  
  it('should handle delayed requests', async () => {
    mockFetch.configure({ delay: 100 });
    
    const start = Date.now();
    await mockFetch('/api/data');
    const duration = Date.now() - start;
    
    expect(duration).toBeGreaterThanOrEqual(100);
  });
});
```

## Mock Utilities and Helpers

### Survey Factory Functions

```typescript
// Factory functions for creating test surveys
export const createBasicSurvey = (overrides: any = {}) => ({
  title: 'Test Survey',
  pages: [{
    elements: [{
      type: 'text',
      name: 'name',
      title: 'What is your name?',
      isRequired: true,
    }]
  }],
  ...overrides,
});

export const createMultiPageSurvey = (pageCount: number = 3) => ({
  title: 'Multi-page Survey',
  pages: Array.from({ length: pageCount }, (_, index) => ({
    elements: [{
      type: 'text',
      name: `question_${index + 1}`,
      title: `Question ${index + 1}`,
    }]
  })),
});

export const createMixedQuestionSurvey = () => ({
  title: 'Mixed Questions Survey',
  pages: [{
    elements: [
      {
        type: 'text',
        name: 'name',
        title: 'Name',
        isRequired: true,
      },
      {
        type: 'radiogroup',
        name: 'color',
        title: 'Favorite Color',
        choices: ['Red', 'Blue', 'Green'],
      },
      {
        type: 'checkbox',
        name: 'hobbies',
        title: 'Hobbies',
        choices: ['Reading', 'Sports', 'Music'],
      },
      {
        type: 'rating',
        name: 'satisfaction',
        title: 'Satisfaction Rating',
        rateMin: 1,
        rateMax: 5,
      },
    ]
  }],
});
```

### Model Factory with Scenarios

```typescript
// Create models with pre-configured scenarios
export const createModelWithScenario = (
  surveyJson: any, 
  scenario: string
): MockSurveyModel => {
  const model = new MockSurveyModel(surveyJson);
  
  switch (scenario) {
    case 'loading':
      model.state = 'loading';
      break;
      
    case 'completed':
      model.state = 'completed';
      // Fill with sample data
      model.setValue('name', 'John Doe');
      model.setValue('color', 'Blue');
      break;
      
    case 'validationError':
      // Leave required fields empty to trigger validation
      model.setValue('name', '');
      break;
      
    case 'multiPage':
      model.currentPageNo = 1; // Start on second page
      break;
      
    case 'lastPage':
      model.currentPageNo = model.pages.length - 1;
      break;
      
    default:
      // Default scenario - running state
      break;
  }
  
  return model;
};

// Usage
const loadingModel = createModelWithScenario(surveyJson, 'loading');
const completedModel = createModelWithScenario(surveyJson, 'completed');
```

### Mock Assertion Helpers

```typescript
// Helper functions for common mock assertions
export const expectEventFired = (
  mockEvent: MockEvent,
  expectedOptions?: any
) => {
  expect(mockEvent.length).toBeGreaterThan(0);
  
  if (expectedOptions) {
    // Check if any handler was called with expected options
    const calls = mockEvent.handlers.mock?.calls || [];
    const matchingCall = calls.find(call => 
      JSON.stringify(call[1]) === JSON.stringify(expectedOptions)
    );
    expect(matchingCall).toBeDefined();
  }
};

export const waitForEvent = async (
  mockEvent: MockEvent,
  timeout: number = 1000
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Event not fired within ${timeout}ms`));
    }, timeout);
    
    const handler = (sender: any, options: any) => {
      clearTimeout(timer);
      mockEvent.remove(handler);
      resolve(options);
    };
    
    mockEvent.add(handler);
  });
};

// Usage
it('should fire completion event', async () => {
  const { getByText } = render(<Survey model={mockModel} />);
  
  fireEvent.press(getByText('Complete'));
  
  const eventOptions = await waitForEvent(mockModel.onComplete);
  expect(eventOptions.isCompleted).toBe(true);
});
```

## Testing Scenarios with Mocks

### Scenario 1: Testing Survey Completion Flow

```typescript
describe('Survey Completion Flow', () => {
  it('should complete survey with all required data', async () => {
    const surveyJson = createBasicSurvey();
    const model = new MockSurveyModel(surveyJson);
    const onComplete = jest.fn();
    
    model.onComplete.add(onComplete);
    
    const { getByTestId, getByText } = render(<Survey model={model} />);
    
    // Fill required field
    const nameInput = getByTestId('question-name');
    fireEvent.changeText(nameInput, 'John Doe');
    
    // Complete survey
    fireEvent.press(getByText('Complete'));
    
    // Verify completion
    expect(onComplete).toHaveBeenCalledWith(model, {
      isCompleted: true,
      data: { name: 'John Doe' }
    });
    
    expect(model.state).toBe('completed');
  });
});
```

### Scenario 2: Testing Validation Errors

```typescript
describe('Validation Handling', () => {
  it('should show validation errors for required fields', () => {
    const model = createModelWithScenario(
      createBasicSurvey(), 
      'validationError'
    );
    
    const { getByText } = render(<Survey model={model} />);
    
    // Try to complete without filling required field
    fireEvent.press(getByText('Complete'));
    
    // Should show validation error
    expect(getByText('Name is required')).toBeTruthy();
    expect(model.state).toBe('running'); // Still running, not completed
  });
});
```

### Scenario 3: Testing Cross-Platform Behavior

```typescript
describe('Cross-Platform Styling', () => {
  const testPlatformStyles = (platform: 'ios' | 'android') => {
    mockPlatform(platform);
    
    const { getByTestId } = render(<Survey model={mockModel} />);
    const container = getByTestId('survey-container');
    
    if (platform === 'ios') {
      expect(container.props.style).toMatchObject({
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
      });
    } else {
      expect(container.props.style).toMatchObject({
        elevation: 4,
      });
    }
  };
  
  it('should apply iOS styles', () => testPlatformStyles('ios'));
  it('should apply Android styles', () => testPlatformStyles('android'));
});
```

## Mock Validation and Maintenance

### Validating Mock Behavior

```typescript
describe('Mock Validation', () => {
  it('should ensure MockSurveyModel behaves like real Model', () => {
    const mockModel = new MockSurveyModel(surveyJson);
    
    // Test interface compatibility
    expect(typeof mockModel.getValue).toBe('function');
    expect(typeof mockModel.setValue).toBe('function');
    expect(typeof mockModel.nextPage).toBe('function');
    expect(typeof mockModel.prevPage).toBe('function');
    
    // Test event system
    expect(mockModel.onValueChanged).toBeDefined();
    expect(mockModel.onComplete).toBeDefined();
    expect(typeof mockModel.onValueChanged.add).toBe('function');
    
    // Test state management
    mockModel.setValue('test', 'value');
    expect(mockModel.getValue('test')).toBe('value');
  });
});
```

### Mock Maintenance Strategy

```typescript
// Version compatibility testing
describe('Mock Compatibility', () => {
  it('should match survey-core version X.Y.Z API', () => {
    // Test that mock implements required survey-core methods
    const requiredMethods = [
      'getValue', 'setValue', 'nextPage', 'prevPage',
      'completeLastPage', 'hasErrors', 'dispose'
    ];
    
    const mockModel = new MockSurveyModel();
    
    requiredMethods.forEach(method => {
      expect(typeof mockModel[method]).toBe('function');
    });
  });
});

// Mock performance testing
describe('Mock Performance', () => {
  it('should perform efficiently with large datasets', () => {
    const largeSurvey = createMultiPageSurvey(50); // 50 pages
    const model = new MockSurveyModel(largeSurvey);
    
    const start = performance.now();
    
    // Perform many operations
    for (let i = 0; i < 100; i++) {
      model.setValue(`q${i}`, `value${i}`);
    }
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // Should complete in <100ms
  });
});
```

## Common Mock Pitfalls

### Pitfall 1: Over-Mocking

```typescript
// ❌ Bad: Mocking too much
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useEffect: jest.fn(),
}));

// ✅ Good: Mock only what you need
jest.mock('survey-core', () => ({
  Model: MockSurveyModel,
}));
```

### Pitfall 2: Unrealistic Mocks

```typescript
// ❌ Bad: Mock that doesn't behave like real implementation
const badMock = {
  getValue: jest.fn(() => 'always same value'),
  setValue: jest.fn(), // Does nothing
};

// ✅ Good: Mock that mimics real behavior
const goodMock = new MockSurveyModel();
goodMock.setValue('name', 'John');
expect(goodMock.getValue('name')).toBe('John'); // Behaves correctly
```

### Pitfall 3: Shared Mock State

```typescript
// ❌ Bad: Shared mock state between tests
const sharedMock = new MockSurveyModel();

describe('Test Suite', () => {
  it('test 1', () => {
    sharedMock.setValue('name', 'John');
    // Test logic
  });
  
  it('test 2', () => {
    // This test might fail because 'name' is already set
    expect(sharedMock.getValue('name')).toBeUndefined();
  });
});

// ✅ Good: Fresh mock for each test
describe('Test Suite', () => {
  let mockModel: MockSurveyModel;
  
  beforeEach(() => {
    mockModel = new MockSurveyModel();
  });
  
  afterEach(() => {
    mockModel.dispose();
  });
});
```

### Pitfall 4: Not Cleaning Up Mocks

```typescript
// ❌ Bad: Not cleaning up
it('should test something', () => {
  const mockModel = new MockSurveyModel();
  mockModel.onValueChanged.add(() => {
    // Event handler that might leak
  });
  
  // Test logic
  // No cleanup - memory leak!
});

// ✅ Good: Always clean up
it('should test something', () => {
  const mockModel = new MockSurveyModel();
  
  try {
    // Test logic
  } finally {
    mockModel.dispose(); // Clean up
  }
});
```

## Best Practices Summary

1. **Keep Mocks Realistic**: Mock behavior should match real implementations
2. **Mock at the Right Level**: Component level for integration, method level for unit tests
3. **Use Factory Functions**: Create consistent test data with factories
4. **Clean Up Resources**: Always dispose of mocks and remove event handlers
5. **Validate Mock Behavior**: Test that mocks behave like real dependencies
6. **Maintain Mock Compatibility**: Update mocks when dependencies change
7. **Don't Over-Mock**: Mock only external dependencies, not your own code
8. **Make Mocks Configurable**: Allow customization for different test scenarios
9. **Test Mock Failures**: Ensure your components handle mock failures gracefully
10. **Document Mock Behavior**: Clear comments on what each mock does

Remember: Good mocks make tests fast, reliable, and maintainable!