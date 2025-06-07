# Build Verification System

## Overview

The react-native-survey-js-ui library includes a comprehensive build verification system to ensure distribution readiness and maintain quality standards for npm publishing.

## Build Scripts

### `yarn build`
Standard build command that:
1. Cleans previous build output
2. Compiles TypeScript and JavaScript using react-native-builder-bob
3. Removes test files from build output

### `yarn build:prod`
Production build that additionally:
1. Runs TypeScript type checking before build
2. Ensures all TypeScript errors are resolved
3. Performs the same build and cleanup steps

### `yarn build:verify`
Comprehensive build verification that checks:
- ✅ TypeScript compilation success
- ✅ Build output structure
- ✅ Export integrity
- ✅ Package.json configuration
- ✅ Bundle size limits
- ✅ Test file exclusion
- ✅ Library structure validation

## Build Output Structure

```
lib/
├── commonjs/          # CommonJS modules for Node.js compatibility
│   ├── index.js       # Main entry point
│   └── ...           # Component and utility files
├── module/           # ES modules for modern bundlers
│   ├── index.js      # Main entry point
│   └── ...          # Component and utility files
└── typescript/       # TypeScript declaration files
    ├── module/      # ES module declarations
    │   └── index.d.ts
    └── commonjs/    # CommonJS declarations
        └── index.d.ts
```

## Verification Checks

### 1. TypeScript Compilation
- Uses `tsconfig.build.json` for production builds
- Excludes test files and mocks
- Generates declaration files with source maps

### 2. Export Verification
Ensures all public API exports are available:
- `Survey` - Main survey component
- `SimpleSurvey` - Class-based survey component
- `useSurveyModel` - React hook for survey model
- `useSurveyState` - React hook for survey state
- Type exports for TypeScript users

### 3. Package Configuration
Validates npm publishing requirements:
- Required fields (name, version, description, etc.)
- Entry points (main, module, types)
- Export mappings for modern bundlers
- Peer dependencies configuration

### 4. Bundle Size Monitoring
- Maximum size: 500KB per output format
- Current sizes:
  - CommonJS: ~97KB
  - ES Module: ~78KB
  - TypeScript declarations: ~74KB

### 5. Test File Exclusion
Ensures no test files are included in the distributed package:
- `*.test.js/ts` files
- `*.spec.js/ts` files
- `__tests__` directories
- `__mocks__` directories
- `test-utils` directories

## CI/CD Integration

The build verification runs automatically in GitHub Actions:

1. On every push to main branch
2. On every pull request
3. As part of the `build-library` job in CI

The CI workflow:
- Builds the library in production mode
- Runs standard build validation
- Executes comprehensive build verification
- Uploads build artifacts for inspection

## Troubleshooting

### TypeScript Compilation Errors
- Check `tsconfig.build.json` for proper configuration
- Ensure all imports are properly typed
- Run `yarn typecheck` locally to debug

### Missing Exports
- Verify exports in `src/index.ts`
- Check that components export from their index files
- Ensure re-exports use proper syntax

### Bundle Size Issues
- Review dependencies for unnecessary imports
- Consider code splitting for large components
- Use tree-shaking friendly export patterns

### Test Files in Build
- The build process automatically removes test files
- If issues persist, check babel configuration
- Ensure test files follow naming conventions

## Development Workflow

1. Make changes to source files
2. Run `yarn build` to compile
3. Run `yarn build:verify` to validate
4. Fix any issues reported
5. Commit changes when verification passes

## Future Improvements

- [ ] Add tree-shaking validation
- [ ] Implement peer dependency testing
- [ ] Add import cost analysis
- [ ] Create automated release workflow