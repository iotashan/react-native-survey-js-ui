/**
 * Test utilities for react-native-survey-js-ui
 * Provides comprehensive mocking and testing helpers
 */

// Re-export survey factory functions
export * from './surveyFactories';

// Re-export mock event system
export * from './mockEventSystem';

// Re-export mock scenarios
export * from './mockScenarios';

// Re-export platform utilities
export * from './platformUtils';

// Re-export mocks
export { MockSurveyModel } from '../__mocks__/survey-core/Model.mock';

// Additional test utilities
import { render, RenderOptions } from '@testing-library/react-native';
import React from 'react';

/**
 * Custom render function that includes common providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions
) {
  // Add any providers here (theme, navigation, etc.)
  return render(ui, options);
}

/**
 * Wait for async operations to complete
 */
export function waitForAsync(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a mock navigation prop for testing screens
 */
export function createMockNavigation() {
  return {
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    setParams: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    canGoBack: jest.fn().mockReturnValue(true),
    getParent: jest.fn(),
    getState: jest.fn(),
    reset: jest.fn(),
    isFocused: jest.fn().mockReturnValue(true),
  };
}

/**
 * Create mock route params
 */
export function createMockRoute(params: any = {}) {
  return {
    key: 'test-route',
    name: 'TestScreen',
    params,
  };
}

/**
 * Assert component is in loading state
 */
export function expectLoading(getByTestId: any) {
  expect(() => getByTestId('activity-indicator')).not.toThrow();
}

/**
 * Assert component shows error
 */
export function expectError(getByText: any, errorMessage?: string) {
  if (errorMessage) {
    expect(() => getByText(errorMessage)).not.toThrow();
  } else {
    expect(() => getByText(/error/i)).not.toThrow();
  }
}

/**
 * Type-safe mock function creator
 */
export function createMockFunction<
  T extends (...args: any[]) => any,
>(): jest.MockedFunction<T> {
  return jest.fn() as jest.MockedFunction<T>;
}

/**
 * Clean up all mocks after test
 */
export function cleanupMocks() {
  jest.clearAllMocks();
  jest.restoreAllMocks();
}

/**
 * Setup common test environment
 */
export function setupTestEnvironment() {
  // Silence console warnings in tests
  const originalWarn = console.warn;
  const originalError = console.error;

  beforeAll(() => {
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    console.warn = originalWarn;
    console.error = originalError;
  });

  afterEach(() => {
    cleanupMocks();
  });
}
