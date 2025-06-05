---
project_name: react-native-survey-js-ui
current_milestone_id: M01
highest_sprint_in_milestone: S05
current_sprint_id: S01
status: active
last_updated: 2025-06-04T20:40:00Z
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
- **Sprint:** S01 - Library Foundation Setup

## 3. Sprints in Current Milestone

### S01 Library Foundation Setup (✅ COMPLETED) - 6 Tasks
✅ T01: Initialize React Native library infrastructure with `create-react-native-library`
✅ T02: Configure package.json for npm distribution and TypeScript setup
✅ T03: Set up TypeScript configuration for library development
✅ T04: Create src/ directory structure with main exports
✅ T05: Configure peer dependencies (React, React Native)
✅ T06: Establish basic library build process (completed)

### S02 Development Environment Setup (📋 PLANNED)
📋 Create example React Native app in example/ directory
📋 Configure Metro for local library resolution and hot reload
📋 Implement tab navigation (Survey Demo + Explore tabs)
📋 Establish seamless development workflow

### S03 Core Survey Integration (📋 PLANNED)
📋 Create main Survey component with survey-core integration
📋 Implement base question architecture foundation
📋 Define TypeScript interfaces for SurveyJS models
📋 Create basic survey demo in example app tabs

### S04 TDD Infrastructure (📋 PLANNED)
📋 Configure Jest and React Native Testing Library
📋 Create comprehensive unit and integration tests
📋 Set up mock utilities and achieve >90% code coverage
📋 Establish TDD workflow for future development

### S05 CI/CD and Final Integration (📋 PLANNED)
📋 Set up automated testing pipeline for cross-platform
📋 Implement build verification and TypeScript validation
📋 Create library documentation and final integration testing
📋 Complete M01 milestone validation

## 4. Key Documentation

- [Architecture Documentation](./01_PROJECT_DOCS/ARCHITECTURE.md)
- [Current Milestone Requirements](./02_REQUIREMENTS/M01_Foundation_and_Testing/)
- [General Tasks](./04_GENERAL_TASKS/)

## 5. Quick Links

- **Current Sprint:** [S01 Sprint Folder](./03_SPRINTS/S01_M01_Library_Foundation/)
- **All M01 Sprints:** [Sprint Directory](./03_SPRINTS/)
- **Active Tasks:** Check sprint folder for T##_S01_*.md files
- **Project Reviews:** [Latest Review](./10_STATE_OF_PROJECT/)

## 6. Development Principles

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
