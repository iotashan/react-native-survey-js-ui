---
task_id: T009
status: open
complexity: High
last_updated: 2025-06-09T22:23:36Z
---

# Task: Fix Critical Test Infrastructure Issues

## Description
Address critical test infrastructure failures that are blocking project progression. The project review at `.simone/10_STATE_OF_PROJECT/2025-06-09-22-18-critical-test-failures.md` identified systematic test failures across 28 test suites with 39 individual failing tests, resulting in a 94.7% pass rate (down from >99%). These failures include ValidationContext import errors, useSubmissionMode hook timing issues, and TypeScript compilation script failures. The test infrastructure health is currently marked as BROKEN and is blocking S06 sprint completion and S07 progress.

**Context**: The project has accumulated technical debt in its test infrastructure, with complex async handling causing timing issues, module import mismatches, and brittle survey-core mocking. This task focuses on stabilizing the test infrastructure to achieve >95% pass rate and unblock sprint progression.

## Goal / Objectives
Restore test infrastructure to a healthy state and ensure reliable test execution across all test suites.
- Fix ValidationContext test import path issues (misplaced test file)
- Debug and resolve useSubmissionMode hook test failures (8 failing tests)
- Fix TypeScript compilation script validation issues
- Stabilize async test handling and timing issues
- Achieve >95% test pass rate across all test suites

## Acceptance Criteria
- [ ] ValidationContext test moved from `src/components/__tests__/` to proper location or removed
- [ ] All 8 useSubmissionMode hook tests pass consistently without timing issues
- [ ] TypeScript compilation scripts (`typecheck-all.js`) execute without errors
- [ ] Test pass rate improves from 94.7% to >95% (target: 100%)
- [ ] No import errors or module resolution issues in test files
- [ ] Async test utilities properly handle debounce and retry logic
- [ ] Survey-core mocking issues resolved in failing tests
- [ ] Build verification tests pass successfully
- [ ] CI/CD pipeline runs without test-related failures
- [ ] Test infrastructure health score improves from 3/10 to >8/10

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

### Key Files and Integration Points

1. **ValidationContext Test Issues**
   - Misplaced test: `src/components/__tests__/ValidationContext.test.tsx`
   - Correct location: `src/contexts/__tests__/ValidationContext.test.tsx`
   - Import statement attempting to import from `../ValidationContext` which doesn't exist in components directory

2. **useSubmissionMode Hook Architecture**
   - Location: `src/hooks/useSubmissionMode.tsx`
   - Test file: `src/hooks/__tests__/useSubmissionMode.test.tsx`
   - Complex async handling with debouncing, retrying, and HTTP calls
   - Uses React refs for timeout management
   - Integrates with survey-core Model events

3. **TypeScript Compilation Scripts**
   - Script location: `scripts/typecheck-all.js`
   - Test file: `scripts/__tests__/typecheck-all.test.js`
   - Validates library, example app, and declaration files
   - Uses child_process.execSync for running TypeScript compiler

### Testing Patterns in Codebase

1. **Async Test Utilities**
   - Common pattern: `waitFor(() => expect(...).toBe(...))`
   - Timeout issues in multiple test files
   - Consider using `jest.useFakeTimers()` for debounce/retry testing

2. **Survey-Core Mocking**
   - Mock location: `src/__mocks__/survey-core/`
   - Model mock: `src/__mocks__/survey-core/Model.mock.ts`
   - Event system mocking pattern used throughout tests

3. **React Native Testing Library**
   - Version: 13.2.0 (from example app)
   - Common imports: `render`, `act`, `waitFor`, `renderHook`
   - Host component detection issues may relate to environment setup

## Implementation Notes

### Step-by-Step Approach

1. **Fix ValidationContext Test Import**
   - Remove or move the misplaced test file
   - Ensure proper import paths in the correct test location
   - Verify no other tests are importing from wrong paths

2. **Debug useSubmissionMode Hook Tests**
   - Analyze all 8 failing tests for common patterns
   - Focus on async timing issues with debounce and retry logic
   - Consider simplifying the hook implementation as suggested in review
   - Use fake timers for predictable async behavior

3. **Fix TypeScript Compilation Scripts**
   - Debug script execution failures
   - Ensure proper error handling and reporting
   - Validate all TypeScript configurations are correct

4. **Improve Test Infrastructure**
   - Create centralized async test utilities
   - Improve survey-core mock management
   - Add troubleshooting documentation for common test issues

### Architectural Considerations

- Follow John Carmack's critique from review: simplify complex async handling
- Consider splitting useSubmissionMode into smaller, focused hooks
- Evaluate if real implementations could replace complex mocks
- Maintain test readability and obviousness of what's being tested

## Subtasks
- [ ] Audit all test files for import errors and fix ValidationContext test location
- [ ] Debug useSubmissionMode test failures and implement fixes
- [ ] Fix TypeScript compilation script issues
- [ ] Improve async test utilities and timing handling
- [ ] Update survey-core mocks to match current interfaces
- [ ] Run full test suite and verify >95% pass rate
- [ ] Document test troubleshooting guide
- [ ] Verify CI/CD pipeline runs successfully

## Output Log
*(This section is populated as work progresses on the task)*

[2025-06-09 22:23:36] Task created to address critical test infrastructure issues blocking sprint progression