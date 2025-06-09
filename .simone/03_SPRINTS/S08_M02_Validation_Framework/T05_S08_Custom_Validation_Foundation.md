---
task_id: T05_S08
sprint_sequence_id: S08
status: open
complexity: Medium
last_updated: 2025-06-08T00:00:00Z
---

# Task: Custom Validation Foundation

## Description
Establish an extensible custom validation rule support system that integrates with survey-core's validator system while supporting React Native-specific patterns. This foundation will enable developers to add custom validation logic beyond the built-in validators, supporting both synchronous and asynchronous validation scenarios.

## Goal / Objectives
- Create extensible validation rule registration system
- Support custom validation functions
- Enable async validation (e.g., API calls)
- Integrate with survey-core's validator architecture
- Provide TypeScript support for custom validators
- Support validation with custom error messages

## Acceptance Criteria
- [ ] Custom validators can be registered globally
- [ ] Custom validators can be added per question
- [ ] Support for synchronous validation functions
- [ ] Support for asynchronous validation with loading states
- [ ] Custom error messages can be provided
- [ ] Integration with survey-core's validator system
- [ ] TypeScript types for custom validator creation
- [ ] Validators can access question and survey context
- [ ] Performance optimized for mobile devices

## TDD Requirements (FOR ALL CODING TASKS)
**CRITICAL**: All development must follow Test-Driven Development approach:
- [ ] Write failing tests first (describe expected behavior)
- [ ] Implement minimal code to make tests pass
- [ ] Refactor while keeping tests green
- [ ] Achieve >90% code coverage for all new code
- [ ] No code implementation without corresponding test coverage

## Technical Guidance

### Key Interfaces and Integration Points
- Extend survey-core's Validator base class
- Integrate with ValidationProvider context
- Work with usePageValidation hook
- Connect to BaseQuestion validation flow
- Support survey-core's JsonObject serialization

### Specific Imports and Module References
```typescript
import { Validator, JsonObject, Question, SurveyModel } from 'survey-core';
import { useValidation } from '../../contexts/ValidationContext';
```

### Existing Patterns to Follow
- Validator patterns from survey-core documentation
- Registration patterns similar to question type registration
- Async patterns from React Native best practices
- Error handling from existing validation system

### Error Handling Approach
- Support custom error messages with placeholders
- Handle async validation failures gracefully
- Provide fallback error messages
- Support localized error messages

## Implementation Notes

### Step-by-Step Implementation Approach
1. Create CustomValidator base class extending survey-core
2. Implement validator registration system
3. Add support for sync validation functions
4. Implement async validation with promises
5. Create validation context integration
6. Add TypeScript types and interfaces
7. Implement error message templating
8. Create validator lifecycle hooks

### Key Architectural Decisions
- Extend survey-core's Validator for compatibility
- Support both function and class-based validators
- Enable validator composition and chaining
- Provide access to full survey context

### Testing Approach
- Unit tests for validator registration
- Tests for sync and async validation
- Integration tests with survey-core
- Performance tests for validation chains

### Performance Considerations
- Cache validation results when appropriate
- Debounce async validations
- Cancel in-flight async validations
- Optimize for mobile performance

## Subtasks
- [ ] Create CustomValidator base class
- [ ] Implement validator registration system
- [ ] Add synchronous validation support
- [ ] Implement asynchronous validation with promises
- [ ] Create loading states for async validation
- [ ] Add error message templating system
- [ ] Integrate with ValidationProvider context
- [ ] Create TypeScript interfaces and types
- [ ] Write comprehensive test suite
- [ ] Document custom validator creation

## Output Log
*(This section is populated as work progresses on the task)*

[YYYY-MM-DD HH:MM:SS] Started task
[YYYY-MM-DD HH:MM:SS] Modified files: file1.js, file2.js
[YYYY-MM-DD HH:MM:SS] Completed subtask: Implemented feature X
[YYYY-MM-DD HH:MM:SS] Task completed