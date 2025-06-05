#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ERRORS = [];
const WARNINGS = [];

// Check if lib directory exists
const libPath = path.join(__dirname, '../lib');
if (!fs.existsSync(libPath)) {
  ERRORS.push(
    '❌ Build output directory "lib" does not exist. Run "yarn build" first.'
  );
} else {
  console.log('✅ Build output directory exists');

  // Check CommonJS output
  const commonjsPath = path.join(libPath, 'commonjs');
  if (!fs.existsSync(commonjsPath)) {
    ERRORS.push('❌ CommonJS output directory "lib/commonjs" does not exist');
  } else {
    console.log('✅ CommonJS output exists');

    // Check for index.js
    const indexPath = path.join(commonjsPath, 'index.js');
    if (!fs.existsSync(indexPath)) {
      ERRORS.push(
        '❌ CommonJS entry point "lib/commonjs/index.js" does not exist'
      );
    } else {
      console.log('✅ CommonJS entry point exists');
    }
  }

  // Check module output
  const modulePath = path.join(libPath, 'module');
  if (!fs.existsSync(modulePath)) {
    ERRORS.push('❌ ES module output directory "lib/module" does not exist');
  } else {
    console.log('✅ ES module output exists');

    // Check for index.js
    const indexPath = path.join(modulePath, 'index.js');
    if (!fs.existsSync(indexPath)) {
      ERRORS.push(
        '❌ ES module entry point "lib/module/index.js" does not exist'
      );
    } else {
      console.log('✅ ES module entry point exists');
    }
  }

  // Check TypeScript declarations
  const typescriptPath = path.join(libPath, 'typescript');
  if (!fs.existsSync(typescriptPath)) {
    ERRORS.push(
      '❌ TypeScript declaration directory "lib/typescript" does not exist'
    );
  } else {
    console.log('✅ TypeScript declarations directory exists');

    // Check for module index.d.ts
    const moduleIndexDtsPath = path.join(typescriptPath, 'module/index.d.ts');
    const commonjsIndexDtsPath = path.join(
      typescriptPath,
      'commonjs/index.d.ts'
    );

    if (!fs.existsSync(moduleIndexDtsPath)) {
      ERRORS.push(
        '❌ TypeScript declaration file "lib/typescript/module/index.d.ts" does not exist'
      );
    } else {
      console.log('✅ TypeScript module declaration file exists');
    }

    if (!fs.existsSync(commonjsIndexDtsPath)) {
      ERRORS.push(
        '❌ TypeScript declaration file "lib/typescript/commonjs/index.d.ts" does not exist'
      );
    } else {
      console.log('✅ TypeScript CommonJS declaration file exists');

      // Check for source maps
      const moduleMapPath = path.join(typescriptPath, 'module/index.d.ts.map');
      if (!fs.existsSync(moduleMapPath)) {
        WARNINGS.push(
          '⚠️  Source map "lib/typescript/module/index.d.ts.map" does not exist'
        );
      } else {
        console.log('✅ Source maps exist');
      }
    }
  }
}

// Check package.json configuration
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Validate main field
if (packageJson.main !== './lib/commonjs/index.js') {
  ERRORS.push(
    '❌ package.json "main" field is not set to "./lib/commonjs/index.js"'
  );
} else {
  console.log('✅ package.json "main" field is correct');
}

// Validate module field
if (packageJson.module !== './lib/module/index.js') {
  ERRORS.push(
    '❌ package.json "module" field is not set to "./lib/module/index.js"'
  );
} else {
  console.log('✅ package.json "module" field is correct');
}

// Validate types field
if (packageJson.types !== './lib/typescript/module/index.d.ts') {
  ERRORS.push(
    '❌ package.json "types" field is not set to "./lib/typescript/module/index.d.ts"'
  );
} else {
  console.log('✅ package.json "types" field is correct');
}

// Validate exports
if (!packageJson.exports || !packageJson.exports['.']) {
  ERRORS.push('❌ package.json "exports" field is not properly configured');
} else {
  console.log('✅ package.json "exports" field exists');
}

// Validate files array
if (!packageJson.files || !packageJson.files.includes('lib')) {
  ERRORS.push('❌ package.json "files" array does not include "lib" directory');
} else {
  console.log('✅ package.json "files" array includes build output');
}

// Summary
const totalChecks = 12; // Updated count of checks
console.log('\n📊 Build Validation Summary:');
console.log(`✅ Passed: ${totalChecks - ERRORS.length - WARNINGS.length}`);
console.log(`⚠️  Warnings: ${WARNINGS.length}`);
console.log(`❌ Errors: ${ERRORS.length}`);

if (WARNINGS.length > 0) {
  console.log('\n⚠️  Warnings:');
  WARNINGS.forEach((warning) => console.log(warning));
}

if (ERRORS.length > 0) {
  console.log('\n❌ Errors:');
  ERRORS.forEach((error) => console.log(error));
  process.exit(1);
} else {
  console.log('\n✅ Build validation passed!');
}
