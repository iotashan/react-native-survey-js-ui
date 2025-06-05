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


## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
