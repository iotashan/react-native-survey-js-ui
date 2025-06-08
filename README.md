# react-native-survey-js-ui

Native mobile UI components for SurveyJS Form Library - iOS and Android only, no WebView dependencies

## Version Compatibility

This library includes a custom-built version of survey-core with React Native compatibility fixes. The table below shows which version of survey-core is included with each release:

| react-native-survey-js-ui | survey-core | Release Date | Notes |
|---------------------------|-------------|--------------|-------|
| 0.1.0                     | 2.1.1       | 2025-06-07   | Initial release with React Native fixes |

### Survey-Core Compatibility

We maintain our own build of survey-core with the following React Native compatibility fixes:
- Fixed `window.addEventListener` calls in drag-drop functionality
- Fixed `document.head` access in settings initialization
- Added minimal window/document polyfills for React Native environment
- Ensured proper module resolution for React Native bundlers

**Note**: This library is locked to specific survey-core versions to ensure compatibility. Each release is thoroughly tested with the corresponding survey-core version.

## Installation

```sh
npm install react-native-survey-js-ui
```

### Peer Dependencies

This library requires the following peer dependencies to be installed in your React Native project:

- `react` (any version)
- `react-native` (any version)

These dependencies are not bundled with the library and must be provided by your application.

## Usage

```js
import { Survey } from 'react-native-survey-js-ui';
import type { SurveyModel } from 'react-native-survey-js-ui';

const surveyModel: SurveyModel = {
  pages: [
    {
      name: 'page1',
      elements: [
        {
          type: 'text',
          name: 'question1',
          title: 'What is your name?',
        },
      ],
    },
  ],
};

// In your component
<Survey model={surveyModel} />
```

## Event Handling

The Survey component supports event handlers to respond to user interactions:

```js
<Survey 
  model={surveyModel}
  onComplete={(result) => console.log('Survey completed:', result)}
  onValueChanged={(event) => console.log('Value changed:', event)}
  onCurrentPageChanged={(event) => console.log('Page changed:', event)}
/>
```

For detailed event documentation and examples, see [Event System Documentation](docs/EVENTS.md).

## Documentation

### User Documentation
- [Event System](docs/EVENTS.md) - Comprehensive guide to handling survey events

### Developer Documentation
- [Development Guide](docs/DEVELOPMENT.md) - Development workflow and best practices
- [Build Guide](docs/BUILD.md) - Building and releasing the library

### Testing and TDD Documentation
This project follows strict Test-Driven Development (TDD) practices. All contributions must adhere to TDD principles:

- **[TDD Workflow Guide](docs/TDD_WORKFLOW.md)** - Complete TDD process and principles
- **[TDD Integration Guide](docs/TDD_INTEGRATION_GUIDE.md)** - Integrating TDD into development workflow
- **[React Native Testing Best Practices](docs/REACT_NATIVE_TESTING_BEST_PRACTICES.md)** - Library-specific testing patterns
- **[Mock Usage Guide](docs/MOCK_USAGE_GUIDE.md)** - Comprehensive mocking strategies
- **[Test Organization Conventions](docs/TEST_ORGANIZATION_CONVENTIONS.md)** - Structure and naming standards
- **[Test Templates](docs/TEST_TEMPLATES.md)** - Ready-to-use test templates
- **[TDD Code Review Checklist](docs/TDD_CODE_REVIEW_CHECKLIST.md)** - Ensuring TDD compliance
- **[Testing Troubleshooting FAQ](docs/TESTING_TROUBLESHOOTING_FAQ.md)** - Common issues and solutions

### TDD Requirements
- **CRITICAL**: All code must follow the Red-Green-Refactor cycle
- **Coverage**: >90% code coverage required for all new code
- **Tests First**: No implementation without corresponding tests
- **Quality**: Tests must validate behavior, not just achieve coverage

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
