/**
 * Jest setup for Mobile MCP E2E tests
 */

// Extend Jest matchers
require('@testing-library/jest-native/extend-expect');

// Global test timeout for individual tests
jest.setTimeout(120000); // 2 minutes per test

// Mock console methods to reduce noise in test output
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Only show errors and warnings that are actually test failures
  console.error = (message) => {
    if (typeof message === 'string') {
      // Filter out React Native development warnings
      if (message.includes('Warning:') || 
          message.includes('VirtualizedLists should never be nested') ||
          message.includes('componentWillReceiveProps has been renamed')) {
        return;
      }
    }
    originalError(message);
  };

  console.warn = (message) => {
    if (typeof message === 'string') {
      // Filter out common React Native warnings
      if (message.includes('Warning:') || 
          message.includes('Animated:') ||
          message.includes('expo-modules-core')) {
        return;
      }
    }
    originalWarn(message);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Global error handler for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Global test hooks
global.mobileMcpTestTimeout = 120000;
global.mobileMcpRetryAttempts = 3;

// Helper function to retry flaky mobile operations
global.retryMobileOperation = async function(operation, maxAttempts = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Mobile operation failed (attempt ${attempt}/${maxAttempts}):`, error.message);
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

// Helper to wait for mobile operations to stabilize
global.waitForMobileStabilization = function(ms = 500) {
  return new Promise(resolve => setTimeout(resolve, ms));
};

console.log('Mobile MCP E2E Test Environment Initialized');