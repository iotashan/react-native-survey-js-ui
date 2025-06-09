import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ComponentDetailsScreen from '../../src/screens/ComponentDetailsScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { componentCatalog } from '../../src/data/componentCatalog';
import { Survey } from 'react-native-survey-js-ui';

// Mock the Survey component
jest.mock('react-native-survey-js-ui', () => ({
  Survey: jest.fn(() => null),
  useSurveyModel: jest.fn(() => ({
    model: {},
    loading: false,
    error: null,
  })),
}));

const Stack = createStackNavigator();

const renderWithNavigation = (params: any = {}) => {
  const TestNavigator = () => (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="ComponentDetails"
          component={ComponentDetailsScreen}
          initialParams={params}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );

  return render(<TestNavigator />);
};

describe('ComponentDetailsScreen', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render component details correctly', () => {
    const component = componentCatalog[0];
    const { getByText, getByTestId } = renderWithNavigation({
      componentType: component.type,
    });

    expect(getByText(component.name)).toBeTruthy();
    expect(getByText(component.description)).toBeTruthy();
    expect(getByTestId(`component-icon-${component.type}`)).toBeTruthy();
  });

  it('should display properties section', () => {
    const component = componentCatalog.find(c => c.properties && c.properties.length > 0);
    const { getByText, getAllByTestId } = renderWithNavigation({
      componentType: component?.type,
    });

    expect(getByText('Properties')).toBeTruthy();
    const propertyItems = getAllByTestId(/property-item-/);
    expect(propertyItems.length).toBe(component?.properties?.length || 0);
  });

  it('should display tags', () => {
    const component = componentCatalog[0];
    const { getAllByTestId } = renderWithNavigation({
      componentType: component.type,
    });

    const tags = getAllByTestId(/tag-/);
    expect(tags.length).toBe(component.tags.length);
  });

  it('should show live demo for implemented components', async () => {
    const implementedComponents = ['text', 'comment', 'panel'];
    const implementedComponent = componentCatalog.find(c => 
      implementedComponents.includes(c.type)
    );

    const { getByTestId } = renderWithNavigation({
      componentType: implementedComponent?.type,
    });

    await waitFor(() => {
      expect(getByTestId('live-demo-container')).toBeTruthy();
    });

    expect(Survey).toHaveBeenCalled();
  });

  it('should show "Not Implemented Yet" for unimplemented components', () => {
    const unimplementedComponent = componentCatalog.find(c => 
      !['text', 'comment', 'panel'].includes(c.type)
    );

    const { getByText, getByTestId } = renderWithNavigation({
      componentType: unimplementedComponent?.type,
    });

    expect(getByText('Not Implemented Yet')).toBeTruthy();
    expect(getByTestId('json-preview')).toBeTruthy();
  });

  it('should toggle code snippet display', () => {
    const component = componentCatalog[0];
    const { getByText, queryByTestId } = renderWithNavigation({
      componentType: component.type,
    });

    // Code should be hidden initially
    expect(queryByTestId('code-snippet')).toBeNull();

    // Click to show code
    fireEvent.press(getByText('Show Code'));
    expect(queryByTestId('code-snippet')).toBeTruthy();

    // Click to hide code
    fireEvent.press(getByText('Hide Code'));
    expect(queryByTestId('code-snippet')).toBeNull();
  });

  it('should handle unknown component types gracefully', () => {
    const { getByText } = renderWithNavigation({
      componentType: 'unknown-component-type',
    });

    expect(getByText('Component Not Found')).toBeTruthy();
    expect(getByText(/The requested component type/)).toBeTruthy();
  });

  it('should navigate back when back button is pressed', () => {
    const mockGoBack = jest.fn();
    const component = componentCatalog[0];
    
    const { getByTestId } = render(
      <ComponentDetailsScreen
        route={{ params: { componentType: component.type } }}
        navigation={{ goBack: mockGoBack }}
      />
    );

    fireEvent.press(getByTestId('back-button'));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should display JSON configuration example', () => {
    const component = componentCatalog.find(c => c.example);
    const { getByTestId, getByText } = renderWithNavigation({
      componentType: component?.type,
    });

    // Click to show code first
    fireEvent.press(getByText('Show Code'));

    const jsonExample = getByTestId('json-example');
    expect(jsonExample).toBeTruthy();
    
    // Check if JSON content is displayed correctly
    const jsonContent = JSON.stringify(component?.example, null, 2);
    expect(getByText(jsonContent)).toBeTruthy();
  });

  it('should show appropriate demo based on component implementation status', () => {
    // Test for each component type
    const textComponent = componentCatalog.find(c => c.type === 'text');
    const { rerender } = renderWithNavigation({
      componentType: textComponent?.type,
    });

    // Text is implemented, should show live demo
    expect(Survey).toHaveBeenCalled();

    // Test with unimplemented component
    const radioComponent = componentCatalog.find(c => c.type === 'radiogroup');
    rerender(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="ComponentDetails"
            component={ComponentDetailsScreen}
            initialParams={{ componentType: radioComponent?.type }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );

    // Radio is not implemented, should show placeholder
    const { getByText } = renderWithNavigation({
      componentType: radioComponent?.type,
    });
    expect(getByText('Not Implemented Yet')).toBeTruthy();
  });
});