import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

const packageJsonPath = path.resolve(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

describe('NPM Distribution Configuration', () => {
  describe('package.json configuration', () => {
    it('should have required npm fields', () => {
      expect(packageJson.name).toBe('react-native-survey-js-ui');
      expect(packageJson.version).toBeDefined();
      expect(packageJson.description).toBeDefined();
      expect(packageJson.main).toBeDefined();
      expect(packageJson.module).toBeDefined();
      expect(packageJson.types).toBeDefined();
      expect(packageJson.license).toBeDefined();
      expect(packageJson.author).toBeDefined();
      expect(packageJson.repository).toBeDefined();
      expect(packageJson.keywords).toBeDefined();
      expect(packageJson.homepage).toBeDefined();
      expect(packageJson.bugs).toBeDefined();
    });

    it('should have correct entry points', () => {
      expect(packageJson.main).toBe('./lib/commonjs/index.js');
      expect(packageJson.module).toBe('./lib/module/index.js');
      expect(packageJson.types).toBe('./lib/typescript/module/index.d.ts');
    });

    it('should have exports field configured', () => {
      expect(packageJson.exports).toBeDefined();
      expect(packageJson.exports['.']).toBeDefined();
      expect(packageJson.exports['.'].source).toBe('./src/index.ts');
      expect(packageJson.exports['.'].import).toBeDefined();
      expect(packageJson.exports['.'].require).toBeDefined();
    });

    it('should have proper peer dependencies', () => {
      expect(packageJson.peerDependencies).toBeDefined();
      expect(packageJson.peerDependencies.react).toBe('*');
      expect(packageJson.peerDependencies['react-native']).toBe('*');
    });

    it('should have npm publish configuration', () => {
      expect(packageJson.publishConfig).toBeDefined();
      expect(packageJson.publishConfig.registry).toBe(
        'https://registry.npmjs.org/'
      );
    });

    it('should have files field configured', () => {
      expect(packageJson.files).toBeDefined();
      expect(Array.isArray(packageJson.files)).toBe(true);
      expect(packageJson.files).toContain('src');
      expect(packageJson.files).toContain('lib');

      // Should exclude test files
      expect(packageJson.files).toContain('!**/__tests__');
      expect(packageJson.files).toContain('!**/__mocks__');
      expect(packageJson.files).toContain('!**/__fixtures__');
    });

    it('should have prepublishOnly script', () => {
      expect(packageJson.scripts.prepublishOnly).toBeDefined();
      expect(packageJson.scripts.prepublishOnly).toContain('build');
      expect(packageJson.scripts.prepublishOnly).toContain('validate');
    });

    it('should have proper keywords for npm discovery', () => {
      const expectedKeywords = [
        'react-native',
        'surveyjs',
        'survey',
        'forms',
        'mobile',
        'offline',
      ];

      expectedKeywords.forEach((keyword) => {
        expect(packageJson.keywords).toContain(keyword);
      });
    });

    it('should have react-native field for compatibility', () => {
      expect(packageJson['react-native']).toBe('./src/index.ts');
    });

    it('should have sideEffects field set to false', () => {
      expect(packageJson.sideEffects).toBe(false);
    });
  });

  describe('version configuration', () => {
    it('should follow semantic versioning', () => {
      const versionRegex = /^\d+\.\d+\.\d+(-[\w.]+)?$/;
      expect(packageJson.version).toMatch(versionRegex);
    });

    it('should be in pre-1.0 version for initial release', () => {
      const [major] = packageJson.version.split('.');
      expect(parseInt(major)).toBe(0);
    });
  });

  describe('build configuration', () => {
    it('should have react-native-builder-bob configured', () => {
      expect(packageJson['react-native-builder-bob']).toBeDefined();
      expect(packageJson['react-native-builder-bob'].source).toBe('src');
      expect(packageJson['react-native-builder-bob'].output).toBe('lib');
    });

    it('should have correct build targets', () => {
      const targets = packageJson['react-native-builder-bob'].targets;
      expect(targets).toBeDefined();
      expect(targets.length).toBeGreaterThan(0);

      const targetTypes = targets.map((t: any[]) => t[0]);
      expect(targetTypes).toContain('commonjs');
      expect(targetTypes).toContain('module');
      expect(targetTypes).toContain('typescript');
    });
  });
});
