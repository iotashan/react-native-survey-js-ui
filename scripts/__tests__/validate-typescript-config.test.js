/**
 * Tests for TypeScript Configuration Validation Script
 * Following TDD approach - writing tests before implementation
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

describe('validate-typescript-config.js', () => {
  const scriptPath = path.join(__dirname, '..', 'validate-typescript-config.js');

  describe('Script Execution', () => {
    test('script should be executable', () => {
      expect(fs.existsSync(scriptPath)).toBe(true);
      const stats = fs.statSync(scriptPath);
      // Check if file has execute permissions (at least for owner)
      expect(stats.mode & 0o100).toBeTruthy();
    });

    test('script should exit with 0 when all configs are valid', () => {
      // Since our configs are valid, this should pass
      let exitCode = 0;
      try {
        execSync(`node ${scriptPath}`, { stdio: 'pipe' });
      } catch (error) {
        exitCode = error.status || 1;
      }
      expect(exitCode).toBe(0);
    });

    test('script should produce formatted output', () => {
      const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });
      
      // Check for expected output patterns
      expect(output).toContain('Validating TypeScript configuration');
      expect(output).toContain('Main Configuration');
      expect(output).toContain('Library Build Configuration');
      expect(output).toContain('CI Optimized Configuration');
      expect(output).toContain('Example App Configuration');
      expect(output).toContain('Test Configuration');
      expect(output).toContain('Summary');
    });
  });

  describe('Configuration Validation', () => {
    test('should validate main tsconfig.json has strict settings', () => {
      const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });
      
      // Check for strict type checking validation
      expect(output).toMatch(/Main Configuration.*\n.*Strict type checking.*PASS/s);
    });

    test('should validate library build config has declaration generation', () => {
      const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });
      
      // Check for declaration file generation
      expect(output).toMatch(/Library Build Configuration.*\n.*Declaration file generation.*PASS/s);
    });

    test('should validate CI config has performance optimizations', () => {
      const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });
      
      // Check for incremental compilation
      expect(output).toMatch(/CI Optimized Configuration.*\n.*Incremental compilation.*PASS/s);
    });

    test('should validate example app config extends main config', () => {
      const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });
      
      // Check for extends property
      expect(output).toMatch(/Example App Configuration.*\n.*Extends main configuration.*PASS/s);
    });

    test('should validate test config includes Jest types', () => {
      const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });
      
      // Check for Jest types inclusion
      expect(output).toMatch(/Test Configuration.*\n.*Includes Jest types.*PASS/s);
    });
  });

  describe('Summary Reporting', () => {
    test('should generate summary report with all results', () => {
      const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });
      
      // Check summary section
      expect(output).toContain('TypeScript Configuration Validation Summary');
      expect(output).toMatch(/PASS.*Main Configuration/);
      expect(output).toMatch(/PASS.*Library Build Configuration/);
      expect(output).toMatch(/PASS.*CI Optimized Configuration/);
      expect(output).toMatch(/PASS.*Example App Configuration/);
      expect(output).toMatch(/PASS.*Test Configuration/);
    });

    test('should display success message when all checks pass', () => {
      const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });
      
      expect(output).toContain('All TypeScript configurations follow best practices');
    });
  });

  describe('Best Practices Validation', () => {
    test('should check for critical TypeScript settings', () => {
      const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });
      
      // Critical settings that should be validated
      const criticalSettings = [
        'Strict type checking',
        'Declaration file generation',
        'Proper module resolution'
      ];

      criticalSettings.forEach(setting => {
        expect(output).toMatch(new RegExp(`${setting}.*PASS`, 's'));
      });
    });

    test('should differentiate between critical and non-critical settings', () => {
      const output = execSync(`node ${scriptPath}`, { encoding: 'utf8' });
      
      // Should use different indicators for critical vs non-critical
      expect(output).toContain('✅'); // Critical pass
      expect(output).toContain('ℹ️'); // Non-critical info
    });
  });

  describe('Error Handling', () => {
    test('script should handle missing TypeScript gracefully', () => {
      // This test would need to mock the environment
      // For now, we'll verify the script can run
      expect(() => {
        execSync(`node ${scriptPath}`, { stdio: 'pipe' });
      }).not.toThrow();
    });
  });
});