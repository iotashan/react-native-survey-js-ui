---
task_id: T05_S11
sprint_sequence_id: S11
status: pending
complexity: High
last_updated: 2025-06-08T12:30:00Z
---

# Task: Advanced Text Validation

## Description
Implement comprehensive advanced text validation including pattern matching (email, phone, URLs), length validation, numeric validation, custom regular expressions, and specialized input validation rules. This enhances the TextInput question with robust validation capabilities.

## Goal / Objectives
Create comprehensive text validation for enhanced data quality.
- Implement pattern-based validation (email, phone, URL, etc.)
- Add numeric validation with range checking
- Create custom regular expression validation support
- Implement length validation (min/max characters/words)
- Add specialized validation rules (credit card, postal codes, etc.)

## Acceptance Criteria
- [ ] Email validation working with proper email format checking
- [ ] Phone number validation with international format support
- [ ] URL validation for web addresses
- [ ] Numeric validation with min/max range checking
- [ ] Custom regular expression validation support
- [ ] Length validation for characters and words
- [ ] Specialized validation rules (credit card, postal codes)
- [ ] Performance optimized for complex validation patterns

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
**Key integration points:**
- Must work with TextInputQuestion from S09
- Must integrate with validation systems from T01 and T02
- Must work with survey-core validation rules
- Must support custom validation message system from T03

**Existing patterns to follow:**
- Use established regex patterns for common validation types
- Follow React Native input validation patterns
- Use performance optimization patterns for complex regex
- Follow validation patterns established in previous tasks

**Error handling approach:**
- Handle invalid regex patterns gracefully
- Provide clear error messages for validation failures
- Handle edge cases in pattern matching
- Recover from validation rule execution errors

## Implementation Notes
**Step-by-step implementation approach:**
1. Implement email validation with comprehensive format checking
2. Add phone number validation with international support
3. Create URL validation for web addresses
4. Implement numeric validation with range checking
5. Add custom regular expression validation support
6. Create length validation for characters and words
7. Add specialized validation rules (credit card, postal codes)
8. Create comprehensive tests for all validation patterns

**Key architectural decisions to respect:**
- Validation patterns must be performance optimized
- Must support international formats and localization
- Must be extensible for additional validation types
- Must integrate seamlessly with existing validation systems

**Testing approach:**
- Test email validation with various valid/invalid formats
- Test phone number validation with international formats
- Test URL validation with different URL types
- Test numeric validation with range checking
- Test custom regex validation
- Test length validation scenarios
- Test specialized validation rules

## Subtasks
- [ ] Implement email validation with format checking
- [ ] Add phone number validation with international support
- [ ] Create URL validation for web addresses
- [ ] Implement numeric validation with min/max range checking
- [ ] Add custom regular expression validation support
- [ ] Create length validation (characters and words)
- [ ] Implement specialized validation rules (credit card, postal codes)
- [ ] Add performance optimizations for complex validation
- [ ] Create comprehensive test suite with >90% coverage

## Dependencies
- S09 TextInputQuestion component must be completed
- T01 real-time validation system for immediate feedback
- T02 on-submit validation system for comprehensive checking
- T03 custom validation messages for error feedback