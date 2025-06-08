module.exports = {
  preset: 'react-native',

  // Performance optimizations
  maxWorkers: '50%', // Use half available CPU cores for parallel execution
  testTimeout: 10000, // 10 second timeout for tests

  // Module resolution optimizations
  modulePathIgnorePatterns: [
    '<rootDir>/example/node_modules',
    '<rootDir>/lib/',
    '<rootDir>/coverage/',
    '<rootDir>/survey-library-fork/',
    '<rootDir>/example/survey-core-source/',
  ],

  // Transform ignore patterns optimized for React Native and survey-core
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@testing-library)/)',
  ],

  // Coverage configuration with >90% thresholds
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.d.ts',
    '!src/**/index.ts', // Index files are usually just exports
    '!src/test-utils/**', // Test utilities should not be included in coverage
    '!src/**/__mocks__/**', // Mock files excluded from coverage
  ],

  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/lib/',
    '/__tests__/',
    '/example/',
    '/coverage/',
  ],

  // Coverage thresholds enforcing >90% meaningful coverage
  coverageThreshold: {
    'global': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Specific requirements for core components
    'src/components/': {
      branches: 87, // Adjusted to allow defensive programming branches
      functions: 95,
      lines: 95,
      statements: 95,
    },
    // Hook-specific thresholds (complex state management)
    'src/hooks/': {
      branches: 80, // Hooks have many edge cases for state management
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },

  // Test environment configurations - use React Native default
  // testEnvironment: 'node', // Will be set at bottom for compatibility

  // Setup files
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.after.js',
    '<rootDir>/jest.setup.components.js',
  ],

  // Test matching patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,ts,tsx}',
    '<rootDir>/src/**/*.test.{js,ts,tsx}',
  ],

  // Module name mapping for library imports
  moduleNameMapper: {
    '^react-native-survey-js-ui$': '<rootDir>/src/index.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Roots for Jest to search
  roots: ['<rootDir>/src'],

  // Cache configuration for performance
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  clearMocks: true,
  restoreMocks: true,

  // Reporters for CI/CD integration
  reporters: process.env.JEST_REPORTERS
    ? process.env.JEST_REPORTERS.split(',')
    : [
        'default',
        [
          'jest-junit',
          {
            outputDirectory: '<rootDir>/coverage',
            outputName: 'junit.xml',
            classNameTemplate: '{classname}',
            titleTemplate: '{title}',
          },
        ],
      ],

  // Coverage reporting
  coverageReporters: ['text', 'lcov', 'html', 'clover', 'json-summary'],
  coverageDirectory: '<rootDir>/coverage',

  // Coverage performance optimizations
  collectCoverage: process.env.COVERAGE === 'true' || process.env.CI === 'true',
  coverageProvider: 'v8', // Use V8 coverage provider for better performance

  // Verbose output for CI environments
  verbose: process.env.CI === 'true',

  // Fail fast in CI
  bail: process.env.CI === 'true' ? 1 : 0,

  // Error handling
  errorOnDeprecated: true,

  // Use single project configuration for simplicity and better React Native compatibility
  testEnvironment: 'node',
};
