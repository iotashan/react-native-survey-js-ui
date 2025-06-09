# E2E Test IDs Documentation

This document lists all the test IDs available in the example app for automated E2E testing.

## Navigation Components

### Tab Navigation
- `main-tab-bar` - Main tab bar container
- `tab-survey-demo` - Survey Demo tab button
- `tab-explore` - Explore Components tab button

## Survey Demo Screen

### Main Elements
- `survey-demo-screen` - Main screen container
- `survey-demo-scroll` - ScrollView container
- `header-section` - Header section
- `screen-title` - "Survey Demo" title
- `screen-subtitle` - Screen subtitle

### Example Selector
- `example-selector-section` - Example selector container
- `current-example-label` - "Current Example:" label
- `example-selector-button` - Button to open example selector
- `selected-example-info` - Currently selected example info container
- `selected-example-title` - Selected example title
- `selected-example-description` - Selected example description
- `selector-chevron` - Dropdown chevron

### Validation Status
- `validation-status` - Validation status container
- `validation-status-text` - Validation status text
- `validation-error-text` - Validation error message (when invalid)

### Action Buttons
- `action-buttons-container` - Action buttons container
- `show-code-button` - Show/Hide JSON model button
- `show-code-button-text` - Show code button text
- `reset-survey-button` - Reset survey button (when survey completed)
- `reset-button-text` - Reset button text

### Code Display
- `code-container` - JSON model container (when visible)
- `code-title` - "Survey JSON Model:" title

## Explore Screen

### Main Elements
- `explore-scroll-view` - Main ScrollView
- `search-input` - Component search input
- `search-clear-button` - Clear search button

### Category Tabs
- `category-tabs` - Category tabs container
- `category-tab-{category}` - Individual category tab (e.g., `category-tab-all`, `category-tab-Input`)
- `category-count-{category}` - Component count badge for category

### Component List
- `component-list` - FlatList of components
- `component-item-{type}` - Individual component item (e.g., `component-item-text`)
- `component-icon-{type}` - Component icon
- `tag-{type}-{tag}` - Component tags (e.g., `tag-text-input`)

## Component Details Screen

### Main Elements
- `component-details-screen` - Main screen container
- `component-details-scroll` - ScrollView container
- `component-details-error` - Error screen container (when component not found)

### Header
- `header-section` - Header section
- `back-button` - Back navigation button
- `back-button-text` - Back button text

### Component Info
- `component-info-section` - Component info container
- `component-header` - Component header with icon and title
- `component-icon-{type}` - Component icon
- `component-title-container` - Title container
- `component-name` - Component name
- `component-type` - Component type
- `component-description` - Component description

### Tags
- `tags-container` - Tags container
- `tag-{tag}` - Individual tag (e.g., `tag-input`)
- `tag-text-{tag}` - Tag text

### Demo Section
- `demo-section` - Demo section container
- `demo-section-title` - "Live Demo" or "Preview" title
- `live-demo-container` - Live demo container (for implemented components)
- `survey-demo` - Survey component
- `placeholder-container` - Placeholder container (for unimplemented components)
- `not-implemented-badge` - "Not Implemented Yet" badge
- `not-implemented-text` - Badge text
- `placeholder-description` - Placeholder description
- `json-preview` - JSON preview container
- `json-text` - JSON text content

### Loading/Error States
- `demo-loading` - Loading container
- `loading-text` - Loading text
- `demo-error` - Error container
- `demo-error-text` - Error message

### Properties Section
- `properties-section` - Properties section container
- `properties-section-title` - "Properties" title
- `properties-list` - Properties list container
- `property-item-{name}` - Individual property item
- `property-header-{name}` - Property header
- `property-name-{name}` - Property name
- `property-type-{name}` - Property type
- `property-required-{name}` - Required badge container
- `property-required-text-{name}` - Required badge text
- `property-desc-{name}` - Property description
- `property-default-{name}` - Default value
- `property-options-{name}` - Options list

### Code Section
- `code-section` - Code section container
- `code-toggle-button` - Show/Hide code button
- `code-toggle-text` - Toggle button text
- `code-snippet` - Code snippet container (when visible)
- `code-title` - "JSON Configuration:" title
- `json-example` - JSON example container
- `json-code-text` - JSON code text

### Error States
- `error-container` - Error container
- `error-title` - "Component Not Found" title
- `error-message` - Error message with component type

## Usage Example

```javascript
// Cypress example
describe('Component Details Navigation', () => {
  it('should navigate to component details', () => {
    // Navigate to Explore tab
    cy.get('[data-testid="tab-explore"]').click();
    
    // Search for a component
    cy.get('[data-testid="search-input"]').type('text');
    
    // Click on text input component
    cy.get('[data-testid="component-item-text"]').click();
    
    // Verify we're on component details
    cy.get('[data-testid="component-details-screen"]').should('exist');
    cy.get('[data-testid="component-name"]').should('contain', 'Text Input');
    
    // Toggle code display
    cy.get('[data-testid="code-toggle-button"]').click();
    cy.get('[data-testid="json-example"]').should('be.visible');
    
    // Navigate back
    cy.get('[data-testid="back-button"]').click();
    cy.get('[data-testid="explore-scroll-view"]').should('exist');
  });
});
```

## Best Practices

1. **Consistent Naming**: Test IDs follow a kebab-case convention
2. **Hierarchical Structure**: IDs reflect the component hierarchy
3. **Dynamic IDs**: For lists, IDs include the item identifier (e.g., `component-item-${type}`)
4. **Accessibility**: Important interactive elements also include `accessibilityLabel`
5. **Unique IDs**: Each test ID is unique within the screen context

## Maintenance

When adding new components or screens:
1. Add test IDs to all interactive elements
2. Add test IDs to key containers for layout testing
3. Include dynamic parts in IDs for list items
4. Update this documentation
5. Consider adding accessibility labels for better test readability