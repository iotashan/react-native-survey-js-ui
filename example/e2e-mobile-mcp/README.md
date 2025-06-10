# Mobile MCP E2E Tests

This directory contains End-to-End (E2E) tests that use Mobile MCP (Model Context Protocol) for testing the React Native Survey JS UI library on real mobile devices and simulators.

## Overview

Mobile MCP E2E tests provide an alternative to traditional testing frameworks like Detox, offering direct integration with mobile simulators and devices through Claude's Mobile MCP capabilities. These tests verify the complete survey flow and user interactions in a real mobile environment.

## Features

- **Real Device Testing**: Tests run on actual iOS simulators and Android devices
- **Comprehensive Coverage**: Covers survey flows, UI interactions, cross-platform behavior, and error handling
- **Performance Benchmarking**: Measures app launch times, navigation performance, and survey completion times
- **Accessibility Testing**: Verifies accessibility compliance and label coverage
- **Integration Testing**: Ensures compatibility with existing test suites and build processes

## Test Categories

### 1. Basic Survey Flow Tests (`survey-flow-mcp.test.ts`)
- Navigation between tabs
- Survey completion flow
- Question interaction
- Data input and validation
- Device integration (orientation, gestures)

### 2. Cross-Platform Behavior Tests (`cross-platform-mcp.test.ts`)
- Responsive layout adaptation
- Orientation change handling
- Touch and gesture behavior
- Screen size adaptation
- Performance and responsiveness
- Accessibility compliance

### 3. Error Handling Tests (`error-handling-mcp.test.ts`)
- Validation error display
- Invalid data handling
- Network edge cases
- UI edge cases (rapid orientation changes, edge taps)
- Data persistence scenarios
- Recovery and resilience testing

### 4. Integration Tests (`integration-mcp.test.ts`)
- Test suite integration with existing Detox tests
- Performance benchmarking
- Coverage verification
- Compatibility testing

## Architecture

### Mobile MCP Adapter (`mobileMcpAdapter.js`)
The adapter provides a bridge between Jest tests and Mobile MCP functions:

```javascript
const { mobileMcpAdapter } = require('./mobileMcpAdapter');

// Initialize device
await mobileMcpAdapter.initialize();

// Launch app
await mobileMcpAdapter.launchApp();

// Interact with UI
const elements = await mobileMcpAdapter.getElementsOnScreen();
await mobileMcpAdapter.tapAtCoordinates(x, y);
await mobileMcpAdapter.typeText('Hello World');
```

### Test Helpers
The test suite includes several helper utilities in `../src/test-utils/mobileMcpHelpers.ts`:
- `MobileMcpTestHelper`: General mobile testing utilities
- `SurveyMcpTestHelper`: Survey-specific testing methods
- Device info management
- Element finding and interaction
- Wait and retry mechanisms

## Configuration

### Jest Configuration (`jest.config.js`)
- 3-minute timeout for mobile tests
- Sequential test execution (maxWorkers: 1)
- Custom setup and teardown
- Test result reporting with jest-junit

### Global Setup (`globalSetup.js`)
- Device initialization
- App installation verification
- Test environment configuration

### Global Teardown (`globalTeardown.js`)
- Device cleanup
- App termination
- Test session reporting

## Running Tests

### Prerequisites
1. iOS Simulator or Android device/emulator
2. React Native development environment
3. Survey JS UI example app built and installed

### Commands

```bash
# Run all Mobile MCP E2E tests
yarn test:e2e-mcp

# Run specific test categories
yarn test:e2e-mcp:basic        # Basic survey flow tests
yarn test:e2e-mcp:cross-platform  # Cross-platform behavior tests
yarn test:e2e-mcp:errors      # Error handling tests
yarn test:e2e-mcp:integration # Integration tests

# Run all tests (unit + E2E Mobile MCP)
yarn test:all
```

### Test Output
Tests generate:
- Console logs with detailed operation information
- Screenshots for debugging (before/after each test)
- JUnit XML reports in `test-results/`
- Coverage reports in `coverage/`

## Best Practices

### Test Design
1. **Use retry mechanisms**: Mobile operations can be flaky
2. **Add stabilization waits**: Allow UI time to respond
3. **Take screenshots**: Capture state for debugging
4. **Test real scenarios**: Focus on actual user workflows

### Error Handling
```javascript
await global.retryMobileOperation(async () => {
  // Mobile operation that might fail
  await mobileMcpAdapter.tapElement({ text: 'Submit' });
}, 3, 1000); // 3 attempts, 1s delay
```

### Performance Testing
```javascript
const startTime = Date.now();
await mobileMcpAdapter.launchApp();
const launchTime = Date.now() - startTime;
expect(launchTime).toBeLessThan(5000); // Under 5 seconds
```

## Comparison with Detox

| Feature | Mobile MCP | Detox |
|---------|------------|-------|
| Setup Complexity | Low | High |
| Device Support | iOS/Android | iOS/Android |
| Real Device Testing | Yes | Yes |
| Integration | Native MCP | Separate framework |
| Performance | Good | Excellent |
| Debugging | Screenshots + logs | Advanced debugging |

## Troubleshooting

### Common Issues

1. **App not launching**
   - Verify app is installed on device/simulator
   - Check device selection with `mcp__mobile__mobile_list_available_devices`

2. **Elements not found**
   - Take screenshots to verify UI state
   - Check accessibility labels in app code
   - Increase stabilization wait times

3. **Tests timing out**
   - Increase test timeout in jest.config.js
   - Add more stabilization waits
   - Check device performance

4. **Flaky tests**
   - Use retry mechanisms for mobile operations
   - Add proper wait conditions
   - Verify element existence before interaction

### Debug Mode
Add debug logging to tests:

```javascript
console.log('Current elements:', await mobileMcpAdapter.getElementsOnScreen());
await mobileMcpAdapter.takeScreenshot('debug-state');
```

## Implementation Notes

### Current Status
This implementation provides a comprehensive framework for Mobile MCP E2E testing. The adapter uses mock implementations that would need to be replaced with actual MCP function calls in a production environment.

### Integration Points
- **MCP Functions**: `mcp__mobile__*` functions for device interaction
- **Jest Framework**: Standard Jest testing with custom configuration
- **React Native**: Tests the actual built React Native application
- **CI/CD**: Compatible with automated testing pipelines

### Future Enhancements
- Real MCP function integration
- Video recording of test sessions
- Advanced performance metrics
- Multi-device parallel testing
- Integration with test reporting dashboards

## Contributing

When adding new Mobile MCP E2E tests:

1. Follow the existing test structure and naming conventions
2. Add appropriate retry mechanisms and stabilization waits
3. Include screenshots for debugging
4. Document any new helper functions
5. Update this README with new test categories or features

## Support

For issues with Mobile MCP E2E tests:
1. Check the troubleshooting section above
2. Review test logs and screenshots
3. Verify device/simulator configuration
4. Consult the Mobile MCP documentation