#!/usr/bin/env node

/**
 * Comprehensive TypeScript validation script
 * Runs all TypeScript checks and provides detailed error reporting
 */

const { execSync } = require('child_process');
const chalk = require('chalk');

const checks = [
  {
    name: 'Library TypeScript Check',
    command: 'npx tsc --project tsconfig.build.json',
    description:
      'Validates library source code with strict TypeScript checking',
  },
  {
    name: 'Example App TypeScript Check',
    command: 'cd example && npx tsc --noEmit',
    description: 'Validates example app TypeScript code',
  },
  {
    name: 'TypeScript Declaration Validation',
    command:
      'npx tsc --noEmit --moduleResolution node --esModuleInterop --allowSyntheticDefaultImports lib/typescript/module/index.d.ts',
    description: 'Validates generated TypeScript declaration files',
    requiresBuild: true,
  },
];

let allPassed = true;
const results = [];

console.log(chalk.blue('🔍 Running comprehensive TypeScript validation...\n'));

for (const check of checks) {
  console.log(chalk.yellow(`Running: ${check.name}`));
  console.log(chalk.gray(`Description: ${check.description}`));

  if (check.requiresBuild) {
    console.log(chalk.gray('Note: This check requires a built library'));
  }

  try {
    const startTime = Date.now();
    execSync(check.command, {
      stdio: 'pipe',
      encoding: 'utf8',
    });
    const duration = Date.now() - startTime;

    console.log(chalk.green(`✅ ${check.name} passed (${duration}ms)\n`));
    results.push({ name: check.name, status: 'PASS', duration });
  } catch (error) {
    console.log(chalk.red(`❌ ${check.name} failed\n`));
    console.log(chalk.red('Error output:'));
    console.log(error.stdout || error.stderr || error.message);
    console.log('');

    results.push({
      name: check.name,
      status: 'FAIL',
      error: error.stdout || error.stderr,
    });
    allPassed = false;
  }
}

// Summary report
console.log(chalk.blue('📊 TypeScript Validation Summary:'));
console.log('='.repeat(50));

for (const result of results) {
  const status =
    result.status === 'PASS' ? chalk.green('PASS') : chalk.red('FAIL');
  const duration = result.duration ? ` (${result.duration}ms)` : '';
  console.log(`${status} ${result.name}${duration}`);
}

console.log('='.repeat(50));

if (allPassed) {
  console.log(chalk.green('🎉 All TypeScript validation checks passed!'));
  process.exit(0);
} else {
  console.log(chalk.red('💥 Some TypeScript validation checks failed.'));
  console.log(
    chalk.yellow('Please fix the TypeScript errors above and try again.')
  );
  process.exit(1);
}
