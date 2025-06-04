# M01: React Native Library Foundation + Testing Infrastructure

## Overview
Establish the foundational architecture for the `react-native-survey-js-ui` **library** using `create-react-native-library` with comprehensive TDD infrastructure, example application for development and testing, and core survey-core integration.

## Success Criteria
- [ ] React Native library properly initialized with `create-react-native-library`
- [ ] Library builds and can be imported by example app
- [ ] Comprehensive TDD infrastructure for library development
- [ ] Example app with Survey and Explore tabs demonstrating library usage
- [ ] Core Survey component shell exporting from library
- [ ] Basic survey-core integration working
- [ ] CI/CD pipeline for library and example app
- [ ] All tests passing with >90% code coverage

## Deliverables

### 1. React Native Library Setup
- Initialize with `npx create-react-native-library@latest react-native-survey-js-ui`
- Configure TypeScript for library development
- Set up proper package.json for npm distribution
- Configure peer dependencies (React Native, survey-core)
- Library build configuration and scripts

### 2. Library Source Structure
- **Library code in `src/`** - components that get published to npm
- **Main export file** `src/index.ts` with public API
- **Component architecture** for Survey, Questions, utilities
- **TypeScript definitions** for all exported components
- **Library-specific testing** infrastructure

### 3. Example App Configuration
- **Example app in `example/`** directory
- **Local library import** via metro.config.js configuration
- **Tab 1: Survey Demo** - demonstrates library usage
- **Tab 2: Explore** - showcases all question types
- **Example app package.json** with library as local dependency

### 4. Library Development Workflow
- **Local development setup** with library + example app
- **Hot reload** for library changes reflected in example app
- **Library build process** for development and distribution
- **Testing workflow** for both library and example app
- **Debug configuration** for library development

### 5. TDD Infrastructure for Library
- **Jest configuration** optimized for library testing
- **React Native Testing Library** for component testing
- **Library unit tests** in `src/__tests__/`
- **Example app integration tests** in `example/__tests__/`
- **Mock utilities** for survey-core and external dependencies

### 6. Core Library Components
- **Survey component** - main library export
- **Base component architecture** for question types
- **survey-core integration layer**
- **TypeScript interfaces** for SurveyJS models
- **Event system foundation**

## Technical Requirements

### Library Dependencies (package.json)
```json
{
  "peerDependencies": {
    "react": "*",
    "react-native": "*"
  },
  "dependencies": {
    "survey-core": "^1.9.x"
  },
  "devDependencies": {
    "@types/react": "*",
    "@types/react-native": "*",
    "typescript": "*",
    "jest": "*",
    "@testing-library/react-native": "*"
  }
}
```

### Example App Dependencies
- React Navigation for tabs
- React Native compatible with library
- Local library import configuration

### Project Structure (Library Architecture)
```
react-native-survey-js-ui/              # Library root
├── src/                                # Library source (gets published)
│   ├── components/
│   │   ├── Survey/
│   │   │   ├── Survey.tsx
│   │   │   ├── Survey.test.tsx
│   │   │   └── index.ts
│   │   ├── Questions/
│   │   │   ├── BaseQuestion/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── SurveyTypes.ts
│   │   └── index.ts
│   ├── utils/
│   │   └── index.ts
│   └── index.ts                        # Main library export
├── example/                            # Example React Native app
│   ├── src/
│   │   ├── screens/
│   │   │   ├── SurveyDemo.tsx          # Tab 1: Basic survey demo
│   │   │   └── Explore.tsx             # Tab 2: Question showcase
│   │   ├── navigation/
│   │   └── App.tsx
│   ├── package.json                    # Example app deps
│   ├── metro.config.js                 # Local library resolution
│   └── app.json
├── android/                            # Native Android (if needed)
├── ios/                               # Native iOS (if needed)
├── package.json                       # Library package config
├── tsconfig.json                      # Library TypeScript
├── jest.config.js                     # Library testing
└── README.md                          # Library usage docs
```

### Library Export Strategy
```typescript
// src/index.ts - Main library export
export { Survey } from './components/Survey';
export { BaseQuestion } from './components/Questions';
export * from './types';
export * from './utils';
```

### Example App Import
```typescript
// example/src/App.tsx
import { Survey } from 'react-native-survey-js-ui';
```

### Testing Strategy
- **Library Unit Tests**: Test components in isolation
- **Library Integration Tests**: Test component interactions
- **Example App Tests**: Test library usage patterns
- **Build Tests**: Verify library compilation and exports
- **TypeScript Tests**: Verify type definitions

### Development Commands
```bash
# Library development
yarn build          # Build library for distribution
yarn test           # Run library tests
yarn lint           # Lint library code

# Example app development  
cd example
yarn android        # Run example app on Android
yarn ios           # Run example app on iOS
yarn test          # Run example app tests
```

## Definition of Done
- [ ] All code follows TDD approach (tests written first)
- [ ] >90% test coverage for library components
- [ ] Library builds successfully and exports work
- [ ] Example app imports and uses library correctly
- [ ] Example app runs on iOS and Android
- [ ] CI/CD pipeline tests both library and example app
- [ ] TypeScript definitions complete and accurate
- [ ] Documentation covers library installation and usage

## Critical Library Considerations
- **Peer Dependencies**: Don't bundle React Native - expect consuming apps to provide it
- **Bundle Size**: Optimize library size for npm distribution
- **TypeScript**: Full type definitions for excellent developer experience
- **Backward Compatibility**: Plan for future SurveyJS version updates
- **Platform Support**: Ensure library works on both iOS and Android

## Dependencies
- None (this is the foundation milestone)

## Estimated Timeline
3-4 weeks for full completion including library setup, development workflow, and comprehensive testing infrastructure