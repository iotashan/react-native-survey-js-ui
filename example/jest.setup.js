/* eslint-env jest */
// Removed gesture handler as it's not required

// Set up React Native feature flags before any imports
global.__fbBatchedBridgeConfig = {
  remoteModuleConfig: {},
  localModulesConfig: {},
};

// Mock React Native's native bridge and modules
jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => ({}));
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  get: () => null,
  getEnforcing: () => null,
}));

// Mock NativeEventEmitter
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  return jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    removeSubscription: jest.fn(),
    emit: jest.fn(),
    listenerCount: jest.fn(() => 0),
  }));
});

// Mock React Native Feature Flags
jest.mock(
  'react-native/src/private/featureflags/specs/NativeReactNativeFeatureFlags',
  () => ({
    __esModule: true,
    default: {},
  })
);

jest.mock(
  'react-native/src/private/featureflags/ReactNativeFeatureFlagsBase',
  () => ({
    __esModule: true,
    default: class MockFeatureFlagsBase {},
    createJavaScriptFlagGetter: jest.fn(() => jest.fn()),
    createNativeFlagGetter: jest.fn(() => jest.fn()),
  })
);

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useFocusEffect: jest.fn(),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({
    width: 375,
    height: 812,
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock StyleSheet to fix __fbBatchedBridgeConfig error
jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => ({
  create: (styles) => styles,
  flatten: (style) => style,
  absoluteFill: {},
  absoluteFillObject: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
}));

// Library mock will be handled per test file
