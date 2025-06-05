# Development Workflow Guide

## Table of Contents

1. [Quick Start](#quick-start)
2. [Development Environment Setup](#development-environment-setup)
3. [Daily Development Workflow](#daily-development-workflow)
4. [Testing Guide](#testing-guide)
5. [Debugging](#debugging)
6. [Troubleshooting](#troubleshooting)
7. [Performance Optimization](#performance-optimization)
8. [Release Process](#release-process)
9. [Command Reference](#command-reference)

## Quick Start

For experienced developers who want to get up and running quickly:

```bash
# Clone the repository
git clone https://github.com/your-org/react-native-survey-js-ui.git
cd react-native-survey-js-ui

# Install dependencies
yarn install

# Build the library in watch mode
yarn build:dev

# In a new terminal, start the example app
cd example
yarn start

# Run tests in watch mode (in root directory)
yarn test:watch
```

## Development Environment Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- Yarn 1.22+
- iOS development (macOS only):
  - Xcode 14+
  - CocoaPods
- Android development:
  - Android Studio
  - JDK 17
  - Android SDK

### Initial Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/your-org/react-native-survey-js-ui.git
   cd react-native-survey-js-ui
   yarn install
   ```

2. **iOS Setup (macOS only)**
   ```bash
   cd example/ios
   pod install
   cd ../..
   ```

3. **Verify Setup**
   ```bash
   # Run validation checks
   yarn validate
   
   # Build library
   yarn build:prod
   
   # Run tests
   yarn test
   ```

### Workspace Structure

This project uses Yarn workspaces with two packages:

- **Root (`/`)**: The library source code and build configuration
- **Example (`/example`)**: Demo app showcasing library features

The workspace configuration ensures the example app always uses the local library version.

## Daily Development Workflow

### 1. Start Development Session

```bash
# In root directory - build library in watch mode
yarn build:dev

# In a new terminal - start Metro bundler
cd example
yarn start

# In another terminal - run the app
yarn ios    # or
yarn android
```

### 2. Development Cycle

1. **Make Changes**: Edit library source in `src/`
2. **Auto-Rebuild**: Watch mode rebuilds on save
3. **Hot Reload**: Example app updates automatically
4. **Test**: Write/run tests for your changes
5. **Commit**: Use conventional commits

### 3. Code Quality Checks

```bash
# Type checking
yarn typecheck

# Linting
yarn lint
yarn lint:fix

# Tests
yarn test
yarn test:watch
yarn test:coverage
```

### 4. Library + Example App Development

When developing new features:

1. **Library Code** (`src/`):
   ```typescript
   // src/components/MyComponent/MyComponent.tsx
   export const MyComponent: React.FC<Props> = ({ ... }) => {
     // Implementation
   };
   ```

2. **Export from Index**:
   ```typescript
   // src/index.ts
   export { MyComponent } from './components/MyComponent';
   ```

3. **Use in Example App**:
   ```typescript
   // example/src/screens/DemoScreen.tsx
   import { MyComponent } from 'react-native-survey-js-ui';
   ```

4. **Test the Integration**:
   - Library rebuilds automatically (watch mode)
   - Example app hot reloads
   - Verify functionality on both platforms

## Testing Guide

### Test-Driven Development (TDD)

This project follows strict TDD practices:

1. **Write Test First**:
   ```typescript
   // src/components/MyComponent/MyComponent.test.tsx
   describe('MyComponent', () => {
     it('should render correctly', () => {
       const { getByText } = render(<MyComponent text="Hello" />);
       expect(getByText('Hello')).toBeTruthy();
     });
   });
   ```

2. **Run Test (Should Fail)**:
   ```bash
   yarn test MyComponent
   ```

3. **Implement Code**:
   ```typescript
   // src/components/MyComponent/MyComponent.tsx
   export const MyComponent: React.FC<{ text: string }> = ({ text }) => {
     return <Text>{text}</Text>;
   };
   ```

4. **Run Test (Should Pass)**:
   ```bash
   yarn test MyComponent
   ```

5. **Refactor** (if needed) while keeping tests green

### Testing Commands

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage

# Run specific test file
yarn test MyComponent

# Update snapshots
yarn test -u
```

### Writing Effective Tests

1. **Component Tests**:
   ```typescript
   import { render, fireEvent } from '@testing-library/react-native';
   
   it('handles user interaction', () => {
     const onPress = jest.fn();
     const { getByText } = render(<Button onPress={onPress} title="Click" />);
     
     fireEvent.press(getByText('Click'));
     expect(onPress).toHaveBeenCalled();
   });
   ```

2. **Integration Tests**:
   ```typescript
   it('integrates with survey-core', () => {
     const survey = new Model(surveyJson);
     const { getByTestId } = render(<Survey model={survey} />);
     
     expect(getByTestId('survey-container')).toBeTruthy();
   });
   ```

3. **Snapshot Tests**:
   ```typescript
   it('matches snapshot', () => {
     const tree = render(<MyComponent />).toJSON();
     expect(tree).toMatchSnapshot();
   });
   ```

### Coverage Requirements

- Minimum: 90% coverage for all new code
- Check coverage: `yarn test:coverage`
- View report: `open coverage/lcov-report/index.html`

## Debugging

### Library Code Debugging

1. **VS Code Setup**:
   ```json
   // .vscode/launch.json
   {
     "configurations": [
       {
         "name": "Debug Example App",
         "type": "reactnative",
         "request": "launch",
         "platform": "ios",
         "target": "iPhone 15",
         "sourceMaps": true,
         "cwd": "${workspaceFolder}/example"
       }
     ]
   }
   ```

2. **Console Debugging**:
   ```typescript
   // Add to your component
   console.log('Debug info:', { props, state });
   
   // View in Metro bundler console or device logs
   ```

3. **React DevTools**:
   ```bash
   # Install globally
   npm install -g react-devtools
   
   # Run while app is running
   react-devtools
   ```

### Common Debugging Scenarios

1. **Component Not Rendering**:
   - Check imports and exports
   - Verify build output in `lib/`
   - Check Metro bundler for errors

2. **Props Not Updating**:
   - Add console.logs in component
   - Check React DevTools
   - Verify state management

3. **Build Errors**:
   - Run `yarn clean && yarn build:prod`
   - Check TypeScript errors: `yarn typecheck`
   - Verify peer dependencies

## Troubleshooting

### Common Issues and Solutions

#### Metro Bundler Issues

**Problem**: Metro can't find module
```
Error: Unable to resolve module 'react-native-survey-js-ui'
```

**Solution**:
```bash
# Clear Metro cache
cd example
yarn start --reset-cache

# Or manually
rm -rf $TMPDIR/metro-*
```

#### Build Failures

**Problem**: TypeScript errors during build
```
error TS2345: Argument of type...
```

**Solution**:
```bash
# Check types
yarn typecheck

# Fix issues, then rebuild
yarn build:prod
```

#### iOS Build Issues

**Problem**: Pod installation fails
```
[!] CocoaPods could not find compatible versions
```

**Solution**:
```bash
cd example/ios
pod cache clean --all
rm -rf Pods Podfile.lock
pod install --repo-update
```

#### Android Build Issues

**Problem**: Gradle build fails
```
FAILURE: Build failed with an exception
```

**Solution**:
```bash
cd example/android
./gradlew clean
cd ..
yarn android
```

#### Test Failures

**Problem**: Tests fail after dependency update
```
FAIL src/components/Component.test.tsx
```

**Solution**:
```bash
# Clear Jest cache
yarn test --clearCache

# Update snapshots if needed
yarn test -u
```

## Performance Optimization

### Development Performance

1. **Fast Refresh Configuration**:
   ```javascript
   // example/metro.config.js
   module.exports = {
     // Optimized for development
   };
   ```

2. **Build Optimization**:
   ```bash
   # Use watch mode for faster rebuilds
   yarn build:dev
   ```

3. **Test Performance**:
   ```bash
   # Run only changed tests
   yarn test --watch --onlyChanged
   ```

### Runtime Performance

1. **Component Optimization**:
   ```typescript
   // Use React.memo for expensive components
   export const ExpensiveComponent = React.memo(({ data }) => {
     // Component implementation
   });
   ```

2. **Lazy Loading**:
   ```typescript
   // Lazy load heavy components
   const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
   ```

3. **Performance Testing**:
   ```typescript
   // Measure render performance
   import { measurePerformance } from '@testing-library/react-native';
   
   it('renders efficiently', () => {
     const { renderTime } = measurePerformance(() => {
       render(<MyComponent />);
     });
     
     expect(renderTime).toBeLessThan(100);
   });
   ```

## Release Process

### Pre-release Checklist

1. **Update Version**:
   ```bash
   # Update version in package.json
   yarn version --new-version 1.2.3
   ```

2. **Run Full Validation**:
   ```bash
   yarn validate
   yarn test:coverage
   ```

3. **Update Documentation**:
   - Update CHANGELOG.md
   - Update README if needed
   - Verify all docs are current

### Publishing to NPM

1. **Build and Test**:
   ```bash
   yarn build:prod
   yarn validate
   ```

2. **Publish**:
   ```bash
   npm publish
   # prepublishOnly script runs automatically
   ```

3. **Create Git Tag**:
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```

### Post-release

1. Create GitHub release with changelog
2. Update example app dependencies
3. Notify users of new release

## Command Reference

### Development Commands

| Command | Description |
|---------|-------------|
| `yarn build:dev` | Build library in watch mode |
| `yarn build:prod` | Production build with validation |
| `yarn clean` | Remove build artifacts |
| `yarn typecheck` | Run TypeScript type checking |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Auto-fix lint issues |

### Testing Commands

| Command | Description |
|---------|-------------|
| `yarn test` | Run all tests |
| `yarn test:watch` | Run tests in watch mode |
| `yarn test:coverage` | Generate coverage report |
| `yarn test:debug` | Run tests with debugger |

### Example App Commands

| Command | Description |
|---------|-------------|
| `yarn start` | Start Metro bundler |
| `yarn ios` | Run on iOS simulator |
| `yarn android` | Run on Android emulator |
| `yarn pod-install` | Install iOS dependencies |

### Validation Commands

| Command | Description |
|---------|-------------|
| `yarn validate` | Run all validation checks |
| `yarn validate:build` | Verify build output |
| `yarn prepublishOnly` | Pre-publish validation |

## Additional Resources

- [Build Process Documentation](./BUILD.md)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Metro Bundler](https://facebook.github.io/metro/)
- [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/)