import { Platform } from 'react-native';
import {
  isIOS,
  isAndroid,
  isWeb,
  describeIOS,
  describeAndroid,
  describeCrossPlatform,
  testIOS,
  testAndroid,
  setupPlatformMocks,
  getPlatformTestData,
  getPlatformTimeout,
  PLATFORM_TIMEOUTS,
} from '../platformUtils';

// Mock React Native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios', // Default to iOS for tests
  },
}));

describe('Platform Utilities', () => {
  describe('Platform detection', () => {
    afterEach(() => {
      // Reset platform after each test
      (Platform as any).OS = 'ios';
    });

    it('should correctly identify iOS platform', () => {
      (Platform as any).OS = 'ios';
      expect(isIOS()).toBe(true);
      expect(isAndroid()).toBe(false);
      expect(isWeb()).toBe(false);
    });

    it('should correctly identify Android platform', () => {
      (Platform as any).OS = 'android';
      expect(isIOS()).toBe(false);
      expect(isAndroid()).toBe(true);
      expect(isWeb()).toBe(false);
    });

    it('should correctly identify Web platform', () => {
      (Platform as any).OS = 'web';
      expect(isIOS()).toBe(false);
      expect(isAndroid()).toBe(false);
      expect(isWeb()).toBe(true);
    });
  });

  describe('Platform-specific describe blocks', () => {
    const mockDescribe = jest.fn();
    const mockDescribeSkip = jest.fn();
    
    beforeAll(() => {
      (global as any).describe = mockDescribe;
      (global as any).describe.skip = mockDescribeSkip;
    });

    beforeEach(() => {
      mockDescribe.mockClear();
      mockDescribeSkip.mockClear();
    });

    it('should run iOS describe block on iOS platform', () => {
      (Platform as any).OS = 'ios';
      const testFn = jest.fn();
      describeIOS('iOS test', testFn);
      
      expect(mockDescribe).toHaveBeenCalledWith('[iOS] iOS test', testFn);
      expect(mockDescribeSkip).not.toHaveBeenCalled();
    });

    it('should skip iOS describe block on Android platform', () => {
      (Platform as any).OS = 'android';
      const testFn = jest.fn();
      describeIOS('iOS test', testFn);
      
      expect(mockDescribe).not.toHaveBeenCalled();
      expect(mockDescribeSkip).toHaveBeenCalledWith('[iOS] iOS test', testFn);
    });

    it('should run Android describe block on Android platform', () => {
      (Platform as any).OS = 'android';
      const testFn = jest.fn();
      describeAndroid('Android test', testFn);
      
      expect(mockDescribe).toHaveBeenCalledWith('[Android] Android test', testFn);
      expect(mockDescribeSkip).not.toHaveBeenCalled();
    });

    it('should skip Android describe block on iOS platform', () => {
      (Platform as any).OS = 'ios';
      const testFn = jest.fn();
      describeAndroid('Android test', testFn);
      
      expect(mockDescribe).not.toHaveBeenCalled();
      expect(mockDescribeSkip).toHaveBeenCalledWith('[Android] Android test', testFn);
    });

    it('should always run cross-platform describe blocks', () => {
      const testFn = jest.fn();
      describeCrossPlatform('Cross-platform test', testFn);
      
      expect(mockDescribe).toHaveBeenCalledWith('[Cross-Platform] Cross-platform test', testFn);
    });
  });

  describe('Platform-specific test blocks', () => {
    const mockTest = jest.fn();
    const mockTestSkip = jest.fn();
    
    beforeAll(() => {
      (global as any).test = mockTest;
      (global as any).test.skip = mockTestSkip;
    });

    beforeEach(() => {
      mockTest.mockClear();
      mockTestSkip.mockClear();
    });

    it('should run iOS test on iOS platform', () => {
      (Platform as any).OS = 'ios';
      const testFn = jest.fn();
      testIOS('iOS specific test', testFn);
      
      expect(mockTest).toHaveBeenCalledWith('[iOS] iOS specific test', testFn);
      expect(mockTestSkip).not.toHaveBeenCalled();
    });

    it('should skip iOS test on Android platform', () => {
      (Platform as any).OS = 'android';
      const testFn = jest.fn();
      testIOS('iOS specific test', testFn);
      
      expect(mockTest).not.toHaveBeenCalled();
      expect(mockTestSkip).toHaveBeenCalledWith('[iOS] iOS specific test', testFn);
    });

    it('should run Android test on Android platform', () => {
      (Platform as any).OS = 'android';
      const testFn = jest.fn();
      testAndroid('Android specific test', testFn);
      
      expect(mockTest).toHaveBeenCalledWith('[Android] Android specific test', testFn);
      expect(mockTestSkip).not.toHaveBeenCalled();
    });

    it('should skip Android test on iOS platform', () => {
      (Platform as any).OS = 'ios';
      const testFn = jest.fn();
      testAndroid('Android specific test', testFn);
      
      expect(mockTest).not.toHaveBeenCalled();
      expect(mockTestSkip).toHaveBeenCalledWith('[Android] Android specific test', testFn);
    });
  });

  describe('Platform-specific data', () => {
    it('should return iOS data on iOS platform', () => {
      (Platform as any).OS = 'ios';
      const iosData = { value: 'iOS' };
      const androidData = { value: 'Android' };
      
      expect(getPlatformTestData(iosData, androidData)).toBe(iosData);
    });

    it('should return Android data on Android platform', () => {
      (Platform as any).OS = 'android';
      const iosData = { value: 'iOS' };
      const androidData = { value: 'Android' };
      
      expect(getPlatformTestData(iosData, androidData)).toBe(androidData);
    });
  });

  describe('Platform-specific timeouts', () => {
    it('should return iOS timeouts on iOS platform', () => {
      (Platform as any).OS = 'ios';
      
      expect(getPlatformTimeout('short')).toBe(PLATFORM_TIMEOUTS.ios.short);
      expect(getPlatformTimeout('medium')).toBe(PLATFORM_TIMEOUTS.ios.medium);
      expect(getPlatformTimeout('long')).toBe(PLATFORM_TIMEOUTS.ios.long);
    });

    it('should return Android timeouts on Android platform', () => {
      (Platform as any).OS = 'android';
      
      expect(getPlatformTimeout('short')).toBe(PLATFORM_TIMEOUTS.android.short);
      expect(getPlatformTimeout('medium')).toBe(PLATFORM_TIMEOUTS.android.medium);
      expect(getPlatformTimeout('long')).toBe(PLATFORM_TIMEOUTS.android.long);
    });
  });

  describe('Platform mocks setup', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should set up iOS-specific mocks on iOS platform', () => {
      (Platform as any).OS = 'ios';
      setupPlatformMocks();
      
      // Verify iOS mocks are set
      const settingsMock = require('react-native/Libraries/Settings/Settings');
      expect(settingsMock.get).toBeDefined();
      expect(settingsMock.set).toBeDefined();
    });

    it('should set up Android-specific mocks on Android platform', () => {
      (Platform as any).OS = 'android';
      setupPlatformMocks();
      
      // Verify Android mocks are set
      const permissionsMock = require('react-native/Libraries/PermissionsAndroid/PermissionsAndroid');
      expect(permissionsMock.request).toBeDefined();
      expect(permissionsMock.check).toBeDefined();
    });
  });
});