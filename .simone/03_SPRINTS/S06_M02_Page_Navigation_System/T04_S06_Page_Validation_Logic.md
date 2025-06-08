---
task_id: T04_S06
title: Page Validation Logic
sprint: S06_M02_Page_Navigation_System
complexity: Medium
status: TODO
created: 2025-01-06
---

# T04_S06: Page Validation Logic

## Description
Implement a comprehensive page-level validation system that integrates with survey-core's validation framework to prevent navigation when validation errors exist. This task establishes the foundation for the S08 validation framework by creating reusable validation patterns and error handling mechanisms that will be extended in future sprints.

## Objectives
1. Create validation logic that prevents page navigation when errors exist
2. Integrate with survey-core's built-in validation system and events
3. Provide real-time validation feedback as users interact with questions
4. Display validation errors clearly within the Survey component
5. Establish extensible patterns for the S08 validation framework

## Acceptance Criteria
- [ ] Page navigation is blocked when current page has validation errors
- [ ] Validation errors are displayed immediately when navigation is attempted
- [ ] Real-time validation occurs on question value changes
- [ ] Error messages appear below questions with proper styling
- [ ] Validation state is properly managed in useSurveyState hook
- [ ] All validation scenarios have comprehensive test coverage
- [ ] TypeScript types fully define validation error structures

## TDD Requirements
- Write tests first for all validation scenarios
- Test validation prevention of navigation
- Test error message display and clearing
- Test real-time validation triggers
- Test integration with survey-core validation
- Maintain 100% test coverage

## Subtasks

### 1. Create Validation Hook (1 hour)
- [ ] Create usePageValidation hook in hooks/
- [ ] Define validation state interface
- [ ] Implement validation check logic
- [ ] Add real-time validation triggers
- [ ] Write comprehensive tests first

### 2. Integrate with Survey Component (1.5 hours)
- [ ] Update Survey component to use validation hook
- [ ] Block navigation on validation errors
- [ ] Display error messages below questions
- [ ] Style error messages appropriately
- [ ] Test error display scenarios

### 3. Survey-Core Integration (1 hour)
- [ ] Hook into survey.onValidateQuestion event
- [ ] Use survey.validate() for page validation
- [ ] Handle custom validators
- [ ] Map survey-core errors to UI
- [ ] Test survey-core event handling

### 4. Error State Management (1 hour)
- [ ] Add validation state to useSurveyState
- [ ] Track errors by question name
- [ ] Clear errors on successful validation
- [ ] Persist errors during navigation attempts
- [ ] Test state transitions

### 5. TypeScript Definitions (0.5 hours)
- [ ] Define ValidationError interface
- [ ] Create PageValidationState type
- [ ] Add validation props to Survey component
- [ ] Ensure full type safety
- [ ] Document type usage

### 6. Integration Testing (1 hour)
- [ ] Test validation with different question types
- [ ] Test multi-page validation scenarios
- [ ] Test custom validator integration
- [ ] Test error clearing on correction
- [ ] Test navigation blocking

## Technical Guidance

### Survey-Core Validation Integration
```typescript
// Key survey-core validation methods and events
survey.validate(fireCallback?: boolean, focusOnFirstError?: boolean): boolean
survey.onValidateQuestion: Event<(sender: SurveyModel, options: any) => void>
survey.onValidatePanel: Event<(sender: SurveyModel, options: any) => void>
survey.currentPage.validate(fireCallback?: boolean, focusOnFirstError?: boolean): boolean

// Access question errors
question.errors: SurveyError[]
question.hasErrors: boolean
```

### Validation Hook Structure
```typescript
interface ValidationState {
  errors: Record<string, string[]>; // questionName -> error messages
  isValidating: boolean;
  hasErrors: boolean;
}

interface UsePageValidation {
  validateCurrentPage: () => boolean;
  clearErrors: (questionName?: string) => void;
  getQuestionErrors: (questionName: string) => string[];
  validationState: ValidationState;
}
```

### Error Display Pattern
```typescript
// In Survey component
{question.hasErrors && (
  <View style={styles.errorContainer}>
    {question.errors.map((error, index) => (
      <Text key={index} style={styles.errorText}>
        {error.text}
      </Text>
    ))}
  </View>
)}
```

### Foundation for S08 Framework
- Create reusable validation utilities
- Establish error formatting patterns
- Define extensible validation interfaces
- Prepare for async validation support
- Consider accessibility requirements

## Implementation Notes

### Validation Flow
1. User attempts navigation or submits answer
2. Trigger survey.currentPage.validate()
3. Collect errors from all questions
4. Update validation state in hook
5. Block navigation if errors exist
6. Display errors in UI
7. Clear errors when corrected

### Error Handling Patterns
- Immediate validation on blur/change
- Batch validation on navigation attempt
- Clear question errors on value change
- Persist page errors until corrected
- Support for async validators (future)

### Extensibility for M02
- Validation rules configuration
- Custom error renderers
- Validation timing options
- Error aggregation strategies
- Cross-question validation support

### Testing Considerations
- Mock survey-core validation events
- Test error state transitions
- Verify navigation blocking
- Test error message rendering
- Ensure accessibility compliance