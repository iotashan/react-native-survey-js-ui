# Test Organization and Naming Conventions

This guide establishes consistent patterns for organizing and naming tests in the react-native-survey-js-ui library to ensure maintainability, readability, and discoverability.

## Table of Contents

- [Directory Structure](#directory-structure)
- [File Naming Conventions](#file-naming-conventions)
- [Test Suite Organization](#test-suite-organization)
- [Test Naming Patterns](#test-naming-patterns)
- [Describe Block Structure](#describe-block-structure)
- [Test Grouping Strategies](#test-grouping-strategies)
- [Mock Organization](#mock-organization)
- [Utility Functions](#utility-functions)

## Directory Structure

### Library Tests (`src/`)

```
src/
├── components/
│   ├── Survey/
│   │   ├── Survey.tsx
│   │   ├── Survey.test.tsx                 # Component tests
│   │   └── __tests__/                      # Additional test files
│   │       ├── Survey.integration.test.tsx
│   │       └── Survey.performance.test.tsx
│   ├── Questions/
│   │   ├── BaseQuestion/
│   │   │   ├── BaseQuestion.tsx
│   │   │   └── BaseQuestion.test.tsx
│   │   ├── TextQuestion/
│   │   │   ├── TextQuestion.tsx
│   │   │   └── TextQuestion.test.tsx
│   │   └── __tests__/                      # Shared question tests
│   │       └── QuestionFactory.test.tsx
├── hooks/
│   ├── useSurveyState.tsx
│   ├── useSurveyState.test.tsx             # Hook tests
│   └── __tests__/                          # Additional hook tests
│       └── useSurveyModel.integration.test.tsx
├── utils/
│   ├── validation.ts
│   ├── validation.test.ts                  # Utility tests
│   └── __tests__/
│       └── surveyCore.integration.test.ts
├── __tests__/                              # Library-wide tests
│   ├── index.test.ts                       # Export tests
│   ├── build.test.ts                       # Build validation
│   └── types.test.ts                       # TypeScript tests
└── __mocks__/                              # Global mocks
    ├── survey-core/
    │   ├── index.ts
    │   ├── MockSurveyModel.ts
    │   └── __tests__/
    │       └── MockSurveyModel.test.ts
    └── react-native/
        └── index.ts
```

### Example App Tests (`example/`)

```
example/
├── __tests__/                              # App-wide tests
│   ├── App.test.tsx                        # Main app tests
│   ├── navigation.test.tsx                 # Navigation tests
│   └── library-integration.test.tsx        # Library usage tests
├── src/
│   ├── screens/
│   │   ├── SurveyDemoScreen.tsx
│   │   ├── SurveyDemoScreen.test.tsx       # Screen tests
│   │   ├── ExploreScreen.tsx
│   │   └── ExploreScreen.test.tsx
│   └── navigation/
│       ├── TabNavigator.tsx
│       └── TabNavigator.test.tsx
└── __mocks__/                              # Example app mocks
    └── react-native-survey-js-ui.tsx
```

## File Naming Conventions

### Test File Names

```typescript
// ✅ Good: Clear and consistent naming
Component.test.tsx              // Unit tests for Component
Component.integration.test.tsx  // Integration tests
Component.performance.test.tsx  // Performance tests
Component.accessibility.test.tsx // A11y tests
Component.e2e.test.tsx          // End-to-end tests

// Hook tests
useSurveyState.test.tsx         // Hook unit tests
useSurveyState.integration.test.tsx // Hook integration tests

// Utility tests
validation.test.ts              // Utility function tests
surveyCore.test.ts             // Core utility tests

// Mock files
MockSurveyModel.ts             // Mock implementation
MockSurveyModel.test.ts        // Tests for the mock itself
```

### Test Categories

```typescript
// Unit tests - testing isolated functionality
*.test.{ts,tsx}

// Integration tests - testing component interactions
*.integration.test.{ts,tsx}

// Performance tests - testing performance characteristics
*.performance.test.{ts,tsx}

// Accessibility tests - testing a11y compliance
*.accessibility.test.{ts,tsx}

// End-to-end tests - testing complete user flows
*.e2e.test.{ts,tsx}
```

## Test Suite Organization

### Component Test Structure

```typescript
// src/components/TextQuestion/TextQuestion.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TextQuestion } from './TextQuestion';
import { createTextQuestion } from '../../__mocks__/questionFactories';

describe('TextQuestion', () => {
  // Setup and teardown
  let mockOnValueChange: jest.Mock;
  let defaultProps: any;

  beforeEach(() => {
    mockOnValueChange = jest.fn();
    defaultProps = {
      question: createTextQuestion(),
      onValueChange: mockOnValueChange,
    };
  });

  // Basic rendering tests
  describe('Rendering', () => {
    it('should render question title', () => {
      const { getByText } = render(<TextQuestion {...defaultProps} />);
      expect(getByText('What is your name?')).toBeTruthy();
    });

    it('should render text input', () => {
      const { getByTestId } = render(<TextQuestion {...defaultProps} />);
      expect(getByTestId('text-input')).toBeTruthy();
    });
  });

  // User interaction tests
  describe('User Interactions', () => {
    it('should handle text input changes', () => {
      const { getByTestId } = render(<TextQuestion {...defaultProps} />);
      const input = getByTestId('text-input');

      fireEvent.changeText(input, 'John Doe');

      expect(mockOnValueChange).toHaveBeenCalledWith('John Doe');
    });

    it('should handle focus and blur events', () => {
      const { getByTestId } = render(<TextQuestion {...defaultProps} />);
      const input = getByTestId('text-input');

      fireEvent(input, 'focus');
      fireEvent(input, 'blur');

      // Test focus/blur behavior
    });
  });

  // Props handling tests
  describe('Props Handling', () => {
    it('should handle required prop', () => {
      const requiredQuestion = createTextQuestion({ isRequired: true });
      const { getByText } = render(
        <TextQuestion {...defaultProps} question={requiredQuestion} />
      );

      expect(getByText('*')).toBeTruthy(); // Required indicator
    });

    it('should handle custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByTestId } = render(
        <TextQuestion {...defaultProps} style={customStyle} />
      );

      const container = getByTestId('question-container');
      expect(container.props.style).toMatchObject(customStyle);
    });
  });

  // Error and edge cases
  describe('Error Handling', () => {
    it('should handle missing question gracefully', () => {
      const { getByText } = render(
        <TextQuestion {...defaultProps} question={null} />
      );

      expect(getByText('Question configuration error')).toBeTruthy();
    });

    it('should handle validation errors', () => {
      const questionWithError = createTextQuestion({
        hasError: true,
        errorMessage: 'This field is required',
      });

      const { getByText } = render(
        <TextQuestion {...defaultProps} question={questionWithError} />
      );

      expect(getByText('This field is required')).toBeTruthy();
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = render(<TextQuestion {...defaultProps} />);
      expect(getByLabelText('What is your name?')).toBeTruthy();
    });

    it('should support keyboard navigation', () => {
      const { getByTestId } = render(<TextQuestion {...defaultProps} />);
      const input = getByTestId('text-input');

      expect(input.props.accessibilityRole).toBe('none');
      expect(input.props.accessibilityLabel).toBe('What is your name?');
    });
  });
});
```

### Hook Test Structure

```typescript
// src/hooks/useSurveyState.test.tsx

import { renderHook, act } from '@testing-library/react-hooks';
import { useSurveyState } from './useSurveyState';
import { MockSurveyModel } from '../__mocks__/survey-core/MockSurveyModel';
import { createBasicSurvey } from '../__mocks__/surveyFactories';

describe('useSurveyState', () => {
  let mockModel: MockSurveyModel;

  beforeEach(() => {
    mockModel = new MockSurveyModel(createBasicSurvey());
  });

  afterEach(() => {
    mockModel.dispose();
  });

  describe('Initial State', () => {
    it('should return initial state values', () => {
      const { result } = renderHook(() => useSurveyState(mockModel));

      expect(result.current).toMatchObject({
        currentPageNo: 0,
        pageCount: 1,
        isFirstPage: true,
        isLastPage: true,
        progress: 0,
        isCompleted: false,
      });
    });
  });

  describe('State Updates', () => {
    it('should update when model changes', () => {
      const { result } = renderHook(() => useSurveyState(mockModel));

      act(() => {
        mockModel.setValue('name', 'John Doe');
      });

      expect(result.current.hasData).toBe(true);
    });
  });

  describe('Navigation', () => {
    it('should handle page navigation', () => {
      const multiPageModel = new MockSurveyModel(createMultiPageSurvey(3));
      const { result } = renderHook(() => useSurveyState(multiPageModel));

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.currentPageNo).toBe(1);
      expect(result.current.isFirstPage).toBe(false);
      expect(result.current.isLastPage).toBe(false);
    });
  });
});
```

## Test Naming Patterns

### Descriptive Test Names

```typescript
// ✅ Good: Describes behavior from user perspective
describe('Survey Component', () => {
  it('should display question title to user', () => {});
  it('should update model when user enters text', () => {});
  it('should show validation error when required field is empty', () => {});
  it('should navigate to next page when user clicks Next', () => {});
  it('should complete survey when user submits on last page', () => {});
});

// ❌ Bad: Describes implementation details
describe('Survey Component', () => {
  it('should call setValue method', () => {});
  it('should render TextInput component', () => {});
  it('should invoke onValueChanged callback', () => {});
});
```

### Scenario-Based Naming

```typescript
describe('TextQuestion Component', () => {
  describe('when question is required', () => {
    it('should display required indicator', () => {});
    it('should show validation error if empty', () => {});
    it('should prevent form submission if invalid', () => {});
  });

  describe('when question has placeholder', () => {
    it('should display placeholder text', () => {});
    it('should hide placeholder when user types', () => {});
  });

  describe('when question is disabled', () => {
    it('should not accept user input', () => {});
    it('should display with disabled styling', () => {});
    it('should not trigger value change events', () => {});
  });
});
```

### Conditional Test Naming

```typescript
describe('Platform-specific behavior', () => {
  describe('on iOS', () => {
    beforeEach(() => mockPlatform('ios'));

    it('should use iOS shadow styles', () => {});
    it('should handle iOS keyboard events', () => {});
  });

  describe('on Android', () => {
    beforeEach(() => mockPlatform('android'));

    it('should use Android elevation styles', () => {});
    it('should handle Android back button', () => {});
  });
});
```

## Describe Block Structure

### Hierarchical Organization

```typescript
describe('Survey Component', () => {
  // Component-level setup
  let mockModel: MockSurveyModel;

  beforeEach(() => {
    mockModel = new MockSurveyModel();
  });

  // Feature groupings
  describe('Rendering', () => {
    describe('with single page survey', () => {
      it('should render page content', () => {});
      it('should not show navigation buttons', () => {});
    });

    describe('with multi-page survey', () => {
      it('should render current page content', () => {});
      it('should show navigation buttons', () => {});
    });
  });

  describe('Navigation', () => {
    describe('next page functionality', () => {
      it('should advance to next page', () => {});
      it('should update progress indicator', () => {});
      it('should disable button on last page', () => {});
    });

    describe('previous page functionality', () => {
      it('should go to previous page', () => {});
      it('should preserve user input', () => {});
      it('should disable button on first page', () => {});
    });
  });

  describe('Validation', () => {
    describe('required field validation', () => {
      it('should show error for empty required fields', () => {});
      it('should clear error when field is filled', () => {});
    });

    describe('custom validation', () => {
      it('should validate email format', () => {});
      it('should validate number ranges', () => {});
    });
  });
});
```

### Setup and Teardown Patterns

```typescript
describe('Component with complex setup', () => {
  // Shared resources
  let mockModel: MockSurveyModel;
  let mockTheme: Theme;
  let renderUtils: RenderResult;

  // Component-level setup
  beforeAll(() => {
    // Expensive one-time setup
    mockTheme = createTestTheme();
  });

  beforeEach(() => {
    // Fresh setup for each test
    mockModel = new MockSurveyModel();
    renderUtils = render(
      <ThemeProvider theme={mockTheme}>
        <Survey model={mockModel} />
      </ThemeProvider>
    );
  });

  afterEach(() => {
    // Cleanup after each test
    mockModel.dispose();
    renderUtils.unmount();
  });

  afterAll(() => {
    // One-time cleanup
    mockTheme.dispose();
  });

  // Nested describe blocks can have their own setup
  describe('when survey is completed', () => {
    beforeEach(() => {
      // Additional setup for this group
      mockModel.completeLastPage();
    });

    it('should show completion message', () => {});
  });
});
```

## Test Grouping Strategies

### By Functionality

```typescript
describe('Survey Form Validation', () => {
  describe('Required Fields', () => {
    it('should validate text input requirements', () => {});
    it('should validate radio button requirements', () => {});
    it('should validate checkbox requirements', () => {});
  });

  describe('Format Validation', () => {
    it('should validate email format', () => {});
    it('should validate phone number format', () => {});
    it('should validate date format', () => {});
  });

  describe('Custom Validators', () => {
    it('should apply custom validation functions', () => {});
    it('should handle async validation', () => {});
  });
});
```

### By User Journey

```typescript
describe('Survey Completion Flow', () => {
  describe('Survey Start', () => {
    it('should display welcome message', () => {});
    it('should show progress indicator', () => {});
    it('should load first question', () => {});
  });

  describe('Question Answering', () => {
    it('should accept user input', () => {});
    it('should validate answers', () => {});
    it('should enable navigation when valid', () => {});
  });

  describe('Survey Navigation', () => {
    it('should navigate between pages', () => {});
    it('should preserve answers during navigation', () => {});
    it('should show correct progress', () => {});
  });

  describe('Survey Completion', () => {
    it('should validate all required fields', () => {});
    it('should submit survey data', () => {});
    it('should show completion message', () => {});
  });
});
```

### By Component State

```typescript
describe('TextQuestion States', () => {
  describe('Empty State', () => {
    it('should show placeholder text', () => {});
    it('should have empty value', () => {});
    it('should be focusable', () => {});
  });

  describe('Filled State', () => {
    it('should display entered value', () => {});
    it('should allow editing', () => {});
    it('should trigger change events', () => {});
  });

  describe('Error State', () => {
    it('should display error message', () => {});
    it('should highlight input field', () => {});
    it('should prevent form submission', () => {});
  });

  describe('Disabled State', () => {
    it('should not accept input', () => {});
    it('should show disabled styling', () => {});
    it('should not be focusable', () => {});
  });
});
```

## Mock Organization

### Mock File Structure

```typescript
// src/__mocks__/survey-core/index.ts
export { MockSurveyModel } from './MockSurveyModel';
export { MockEvent } from './MockEvent';
export * from './types';

// src/__mocks__/survey-core/MockSurveyModel.ts
export class MockSurveyModel {
  // Implementation
}

// src/__mocks__/survey-core/__tests__/MockSurveyModel.test.ts
describe('MockSurveyModel', () => {
  it('should behave like real SurveyModel', () => {
    // Test the mock itself
  });
});
```

### Factory Functions

```typescript
// src/__mocks__/factories/surveyFactories.ts
export const createBasicSurvey = (overrides = {}) => ({
  title: 'Test Survey',
  pages: [{
    elements: [{
      type: 'text',
      name: 'name',
      title: 'What is your name?',
    }]
  }],
  ...overrides,
});

export const createTextQuestion = (overrides = {}) => ({
  type: 'text',
  name: 'textQuestion',
  title: 'Text Question',
  isRequired: false,
  ...overrides,
});

// Usage in tests
const survey = createBasicSurvey({ title: 'Custom Survey' });
const question = createTextQuestion({ isRequired: true });
```

### Test Scenarios

```typescript
// src/__mocks__/scenarios/index.ts
export const scenarios = {
  loading: (model: MockSurveyModel) => {
    model.state = 'loading';
  },

  validationError: (model: MockSurveyModel) => {
    model.setValue('required-field', '');
    model.validate();
  },

  completed: (model: MockSurveyModel) => {
    model.setValue('name', 'John Doe');
    model.completeLastPage();
  },
};

// Usage
const model = new MockSurveyModel(surveyJson);
scenarios.validationError(model);
```

## Utility Functions

### Custom Render Functions

```typescript
// src/__tests__/utils/customRender.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '../contexts/ThemeContext';

export const renderWithTheme = (component: React.ReactElement, theme = defaultTheme) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

export const renderSurveyComponent = (component: React.ReactElement, model = null) => {
  const surveyModel = model || new MockSurveyModel();
  
  return {
    ...render(
      <SurveyProvider model={surveyModel}>
        {component}
      </SurveyProvider>
    ),
    model: surveyModel,
  };
};
```

### Test Helper Functions

```typescript
// src/__tests__/utils/testHelpers.ts
export const waitForAsyncOperation = async (callback: () => void, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout')), timeout);
    
    const checkCondition = () => {
      try {
        callback();
        clearTimeout(timer);
        resolve(true);
      } catch (error) {
        setTimeout(checkCondition, 10);
      }
    };
    
    checkCondition();
  });
};

export const triggerModelEvent = (model: MockSurveyModel, event: string, data: any) => {
  switch (event) {
    case 'valueChanged':
      model.onValueChanged.fire(model, data);
      break;
    case 'complete':
      model.onComplete.fire(model, data);
      break;
    // Add other events as needed
  }
};

export const fillSurveyForm = (renderResult: RenderResult, answers: Record<string, any>) => {
  Object.entries(answers).forEach(([questionName, value]) => {
    const input = renderResult.getByTestId(`question-${questionName}`);
    fireEvent.changeText(input, value);
  });
};
```

### Assertion Helpers

```typescript
// src/__tests__/utils/assertions.ts
export const expectSurveyState = (model: MockSurveyModel, expectedState: Partial<SurveyState>) => {
  const actualState = {
    currentPageNo: model.currentPageNo,
    isCompleted: model.state === 'completed',
    hasErrors: model.hasErrors(),
    data: model.data,
  };

  Object.entries(expectedState).forEach(([key, expectedValue]) => {
    expect(actualState[key]).toEqual(expectedValue);
  });
};

export const expectElementVisible = (renderResult: RenderResult, testId: string) => {
  expect(renderResult.getByTestId(testId)).toBeTruthy();
};

export const expectElementHidden = (renderResult: RenderResult, testId: string) => {
  expect(renderResult.queryByTestId(testId)).toBeNull();
};
```

## Best Practices Summary

1. **Consistent Naming**: Use descriptive, behavior-focused test names
2. **Logical Grouping**: Organize tests by functionality, user journey, or component state
3. **Clear Structure**: Use hierarchical describe blocks for organization
4. **Proper Setup**: Use appropriate beforeEach/afterEach for test isolation
5. **Mock Organization**: Keep mocks organized and reusable
6. **Helper Functions**: Create utilities to reduce test duplication
7. **File Placement**: Co-locate tests with source files when possible
8. **Category Separation**: Use different file extensions for different test types

Remember: Well-organized tests are easier to maintain, debug, and extend!