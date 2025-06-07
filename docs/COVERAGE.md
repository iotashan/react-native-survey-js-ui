# Coverage Standards and Maintenance Guide

## Overview

This project maintains high code coverage standards to ensure quality and reliability. We enforce >90% coverage across all metrics with automated checks and continuous monitoring.

## Coverage Requirements

### Global Thresholds
- **Statements**: 90%
- **Branches**: 90%
- **Functions**: 90%
- **Lines**: 90%

### Component-Specific Thresholds
- **Core Components** (`src/components/`):
  - Branches: 87% (allows for defensive programming patterns)
  - Functions: 95%
  - Lines: 95%
  - Statements: 95%

- **Hooks** (`src/hooks/`):
  - Branches: 80% (complex state management edge cases)
  - Functions: 90%
  - Lines: 90%
  - Statements: 90%

## Running Coverage

### Basic Commands
```bash
# Run tests with coverage
npm run test:coverage

# Silent coverage check (CI-friendly)
npm run test:coverage:check

# Generate and open HTML report
npm run test:coverage:report

# Check coverage with trend analysis
npm run test:coverage:trend
```

### Performance Optimization
Coverage collection is conditional to improve performance:
- Coverage only runs when `COVERAGE=true` or in CI environments
- Uses V8 coverage provider for better performance
- Test runs without coverage are significantly faster

## Coverage Reports

### Report Formats
The following coverage reports are generated:
- **Text**: Console output showing coverage summary
- **HTML**: Interactive report in `coverage/lcov-report/index.html`
- **LCOV**: Standard format for CI tools (`coverage/lcov.info`)
- **Clover**: XML format (`coverage/clover.xml`)
- **JSON Summary**: Machine-readable summary (`coverage/coverage-summary.json`)

### Coverage History
Coverage trends are tracked in `coverage/coverage-history.json`. The coverage check script maintains the last 30 coverage runs for trend analysis.

## Exclusions

The following are excluded from coverage:
- Test files (`*.test.ts`, `*.test.tsx`)
- Test directories (`__tests__/`)
- Type definitions (`*.d.ts`)
- Index files (typically just exports)
- Test utilities (`src/test-utils/`)
- Mock files (`__mocks__/`)

## Quality Metrics

### Coverage Quality Rating
- ⭐⭐⭐⭐⭐ **Excellent**: ≥95% average coverage
- ⭐⭐⭐⭐ **Very Good**: ≥90% average coverage
- ⭐⭐⭐ **Good**: ≥80% average coverage
- ⭐⭐ **Needs Improvement**: <80% average coverage

### Best Practices
1. **Write Tests First**: Follow TDD principles
2. **Test Edge Cases**: Focus on branch coverage for error handling
3. **Meaningful Tests**: Quality over quantity - tests should catch real issues
4. **Defensive Programming**: Some branches (error handlers, warnings) may not need 100% coverage

## CI/CD Integration

### GitHub Actions
Coverage is automatically checked on:
- Push to main/develop branches
- Pull requests

The workflow:
1. Runs tests with coverage
2. Checks coverage thresholds
3. Uploads results to Codecov
4. Comments on PRs with coverage summary
5. Archives coverage reports as artifacts

### Local Pre-commit
Ensure coverage passes before committing:
```bash
npm run test:coverage:check
```

## Troubleshooting

### Coverage Drops Below Threshold
1. Run `npm run test:coverage` to see detailed report
2. Check uncovered lines in the output
3. Add tests for uncovered code paths
4. If the uncovered code is defensive programming, consider adjusting thresholds

### Performance Issues
1. Run tests without coverage: `npm test`
2. Use `test:coverage:check` for faster CI runs
3. Consider using `--maxWorkers=50%` for parallel execution

### Inconsistent Coverage
Coverage may vary slightly between runs due to:
- Async operations
- Random test data
- Platform differences

Set thresholds with a small buffer (1-2%) to account for variations.

## Maintenance

### Regular Tasks
1. **Weekly**: Review coverage trends with `npm run test:coverage:trend`
2. **Per Sprint**: Update thresholds if coverage consistently exceeds them
3. **Per Release**: Archive coverage reports for historical reference

### Updating Thresholds
Edit `jest.config.js` to adjust coverage thresholds. Always document the reason for changes in commit messages.

### Adding New Code
All new code must:
1. Have corresponding tests
2. Maintain or improve coverage percentages
3. Follow TDD principles (test first, code second)