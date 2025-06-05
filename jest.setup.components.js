/* global jest */

// Component-specific Jest setup for React Native Testing Library

// Use built-in matchers from @testing-library/react-native v12.4+
// Note: jest-native is deprecated, using built-in matchers instead

// Consolidated React Native mocks are above in the main mock

// Use React Native's built-in mock instead of custom mocking
// This provides better compatibility and avoids TurboModule issues

// Animated mocks are included in the main react-native mock above

// Mock survey-core specific components that might not work in test environment
jest.mock('survey-core', () => ({
  SurveyModel: jest.fn().mockImplementation((json) => ({
    pages: [],
    questions: [],
    title: 'Mock Survey',
    json: json || {},
    onValueChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onCurrentPageChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onComplete: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    getValue: jest.fn(),
    setValue: jest.fn(),
    getAllQuestions: jest.fn(() => []),
    clear: jest.fn(),
    fromJSON: jest.fn(),
  })),
  Question: jest.fn().mockImplementation(() => ({
    name: 'mockQuestion',
    value: undefined,
    getType: jest.fn(() => 'text'),
    title: 'Mock Question',
    isRequired: false,
  })),
  JsonObject: {
    metaData: {
      addClass: jest.fn(),
    },
  },
  Serializer: {
    addProperty: jest.fn(),
  },
}));

// Component test helpers
global.componentTestUtils = {
  // Helper to render components with common providers
  renderWithProviders: (component, options = {}) => {
    // This would typically wrap with theme providers, navigation context, etc.
    return component;
  },
  
  // Helper to simulate user interactions
  userEvent: {
    press: jest.fn(),
    type: jest.fn(),
    scroll: jest.fn(),
  },
};