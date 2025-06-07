# Testing Troubleshooting and FAQ Guide

This guide provides solutions to common testing issues encountered while developing the react-native-survey-js-ui library, with specific focus on React Native testing challenges and survey-core integration.

## Table of Contents

- [Common Jest Issues](#common-jest-issues)
- [React Native Testing Library Problems](#react-native-testing-library-problems)
- [Survey-Core Mock Issues](#survey-core-mock-issues)
- [Platform-Specific Testing Problems](#platform-specific-testing-problems)
- [Performance and Timeout Issues](#performance-and-timeout-issues)
- [Coverage and Reporting Issues](#coverage-and-reporting-issues)
- [Development Environment Problems](#development-environment-problems)
- [FAQ](#faq)

## Common Jest Issues

### Issue: Jest can't find modules

**Error:**
```
Cannot find module 'react-native-survey-js-ui' from 'example/src/App.tsx'
```

**Causes:**
- Metro bundler cache issues
- Jest configuration problems
- Module resolution in workspaces

**Solutions:**

1. **Clear Jest cache:**
```bash
yarn test --clearCache
```

2. **Check Jest configuration:**
```javascript
// jest.config.js
module.exports = {
  preset: 'react-native',
  moduleNameMapping: {
    '^react-native-survey-js-ui$': '<rootDir>/src/index.ts',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-survey-js-ui)/)',
  ],
};
```

3. **Verify workspace setup:**
```json
// package.json
{
  "workspaces": [
    ".",
    "example"
  ]
}
```

### Issue: Transform errors with ES6 modules

**Error:**
```
SyntaxError: Unexpected token 'export'
```

**Solution:**
```javascript
// jest.config.js
module.exports = {
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|survey-core|react-native-survey-js-ui)/)',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
};
```

### Issue: Async tests timing out

**Error:**
```
Timeout - Async callback was not invoked within the 5000ms timeout
```

**Solutions:**

1. **Increase timeout for specific tests:**
```typescript
it('should handle async operation', async () => {
  // Test implementation
}, 10000); // 10 second timeout
```

2. **Use waitFor for async updates:**
```typescript
import { waitFor } from '@testing-library/react-native';

it('should update after async operation', async () => {
  const { getByText } = render(<AsyncComponent />);
  
  await waitFor(
    () => expect(getByText('Loaded')).toBeTruthy(),
    { timeout: 5000 }
  );
});
```

3. **Mock async dependencies:**
```typescript
jest.mock('async-library', () => ({
  fetchData: jest.fn().mockResolvedValue({ data: 'test' }),
}));
```

## React Native Testing Library Problems

### Issue: fireEvent not working as expected

**Problem:**
```typescript
// This might not work as expected
fireEvent.press(getByText('Button'));
```

**Solutions:**

1. **Use correct event types:**
```typescript
// For TouchableOpacity
fireEvent.press(getByTestId('button'));

// For TextInput
fireEvent.changeText(getByTestId('input'), 'new value');

// For custom events
fireEvent(element, 'customEvent', { data: 'test' });
```

2. **Check element is pressable:**
```typescript
const button = getByTestId('button');
expect(button.props.onPress).toBeDefined();
fireEvent.press(button);
```

### Issue: Can't find elements by text

**Error:**
```
Unable to find an element with text: 'Submit'
```

**Solutions:**

1. **Check exact text matching:**
```typescript
// This might fail if text has extra whitespace
getByText('Submit');

// Use regex for flexible matching
getByText(/submit/i);

// Or partial text matching
getByText('Submit', { exact: false });
```

2. **Debug component tree:**
```typescript
import { debug } from '@testing-library/react-native';

const { debug: debugComponent } = render(<Component />);
debugComponent(); // Prints component tree
```

3. **Use data-testid for reliable selection:**
```typescript
// In component
<TouchableOpacity testID="submit-button">
  <Text>Submit</Text>
</TouchableOpacity>

// In test
fireEvent.press(getByTestId('submit-button'));
```

### Issue: React Native components not rendering correctly

**Problem:** Components render as generic elements instead of specific RN components.

**Solution:**
```javascript
// jest.setup.js
import 'react-native-testing-library/extend-expect';

// Mock React Native components properly
jest.mock('react-native/Libraries/Components/TextInput/TextInput', () => {
  const React = require('react');
  return React.forwardRef((props, ref) => {
    return React.createElement('TextInput', {
      ...props,
      ref,
      // Ensure testID is preserved
      testID: props.testID,
    });
  });
});
```

## Survey-Core Mock Issues

### Issue: MockSurveyModel events not firing

**Problem:**
```typescript
// Event handler not called
const handler = jest.fn();
mockModel.onValueChanged.add(handler);
mockModel.setValue('name', 'John');
expect(handler).toHaveBeenCalled(); // Fails
```

**Solutions:**

1. **Verify mock event implementation:**
```typescript
// Ensure MockEvent.fire() is called in setValue
export class MockSurveyModel {
  setValue(name: string, value: any): void {
    const oldValue = this.data[name];
    this.data[name] = value;
    
    // This line is crucial
    this.onValueChanged.fire(this, {
      name,
      value,
      oldValue,
      question: this.getQuestionByName(name)
    });
  }
}
```

2. **Check event handler setup:**
```typescript
// Make sure handler is added before action
const handler = jest.fn();
mockModel.onValueChanged.add(handler);

// Perform action
mockModel.setValue('name', 'John');

// Verify
expect(handler).toHaveBeenCalledWith(mockModel, {
  name: 'name',
  value: 'John',
  oldValue: undefined,
  question: expect.any(Object)
});
```

### Issue: Survey model state inconsistencies

**Problem:** Mock model state doesn't match real survey-core behavior.

**Solution:**
```typescript
// Comprehensive state management in mock
export class MockSurveyModel {
  private _state: 'loading' | 'running' | 'completed' = 'running';
  
  get state() { return this._state; }
  
  setValue(name: string, value: any): void {
    // Only allow changes in running state
    if (this._state !== 'running') return;
    
    this.data[name] = value;
    this.onValueChanged.fire(this, { name, value });
  }
  
  completeLastPage(): void {
    if (this.hasErrors()) {
      throw new Error('Cannot complete survey with validation errors');
    }
    
    this._state = 'completed';
    this.onComplete.fire(this, { isCompleted: true });
  }
}
```

### Issue: Mock disposal not working

**Problem:** Memory leaks between tests due to improper mock cleanup.

**Solution:**
```typescript
// Proper disposal implementation
export class MockSurveyModel {
  dispose(): void {
    // Clear all event handlers
    this.onValueChanged.clear();
    this.onComplete.clear();
    this.onCurrentPageChanged.clear();
    
    // Clear data
    this.data = {};
    
    // Reset state
    this._state = 'running';
    this.currentPageNo = 0;
  }
}

// In tests
describe('Component', () => {
  let mockModel: MockSurveyModel;
  
  beforeEach(() => {
    mockModel = new MockSurveyModel();
  });
  
  afterEach(() => {
    mockModel.dispose();
  });
});
```

## Platform-Specific Testing Problems

### Issue: Platform.OS mock not working

**Problem:**
```typescript
// This doesn't work as expected
Platform.OS = 'android';
```

**Solution:**
```typescript
// Proper platform mocking
const mockPlatform = (os: 'ios' | 'android') => {
  jest.doMock('react-native/Libraries/Utilities/Platform', () => ({
    OS: os,
    select: (platforms: any) => platforms[os] || platforms.default,
    Version: os === 'ios' ? '14.0' : '30',
  }));
};

describe('Platform-specific behavior', () => {
  afterEach(() => {
    jest.dontMock('react-native/Libraries/Utilities/Platform');
  });
  
  it('should render iOS styles', () => {
    mockPlatform('ios');
    
    // Re-require component after mocking
    const Component = require('./Component').Component;
    const { getByTestId } = render(<Component />);
    
    // Test iOS-specific behavior
  });
});
```

### Issue: Dimensions mock not updating

**Problem:** Screen size changes not reflected in tests.

**Solution:**
```typescript
// Dynamic dimensions mocking
const mockDimensions = (width: number, height: number) => {
  const mockGet = jest.fn(() => ({ width, height }));
  const mockAddEventListener = jest.fn();
  const mockRemoveEventListener = jest.fn();
  
  jest.doMock('react-native/Libraries/Utilities/Dimensions', () => ({
    get: mockGet,
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
  }));
  
  return { mockGet, mockAddEventListener, mockRemoveEventListener };
};

// Usage
it('should adapt to screen size', () => {
  const { mockGet } = mockDimensions(320, 568);
  
  const Component = require('./Component').Component;
  const { getByTestId } = render(<Component />);
  
  expect(mockGet).toHaveBeenCalledWith('window');
  // Test responsive behavior
});
```

## Performance and Timeout Issues

### Issue: Tests running slowly

**Symptoms:**
- Test suite takes a long time to complete
- Individual tests exceed timeout limits

**Solutions:**

1. **Optimize test setup:**
```typescript
// Use beforeAll for expensive setup
describe('Component Suite', () => {
  let expensiveResource: any;
  
  beforeAll(async () => {
    // Do expensive setup once
    expensiveResource = await createExpensiveResource();
  });
  
  afterAll(() => {
    expensiveResource?.cleanup();
  });
});
```

2. **Mock heavy operations:**
```typescript
// Mock file system operations
jest.mock('react-native-fs', () => ({
  readFile: jest.fn().mockResolvedValue('file content'),
  writeFile: jest.fn().mockResolvedValue(true),
}));

// Mock async storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue('value'),
  setItem: jest.fn().mockResolvedValue(true),
}));
```

3. **Use fake timers for delayed operations:**
```typescript
describe('Timer tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('should debounce input', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(<DebouncedInput onChange={onChange} />);
    
    fireEvent.changeText(getByTestId('input'), 'test');
    
    // Fast-forward time
    jest.advanceTimersByTime(500);
    
    expect(onChange).toHaveBeenCalledWith('test');
  });
});
```

### Issue: Memory leaks in test suite

**Symptoms:**
- Tests fail after running many times
- Increasing memory usage during test runs

**Solutions:**

1. **Proper cleanup in tests:**
```typescript
describe('Component with effects', () => {
  let cleanup: (() => void)[] = [];
  
  afterEach(() => {
    cleanup.forEach(fn => fn());
    cleanup = [];
  });
  
  it('should handle effects', () => {
    const subscription = someObservable.subscribe();
    cleanup.push(() => subscription.unsubscribe());
    
    // Test logic
  });
});
```

2. **Mock cleanup:**
```typescript
// Ensure mocks are reset
afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});
```

## Coverage and Reporting Issues

### Issue: Coverage not accurate

**Problem:** Coverage reports show incorrect percentages or missing files.

**Solutions:**

1. **Check coverage configuration:**
```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
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

2. **Exclude test files properly:**
```javascript
// Make sure test files don't count towards coverage
coveragePathIgnorePatterns: [
  'node_modules/',
  '.+\\.test\\.(js|jsx|ts|tsx)$',
  '.+\\.spec\\.(js|jsx|ts|tsx)$',
  '__tests__/',
  '__mocks__/',
],
```

### Issue: False positive coverage

**Problem:** High coverage percentage but important cases not tested.

**Solution:**
```typescript
// Focus on meaningful tests, not just coverage
describe('TextInput validation', () => {
  // Test actual behavior, not just code execution
  it('should show error for invalid email format', () => {
    const { getByTestId, getByText } = render(
      <EmailInput value="invalid-email" onValidate={mockValidate} />
    );
    
    fireEvent(getByTestId('input'), 'blur');
    
    expect(getByText('Please enter a valid email')).toBeTruthy();
    expect(mockValidate).toHaveBeenCalledWith(false);
  });
  
  // Don't just test that functions are called
  it('should accept valid email format', () => {
    const { getByTestId, queryByText } = render(
      <EmailInput value="user@example.com" onValidate={mockValidate} />
    );
    
    fireEvent(getByTestId('input'), 'blur');
    
    expect(queryByText('Please enter a valid email')).toBeNull();
    expect(mockValidate).toHaveBeenCalledWith(true);
  });
});
```

## Development Environment Problems

### Issue: Tests work locally but fail in CI

**Common causes:**
- Different Node.js versions
- Missing environment variables
- Different operating systems
- Timing-dependent tests

**Solutions:**

1. **Match CI environment locally:**
```bash
# Use same Node version
nvm use 18.17.0

# Install exact dependencies
yarn install --frozen-lockfile
```

2. **Make tests deterministic:**
```typescript
// Mock dates for consistent results
beforeEach(() => {
  jest.spyOn(Date, 'now').mockReturnValue(1640995200000); // 2022-01-01
});

afterEach(() => {
  jest.restoreAllMocks();
});
```

3. **Check CI configuration:**
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x]
    
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'yarn'
      
      - run: yarn install --frozen-lockfile
      - run: yarn test --coverage --watchAll=false
```

### Issue: Hot reload breaking tests

**Problem:** Development server interferes with test runs.

**Solution:**
```bash
# Run tests in separate terminal from development server
# Terminal 1: Development
yarn start

# Terminal 2: Tests
yarn test --watch

# Or use different ports
yarn start --port 8082
yarn test
```

## FAQ

### Q: How do I test components that use hooks?

**A:** Use `@testing-library/react-hooks` for isolated hook testing:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useSurveyState } from '../useSurveyState';

it('should manage survey state', () => {
  const { result } = renderHook(() => useSurveyState(mockModel));
  
  expect(result.current.currentPage).toBe(0);
  
  act(() => {
    result.current.nextPage();
  });
  
  expect(result.current.currentPage).toBe(1);
});
```

### Q: How do I test error boundaries?

**A:** Create a component that throws and test the boundary:

```typescript
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>No error</Text>;
};

it('should catch and display errors', () => {
  const { getByText, rerender } = render(
    <ErrorBoundary>
      <ThrowError shouldThrow={false} />
    </ErrorBoundary>
  );
  
  expect(getByText('No error')).toBeTruthy();
  
  rerender(
    <ErrorBoundary>
      <ThrowError shouldThrow={true} />
    </ErrorBoundary>
  );
  
  expect(getByText('Something went wrong')).toBeTruthy();
});
```

### Q: How do I test navigation between survey pages?

**A:** Mock the survey model navigation and test UI updates:

```typescript
it('should navigate between pages', () => {
  const mockModel = new MockSurveyModel(multiPageSurvey);
  const { getByText } = render(<Survey model={mockModel} />);
  
  // Start on first page
  expect(getByText('Page 1 Question')).toBeTruthy();
  
  // Navigate to next page
  fireEvent.press(getByText('Next'));
  
  expect(mockModel.currentPageNo).toBe(1);
  expect(getByText('Page 2 Question')).toBeTruthy();
});
```

### Q: How do I test asynchronous survey operations?

**A:** Use `waitFor` and proper async/await patterns:

```typescript
it('should handle async survey submission', async () => {
  const onSubmit = jest.fn().mockResolvedValue({ success: true });
  const { getByText } = render(
    <Survey model={mockModel} onSubmit={onSubmit} />
  );
  
  fireEvent.press(getByText('Submit'));
  
  // Wait for async operation
  await waitFor(() => {
    expect(getByText('Survey submitted successfully')).toBeTruthy();
  });
  
  expect(onSubmit).toHaveBeenCalledWith(mockModel.data);
});
```

### Q: How do I test custom validation logic?

**A:** Test both valid and invalid scenarios:

```typescript
describe('Custom validation', () => {
  it('should validate email format', () => {
    const mockModel = new MockSurveyModel({
      pages: [{
        elements: [{
          type: 'text',
          name: 'email',
          inputType: 'email',
          validators: [{ type: 'email' }]
        }]
      }]
    });
    
    // Test invalid email
    mockModel.setValue('email', 'invalid-email');
    expect(mockModel.hasErrors()).toBe(true);
    
    // Test valid email
    mockModel.setValue('email', 'user@example.com');
    expect(mockModel.hasErrors()).toBe(false);
  });
});
```

### Q: How do I test theming and styling?

**A:** Test that components apply theme values correctly:

```typescript
it('should apply theme colors', () => {
  const theme = {
    primaryColor: '#007AFF',
    backgroundColor: '#FFFFFF',
  };
  
  const { getByTestId } = render(
    <ThemeProvider theme={theme}>
      <Survey model={mockModel} />
    </ThemeProvider>
  );
  
  const container = getByTestId('survey-container');
  expect(container.props.style.backgroundColor).toBe('#FFFFFF');
  
  const button = getByTestId('submit-button');
  expect(button.props.style.backgroundColor).toBe('#007AFF');
});
```

### Q: How do I debug failing tests?

**A:** Use these debugging strategies:

```typescript
// 1. Add debug output
import { debug } from '@testing-library/react-native';

const { debug: debugComponent } = render(<Component />);
debugComponent(); // Prints component tree

// 2. Add console logs in components
console.log('Component props:', props);
console.log('Component state:', state);

// 3. Use Jest debugger
// Add this line and run with --runInBand
debugger;

// 4. Check mock calls
console.log('Mock calls:', mockFunction.mock.calls);

// 5. Use screen queries
import { screen } from '@testing-library/react-native';
screen.debug(); // Same as debug() but global
```

## Getting Help

If you encounter issues not covered here:

1. **Check Jest documentation**: [jestjs.io](https://jestjs.io/)
2. **React Native Testing Library docs**: [callstack.github.io/react-native-testing-library/](https://callstack.github.io/react-native-testing-library/)
3. **Search existing issues**: Check project GitHub issues
4. **Ask the team**: Use team communication channels
5. **Create new issue**: Document the problem with reproduction steps

Remember: Good tests make debugging easier, not harder!