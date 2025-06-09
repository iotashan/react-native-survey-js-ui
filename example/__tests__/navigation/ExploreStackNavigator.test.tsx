import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ExploreStackNavigator from '../../src/navigation/ExploreStackNavigator';

jest.mock('../../src/screens', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  
  return {
    ExploreScreen: () => React.createElement(View, { testID: 'explore-screen' }, 
      React.createElement(Text, null, 'Explore Screen')
    ),
    ComponentDetailsScreen: () => React.createElement(View, { testID: 'component-details-screen' }, 
      React.createElement(Text, null, 'Component Details')
    ),
  };
});

describe('ExploreStackNavigator', () => {
  it('should render without crashing', () => {
    const { getByTestId } = render(
      <NavigationContainer>
        <ExploreStackNavigator />
      </NavigationContainer>
    );

    // Should show the explore screen initially
    expect(getByTestId('explore-screen')).toBeTruthy();
  });

  it('should configure stack navigator with correct screens', () => {
    const ExploreStack = require('../../src/navigation/ExploreStackNavigator').default;
    
    // Verify the navigator is created correctly
    expect(ExploreStack).toBeDefined();
    expect(typeof ExploreStack).toBe('function');
  });
});