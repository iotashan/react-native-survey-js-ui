import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

const packageJsonPath = path.resolve(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

describe('Semantic Versioning Configuration', () => {
  describe('release-it configuration', () => {
    it('should have release-it configured', () => {
      expect(packageJson['release-it']).toBeDefined();
    });

    it('should have git configuration for releases', () => {
      const releaseIt = packageJson['release-it'];
      expect(releaseIt.git).toBeDefined();
      expect(releaseIt.git.commitMessage).toBeDefined();
      expect(releaseIt.git.commitMessage).toContain('${version}');
      expect(releaseIt.git.tagName).toBeDefined();
      expect(releaseIt.git.tagName).toContain('${version}');
    });

    it('should have npm publish configuration', () => {
      const releaseIt = packageJson['release-it'];
      expect(releaseIt.npm).toBeDefined();
      expect(releaseIt.npm.publish).toBe(true);
    });

    it('should have github release configuration', () => {
      const releaseIt = packageJson['release-it'];
      expect(releaseIt.github).toBeDefined();
      expect(releaseIt.github.release).toBe(true);
    });

    it('should have conventional changelog plugin', () => {
      const releaseIt = packageJson['release-it'];
      expect(releaseIt.plugins).toBeDefined();
      expect(
        releaseIt.plugins['@release-it/conventional-changelog']
      ).toBeDefined();
      expect(
        releaseIt.plugins['@release-it/conventional-changelog'].preset
      ).toBeDefined();
    });
  });

  describe('version scripts', () => {
    it('should have version bump scripts', () => {
      expect(packageJson.scripts['version:patch']).toBeDefined();
      expect(packageJson.scripts['version:minor']).toBeDefined();
      expect(packageJson.scripts['version:major']).toBeDefined();
      expect(packageJson.scripts['version:prerelease']).toBeDefined();
    });

    it('should have dry-run version scripts', () => {
      expect(packageJson.scripts['version:patch:dry']).toBeDefined();
      expect(packageJson.scripts['version:minor:dry']).toBeDefined();
      expect(packageJson.scripts['version:major:dry']).toBeDefined();
    });

    it('should have changelog generation script', () => {
      expect(packageJson.scripts.changelog).toBeDefined();
    });
  });

  describe('commitlint configuration', () => {
    it('should have commitlint configured', () => {
      expect(packageJson.commitlint).toBeDefined();
      expect(packageJson.commitlint.extends).toContain(
        '@commitlint/config-conventional'
      );
    });

    it('should have commitlint in devDependencies', () => {
      expect(
        packageJson.devDependencies['@commitlint/config-conventional']
      ).toBeDefined();
      expect(packageJson.devDependencies.commitlint).toBeDefined();
    });
  });

  describe('version validation', () => {
    it('should have a valid semver version', () => {
      const semverRegex =
        /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
      expect(packageJson.version).toMatch(semverRegex);
    });

    it('should be a pre-1.0 version for initial development', () => {
      const [major] = packageJson.version.split('.');
      expect(parseInt(major)).toBe(0);
    });
  });

  describe('npm version lifecycle scripts', () => {
    it('should have preversion script for validation', () => {
      expect(packageJson.scripts.preversion).toBeDefined();
      expect(packageJson.scripts.preversion).toContain('validate');
    });

    it('should have version script for building', () => {
      expect(packageJson.scripts.version).toBeDefined();
      expect(packageJson.scripts.version).toContain('build');
    });

    it('should have postversion script for git operations', () => {
      expect(packageJson.scripts.postversion).toBeDefined();
      expect(packageJson.scripts.postversion).toContain('git push');
    });
  });
});
