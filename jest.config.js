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
  ],
  
  // Transform ignore patterns optimized for React Native and survey-core
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|survey-core|@testing-library)/)',
  ],
  
  // Coverage configuration with >90% thresholds
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/*.d.ts',
    '!src/**/index.ts', // Index files are usually just exports
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
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Specific requirements for core components
    'src/components/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  
  // Test environment configurations - use React Native default
  // testEnvironment: 'node', // Will be set at bottom for compatibility
  
  // Setup files
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.after.js', '<rootDir>/jest.setup.components.js'],
  
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
  
  // Cache configuration for performance
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  clearMocks: true,
  restoreMocks: true,
  
  // Reporters for CI/CD integration
  reporters: [
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
  coverageReporters: ['text', 'lcov', 'html', 'clover'],
  coverageDirectory: '<rootDir>/coverage',
  
  // Verbose output for CI environments
  verbose: process.env.CI === 'true',
  
  // Fail fast in CI
  bail: process.env.CI === 'true' ? 1 : 0,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Use single project configuration for simplicity and better React Native compatibility
  testEnvironment: 'node',
};