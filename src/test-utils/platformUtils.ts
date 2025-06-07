import { Platform } from 'react-native';

/**
 * Platform detection utilities for cross-platform testing
 */

export const isIOS = () => Platform.OS === 'ios';
export const isAndroid = () => Platform.OS === 'android';
export const isWeb = () => Platform.OS === 'web';

/**
 * Run platform-specific tests
 */
export const describeIOS = (description: string, fn: () => void) => {
  if (isIOS()) {
    describe(`[iOS] ${description}`, fn);
  } else {
    describe.skip(`[iOS] ${description}`, fn);
  }
};

export const describeAndroid = (description: string, fn: () => void) => {
  if (isAndroid()) {
    describe(`[Android] ${description}`, fn);
  } else {
    describe.skip(`[Android] ${description}`, fn);
  }
};

export const describeCrossPlatform = (description: string, fn: () => void) => {
  describe(`[Cross-Platform] ${description}`, fn);
};

/**
 * Platform-specific test utilities
 */
export const testIOS = (description: string, fn: () => void) => {
  if (isIOS()) {
    test(`[iOS] ${description}`, fn);
  } else {
    test.skip(`[iOS] ${description}`, fn);
  }
};

export const testAndroid = (description: string, fn: () => void) => {
  if (isAndroid()) {
    test(`[Android] ${description}`, fn);
  } else {
    test.skip(`[Android] ${description}`, fn);
  }
};

/**
 * Platform-specific mock setup
 */
export const setupPlatformMocks = () => {
  if (isIOS()) {
    // iOS-specific mocks
    jest.mock('react-native/Libraries/Settings/Settings', () => ({
      get: jest.fn(),
      set: jest.fn(),
    }));
  }

  if (isAndroid()) {
    // Android-specific mocks
    jest.mock('react-native/Libraries/PermissionsAndroid/PermissionsAndroid', () => ({
      request: jest.fn(() => Promise.resolve('granted')),
      check: jest.fn(() => Promise.resolve(true)),
    }));
  }
};

/**
 * Get platform-specific test data
 */
export const getPlatformTestData = <T>(ios: T, android: T): T => {
  return isIOS() ? ios : android;
};

/**
 * Platform-specific timeouts
 */
export const PLATFORM_TIMEOUTS = {
  ios: {
    short: 1000,
    medium: 5000,
    long: 10000,
  },
  android: {
    short: 2000,
    medium: 7000,
    long: 15000,
  },
};

export const getPlatformTimeout = (type: 'short' | 'medium' | 'long'): number => {
  const platform = isIOS() ? 'ios' : 'android';
  return PLATFORM_TIMEOUTS[platform][type];
};