# Test-Driven Development (TDD) Workflow Guide

This guide establishes the Test-Driven Development workflow for the react-native-survey-js-ui library. All development MUST follow these TDD principles to ensure code quality, maintainability, and comprehensive test coverage.

## Table of Contents

- [TDD Principles](#tdd-principles)
- [The TDD Cycle](#the-tdd-cycle)
- [Workflow Steps](#workflow-steps)
- [React Native Library TDD Patterns](#react-native-library-tdd-patterns)
- [Example: Building a New Component](#example-building-a-new-component)
- [Common TDD Scenarios](#common-tdd-scenarios)
- [Integration with CI/CD](#integration-with-cicd)
- [TDD Checklist](#tdd-checklist)

## TDD Principles

### Core Philosophy

1. **Test First, Code Second**: Always write tests before implementation
2. **Red-Green-Refactor**: Follow the three-phase cycle religiously
3. **Minimal Implementation**: Write just enough code to pass tests
4. **Comprehensive Coverage**: Maintain >90% code coverage
5. **Fast Feedback**: Tests should run quickly and frequently

### Benefits for React Native Library Development

- **API Design**: Tests drive better component APIs
- **Documentation**: Tests serve as living documentation
- **Confidence**: Refactor safely with comprehensive test suite
- **Cross-Platform**: Ensure consistent behavior on iOS/Android
- **Library Quality**: Ship reliable code to npm users

## The TDD Cycle

```
┌─────────────┐
│   1. RED    │ Write a failing test
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  2. GREEN   │ Make the test pass
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 3. REFACTOR │ Improve code quality
└──────┬──────┘
       │
       └──────► Repeat
```

### Phase 1: Red (Write Failing Test)

- Write a test that describes desired behavior
- Run test to ensure it fails
- Failure confirms test is testing something new

### Phase 2: Green (Make Test Pass)

- Write minimal code to make test pass
- Don't worry about perfect code yet
- Focus only on passing the test

### Phase 3: Refactor (Improve Code)

- Clean up implementation
- Remove duplication
- Improve naming and structure
- Tests must stay green

## Workflow Steps

### 1. Understand Requirements

Before writing any test:

```typescript
// Read the task description
// Identify acceptance criteria
// Clarify any ambiguities
// Plan test scenarios
```

### 2. Write Test First

```typescript
// src/components/NewComponent/__tests__/NewComponent.test.tsx

import { render } from '@testing-library/react-native';
import { NewComponent } from '../NewComponent';

describe('NewComponent', () => {
  it('should render with required props', () => {
    // This test will fail initially - that's expected!
    const { getByText } = render(
      <NewComponent title="Test Title" />
    );
    
    expect(getByText('Test Title')).toBeTruthy();
  });
});
```

### 3. Run Test (Expect Failure)

```bash
# Run the test
yarn test NewComponent

# Expected output:
# FAIL src/components/NewComponent/__tests__/NewComponent.test.tsx
# Cannot find module '../NewComponent'
```

### 4. Write Minimal Implementation

```typescript
// src/components/NewComponent/NewComponent.tsx

import React from 'react';
import { Text, View } from 'react-native';

interface NewComponentProps {
  title: string;
}

export const NewComponent: React.FC<NewComponentProps> = ({ title }) => {
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
};
```

### 5. Run Test Again (Should Pass)

```bash
# Run the test
yarn test NewComponent

# Expected output:
# PASS src/components/NewComponent/__tests__/NewComponent.test.tsx
```

### 6. Add More Tests

```typescript
it('should apply custom styles', () => {
  const { getByTestId } = render(
    <NewComponent 
      title="Test" 
      style={{ backgroundColor: 'red' }}
      testID="component"
    />
  );
  
  const component = getByTestId('component');
  expect(component.props.style).toMatchObject({
    backgroundColor: 'red'
  });
});
```

### 7. Refactor with Confidence

```typescript
// Refactored implementation with better structure
export const NewComponent: React.FC<NewComponentProps> = ({ 
  title, 
  style,
  testID 
}) => {
  const containerStyle = [
    styles.container,
    style
  ];
  
  return (
    <View style={containerStyle} testID={testID}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

## React Native Library TDD Patterns

### Component Testing Pattern

```typescript
// 1. Test component renders
it('should render without crashing', () => {
  const { toJSON } = render(<Component />);
  expect(toJSON()).toBeTruthy();
});

// 2. Test props handling
it('should handle all prop types', () => {
  const props = {
    required: 'value',
    optional: 'value',
    callback: jest.fn(),
  };
  
  const { rerender } = render(<Component {...props} />);
  // Test prop changes
  rerender(<Component {...props} optional={undefined} />);
});

// 3. Test user interactions
it('should handle user input', () => {
  const onChange = jest.fn();
  const { getByTestId } = render(
    <Component onChange={onChange} />
  );
  
  fireEvent.changeText(getByTestId('input'), 'new value');
  expect(onChange).toHaveBeenCalledWith('new value');
});

// 4. Test accessibility
it('should be accessible', () => {
  const { getByLabelText } = render(
    <Component accessibilityLabel="Component Label" />
  );
  
  expect(getByLabelText('Component Label')).toBeTruthy();
});
```

### Hook Testing Pattern

```typescript
// 1. Test initial state
it('should initialize with default values', () => {
  const { result } = renderHook(() => useCustomHook());
  
  expect(result.current.value).toBe(null);
  expect(result.current.loading).toBe(false);
});

// 2. Test state updates
it('should update state correctly', async () => {
  const { result } = renderHook(() => useCustomHook());
  
  act(() => {
    result.current.setValue('new value');
  });
  
  expect(result.current.value).toBe('new value');
});

// 3. Test effects
it('should handle side effects', async () => {
  const mockFetch = jest.fn().mockResolvedValue({ data: 'test' });
  const { result, waitForNextUpdate } = renderHook(() => 
    useCustomHook({ fetch: mockFetch })
  );
  
  await waitForNextUpdate();
  
  expect(mockFetch).toHaveBeenCalled();
  expect(result.current.data).toBe('test');
});
```

### Integration Testing Pattern

```typescript
// Test component with survey-core integration
it('should integrate with survey model', () => {
  const model = new MockSurveyModel({
    elements: [{ type: 'text', name: 'q1' }]
  });
  
  const { getByTestId } = render(<Survey model={model} />);
  const input = getByTestId('question-q1');
  
  fireEvent.changeText(input, 'answer');
  
  expect(model.getValue('q1')).toBe('answer');
});
```

## Example: Building a New Component

Let's walk through building a new RadioGroupQuestion component using TDD:

### Step 1: Write First Test

```typescript
// src/components/Questions/RadioGroupQuestion/__tests__/RadioGroupQuestion.test.tsx

describe('RadioGroupQuestion', () => {
  it('should render radio options', () => {
    const question = {
      name: 'color',
      title: 'Favorite Color',
      choices: ['Red', 'Blue', 'Green']
    };
    
    const { getByText } = render(
      <RadioGroupQuestion question={question} />
    );
    
    expect(getByText('Favorite Color')).toBeTruthy();
    expect(getByText('Red')).toBeTruthy();
    expect(getByText('Blue')).toBeTruthy();
    expect(getByText('Green')).toBeTruthy();
  });
});
```

### Step 2: Create Minimal Component

```typescript
// src/components/Questions/RadioGroupQuestion/RadioGroupQuestion.tsx

export const RadioGroupQuestion: React.FC<Props> = ({ question }) => {
  return (
    <View>
      <Text>{question.title}</Text>
      {question.choices.map(choice => (
        <Text key={choice}>{choice}</Text>
      ))}
    </View>
  );
};
```

### Step 3: Add Selection Test

```typescript
it('should handle selection', () => {
  const question = { /* ... */ };
  const onChange = jest.fn();
  
  const { getByText } = render(
    <RadioGroupQuestion 
      question={question} 
      onChange={onChange}
    />
  );
  
  fireEvent.press(getByText('Blue'));
  expect(onChange).toHaveBeenCalledWith('color', 'Blue');
});
```

### Step 4: Implement Selection

```typescript
export const RadioGroupQuestion: React.FC<Props> = ({ 
  question, 
  onChange 
}) => {
  const [selected, setSelected] = useState(question.value);
  
  const handleSelect = (choice: string) => {
    setSelected(choice);
    onChange?.(question.name, choice);
  };
  
  return (
    <View>
      <Text>{question.title}</Text>
      {question.choices.map(choice => (
        <TouchableOpacity 
          key={choice}
          onPress={() => handleSelect(choice)}
        >
          <Text>{choice}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
```

### Step 5: Continue Adding Tests

- Test initial value
- Test style customization
- Test accessibility
- Test error states
- Test edge cases

## Common TDD Scenarios

### Scenario 1: Async Operations

```typescript
// Test async loading
it('should show loading state', async () => {
  const { getByTestId, queryByTestId } = render(<AsyncComponent />);
  
  // Initially loading
  expect(getByTestId('loading')).toBeTruthy();
  
  // Wait for load to complete
  await waitFor(() => {
    expect(queryByTestId('loading')).toBeNull();
  });
  
  // Content should be visible
  expect(getByTestId('content')).toBeTruthy();
});
```

### Scenario 2: Error Handling

```typescript
// Test error states
it('should handle errors gracefully', async () => {
  const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
  
  const { getByText } = render(
    <Component fetch={mockFetch} />
  );
  
  await waitFor(() => {
    expect(getByText('Error: Network error')).toBeTruthy();
  });
});
```

### Scenario 3: Platform-Specific Code

```typescript
// Test iOS-specific behavior
it('should render iOS-specific styles', () => {
  Platform.OS = 'ios';
  
  const { getByTestId } = render(<Component />);
  const element = getByTestId('platform-specific');
  
  expect(element.props.style).toMatchObject({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  });
});

// Test Android-specific behavior
it('should render Android-specific styles', () => {
  Platform.OS = 'android';
  
  const { getByTestId } = render(<Component />);
  const element = getByTestId('platform-specific');
  
  expect(element.props.style).toMatchObject({
    elevation: 4,
  });
});
```

## Integration with CI/CD

### Pre-commit Hooks

```bash
# .lefthook.yml
pre-commit:
  commands:
    tests:
      run: yarn test --findRelatedTests {staged_files}
```

### CI Pipeline Tests

```yaml
# .github/workflows/test.yml
test:
  steps:
    - name: Run tests
      run: |
        yarn test --coverage
        yarn test:integration
```

### Coverage Gates

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

## TDD Checklist

Before starting any development task:

- [ ] Read and understand requirements
- [ ] Plan test scenarios
- [ ] Set up test file structure

For each feature:

- [ ] Write failing test first
- [ ] Verify test fails for right reason
- [ ] Write minimal code to pass
- [ ] Verify test passes
- [ ] Refactor if needed
- [ ] Add edge case tests
- [ ] Check coverage

Before completing task:

- [ ] All tests pass
- [ ] Coverage >90%
- [ ] No implementation without tests
- [ ] Tests are meaningful
- [ ] Code is refactored and clean

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the component does
   - Don't test internal state directly
   - Test from user's perspective

2. **Keep Tests Simple**
   - One assertion per test when possible
   - Clear test names that describe behavior
   - Avoid complex setup

3. **Use Test Utilities**
   - Leverage factory functions
   - Create custom render functions
   - Share common test setup

4. **Mock External Dependencies**
   - Mock survey-core properly
   - Mock React Native modules
   - Keep mocks realistic

5. **Test Accessibility**
   - Include accessibility in all components
   - Test with screen readers in mind
   - Verify keyboard navigation

## Conclusion

TDD is not just a testing strategy—it's a design methodology that leads to better, more maintainable code. By following this workflow, we ensure that every line of code in the react-native-survey-js-ui library is purposeful, tested, and reliable.

Remember: If it's not tested, it's broken!