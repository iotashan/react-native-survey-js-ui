---
project_name: react-native-survey-js-ui
current_milestone_id: M01
highest_sprint_in_milestone: S05
current_sprint_id: S04
status: active
last_updated: 2025-06-07T10:46:00Z
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

- **Milestone:** M01 - Foundation & Testing Infrastructure
- **Sprint:** S04 - TDD Infrastructure

## 3. Sprints in Current Milestone

### S01 Library Foundation Setup (✅ COMPLETED) - 6 Tasks
✅ T01: Initialize React Native library infrastructure with `create-react-native-library`
✅ T02: Configure package.json for npm distribution and TypeScript setup
✅ T03: Set up TypeScript configuration for library development
✅ T04: Create src/ directory structure with main exports
✅ T05: Configure peer dependencies (React, React Native)
✅ T06: Establish basic library build process (completed)

### S02 Development Environment Setup (🔄 IN PROGRESS) - 5 Tasks
✅ T01: Create Example App Foundation (Medium) - COMPLETED
✅ T02: Enhance Metro Configuration (Low) - COMPLETED
🔄 T03: Implement Survey Demo Tab (Medium) - IN PROGRESS
✅ T04: Implement Explore Tab (Medium) - COMPLETED
✅ T05: Establish Development Workflow (Low) - COMPLETED

### S03 Core Survey Integration (✅ COMPLETED) - 6 Tasks
✅ T01: Define TypeScript Interfaces for SurveyJS Models (Low) - COMPLETED
✅ T02: Integrate Survey-Core Dependency (Medium) - COMPLETED
✅ T03: Create Main Survey Component (Medium) - COMPLETED
✅ T04: Implement Base Question Architecture (Medium) - COMPLETED
✅ T05: Establish Event System Foundation (Low) - COMPLETED
✅ T06: Create Basic Survey Demo in Example App (Low) - COMPLETED

### S04 TDD Infrastructure (🔄 IN PROGRESS) - 6 Tasks
✅ T01: Enhanced Jest Configuration and CI Optimization (Medium) - COMPLETED
✅ T02: Comprehensive Unit Test Coverage for Core Components (Medium) - COMPLETED
✅ T03: Advanced Mocking Infrastructure for Survey Core (Medium) - COMPLETED
📋 T04: Integration Test Expansion for Example App (Medium)
✅ T05: Coverage Optimization and Reporting Setup (Low) - COMPLETED
✅ T06: TDD Workflow Documentation and Best Practices (Low) - COMPLETED

### S05 CI/CD and Final Integration (📋 PLANNED)
📋 Set up automated testing pipeline for cross-platform
📋 Implement build verification and TypeScript validation
📋 Create library documentation and final integration testing
📋 Complete M01 milestone validation

## 4. General Tasks

- [✅] T001: [Validate Example App Simulator Setup](./04_GENERAL_TASKS/TX001_Validate_Example_App_Simulator_Setup.md) - Status: Completed
- [✅] T002: [Fix React Native Metro Hermes Module Resolution Error](./04_GENERAL_TASKS/T002_Fix_React_Native_Metro_Hermes_Module_Resolution_Error.md) - Status: Closed
- [✅] T003: [Fix React Native Expo iOS Runtime Errors](./04_GENERAL_TASKS/TX003_Fix_React_Native_Expo_iOS_Runtime_Errors.md) - Status: Completed (2025-06-07 10:24)
- [✅] T004: [Add Expo Icons to Example App Tabs](./04_GENERAL_TASKS/TX004_Add_Expo_Icons_to_Example_App_Tabs.md) - Status: Completed (2025-06-07 11:03)
- [⚠️] TX004: [Fix React Hooks Null Error in Library Build](./04_GENERAL_TASKS/TX004_Fix_React_Hooks_Null_Error_Library_Build.md) - Status: Partially Complete (2025-06-07 10:00)

## 5. Key Documentation

- [Architecture Documentation](./01_PROJECT_DOCS/ARCHITECTURE.md)
- [Current Milestone Requirements](./02_REQUIREMENTS/M01_Foundation_and_Testing/)
- [General Tasks](./04_GENERAL_TASKS/)

## 6. Quick Links

- **Current Sprint:** [S02 Sprint Folder](./03_SPRINTS/S02_M01_Development_Environment/)
- **All M01 Sprints:** [Sprint Directory](./03_SPRINTS/)
- **Active Tasks:** Check sprint folder for T##_S02_*.md files
- **Project Reviews:** [Latest Review](./10_STATE_OF_PROJECT/)

## 7. Development Principles

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
