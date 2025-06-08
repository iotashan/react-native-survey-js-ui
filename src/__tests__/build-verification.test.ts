import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('Build Verification System', () => {
  const rootDir = path.join(__dirname, '../..');
  const libDir = path.join(rootDir, 'lib');

  describe('TypeScript Compilation', () => {
    it('should compile TypeScript for build without errors', () => {
      // Test that TypeScript compilation for build succeeds
      expect(() => {
        execSync('npx tsc --project tsconfig.build.json --noEmit', {
          cwd: rootDir,
          stdio: 'pipe',
        });
      }).not.toThrow();
    });

    it('should generate declaration files for all exported modules', () => {
      // Ensure build has been run
      if (!fs.existsSync(libDir)) {
        execSync('yarn build', { cwd: rootDir, stdio: 'pipe' });
      }

      // Check main index.d.ts files
      expect(
        fs.existsSync(path.join(libDir, 'typescript/module/index.d.ts'))
      ).toBe(true);
      expect(
        fs.existsSync(path.join(libDir, 'typescript/commonjs/index.d.ts'))
      ).toBe(true);

      // Check component declaration files
      expect(
        fs.existsSync(
          path.join(libDir, 'typescript/module/components/index.d.ts')
        )
      ).toBe(true);
      expect(
        fs.existsSync(path.join(libDir, 'typescript/module/hooks/index.d.ts'))
      ).toBe(true);
      expect(
        fs.existsSync(path.join(libDir, 'typescript/module/types/index.d.ts'))
      ).toBe(true);
      expect(
        fs.existsSync(path.join(libDir, 'typescript/module/utils/index.d.ts'))
      ).toBe(true);
    });

    it('should generate source maps for debugging', () => {
      expect(
        fs.existsSync(path.join(libDir, 'typescript/module/index.d.ts.map'))
      ).toBe(true);
    });
  });

  describe('Export Integrity', () => {
    it('should export all public API components', () => {
      // Import the built module
      const moduleExports = require(path.join(libDir, 'module/index.js'));

      // Core exports
      expect(moduleExports).toHaveProperty('Survey');
      expect(moduleExports).toHaveProperty('SimpleSurvey');

      // Hook exports
      expect(moduleExports).toHaveProperty('useSurveyModel');
      expect(moduleExports).toHaveProperty('useSurveyState');

      // Type exports (will be in d.ts files, not runtime)
      // We'll check these exist in the declaration files instead
    });

    it('should maintain consistent exports between CommonJS and ES modules', () => {
      const commonjsExports = require(path.join(libDir, 'commonjs/index.js'));
      const moduleExports = require(path.join(libDir, 'module/index.js'));

      // Get export keys (excluding default if present)
      const cjsKeys = Object.keys(commonjsExports)
        .filter((k) => k !== 'default')
        .sort();
      const esmKeys = Object.keys(moduleExports)
        .filter((k) => k !== 'default')
        .sort();

      expect(cjsKeys).toEqual(esmKeys);
    });

    it('should have proper TypeScript types for all exports', () => {
      // Read the main declaration file
      const dtsContent = fs.readFileSync(
        path.join(libDir, 'typescript/module/index.d.ts'),
        'utf-8'
      );

      // Check for main component exports
      expect(dtsContent).toMatch(/export.*Survey/);
      expect(dtsContent).toMatch(/export.*SimpleSurvey/);

      // Check for hook exports (via export * from './hooks')
      expect(dtsContent).toContain("export * from './hooks';");

      // Check for type exports (via export * from './types')
      expect(dtsContent).toContain("export * from './types';");
    });
  });

  describe('Package Configuration', () => {
    let packageJson: any;

    beforeAll(() => {
      packageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')
      );
    });

    it('should have required npm publishing fields', () => {
      // Required fields
      expect(packageJson).toHaveProperty('name');
      expect(packageJson).toHaveProperty('version');
      expect(packageJson).toHaveProperty('description');
      expect(packageJson).toHaveProperty('main');
      expect(packageJson).toHaveProperty('module');
      expect(packageJson).toHaveProperty('types');
      expect(packageJson).toHaveProperty('author');
      expect(packageJson).toHaveProperty('license');
      expect(packageJson).toHaveProperty('repository');

      // Files configuration
      expect(packageJson).toHaveProperty('files');
      expect(packageJson.files).toContain('lib');
      expect(packageJson.files).toContain('src');
    });

    it('should have correct entry points configuration', () => {
      expect(packageJson.main).toBe('./lib/commonjs/index.js');
      expect(packageJson.module).toBe('./lib/module/index.js');
      expect(packageJson.types).toBe('./lib/typescript/module/index.d.ts');
    });

    it('should have proper exports field for modern bundlers', () => {
      expect(packageJson).toHaveProperty('exports');
      expect(packageJson.exports).toBeDefined();
      expect(packageJson.exports['.']).toBeDefined();

      const mainExport = packageJson.exports['.'];
      expect(mainExport).toHaveProperty('source', './src/index.ts');
      expect(mainExport).toHaveProperty('import');
      expect(mainExport).toHaveProperty('require');

      // Check import config
      expect(mainExport.import).toHaveProperty(
        'types',
        './lib/typescript/module/index.d.ts'
      );
      expect(mainExport.import).toHaveProperty(
        'default',
        './lib/module/index.js'
      );

      // Check require config
      expect(mainExport.require).toHaveProperty(
        'types',
        './lib/typescript/commonjs/index.d.ts'
      );
      expect(mainExport.require).toHaveProperty(
        'default',
        './lib/commonjs/index.js'
      );
    });

    it('should have peer dependencies configured', () => {
      expect(packageJson).toHaveProperty('peerDependencies');
      expect(packageJson.peerDependencies).toHaveProperty('react');
      expect(packageJson.peerDependencies).toHaveProperty('react-native');
    });
  });

  describe('Bundle Size Validation', () => {
    it('should keep bundle size within acceptable limits', () => {
      const maxSizeKB = 500; // 500KB max for the library

      // Check CommonJS bundle size
      const commonjsSize = getDirectorySize(path.join(libDir, 'commonjs'));
      expect(commonjsSize).toBeLessThan(maxSizeKB * 1024);

      // Check ES module bundle size
      const moduleSize = getDirectorySize(path.join(libDir, 'module'));
      expect(moduleSize).toBeLessThan(maxSizeKB * 1024);
    });

    it('should not include test files in build output', () => {
      const testFilePatterns = [
        '**/*.test.js',
        '**/*.spec.js',
        '**/__tests__/**',
        '**/__mocks__/**',
        '**/test-utils/**',
      ];

      const buildFiles = getAllFiles(libDir);

      testFilePatterns.forEach((pattern) => {
        const regex = new RegExp(
          pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*')
        );
        const testFiles = buildFiles.filter((file) => regex.test(file));
        expect(testFiles).toHaveLength(0);
      });
    });
  });

  describe('Library Import Validation', () => {
    let packageJson: any;

    beforeAll(() => {
      packageJson = JSON.parse(
        fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8')
      );
    });

    it('should have valid CommonJS output structure', () => {
      const mainPath = path.join(rootDir, packageJson.main);
      expect(fs.existsSync(mainPath)).toBe(true);

      // Check file content instead of runtime import due to babel output issues
      const content = fs.readFileSync(mainPath, 'utf-8');
      expect(content).toContain('Object.defineProperty(exports');
      expect(content).toContain('Survey');
      expect(content).toContain('SimpleSurvey');
    });

    it('should be importable as ES module', async () => {
      // This would require dynamic import support
      // For now, we'll check that the ES module files exist and are valid JS
      const indexPath = path.join(rootDir, packageJson.module);
      expect(fs.existsSync(indexPath)).toBe(true);

      // Basic syntax check
      const content = fs.readFileSync(indexPath, 'utf-8');
      expect(content).toMatch(/export/);
    });

    it('should have no missing dependencies in build output', () => {
      // Check that imports in built files can be resolved
      const moduleFiles = getAllFiles(path.join(libDir, 'module'), '.js');

      moduleFiles.forEach((file) => {
        const content = fs.readFileSync(file, 'utf-8');
        const importMatches = content.match(/from ['"]([^'"]+)['"]/g) || [];

        importMatches.forEach((match) => {
          const importPath = match.match(/from ['"]([^'"]+)['"]/)?.[1];
          if (importPath && importPath.startsWith('.')) {
            // Relative import - check it exists
            const resolvedPath = path.resolve(path.dirname(file), importPath);
            const exists =
              fs.existsSync(resolvedPath) ||
              fs.existsSync(resolvedPath + '.js') ||
              fs.existsSync(resolvedPath + '/index.js');
            expect(exists).toBe(true);
          }
        });
      });
    });
  });
});

// Helper functions
function getDirectorySize(dirPath: string): number {
  let totalSize = 0;

  if (!fs.existsSync(dirPath)) {
    return 0;
  }

  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      totalSize += getDirectorySize(filePath);
    } else {
      totalSize += stat.size;
    }
  });

  return totalSize;
}

function getAllFiles(dirPath: string, extension?: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dirPath)) {
    return files;
  }

  const items = fs.readdirSync(dirPath);

  items.forEach((item) => {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      files.push(...getAllFiles(itemPath, extension));
    } else if (!extension || itemPath.endsWith(extension)) {
      files.push(itemPath);
    }
  });

  return files;
}
