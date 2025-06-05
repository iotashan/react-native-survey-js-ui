# Build Process Documentation

## Overview

This library uses `react-native-builder-bob` to build and prepare the package for npm distribution. The build process generates both ES modules and TypeScript declaration files.

## Build Commands

### Development Build
```bash
yarn build:dev
```
Runs the build in watch mode for rapid development iteration. Changes to source files will automatically trigger a rebuild.

### Production Build
```bash
yarn build:prod
```
Performs a complete production build:
1. Cleans previous build output
2. Runs TypeScript type checking
3. Builds ES modules and TypeScript declarations

### Standard Build
```bash
yarn build
```
Cleans and builds the library (without type checking).

### Clean Build Output
```bash
yarn clean
```
Removes the `lib` directory containing all build outputs.

## Build Output Structure

```
lib/
├── module/           # ES module output
│   ├── index.js     # Main entry point
│   ├── components/  # Component modules
│   └── ...
└── typescript/       # TypeScript declarations
    ├── index.d.ts   # Main type definitions
    ├── index.d.ts.map # Source maps
    └── ...
```

## Validation

### Build Validation
```bash
yarn validate:build
```
Checks that the build output is complete and properly structured.

### Full Validation
```bash
yarn validate
```
Runs:
- TypeScript type checking
- ESLint code linting
- Jest tests

## NPM Publishing

The `prepublishOnly` script ensures the library is properly built and validated before publishing:
```bash
npm publish
```

This automatically runs:
1. Production build
2. Full validation suite

## Configuration

### react-native-builder-bob

The build is configured in `package.json`:
```json
"react-native-builder-bob": {
  "source": "src",
  "output": "lib",
  "targets": [
    ["module", { "esm": true }],
    ["typescript", { "project": "tsconfig.build.json" }]
  ]
}
```

### TypeScript Build Config

`tsconfig.build.json` extends the base TypeScript config with build-specific settings:
- Output directory: `lib/typescript`
- Generates declaration files and source maps
- Excludes test files and examples

## Integration with Example App

The example app automatically uses the built library through workspace configuration. During development:

1. Run `yarn build:dev` in the root directory
2. The example app will hot-reload with library changes
3. No manual rebuild needed for testing

## Troubleshooting

### Build Fails
1. Run `yarn clean` to clear previous build artifacts
2. Ensure all TypeScript errors are resolved: `yarn typecheck`
3. Check for lint errors: `yarn lint`

### Missing Build Output
Run `yarn validate:build` to diagnose which files are missing.

### Type Definitions Not Generated
Ensure `tsconfig.build.json` has `"declaration": true` and `"noEmit": false`.