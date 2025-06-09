---
task_id: T07_S08
sprint_sequence_id: S08
status: open
complexity: Low
last_updated: 2025-06-08T00:00:00Z
---

# Task: Sample App Validation Examples

## Description
Add comprehensive validation examples to both the Survey Demo and Explore tabs of the example app. These examples will demonstrate all validation features including required fields, custom validators, different validation modes, and error handling to help developers understand and use the validation system effectively.

## Goal / Objectives
- Create validation examples in Survey Demo tab
- Add interactive validation demos to Explore tab
- Demonstrate all validation modes and features
- Show best practices for validation UX
- Provide code examples for developers

## Acceptance Criteria
- [ ] Survey Demo tab includes multi-page form with validation
- [ ] Explore tab has dedicated validation examples section
- [ ] Examples demonstrate required field validation
- [ ] Examples show real-time vs on-submit validation
- [ ] Custom validation examples included
- [ ] Error message customization demonstrated
- [ ] Complex validation scenarios shown
- [ ] Code snippets provided for each example
- [ ] Examples work on both iOS and Android

## TDD Requirements (FOR ALL CODING TASKS)
**CRITICAL**: All development must follow Test-Driven Development approach:
- [ ] Write failing tests first (describe expected behavior)
- [ ] Implement minimal code to make tests pass
- [ ] Refactor while keeping tests green
- [ ] Achieve >90% code coverage for all new code
- [ ] No code implementation without corresponding test coverage

## Technical Guidance

### Key Interfaces and Integration Points
- Update `example/src/screens/SurveyDemoScreen.tsx`
- Update `example/src/screens/ExploreScreen.tsx`
- Use validation components from S08 tasks
- Follow existing example patterns in `example/src/data/`
- Integrate with component catalog structure

### Specific Imports and Module References
```typescript
import { Survey } from 'react-native-survey-js-ui';
import { surveyExamples } from '../data/surveyExamples';
import { componentCatalog } from '../data/componentCatalog';
```

### Existing Patterns to Follow
- Example structure from surveyExamples.ts
- Component catalog patterns from componentCatalog.ts
- Screen layout patterns from existing screens
- Navigation patterns between examples

### Error Handling Approach
- Show validation errors in user-friendly way
- Demonstrate error recovery patterns
- Include edge case examples
- Show loading states for async validation

## Implementation Notes

### Step-by-Step Implementation Approach
1. Create validation survey examples
2. Update Survey Demo with validation form
3. Add validation section to Explore tab
4. Create interactive validation demos
5. Add code snippet display
6. Test on both platforms
7. Add documentation
8. Create user-friendly descriptions

### Key Architectural Decisions
- Keep examples simple and focused
- Provide progressive complexity
- Include real-world scenarios
- Make examples copy-paste friendly

### Testing Approach
- Test all examples on both platforms
- Verify validation behavior
- Test interactive elements
- Ensure examples are educational

### Performance Considerations
- Keep example surveys reasonable size
- Optimize for smooth interactions
- Test on lower-end devices
- Monitor memory usage

## Subtasks
- [ ] Create validation survey JSON examples
- [ ] Update Survey Demo with comprehensive validation form
- [ ] Add validation section to Explore tab catalog
- [ ] Create required field validation examples
- [ ] Add custom validation rule examples
- [ ] Demonstrate validation mode switching
- [ ] Add async validation example
- [ ] Include code snippets for each example
- [ ] Test examples on iOS and Android
- [ ] Add helpful descriptions and documentation

## Output Log
*(This section is populated as work progresses on the task)*

[YYYY-MM-DD HH:MM:SS] Started task
[YYYY-MM-DD HH:MM:SS] Modified files: file1.js, file2.js
[YYYY-MM-DD HH:MM:SS] Completed subtask: Implemented feature X
[YYYY-MM-DD HH:MM:SS] Task completed