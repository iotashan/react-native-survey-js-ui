import * as fs from 'fs';
import * as path from 'path';

describe('Build Process', () => {
  describe('Build Output Structure', () => {
    const libPath = path.join(__dirname, '../../lib');

    test('should generate ES module output', () => {
      const modulePath = path.join(libPath, 'module');
      expect(fs.existsSync(modulePath)).toBe(true);
    });

    test('should generate CommonJS output', () => {
      const commonjsPath = path.join(libPath, 'commonjs');
      expect(fs.existsSync(commonjsPath)).toBe(true);
    });

    test('should generate TypeScript declaration files', () => {
      const typescriptPath = path.join(libPath, 'typescript');
      expect(fs.existsSync(typescriptPath)).toBe(true);
    });

    test('should generate index.js in module directory', () => {
      const indexPath = path.join(libPath, 'module/index.js');
      expect(fs.existsSync(indexPath)).toBe(true);
    });

    test('should generate index.js in commonjs directory', () => {
      const indexPath = path.join(libPath, 'commonjs/index.js');
      expect(fs.existsSync(indexPath)).toBe(true);
    });

    test('should generate index.d.ts for module format', () => {
      const indexDtsPath = path.join(libPath, 'typescript/module/index.d.ts');
      expect(fs.existsSync(indexDtsPath)).toBe(true);
    });

    test('should generate index.d.ts for commonjs format', () => {
      const indexDtsPath = path.join(libPath, 'typescript/commonjs/index.d.ts');
      expect(fs.existsSync(indexDtsPath)).toBe(true);
    });

    test('should generate source maps for debugging', () => {
      const indexMapPath = path.join(
        libPath,
        'typescript/module/index.d.ts.map'
      );
      expect(fs.existsSync(indexMapPath)).toBe(true);
    });
  });

  describe('Package.json Configuration', () => {
    const packageJson = require('../../package.json');

    test('should have correct main entry point for CommonJS', () => {
      expect(packageJson.main).toBe('./lib/commonjs/index.js');
    });

    test('should have correct module entry point for ES modules', () => {
      expect(packageJson.module).toBe('./lib/module/index.js');
    });

    test('should have correct types entry point', () => {
      expect(packageJson.types).toBe('./lib/typescript/module/index.d.ts');
    });

    test('should have correct exports configuration', () => {
      expect(packageJson.exports['.']).toBeDefined();
      expect(packageJson.exports['.'].source).toBe('./src/index.ts');
      expect(packageJson.exports['.'].import.types).toBe(
        './lib/typescript/module/index.d.ts'
      );
      expect(packageJson.exports['.'].import.default).toBe(
        './lib/module/index.js'
      );
      expect(packageJson.exports['.'].require.types).toBe(
        './lib/typescript/commonjs/index.d.ts'
      );
      expect(packageJson.exports['.'].require.default).toBe(
        './lib/commonjs/index.js'
      );
    });

    test('should include necessary files in npm package', () => {
      expect(packageJson.files).toContain('src');
      expect(packageJson.files).toContain('lib');
    });

    test('should have build scripts configured', () => {
      expect(packageJson.scripts.prepare).toBeDefined();
      expect(packageJson.scripts.clean).toBeDefined();
      expect(packageJson.scripts.typecheck).toBeDefined();
    });
  });
});
