# M04: Intermediate Questions + Basic Theming

## Overview
Implement intermediate complexity question types and establish the theming system. Focus on dropdown, date/time, HTML/text, and rating questions while building the foundation for SurveyJS theme compatibility.

## Success Criteria
- [ ] Dropdown questions fully functional with choice management
- [ ] Date/time picker questions working across platforms
- [ ] HTML/text display questions rendering properly
- [ ] Rating scale questions implemented
- [ ] Basic theme system parsing SurveyJS CSS variables
- [ ] Component styling respecting theme settings
- [ ] All tests passing with >90% code coverage

## Deliverables

### 1. Dropdown Question Component
- Dropdown/select question implementation
- Integration with `@react-native-picker/picker`
- Choice list management and search
- Placeholder and default value support
- Platform-specific styling

### 2. Date/Time Question Component
- Date picker using `@react-native-community/datetimepicker`
- Time picker functionality
- Date/time formatting options
- Min/max date constraints
- Platform-specific behavior handling

### 3. HTML/Text Display Component
- Static HTML content rendering with `react-native-render-html`
- Markdown support foundation
- Image and link handling
- Text styling and formatting
- Scrollable content areas

### 4. Rating Question Component
- Star rating implementation
- Numeric scale ratings
- Custom rating icons and colors
- Rating value display options
- Touch/gesture handling

### 5. Basic Theming System
- SurveyJS CSS variable parser
- Theme JSON to StyleSheet conversion
- Component theming architecture
- Default light/dark themes
- Theme provider context system

### 6. Responsive Layout Foundation
- Flexbox-based responsive components
- Screen size adaptation
- Orientation change handling
- Platform-specific adjustments

## Technical Requirements

### New Dependencies
- `@react-native-picker/picker`
- `@react-native-community/datetimepicker`
- `react-native-render-html`
- `react-native-ratings`
- Theme parsing utilities

### Components to Implement
```
src/components/
├── Questions/
│   ├── Dropdown/
│   │   ├── DropdownQuestion.tsx
│   │   ├── DropdownPicker.tsx
│   │   └── __tests__/
│   ├── DateTime/
│   │   ├── DateTimeQuestion.tsx
│   │   ├── DatePicker.tsx
│   │   ├── TimePicker.tsx
│   │   └── __tests__/
│   ├── HtmlText/
│   │   ├── HtmlTextQuestion.tsx
│   │   ├── HtmlRenderer.tsx
│   │   └── __tests__/
│   ├── Rating/
│   │   ├── RatingQuestion.tsx
│   │   ├── StarRating.tsx
│   │   ├── NumericRating.tsx
│   │   └── __tests__/
├── Theming/
│   ├── ThemeProvider.tsx
│   ├── ThemeParser.tsx
│   ├── StyleManager.tsx
│   └── __tests__/
```

### Theming Architecture
- CSS variable mapping to React Native styles
- Component-specific theme overrides
- Dynamic theme switching
- Theme validation and fallbacks
- Style caching for performance

### Platform Considerations
- iOS/Android picker differences
- Date/time picker platform variations
- HTML rendering limitations
- Touch target sizing

## Definition of Done
- [ ] All code follows TDD approach (tests written first)
- [ ] >90% test coverage for all new components
- [ ] Dropdown, date/time, HTML, and rating questions working
- [ ] Basic theming applied to all existing components
- [ ] Theme switching demonstrated in sample app
- [ ] Platform testing completed (iOS/Android)
- [ ] Performance benchmarks maintained
- [ ] Accessibility features implemented

## Dependencies
- M03: Basic Question Types + Full Validation (must be completed)

## Estimated Timeline
3-4 weeks including comprehensive testing, theming system, and cross-platform validation