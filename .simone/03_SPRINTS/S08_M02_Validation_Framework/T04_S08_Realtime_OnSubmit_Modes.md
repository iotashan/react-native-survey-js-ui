---
task_id: T04_S08
sprint_sequence_id: S08
status: open
complexity: Medium
last_updated: 2025-06-08T00:00:00Z
---

# Task: Realtime OnSubmit Modes

## Description
Add validation timing options to support different validation strategies: real-time validation (as user types/interacts), on-submit validation (only when navigating or submitting), and hybrid approaches. This includes implementing proper UX patterns for each mode and ensuring smooth user experience on mobile devices.

## Goal / Objectives
- Implement configurable validation timing modes
- Support real-time validation with debouncing
- Support on-submit validation for page navigation
- Enable hybrid validation approaches
- Ensure optimal mobile UX for each mode
- Provide survey-level and question-level configuration

## Acceptance Criteria
- [ ] Validation mode can be configured at survey level
- [ ] Individual questions can override validation mode
- [ ] Real-time validation triggers on appropriate events
- [ ] Real-time validation includes proper debouncing
- [ ] On-submit validation blocks navigation with errors
- [ ] Hybrid mode validates on blur and submit
- [ ] Smooth transitions between validation states
- [ ] Mobile keyboard behavior is optimized
- [ ] Configuration is persisted in ValidationProvider

## TDD Requirements (FOR ALL CODING TASKS)
**CRITICAL**: All development must follow Test-Driven Development approach:
- [ ] Write failing tests first (describe expected behavior)
- [ ] Implement minimal code to make tests pass
- [ ] Refactor while keeping tests green
- [ ] Achieve >90% code coverage for all new code
- [ ] No code implementation without corresponding test coverage

## Technical Guidance

### Key Interfaces and Integration Points
- Extend ValidationProvider context with mode configuration
- Integrate with survey-core's checkErrorsMode property
- Modify usePageValidation hook to support timing modes
- Connect with BaseQuestion for field-level events
- Work with PageNavigation component for submit validation

### Specific Imports and Module References
```typescript
import { Model } from 'survey-core';
import { useValidation } from '../../contexts/ValidationContext';
import { useDebounce } from '../../hooks/useDebounce'; // May need to create
```

### Existing Patterns to Follow
- Event handling from useSurveyModel hook
- State management from ValidationProvider
- Navigation flow from usePageNavigation
- Debouncing patterns from React Native best practices

### Error Handling Approach
- Clear visual feedback for validation timing
- Prevent navigation only when necessary
- Show errors at appropriate times
- Handle rapid user input gracefully

## Implementation Notes

### Step-by-Step Implementation Approach
1. Define validation mode types and interfaces
2. Extend ValidationProvider with mode state
3. Implement real-time validation handlers
4. Add debouncing for text input validation
5. Implement on-submit validation flow
6. Create hybrid validation logic
7. Add configuration API
8. Optimize for mobile UX

### Key Architectural Decisions
- Support three modes: 'realtime', 'onSubmit', 'hybrid'
- Allow per-question override of survey mode
- Use debouncing for text input performance
- Integrate with native keyboard events

### Testing Approach
- Test each validation mode independently
- Test mode switching during survey
- Test debouncing behavior
- Test mobile keyboard interactions

### Performance Considerations
- Debounce real-time validation (300-500ms)
- Batch validation updates
- Optimize for mobile keyboard performance
- Minimize validation runs

## Subtasks
- [ ] Define ValidationMode type ('realtime' | 'onSubmit' | 'hybrid')
- [ ] Extend ValidationProvider with mode configuration
- [ ] Implement real-time validation event handlers
- [ ] Create useDebounce hook for text input
- [ ] Implement on-submit validation in navigation
- [ ] Add hybrid mode with blur validation
- [ ] Create mode configuration API
- [ ] Optimize mobile keyboard interactions
- [ ] Write tests for all validation modes
- [ ] Document validation timing behavior

## Output Log
*(This section is populated as work progresses on the task)*

[YYYY-MM-DD HH:MM:SS] Started task
[YYYY-MM-DD HH:MM:SS] Modified files: file1.js, file2.js
[YYYY-MM-DD HH:MM:SS] Completed subtask: Implemented feature X
[YYYY-MM-DD HH:MM:SS] Task completed