import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ExploreScreen from '../../src/screens/ExploreScreen';
import { QuestionCategory } from '../../src/data/componentCatalog';

describe('ExploreScreen Panel Demo', () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display panel demos in the Layout category', async () => {
    const { getByTestId, getByText, queryByText } = render(
      <ExploreScreen navigation={mockNavigation} />
    );

    // Navigate to Layout category
    const layoutTab = getByTestId('category-tab-Layout');
    fireEvent.press(layoutTab);

    await waitFor(() => {
      // Should see basic panel demo
      expect(queryByText('Basic Panel')).toBeTruthy();
      expect(queryByText('Simple panel with questions')).toBeTruthy();
      
      // Should see nested panel demo
      expect(queryByText('Nested Panels')).toBeTruthy();
      expect(queryByText('Panels within panels demonstration')).toBeTruthy();
      
      // Should see collapsible panel demo
      expect(queryByText('Collapsible Panels')).toBeTruthy();
      expect(queryByText('Expandable and collapsible panel examples')).toBeTruthy();
      
      // Should see styled panel demo
      expect(queryByText('Panel Styling')).toBeTruthy();
      expect(queryByText('Different panel visual styles')).toBeTruthy();
    });
  });

  it('should navigate to panel demo details when panel item is pressed', async () => {
    const { getByTestId } = render(
      <ExploreScreen navigation={mockNavigation} />
    );

    // Navigate to Layout category
    const layoutTab = getByTestId('category-tab-Layout');
    fireEvent.press(layoutTab);

    await waitFor(() => {
      const basicPanelItem = getByTestId('component-item-panel-basic');
      fireEvent.press(basicPanelItem);
    });

    expect(mockNavigation.navigate).toHaveBeenCalledWith('ComponentDetails', {
      componentType: 'panel-basic',
    });
  });

  it('should search for panel demos', async () => {
    const { getByTestId, queryByText } = render(
      <ExploreScreen navigation={mockNavigation} />
    );

    const searchInput = getByTestId('search-input');
    fireEvent.changeText(searchInput, 'panel');

    await waitFor(() => {
      // Should show all panel-related components
      expect(queryByText('Basic Panel')).toBeTruthy();
      expect(queryByText('Nested Panels')).toBeTruthy();
      expect(queryByText('Collapsible Panels')).toBeTruthy();
      expect(queryByText('Panel Styling')).toBeTruthy();
    });
  });

  it('should show panel demo count in Layout category', () => {
    const { getByTestId } = render(
      <ExploreScreen navigation={mockNavigation} />
    );

    const layoutCountBadge = getByTestId('category-count-Layout');
    const countText = layoutCountBadge.findByType('Text');
    
    // Should show at least 4 panel demos
    expect(parseInt(countText.props.children, 10)).toBeGreaterThanOrEqual(4);
  });

  it('should display appropriate tags for panel demos', async () => {
    const { getByTestId } = render(
      <ExploreScreen navigation={mockNavigation} />
    );

    // Navigate to Layout category
    const layoutTab = getByTestId('category-tab-Layout');
    fireEvent.press(layoutTab);

    await waitFor(() => {
      // Check tags for basic panel
      expect(getByTestId('tag-panel-basic-layout')).toBeTruthy();
      expect(getByTestId('tag-panel-basic-container')).toBeTruthy();
      expect(getByTestId('tag-panel-basic-group')).toBeTruthy();
      
      // Check tags for nested panels
      expect(getByTestId('tag-panel-nested-layout')).toBeTruthy();
      expect(getByTestId('tag-panel-nested-hierarchy')).toBeTruthy();
      expect(getByTestId('tag-panel-nested-nested')).toBeTruthy();
      
      // Check tags for collapsible panels
      expect(getByTestId('tag-panel-collapsible-layout')).toBeTruthy();
      expect(getByTestId('tag-panel-collapsible-interactive')).toBeTruthy();
      expect(getByTestId('tag-panel-collapsible-collapsible')).toBeTruthy();
    });
  });
});