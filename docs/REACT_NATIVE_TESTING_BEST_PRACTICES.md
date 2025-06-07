# React Native Library Testing Best Practices

This guide provides comprehensive best practices for testing React Native libraries, with specific focus on the unique challenges and patterns for library development versus application development.

## Table of Contents

- [Library vs Application Testing](#library-vs-application-testing)
- [Component Testing Best Practices](#component-testing-best-practices)
- [Cross-Platform Testing](#cross-platform-testing)
- [Performance Testing](#performance-testing)
- [Accessibility Testing](#accessibility-testing)
- [Integration Testing](#integration-testing)
- [Testing Hooks and Context](#testing-hooks-and-context)
- [Snapshot Testing Guidelines](#snapshot-testing-guidelines)
- [Mock Strategy](#mock-strategy)
- [Testing Checklist](#testing-checklist)

## Library vs Application Testing

### Key Differences

Testing a React Native library requires different considerations than testing an application:

```typescript
// Library Testing Focus
- Public API stability
- Cross-platform compatibility
- Peer dependency handling
- Bundle size impact
- TypeScript definitions
- Backward compatibility

// Application Testing Focus
- User flows
- Screen navigation
- State management
- API integrations
- Device-specific features
```

### Library Testing Principles

1. **Test Public API First**
   ```typescript
   // Test what consumers will use
   import { Survey } from 'react-native-survey-js-ui';
   
   it('should export Survey component', () => {
     expect(Survey).toBeDefined();
     expect(typeof Survey).toBe('function');
   });
   ```

2. **Validate TypeScript Definitions**
   ```typescript
   // Ensure types are exported correctly
   import { SurveyProps } from 'react-native-survey-js-ui';
   
   const props: SurveyProps = {
     model: {} as any,
     onComplete: () => {},
   };
   ```

3. **Test with Different React Native Versions**
   ```json
   // test-matrix.json
   {
     "react-native": ["0.70.0", "0.71.0", "0.72.0"],
     "react": ["17.0.2", "18.0.0", "18.2.0"]
   }
   ```

## Component Testing Best Practices

### 1. Test Component Contract

Always test the component's public interface:

```typescript
describe('Survey Component Contract', () => {
  it('should accept all documented props', () => {
    const allProps = {
      model: mockModel,
      onComplete: jest.fn(),
      onValueChanged: jest.fn(),
      onCurrentPageChanged: jest.fn(),
      style: { padding: 20 },
      theme: 'default',
      className: 'custom-survey',
    };
    
    const { getByTestId } = render(<Survey {...allProps} />);
    expect(getByTestId('survey-container')).toBeTruthy();
  });
  
  it('should work with minimal props', () => {
    const { getByTestId } = render(<Survey model={mockModel} />);
    expect(getByTestId('survey-container')).toBeTruthy();
  });
});
```

### 2. Test User Interactions

Focus on realistic user scenarios:

```typescript
describe('User Interactions', () => {
  it('should handle text input', async () => {
    const model = createSurveyWithTextQuestion();
    const { getByTestId } = render(<Survey model={model} />);
    
    const input = getByTestId('question-name');
    
    // Simulate user typing
    fireEvent.changeText(input, 'John');
    await waitFor(() => {
      expect(model.getValue('name')).toBe('John');
    });
    
    // Simulate clearing
    fireEvent.changeText(input, '');
    await waitFor(() => {
      expect(model.getValue('name')).toBe('');
    });
  });
  
  it('should handle touch events', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button onPress={onPress} title="Next" />
    );
    
    // Test press
    fireEvent.press(getByText('Next'));
    expect(onPress).toHaveBeenCalledTimes(1);
    
    // Test disabled state
    const { getByText: getByTextDisabled } = render(
      <Button onPress={onPress} title="Next" disabled />
    );
    
    fireEvent.press(getByTextDisabled('Next'));
    expect(onPress).toHaveBeenCalledTimes(1); // No additional calls
  });
});
```

### 3. Test Error Boundaries

Ensure components handle errors gracefully:

```typescript
describe('Error Handling', () => {
  it('should handle invalid model gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const { getByText } = render(<Survey model={null as any} />);
    
    expect(getByText('Survey configuration error')).toBeTruthy();
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
  
  it('should recover from render errors', () => {
    const ThrowingQuestion = () => {
      throw new Error('Render error');
    };
    
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingQuestion />
      </ErrorBoundary>
    );
    
    expect(getByText('Something went wrong')).toBeTruthy();
  });
});
```

## Cross-Platform Testing

### Platform-Specific Behavior

Test platform differences explicitly:

```typescript
import { Platform } from 'react-native';

describe('Cross-Platform Behavior', () => {
  const originalPlatform = Platform.OS;
  
  afterEach(() => {
    Platform.OS = originalPlatform;
  });
  
  it('should render iOS-specific styles', () => {
    Platform.OS = 'ios';
    
    const { getByTestId } = render(<DatePicker />);
    const picker = getByTestId('date-picker');
    
    expect(picker.props.style).toMatchObject({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    });
  });
  
  it('should render Android-specific styles', () => {
    Platform.OS = 'android';
    
    const { getByTestId } = render(<DatePicker />);
    const picker = getByTestId('date-picker');
    
    expect(picker.props.style).toMatchObject({
      elevation: 5,
    });
  });
});
```

### Device-Specific Features

```typescript
describe('Device Features', () => {
  it('should adapt to different screen sizes', () => {
    const dimensions = [
      { width: 320, height: 568 },  // iPhone SE
      { width: 414, height: 896 },  // iPhone 11
      { width: 768, height: 1024 }, // iPad
    ];
    
    dimensions.forEach(({ width, height }) => {
      jest.doMock('react-native', () => ({
        ...jest.requireActual('react-native'),
        Dimensions: {
          get: () => ({ width, height }),
        },
      }));
      
      const { getByTestId } = render(<ResponsiveComponent />);
      const component = getByTestId('responsive');
      
      if (width >= 768) {
        expect(component.props.style.flexDirection).toBe('row');
      } else {
        expect(component.props.style.flexDirection).toBe('column');
      }
    });
  });
});
```

## Performance Testing

### Render Performance

```typescript
describe('Performance', () => {
  it('should render efficiently', () => {
    const start = performance.now();
    
    const { rerender } = render(<Survey model={largeSurveyModel} />);
    
    const initialRenderTime = performance.now() - start;
    expect(initialRenderTime).toBeLessThan(100); // 100ms threshold
    
    // Test re-render performance
    const rerenderStart = performance.now();
    rerender(<Survey model={largeSurveyModel} />);
    
    const rerenderTime = performance.now() - rerenderStart;
    expect(rerenderTime).toBeLessThan(50); // Faster on re-render
  });
  
  it('should not cause unnecessary re-renders', () => {
    const ChildComponent = jest.fn(() => <Text>Child</Text>);
    
    const { rerender } = render(
      <ParentComponent>
        <ChildComponent />
      </ParentComponent>
    );
    
    expect(ChildComponent).toHaveBeenCalledTimes(1);
    
    // Re-render with same props
    rerender(
      <ParentComponent>
        <ChildComponent />
      </ParentComponent>
    );
    
    // Child should not re-render
    expect(ChildComponent).toHaveBeenCalledTimes(1);
  });
});
```

### Memory Leaks

```typescript
describe('Memory Management', () => {
  it('should clean up on unmount', () => {
    const model = new MockSurveyModel();
    const eventHandler = jest.fn();
    
    const { unmount } = render(<Survey model={model} />);
    
    // Verify event listeners are added
    model.onValueChanged.add(eventHandler);
    model.setValue('q1', 'test');
    expect(eventHandler).toHaveBeenCalled();
    
    // Unmount and verify cleanup
    unmount();
    
    eventHandler.mockClear();
    model.setValue('q1', 'test2');
    expect(eventHandler).not.toHaveBeenCalled();
  });
});
```

## Accessibility Testing

### Basic Accessibility

```typescript
describe('Accessibility', () => {
  it('should have proper accessibility labels', () => {
    const { getByLabelText, getByRole } = render(
      <Survey model={surveyWithQuestions} />
    );
    
    // Test form accessibility
    expect(getByRole('form')).toBeTruthy();
    
    // Test question accessibility
    expect(getByLabelText('What is your name?')).toBeTruthy();
    
    // Test button accessibility
    expect(getByLabelText('Next Page')).toBeTruthy();
  });
  
  it('should announce changes to screen readers', async () => {
    const { getByTestId } = render(<Survey model={model} />);
    
    const errorMessage = getByTestId('error-message');
    
    // Error messages should be announced
    expect(errorMessage.props.accessibilityLiveRegion).toBe('assertive');
    expect(errorMessage.props.accessibilityRole).toBe('alert');
  });
});
```

### Keyboard Navigation

```typescript
describe('Keyboard Navigation', () => {
  it('should support keyboard navigation', () => {
    const { getByTestId } = render(<Survey model={model} />);
    
    const firstInput = getByTestId('question-1');
    const secondInput = getByTestId('question-2');
    
    // Focus first input
    fireEvent(firstInput, 'focus');
    expect(firstInput.props.accessibilityState.focused).toBe(true);
    
    // Tab to next input
    fireEvent(firstInput, 'submitEditing');
    expect(secondInput.props.accessibilityState.focused).toBe(true);
  });
});
```

## Integration Testing

### Testing with Survey-Core

```typescript
describe('Survey-Core Integration', () => {
  it('should sync with survey model', async () => {
    const model = new Model(surveyJson);
    const { getByTestId } = render(<Survey model={model} />);
    
    // Test two-way binding
    const input = getByTestId('question-name');
    
    // UI -> Model
    fireEvent.changeText(input, 'John Doe');
    await waitFor(() => {
      expect(model.getValue('name')).toBe('John Doe');
    });
    
    // Model -> UI
    act(() => {
      model.setValue('name', 'Jane Doe');
    });
    
    await waitFor(() => {
      expect(input.props.value).toBe('Jane Doe');
    });
  });
  
  it('should handle survey completion', async () => {
    const onComplete = jest.fn();
    const model = new Model(surveyJson);
    model.onComplete.add(onComplete);
    
    const { getByText } = render(<Survey model={model} />);
    
    // Complete survey
    fireEvent.press(getByText('Complete'));
    
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(model);
      expect(model.state).toBe('completed');
    });
  });
});
```

## Testing Hooks and Context

### Custom Hook Testing

```typescript
describe('Custom Hooks', () => {
  it('should manage survey state', () => {
    const { result } = renderHook(() => 
      useSurveyState(mockModel)
    );
    
    // Initial state
    expect(result.current).toMatchObject({
      currentPageNo: 0,
      pageCount: 3,
      isFirstPage: true,
      isLastPage: false,
      progress: 0,
    });
    
    // Navigate
    act(() => {
      result.current.nextPage();
    });
    
    expect(result.current).toMatchObject({
      currentPageNo: 1,
      isFirstPage: false,
      progress: 33,
    });
  });
});
```

### Context Testing

```typescript
describe('Survey Context', () => {
  it('should provide survey context to children', () => {
    const TestChild = () => {
      const context = useSurveyContext();
      return <Text>{context.model.title}</Text>;
    };
    
    const { getByText } = render(
      <SurveyProvider model={mockModel}>
        <TestChild />
      </SurveyProvider>
    );
    
    expect(getByText('Test Survey')).toBeTruthy();
  });
});
```

## Snapshot Testing Guidelines

### When to Use Snapshots

```typescript
// Good: Stable UI structures
it('should match question layout snapshot', () => {
  const component = render(
    <QuestionLayout title="Test Question" required />
  );
  
  expect(component.toJSON()).toMatchSnapshot();
});

// Bad: Dynamic content
it('should NOT snapshot timestamp', () => {
  // Timestamps change on every run
  const component = render(<TimeDisplay />);
  // Don't snapshot this!
});
```

### Snapshot Best Practices

```typescript
// Use inline snapshots for small components
it('should render error state', () => {
  const { toJSON } = render(<ErrorMessage text="Required" />);
  
  expect(toJSON()).toMatchInlineSnapshot(`
    <Text style={{ color: 'red' }}>
      Required
    </Text>
  `);
});

// Mock dynamic values
it('should snapshot with stable values', () => {
  // Mock Date to ensure stable snapshots
  const mockDate = new Date('2023-01-01');
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
  
  const component = render(<DateDisplay />);
  expect(component.toJSON()).toMatchSnapshot();
});
```

## Mock Strategy

### Progressive Enhancement

```typescript
// Level 1: Simple mock
jest.mock('react-native-device-info', () => ({
  getDeviceId: () => 'test-device-id',
}));

// Level 2: Configurable mock
jest.mock('react-native-device-info', () => ({
  getDeviceId: jest.fn(() => 'test-device-id'),
  getVersion: jest.fn(() => '1.0.0'),
}));

// Level 3: Full mock with behavior
class MockDeviceInfo {
  static deviceId = 'test-device-id';
  static version = '1.0.0';
  
  static getDeviceId() {
    return this.deviceId;
  }
  
  static setDeviceId(id: string) {
    this.deviceId = id;
  }
}

jest.mock('react-native-device-info', () => MockDeviceInfo);
```

### Mock Validation

```typescript
describe('Mock Validation', () => {
  it('should verify mock behavior matches real implementation', () => {
    // Test that mock behaves like real survey-core
    const mockModel = new MockSurveyModel();
    const realModel = new Model();
    
    // Both should have same methods
    expect(typeof mockModel.getValue).toBe('function');
    expect(typeof realModel.getValue).toBe('function');
    
    // Both should handle same events
    expect(mockModel.onValueChanged).toBeDefined();
    expect(realModel.onValueChanged).toBeDefined();
  });
});
```

## Testing Checklist

### Component Testing Checklist

- [ ] Props validation and types
- [ ] Default props behavior
- [ ] User interactions (touch, text input)
- [ ] Accessibility properties
- [ ] Platform-specific rendering
- [ ] Error states and boundaries
- [ ] Loading states
- [ ] Empty states
- [ ] Style prop handling
- [ ] Ref forwarding
- [ ] Unmount cleanup

### Integration Testing Checklist

- [ ] Survey-core model sync
- [ ] Event handler connections
- [ ] Navigation between pages
- [ ] Validation triggers
- [ ] Data persistence
- [ ] State management
- [ ] Context providers
- [ ] Side effects

### Performance Testing Checklist

- [ ] Initial render time
- [ ] Re-render optimization
- [ ] Large dataset handling
- [ ] Memory leak prevention
- [ ] Bundle size impact
- [ ] Animation performance

### Cross-Platform Checklist

- [ ] iOS specific features
- [ ] Android specific features
- [ ] Tablet adaptations
- [ ] Orientation changes
- [ ] Different RN versions
- [ ] Different device sizes

## Best Practices Summary

1. **Test the Contract**: Focus on public API, not implementation
2. **Test User Behavior**: Write tests from user's perspective
3. **Cross-Platform First**: Always test iOS and Android
4. **Mock Wisely**: Keep mocks realistic and maintainable
5. **Performance Matters**: Include performance tests
6. **Accessibility Always**: Never skip accessibility testing
7. **Clean Up**: Always clean up after tests
8. **Meaningful Coverage**: Quality over quantity
9. **Documentation**: Tests serve as documentation
10. **Continuous Improvement**: Refactor tests as you refactor code

Remember: Good tests make good libraries!