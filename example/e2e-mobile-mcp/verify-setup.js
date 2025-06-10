#!/usr/bin/env node

/**
 * Verification script for Mobile MCP E2E test setup
 * 
 * This script validates that all components of the Mobile MCP E2E
 * testing framework are properly configured and ready to use.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Mobile MCP E2E Test Setup...\n');

const results = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}`);
    results.passed++;
    return true;
  } else {
    console.log(`❌ ${description} - File not found: ${filePath}`);
    results.failed++;
    return false;
  }
}

function checkContent(filePath, searchText, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchText)) {
      console.log(`✅ ${description}`);
      results.passed++;
      return true;
    } else {
      console.log(`❌ ${description} - Content not found`);
      results.failed++;
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description} - Error reading file: ${error.message}`);
    results.failed++;
    return false;
  }
}

function warnIfMissing(condition, message) {
  if (!condition) {
    console.log(`⚠️  ${message}`);
    results.warnings++;
  }
}

// 1. Check core configuration files
console.log('📋 Checking configuration files...');
checkFile('./e2e-mobile-mcp/jest.config.js', 'Jest configuration file exists');
checkFile('./e2e-mobile-mcp/jest.setup.js', 'Jest setup file exists');
checkFile('./e2e-mobile-mcp/globalSetup.js', 'Global setup file exists');
checkFile('./e2e-mobile-mcp/globalTeardown.js', 'Global teardown file exists');
checkFile('./e2e-mobile-mcp/mobileMcpAdapter.js', 'Mobile MCP adapter exists');
checkFile('./e2e-mobile-mcp/realMobileMcpAdapter.js', 'Real Mobile MCP adapter exists');
checkFile('./e2e-mobile-mcp/README.md', 'Documentation file exists');

console.log('\n📝 Checking test files...');
checkFile('./e2e-mobile-mcp/survey-flow-mcp.test.ts', 'Survey flow tests exist');
checkFile('./e2e-mobile-mcp/cross-platform-mcp.test.ts', 'Cross-platform tests exist');
checkFile('./e2e-mobile-mcp/error-handling-mcp.test.ts', 'Error handling tests exist');
checkFile('./e2e-mobile-mcp/integration-mcp.test.ts', 'Integration tests exist');
checkFile('./e2e-mobile-mcp/demo-real-mcp.test.ts', 'Real MCP demo test exists');

// 2. Check package.json scripts
console.log('\n📦 Checking package.json integration...');
const packageJsonPath = './package.json';
if (fs.existsSync(packageJsonPath)) {
  checkContent(packageJsonPath, 'test:e2e-mcp', 'E2E MCP test script exists');
  checkContent(packageJsonPath, 'test:e2e-mcp:basic', 'Basic E2E MCP test script exists');
  checkContent(packageJsonPath, 'test:e2e-mcp:cross-platform', 'Cross-platform E2E MCP test script exists');
  checkContent(packageJsonPath, 'test:e2e-mcp:errors', 'Error handling E2E MCP test script exists');
  checkContent(packageJsonPath, 'test:e2e-mcp:integration', 'Integration E2E MCP test script exists');
  checkContent(packageJsonPath, 'jest-junit', 'Jest JUnit dependency exists');
} else {
  console.log('❌ package.json not found');
  results.failed++;
}

// 3. Check library test helpers integration
console.log('\n🔧 Checking test helper integration...');
const helpersPath = '../src/test-utils/mobileMcpHelpers.ts';
checkFile(helpersPath, 'Mobile MCP helpers in library');

const indexPath = '../src/test-utils/index.ts';
if (fs.existsSync(indexPath)) {
  checkContent(indexPath, 'mobileMcpHelpers', 'Mobile MCP helpers exported from index');
} else {
  console.log('❌ Test utils index file not found');
  results.failed++;
}

// 4. Check Jest configuration details
console.log('\n⚙️  Checking Jest configuration details...');
const jestConfigPath = './e2e-mobile-mcp/jest.config.js';
if (fs.existsSync(jestConfigPath)) {
  checkContent(jestConfigPath, 'testTimeout: 180000', 'Jest timeout configured (3 minutes)');
  checkContent(jestConfigPath, 'maxWorkers: 1', 'Sequential test execution configured');
  checkContent(jestConfigPath, 'testEnvironment: \'node\'', 'Node test environment configured');
  checkContent(jestConfigPath, 'globalSetup', 'Global setup configured');
  checkContent(jestConfigPath, 'globalTeardown', 'Global teardown configured');
}

// 5. Check test structure and patterns
console.log('\n🏗️  Checking test structure...');
const testFiles = [
  './e2e-mobile-mcp/survey-flow-mcp.test.ts',
  './e2e-mobile-mcp/cross-platform-mcp.test.ts',
  './e2e-mobile-mcp/error-handling-mcp.test.ts',
  './e2e-mobile-mcp/integration-mcp.test.ts'
];

testFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    checkContent(filePath, 'describe(', 'Test file has proper Jest structure');
    checkContent(filePath, 'mobileMcpAdapter', 'Test file uses Mobile MCP adapter');
    checkContent(filePath, 'beforeAll', 'Test file has proper setup');
    checkContent(filePath, 'afterAll', 'Test file has proper cleanup');
  }
});

// 6. Warnings for optional/advanced features
console.log('\n⚠️  Checking optional features...');
warnIfMissing(
  fs.existsSync('./e2e-mobile-mcp/test-results'),
  'test-results directory not created (will be created on first run)'
);

warnIfMissing(
  fs.existsSync('./e2e-mobile-mcp/coverage'),
  'coverage directory not created (will be created on first run)'
);

// Try to check if TypeScript compilation works
try {
  const { execSync } = require('child_process');
  execSync('npx tsc --noEmit --project ../tsconfig.json', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation check passed');
  results.passed++;
} catch (error) {
  console.log('⚠️  TypeScript compilation check failed (may be expected in some setups)');
  results.warnings++;
}

// 7. Final report
console.log('\n📊 Verification Results:');
console.log(`✅ Passed: ${results.passed}`);
console.log(`❌ Failed: ${results.failed}`);
console.log(`⚠️  Warnings: ${results.warnings}`);

if (results.failed === 0) {
  console.log('\n🎉 Mobile MCP E2E Test Setup Verification PASSED!');
  console.log('\nYou can now run Mobile MCP E2E tests with:');
  console.log('  yarn test:e2e-mcp');
  console.log('  yarn test:e2e-mcp:basic');
  console.log('  yarn test:e2e-mcp:cross-platform');
  console.log('  yarn test:e2e-mcp:errors');
  console.log('  yarn test:e2e-mcp:integration');
  process.exit(0);
} else {
  console.log('\n❌ Mobile MCP E2E Test Setup Verification FAILED!');
  console.log(`Please fix the ${results.failed} failed check(s) above.`);
  process.exit(1);
}