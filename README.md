# react-native-survey-js-ui

Native mobile UI components for SurveyJS Form Library - iOS and Android only, no WebView dependencies

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

- [Event System](docs/EVENTS.md) - Comprehensive guide to handling survey events
- [Development Guide](docs/DEVELOPMENT.md) - Development workflow and best practices
- [Build Guide](docs/BUILD.md) - Building and releasing the library

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
