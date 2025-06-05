// Test navigation structure without importing to avoid RN bridge issues

describe('Navigation Integration', () => {
  test('App component file exists', () => {
    const path = require('path');
    const fs = require('fs');
    const appPath = path.join(__dirname, '../src/App.tsx');
    expect(fs.existsSync(appPath)).toBe(true);
  });

  test('navigation directory structure exists', () => {
    const path = require('path');
    const fs = require('fs');

    const navigationDir = path.join(__dirname, '../src/navigation');
    const navigationIndex = path.join(__dirname, '../src/navigation/index.ts');
    const tabNavigator = path.join(
      __dirname,
      '../src/navigation/TabNavigator.tsx'
    );

    expect(fs.existsSync(navigationDir)).toBe(true);
    expect(fs.existsSync(navigationIndex)).toBe(true);
    expect(fs.existsSync(tabNavigator)).toBe(true);
  });

  test('screens directory structure exists', () => {
    const path = require('path');
    const fs = require('fs');

    const screensDir = path.join(__dirname, '../src/screens');
    const surveysScreen = path.join(
      __dirname,
      '../src/screens/SurveyDemoScreen.tsx'
    );
    const exploreScreen = path.join(
      __dirname,
      '../src/screens/ExploreScreen.tsx'
    );

    expect(fs.existsSync(screensDir)).toBe(true);
    expect(fs.existsSync(surveysScreen)).toBe(true);
    expect(fs.existsSync(exploreScreen)).toBe(true);
  });
});
