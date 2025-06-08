#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

console.log('🔍 Validating NPM Package Configuration...\n');

let errors = [];
let warnings = [];
let success = [];

// Check package name
if (packageJson.name && /^[a-z0-9-~][a-z0-9-._~]*$/.test(packageJson.name)) {
  success.push(`✅ Package name is valid: ${packageJson.name}`);
} else {
  errors.push('❌ Package name is invalid or missing');
}

// Check version
if (packageJson.version && /^\d+\.\d+\.\d+/.test(packageJson.version)) {
  success.push(`✅ Version is valid: ${packageJson.version}`);
} else {
  errors.push('❌ Version is invalid or missing');
}

// Check description
if (packageJson.description && packageJson.description.length > 10) {
  success.push('✅ Description is present');
} else {
  warnings.push('⚠️  Description is missing or too short');
}

// Check main entry point
if (packageJson.main) {
  const mainPath = path.join(__dirname, '..', packageJson.main);
  if (fs.existsSync(mainPath)) {
    success.push(`✅ Main entry point exists: ${packageJson.main}`);
  } else {
    errors.push(`❌ Main entry point does not exist: ${packageJson.main}`);
  }
} else {
  errors.push('❌ Main entry point is not specified');
}

// Check types entry point
if (packageJson.types) {
  const typesPath = path.join(__dirname, '..', packageJson.types);
  if (fs.existsSync(typesPath)) {
    success.push(`✅ TypeScript types exist: ${packageJson.types}`);
  } else {
    errors.push(`❌ TypeScript types do not exist: ${packageJson.types}`);
  }
}

// Check license
if (packageJson.license) {
  success.push(`✅ License is specified: ${packageJson.license}`);
} else {
  errors.push('❌ License is not specified');
}

// Check repository
if (packageJson.repository && packageJson.repository.url) {
  success.push('✅ Repository URL is specified');
} else {
  warnings.push('⚠️  Repository URL is missing');
}

// Check keywords
if (packageJson.keywords && packageJson.keywords.length > 0) {
  success.push(
    `✅ Keywords specified: ${packageJson.keywords.length} keywords`
  );
} else {
  warnings.push('⚠️  No keywords specified');
}

// Check peer dependencies
if (packageJson.peerDependencies) {
  success.push('✅ Peer dependencies are specified');
} else {
  warnings.push('⚠️  No peer dependencies specified');
}

// Check if README exists
const readmePath = path.join(__dirname, '..', 'README.md');
if (fs.existsSync(readmePath)) {
  success.push('✅ README.md exists');
} else {
  errors.push('❌ README.md is missing');
}

// Check if CHANGELOG exists
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
if (fs.existsSync(changelogPath)) {
  success.push('✅ CHANGELOG.md exists');
} else {
  warnings.push('⚠️  CHANGELOG.md is missing');
}

// Check package size
console.log('\n📦 Package Size Analysis:');
try {
  const output = execSync('npm pack --dry-run 2>&1', { encoding: 'utf-8' });
  const sizeMatch = output.match(/package size: ([\d.]+\s*[A-Z]+)/i);
  const unpackedMatch = output.match(/unpacked size: ([\d.]+\s*[A-Z]+)/i);
  const filesMatch = output.match(/total files: (\d+)/i);

  if (sizeMatch) {
    console.log(`  Package size: ${sizeMatch[1]}`);
  }
  if (unpackedMatch) {
    console.log(`  Unpacked size: ${unpackedMatch[1]}`);
  }
  if (filesMatch) {
    console.log(`  Total files: ${filesMatch[1]}`);
  }

  // Check if package is too large
  const sizeInKB = parseFloat(sizeMatch[1]);
  if (sizeInKB > 100) {
    warnings.push(`⚠️  Package size is large: ${sizeMatch[1]}`);
  } else {
    success.push(`✅ Package size is reasonable: ${sizeMatch[1]}`);
  }
} catch (error) {
  errors.push('❌ Failed to analyze package size');
}

// Check if .npmignore exists
const npmignorePath = path.join(__dirname, '..', '.npmignore');
if (fs.existsSync(npmignorePath)) {
  success.push('✅ .npmignore file exists');
} else {
  warnings.push('⚠️  .npmignore file is missing (using .gitignore)');
}

// Check exports field
if (packageJson.exports && packageJson.exports['.']) {
  success.push('✅ Exports field is configured');
} else {
  warnings.push('⚠️  Exports field is not configured (for modern Node.js)');
}

// Print results
console.log('\n📋 Validation Results:\n');

if (success.length > 0) {
  console.log('Success:');
  success.forEach((msg) => console.log(`  ${msg}`));
}

if (warnings.length > 0) {
  console.log('\nWarnings:');
  warnings.forEach((msg) => console.log(`  ${msg}`));
}

if (errors.length > 0) {
  console.log('\nErrors:');
  errors.forEach((msg) => console.log(`  ${msg}`));
  console.log('\n❌ NPM package validation failed!');
  process.exit(1);
} else {
  console.log('\n✅ NPM package validation passed!');

  if (warnings.length > 0) {
    console.log(
      `\n⚠️  ${warnings.length} warning(s) found - consider addressing them before publishing.`
    );
  }
}
