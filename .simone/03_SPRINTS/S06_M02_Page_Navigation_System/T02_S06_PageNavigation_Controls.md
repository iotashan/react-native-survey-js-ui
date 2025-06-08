---
task_id: T02_S06
title: Page Navigation Controls
sprint: S06_M02_Page_Navigation_System
status: todo
priority: high
complexity: medium
estimated_hours: 12
actual_hours: 0
assigned_to: unassigned
tags:
  - navigation
  - state-management
  - validation
  - accessibility
dependencies:
  - T01_S06
created_at: 2025-01-06
updated_at: 2025-01-06
---

# T02_S06: Page Navigation Controls

## Description
Extract and enhance the existing navigation logic from the Survey component into a dedicated, reusable navigation system. This task involves creating a comprehensive page navigation solution that handles state management, validation, and edge cases while maintaining accessibility standards. The navigation controls will integrate seamlessly with survey-core's navigation methods and event system.

## Objectives
1. **Extract Navigation Logic**: Refactor existing navigation methods from Survey component into dedicated hook
2. **Implement Navigation Controls**: Create Next/Previous/Complete buttons with proper state management
3. **Handle Validation**: Integrate page validation before navigation transitions
4. **Manage Edge Cases**: Handle first/last page scenarios, single page surveys, and validation errors
5. **Ensure Accessibility**: Implement WCAG-compliant navigation controls with proper ARIA attributes
6. **Create Reusable Component**: Build a flexible PageNavigation component for consistent UI

## Acceptance Criteria
- [ ] Navigation logic is extracted into a reusable `usePageNavigation` hook
- [ ] Next button advances to the next page when current page is valid
- [ ] Previous button navigates to the previous page without validation
- [ ] Complete button appears on the last page and submits the survey
- [ ] Navigation is disabled during validation or page transitions
- [ ] First page shows only Next button (no Previous)
- [ ] Last page shows Previous and Complete buttons (no Next)
- [ ] Single page surveys show only Complete button
- [ ] Validation errors prevent forward navigation
- [ ] Navigation state is synchronized with survey model
- [ ] All controls have proper accessibility attributes
- [ ] Navigation works with keyboard (Tab, Enter, Space)
- [ ] Loading states are displayed during async operations
- [ ] Error states are properly communicated to users

## TDD Requirements

### Test Categories
1. **Hook Tests** (`hooks/__tests__/usePageNavigation.test.tsx`)
   - Navigation state management
   - Validation integration
   - Edge case handling
   - Event system integration

2. **Component Tests** (`components/PageNavigation/__tests__/PageNavigation.test.tsx`)
   - Button rendering based on page position
   - Click handler integration
   - Disabled states
   - Accessibility attributes

3. **Integration Tests** (`__tests__/integration/navigation-flow.test.tsx`)
   - Complete navigation flow scenarios
   - Validation blocking navigation
   - State synchronization

### Key Test Scenarios
- Navigate forward with valid data
- Navigate backward without validation
- Block navigation on validation errors
- Handle first/last page button visibility
- Test single page survey navigation
- Verify keyboard navigation
- Test loading and error states

## Subtasks

### 1. Create usePageNavigation Hook
- [ ] Define hook interface and return types
- [ ] Extract navigation methods from Survey component
- [ ] Implement `goToNextPage` with validation
- [ ] Implement `goToPreviousPage` without validation
- [ ] Implement `completeSurvey` with final validation
- [ ] Add navigation state (canGoNext, canGoPrevious, isFirstPage, isLastPage)
- [ ] Handle async validation during navigation
- [ ] Integrate with survey-core events

### 2. Implement Validation Integration
- [ ] Check page validation before forward navigation
- [ ] Handle validation errors and prevent navigation
- [ ] Display validation feedback to users
- [ ] Allow backward navigation without validation
- [ ] Validate entire survey before completion

### 3. Handle Edge Cases
- [ ] Detect and handle single page surveys
- [ ] Manage first page state (no previous button)
- [ ] Manage last page state (complete button instead of next)
- [ ] Handle surveys with no pages
- [ ] Manage navigation during loading states
- [ ] Handle navigation when survey is read-only

### 4. Create PageNavigation Component
- [ ] Define component props interface
- [ ] Implement button rendering logic
- [ ] Add loading states for buttons
- [ ] Implement disabled states based on navigation rules
- [ ] Add proper ARIA labels and roles
- [ ] Support custom button text and styles
- [ ] Handle button click events

### 5. Implement Accessibility
- [ ] Add ARIA labels for navigation buttons
- [ ] Implement keyboard navigation (Tab, Enter, Space)
- [ ] Add focus management between pages
- [ ] Announce page changes to screen readers
- [ ] Ensure proper button states are communicated

### 6. Write Comprehensive Tests
- [ ] Unit tests for usePageNavigation hook
- [ ] Component tests for PageNavigation
- [ ] Integration tests for navigation flow
- [ ] Accessibility tests with screen reader simulation
- [ ] Edge case coverage tests

## Technical Guidance

### Existing Navigation Methods
The Survey component currently has navigation methods (lines 130-141 in Survey.tsx):
```typescript
const goToNextPage = useCallback(() => {
  if (surveyModel) {
    surveyModel.nextPage();
  }
}, [surveyModel]);

const goToPreviousPage = useCallback(() => {
  if (surveyModel) {
    surveyModel.prevPage();
  }
}, [surveyModel]);
```

### Integration Points
1. **useSurveyState Hook**: Access current page, page count, and validation state
2. **Survey-Core Methods**: 
   - `nextPage()`: Advances to next page with validation
   - `prevPage()`: Goes to previous page
   - `doComplete()`: Completes the survey
   - `validate()`: Validates current page
3. **Event System**: Listen to `onCurrentPageChanged` for state updates

### Navigation State Properties
```typescript
interface NavigationState {
  currentPageNo: number;
  pageCount: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isNavigating: boolean;
  validationError: string | null;
}
```

## Implementation Notes

### Validation Flow
1. Before navigation: Call `surveyModel.validate()`
2. Check `surveyModel.currentPage.hasErrors`
3. If errors exist, prevent navigation and show feedback
4. For completion: Validate entire survey with `surveyModel.completeLastPage()`

### Button State Logic
- **Next Button**: Visible when not last page, disabled during validation
- **Previous Button**: Visible when not first page, always enabled
- **Complete Button**: Visible only on last page, disabled during validation

### Accessibility Requirements
- Use semantic button elements
- Provide descriptive ARIA labels
- Announce page transitions
- Maintain focus management
- Support keyboard navigation

### Error Handling
- Gracefully handle missing survey model
- Provide fallback for navigation failures
- Clear error messages for validation issues
- Recovery options for failed operations