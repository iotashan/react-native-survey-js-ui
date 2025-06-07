# TDD Integration with Development Workflow

This guide shows how to integrate Test-Driven Development practices into your daily development workflow for the react-native-survey-js-ui library.

## Table of Contents

- [Development Environment Setup for TDD](#development-environment-setup-for-tdd)
- [Daily TDD Workflow](#daily-tdd-workflow)
- [IDE and Editor Integration](#ide-and-editor-integration)
- [Git Workflow Integration](#git-workflow-integration)
- [Code Review Integration](#code-review-integration)
- [CI/CD Integration](#cicd-integration)
- [Team Workflow](#team-workflow)

## Development Environment Setup for TDD

### Terminal Setup

Set up multiple terminal windows/tabs for efficient TDD:

```bash
# Terminal 1: Test Runner (always running)
yarn test --watch

# Terminal 2: Development Build (watch mode)
yarn build:dev

# Terminal 3: Example App
cd example && yarn start

# Terminal 4: Commands and Git
git status
```

### VS Code Setup

#### Extensions

Install these VS Code extensions for optimal TDD experience:

```json
{
  "recommendations": [
    "ms-vscode.vscode-jest",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.test-adapter-converter",
    "hbenl.vscode-test-explorer"
  ]
}
```

#### Settings

```json
// .vscode/settings.json
{
  "jest.autoRun": {
    "watch": true,
    "onStartup": ["all-tests"]
  },
  "jest.showCoverageOnLoad": true,
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll.eslint": true
  },
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.git/**": true,
    "**/lib/**": true,
    "**/coverage/**": true
  }
}
```

#### Tasks

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "TDD: Run Tests",
      "type": "shell",
      "command": "yarn test --watch",
      "group": "test",
      "presentation": {
        "reveal": "always",
        "panel": "dedicated"
      },
      "runOptions": {
        "runOn": "folderOpen"
      }
    },
    {
      "label": "TDD: Run Coverage",
      "type": "shell",
      "command": "yarn test --coverage",
      "group": "test"
    },
    {
      "label": "TDD: Run Specific Test",
      "type": "shell",
      "command": "yarn test",
      "args": ["${input:testFile}"],
      "group": "test"
    }
  ],
  "inputs": [
    {
      "id": "testFile",
      "description": "Test file to run",
      "default": "${fileBasenameNoExtension}",
      "type": "promptString"
    }
  ]
}
```

#### Snippets

```json
// .vscode/typescript.json
{
  "TDD Test Block": {
    "prefix": "tdd-test",
    "body": [
      "describe('${1:ComponentName}', () => {",
      "  let ${2:mockProps}: any;",
      "",
      "  beforeEach(() => {",
      "    ${2:mockProps} = {",
      "      ${3:// Setup mock props}",
      "    };",
      "  });",
      "",
      "  describe('${4:Feature}', () => {",
      "    it('${5:should behave correctly}', () => {",
      "      const { ${6:getByTestId} } = render(<${1:ComponentName} {...${2:mockProps}} />);",
      "      ",
      "      ${7:// Arrange - Act - Assert}",
      "      expect(${8:assertion}).${9:toBeTruthy}();",
      "    });",
      "  });",
      "});"
    ],
    "description": "Create a TDD test block structure"
  },
  "TDD Component Test": {
    "prefix": "tdd-component",
    "body": [
      "import React from 'react';",
      "import { render, fireEvent } from '@testing-library/react-native';",
      "import { ${1:ComponentName} } from './${1:ComponentName}';",
      "",
      "describe('${1:ComponentName}', () => {",
      "  const defaultProps = {",
      "    ${2:// Add default props}",
      "  };",
      "",
      "  it('should ${3:describe behavior}', () => {",
      "    const { ${4:getByTestId} } = render(<${1:ComponentName} {...defaultProps} />);",
      "    ",
      "    ${5:// Test implementation}",
      "    expect(${6:assertion}).${7:toBeTruthy}();",
      "  });",
      "});"
    ],
    "description": "Create a component test file"
  }
}
```

## Daily TDD Workflow

### Morning Setup

```bash
# 1. Start development session
git checkout feature/new-component
git pull origin main

# 2. Start test watcher
yarn test --watch

# 3. Start build watcher
yarn build:dev

# 4. Start example app
cd example && yarn start
```

### Development Cycle

#### Step 1: Red Phase (Write Failing Test)

```typescript
// 1. Create test file first
// src/components/NewComponent/NewComponent.test.tsx

import React from 'react';
import { render } from '@testing-library/react-native';
import { NewComponent } from './NewComponent';

describe('NewComponent', () => {
  it('should render with title', () => {
    const { getByText } = render(<NewComponent title="Test Title" />);
    expect(getByText('Test Title')).toBeTruthy();
  });
});
```

```bash
# 2. Run test (should fail)
# Test watcher automatically runs, or manually:
yarn test NewComponent

# Expected output: FAIL - Cannot find module './NewComponent'
```

#### Step 2: Green Phase (Make Test Pass)

```typescript
// 3. Create minimal implementation
// src/components/NewComponent/NewComponent.tsx

import React from 'react';
import { Text, View } from 'react-native';

interface NewComponentProps {
  title: string;
}

export const NewComponent: React.FC<NewComponentProps> = ({ title }) => {
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
};
```

```bash
# 4. Verify test passes
# Test watcher shows: PASS
```

#### Step 3: Refactor Phase (Improve Code)

```typescript
// 5. Refactor with better structure
// src/components/NewComponent/NewComponent.tsx

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

interface NewComponentProps {
  title: string;
  style?: ViewStyle;
}

export const NewComponent: React.FC<NewComponentProps> = ({ title, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

#### Step 4: Add More Tests

```typescript
// 6. Add more test cases
describe('NewComponent', () => {
  it('should render with title', () => {
    const { getByText } = render(<NewComponent title="Test Title" />);
    expect(getByText('Test Title')).toBeTruthy();
  });

  it('should apply custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <NewComponent title="Test" style={customStyle} testID="component" />
    );
    
    const component = getByTestId('component');
    expect(component.props.style).toMatchObject(customStyle);
  });
});
```

### End of Day Checklist

```bash
# 1. Ensure all tests pass
yarn test

# 2. Check coverage
yarn test --coverage

# 3. Lint and format
yarn lint:fix

# 4. Commit changes
git add .
git commit -m "feat: add NewComponent with TDD approach

- Add NewComponent with title prop
- Include comprehensive tests with >90% coverage
- Follow TDD Red-Green-Refactor cycle"

# 5. Push changes
git push origin feature/new-component
```

## IDE and Editor Integration

### VS Code TDD Workflow

#### Keyboard Shortcuts

```json
// .vscode/keybindings.json
[
  {
    "key": "ctrl+shift+t",
    "command": "workbench.action.tasks.runTask",
    "args": "TDD: Run Tests"
  },
  {
    "key": "ctrl+shift+c",
    "command": "workbench.action.tasks.runTask",
    "args": "TDD: Run Coverage"
  },
  {
    "key": "ctrl+shift+r",
    "command": "workbench.action.tasks.runTask",
    "args": "TDD: Run Specific Test"
  }
]
```

#### File Templates

Create VS Code file templates for TDD:

```typescript
// .vscode/templates/component.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ${TM_FILENAME_BASE} } from './${TM_FILENAME_BASE}';

describe('${TM_FILENAME_BASE}', () => {
  const defaultProps = {
    // Add default props
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { toJSON } = render(<${TM_FILENAME_BASE} {...defaultProps} />);
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should handle user interactions', () => {
      // Add interaction tests
    });
  });

  describe('Props Handling', () => {
    it('should handle props correctly', () => {
      // Add props tests
    });
  });
});
```

## Git Workflow Integration

### Pre-commit Hooks

```yaml
# .lefthook.yml
pre-commit:
  commands:
    tests:
      run: yarn test --findRelatedTests {staged_files} --passWithNoTests
      stage_fixed: true
    
    lint:
      run: yarn lint:fix {staged_files}
      stage_fixed: true
    
    typecheck:
      run: yarn typecheck
      
    coverage-check:
      run: yarn test --coverage --passWithNoTests
```

### Commit Message Convention

```bash
# TDD-focused commit messages
git commit -m "test: add failing test for UserProfile component

- Test should render user name and email
- Test should handle missing user data
- Following TDD Red phase"

git commit -m "feat: implement UserProfile component to pass tests

- Add UserProfile component with name and email display
- Handle missing user data gracefully
- Achieve 100% test coverage
- Following TDD Green phase"

git commit -m "refactor: improve UserProfile component structure

- Extract styles to StyleSheet
- Add TypeScript interfaces
- Improve component performance
- All tests remain green - TDD Refactor phase"
```

### Branch Naming

```bash
# TDD-focused branch naming
git checkout -b tdd/user-profile-component
git checkout -b test/survey-validation-logic
git checkout -b refactor/question-components
```

## Code Review Integration

### PR Template

```markdown
<!-- .github/pull_request_template.md -->
## TDD Compliance Checklist

### Red Phase ✅
- [ ] Tests were written first
- [ ] Tests failed for the right reason
- [ ] Test names describe expected behavior

### Green Phase ✅
- [ ] Minimal implementation to pass tests
- [ ] All tests now pass
- [ ] No premature optimization

### Refactor Phase ✅
- [ ] Code quality improved
- [ ] Tests remain green
- [ ] No new functionality added

### Coverage ✅
- [ ] >90% line coverage achieved
- [ ] >90% branch coverage achieved
- [ ] Coverage is meaningful, not padding

### Test Quality ✅
- [ ] Tests focus on behavior, not implementation
- [ ] Tests are independent and isolated
- [ ] Tests follow AAA pattern (Arrange-Act-Assert)
- [ ] Edge cases and error conditions tested

## Description
Brief description of changes following TDD approach.

## Testing Strategy
Explain the testing approach and key scenarios covered.
```

### Review Checklist

Use the [TDD Code Review Checklist](./TDD_CODE_REVIEW_CHECKLIST.md) for all reviews.

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/tdd-validation.yml
name: TDD Validation

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  tdd-compliance:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'
      
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      
      - name: Run tests with coverage
        run: yarn test --coverage --watchAll=false
      
      - name: Check coverage thresholds
        run: |
          COVERAGE=$(yarn test --coverage --watchAll=false --silent | grep "All files" | awk '{print $10}' | sed 's/%//')
          if [ "$COVERAGE" -lt 90 ]; then
            echo "Coverage $COVERAGE% is below 90% threshold"
            exit 1
          fi
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
      
      - name: Comment coverage on PR
        if: github.event_name == 'pull_request'
        uses: 5monkeys/cobertura-action@master
        with:
          path: coverage/cobertura-coverage.xml
          minimum_coverage: 90
```

### Coverage Gates

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Per-file thresholds
    './src/components/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
};
```

## Team Workflow

### Onboarding New Developers

1. **TDD Training Session**
   - Present TDD principles and benefits
   - Walk through Red-Green-Refactor cycle
   - Demonstrate with live coding example

2. **Pair Programming**
   - Pair new developers with TDD-experienced team members
   - Practice TDD on simple components
   - Review and discuss approaches

3. **Code Review Mentoring**
   - Include new developers in TDD-focused code reviews
   - Explain TDD compliance checks
   - Share best practices and common pitfalls

### Team Standards

1. **Definition of Done**
   - [ ] Feature implemented using TDD approach
   - [ ] All tests pass (>90% coverage)
   - [ ] Code reviewed for TDD compliance
   - [ ] Documentation updated

2. **Sprint Planning**
   - Estimate stories including test writing time
   - Consider TDD complexity in story points
   - Plan for test infrastructure improvements

3. **Retrospectives**
   - Review TDD adoption and challenges
   - Identify areas for improvement
   - Share TDD success stories

### Continuous Improvement

1. **TDD Metrics**
   - Track test coverage trends
   - Monitor test execution time
   - Measure TDD adoption rate

2. **Tool Updates**
   - Regularly update testing libraries
   - Improve test utilities and mocks
   - Enhance CI/CD pipeline

3. **Knowledge Sharing**
   - Regular TDD workshops
   - Share testing patterns and techniques
   - Document lessons learned

## Best Practices Summary

1. **Environment**: Set up efficient development environment with test watchers
2. **Workflow**: Follow strict Red-Green-Refactor cycle
3. **Integration**: Use IDE features and automation to support TDD
4. **Collaboration**: Include TDD compliance in code reviews
5. **Automation**: Use CI/CD to enforce TDD standards
6. **Team**: Provide training and support for TDD adoption
7. **Improvement**: Continuously refine TDD practices and tools

Remember: TDD is not just about testing - it's a design methodology that leads to better code!