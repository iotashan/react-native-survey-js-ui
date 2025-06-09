---
project_name: react-native-survey-js-ui
current_milestone_id: M02
highest_sprint_in_milestone: S08
current_sprint_id: S07
status: active
last_updated: 2025-06-09T05:39:00Z
---

# Project Manifest: react-native-survey-js-ui

This manifest serves as the central reference point for the project. It tracks the current focus and links to key documentation.

## 1. Project Vision & Overview

A React Native **library** providing UI components for SurveyJS Form Library, enabling native mobile rendering of SurveyJS JSON models without WebView dependencies. Published as an npm package for other developers to integrate offline-capable survey functionality into their React Native apps while maintaining compatibility with existing SurveyJS web implementations.

**Key Goals:**
- Accept identical SurveyJS JSON models and themes as web version
- Maintain API compatibility with survey-core logic engine  
- Support offline survey functionality for iPad/mobile apps
- Follow Test-Driven Development (TDD) for all code implementation

This project follows a milestone-based development approach with strict TDD requirements.

## 2. Current Focus

- **Milestone:** M02 - Page & Panel Layout + Basic Validation (ACTIVE)
- **Sprint:** S07 - Panel Layout System (IN PROGRESS)
- **Status:** M01 completed successfully. Beginning M02 implementation with page navigation and panel layout systems.

### Previous Milestone Status
- **M01 - Foundation & Testing Infrastructure:** ✅ COMPLETED (100% - All 5 sprints, 30 tasks complete)

## 3. Sprint Roadmap: M02 & M03 Milestones

### M02: Page & Panel Layout + Basic Validation (3 Sprints, 7 weeks)

#### S06 Page Navigation System (📋 PENDING) - 6 Tasks
**Goal:** Implement core page navigation and survey progression system
✅ T01: SurveyPage Component (Medium) - Create page component with survey-core integration [COMPLETED 2025-06-08 17:10]
✅ T02: PageNavigation Controls (Medium) - Next/Previous navigation with state management [COMPLETED 2025-06-08 22:44]
✅ T03: Progress Tracking (Low) - Progress indicator with completion percentage [COMPLETED 2025-06-08 23:00]
📋 T04: Page Validation Logic (Medium) - Page-level validation before navigation
📋 T05: Navigation State Management (Medium) - Complex navigation button states
📋 T06: Sample App MultiPage Demo (Low) - Multi-page navigation examples

#### S07 Panel Layout System (🚧 IN PROGRESS) - 7 Tasks  
**Goal:** Panel component system for question grouping and layout
✅ T01: Panel Component (Medium) - Base Panel component with nested support [COMPLETED 2025-06-08 21:39]
📋 T02: PanelHeader Component (Medium) - Panel headers with collapse/expand
✅ T03: Panel Layout System (Medium) - Responsive panel layout for React Native [COMPLETED 2025-06-08 22:18]
📋 T04: Panel Hierarchy Rendering (Medium) - Nested panel rendering logic
📋 T05: Panel Hierarchy State Management (Medium) - State sync across panel tree
✅ T06: Panel State Management (Low) - Individual panel state handling [COMPLETED 2025-06-09 05:39]
📋 T07: Explore Tab Panel Demo (Low) - Panel functionality in Explore tab

#### S08 Validation Framework (📋 PENDING) - 8 Tasks
**Goal:** Foundational validation system and error handling
📋 T01: ValidationProvider Context (Medium) - Centralized validation state management
📋 T02: ValidationError Component (Low) - Error display component system
📋 T03: Required Field Validation (Medium) - Required validation with real-time/submit modes
📋 T04: Realtime OnSubmit Modes (Medium) - Validation timing options and UX patterns
📋 T05: Custom Validation Foundation (Medium) - Extensible custom validation rule support
📋 T06: Validation Navigation Integration Testing (Medium) - Integration tests with navigation
📋 T07: Sample App Validation Examples (Low) - Examples in both app tabs
📋 T08: Validation Panel Integration Testing (Medium) - Integration tests with panels

### M03: Basic Question Types + Full Validation (4 Sprints, 4 weeks)

#### S09 Question Foundation & Base Architecture (📋 PENDING) - 6 Tasks
**Goal:** Establish foundational question architecture and base components
📋 T01: BaseQuestion Component (High) - Common question functionality
📋 T02: Question Registration System (Medium) - Type registration and factory
📋 T03: Question Wrapper System (Medium) - Labels, descriptions, error display
📋 T04: Validation Integration Foundation (Medium) - Question-validation integration
📋 T05: TextInput Question Component (Medium) - Full text input implementation
📋 T06: TDD Question Infrastructure (Low) - Testing patterns for questions

#### S10 Selection Questions (📋 PENDING) - 7 Tasks
**Goal:** Radio button and checkbox question implementation
📋 T01: Radio Button Component (High) - Single selection implementation
📋 T02: Radio Button Styling (Medium) - Platform-appropriate styling
📋 T03: Checkbox Component (High) - Multiple selection implementation
📋 T04: Checkbox Advanced Features (Medium) - Select all/none functionality
📋 T05: Selection Validation (Medium) - Required/min/max selection validation
📋 T06: Choice List Integration (Medium) - Dynamic and static choice handling
📋 T07: Sample App Integration (Low) - Selection question demos

#### S11 Full Validation System (📋 PENDING) - 6 Tasks
**Goal:** Complete validation system with real-time and submit modes
📋 T01: Real Time Validation (High) - On-change and on-blur validation
📋 T02: Submit Validation (Medium) - Survey-wide validation before submission
📋 T03: Custom Validation Messages (Medium) - User-friendly validation feedback
📋 T04: Validation Visual Indicators (Medium) - Error styling and positioning
📋 T05: Advanced Text Validation (Medium) - Email, regex, length validators
📋 T06: Cross Field Validation Foundation (High) - Field dependency validation

#### S12 Integration, Testing & Documentation (📋 PENDING) - 6 Tasks
**Goal:** Final integration, comprehensive testing, and documentation
📋 T01: Integration Testing (High) - End-to-end question and validation testing
📋 T02: Performance Optimization (Medium) - Rendering performance optimization
📋 T03: Accessibility Implementation (Medium) - Accessibility features for questions
📋 T04: Documentation Examples (Medium) - API docs and usage examples
📋 T05: Sample App Enhancement (Medium) - Complete question showcase
📋 T06: Final Testing Validation (Medium) - M03 completion preparation

## 4. Completed Milestone: M01 Foundation & Testing Infrastructure

### S01 Library Foundation Setup (✅ COMPLETED) - 6 Tasks
### S02 Development Environment Setup (✅ COMPLETED) - 5 Tasks  
### S03 Core Survey Integration (✅ COMPLETED) - 6 Tasks
### S04 TDD Infrastructure (✅ COMPLETED) - 6 Tasks
### S05 CI/CD and Final Integration (✅ COMPLETED) - 7 Tasks

**M01 Summary:** 100% complete - All infrastructure, testing, and foundation work delivered successfully. Ready for M02/M03 feature development.

## 5. General Tasks

- [✅] T001: [Validate Example App Simulator Setup](./04_GENERAL_TASKS/TX001_Validate_Example_App_Simulator_Setup.md) - Status: Completed
- [✅] T002: [Fix React Native Metro Hermes Module Resolution Error](./04_GENERAL_TASKS/T002_Fix_React_Native_Metro_Hermes_Module_Resolution_Error.md) - Status: Closed
- [✅] T003: [Fix React Native Expo iOS Runtime Errors](./04_GENERAL_TASKS/TX003_Fix_React_Native_Expo_iOS_Runtime_Errors.md) - Status: Completed (2025-06-07 10:24)
- [✅] T004: [Add Expo Icons to Example App Tabs](./04_GENERAL_TASKS/TX004_Add_Expo_Icons_to_Example_App_Tabs.md) - Status: Completed (2025-06-07 11:03)
- [✅] TX004: [Fix React Hooks Null Error in Library Build](./04_GENERAL_TASKS/COMPLETED_TX004_Fix_React_Hooks_Null_Error_Library_Build.md) - Status: Completed (2025-06-07 11:14)
- [✅] T005: [Fix Infrastructure and Testing Issues](./04_GENERAL_TASKS/TX005_Fix_Infrastructure_and_Testing_Issues.md) - Status: Completed (2025-06-08 00:33)

## 6. Key Documentation

- [Architecture Documentation](./01_PROJECT_DOCS/ARCHITECTURE.md)
- [Current Milestone Requirements](./02_REQUIREMENTS/M02_Page_Panel_Layout_Basic_Validation/)
- [Previous Milestone Requirements](./02_REQUIREMENTS/M01_Foundation_and_Testing/)
- [General Tasks](./04_GENERAL_TASKS/)

## 7. Quick Links

- **Current Sprint:** [S07 Sprint Folder](./03_SPRINTS/S07_M02_Panel_Layout_System/)
- **All Sprints:** [Sprint Directory](./03_SPRINTS/)
- **Active Tasks:** Check sprint folder for T##_S06_*.md files  
- **M02 Sprint Roadmap:** [M02 Sprints S06-S08](./03_SPRINTS/)
- **M03 Sprint Roadmap:** [M03 Sprints S09-S12](./03_SPRINTS/)
- **Project Reviews:** [Latest Review](./10_STATE_OF_PROJECT/)

## 8. Development Principles

### TDD Requirements
- **CRITICAL**: All coding follows Test-Driven Development
- Write tests first, implement code second
- Maintain >90% code coverage
- No code without corresponding tests

### Library Development
- **Library (`src/`)**: Core components published to npm
- **Example App (`example/`)**: Demonstrates library usage with dual tabs
  - **Survey Tab**: Basic survey functionality demo  
  - **Explore Tab**: Interactive catalog of all question types
- **Development Workflow**: Library + example app with local imports
- **Distribution**: NPM package for React Native developers
