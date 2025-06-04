# Architecture Overview: react-native-survey-js-ui

## Project Purpose

A React Native **library** providing UI components for SurveyJS Form Library, enabling native mobile rendering of SurveyJS JSON models without WebView dependencies. **Published as an npm package** for other React Native developers to integrate offline-capable survey functionality into their apps while maintaining compatibility with existing SurveyJS web implementations.

## Core Technical Requirements

### TDD Development Process
- **CRITICAL**: All development follows Test-Driven Development
- Every feature starts with writing tests first
- No code implementation without corresponding test coverage
- This applies to all milestones and tasks

### Compatibility Goals
- Accept identical SurveyJS JSON models and themes as web version
- Maintain API compatibility with `survey-core` logic engine
- Support same `<Survey>` component interface as SurveyJS React
- Version tracking: tightly couple releases to specific SurveyJS versions

### Technology Stack
- **Library Framework**: React Native library created with `create-react-native-library`
- **Language**: TypeScript for type safety and excellent developer experience
- **Core Dependency**: `survey-core` (SurveyJS logic engine)
- **UI Components**: React Native core components + `@react-native-community` packages
- **Testing**: Jest + React Native Testing Library
- **Distribution**: NPM package with peer dependencies
- **Example App**: React Native with Expo for demonstration and testing

## Architecture Layers

### 1. Survey Core Integration Layer
- `SurveyModel` wrapper around `survey-core`
- Event forwarding system (`onValueChanged`, `onComplete`, etc.)
- State management for current page, navigation
- JSON model parsing and validation

### 2. Component Rendering Layer
- `<Survey>` root component accepting JSON props
- `<Page>` component for survey page layout
- `<Panel>` component for question grouping
- Base `<Question>` component with common functionality

### 3. Question Type Implementation Layer
- **Basic**: Text input, radio buttons, checkboxes
- **Intermediate**: Dropdown, date/time, HTML/text, rating, masked input
- **Advanced**: Matrix questions, file upload, dynamic content
- **Special**: Expression fields, signature pad

### 4. Theming and Styling Layer
- CSS-to-StyleSheet conversion system
- Theme JSON parser for SurveyJS themes
- Responsive layout using Flexbox
- Dark/light mode support

### 5. Localization Layer
- `i18n-js` or `react-i18next` integration
- SurveyJS multi-language model support
- UI string translation system
- Locale detection via `expo-localization`

### 6. Accessibility Layer
- Screen reader support with proper ARIA labels
- Focus management and navigation
- WCAG compliance for color contrast
- Dynamic font scaling support

## Library Architecture

### Project Structure
```
react-native-survey-js-ui/              # NPM library package
├── src/                                # Library source (published to npm)
│   ├── components/                     # Exportable components
│   │   ├── Survey/                     # Main Survey component
│   │   ├── Questions/                  # Question type components
│   │   ├── Pages/                      # Page and Panel components
│   │   └── index.ts                    # Component exports
│   ├── types/                          # TypeScript definitions
│   ├── utils/                          # Utility functions
│   └── index.ts                        # Main library export
├── example/                            # Example React Native app
│   ├── src/                            # Example app source
│   ├── package.json                    # Example app dependencies
│   └── metro.config.js                 # Local library resolution
├── package.json                        # Library package configuration
└── README.md                           # Library usage documentation
```

### Library Export Strategy
- **Main Export**: `src/index.ts` exports public API
- **Component Exports**: Individual components for tree-shaking
- **Type Exports**: TypeScript definitions for consuming apps
- **Utility Exports**: Helper functions for advanced usage

### Consumer Integration
```typescript
// Installation
npm install react-native-survey-js-ui

// Usage in consuming React Native app
import { Survey } from 'react-native-survey-js-ui';

const MyApp = () => {
  const surveyJson = { /* SurveyJS model */ };
  return <Survey model={surveyJson} onComplete={handleComplete} />;
};
```

### Dependency Management
- **Peer Dependencies**: React, React Native (provided by consuming app)
- **Direct Dependencies**: survey-core, essential utilities
- **Dev Dependencies**: TypeScript, testing tools, build tools
- **Bundle Optimization**: Tree-shaking, minimal footprint

## Key Design Decisions

### Component Architecture
- Functional components with hooks
- Context API for survey state sharing
- Minimal prop drilling through component hierarchy
- Separation of logic (survey-core) from presentation (RN components)

### State Management
- Survey state managed by `survey-core` SurveyModel
- React state for UI-specific concerns (focus, animations)
- Event-driven updates from survey model changes
- No external state management library initially

### Styling Strategy
- StyleSheet-based styling for performance
- Theme system compatible with SurveyJS CSS variables
- Modular component styles with theme overrides
- Responsive design using Flexbox and dimensions

### Testing Strategy
- Unit tests for all components using React Native Testing Library
- Integration tests for survey flow and navigation
- Mock `survey-core` for isolated component testing
- Visual regression testing for theming consistency

## Performance Considerations

### Rendering Optimization
- FlatList/FlashList for large question lists and matrix questions
- Lazy loading of complex question types
- Memoization of expensive computations
- Efficient re-rendering on survey model changes

### Bundle Size Management
- Tree-shaking friendly exports
- Optional question type modules
- Minimal dependencies approach
- Platform-specific code splitting where beneficial

## Security and Data Handling

### Offline Capability
- Local storage for survey progress
- Secure storage for sensitive data
- Data synchronization when online
- Encryption for stored survey responses

### Data Privacy
- No data transmission without explicit user consent
- Local-first approach for offline scenarios
- Configurable data retention policies
- GDPR/privacy law compliance considerations

## Development Workflow

### Milestone-Based Development
- 10 clearly defined milestones from foundation to packaging
- Each milestone delivers working functionality
- Incremental complexity building on previous milestones
- Regular integration testing between milestones

### Quality Gates
- All tests must pass before milestone completion
- Code review requirements for all changes
- Documentation updates with each feature
- Performance benchmarks for complex components

## Dependencies and Integrations

### Core Dependencies
- `survey-core`: SurveyJS logic engine
- `expo`: React Native development platform
- `react-native`: Core framework
- `typescript`: Type safety

### UI Component Libraries
- `@react-native-community/checkbox`
- `@react-native-picker/picker`
- `@react-native-community/datetimepicker`
- `react-native-render-html`
- `react-native-ratings`
- `react-native-masked-text`

### Development Dependencies
- `jest`: Testing framework
- `@testing-library/react-native`: Component testing
- `@typescript-eslint/eslint-plugin`: Code quality
- `prettier`: Code formatting

## Future Extensibility

### Plugin Architecture
- Extensible question type system
- Custom theme plugin support
- Third-party component integration
- Event hook system for customization

### API Evolution
- Backward compatibility with SurveyJS updates
- Versioned API for breaking changes
- Migration guides for major updates
- Deprecation strategy for obsolete features