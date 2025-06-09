import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ExploreStackNavigator from '../../src/navigation/ExploreStackNavigator';
import { componentCatalog } from '../../src/data/componentCatalog';

// Mock the Survey component
jest.mock('react-native-survey-js-ui', () => ({
  Survey: jest.fn(() => null),
  useSurveyModel: jest.fn(() => ({
    model: {},
    loading: false,
    error: null,
  })),
}));

describe('Explore Navigation Integration', () => {
  it('should navigate from Explore to ComponentDetails when a component is pressed', async () => {
    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <ExploreStackNavigator />
      </NavigationContainer>
    );

    // Wait for the explore screen to load
    await waitFor(() => {
      expect(getByText('Explore Components')).toBeTruthy();
    });

    // Find and press the first component
    const firstComponent = componentCatalog[0];
    const componentItem = getByTestId(`component-item-${firstComponent.type}`);
    
    fireEvent.press(componentItem);

    // Wait for navigation to ComponentDetails
    await waitFor(() => {
      expect(getByText(firstComponent.name)).toBeTruthy();
      expect(getByText(firstComponent.description)).toBeTruthy();
    });

    // Verify we can see component details
    expect(getByTestId(`component-icon-${firstComponent.type}`)).toBeTruthy();
  });

  it('should navigate back from ComponentDetails to Explore', async () => {
    const { getByTestId, getByText, queryByText } = render(
      <NavigationContainer>
        <ExploreStackNavigator />
      </NavigationContainer>
    );

    // Navigate to a component
    const component = componentCatalog[0];
    fireEvent.press(getByTestId(`component-item-${component.type}`));

    // Wait for component details to load
    await waitFor(() => {
      expect(getByText(component.name)).toBeTruthy();
    });

    // Press back button
    fireEvent.press(getByTestId('back-button'));

    // Should be back on Explore screen
    await waitFor(() => {
      expect(getByText('Explore Components')).toBeTruthy();
      expect(queryByText('← Back')).toBeNull();
    });
  });

  it('should show correct content for implemented vs unimplemented components', async () => {
    const { getByTestId, getByText, queryByText } = render(
      <NavigationContainer>
        <ExploreStackNavigator />
      </NavigationContainer>
    );

    // Test implemented component (text)
    const textComponent = componentCatalog.find(c => c.type === 'text');
    fireEvent.press(getByTestId(`component-item-${textComponent?.type}`));

    await waitFor(() => {
      expect(getByText('Live Demo')).toBeTruthy();
      expect(getByTestId('live-demo-container')).toBeTruthy();
    });

    // Go back
    fireEvent.press(getByTestId('back-button'));

    // Test unimplemented component (radiogroup)
    const radioComponent = componentCatalog.find(c => c.type === 'radiogroup');
    fireEvent.press(getByTestId(`component-item-${radioComponent?.type}`));

    await waitFor(() => {
      expect(getByText('Preview')).toBeTruthy();
      expect(getByText('Not Implemented Yet')).toBeTruthy();
      expect(queryByText('Live Demo')).toBeNull();
    });
  });

  it('should properly filter components and navigate to filtered results', async () => {
    const { getByTestId, getByText, getAllByTestId } = render(
      <NavigationContainer>
        <ExploreStackNavigator />
      </NavigationContainer>
    );

    // Wait for explore screen
    await waitFor(() => {
      expect(getByText('Explore Components')).toBeTruthy();
    });

    // Select Input category
    fireEvent.press(getByTestId('category-tab-Input'));

    // Get input components
    const inputComponents = getAllByTestId(/component-item-/);
    
    // Press the first input component
    fireEvent.press(inputComponents[0]);

    // Should navigate to component details
    await waitFor(() => {
      expect(getByTestId('back-button')).toBeTruthy();
    });
  });
});