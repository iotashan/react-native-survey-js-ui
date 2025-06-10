---
task_id: T010
sprint_sequence_id: null
status: open
complexity: High
last_updated: 2025-06-09T23:07:57Z
---

# Task: Implement Panel Validation Error Display

## Description
Implement comprehensive validation error display functionality for Panel components. This task focuses on making validation errors visible at the panel level, including error indicators in panel headers when panels contain questions with validation errors. This enhances the user experience by providing clear visual feedback about which panels contain invalid fields, especially important for collapsed panels where errors might otherwise be hidden.

## Goal / Objectives
Create a robust validation error display system for panels that:
- Shows validation error indicators in panel headers when the panel contains invalid questions
- Provides visual feedback to identify panels with validation errors
- Ensures panels automatically expand or show indicators when they contain errors
- Integrates seamlessly with the existing ValidationContext and Panel components
- Supports nested panel hierarchies with proper error propagation
- Includes proper testIDs for validation state testing

## Acceptance Criteria
- [ ] Panel headers display error indicators when containing questions with validation errors
- [ ] Error indicators show the count of errors within the panel
- [ ] Collapsed panels with errors have visual indicators in their headers
- [ ] Nested panels properly propagate error states to parent panels
- [ ] Error indicators update dynamically as validation state changes
- [ ] Panels can optionally auto-expand when containing validation errors
- [ ] Visual error states are accessible with proper ARIA attributes
- [ ] TestIDs are added for all validation state elements
- [ ] Error display works with both real-time and on-submit validation modes
- [ ] All new code has >90% test coverage

## TDD Requirements (FOR ALL CODING TASKS)
**CRITICAL**: All development must follow Test-Driven Development approach:
- [ ] Write failing tests first (describe expected behavior)
- [ ] Implement minimal code to make tests pass
- [ ] Refactor while keeping tests green
- [ ] Achieve >90% code coverage for all new code
- [ ] No code implementation without corresponding test coverage

## Simulator Verification (FOR ALL TASKS)
**MANDATORY**: After completing any task, perform simulator verification:
- [ ] Kill the app in the simulator
- [ ] Kill metro process (use `kill` command, not control-c)
- [ ] Run `pnpm start` (or `pnpm run:ios` if native code changed)
- [ ] Open the app in the simulator
- [ ] Confirm no catastrophic changes occurred
- [ ] If task was UI-facing, manually test the implemented functionality
- [ ] Verify app loads and functions correctly

## Technical Guidance

### Key Interfaces and Integration Points
- **Panel Component** (`src/components/Panel/Panel.tsx`): Main panel component that needs error state handling
- **PanelHeader Component** (`src/components/Panel/PanelHeader.tsx`): Needs error indicator display
- **ValidationContext** (`src/contexts/ValidationContext.tsx`): Source of validation error state
- **PanelStateContext** (`src/components/Panel/PanelStateContext.tsx`): May need extension for error state
- **ValidationError Component** (`src/components/ValidationError/ValidationError.tsx`): Reference for error display patterns

### Specific Imports and Module References
```typescript
import { useValidation } from '../../contexts/ValidationContext';
import { Panel, PanelProps } from './Panel';
import { PanelHeader, PanelHeaderProps } from './PanelHeader';
import { usePanelStateContext } from './PanelStateContext';
import type { PanelModel, Question } from 'survey-core';
```

### Existing Patterns to Follow
- Hook-based state management pattern used in ValidationContext
- Component composition pattern in Panel/PanelHeader relationship
- TestID naming convention: `panel-${panel.name}-error-indicator`
- Style configuration pattern in panelStyles.ts
- Accessibility patterns from ValidationError component

### Error Handling Approach
- Gracefully handle cases where ValidationContext is not available
- Handle null/undefined panel models
- Support panels without questions (nested panels only)
- Ensure error counts are accurate for visible questions only
- Handle dynamic question visibility changes

## Implementation Notes

### Step-by-Step Implementation Approach
1. **Create usePanelValidation hook**
   - Extract validation state for panel's questions
   - Calculate error count for panel including nested panels
   - Handle real-time updates from ValidationContext
   - Support memoization for performance

2. **Extend PanelHeader for error display**
   - Add error indicator prop and rendering
   - Style error badge/icon appropriately
   - Add animation for error state changes
   - Include accessibility attributes

3. **Update Panel component**
   - Integrate usePanelValidation hook
   - Pass error state to PanelHeader
   - Add auto-expand functionality for panels with errors
   - Handle nested panel error aggregation

4. **Add visual error indicators**
   - Create error badge component
   - Style according to design system
   - Support themes and RTL
   - Add proper testIDs

5. **Implement comprehensive tests**
   - Unit tests for usePanelValidation hook
   - Integration tests for Panel with validation
   - Visual regression tests for error states
   - Accessibility tests for error indicators

### Key Architectural Decisions to Respect
- Maintain separation of concerns between validation logic and UI
- Use React hooks for state management consistency
- Follow existing context patterns for state propagation
- Ensure performance with proper memoization
- Support the library's theming system

### Testing Approach
- Test error indicator visibility based on validation state
- Test error count accuracy with multiple invalid questions
- Test nested panel error propagation
- Test dynamic updates when validation state changes
- Test auto-expand functionality
- Test accessibility of error indicators
- Test integration with both validation modes

### Performance Considerations
- Memoize error calculations to prevent unnecessary re-renders
- Use React.memo for error indicator components
- Optimize nested panel error aggregation
- Batch validation state updates
- Lazy calculate error counts only when needed

## Subtasks
- [ ] Create comprehensive test suite for panel validation error display
- [ ] Implement usePanelValidation hook with error aggregation logic
- [ ] Create PanelErrorIndicator component for visual feedback
- [ ] Extend PanelHeader to display error indicators
- [ ] Update Panel component to integrate validation state
- [ ] Add auto-expand functionality for panels with errors
- [ ] Implement proper testIDs for all validation elements
- [ ] Add accessibility attributes for error states
- [ ] Create integration tests with ValidationContext
- [ ] Update panel examples to demonstrate error display
- [ ] Document usage patterns and API

## Dependencies
- Existing Panel and PanelHeader components from S07
- ValidationContext from S08
- Understanding of survey-core validation model
- Design system for error styling

## Output Log
*(This section is populated as work progresses on the task)*

[2025-06-09 23:07:57] Task created

[2025-06-10] Task completed:

### Summary of Implementation

Successfully implemented comprehensive validation error display functionality for Panel components with the following features:

1. **Created usePanelValidation Hook**
   - Aggregates validation errors from panel questions and nested panels
   - Provides error count, error details, and question names with errors
   - Handles visibility states and memoizes calculations for performance

2. **Created PanelErrorIndicator Component**
   - Visual badge component displaying error count
   - Supports animations (fade-in and pulse on count change)
   - Fully accessible with ARIA attributes and live regions
   - Handles test environments gracefully

3. **Extended PanelHeader Component**
   - Added error count and hasErrors props
   - Displays PanelErrorIndicator when errors exist
   - Applies error styling (border) to headers with errors
   - Includes accessibility states and values for screen readers

4. **Updated Panel Component**
   - Integrated usePanelValidation hook to get validation state
   - Added autoExpandOnError prop (default: true)
   - Automatically expands collapsed panels when they contain errors
   - Passes validation state to PanelHeader

5. **Created Comprehensive Test Suite**
   - Panel.validation.test.tsx with tests for error display, nested propagation, auto-expand, styling, and accessibility
   - usePanelValidation.test.tsx with tests for error aggregation, visibility handling, and performance
   - PanelErrorIndicator.test.tsx with tests for rendering, styling, animations, and accessibility

6. **Updated Example App**
   - Added "Panel with Validation" example to panelExamples.ts
   - Demonstrates a user registration form with multiple validation rules
   - Shows how panels auto-expand and display error counts

### Key Features Implemented:
- ✅ Error indicators in panel headers with error count
- ✅ Automatic panel expansion when containing errors
- ✅ Nested panel error propagation
- ✅ Dynamic error state updates
- ✅ Full accessibility support
- ✅ Performance optimizations with memoization
- ✅ Support for both real-time and on-submit validation modes
- ✅ Comprehensive test coverage

### Files Modified:
- src/hooks/usePanelValidation.tsx (new)
- src/hooks/index.ts
- src/components/Panel/PanelErrorIndicator.tsx (new)
- src/components/Panel/PanelHeader.tsx
- src/components/Panel/Panel.tsx
- src/components/Panel/index.ts
- src/components/Panel/__tests__/Panel.validation.test.tsx (new)
- src/hooks/__tests__/usePanelValidation.test.tsx (new)
- src/components/Panel/__tests__/PanelErrorIndicator.test.tsx (new)
- example/src/data/panelExamples.ts

The implementation provides a complete validation error display system for panels that enhances user experience by clearly indicating which panels contain invalid fields and automatically expanding them to show the errors.