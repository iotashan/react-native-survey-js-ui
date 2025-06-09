---
task_id: T06_S07
sprint_sequence_id: S07
status: open
complexity: Low
last_updated: 2025-06-08T00:00:00Z
---

# Task: Panel State Management

## Description
Add focused panel-level state management for individual panel collapsed/expanded states with persistence and proper event handling. This task implements the core state logic that will be used by the panel hierarchy.

## Goal / Objectives
- Create state management utilities for panel expansion states
- Implement state persistence across page navigation
- Add proper TypeScript types for panel state
- Ensure clean API for state access and updates
- Support both controlled and uncontrolled panel modes

## Acceptance Criteria
- [ ] Panel state hook manages collapsed/expanded states
- [ ] State persists when navigating between pages
- [ ] Controlled mode works with external state
- [ ] Uncontrolled mode manages internal state
- [ ] TypeScript types fully define state shape
- [ ] State updates are performant
- [ ] All tests achieve >90% coverage

## TDD Requirements (FOR ALL CODING TASKS)
**CRITICAL**: All development must follow Test-Driven Development approach:
- [ ] Write failing tests first (describe expected behavior)
- [ ] Implement minimal code to make tests pass
- [ ] Refactor while keeping tests green
- [ ] Achieve >90% code coverage for all new code
- [ ] No code implementation without corresponding test coverage

## Technical Guidance

### Key Interfaces and Integration Points
- Create hooks in src/hooks/ directory
- Follow patterns from useSurveyState and usePageNavigation
- Use React.useState and React.useCallback
- Consider React.useRef for persistence

### Existing Patterns to Follow
- Hook structure from existing hooks directory
- TypeScript patterns from types directory
- Export patterns from hooks/index.ts
- Testing patterns from hooks test files

### Implementation Notes

1. **Hook Implementation**
   - Create usePanelState hook
   - Accept initial state and panel ID
   - Return state and toggle function
   - Handle undefined/null cases gracefully

2. **State Shape**
   ```typescript
   interface PanelState {
     [panelId: string]: boolean; // true = expanded
   }
   ```

3. **API Design**
   - Simple toggle(panelId) function
   - getState(panelId) for reading
   - setState for controlled mode
   - Clear separation of concerns

4. **Testing Focus**
   - Test state initialization
   - Test toggle functionality
   - Test persistence behavior
   - Test controlled vs uncontrolled
   - Test edge cases

## Subtasks
- [ ] Write tests for usePanelState hook
- [ ] Implement basic state management hook
- [ ] Add TypeScript interfaces for panel state
- [ ] Implement controlled component pattern
- [ ] Add state persistence logic
- [ ] Export hook from hooks index
- [ ] Update documentation with usage examples

## Output Log
*(This section is populated as work progresses on the task)*