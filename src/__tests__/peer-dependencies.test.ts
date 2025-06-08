import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

const packageJsonPath = path.resolve(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

describe('Peer Dependencies Configuration', () => {
  describe('required peer dependencies', () => {
    it('should have React as peer dependency', () => {
      expect(packageJson.peerDependencies).toBeDefined();
      expect(packageJson.peerDependencies.react).toBeDefined();
    });

    it('should have React Native as peer dependency', () => {
      expect(packageJson.peerDependencies).toBeDefined();
      expect(packageJson.peerDependencies['react-native']).toBeDefined();
    });

    it('should use flexible version ranges for peer dependencies', () => {
      // Using "*" allows any version, giving maximum flexibility
      expect(packageJson.peerDependencies.react).toBe('*');
      expect(packageJson.peerDependencies['react-native']).toBe('*');
    });
  });

  describe('dependency configuration', () => {
    it('should not have React in dependencies', () => {
      expect(packageJson.dependencies?.react).toBeUndefined();
    });

    it('should not have React Native in dependencies', () => {
      expect(packageJson.dependencies?.['react-native']).toBeUndefined();
    });

    it('should have React in devDependencies for development', () => {
      expect(packageJson.devDependencies.react).toBeDefined();
      expect(packageJson.devDependencies['react-native']).toBeDefined();
    });
  });

  describe('survey-core dependency', () => {
    it('should have survey-core as a dependency', () => {
      expect(packageJson.dependencies).toBeDefined();
      expect(packageJson.dependencies['survey-core']).toBeDefined();
    });

    it('should use local survey-core-rn wrapper', () => {
      // Currently using local file reference for custom build
      expect(packageJson.dependencies['survey-core']).toBe(
        'file:./survey-core-rn'
      );
    });

    it('should document survey-core version in package.json', () => {
      expect(packageJson.surveyCoreVersion).toBeDefined();
      expect(packageJson.surveyCoreVersion).toMatch(/^\d+\.\d+\.\d+/);
    });
  });

  describe('peerDependenciesMeta configuration', () => {
    it('should consider adding peerDependenciesMeta for optional dependencies', () => {
      // This test documents that we might want to add peerDependenciesMeta
      // in the future for optional peer dependencies
      // For now, both React and React Native are required
      expect(packageJson.peerDependenciesMeta).toBeUndefined();
    });
  });

  describe('engines configuration', () => {
    it('should specify minimum Node.js version', () => {
      expect(packageJson.engines).toBeDefined();
      expect(packageJson.engines.node).toBeDefined();
      expect(packageJson.engines.node).toMatch(/>=\d+/);
    });

    it('should specify npm version if required', () => {
      if (packageJson.engines?.npm) {
        expect(packageJson.engines.npm).toMatch(/>=\d+/);
      }
    });
  });
});
