# Panel Layout System

The Panel Layout System provides responsive, theme-able styling for survey panels in React Native with support for nested hierarchies, orientation changes, and mobile-optimized layouts.

## Features

- **Responsive Design**: Automatically adapts to different screen sizes
- **Nested Panel Support**: Visual hierarchy through indentation and styling
- **Theme Support**: Customizable colors, spacing, and appearance
- **RTL Support**: Right-to-left language layouts
- **Performance Optimized**: Memoized style calculations and efficient rendering
- **Orientation Aware**: Responds to device orientation changes

## Basic Usage

```tsx
import { Panel } from 'react-native-survey-js-ui';

// Basic panel
<Panel panel={panelModel} />

// Collapsible panel with custom styling
<Panel 
  panel={panelModel}
  collapsible={true}
  style={{ marginTop: 20 }}
/>

// Themed panel with RTL support
<Panel 
  panel={panelModel}
  theme={{
    primaryColor: '#1976d2',
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0'
  }}
  isRTL={true}
/>
```

## Styling System

### Responsive Breakpoints

The system automatically adjusts spacing and layout based on screen size:

- **Small** (< 375px): Reduced spacing for compact screens
- **Medium** (375px - 768px): Standard mobile layout
- **Large** (≥ 768px): Tablet-optimized spacing

### Nested Panel Styling

Nested panels receive automatic visual hierarchy through:

1. **Indentation**: Progressive left margin (or right for RTL)
2. **Visual Indicators**: Border accent for nested levels
3. **Background Variation**: Subtle background color changes
4. **Reduced Elevation**: Lower shadow/elevation for nested panels

```tsx
// Nested panels automatically receive appropriate styling
<Panel panel={parentPanel} nestingLevel={0}>
  <Panel panel={childPanel} nestingLevel={1}>
    <Panel panel={grandchildPanel} nestingLevel={2} />
  </Panel>
</Panel>
```

### Theme Customization

```tsx
interface PanelTheme {
  primaryColor?: string;      // Main accent color
  backgroundColor?: string;   // Panel background
  borderColor?: string;       // Panel border
  textColor?: string;         // Text color
  shadowColor?: string;       // Shadow color
  nestedBorderColor?: string; // Nested panel accent
}

// Example theme
const darkTheme: PanelTheme = {
  backgroundColor: '#1e1e1e',
  borderColor: '#444',
  textColor: '#ffffff',
  shadowColor: '#000',
  nestedBorderColor: '#4a90e2'
};
```

### Advanced Styling

#### Custom Style Configuration

```tsx
import { getPanelContainerStyle, PanelStyleConfig } from 'react-native-survey-js-ui';

const config: PanelStyleConfig = {
  theme: {
    primaryColor: '#ff5722',
    backgroundColor: '#fafafa'
  },
  spacing: {
    small: 4,
    medium: 12,
    large: 20
  },
  isRTL: true
};

const customStyles = getPanelContainerStyle({
  nestingLevel: 1,
  config,
  customStyle: { borderWidth: 2 }
});
```

#### Orientation Handling

```tsx
import { setupOrientationListener, removeOrientationListener } from 'react-native-survey-js-ui';

// Setup listener in component
useEffect(() => {
  const handleOrientationChange = () => {
    // Re-render or update layout
  };
  
  setupOrientationListener(handleOrientationChange);
  
  return () => {
    removeOrientationListener();
  };
}, []);
```

## Performance Considerations

The styling system is optimized for performance:

1. **Style Memoization**: Computed styles are cached
2. **Efficient Re-renders**: Only updates on relevant prop changes
3. **Optimized Nesting**: Maximum indentation caps prevent excessive nesting
4. **Lightweight Calculations**: Minimal runtime overhead

## Accessibility

Panels include proper accessibility features:

- Semantic structure for screen readers
- Proper focus management for collapsible panels
- Clear visual hierarchy for cognitive accessibility
- High contrast borders and shadows

## Examples

### Survey with Multiple Panels

```tsx
const SurveyExample = () => {
  const survey = new Model({
    pages: [{
      elements: [{
        type: "panel",
        name: "demographics",
        title: "Demographics",
        elements: [
          { type: "text", name: "name", title: "Name" },
          { type: "text", name: "age", title: "Age" }
        ]
      }, {
        type: "panel",
        name: "preferences",
        title: "Preferences",
        elements: [
          { type: "radiogroup", name: "color", title: "Favorite Color" }
        ]
      }]
    }]
  });

  return <Survey model={survey} />;
};
```

### Custom Themed Panel

```tsx
const ThemedSurvey = () => {
  const customTheme = {
    primaryColor: '#6200ea',
    backgroundColor: '#f3e5f5',
    borderColor: '#ce93d8',
    nestedBorderColor: '#ab47bc'
  };

  return (
    <Panel 
      panel={panelModel}
      theme={customTheme}
      collapsible={true}
    />
  );
};
```