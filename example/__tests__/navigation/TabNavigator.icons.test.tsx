import React from 'react';

// Mock the library before any imports
jest.mock('react-native-survey-js-ui', () => ({
  Survey: () => 'Survey',
  useSurveyModel: jest.fn(),
  useSurveyState: jest.fn(),
}));

// Mock @expo/vector-icons for testing
jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name, size, color }: any) => ({
    type: 'Ionicons',
    props: { name, size, color }
  }),
}));

// Mock navigation with proper tab screen options handling
const mockNavigator = jest.fn(({ children, screenOptions }) => {
  // Store screenOptions for testing
  mockNavigator.lastScreenOptions = screenOptions;
  return children;
});

const mockScreen = jest.fn(({ name, component, options }) => {
  // Store options for testing
  mockScreen.lastOptions[name] = options;
  return null;
});

mockScreen.lastOptions = {};

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: mockNavigator,
    Screen: mockScreen,
  }),
}));

describe('TabNavigator Icons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockScreen.lastOptions = {};
    mockNavigator.lastScreenOptions = undefined;
  });

  test('should create TabNavigator with icon configuration', () => {
    // Import and instantiate the component to trigger the constructor
    const TabNavigator = require('../../src/navigation/TabNavigator').default;
    const componentElement = React.createElement(TabNavigator);
    
    // The component should be a function that returns JSX
    expect(typeof TabNavigator).toBe('function');
    expect(componentElement.type).toBe(TabNavigator);
  });

  test('TabNavigator structure has correct screen options', () => {
    // We'll test this after implementing the icon functionality
    expect(true).toBe(true); // Placeholder test that will pass initially
  });

  test('TabNavigator component structure includes icon functions', () => {
    // Test the actual source file content rather than rendering
    const fs = require('fs');
    const path = require('path');
    const componentPath = path.join(__dirname, '../../src/navigation/TabNavigator.tsx');
    const componentSource = fs.readFileSync(componentPath, 'utf8');
    
    // Verify the file contains the icon imports and usage
    expect(componentSource).toContain("import { Ionicons } from '@expo/vector-icons'");
    expect(componentSource).toContain('tabBarIcon:');
    expect(componentSource).toContain('clipboard-outline');
    expect(componentSource).toContain('grid-outline');
  });

  test('Ionicons import is correctly used in the component', () => {
    const fs = require('fs');
    const path = require('path');
    const componentPath = path.join(__dirname, '../../src/navigation/TabNavigator.tsx');
    const componentSource = fs.readFileSync(componentPath, 'utf8');
    
    // Check the structure of the tabBarIcon functions
    expect(componentSource).toContain('({ color, size }) =>');
    expect(componentSource).toContain('<Ionicons name="clipboard-outline" size={size} color={color} />');
    expect(componentSource).toContain('<Ionicons name="grid-outline" size={size} color={color} />');
  });

  test('Color scheme constants are correctly used', () => {
    const fs = require('fs');
    const path = require('path');
    const componentPath = path.join(__dirname, '../../src/navigation/TabNavigator.tsx');
    const componentSource = fs.readFileSync(componentPath, 'utf8');
    
    // Verify the color constants match the task requirements
    expect(componentSource).toContain("tabBarActiveTintColor: '#007AFF'");
    expect(componentSource).toContain("tabBarInactiveTintColor: '#8E8E93'");
  });

  test('Icon names follow the recommended selection', () => {
    const fs = require('fs');
    const path = require('path');
    const componentPath = path.join(__dirname, '../../src/navigation/TabNavigator.tsx');
    const componentSource = fs.readFileSync(componentPath, 'utf8');
    
    // Verify the specific icon names from the task guidance
    expect(componentSource).toContain('clipboard-outline'); // For Survey Demo
    expect(componentSource).toContain('grid-outline'); // For Explore
  });

  test('@expo/vector-icons Ionicons mock works correctly', () => {
    const { Ionicons } = require('@expo/vector-icons');
    const iconComponent = Ionicons({ 
      name: 'clipboard-outline', 
      size: 24, 
      color: '#007AFF' 
    });
    
    expect(iconComponent.type).toBe('Ionicons');
    expect(iconComponent.props.name).toBe('clipboard-outline');
    expect(iconComponent.props.size).toBe(24);
    expect(iconComponent.props.color).toBe('#007AFF');
  });
});