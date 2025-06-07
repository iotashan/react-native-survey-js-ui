# TDD Code Review Checklist

This checklist ensures all code changes follow Test-Driven Development principles and maintain the quality standards required for the react-native-survey-js-ui library.

## Table of Contents

- [Pre-Review Requirements](#pre-review-requirements)
- [TDD Compliance Checklist](#tdd-compliance-checklist)
- [Code Quality Checklist](#code-quality-checklist)
- [React Native Specific Checklist](#react-native-specific-checklist)
- [Testing Quality Checklist](#testing-quality-checklist)
- [Performance and Accessibility](#performance-and-accessibility)
- [Documentation and Examples](#documentation-and-examples)
- [Review Process](#review-process)

## Pre-Review Requirements

Before starting the code review, verify these requirements are met:

### ✅ Automated Checks Pass

- [ ] All CI/CD pipeline checks are green
- [ ] Code coverage is ≥90% for new code
- [ ] TypeScript compilation succeeds without errors
- [ ] ESLint passes with no violations
- [ ] Tests pass on both iOS and Android
- [ ] Build succeeds for both development and production

### ✅ PR Information Complete

- [ ] PR description clearly explains the change
- [ ] Links to related issues/tasks are included
- [ ] Breaking changes are clearly documented
- [ ] Example usage is provided for new features

## TDD Compliance Checklist

### 🔴 Red Phase Compliance

- [ ] **Tests were written first**: Evidence that failing tests existed before implementation
- [ ] **Tests fail for the right reason**: Verify tests fail due to missing implementation, not errors
- [ ] **Tests describe expected behavior**: Test names and structure clearly explain what should happen

```typescript
// ✅ Good: Test describes behavior clearly
it('should update survey model when user changes text input', () => {
  // Test implementation
});

// ❌ Bad: Test describes implementation
it('should call setValue method', () => {
  // Test implementation
});
```

### 🟢 Green Phase Compliance

- [ ] **Minimal implementation**: Code does only what's needed to pass tests
- [ ] **No premature optimization**: Avoid complex solutions when simple ones suffice
- [ ] **Tests pass completely**: All new and existing tests are green

```typescript
// ✅ Good: Minimal implementation
export const TextQuestion = ({ question, onChange }) => {
  return (
    <TextInput
      value={question.value}
      onChangeText={onChange}
    />
  );
};

// ❌ Bad: Premature optimization
export const TextQuestion = ({ question, onChange }) => {
  const memoizedValue = useMemo(() => question.value, [question.value]);
  const throttledOnChange = useCallback(
    throttle(onChange, 300),
    [onChange]
  );
  // ... complex implementation before it's needed
};
```

### 🔄 Refactor Phase Compliance

- [ ] **Code quality improved**: Refactoring enhances readability and maintainability
- [ ] **Tests remain green**: All tests pass after refactoring
- [ ] **No new functionality**: Refactoring doesn't add features
- [ ] **Duplicated code removed**: Common patterns extracted appropriately

### 📊 Test Coverage Requirements

- [ ] **Line coverage ≥90%**: New code must meet coverage threshold
- [ ] **Branch coverage ≥90%**: All conditional branches tested
- [ ] **Function coverage 100%**: All new functions have tests
- [ ] **Meaningful coverage**: Tests validate behavior, not just coverage numbers

## Code Quality Checklist

### 🏗️ Architecture and Design

- [ ] **Single Responsibility**: Each component/function has one clear purpose
- [ ] **Interface Segregation**: Components depend only on what they need
- [ ] **Dependency Inversion**: Depend on abstractions, not concretions
- [ ] **Open/Closed Principle**: Open for extension, closed for modification

```typescript
// ✅ Good: Component has single responsibility
interface TextQuestionProps {
  question: TextQuestionModel;
  onValueChange: (value: string) => void;
}

export const TextQuestion: React.FC<TextQuestionProps> = ({
  question,
  onValueChange
}) => {
  // Only handles text input rendering and interaction
};

// ❌ Bad: Component has multiple responsibilities
export const TextQuestion: React.FC<Props> = ({ question }) => {
  // Handles input, validation, styling, analytics, etc.
};
```

### 🎯 TypeScript Usage

- [ ] **Strict typing**: No `any` types without justification
- [ ] **Proper interfaces**: Well-defined interfaces for props and data structures
- [ ] **Generic usage**: Appropriate use of generics where needed
- [ ] **Type exports**: Public interfaces are exported for library consumers

```typescript
// ✅ Good: Strict typing
interface SurveyProps {
  model: SurveyModel;
  onComplete?: (results: SurveyResults) => void;
  theme?: SurveyTheme;
}

// ❌ Bad: Loose typing
interface SurveyProps {
  model: any;
  onComplete?: (results: any) => void;
  theme?: any;
}
```

### 🧹 Code Cleanliness

- [ ] **Meaningful names**: Variables, functions, and components have descriptive names
- [ ] **Function size**: Functions are small and focused (typically <20 lines)
- [ ] **Consistent formatting**: Code follows project style guidelines
- [ ] **No commented code**: Remove commented-out code blocks

## React Native Specific Checklist

### 📱 Cross-Platform Compatibility

- [ ] **Platform-specific code handled**: Uses Platform.select() or platform files appropriately
- [ ] **iOS and Android tested**: Changes verified on both platforms
- [ ] **Screen sizes considered**: Responsive design for different device sizes
- [ ] **Safe area handling**: Proper safe area insets where needed

```typescript
// ✅ Good: Platform-specific handling
const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
});
```

### 🎨 Styling Best Practices

- [ ] **StyleSheet usage**: Styles defined using StyleSheet.create()
- [ ] **Consistent spacing**: Uses theme spacing values
- [ ] **Responsive design**: Adapts to different screen sizes
- [ ] **Theme integration**: Supports theming system

### ⚡ Performance Considerations

- [ ] **Unnecessary re-renders avoided**: Proper use of React.memo, useMemo, useCallback
- [ ] **Large lists optimized**: Uses FlatList for large datasets
- [ ] **Image optimization**: Appropriate image handling and caching
- [ ] **Bundle size impact**: New dependencies justified

## Testing Quality Checklist

### 🧪 Test Structure and Organization

- [ ] **Descriptive test names**: Tests clearly describe what they verify
- [ ] **Arrange-Act-Assert pattern**: Tests follow clear structure
- [ ] **One assertion per test**: Each test focuses on single behavior
- [ ] **Test independence**: Tests don't depend on each other

```typescript
// ✅ Good: Clear test structure
describe('TextQuestion Component', () => {
  describe('when user enters text', () => {
    it('should call onValueChange with the entered text', () => {
      // Arrange
      const onValueChange = jest.fn();
      const question = createTextQuestion();
      const { getByTestId } = render(
        <TextQuestion question={question} onValueChange={onValueChange} />
      );
      
      // Act
      fireEvent.changeText(getByTestId('text-input'), 'Hello World');
      
      // Assert
      expect(onValueChange).toHaveBeenCalledWith('Hello World');
    });
  });
});
```

### 🎭 Mock Usage

- [ ] **Realistic mocks**: Mocks behave like real implementations
- [ ] **Minimal mocking**: Only external dependencies are mocked
- [ ] **Mock cleanup**: Mocks are properly reset between tests
- [ ] **Mock validation**: Mock behavior is tested

### 🔍 Test Scenarios Coverage

- [ ] **Happy path tested**: Normal use cases work correctly
- [ ] **Edge cases covered**: Boundary conditions and error states tested
- [ ] **User interactions tested**: All user interactions are verified
- [ ] **Accessibility tested**: Accessibility features are tested

## Performance and Accessibility

### ⚡ Performance Requirements

- [ ] **Render performance**: Components render efficiently
- [ ] **Memory management**: No memory leaks in components
- [ ] **Animation performance**: 60fps maintained during animations
- [ ] **Bundle size impact**: New code doesn't significantly increase bundle size

### ♿ Accessibility Requirements

- [ ] **Screen reader support**: Proper accessibility labels and hints
- [ ] **Keyboard navigation**: Components are keyboard accessible
- [ ] **Color contrast**: Sufficient contrast ratios maintained
- [ ] **Touch targets**: Minimum 44x44pt touch targets

```typescript
// ✅ Good: Accessibility implementation
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel="Next page"
  accessibilityHint="Navigate to the next survey page"
  style={styles.button}
>
  <Text>Next</Text>
</TouchableOpacity>
```

## Documentation and Examples

### 📚 Documentation Requirements

- [ ] **Public API documented**: All exported functions/components have JSDoc
- [ ] **Props documented**: Component props have clear descriptions
- [ ] **Usage examples**: Examples provided for complex components
- [ ] **Breaking changes noted**: Any breaking changes are clearly documented

```typescript
/**
 * TextQuestion component for rendering text input questions in surveys.
 * 
 * @example
 * ```typescript
 * <TextQuestion
 *   question={textQuestionModel}
 *   onValueChange={(value) => model.setValue('name', value)}
 * />
 * ```
 */
export interface TextQuestionProps {
  /** The text question model containing configuration and current value */
  question: TextQuestionModel;
  
  /** Callback fired when the input value changes */
  onValueChange: (value: string) => void;
  
  /** Optional custom styling for the component */
  style?: StyleProp<ViewStyle>;
}
```

### 💡 Example App Integration

- [ ] **Example app updated**: New features demonstrated in example app
- [ ] **Both tabs updated**: Changes reflected in Survey Demo and Explore tabs
- [ ] **Example tests added**: Example app tests cover new functionality

## Review Process

### 🔍 Code Review Steps

1. **Automated Checks First**
   - Verify all CI checks pass
   - Review test coverage report
   - Check for linting violations

2. **TDD Compliance Review**
   - Verify tests were written first
   - Check test quality and coverage
   - Ensure refactoring maintains green tests

3. **Code Quality Review**
   - Review architecture and design decisions
   - Check TypeScript usage and type safety
   - Verify React Native best practices

4. **Functional Review**
   - Test functionality manually
   - Verify cross-platform compatibility
   - Check performance and accessibility

5. **Documentation Review**
   - Ensure adequate documentation
   - Verify examples are clear and correct
   - Check for breaking changes

### ✅ Approval Criteria

A PR should only be approved if:

- [ ] All checklist items are satisfied
- [ ] At least one other developer has reviewed
- [ ] All automated checks pass
- [ ] Manual testing confirms functionality
- [ ] No outstanding questions or concerns

### 🚫 Common Rejection Reasons

- Tests written after implementation (violates TDD)
- Insufficient test coverage (<90%)
- Missing TypeScript types
- Cross-platform issues
- Performance regressions
- Accessibility violations
- Missing or poor documentation

### 📝 Review Comments Guidelines

**Constructive Feedback Examples:**

```
✅ "Consider using React.memo here to prevent unnecessary re-renders 
   when parent component updates. Here's an example: [code snippet]"

✅ "This test could be more focused. Instead of testing multiple 
   behaviors, consider splitting into separate test cases."

✅ "Great implementation! One suggestion: could we extract this 
   logic into a custom hook for reusability?"
```

**Avoid:**

```
❌ "This is wrong."
❌ "Bad code."
❌ "Fix this."
```

### 🎯 Review Focus Areas

**For New Features:**
- TDD process followed correctly
- Comprehensive test coverage
- Example app integration
- Documentation completeness

**For Bug Fixes:**
- Root cause addressed
- Regression test added
- No side effects introduced

**For Refactoring:**
- Behavior preserved
- Tests remain green
- Code quality improved
- Performance maintained

## Tools and Automation

### 🤖 Automated Tools

- **ESLint**: Code style and quality checks
- **TypeScript**: Type checking and compilation
- **Jest**: Test runner and coverage
- **Lefthook**: Pre-commit hooks
- **GitHub Actions**: CI/CD pipeline

### 📊 Metrics to Monitor

- Code coverage percentage
- Test execution time
- Bundle size changes
- Performance metrics
- Accessibility audit scores

## Conclusion

This checklist ensures that all code changes maintain the high quality standards required for a React Native library. Remember:

- **TDD is non-negotiable**: All code must follow the Red-Green-Refactor cycle
- **Quality over speed**: Better to take time and do it right
- **User experience first**: Always consider the end user of the library
- **Continuous improvement**: Use reviews as learning opportunities

Every review is an opportunity to improve both the code and the team's understanding of best practices.