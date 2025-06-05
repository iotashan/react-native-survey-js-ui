const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Test helper to run commands and capture output
// eslint-disable-next-line no-unused-vars
function runCommand(command, options = {}) {
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      ...options,
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout || '' };
  }
}

// Test helper to check if a script exists in package.json
function scriptExists(scriptName) {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
  );
  return packageJson.scripts && packageJson.scripts[scriptName] !== undefined;
}

// Test cases for helper scripts
const tests = [
  {
    name: 'test:watch script exists',
    test: () => scriptExists('test:watch'),
    expected: true,
  },
  {
    name: 'test:coverage script exists',
    test: () => scriptExists('test:coverage'),
    expected: true,
  },
  {
    name: 'test:debug script exists',
    test: () => scriptExists('test:debug'),
    expected: true,
  },
  {
    name: 'lint:fix script exists',
    test: () => scriptExists('lint:fix'),
    expected: true,
  },
  {
    name: 'dev script exists',
    test: () => scriptExists('dev'),
    expected: true,
  },
  {
    name: 'dev:ios script exists',
    test: () => scriptExists('dev:ios'),
    expected: true,
  },
  {
    name: 'dev:android script exists',
    test: () => scriptExists('dev:android'),
    expected: true,
  },
  {
    name: 'check script exists',
    test: () => scriptExists('check'),
    expected: true,
  },
  {
    name: 'check:all script exists',
    test: () => scriptExists('check:all'),
    expected: true,
  },
  {
    name: 'reset script exists',
    test: () => scriptExists('reset'),
    expected: true,
  },
  {
    name: 'reset:cache script exists',
    test: () => scriptExists('reset:cache'),
    expected: true,
  },
  {
    name: 'info script exists',
    test: () => scriptExists('info'),
    expected: true,
  },
];

// Run tests
console.log('Testing helper scripts...\n');

let passed = 0;
let failed = 0;

tests.forEach((testCase) => {
  try {
    const result = testCase.test();
    if (result === testCase.expected) {
      console.log(`✅ ${testCase.name}`);
      passed++;
    } else {
      console.log(
        `❌ ${testCase.name} - Expected ${testCase.expected}, got ${result}`
      );
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${testCase.name} - Error: ${error.message}`);
    failed++;
  }
});

console.log(`\nTest Results: ${passed} passed, ${failed} failed`);

// Exit with error code if any tests failed
if (failed > 0) {
  process.exit(1);
}
