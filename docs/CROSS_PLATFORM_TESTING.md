# Cross-Platform Testing Guide

This guide explains the cross-platform testing infrastructure for react-native-survey-js-ui.

## Overview

Our testing strategy ensures the library works correctly on both iOS and Android platforms through:

1. **Platform-specific unit tests** - Test platform-specific behavior
2. **E2E tests with Detox** - Test complete user flows on real devices/simulators
3. **CI/CD integration** - Automated testing on every commit

## Testing Architecture

### Unit Tests

Platform-specific unit tests use our custom utilities in `src/test-utils/platformUtils.ts`:

```typescript
import { describeIOS, describeAndroid, describeCrossPlatform } from 'react-native-survey-js-ui/test-utils';

describeCrossPlatform('Core functionality', () => {
  // Tests that run on both platforms
});

describeIOS('iOS-specific behavior', () => {
  // Tests that only run on iOS
});

describeAndroid('Android-specific behavior', () => {
  // Tests that only run on Android
});
```

### E2E Tests

E2E tests use Detox with WebDriverAgent (iOS) and UI Automator (Android):

```typescript
describe('Survey Flow', () => {
  it('should complete survey on both platforms', async () => {
    await element(by.id('survey-demo-tab')).tap();
    await element(by.id('question-name')).typeText('John Doe');
    await element(by.id('survey-complete-button')).tap();
  });
});
```

## Local Testing

### Prerequisites

#### iOS Testing
- macOS with Xcode installed
- iOS Simulator
- WebDriverAgent (already at `/Users/shan/WebDriverAgent`)

#### Android Testing
- Android Studio with SDK installed
- Android Emulator or physical device
- Java 11 or higher

### Running Tests Locally

#### Unit Tests
```bash
# Run all tests
yarn test

# Run with platform set
PLATFORM=ios yarn test
PLATFORM=android yarn test
```

#### E2E Tests
```bash
cd example

# iOS
yarn detox build --configuration ios.sim.debug
yarn detox test --configuration ios.sim.debug

# Android
yarn detox build --configuration android.emu.debug
yarn detox test --configuration android.emu.debug
```

## CI/CD Integration

### GitHub Actions Workflows

We have separate workflows for each platform:

1. **`.github/workflows/test-ios.yml`** - Runs on macOS runners
2. **`.github/workflows/test-android.yml`** - Runs on Ubuntu runners

### Test Matrix

| Platform | Unit Tests | E2E Tests | Build Validation |
|----------|------------|-----------|------------------|
| iOS      | ✅         | ✅        | ✅               |
| Android  | ✅         | ✅        | ✅               |

## Platform-Specific Considerations

### iOS

- Tests run on iPhone 14 simulator with iOS 17.5
- Uses WebDriverAgent for automation
- Handles iOS-specific features like Safe Area

### Android

- Tests run on Pixel 4 emulator with API 31
- Uses UI Automator for automation
- Handles Android-specific features like back button

## Writing Platform-Specific Tests

### 1. Component Tests

```typescript
import { Survey } from '../Survey';
import { describeIOS, getPlatformTestData } from '../../../test-utils';

describeIOS('Survey iOS behavior', () => {
  it('should handle iOS keyboard', () => {
    const { getByTestId } = render(<Survey model={survey} />);
    // iOS-specific keyboard handling
  });
});
```

### 2. Integration Tests

```typescript
describe('Cross-platform integration', () => {
  it('should handle orientation changes', async () => {
    await device.setOrientation('landscape');
    await expect(element(by.id('survey-container'))).toBeVisible();
  });
});
```

### 3. Platform Detection

```typescript
if (device.getPlatform() === 'ios') {
  // iOS-specific test logic
} else {
  // Android-specific test logic
}
```

## Test Utilities

### Platform Detection
- `isIOS()` - Check if running on iOS
- `isAndroid()` - Check if running on Android
- `getPlatformTestData(ios, android)` - Get platform-specific test data

### Platform-Specific Test Runners
- `describeIOS/testIOS` - Run tests only on iOS
- `describeAndroid/testAndroid` - Run tests only on Android
- `describeCrossPlatform` - Run tests on both platforms

### Platform Mocks
- `setupPlatformMocks()` - Set up platform-specific mocks

## Troubleshooting

### iOS Issues

1. **Simulator not found**
   ```bash
   xcrun simctl list devices
   ```

2. **WebDriverAgent issues**
   ```bash
   cd /Users/shan/WebDriverAgent
   ./Scripts/bootstrap.sh
   ```

### Android Issues

1. **Emulator not starting**
   ```bash
   emulator -list-avds
   emulator @Pixel_4_API_31
   ```

2. **Gradle build failures**
   ```bash
   cd example/android
   ./gradlew clean
   ```

## Best Practices

1. **Always test on both platforms** - Don't assume cross-platform compatibility
2. **Use platform utilities** - Leverage our testing utilities for consistency
3. **Test real device behavior** - E2E tests catch issues unit tests miss
4. **Handle platform differences** - Account for UI/UX differences between platforms
5. **Keep tests maintainable** - Use test IDs and avoid brittle selectors

## Adding New Platform Tests

1. Create platform-specific test file:
   ```
   Component.ios.test.tsx    # iOS-only tests
   Component.android.test.tsx # Android-only tests
   Component.platform.test.tsx # Platform-aware tests
   ```

2. Use platform utilities for conditional testing

3. Add E2E tests for user-facing features

4. Ensure CI passes on both platforms before merging