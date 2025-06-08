/**
 * Library Packaging and Distribution Tests
 *
 * Tests that validate the library is properly packaged and ready for npm distribution.
 * This includes testing build output, package.json configuration, and TypeScript definitions.
 */

import fs from 'fs';
import path from 'path';

describe('Library Packaging Tests', () => {
  const rootDir = path.resolve(__dirname, '../../..');
  const libDir = path.join(rootDir, 'lib');
  const packageJsonPath = path.join(rootDir, 'package.json');

  describe('Build Output Validation', () => {
    test('lib directory exists and contains expected builds', () => {
      expect(fs.existsSync(libDir)).toBe(true);

      // Check for all build targets
      expect(fs.existsSync(path.join(libDir, 'commonjs'))).toBe(true);
      expect(fs.existsSync(path.join(libDir, 'module'))).toBe(true);
      expect(fs.existsSync(path.join(libDir, 'typescript'))).toBe(true);
    });

    test('CommonJS build contains required files', () => {
      const commonjsDir = path.join(libDir, 'commonjs');

      // Main export file
      expect(fs.existsSync(path.join(commonjsDir, 'index.js'))).toBe(true);

      // Component directories
      expect(
        fs.existsSync(
          path.join(commonjsDir, 'components', 'Survey', 'Survey.js')
        )
      ).toBe(true);
      expect(
        fs.existsSync(
          path.join(commonjsDir, 'components', 'Questions', 'index.js')
        )
      ).toBe(true);

      // Hooks directory
      expect(fs.existsSync(path.join(commonjsDir, 'hooks', 'index.js'))).toBe(
        true
      );

      // Utils directory
      expect(fs.existsSync(path.join(commonjsDir, 'utils', 'index.js'))).toBe(
        true
      );

      // Types directory
      expect(fs.existsSync(path.join(commonjsDir, 'types', 'index.js'))).toBe(
        true
      );

      // Package.json for module resolution
      expect(fs.existsSync(path.join(commonjsDir, 'package.json'))).toBe(true);
    });

    test('ES Module build contains required files', () => {
      const moduleDir = path.join(libDir, 'module');

      // Main export file
      expect(fs.existsSync(path.join(moduleDir, 'index.js'))).toBe(true);

      // Component directories
      expect(
        fs.existsSync(path.join(moduleDir, 'components', 'Survey', 'Survey.js'))
      ).toBe(true);
      expect(
        fs.existsSync(
          path.join(moduleDir, 'components', 'Questions', 'index.js')
        )
      ).toBe(true);

      // Hooks directory
      expect(fs.existsSync(path.join(moduleDir, 'hooks', 'index.js'))).toBe(
        true
      );

      // Utils directory
      expect(fs.existsSync(path.join(moduleDir, 'utils', 'index.js'))).toBe(
        true
      );

      // Types directory
      expect(fs.existsSync(path.join(moduleDir, 'types', 'index.js'))).toBe(
        true
      );

      // Package.json for module resolution
      expect(fs.existsSync(path.join(moduleDir, 'package.json'))).toBe(true);
    });

    test('TypeScript declarations are generated correctly', () => {
      const typescriptDir = path.join(libDir, 'typescript');

      // Check both module and commonjs declaration paths
      const moduleDeclarations = path.join(typescriptDir, 'module');
      const commonjsDeclarations = path.join(typescriptDir, 'commonjs');

      expect(fs.existsSync(moduleDeclarations)).toBe(true);
      expect(fs.existsSync(commonjsDeclarations)).toBe(true);

      // Main declaration file
      expect(fs.existsSync(path.join(moduleDeclarations, 'index.d.ts'))).toBe(
        true
      );
      expect(fs.existsSync(path.join(commonjsDeclarations, 'index.d.ts'))).toBe(
        true
      );

      // Component declarations
      expect(
        fs.existsSync(
          path.join(moduleDeclarations, 'components', 'Survey', 'Survey.d.ts')
        )
      ).toBe(true);
      expect(
        fs.existsSync(
          path.join(moduleDeclarations, 'components', 'Questions', 'index.d.ts')
        )
      ).toBe(true);

      // Hook declarations
      expect(
        fs.existsSync(path.join(moduleDeclarations, 'hooks', 'index.d.ts'))
      ).toBe(true);

      // Type declarations
      expect(
        fs.existsSync(path.join(moduleDeclarations, 'types', 'index.d.ts'))
      ).toBe(true);
      expect(
        fs.existsSync(
          path.join(moduleDeclarations, 'types', 'SurveyTypes.d.ts')
        )
      ).toBe(true);
    });

    test('Test files are excluded from build output', () => {
      const commonjsDir = path.join(libDir, 'commonjs');
      const moduleDir = path.join(libDir, 'module');

      // Test files should not exist in build output
      const testFilePatterns = [
        '**/*.test.js',
        '**/__tests__/**',
        '**/__mocks__/**',
        '**/test-utils/**',
      ];

      // Check for absence of test files
      expect(
        fs.existsSync(
          path.join(commonjsDir, 'components', 'Survey', 'Survey.test.js')
        )
      ).toBe(false);
      expect(
        fs.existsSync(
          path.join(moduleDir, 'components', 'Survey', 'Survey.test.js')
        )
      ).toBe(false);

      // Test utils should be excluded
      expect(fs.existsSync(path.join(commonjsDir, 'test-utils'))).toBe(false);
      expect(fs.existsSync(path.join(moduleDir, 'test-utils'))).toBe(false);
    });
  });

  describe('Package.json Configuration', () => {
    let packageJson: any;

    beforeAll(() => {
      const packageContent = fs.readFileSync(packageJsonPath, 'utf8');
      packageJson = JSON.parse(packageContent);
    });

    test('Package has correct entry points', () => {
      expect(packageJson.main).toBe('./lib/commonjs/index.js');
      expect(packageJson.module).toBe('./lib/module/index.js');
      expect(packageJson.types).toBe('./lib/typescript/module/index.d.ts');
    });

    test('Package exports are properly configured', () => {
      expect(packageJson.exports).toBeDefined();
      expect(packageJson.exports['.']).toBeDefined();

      const mainExport = packageJson.exports['.'];
      expect(mainExport.import).toBeDefined();
      expect(mainExport.require).toBeDefined();

      // Import configuration
      expect(mainExport.import.types).toBe(
        './lib/typescript/module/index.d.ts'
      );
      expect(mainExport.import.default).toBe('./lib/module/index.js');

      // Require configuration
      expect(mainExport.require.types).toBe(
        './lib/typescript/commonjs/index.d.ts'
      );
      expect(mainExport.require.default).toBe('./lib/commonjs/index.js');
    });

    test('Package has required metadata for npm distribution', () => {
      expect(packageJson.name).toBe('react-native-survey-js-ui');
      expect(packageJson.version).toBeDefined();
      expect(packageJson.description).toBeDefined();
      expect(packageJson.keywords).toBeInstanceOf(Array);
      expect(packageJson.keywords).toContain('react-native');
      expect(packageJson.keywords).toContain('surveyjs');
      expect(packageJson.author).toBeDefined();
      expect(packageJson.license).toBe('MIT');
      expect(packageJson.repository).toBeDefined();
    });

    test('Package has correct peer dependencies', () => {
      expect(packageJson.peerDependencies).toBeDefined();
      expect(packageJson.peerDependencies.react).toBeDefined();
      expect(packageJson.peerDependencies['react-native']).toBeDefined();
    });

    test('Package files configuration includes necessary files', () => {
      expect(packageJson.files).toBeInstanceOf(Array);
      expect(packageJson.files).toContain('src');
      expect(packageJson.files).toContain('lib');

      // Should exclude test files
      expect(packageJson.files).toContain('!**/__tests__');
      expect(packageJson.files).toContain('!**/__fixtures__');
      expect(packageJson.files).toContain('!**/__mocks__');
    });

    test('Package has npm publish configuration', () => {
      expect(packageJson.publishConfig).toBeDefined();
      expect(packageJson.publishConfig.registry).toBe(
        'https://registry.npmjs.org/'
      );
    });
  });

  describe('Main Export File Validation', () => {
    test('CommonJS main export file is valid JavaScript', () => {
      const mainFile = path.join(libDir, 'commonjs', 'index.js');
      const content = fs.readFileSync(mainFile, 'utf8');

      // Should contain expected exports
      expect(content).toContain('Survey');
      expect(content).not.toContain('test');

      // Should be valid JavaScript (no syntax errors)
      expect(() => {
        // This would throw if there are syntax errors
        require(mainFile);
      }).not.toThrow();
    });

    test('ES Module main export file is valid', () => {
      const mainFile = path.join(libDir, 'module', 'index.js');
      const content = fs.readFileSync(mainFile, 'utf8');

      // Should contain expected exports
      expect(content).toContain('export');
      expect(content).toContain('Survey');
      expect(content).not.toContain('test');

      // Should use ES module syntax
      expect(content).toMatch(/export\s+{.*}/);
    });

    test('TypeScript declaration file is valid', () => {
      const declarationFile = path.join(
        libDir,
        'typescript',
        'module',
        'index.d.ts'
      );
      const content = fs.readFileSync(declarationFile, 'utf8');

      // Should contain type exports
      expect(content).toContain('export');
      expect(content).toMatch(/declare|export/);

      // Should not contain implementation details
      expect(content).not.toContain('function (');
      expect(content).not.toContain('test');
    });
  });

  describe('Build Validation Scripts', () => {
    let packageJson: any;

    beforeAll(() => {
      const packageContent = fs.readFileSync(packageJsonPath, 'utf8');
      packageJson = JSON.parse(packageContent);
    });

    test('Package has build validation scripts', () => {
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts['build:verify']).toBeDefined();
      expect(packageJson.scripts['validate:build']).toBeDefined();
      expect(packageJson.scripts.prepublishOnly).toBeDefined();
    });

    test('TypeScript checking scripts are available', () => {
      expect(packageJson.scripts.typecheck).toBeDefined();
      expect(packageJson.scripts['typecheck:library']).toBeDefined();
      expect(packageJson.scripts['validate:declarations']).toBeDefined();
    });
  });

  describe('Bundle Size Validation', () => {
    test('Built files are reasonable size for npm distribution', () => {
      const mainFile = path.join(libDir, 'commonjs', 'index.js');
      const stats = fs.statSync(mainFile);

      // Main file should be less than 1MB (very generous limit)
      expect(stats.size).toBeLessThan(1024 * 1024);

      // Should be more than empty (contains actual code)
      expect(stats.size).toBeGreaterThan(100);
    });

    test('TypeScript declaration files are reasonable size', () => {
      const declarationFile = path.join(
        libDir,
        'typescript',
        'module',
        'index.d.ts'
      );
      const stats = fs.statSync(declarationFile);

      // Declaration file should be less than 100KB
      expect(stats.size).toBeLessThan(100 * 1024);

      // Should contain actual type definitions
      expect(stats.size).toBeGreaterThan(50);
    });
  });
});
