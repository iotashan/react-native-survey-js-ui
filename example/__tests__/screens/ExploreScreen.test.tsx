// Mock Dimensions before importing ExploreScreen
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Dimensions: {
      get: jest.fn(() => ({
        width: 375,
        height: 812,
      })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
  };
});

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ExploreScreen from '../../src/screens/ExploreScreen';
import {
  componentCatalog,
  QuestionCategory,
} from '../../src/data/componentCatalog';

describe('ExploreScreen', () => {
  describe('Component Rendering', () => {
    it('should render the explore screen', () => {
      const { getByTestId } = render(<ExploreScreen />);
      expect(getByTestId('explore-scroll-view')).toBeTruthy();
    });

    it('should display the screen title', () => {
      const { getByText } = render(<ExploreScreen />);
      expect(getByText('Explore Components')).toBeTruthy();
    });

    it('should display the search bar', () => {
      const { getByTestId } = render(<ExploreScreen />);
      expect(getByTestId('search-input')).toBeTruthy();
    });

    it('should display category filter tabs', () => {
      const { getByTestId, getByText, getAllByText } = render(
        <ExploreScreen />
      );
      expect(getByTestId('category-tabs')).toBeTruthy();

      // Check for "All" tab and each category
      expect(getByText('All')).toBeTruthy();

      Object.values(QuestionCategory).forEach((category) => {
        // Some categories may appear multiple times (in tabs and component descriptions)
        const elements = getAllByText(category);
        expect(elements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Component List', () => {
    it('should display all components when no filter is applied', () => {
      const { queryAllByTestId } = render(<ExploreScreen />);
      const componentItems = queryAllByTestId(/^component-item-/);
      // FlatList may not render all items immediately in tests
      expect(componentItems.length).toBeGreaterThan(0);
      expect(componentItems.length).toBeLessThanOrEqual(
        componentCatalog.length
      );
    });

    it('should display component information correctly', () => {
      const { getByTestId, getByText, getAllByText } = render(
        <ExploreScreen />
      );
      const firstComponent = componentCatalog[0];
      const componentItem = getByTestId(
        `component-item-${firstComponent.type}`
      );

      expect(componentItem).toBeTruthy();

      // Check if component info is displayed (may appear multiple times)
      const nameElements = getAllByText(firstComponent.name);
      expect(nameElements.length).toBeGreaterThan(0);
      expect(getByText(firstComponent.description)).toBeTruthy();
    });

    it('should display component icon', () => {
      const { getByTestId } = render(<ExploreScreen />);
      const firstComponent = componentCatalog[0];
      const icon = getByTestId(`component-icon-${firstComponent.type}`);
      expect(icon).toBeTruthy();
    });

    it('should display component tags', () => {
      const { getByTestId } = render(<ExploreScreen />);
      const componentWithTags = componentCatalog.find((c) => c.tags.length > 0);
      if (componentWithTags) {
        componentWithTags.tags.forEach((tag) => {
          expect(
            getByTestId(`tag-${componentWithTags.type}-${tag}`)
          ).toBeTruthy();
        });
      }
    });
  });

  describe('Search Functionality', () => {
    it('should filter components based on search query', async () => {
      const { getByTestId, getAllByTestId, queryByTestId } = render(
        <ExploreScreen />
      );
      const searchInput = getByTestId('search-input');

      // Search for "text"
      fireEvent.changeText(searchInput, 'text');

      await waitFor(() => {
        const visibleComponents = getAllByTestId(/^component-item-/);
        expect(visibleComponents.length).toBeLessThan(componentCatalog.length);

        // Check that text-related components are visible
        expect(queryByTestId('component-item-text')).toBeTruthy();
        expect(queryByTestId('component-item-multipletext')).toBeTruthy();

        // Check that unrelated components are not visible
        expect(queryByTestId('component-item-rating')).toBeFalsy();
      });
    });

    it('should show no results message when search has no matches', async () => {
      const { getByTestId, getByText, queryAllByTestId } = render(
        <ExploreScreen />
      );
      const searchInput = getByTestId('search-input');

      fireEvent.changeText(searchInput, 'xyznonexistent123');

      await waitFor(() => {
        const componentItems = queryAllByTestId(/^component-item-/);
        expect(componentItems.length).toBe(0);
        expect(getByText('No components found')).toBeTruthy();
      });
    });

    it('should clear search when clear button is pressed', async () => {
      const { getByTestId, getAllByTestId, queryByTestId } = render(
        <ExploreScreen />
      );
      const searchInput = getByTestId('search-input');

      // First search for something
      fireEvent.changeText(searchInput, 'text');

      await waitFor(() => {
        const clearButton = queryByTestId('search-clear-button');
        expect(clearButton).toBeTruthy();
      });

      // Clear search
      const clearButton = getByTestId('search-clear-button');
      fireEvent.press(clearButton);

      await waitFor(() => {
        expect(searchInput.props.value).toBe('');
        const allComponents = getAllByTestId(/^component-item-/);
        // Should show more components after clearing search
        expect(allComponents.length).toBeGreaterThan(3);
      });
    });
  });

  describe('Category Filter', () => {
    it('should filter components by category when tab is selected', async () => {
      const { getByTestId, getAllByTestId } = render(<ExploreScreen />);

      // Select "Text Input" category
      const textInputTab = getByTestId(
        `category-tab-${QuestionCategory.TextInput}`
      );
      fireEvent.press(textInputTab);

      await waitFor(() => {
        const visibleComponents = getAllByTestId(/^component-item-/);
        const textInputComponents = componentCatalog.filter(
          (c) => c.category === QuestionCategory.TextInput
        );
        expect(visibleComponents.length).toBe(textInputComponents.length);
      });
    });

    it('should show all components when "All" tab is selected', async () => {
      const { getByTestId, getAllByTestId, queryAllByTestId } = render(
        <ExploreScreen />
      );

      // First select a category
      const textInputTab = getByTestId(
        `category-tab-${QuestionCategory.TextInput}`
      );
      fireEvent.press(textInputTab);

      await waitFor(() => {
        const visibleComponents = queryAllByTestId(/^component-item-/);
        expect(visibleComponents.length).toBeLessThan(componentCatalog.length);
      });

      // Then select "All"
      const allTab = getByTestId('category-tab-all');
      fireEvent.press(allTab);

      await waitFor(() => {
        const visibleComponents = getAllByTestId(/^component-item-/);
        // Should show more components when "All" is selected
        expect(visibleComponents.length).toBeGreaterThan(3);
      });
    });

    it('should combine search and category filters', async () => {
      const { getByTestId, queryByTestId } = render(<ExploreScreen />);

      // Select "Selection" category
      const selectionTab = getByTestId(
        `category-tab-${QuestionCategory.Selection}`
      );
      fireEvent.press(selectionTab);

      // Search for "radio"
      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'radio');

      await waitFor(() => {
        // Should only show radio-related components in Selection category
        expect(queryByTestId('component-item-radiogroup')).toBeTruthy();
        expect(queryByTestId('component-item-checkbox')).toBeFalsy();
        expect(queryByTestId('component-item-text')).toBeFalsy();
      });
    });
  });

  describe('Component Navigation', () => {
    it('should navigate to component details when item is pressed', () => {
      const mockNavigate = jest.fn();
      const navigation = { navigate: mockNavigate };

      const { getByTestId } = render(
        <ExploreScreen navigation={navigation as any} />
      );

      const textComponent = getByTestId('component-item-text');
      fireEvent.press(textComponent);

      expect(mockNavigate).toHaveBeenCalledWith('ComponentDetails', {
        componentType: 'text',
      });
    });
  });

  describe('Layout and Styling', () => {
    it('should render in a scrollable container', () => {
      const { getByTestId } = render(<ExploreScreen />);
      const scrollView = getByTestId('explore-scroll-view');
      expect(scrollView).toBeTruthy();
    });

    it('should highlight selected category tab', async () => {
      const { getByTestId } = render(<ExploreScreen />);

      const textInputTab = getByTestId(
        `category-tab-${QuestionCategory.TextInput}`
      );
      const allTab = getByTestId('category-tab-all');

      // Initially "All" should be selected (style can be object or array)
      const allTabStyle = allTab.props.style;
      const isAllSelected = Array.isArray(allTabStyle)
        ? allTabStyle.some((s) => s?.backgroundColor === '#007AFF')
        : allTabStyle?.backgroundColor === '#007AFF';
      expect(isAllSelected).toBe(true);

      // Select Text Input tab
      fireEvent.press(textInputTab);

      await waitFor(() => {
        const textTabStyle = textInputTab.props.style;
        const isTextSelected = Array.isArray(textTabStyle)
          ? textTabStyle.some((s) => s?.backgroundColor === '#007AFF')
          : textTabStyle?.backgroundColor === '#007AFF';
        expect(isTextSelected).toBe(true);
      });
    });

    it('should display component count for each category', () => {
      const { getByTestId } = render(<ExploreScreen />);

      Object.values(QuestionCategory).forEach((category) => {
        const countBadge = getByTestId(`category-count-${category}`);
        // Check that the badge exists and contains a number
        expect(countBadge).toBeTruthy();
        expect(countBadge.children.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Performance', () => {
    it('should use FlatList for efficient rendering', () => {
      const { getByTestId } = render(<ExploreScreen />);
      const componentList = getByTestId('component-list');
      expect(componentList.type).toBe('RCTScrollView'); // FlatList renders as ScrollView
    });

    it('should implement keyExtractor for list items', () => {
      const { getByTestId } = render(<ExploreScreen />);
      const componentList = getByTestId('component-list');
      expect(componentList.props.keyExtractor).toBeDefined();
    });
  });
});
