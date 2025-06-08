# Release Checklist for react-native-survey-js-ui

## Pre-release Verification

### Code Quality
- [ ] All tests pass: `yarn test`
- [ ] TypeScript compilation successful: `yarn typecheck:all`
- [ ] No linting errors: `yarn lint`
- [ ] Build verification passes: `yarn build:verify`
- [ ] Code coverage >90%: `yarn test:coverage`

### Package Validation
- [ ] NPM validation passes: `yarn npm:validate`
- [ ] Package size is reasonable (<100KB compressed)
- [ ] All required files are included in package
- [ ] No test files or unnecessary files in package

### Documentation
- [ ] README.md is up to date with latest features
- [ ] CHANGELOG.md updated with release notes
- [ ] API documentation is current
- [ ] Example app demonstrates new features

### Version Management
- [ ] Version number updated appropriately (semver)
- [ ] Git tag created for release
- [ ] No uncommitted changes in working directory

## Release Process

### 1. Final Checks
```bash
# Ensure clean working directory
git status

# Run full validation suite
yarn check:all

# Test package locally
yarn npm:pack
npm install react-native-survey-js-ui-*.tgz --dry-run
```

### 2. Version Bump
```bash
# Choose appropriate version bump
yarn version:patch    # Bug fixes: 0.1.0 → 0.1.1
yarn version:minor    # New features: 0.1.0 → 0.2.0  
yarn version:major    # Breaking changes: 0.1.0 → 1.0.0
```

### 3. Publish
```bash
# Publish to npm
yarn npm:publish

# Or publish beta
yarn npm:publish:beta
```

### 4. Post-release
- [ ] Verify package on npmjs.com
- [ ] Create GitHub release with tag
- [ ] Test installation in new React Native project
- [ ] Announce release if significant

## Initial Release (v0.1.0) Specific Items

### Core Functionality
- [x] Survey component renders SurveyJS models
- [x] React hooks for survey state management
- [x] TypeScript support with full type definitions
- [x] Basic question type support
- [x] Event system foundation

### Library Infrastructure
- [x] Proper npm package structure
- [x] CommonJS and ES Module builds
- [x] React Native compatibility
- [x] Example app demonstrating usage
- [x] Comprehensive test suite

### Known Limitations (Document in README)
- [ ] Limited question type support (only basic types)
- [ ] Survey-core using local build (not official npm version)
- [ ] No advanced features (themes, custom widgets)
- [ ] iOS and Android only (no web support yet)

## Communication Template

### npm Package Description
```
Native mobile UI components for SurveyJS Form Library - render surveys in React Native apps without WebView dependencies. Supports offline functionality and maintains compatibility with SurveyJS JSON models.
```

### GitHub Release Notes Template
```markdown
## react-native-survey-js-ui v0.1.0

Initial release of React Native UI components for SurveyJS.

### Features
- 🎯 Core Survey component for rendering SurveyJS models
- 🪝 React hooks for survey state management (useSurveyModel, useSurveyState)
- 📱 Native React Native components (no WebView)
- 🔌 Compatible with existing SurveyJS JSON models
- 📦 TypeScript support with full type definitions
- 🧪 Comprehensive test suite with >90% coverage

### Installation
```bash
npm install react-native-survey-js-ui
# or
yarn add react-native-survey-js-ui
```

### Usage
```typescript
import { Survey } from 'react-native-survey-js-ui';

const surveyJson = {
  pages: [{
    elements: [{
      type: "text",
      name: "name",
      title: "What is your name?"
    }]
  }]
};

function App() {
  return (
    <Survey 
      model={surveyJson}
      onComplete={(result) => console.log(result)}
    />
  );
}
```

### Notes
- This is an initial release focused on core functionality
- Additional question types and features coming in future releases
- Please report issues on GitHub

### Breaking Changes
- N/A (initial release)
```

## Future Releases Planning

### v0.2.0 (Planned)
- [ ] Additional question types (radio, checkbox, dropdown)
- [ ] Theme support
- [ ] Validation improvements

### v0.3.0 (Planned)
- [ ] Advanced question types (matrix, rating)
- [ ] Custom question components
- [ ] Performance optimizations

### v1.0.0 (Planned)
- [ ] Feature parity with core SurveyJS
- [ ] Stable API
- [ ] Production ready