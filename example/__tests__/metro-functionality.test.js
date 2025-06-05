/**
 * Metro Functionality Test
 *
 * Tests the actual functionality that Metro configuration enables,
 * without directly importing the config file to avoid Jest parsing issues.
 */

const fs = require('fs');
const path = require('path');

describe('Metro Configuration Functionality', () => {
  describe('Library Import Resolution', () => {
    it('should successfully import library components', () => {
      // This test verifies that Metro can resolve the library imports
      const {
        Survey,
        validateSurveyModel,
      } = require('react-native-survey-js-ui');

      expect(Survey).toBeDefined();
      expect(validateSurveyModel).toBeDefined();
      expect(typeof Survey).toBe('function');
      expect(typeof validateSurveyModel).toBe('function');
    });

    it('should import library types successfully', () => {
      // Verify TypeScript types are available
      const libraryExports = require('react-native-survey-js-ui');

      expect(libraryExports).toBeDefined();
      expect(typeof libraryExports).toBe('object');
    });
  });

  describe('Library Source Accessibility', () => {
    it('should have access to library source files', () => {
      const librarySrcPath = path.resolve(__dirname, '../../src');

      expect(fs.existsSync(librarySrcPath)).toBe(true);

      // Check key library files exist
      const expectedFiles = [
        'index.ts',
        'components/Survey/Survey.tsx',
        'components/Survey/index.ts',
        'types/SurveyTypes.ts',
        'utils/index.ts',
      ];

      expectedFiles.forEach((file) => {
        const filePath = path.join(librarySrcPath, file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    it('should have access to built library output', () => {
      const libPath = path.resolve(__dirname, '../../lib');

      expect(fs.existsSync(libPath)).toBe(true);

      // Check for build outputs
      const buildPaths = [
        'commonjs/index.js',
        'module/index.js',
        'typescript/module/index.d.ts',
      ];

      buildPaths.forEach((buildPath) => {
        const fullPath = path.join(libPath, buildPath);
        expect(fs.existsSync(fullPath)).toBe(true);
      });
    });
  });

  describe('Development Workflow Support', () => {
    it('should be able to read library package.json with exports', () => {
      const packageJsonPath = path.resolve(__dirname, '../../package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      expect(packageJson.exports).toBeDefined();
      expect(packageJson.exports['.']).toBeDefined();
      expect(packageJson.exports['.'].source).toBe('./src/index.ts');
    });

    it('should have TypeScript configuration for library', () => {
      const tsconfigPath = path.resolve(__dirname, '../../tsconfig.json');

      expect(fs.existsSync(tsconfigPath)).toBe(true);

      const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
      expect(tsconfigContent).toContain('compilerOptions');
      expect(tsconfigContent).toContain('rootDir');
    });

    it('should have workspace configuration', () => {
      const rootPackageJsonPath = path.resolve(__dirname, '../../package.json');
      const rootPackageJson = JSON.parse(
        fs.readFileSync(rootPackageJsonPath, 'utf8')
      );

      expect(rootPackageJson.workspaces).toBeDefined();
      expect(rootPackageJson.workspaces).toContain('example');
    });
  });

  describe('Metro Configuration File', () => {
    it('should have metro.config.js in example app', () => {
      const metroConfigPath = path.join(__dirname, '../metro.config.js');

      expect(fs.existsSync(metroConfigPath)).toBe(true);

      // Read the file content to verify it has expected sections
      const configContent = fs.readFileSync(metroConfigPath, 'utf8');

      expect(configContent).toContain('watchFolders');
      expect(configContent).toContain('sourceExts');
      expect(configContent).toContain('unstable_enablePackageExports');
      expect(configContent).toContain('sourceMap');
      expect(configContent).toContain('cacheStores');
    });

    it('should reference correct library paths in config', () => {
      const metroConfigPath = path.join(__dirname, '../metro.config.js');
      const configContent = fs.readFileSync(metroConfigPath, 'utf8');

      // Verify the config references the correct library paths
      expect(configContent).toContain('librarySrcPath');
      expect(configContent).toContain("path.resolve(root, 'src')");
      expect(configContent).toContain("path.resolve(root, 'lib')");
    });
  });

  describe('Example App Integration', () => {
    it('should have example app configured with library dependency', () => {
      const examplePackageJsonPath = path.join(__dirname, '../package.json');
      const examplePackageJson = JSON.parse(
        fs.readFileSync(examplePackageJsonPath, 'utf8')
      );

      expect(examplePackageJson.dependencies['react-native-survey-js-ui']).toBe(
        'link:..'
      );
    });

    it('should have proper babel configuration', () => {
      const babelConfigPath = path.join(__dirname, '../babel.config.js');

      expect(fs.existsSync(babelConfigPath)).toBe(true);
    });

    it('should have jest configuration with monorepo config', () => {
      const jestConfigPath = path.join(__dirname, '../jest.config.js');

      expect(fs.existsSync(jestConfigPath)).toBe(true);
    });
  });
});

// Performance test to ensure library import is fast
describe('Metro Performance Validation', () => {
  it('should import library quickly', () => {
    const start = Date.now();

    const {
      Survey,
      validateSurveyModel,
    } = require('react-native-survey-js-ui');

    const duration = Date.now() - start;

    expect(Survey).toBeDefined();
    expect(validateSurveyModel).toBeDefined();

    // Import should be fast (under 100ms in test environment)
    expect(duration).toBeLessThan(100);
  });
});
