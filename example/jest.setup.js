/* eslint-env jest */
import '@testing-library/jest-native/extend-expect';

// Set up React Native feature flags before any imports
global.__fbBatchedBridgeConfig = {
  remoteModuleConfig: {},
  localModulesConfig: {},
};

// Mock React Native completely (based on main library pattern)
jest.mock('react-native', () => {
  const React = require('react');

  return {
    // Mock View component
    View: jest.fn(({ children, testID, ...props }) =>
      React.createElement('View', { testID, ...props }, children)
    ),

    // Mock Text component
    Text: jest.fn(({ children, testID, ...props }) =>
      React.createElement('Text', { testID, ...props }, children)
    ),

    // Mock TextInput component
    TextInput: jest.fn((props) => {
      const { onChangeText, value, testID, ...otherProps } = props;
      return React.createElement('TextInput', {
        testID,
        value,
        onChange: (e) => onChangeText?.(e.target.value),
        ...otherProps,
      });
    }),

    // Mock TouchableOpacity
    TouchableOpacity: jest.fn(({ children, onPress, testID, ...props }) =>
      React.createElement(
        'TouchableOpacity',
        {
          testID,
          onClick: onPress,
          ...props,
        },
        children
      )
    ),

    // Mock ScrollView
    ScrollView: jest.fn(({ children, testID, ...props }) =>
      React.createElement('ScrollView', { testID, ...props }, children)
    ),

    // Mock SafeAreaView
    SafeAreaView: jest.fn(({ children, testID, ...props }) =>
      React.createElement('SafeAreaView', { testID, ...props }, children)
    ),

    // Mock FlatList
    FlatList: jest.fn(({ data, renderItem, keyExtractor, testID, ...props }) => {
      return React.createElement(
        'FlatList',
        { testID, ...props },
        data?.map((item, index) => {
          const key = keyExtractor ? keyExtractor(item, index) : index;
          return React.createElement('div', { key }, renderItem({ item, index }));
        })
      );
    }),

    // Mock Button
    Button: jest.fn(({ title, onPress, testID, ...props }) =>
      React.createElement(
        'Button',
        {
          testID,
          onClick: onPress,
          ...props,
        },
        title
      )
    ),

    // Mock Modal
    Modal: jest.fn(({ children, visible, transparent, testID, ...props }) =>
      visible
        ? React.createElement('Modal', { testID, ...props }, children)
        : null
    ),

    // Mock StyleSheet
    StyleSheet: {
      create: jest.fn((styles) => styles),
      compose: jest.fn((...styles) => Object.assign({}, ...styles)),
      flatten: jest.fn((style) => {
        if (Array.isArray(style)) {
          return style.reduce((merged, current) => {
            if (current && typeof current === 'object') {
              return { ...merged, ...current };
            }
            return merged;
          }, {});
        }
        return style || {};
      }),
      absoluteFillObject: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      hairlineWidth: 1,
    },

    // Mock Platform
    Platform: {
      OS: 'ios',
      Version: 14,
      select: jest.fn((obj) => obj.ios || obj.default),
      isPad: false,
      isTVOS: false,
      isTV: false,
      constants: {
        reactNativeVersion: { major: 0, minor: 76, patch: 9 },
      },
    },

    // Mock Dimensions
    Dimensions: {
      get: jest.fn((dim) => {
        if (dim === 'window') {
          return { width: 375, height: 812, scale: 2, fontScale: 1 };
        }
        if (dim === 'screen') {
          return { width: 375, height: 812, scale: 2, fontScale: 1 };
        }
        return { width: 0, height: 0, scale: 1, fontScale: 1 };
      }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },

    // Mock Keyboard
    Keyboard: {
      dismiss: jest.fn(),
      addListener: jest.fn(() => ({ remove: jest.fn() })),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
    },

    // Mock Alert
    Alert: {
      alert: jest.fn((title, message, buttons, _options) => {
        if (buttons && buttons.length > 0) {
          const firstButton = buttons[0];
          if (typeof firstButton === 'object' && firstButton.onPress) {
            firstButton.onPress();
          }
        }
      }),
    },

    // Mock NativeModules for React Native Testing Library v13.2.0
    NativeModules: {
      UIManager: {
        getConstants: jest.fn(() => ({
          ViewManagerNames: ['RCTView', 'RCTText', 'RCTScrollView'],
          LazyViewManagersEnabled: true,
          AccessibilityManagerEnabled: true,
        })),
        measureInWindow: jest.fn(),
        measure: jest.fn(),
        measureLayout: jest.fn(),
        measureLayoutRelativeToParent: jest.fn(),
        setJSResponder: jest.fn(),
        clearJSResponder: jest.fn(),
        configureNextLayoutAnimation: jest.fn(),
        dispatchViewManagerCommand: jest.fn(),
        focus: jest.fn(),
        blur: jest.fn(),
        findSubviewIn: jest.fn(),
      },
      PlatformConstants: {
        getConstants: jest.fn(() => ({
          isMacCatalyst: false,
          reactNativeVersion: { major: 0, minor: 76, patch: 9 },
          Version: 14,
          Release: '14.0',
          Model: 'iPhone',
          SystemName: 'iOS',
          SystemVersion: '14.0',
          interfaceIdiom: 'phone',
        })),
      },
    },
  };
});

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

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
  Feather: 'Feather',
}));

// Library mock will be handled per test file