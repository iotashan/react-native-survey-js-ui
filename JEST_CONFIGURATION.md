# Jest Configuration Documentation

This document outlines the enhanced Jest configuration implemented for the react-native-survey-js-ui library, optimized for React Native library development with comprehensive TDD workflow support.

## Configuration Overview

The project uses a dedicated `jest.config.js` file instead of package.json configuration for better maintainability and advanced features.

### Key Performance Optimizations

- **Parallel Execution**: Uses 50% of available CPU cores (`maxWorkers: '50%'`)
- **Test Timeout**: 10-second timeout to catch hanging tests
- **Transform Optimizations**: Optimized `transformIgnorePatterns` for React Native and survey-core
- **Module Resolution**: Efficient module path ignoring for better performance
- **Caching**: Leverages Jest's built-in caching with custom cache directory

### Coverage Configuration

#### Global Thresholds (>90% requirement)
- Statements: 90%
- Branches: 90%
- Functions: 90%
- Lines: 90%

#### Component-Specific Thresholds (>95% requirement)
For `src/components/` directory:
- Statements: 95%
- Branches: 95%
- Functions: 95%
- Lines: 95%

### Setup Files

#### `jest.setup.js` (Base Setup)
- Global navigator and window mocks for survey-core compatibility
- iPhone user agent simulation
- Basic DOM-like environment for survey-core

#### `jest.setup.after.js` (Performance & Utilities)
- Performance monitoring for slow tests (>5 seconds)
- Global test utilities (`waitFor`, `createMockSurveyModel`)
- Enhanced error filtering for cleaner test output

#### `jest.setup.components.js` (React Native Mocking)
- Simplified React Native component mocking approach
- survey-core mock implementations for testing
- Component test helpers and utilities

### CI/CD Integration

#### Reporters
- **Default**: Console output for development
- **jest-junit**: XML reports for CI systems (output: `coverage/junit.xml`)

#### Coverage Formats
- **text**: Console output
- **lcov**: For coverage analysis tools
- **html**: Interactive coverage reports (`coverage/lcov-report/`)
- **clover**: XML format for CI integration

#### Environment Variables
- `CI=true`: Enables verbose output and fail-fast behavior
- Bail configuration: Stops on first failure in CI

### Module Configuration

#### Path Mappings
```javascript
moduleNameMapper: {
  '^react-native-survey-js-ui$': '<rootDir>/src/index.ts',
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

#### Ignored Patterns
- `example/node_modules/`: Example app dependencies
- `lib/`: Build output directory
- `coverage/`: Coverage reports

### Transform Patterns

Optimized to handle:
- React Native core and community packages
- survey-core library
- @testing-library packages
- Other React Native ecosystem packages

## Usage Patterns

### Development Commands

```bash
# Run all tests
yarn test

# Run with coverage
yarn test --coverage

# Run specific test file
yarn test src/components/Survey/Survey.test.tsx

# Run in watch mode
yarn test --watch

# Run with limited workers (for debugging)
yarn test --maxWorkers=1
```

### Coverage Commands

```bash
# Generate coverage report
yarn test --coverage

# View HTML coverage report
open coverage/lcov-report/index.html

# Check coverage thresholds only
yarn test --coverage --passWithNoTests
```

### CI/CD Usage

The configuration automatically adapts for CI environments:

```bash
# CI command (with fail-fast and verbose output)
CI=true yarn test --coverage --ci
```

### Performance Testing

The configuration includes automatic slow test detection:
- Tests taking >5 seconds trigger warnings
- Use `--maxWorkers=1` for debugging performance issues
- Monitor console output for performance insights

## Best Practices

### Test Organization
- **Library Tests**: Focus on isolated unit testing
- **Component Tests**: Use React Native Testing Library
- **Integration Tests**: Test component interactions

### Mock Strategy
- Use provided survey-core mocks for consistent testing
- Leverage global test utilities for common operations
- Keep component mocks minimal and focused

### Coverage Optimization
- Aim for meaningful coverage, not just numerical targets
- Use coverage reports to identify untested code paths
- Focus on critical business logic in components

### Performance Guidelines
- Keep individual tests under 5 seconds
- Use `beforeEach`/`afterEach` for test setup/cleanup
- Avoid heavy computation in test setup

## Troubleshooting

### Common Issues

1. **Transform Errors**: Update `transformIgnorePatterns` for new dependencies
2. **Mock Conflicts**: Check setup file order and mock implementations
3. **Performance Issues**: Use `--maxWorkers=1` to isolate problems
4. **Coverage Failures**: Review uncovered lines in HTML reports

### Debugging Tips

- Use `--verbose` for detailed test output
- Check `coverage/lcov-report/index.html` for coverage insights
- Monitor console warnings for slow tests
- Use Jest's `--detectOpenHandles` for hanging tests

## Configuration Files

### Core Files
- `jest.config.js`: Main configuration
- `jest.setup.js`: Base environment setup
- `jest.setup.after.js`: Performance and utilities
- `jest.setup.components.js`: React Native mocking

### Generated Files
- `coverage/`: All coverage reports
- `coverage/junit.xml`: CI test results
- `node_modules/.cache/jest/`: Jest cache

This configuration provides a robust foundation for TDD development with React Native libraries while maintaining excellent performance and comprehensive coverage reporting.