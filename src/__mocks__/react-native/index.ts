/**
 * Mock implementations for React Native components
 * Used for testing library components in isolation
 */

import React from 'react';

// Mock View component
export const View = jest.fn(({ children, testID, ...props }) =>
  React.createElement('View', { testID, ...props }, children)
);

// Mock Text component
export const Text = jest.fn(({ children, testID, ...props }) =>
  React.createElement('Text', { testID, ...props }, children)
);

// Mock TextInput component
export const TextInput = jest.fn((props) => {
  const { onChangeText, value, testID, ...otherProps } = props;
  return React.createElement('TextInput', {
    testID,
    value,
    onChange: (e: any) => onChangeText?.(e.target.value),
    ...otherProps,
  });
});

// Mock TouchableOpacity
export const TouchableOpacity = jest.fn(
  ({ children, onPress, testID, ...props }) =>
    React.createElement(
      'TouchableOpacity',
      {
        testID,
        onClick: onPress,
        ...props,
      },
      children
    )
);

// Mock ScrollView
export const ScrollView = jest.fn(({ children, testID, ...props }) =>
  React.createElement('ScrollView', { testID, ...props }, children)
);

// Mock SafeAreaView
export const SafeAreaView = jest.fn(({ children, testID, ...props }) =>
  React.createElement('SafeAreaView', { testID, ...props }, children)
);

// Mock ActivityIndicator
export const ActivityIndicator = jest.fn(({ testID, ...props }) =>
  React.createElement('ActivityIndicator', { testID, ...props })
);

// Mock Switch
export const Switch = jest.fn(({ value, onValueChange, testID, ...props }) =>
  React.createElement('Switch', {
    testID,
    checked: value,
    onChange: (e: any) => onValueChange?.(e.target.checked),
    ...props,
  })
);

// Mock Picker (for dropdowns)
export const Picker = jest.fn(
  ({ children, selectedValue, onValueChange, testID, ...props }) =>
    React.createElement(
      'select',
      {
        testID,
        value: selectedValue,
        onChange: (e: any) => onValueChange?.(e.target.value),
        ...props,
      },
      children
    )
);

(Picker as any).Item = jest.fn(({ label, value }: { label: string; value: any }) =>
  React.createElement('option', { value }, label)
);

// Mock FlatList
export const FlatList = jest.fn(
  ({ data, renderItem, keyExtractor, testID, ...props }) => {
    return React.createElement(
      'FlatList',
      { testID, ...props },
      data?.map((item: any, index: number) => {
        const key = keyExtractor ? keyExtractor(item, index) : index;
        return React.createElement('div', { key }, renderItem({ item, index }));
      })
    );
  }
);

// Mock Button
export const Button = jest.fn(({ title, onPress, testID, ...props }) =>
  React.createElement(
    'Button',
    {
      testID,
      onClick: onPress,
      ...props,
    },
    title
  )
);

// Mock StyleSheet
export const StyleSheet = {
  create: jest.fn((styles) => styles),
  compose: jest.fn((...styles) => Object.assign({}, ...styles)),
  flatten: jest.fn((style) => {
    // Handle array of styles
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
};

// Mock Platform
export const Platform = {
  OS: 'ios',
  Version: 14,
  select: jest.fn((obj) => obj.ios || obj.default),
  isPad: false,
  isTVOS: false,
  isTV: false,
};

// Mock Dimensions
export const Dimensions = {
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
};

// Mock Keyboard
export const Keyboard = {
  dismiss: jest.fn(),
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
};

// Mock Alert
export const Alert = {
  alert: jest.fn((_title: string, _message?: string, buttons?: any[], _options?: any) => {
    if (buttons && buttons.length > 0) {
      // Simulate pressing the first button by default
      const firstButton = buttons[0];
      if (typeof firstButton === 'object' && firstButton.onPress) {
        firstButton.onPress();
      }
    }
  }),
};

// Mock Animated
export const Animated = {
  Value: jest.fn(function (value: number) {
    this.value = value;
    this.setValue = jest.fn((newValue: number) => {
      this.value = newValue;
    });
    this.interpolate = jest.fn((_config: any) => ({
      __getValue: () => this.value,
    }));
    this.addListener = jest.fn();
    this.removeListener = jest.fn();
    this.removeAllListeners = jest.fn();
  }),
  timing: jest.fn(() => ({
    start: jest.fn((callback) => callback && callback({ finished: true })),
    stop: jest.fn(),
    reset: jest.fn(),
  })),
  View: View,
  Text: Text,
  createAnimatedComponent: jest.fn((component) => component),
  event: jest.fn(),
  add: jest.fn((a, b) => a + b),
  subtract: jest.fn((a, b) => a - b),
  multiply: jest.fn((a, b) => a * b),
  divide: jest.fn((a, b) => a / b),
  modulo: jest.fn((a, b) => a % b),
  diffClamp: jest.fn(),
  delay: jest.fn(),
  sequence: jest.fn(),
  parallel: jest.fn(),
  stagger: jest.fn(),
  loop: jest.fn(),
  spring: jest.fn(() => ({
    start: jest.fn((callback) => callback && callback({ finished: true })),
    stop: jest.fn(),
    reset: jest.fn(),
  })),
};

// Mock AccessibilityInfo
export const AccessibilityInfo = {
  isReduceMotionEnabled: jest.fn().mockResolvedValue(false),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  setAccessibilityFocus: jest.fn(),
  announceForAccessibility: jest.fn(),
  isScreenReaderEnabled: jest.fn().mockResolvedValue(false),
  isBoldTextEnabled: jest.fn().mockResolvedValue(false),
  isGrayscaleEnabled: jest.fn().mockResolvedValue(false),
  isInvertColorsEnabled: jest.fn().mockResolvedValue(false),
  isReduceTransparencyEnabled: jest.fn().mockResolvedValue(false),
};

// Export additional utilities
export default {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Switch,
  Picker,
  FlatList,
  Button,
  StyleSheet,
  Platform,
  Dimensions,
  Keyboard,
  Alert,
  Animated,
  AccessibilityInfo,
};
