---
task_id: T03_S11
sprint_sequence_id: S11
status: pending
complexity: Medium
last_updated: 2025-06-08T12:30:00Z
---

# Task: Custom Validation Messages System

## Description
Create a comprehensive custom validation message system that allows for personalized error messages, localization support, and context-aware validation feedback. This system will enhance user experience by providing clear, helpful validation guidance.

## Goal / Objectives
Create flexible and user-friendly validation messaging system.
- Implement custom validation message templates and formatting
- Add localization support for validation messages
- Create context-aware validation messages based on question type
- Support validation message customization per question
- Integrate with survey-core validation message system

## Acceptance Criteria
- [ ] Custom validation message templates working for all validation rules
- [ ] Localization support for validation messages implemented
- [ ] Context-aware messages based on question type and validation rule
- [ ] Per-question validation message customization supported
- [ ] Integration with survey-core custom validation messages
- [ ] Message formatting supports placeholders and dynamic values
- [ ] Fallback messages provided for all validation scenarios
- [ ] Performance optimized for message generation and display

## TDD Requirements (FOR ALL CODING TASKS)
**CRITICAL**: All development must follow Test-Driven Development approach:
- [ ] Write failing tests first (describe expected behavior)
- [ ] Implement minimal code to make tests pass
- [ ] Refactor while keeping tests green
- [ ] Achieve >90% code coverage for all new code
- [ ] No code implementation without corresponding test coverage

## Technical Guidance
**Key integration points:**
- Must work with all validation systems from T01 and T02
- Must integrate with survey-core validation message system
- Must work with all question components from S09 and S10
- Must support localization and internationalization

**Existing patterns to follow:**
- Use React Native internationalization patterns
- Follow template and formatting patterns for dynamic content
- Use React hooks for message state management
- Follow accessibility guidelines for error messaging

**Error handling approach:**
- Handle missing or invalid message templates gracefully
- Provide fallback messages for all validation scenarios
- Handle localization errors with default language fallbacks
- Recover from message formatting errors

## Implementation Notes
**Step-by-step implementation approach:**
1. Create validation message template system
2. Implement message formatting with placeholders and dynamic values
3. Add localization support for validation messages
4. Create context-aware message generation based on question types
5. Implement per-question message customization
6. Integrate with survey-core validation message system
7. Add fallback message handling
8. Create comprehensive tests for all message scenarios

**Key architectural decisions to respect:**
- Message system must be performant and not impact validation speed
- Must support full localization and internationalization
- Must be easily customizable and extensible
- Must integrate seamlessly with existing validation systems

**Testing approach:**
- Test custom message templates and formatting
- Test localization and language switching
- Test context-aware message generation
- Test per-question message customization
- Test integration with survey-core messages
- Test fallback message handling

## Subtasks
- [ ] Create validation message template system
- [ ] Implement message formatting with placeholders
- [ ] Add localization support for validation messages
- [ ] Create context-aware message generation
- [ ] Implement per-question message customization
- [ ] Integrate with survey-core validation message system
- [ ] Add fallback message handling and defaults
- [ ] Create message performance optimizations
- [ ] Create comprehensive test suite with >90% coverage

## Dependencies
- T01 real-time validation system must be completed
- T02 on-submit validation system must be completed
- Survey-core validation message integration
- Localization system (if available from M01)