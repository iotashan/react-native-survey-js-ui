---
task_id: T<TaskNN>_S<SprintSequenceID> # For Sprint Tasks (e.g., T01_S01) OR T<NNN> for General Tasks (e.g., T501)
sprint_sequence_id: S<ID> # e.g., S01 (If part of a sprint, otherwise null or absent)
status: open # open | in_progress | pending_review | done | failed | blocked
complexity: Medium # Low | Medium | High
last_updated: YYYY-MM-DDTHH:MM:SSZ
---

# Task: (Filename serves as the descriptive title)

## Description
Briefly explain what this task is about. Provide necessary context to understand the 'why' behind the task.

## Goal / Objectives
Clearly state what needs to be achieved by completing this task. What does success look like?
- Objective 1
- Objective 2

## Acceptance Criteria
Specific, measurable conditions that must be met for this task to be considered 'done'.
- [ ] Criterion 1 is met.
- [ ] Criterion 2 is verified.

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

## Subtasks
A checklist of smaller steps to complete this task.
- [ ] Subtask 1
- [ ] Subtask 2

## Output Log
*(This section is populated as work progresses on the task)*

[YYYY-MM-DD HH:MM:SS] Started task
[YYYY-MM-DD HH:MM:SS] Modified files: file1.js, file2.js
[YYYY-MM-DD HH:MM:SS] Completed subtask: Implemented feature X
[YYYY-MM-DD HH:MM:SS] Task completed
