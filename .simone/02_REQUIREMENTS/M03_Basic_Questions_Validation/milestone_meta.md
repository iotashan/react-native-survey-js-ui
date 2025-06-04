# M03: Basic Question Types + Full Validation

## Overview
Implement the foundational question types (text input, radio buttons, checkboxes) with comprehensive validation integration. Establish patterns for question rendering and validation that will be extended to all future question types.

## Success Criteria
- [ ] Text input questions fully functional
- [ ] Radio button questions working with single selection
- [ ] Checkbox questions working with multi-selection
- [ ] Full validation system integrated with all question types
- [ ] Real-time and on-submit validation modes working
- [ ] Question-level styling and theming foundation
- [ ] All tests passing with >90% code coverage

## Deliverables

### 1. Text Input Question Component
- TextInput question type implementation
- Support for: placeholder, maxLength, inputType, readOnly
- Input validation (required, minLength, maxLength, patterns)
- Keyboard type selection (email, numeric, etc.)
- Accessibility labels and hints

### 2. Radio Button Question Component  
- Single selection radio button implementation
- Choice list rendering from survey-core
- Custom styling for radio buttons
- Selection state management
- Required field validation

### 3. Checkbox Question Component
- Multi-selection checkbox implementation
- Support for hasSelectAll, colCount options
- Individual checkbox styling
- Selection validation (min/max selections)
- Select all/none functionality

### 4. Complete Validation System
- Field-level validation with real-time feedback
- Form-level validation on submit
- Custom validation messages
- Validation state visual indicators
- Error message positioning and styling

### 5. Question Base Architecture
- BaseQuestion component with common functionality
- Question wrapper with label, description, error display
- Question type registration system
- Common styling and theming interface
- Accessibility foundation for all questions

### 6. Sample App Enhancements
- Survey tab with working basic questions
- Explore tab showcasing all question variations
- Validation demo screens
- Error state demonstrations

## Technical Requirements

### New Dependencies
- `@react-native-community/checkbox`
- `react-native-radio-buttons-group` or custom implementation
- Input masking utilities for text validation

### Components to Implement
```
src/components/
├── Questions/
│   ├── BaseQuestion/
│   │   ├── BaseQuestion.tsx
│   │   ├── QuestionLabel.tsx
│   │   ├── QuestionDescription.tsx
│   │   └── __tests__/
│   ├── TextInput/
│   │   ├── TextInputQuestion.tsx
│   │   └── __tests__/
│   ├── RadioGroup/
│   │   ├── RadioGroupQuestion.tsx
│   │   ├── RadioOption.tsx
│   │   └── __tests__/
│   ├── Checkbox/
│   │   ├── CheckboxQuestion.tsx
│   │   ├── CheckboxOption.tsx
│   │   └── __tests__/
├── Validation/
│   ├── ValidationMessage.tsx
│   ├── ValidationIndicator.tsx
│   └── __tests__/
```

### Question Type Registration
- QuestionFactory for type mapping
- Dynamic question component loading
- Type-specific prop validation
- Error handling for unknown question types

### Validation Features
- Required field validation
- Text length validation (min/max)
- Pattern matching (email, phone, etc.)
- Custom validation rules
- Async validation support
- Cross-field validation foundation

## Definition of Done
- [ ] All code follows TDD approach (tests written first)
- [ ] >90% test coverage for all question components
- [ ] Text, radio, and checkbox questions working in sample app
- [ ] Validation working in both real-time and on-submit modes
- [ ] Error messages displaying correctly
- [ ] Accessibility features implemented
- [ ] Performance benchmarks maintained
- [ ] Documentation updated with question usage examples

## Dependencies
- M02: Page & Panel Layout + Basic Validation (must be completed)

## Estimated Timeline
3-4 weeks including comprehensive testing, validation system, and sample app updates