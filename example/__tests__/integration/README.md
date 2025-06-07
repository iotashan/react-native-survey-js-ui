# Integration Test Guidelines

This directory contains comprehensive integration tests for the react-native-survey-js-ui example app. These tests validate that the library works correctly when integrated into a real React Native application.

## Test Structure

### 1. End-to-End Survey Flow Tests (`survey-flow.test.tsx`)
Tests complete user journeys through the survey application:
- Survey completion from start to finish
- Example switching and survey model validation
- Multi-page survey navigation
- Event handling integration
- JSON model display functionality

### 2. Navigation Flow Tests (`navigation-flow.test.tsx`)
Validates navigation between different parts of the app:
- Tab navigation between Survey Demo and Explore screens
- State persistence across navigation
- Modal interactions during navigation
- Rapid navigation handling
- Deep navigation scenarios

### 3. Library Architecture Tests (`library-architecture.test.tsx`)
Ensures proper integration of the library with app architecture:
- Library import/export verification
- React Navigation compatibility
- Survey model validation in app context
- Component factory integration
- Props and callbacks handling
- State management integration

### 4. Data and State Management Tests (`data-state-management.test.tsx`)
Validates data collection and state handling:
- Survey response collection
- Incremental data updates
- State persistence across example switches
- Event log management
- Multi-page survey state
- Concurrent state updates

### 5. Error Handling Tests (`error-handling.test.tsx`)
Tests resilience and error recovery:
- Invalid survey model handling
- Malformed JSON gracefully
- Event callback error handling
- Navigation error recovery
- Memory and resource management
- Edge cases (null data, special characters, etc.)

### 6. Performance Tests (`performance.test.tsx`)
Measures and validates performance characteristics:
- Initial render performance
- Navigation performance
- Survey interaction responsiveness
- Large survey handling
- Memory usage patterns
- Concurrent operations

### 7. Cross-Platform Tests (`cross-platform.test.tsx`)
Ensures consistent behavior across iOS and Android:
- Platform-specific rendering
- Safe area handling
- Modal behavior differences
- Platform-agnostic functionality
- Performance across platforms

## Running Integration Tests

```bash
# Run all integration tests
cd example
yarn test integration/

# Run specific test suite
yarn test integration/survey-flow.test.tsx

# Run with coverage
yarn test --coverage integration/

# Run in watch mode
yarn test --watch integration/
```

## Writing New Integration Tests

### Test Structure Template

```typescript
import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from '../../src/App';

// Mock required modules
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
  };
});

jest.mock('react-native-survey-js-ui');

describe('Your Integration Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should test integration scenario', async () => {
    const { getByTestId } = render(
      <SafeAreaProvider>
        <NavigationContainer>
          <App />
        </NavigationContainer>
      </SafeAreaProvider>
    );

    // Your test implementation
  });
});
```

### Best Practices

1. **Always wrap components in required providers**
   - SafeAreaProvider for safe area insets
   - NavigationContainer for navigation context

2. **Mock external dependencies**
   - Navigation hooks and methods
   - Library components to control behavior
   - Platform-specific APIs when needed

3. **Use proper async patterns**
   - Use `waitFor` for async state updates
   - Use `act` for state-changing operations
   - Handle promises and async operations correctly

4. **Test real user scenarios**
   - Focus on complete user journeys
   - Test interactions between components
   - Validate state persistence

5. **Performance considerations**
   - Set reasonable timeout expectations
   - Measure critical operations
   - Test with realistic data volumes

## Maintenance Guidelines

### Regular Updates

1. **When adding new features to the example app:**
   - Add corresponding integration tests
   - Update existing tests if behavior changes
   - Ensure cross-platform compatibility

2. **When updating the library:**
   - Run all integration tests
   - Update mocks if API changes
   - Add tests for new functionality

3. **When fixing bugs:**
   - Add regression tests
   - Test edge cases related to the bug
   - Verify fix across platforms

### CI/CD Integration

Integration tests should run in CI pipeline:
- On every pull request
- Before releases
- Nightly for comprehensive validation

### Performance Monitoring

Track performance metrics over time:
- Initial render times
- Navigation responsiveness
- Memory usage patterns
- Survey completion times

### Test Data Management

1. **Survey Examples:**
   - Keep test data realistic
   - Cover various question types
   - Include edge cases

2. **Mock Responses:**
   - Maintain consistent mock behavior
   - Update when library changes
   - Document mock expectations

## Troubleshooting

### Common Issues

1. **Test Timeouts:**
   - Increase timeout for slow operations
   - Check for missing `await` statements
   - Verify mock implementations

2. **Navigation Errors:**
   - Ensure navigation mocks are set up
   - Check navigation state
   - Verify route names

3. **Platform-Specific Failures:**
   - Test on both iOS and Android
   - Check platform conditionals
   - Verify platform mocks

### Debugging Tips

1. Use `console.log` to trace execution
2. Run single tests in isolation
3. Check mock call arguments
4. Verify component render output
5. Use React Native Testing Library debug utilities

## Coverage Goals

Maintain high test coverage:
- Overall: >90%
- Critical paths: 100%
- Error handling: >95%
- Cross-platform: 100%

Regular coverage reports help identify gaps and ensure comprehensive testing.