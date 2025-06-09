---
task_id: T007
status: open
complexity: Medium
last_updated: 2025-06-09T15:18:28Z
---

# Task: Implement Explore Detail Screens With TDD

## Description
Implement ComponentDetails screen for the Explore tab that shows detailed documentation and examples for each question type. For question types that are not yet implemented, display JSON examples with a "not implemented yet" label where the UI would render, following TDD principles. This resolves the current navigation gap where ExploreScreen references a non-existent ComponentDetails screen.

## Goal / Objectives
- Create ComponentDetails screen that handles navigation from Explore tab
- Display component documentation, properties, and live examples
- Implement TDD approach for unimplemented components showing JSON with placeholder UI
- Establish pattern for future component detail views
- Fix current navigation error when clicking components in Explore tab

## Acceptance Criteria
- [ ] ComponentDetails screen is implemented and integrated into navigation
- [ ] Screen displays component name, description, properties, and tags
- [ ] Live demo is shown for implemented components (text, comment, panel)
- [ ] JSON example with "Not Implemented Yet" placeholder for unimplemented components
- [ ] Code snippets toggle to show example JSON configuration
- [ ] Back navigation returns to Explore tab
- [ ] Screen handles unknown component types gracefully
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
- Navigation types in `example/src/navigation/index.ts` - extend RootTabParamList
- ComponentInfo interface from `example/src/data/types.ts`
- Component catalog from `example/src/data/componentCatalog.ts`
- QuestionFactory from `src/components/Questions/QuestionFactory/`
- BaseQuestion component for fallback rendering

### Specific Imports and Module References
```typescript
import { ComponentInfo } from '../data/types';
import { getComponentByType } from '../data/componentCatalog';
import { Survey, useSurveyModel } from 'react-native-survey-js-ui';
```

### Existing Patterns to Follow
- PanelDemoScreen pattern at `example/src/screens/PanelDemoScreen.tsx`
- Screen test patterns at `example/__tests__/screens/`
- Navigation parameter pattern from ExploreScreen handleComponentPress
- Error handling pattern from PanelDemoScreen

### Error Handling Approach
- Handle unknown component types with error state
- Graceful fallback for missing components
- Console warnings for development debugging

### Testing Patterns
- Mock navigation prop following `example/__tests__/screens/PanelDemoScreen.test.tsx`
- Test toggle states (Show Code, etc.)
- Test error states for unknown components
- Mock Survey component and useSurveyModel hook

## Implementation Notes

### Step-by-Step Implementation Approach
1. Create test file `example/__tests__/screens/ComponentDetailsScreen.test.tsx`
2. Write tests for basic screen rendering, navigation params, and component display
3. Create ComponentDetailsScreen component following PanelDemoScreen structure
4. Add navigation configuration to support stack navigation within Explore tab
5. Update ExploreScreen navigation to properly pass parameters
6. Implement "Not Implemented Yet" placeholder for unimplemented components
7. Add code snippet toggle functionality
8. Export screen from screens/index.ts

### Key Architectural Decisions
- Follow existing screen patterns established in the example app
- Use Survey component for live demos when component is implemented
- Show JSON configuration for all components (implemented and unimplemented)
- Maintain consistency with PanelDemoScreen approach

### Testing Approach
- Unit tests for ComponentDetailsScreen component
- Integration tests for navigation flow
- Tests for both implemented and unimplemented component rendering
- Mock survey-core dependencies

### Performance Considerations
- Lazy load Survey component only when showing live demo
- Minimize re-renders when toggling code display
- Use React.memo where appropriate

## Subtasks
- [ ] Write tests for ComponentDetailsScreen component
- [ ] Create ComponentDetailsScreen.tsx with basic structure
- [ ] Implement navigation integration with stack navigator
- [ ] Add component info display (name, description, properties)
- [ ] Implement live demo for implemented components
- [ ] Add "Not Implemented Yet" placeholder for unimplemented components
- [ ] Implement code snippet toggle functionality
- [ ] Update navigation types to include ComponentDetails route
- [ ] Test navigation flow from Explore to ComponentDetails and back
- [ ] Verify all components display correctly in simulator

## Output Log
*(This section is populated as work progresses on the task)*

[2025-06-09 15:18:28] Task created