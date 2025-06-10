/** @type {import('jest').Config} */
module.exports = {
  rootDir: '..',
  testMatch: ['<rootDir>/e2e-mobile-mcp/**/*.test.ts'],
  testTimeout: 180000, // 3 minutes for mobile tests
  maxWorkers: 1, // Run tests sequentially for mobile device
  preset: 'react-native',
  setupFilesAfterEnv: [
    '<rootDir>/e2e-mobile-mcp/jest.setup.js'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  testEnvironment: 'node', // Mobile MCP tests run in Node environment
  verbose: true,
  bail: 1, // Stop on first failure for mobile tests
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '<rootDir>/e2e-mobile-mcp/test-results',
      outputName: 'mobile-mcp-results.xml',
      suiteName: 'Mobile MCP E2E Tests'
    }]
  ],
  collectCoverageFrom: [
    '../src/**/*.{ts,tsx}',
    '!../src/**/*.test.{ts,tsx}',
    '!../src/**/__tests__/**',
    '!../src/**/__mocks__/**',
    '!../src/test-utils/**'
  ],
  coverageDirectory: '<rootDir>/e2e-mobile-mcp/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  // Custom test environment setup
  globalSetup: '<rootDir>/e2e-mobile-mcp/globalSetup.js',
  globalTeardown: '<rootDir>/e2e-mobile-mcp/globalTeardown.js'
};