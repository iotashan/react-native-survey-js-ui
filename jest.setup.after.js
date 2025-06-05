/* global jest */

// Additional Jest setup that runs after environment setup

// React Native components are mocked in jest.setup.components.js

// Performance monitoring for slow tests
let slowTestThreshold = 5000; // 5 seconds

beforeEach(() => {
  // Track test start time
  jest.testStartTime = Date.now();
});

afterEach(() => {
  // Log slow tests for performance optimization
  const testDuration = Date.now() - jest.testStartTime;
  if (testDuration > slowTestThreshold) {
    console.warn(`⚠️  Slow test detected: ${expect.getState().currentTestName} took ${testDuration}ms`);
  }
});

// Enhanced error handling for better debugging
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out known non-critical warnings
  const message = args[0];
  if (
    typeof message === 'string' &&
    (message.includes('Warning: ReactDOM.render is no longer supported') ||
     message.includes('Warning: componentWillReceiveProps has been renamed'))
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Global test utilities
global.testUtils = {
  // Utility to wait for async operations
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Utility to create mock survey models
  createMockSurveyModel: (overrides = {}) => ({
    pages: [],
    questions: [],
    title: 'Test Survey',
    ...overrides,
  }),
};