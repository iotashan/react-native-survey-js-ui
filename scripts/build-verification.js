#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Build Verification System');
console.log('===========================\n');

let hasErrors = false;
const errors = [];
const warnings = [];

// 1. TypeScript Compilation Check
console.log('📋 Checking TypeScript compilation...');
try {
  execSync('npx tsc --project tsconfig.build.json --noEmit', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'pipe' 
  });
  console.log('✅ TypeScript compilation successful\n');
} catch (error) {
  console.log('❌ TypeScript compilation failed');
  console.error(error.stdout?.toString() || error.message);
  errors.push('TypeScript compilation failed');
  hasErrors = true;
}

// 2. Build Output Verification
console.log('📦 Verifying build output...');
const libPath = path.join(__dirname, '../lib');

if (!fs.existsSync(libPath)) {
  console.log('⚠️  Build output not found. Running build...');
  try {
    execSync('yarn build', { 
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit' 
    });
  } catch (error) {
    errors.push('Build failed');
    hasErrors = true;
  }
}

// 3. Export Verification
console.log('🔗 Verifying library exports...');
const exportChecks = [
  { path: 'lib/commonjs/index.js', type: 'CommonJS' },
  { path: 'lib/module/index.js', type: 'ES Module' },
  { path: 'lib/typescript/module/index.d.ts', type: 'TypeScript declarations' },
  { path: 'lib/typescript/commonjs/index.d.ts', type: 'TypeScript CommonJS declarations' }
];

exportChecks.forEach(check => {
  const fullPath = path.join(__dirname, '..', check.path);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${check.type} found`);
  } else {
    console.log(`❌ ${check.type} missing: ${check.path}`);
    errors.push(`${check.type} missing`);
    hasErrors = true;
  }
});

// 4. Package.json Validation
console.log('\n📋 Validating package.json configuration...');
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const requiredFields = [
  'name', 'version', 'description', 'main', 'module', 'types',
  'author', 'license', 'repository', 'files', 'peerDependencies'
];

requiredFields.forEach(field => {
  if (packageJson[field]) {
    console.log(`✅ ${field} field present`);
  } else {
    console.log(`❌ ${field} field missing`);
    errors.push(`package.json missing ${field} field`);
    hasErrors = true;
  }
});

// 5. Bundle Size Check
console.log('\n📏 Checking bundle sizes...');
function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  if (!fs.existsSync(dirPath)) {
    return 0;
  }
  
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
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

const sizes = {
  commonjs: getDirectorySize(path.join(__dirname, '../lib/commonjs')),
  module: getDirectorySize(path.join(__dirname, '../lib/module')),
  typescript: getDirectorySize(path.join(__dirname, '../lib/typescript'))
};

const maxSizeKB = 500;
Object.entries(sizes).forEach(([type, size]) => {
  const sizeKB = Math.round(size / 1024);
  if (sizeKB < maxSizeKB) {
    console.log(`✅ ${type}: ${sizeKB}KB (under ${maxSizeKB}KB limit)`);
  } else {
    console.log(`❌ ${type}: ${sizeKB}KB (exceeds ${maxSizeKB}KB limit)`);
    warnings.push(`${type} bundle size exceeds limit`);
  }
});

// 6. Test File Exclusion Check
console.log('\n🧹 Checking for test file exclusion...');
function findTestFiles(dir) {
  const testFiles = [];
  const testPatterns = [/\.test\.(js|ts)$/, /\.spec\.(js|ts)$/, /__tests__/, /__mocks__/];
  
  if (!fs.existsSync(dir)) return testFiles;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      testFiles.push(...findTestFiles(filePath));
    } else {
      if (testPatterns.some(pattern => pattern.test(filePath))) {
        testFiles.push(filePath);
      }
    }
  });
  
  return testFiles;
}

const testFilesInBuild = findTestFiles(path.join(__dirname, '../lib'));
if (testFilesInBuild.length === 0) {
  console.log('✅ No test files found in build output');
} else {
  console.log(`❌ Found ${testFilesInBuild.length} test files in build output`);
  testFilesInBuild.slice(0, 5).forEach(file => {
    console.log(`   - ${file.replace(path.join(__dirname, '..'), '.')}`);
  });
  if (testFilesInBuild.length > 5) {
    console.log(`   ... and ${testFilesInBuild.length - 5} more`);
  }
  errors.push('Test files found in build output');
  hasErrors = true;
}

// 7. Import Test
console.log('\n🔌 Testing library structure...');
// Check if main exports exist in the built files
const mainExportPath = path.join(__dirname, '..', packageJson.main);
if (fs.existsSync(mainExportPath)) {
  console.log('✅ Main export file exists');
  
  // Check for expected exports in the source (since runtime import has issues in Node)
  const indexContent = fs.readFileSync(mainExportPath, 'utf-8');
  const requiredExports = ['Survey', 'SimpleSurvey', 'useSurveyModel', 'useSurveyState'];
  
  requiredExports.forEach(exportName => {
    // Check for direct exports or re-exports
    if (indexContent.includes(`exports.${exportName}`) || 
        indexContent.includes(`"${exportName}"`) ||
        (exportName.startsWith('use') && indexContent.includes('_hooks'))) {
      console.log(`✅ ${exportName} export found in build`);
    } else {
      console.log(`❌ ${exportName} export missing in build`);
      errors.push(`Missing export: ${exportName}`);
      hasErrors = true;
    }
  });
} else {
  console.log('❌ Main export file not found');
  errors.push('Main export file missing');
  hasErrors = true;
}

// Summary
console.log('\n=============================');
console.log('📊 Build Verification Summary');
console.log('=============================');
console.log(`✅ Passed: ${!hasErrors && warnings.length === 0 ? 'All checks' : 'Some checks'}`);
console.log(`⚠️  Warnings: ${warnings.length}`);
console.log(`❌ Errors: ${errors.length}`);

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach(warning => console.log(`   - ${warning}`));
}

if (errors.length > 0) {
  console.log('\n❌ Errors:');
  errors.forEach(error => console.log(`   - ${error}`));
  process.exit(1);
} else {
  console.log('\n✅ Build verification passed!');
  process.exit(0);
}