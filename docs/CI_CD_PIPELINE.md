# CI/CD Pipeline Documentation

This document describes the GitHub Actions CI/CD pipeline for the react-native-survey-js-ui library.

## Overview

The CI/CD pipeline is configured to run on:
- Every push to the `main` branch
- Every pull request targeting the `main` branch

The pipeline ensures code quality, test coverage, and build integrity before any code is merged.

## Pipeline Jobs

### 1. Test Library (`test-library`)
**Purpose**: Validates the library code quality and functionality
- **Timeout**: 15 minutes
- **Steps**:
  1. Checkout code
  2. Setup Node.js and install dependencies (cached)
  3. Run TypeScript type checking
  4. Run ESLint code linting
  5. Run library tests with coverage
  6. Upload coverage reports and test results as artifacts

### 2. Test Example App (`test-example`)
**Purpose**: Validates the example app and library integration
- **Timeout**: 20 minutes
- **Steps**:
  1. Checkout code
  2. Setup Node.js and install dependencies (cached)
  3. Build the library
  4. Run example app tests with coverage
  5. Upload test results as artifacts

### 3. Build Library (`build-library`)
**Purpose**: Validates the library build process
- **Timeout**: 10 minutes
- **Steps**:
  1. Checkout code
  2. Setup Node.js and install dependencies (cached)
  3. Build library in production mode
  4. Validate build output
  5. Upload build artifacts

### 4. Check All (`check-all`)
**Purpose**: Final validation that all jobs passed
- Runs after all other jobs complete
- Fails if any previous job failed
- Provides single success/failure status

## Key Features

### Caching Strategy
- Uses GitHub Actions cache for Yarn dependencies
- Cache key based on `yarn.lock` file hash
- Separate caches for library and example app
- Significantly reduces CI execution time

### Test Coverage
- Library requires >90% code coverage
- Example app requires >80% code coverage
- Coverage reports uploaded as artifacts
- Coverage thresholds enforced in CI

### Artifacts
The following artifacts are preserved:
- **coverage-report**: Library test coverage (HTML, LCOV, JSON)
- **test-results**: Library test results (JUnit XML)
- **example-test-results**: Example app test results
- **build-output**: Built library files

### Performance Optimizations
- Parallel job execution
- Dependency caching
- Timeout limits to prevent hanging
- Concurrency controls to cancel redundant runs

## Running CI Locally

To simulate CI checks locally:

```bash
# Run all library checks
yarn check:all

# Individual checks
yarn typecheck      # TypeScript validation
yarn lint          # ESLint validation
yarn test:coverage # Tests with coverage
yarn build:prod    # Production build
yarn validate:build # Build validation
```

## Troubleshooting

### Common Issues

1. **Cache Problems**
   - CI uses `--frozen-lockfile` to ensure exact dependency versions
   - If dependencies fail to install, check `yarn.lock` is committed

2. **Test Failures**
   - Tests run with `CI=true` environment variable
   - Coverage thresholds are enforced (>90% for library)
   - Check artifacts for detailed test reports

3. **Build Failures**
   - TypeScript errors will fail the build
   - Ensure all exports are properly typed
   - Check that survey-core dependency is properly built

### Debugging CI Failures

1. Check the specific job that failed in GitHub Actions
2. Download artifacts for detailed logs
3. Review error messages in the job output
4. Run the failing command locally with CI environment:
   ```bash
   CI=true yarn test:coverage
   ```

## Best Practices

1. **Before Creating a PR**
   - Run `yarn check:all` locally
   - Ensure all tests pass with coverage
   - Fix any linting or TypeScript errors

2. **Writing Tests**
   - Follow TDD approach
   - Write tests before implementation
   - Maintain >90% coverage for new code

3. **CI Performance**
   - Keep tests focused and fast
   - Use mocks for external dependencies
   - Avoid large test files

## Future Enhancements

- Matrix builds for multiple Node.js versions
- Automated npm publishing on release
- Visual regression testing for UI components
- Performance benchmarking