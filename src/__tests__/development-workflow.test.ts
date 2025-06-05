// Development workflow tests

describe('Development Workflow', () => {
  describe('Build Scripts', () => {
    test('should have development build script', () => {
      const packageJson = require('../../package.json');
      expect(packageJson.scripts['build:dev']).toBeDefined();
      expect(packageJson.scripts['build:dev']).toContain('--watch');
    });

    test('should have production build script', () => {
      const packageJson = require('../../package.json');
      expect(packageJson.scripts['build:prod']).toBeDefined();
      expect(packageJson.scripts['build:prod']).toContain('typecheck');
    });

    test('should have clean script', () => {
      const packageJson = require('../../package.json');
      expect(packageJson.scripts.clean).toBeDefined();
      expect(packageJson.scripts.clean).toContain('del-cli lib');
    });

    test('should have validate script', () => {
      const packageJson = require('../../package.json');
      expect(packageJson.scripts.validate).toBeDefined();
      expect(packageJson.scripts.validate).toContain('typecheck');
      expect(packageJson.scripts.validate).toContain('lint');
      expect(packageJson.scripts.validate).toContain('test');
    });
  });

  describe('React Native Builder Bob Configuration', () => {
    const packageJson = require('../../package.json');
    const bobConfig = packageJson['react-native-builder-bob'];

    test('should have bob configuration', () => {
      expect(bobConfig).toBeDefined();
    });

    test('should specify source directory', () => {
      expect(bobConfig.source).toBe('src');
    });

    test('should specify output directory', () => {
      expect(bobConfig.output).toBe('lib');
    });

    test('should have CommonJS target', () => {
      const cjsTarget = bobConfig.targets.find((t: any) => t[0] === 'commonjs');
      expect(cjsTarget).toBeDefined();
      expect(cjsTarget[1].esm).toBe(false);
    });

    test('should have module target with ESM enabled', () => {
      const moduleTarget = bobConfig.targets.find(
        (t: any) => t[0] === 'module'
      );
      expect(moduleTarget).toBeDefined();
      expect(moduleTarget[1].esm).toBe(true);
    });

    test('should have typescript target', () => {
      const tsTarget = bobConfig.targets.find(
        (t: any) => t[0] === 'typescript'
      );
      expect(tsTarget).toBeDefined();
      expect(tsTarget[1].project).toBe('tsconfig.build.json');
    });
  });

  describe('NPM Package Distribution', () => {
    const packageJson = require('../../package.json');

    test('should have prepublishOnly script', () => {
      expect(packageJson.scripts.prepublishOnly).toBeDefined();
      expect(packageJson.scripts.prepublishOnly).toContain('build:prod');
      expect(packageJson.scripts.prepublishOnly).toContain('validate');
    });

    test('should include necessary files for distribution', () => {
      expect(packageJson.files).toContain('src');
      expect(packageJson.files).toContain('lib');
      expect(packageJson.files).not.toContain('example');
      expect(packageJson.files).not.toContain('scripts');
    });

    test('should exclude test files from distribution', () => {
      expect(packageJson.files).toContain('!**/__tests__');
      expect(packageJson.files).toContain('!**/__mocks__');
    });
  });
});
