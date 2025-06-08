#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning test files from build output...');

function removeTestFiles(dir) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Remove test directories
      if (
        entry.name === '__tests__' ||
        entry.name === '__mocks__' ||
        entry.name === 'test-utils'
      ) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(
          `  Removed directory: ${fullPath.replace(process.cwd(), '.')}`
        );
      } else {
        removeTestFiles(fullPath);
      }
    } else {
      // Remove test files
      if (entry.name.includes('.test.') || entry.name.includes('.spec.')) {
        fs.unlinkSync(fullPath);
        console.log(`  Removed file: ${fullPath.replace(process.cwd(), '.')}`);
      }
    }
  });
}

const libPath = path.join(__dirname, '../lib');
removeTestFiles(libPath);

console.log('✅ Test files cleaned from build output');
