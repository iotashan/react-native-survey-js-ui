# Test Templates for Common Scenarios

This guide provides ready-to-use test templates for common testing scenarios in the react-native-survey-js-ui library. These templates follow TDD principles and established best practices.

## Table of Contents

- [Component Test Templates](#component-test-templates)
- [Hook Test Templates](#hook-test-templates)
- [Integration Test Templates](#integration-test-templates)
- [Accessibility Test Templates](#accessibility-test-templates)
- [Performance Test Templates](#performance-test-templates)
- [Cross-Platform Test Templates](#cross-platform-test-templates)
- [Error Handling Test Templates](#error-handling-test-templates)
- [Mock Test Templates](#mock-test-templates)

## Component Test Templates

### Basic Component Test Template

```typescript
// Template: BasicComponent.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BasicComponent } from './BasicComponent';

describe('BasicComponent', () => {
  // Default props for consistent testing
  const defaultProps = {
    title: 'Test Title',
    onPress: jest.fn(),
  };

  // Reset mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { toJSON } = render(<BasicComponent {...defaultProps} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should display the title', () => {
      const { getByText } = render(<BasicComponent {...defaultProps} />);
      expect(getByText('Test Title')).toBeTruthy();
    });

    it('should handle missing required props gracefully', () => {
      // Test error boundary or default behavior
      const { getByText } = render(<BasicComponent title="" />);
      expect(getByText('No title provided')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should handle press events', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <BasicComponent {...defaultProps} onPress={onPress} />
      );

      fireEvent.press(getByTestId('component-button'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should not trigger events when disabled', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <BasicComponent {...defaultProps} onPress={onPress} disabled />
      );

      fireEvent.press(getByTestId('component-button'));
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('Props Handling', () => {
    it('should apply custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByTestId } = render(
        <BasicComponent {...defaultProps} style={customStyle} />
      );

      const component = getByTestId('component-container');
      expect(component.props.style).toMatchObject(customStyle);
    });

    it('should handle optional props', () => {
      const { getByTestId } = render(
        <BasicComponent {...defaultProps} subtitle="Test Subtitle" />
      );

      expect(getByTestId('component-subtitle')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper accessibility properties', () => {
      const { getByTestId } = render(<BasicComponent {...defaultProps} />);
      const component = getByTestId('component-button');

      expect(component.props.accessibilityRole).toBe('button');
      expect(component.props.accessibilityLabel).toBe('Test Title');
    });
  });
});
```

### Question Component Test Template

```typescript
// Template: QuestionComponent.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuestionComponent } from './QuestionComponent';
import { createMockQuestion } from '../__mocks__/questionFactories';

describe('QuestionComponent', () => {
  let mockQuestion: any;
  let mockOnValueChange: jest.Mock;
  let defaultProps: any;

  beforeEach(() => {
    mockQuestion = createMockQuestion({
      type: 'text',
      name: 'testQuestion',
      title: 'Test Question',
      isRequired: false,
    });

    mockOnValueChange = jest.fn();

    defaultProps = {
      question: mockQuestion,
      onValueChange: mockOnValueChange,
    };
  });

  describe('Rendering', () => {
    it('should render question title', () => {
      const { getByText } = render(<QuestionComponent {...defaultProps} />);
      expect(getByText('Test Question')).toBeTruthy();
    });

    it('should render required indicator when required', () => {
      const requiredQuestion = createMockQuestion({ isRequired: true });
      const { getByTestId } = render(
        <QuestionComponent {...defaultProps} question={requiredQuestion} />
      );

      expect(getByTestId('required-indicator')).toBeTruthy();
    });

    it('should render help text when provided', () => {
      const questionWithHelp = createMockQuestion({
        helpText: 'This is help text',
      });
      
      const { getByText } = render(
        <QuestionComponent {...defaultProps} question={questionWithHelp} />
      );

      expect(getByText('This is help text')).toBeTruthy();
    });
  });

  describe('Value Handling', () => {
    it('should display current value', () => {
      const questionWithValue = createMockQuestion({ value: 'Current Value' });
      const { getByDisplayValue } = render(
        <QuestionComponent {...defaultProps} question={questionWithValue} />
      );

      expect(getByDisplayValue('Current Value')).toBeTruthy();
    });

    it('should call onValueChange when value changes', () => {
      const { getByTestId } = render(<QuestionComponent {...defaultProps} />);
      const input = getByTestId('question-input');

      fireEvent.changeText(input, 'New Value');

      expect(mockOnValueChange).toHaveBeenCalledWith('testQuestion', 'New Value');
    });

    it('should handle empty values', () => {
      const { getByTestId } = render(<QuestionComponent {...defaultProps} />);
      const input = getByTestId('question-input');

      fireEvent.changeText(input, '');

      expect(mockOnValueChange).toHaveBeenCalledWith('testQuestion', '');
    });
  });

  describe('Validation', () => {
    it('should show validation error when invalid', () => {
      const invalidQuestion = createMockQuestion({
        hasError: true,
        errorMessage: 'This field is required',
      });

      const { getByText } = render(
        <QuestionComponent {...defaultProps} question={invalidQuestion} />
      );

      expect(getByText('This field is required')).toBeTruthy();
    });

    it('should clear error when value becomes valid', () => {
      const { rerender, queryByText } = render(
        <QuestionComponent 
          {...defaultProps} 
          question={createMockQuestion({ hasError: true, errorMessage: 'Error' })}
        />
      );

      expect(queryByText('Error')).toBeTruthy();

      rerender(
        <QuestionComponent 
          {...defaultProps} 
          question={createMockQuestion({ hasError: false })}
        />
      );

      expect(queryByText('Error')).toBeNull();
    });
  });

  describe('Question Types', () => {
    it.each([
      ['text', 'text-input'],
      ['radiogroup', 'radio-group'],
      ['checkbox', 'checkbox-group'],
      ['dropdown', 'dropdown-select'],
    ])('should render %s question type correctly', (type, testId) => {
      const typedQuestion = createMockQuestion({ type });
      const { getByTestId } = render(
        <QuestionComponent {...defaultProps} question={typedQuestion} />
      );

      expect(getByTestId(testId)).toBeTruthy();
    });
  });
});
```

## Hook Test Templates

### Custom Hook Test Template

```typescript
// Template: useCustomHook.test.tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { useCustomHook } from './useCustomHook';

describe('useCustomHook', () => {
  describe('Initial State', () => {
    it('should return initial values', () => {
      const { result } = renderHook(() => useCustomHook());

      expect(result.current).toMatchObject({
        value: null,
        loading: false,
        error: null,
      });
    });

    it('should accept initial parameters', () => {
      const initialValue = 'test';
      const { result } = renderHook(() => useCustomHook(initialValue));

      expect(result.current.value).toBe(initialValue);
    });
  });

  describe('State Updates', () => {
    it('should update value correctly', () => {
      const { result } = renderHook(() => useCustomHook());

      act(() => {
        result.current.setValue('new value');
      });

      expect(result.current.value).toBe('new value');
    });

    it('should handle async operations', async () => {
      const { result, waitForNextUpdate } = renderHook(() => useCustomHook());

      act(() => {
        result.current.fetchData();
      });

      expect(result.current.loading).toBe(true);

      await waitForNextUpdate();

      expect(result.current.loading).toBe(false);
      expect(result.current.value).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      // Mock fetch to throw error
      const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
      
      const { result, waitForNextUpdate } = renderHook(() => 
        useCustomHook({ fetch: mockFetch })
      );

      act(() => {
        result.current.fetchData();
      });

      await waitForNextUpdate();

      expect(result.current.error).toBe('Network error');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup on unmount', () => {
      const cleanup = jest.fn();
      const { unmount } = renderHook(() => useCustomHook({ cleanup }));

      unmount();

      expect(cleanup).toHaveBeenCalled();
    });
  });
});
```

### Survey Hook Test Template

```typescript
// Template: useSurveyHook.test.tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { useSurveyHook } from './useSurveyHook';
import { MockSurveyModel } from '../__mocks__/survey-core/MockSurveyModel';
import { createBasicSurvey } from '../__mocks__/surveyFactories';

describe('useSurveyHook', () => {
  let mockModel: MockSurveyModel;

  beforeEach(() => {
    mockModel = new MockSurveyModel(createBasicSurvey());
  });

  afterEach(() => {
    mockModel.dispose();
  });

  describe('Survey State Management', () => {
    it('should track survey state', () => {
      const { result } = renderHook(() => useSurveyHook(mockModel));

      expect(result.current).toMatchObject({
        currentPageNo: 0,
        isCompleted: false,
        hasErrors: false,
        progress: 0,
      });
    });

    it('should update when model changes', () => {
      const { result } = renderHook(() => useSurveyHook(mockModel));

      act(() => {
        mockModel.setValue('name', 'John Doe');
      });

      expect(result.current.hasData).toBe(true);
    });
  });

  describe('Event Handling', () => {
    it('should handle value change events', () => {
      const onValueChanged = jest.fn();
      const { result } = renderHook(() => 
        useSurveyHook(mockModel, { onValueChanged })
      );

      act(() => {
        mockModel.setValue('name', 'Jane Doe');
      });

      expect(onValueChanged).toHaveBeenCalledWith({
        name: 'name',
        value: 'Jane Doe',
        question: expect.any(Object),
      });
    });

    it('should handle completion events', () => {
      const onComplete = jest.fn();
      const { result } = renderHook(() => 
        useSurveyHook(mockModel, { onComplete })
      );

      act(() => {
        mockModel.completeLastPage();
      });

      expect(onComplete).toHaveBeenCalledWith(mockModel.data);
      expect(result.current.isCompleted).toBe(true);
    });
  });

  describe('Navigation Functions', () => {
    it('should provide navigation functions', () => {
      const multiPageModel = new MockSurveyModel(createMultiPageSurvey(3));
      const { result } = renderHook(() => useSurveyHook(multiPageModel));

      expect(typeof result.current.nextPage).toBe('function');
      expect(typeof result.current.prevPage).toBe('function');

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.currentPageNo).toBe(1);
    });
  });
});
```

## Integration Test Templates

### Component Integration Test Template

```typescript
// Template: ComponentIntegration.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ComponentIntegration } from './ComponentIntegration';
import { MockSurveyModel } from '../__mocks__/survey-core/MockSurveyModel';
import { createBasicSurvey } from '../__mocks__/surveyFactories';

describe('ComponentIntegration', () => {
  let mockModel: MockSurveyModel;

  beforeEach(() => {
    mockModel = new MockSurveyModel(createBasicSurvey());
  });

  afterEach(() => {
    mockModel.dispose();
  });

  describe('Survey Model Integration', () => {
    it('should sync with survey model data', () => {
      const { getByTestId } = render(
        <ComponentIntegration model={mockModel} />
      );

      const input = getByTestId('survey-input');

      // UI -> Model
      fireEvent.changeText(input, 'John Doe');
      expect(mockModel.getValue('name')).toBe('John Doe');

      // Model -> UI
      act(() => {
        mockModel.setValue('name', 'Jane Doe');
      });
      
      expect(input.props.value).toBe('Jane Doe');
    });

    it('should handle model state changes', async () => {
      const { getByText, queryByText } = render(
        <ComponentIntegration model={mockModel} />
      );

      // Start completion
      fireEvent.press(getByText('Complete Survey'));

      // Should show loading state
      expect(getByText('Completing...')).toBeTruthy();

      // Wait for completion
      await waitFor(() => {
        expect(queryByText('Completing...')).toBeNull();
        expect(getByText('Survey Completed')).toBeTruthy();
      });
    });
  });

  describe('Multi-Component Integration', () => {
    it('should coordinate between multiple components', () => {
      const { getByTestId } = render(
        <ComponentIntegration model={mockModel} />
      );

      const questionInput = getByTestId('question-input');
      const progressBar = getByTestId('progress-bar');

      // Answer question
      fireEvent.changeText(questionInput, 'Answer');

      // Progress should update
      expect(progressBar.props.progress).toBeGreaterThan(0);
    });
  });

  describe('Error Propagation', () => {
    it('should propagate errors through component tree', () => {
      const errorModel = new MockSurveyModel();
      errorModel.setValue('required-field', ''); // Trigger validation error

      const { getByText } = render(
        <ComponentIntegration model={errorModel} />
      );

      fireEvent.press(getByText('Next'));

      expect(getByText('Please fill in all required fields')).toBeTruthy();
    });
  });
});
```

### End-to-End Flow Test Template

```typescript
// Template: EndToEndFlow.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SurveyApp } from './SurveyApp';
import { createMultiPageSurvey } from '../__mocks__/surveyFactories';

describe('End-to-End Survey Flow', () => {
  const surveyJson = createMultiPageSurvey(3);

  describe('Complete Survey Journey', () => {
    it('should allow user to complete entire survey', async () => {
      const onComplete = jest.fn();
      const { getByTestId, getByText } = render(
        <SurveyApp surveyJson={surveyJson} onComplete={onComplete} />
      );

      // Page 1
      expect(getByText('Page 1')).toBeTruthy();
      fireEvent.changeText(getByTestId('question-1'), 'Answer 1');
      fireEvent.press(getByText('Next'));

      // Page 2
      await waitFor(() => {
        expect(getByText('Page 2')).toBeTruthy();
      });
      fireEvent.changeText(getByTestId('question-2'), 'Answer 2');
      fireEvent.press(getByText('Next'));

      // Page 3 (final)
      await waitFor(() => {
        expect(getByText('Page 3')).toBeTruthy();
      });
      fireEvent.changeText(getByTestId('question-3'), 'Answer 3');
      fireEvent.press(getByText('Complete'));

      // Completion
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith({
          'question-1': 'Answer 1',
          'question-2': 'Answer 2',
          'question-3': 'Answer 3',
        });
      });
    });

    it('should handle navigation back and forth', async () => {
      const { getByTestId, getByText } = render(
        <SurveyApp surveyJson={surveyJson} />
      );

      // Fill first page
      fireEvent.changeText(getByTestId('question-1'), 'Answer 1');
      fireEvent.press(getByText('Next'));

      // Go to second page
      await waitFor(() => {
        expect(getByText('Page 2')).toBeTruthy();
      });

      // Go back
      fireEvent.press(getByText('Previous'));

      // Should preserve answer
      await waitFor(() => {
        expect(getByTestId('question-1').props.value).toBe('Answer 1');
      });
    });
  });

  describe('Validation Flow', () => {
    it('should prevent progression with validation errors', () => {
      const surveyWithRequired = createMultiPageSurvey(2, { includeRequired: true });
      const { getByText, queryByText } = render(
        <SurveyApp surveyJson={surveyWithRequired} />
      );

      // Try to proceed without filling required field
      fireEvent.press(getByText('Next'));

      // Should show error and stay on same page
      expect(getByText('This field is required')).toBeTruthy();
      expect(queryByText('Page 2')).toBeNull();
    });
  });
});
```

## Accessibility Test Templates

### Component Accessibility Test Template

```typescript
// Template: ComponentAccessibility.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { ComponentAccessibility } from './ComponentAccessibility';

describe('ComponentAccessibility', () => {
  const defaultProps = {
    title: 'Accessible Component',
    value: 'test value',
    onValueChange: jest.fn(),
  };

  describe('Screen Reader Support', () => {
    it('should have proper accessibility labels', () => {
      const { getByLabelText } = render(
        <ComponentAccessibility {...defaultProps} />
      );

      expect(getByLabelText('Accessible Component')).toBeTruthy();
    });

    it('should have descriptive accessibility hints', () => {
      const { getByTestId } = render(
        <ComponentAccessibility {...defaultProps} />
      );

      const input = getByTestId('component-input');
      expect(input.props.accessibilityHint).toBe('Enter your response here');
    });

    it('should announce state changes', () => {
      const { getByTestId, rerender } = render(
        <ComponentAccessibility {...defaultProps} />
      );

      const statusElement = getByTestId('status-announcement');
      expect(statusElement.props.accessibilityLiveRegion).toBe('polite');

      // Test with error state
      rerender(
        <ComponentAccessibility {...defaultProps} hasError errorMessage="Required field" />
      );

      const errorElement = getByTestId('error-announcement');
      expect(errorElement.props.accessibilityLiveRegion).toBe('assertive');
      expect(errorElement.props.accessibilityRole).toBe('alert');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard focus', () => {
      const { getByTestId } = render(
        <ComponentAccessibility {...defaultProps} />
      );

      const focusableElement = getByTestId('focusable-element');
      expect(focusableElement.props.accessible).toBe(true);
      expect(focusableElement.props.accessibilityRole).toBeDefined();
    });

    it('should have proper tab order', () => {
      const { getAllByRole } = render(
        <ComponentAccessibility {...defaultProps} />
      );

      const focusableElements = getAllByRole('button');
      focusableElements.forEach((element, index) => {
        expect(element.props.accessibilityTabIndex).toBe(index);
      });
    });
  });

  describe('Touch Target Size', () => {
    it('should have minimum touch target size', () => {
      const { getByTestId } = render(
        <ComponentAccessibility {...defaultProps} />
      );

      const touchTarget = getByTestId('touch-target');
      const style = touchTarget.props.style;
      
      expect(style.minWidth).toBeGreaterThanOrEqual(44);
      expect(style.minHeight).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Color and Contrast', () => {
    it('should not rely solely on color for information', () => {
      const { getByTestId } = render(
        <ComponentAccessibility {...defaultProps} hasError />
      );

      const errorIndicator = getByTestId('error-indicator');
      
      // Should have text or icon, not just color
      expect(
        errorIndicator.props.accessibilityLabel || 
        errorIndicator.children
      ).toBeTruthy();
    });
  });

  describe('Semantic Roles', () => {
    it('should use appropriate accessibility roles', () => {
      const { getByTestId } = render(
        <ComponentAccessibility {...defaultProps} />
      );

      expect(getByTestId('form-container').props.accessibilityRole).toBe('form');
      expect(getByTestId('input-field').props.accessibilityRole).toBe('none');
      expect(getByTestId('submit-button').props.accessibilityRole).toBe('button');
    });
  });
});
```

## Performance Test Templates

### Component Performance Test Template

```typescript
// Template: ComponentPerformance.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { ComponentPerformance } from './ComponentPerformance';

describe('ComponentPerformance', () => {
  describe('Render Performance', () => {
    it('should render efficiently with large datasets', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        title: `Item ${i}`,
        value: `Value ${i}`,
      }));

      const start = performance.now();
      const { toJSON } = render(
        <ComponentPerformance data={largeDataset} />
      );
      const renderTime = performance.now() - start;

      expect(renderTime).toBeLessThan(100); // Should render in <100ms
      expect(toJSON()).toBeTruthy();
    });

    it('should not cause unnecessary re-renders', () => {
      const ChildComponent = jest.fn(() => <Text>Child</Text>);
      
      const { rerender } = render(
        <ComponentPerformance>
          <ChildComponent />
        </ComponentPerformance>
      );

      expect(ChildComponent).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(
        <ComponentPerformance>
          <ChildComponent />
        </ComponentPerformance>
      );

      // Should not re-render child
      expect(ChildComponent).toHaveBeenCalledTimes(1);
    });
  });

  describe('Memory Performance', () => {
    it('should not leak memory on unmount', () => {
      const cleanup = jest.fn();
      const { unmount } = render(
        <ComponentPerformance onCleanup={cleanup} />
      );

      unmount();

      expect(cleanup).toHaveBeenCalled();
    });

    it('should handle rapid prop changes efficiently', () => {
      const { rerender } = render(
        <ComponentPerformance value="initial" />
      );

      const start = performance.now();
      
      // Simulate rapid changes
      for (let i = 0; i < 100; i++) {
        rerender(<ComponentPerformance value={`value-${i}`} />);
      }
      
      const updateTime = performance.now() - start;
      expect(updateTime).toBeLessThan(50); // Should handle updates efficiently
    });
  });

  describe('Animation Performance', () => {
    it('should maintain 60fps during animations', async () => {
      const { getByTestId } = render(
        <ComponentPerformance animated />
      );

      const animatedElement = getByTestId('animated-element');
      
      // Trigger animation
      fireEvent.press(getByTestId('animate-button'));

      // Check animation properties
      expect(animatedElement.props.style.transform).toBeDefined();
    });
  });
});
```

## Cross-Platform Test Templates

### Platform-Specific Test Template

```typescript
// Template: CrossPlatform.test.tsx
import React from 'react';
import { Platform } from 'react-native';
import { render } from '@testing-library/react-native';
import { CrossPlatformComponent } from './CrossPlatformComponent';

describe('CrossPlatformComponent', () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  describe('iOS Specific Behavior', () => {
    beforeEach(() => {
      Platform.OS = 'ios';
    });

    it('should render iOS-specific styles', () => {
      const { getByTestId } = render(<CrossPlatformComponent />);
      const component = getByTestId('platform-component');

      expect(component.props.style).toMatchObject({
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      });
    });

    it('should handle iOS-specific interactions', () => {
      const { getByTestId } = render(<CrossPlatformComponent />);
      const component = getByTestId('platform-component');

      // Test iOS-specific gesture handling
      fireEvent(component, 'onSwipeGesture', { direction: 'left' });
      // Add iOS-specific assertions
    });
  });

  describe('Android Specific Behavior', () => {
    beforeEach(() => {
      Platform.OS = 'android';
    });

    it('should render Android-specific styles', () => {
      const { getByTestId } = render(<CrossPlatformComponent />);
      const component = getByTestId('platform-component');

      expect(component.props.style).toMatchObject({
        elevation: 5,
      });
    });

    it('should handle Android back button', () => {
      const onBackPress = jest.fn();
      const { getByTestId } = render(
        <CrossPlatformComponent onBackPress={onBackPress} />
      );

      // Simulate hardware back button
      fireEvent(getByTestId('platform-component'), 'onBackPress');
      expect(onBackPress).toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    const mockDimensions = (width: number, height: number) => {
      jest.doMock('react-native/Libraries/Utilities/Dimensions', () => ({
        get: () => ({ width, height }),
      }));
    };

    it('should adapt to phone sizes', () => {
      mockDimensions(375, 667); // iPhone 8
      
      const { getByTestId } = render(<CrossPlatformComponent />);
      const container = getByTestId('responsive-container');

      expect(container.props.style.flexDirection).toBe('column');
    });

    it('should adapt to tablet sizes', () => {
      mockDimensions(768, 1024); // iPad
      
      const { getByTestId } = render(<CrossPlatformComponent />);
      const container = getByTestId('responsive-container');

      expect(container.props.style.flexDirection).toBe('row');
    });
  });
});
```

## Error Handling Test Templates

### Error Boundary Test Template

```typescript
// Template: ErrorBoundary.test.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { ErrorBoundary } from './ErrorBoundary';

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>No error</Text>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error during error boundary tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Error Catching', () => {
    it('should render children when no error occurs', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(getByText('No error')).toBeTruthy();
    });

    it('should render error UI when error occurs', () => {
      const { getByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText('Something went wrong')).toBeTruthy();
    });

    it('should log error details', () => {
      const onError = jest.fn();
      
      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
    });
  });

  describe('Error Recovery', () => {
    it('should allow retry after error', () => {
      const { getByText, rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(getByText('Something went wrong')).toBeTruthy();

      // Retry with fixed component
      fireEvent.press(getByText('Try Again'));

      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(getByText('No error')).toBeTruthy();
    });
  });
});
```

## Mock Test Templates

### Mock Implementation Test Template

```typescript
// Template: MockImplementation.test.tsx
import { MockSurveyModel } from './MockSurveyModel';
import { createBasicSurvey } from '../factories/surveyFactories';

describe('MockSurveyModel', () => {
  let mockModel: MockSurveyModel;

  beforeEach(() => {
    mockModel = new MockSurveyModel(createBasicSurvey());
  });

  afterEach(() => {
    mockModel.dispose();
  });

  describe('Interface Compliance', () => {
    it('should implement all required methods', () => {
      const requiredMethods = [
        'getValue',
        'setValue',
        'nextPage',
        'prevPage',
        'completeLastPage',
        'hasErrors',
        'dispose',
      ];

      requiredMethods.forEach(method => {
        expect(typeof mockModel[method]).toBe('function');
      });
    });

    it('should have all required properties', () => {
      const requiredProperties = [
        'data',
        'currentPageNo',
        'state',
        'onValueChanged',
        'onComplete',
        'onCurrentPageChanged',
      ];

      requiredProperties.forEach(property => {
        expect(mockModel[property]).toBeDefined();
      });
    });
  });

  describe('Behavioral Consistency', () => {
    it('should behave like real survey model for basic operations', () => {
      // Test value operations
      expect(mockModel.getValue('name')).toBeUndefined();
      
      mockModel.setValue('name', 'John Doe');
      expect(mockModel.getValue('name')).toBe('John Doe');

      // Test state changes
      expect(mockModel.state).toBe('running');
      
      mockModel.completeLastPage();
      expect(mockModel.state).toBe('completed');
    });

    it('should fire events correctly', () => {
      const valueChangedHandler = jest.fn();
      const completeHandler = jest.fn();

      mockModel.onValueChanged.add(valueChangedHandler);
      mockModel.onComplete.add(completeHandler);

      mockModel.setValue('name', 'John');
      expect(valueChangedHandler).toHaveBeenCalledWith(mockModel, {
        name: 'name',
        value: 'John',
        oldValue: undefined,
        question: expect.any(Object),
      });

      mockModel.completeLastPage();
      expect(completeHandler).toHaveBeenCalledWith(mockModel, {
        isCompleted: true,
        data: mockModel.data,
      });
    });
  });

  describe('Mock-Specific Features', () => {
    it('should allow state manipulation for testing', () => {
      // Direct state manipulation (only available in mock)
      mockModel.state = 'loading';
      expect(mockModel.state).toBe('loading');

      // Reset to running
      mockModel.state = 'running';
      expect(mockModel.state).toBe('running');
    });

    it('should provide test utilities', () => {
      // Add test-specific methods
      expect(typeof mockModel.reset).toBe('function');
      expect(typeof mockModel.triggerError).toBe('function');
    });
  });
});
```

## Usage Guidelines

### Selecting the Right Template

1. **Component Tests**: Use for React Native components
2. **Hook Tests**: Use for custom hooks
3. **Integration Tests**: Use for component interactions
4. **Accessibility Tests**: Always include for user-facing components
5. **Performance Tests**: Use for components handling large data or animations
6. **Cross-Platform Tests**: Use for platform-specific functionality
7. **Error Tests**: Use for error boundaries and error handling
8. **Mock Tests**: Use to validate mock implementations

### Customizing Templates

1. Replace placeholder names with actual component/function names
2. Adjust test scenarios to match your specific requirements
3. Add or remove test cases based on component complexity
4. Update mock data to match your domain
5. Modify assertions to match expected behavior

### Template Best Practices

1. **Start with Basic**: Begin with basic template and add complexity
2. **One Scenario Per Test**: Keep tests focused and isolated
3. **Descriptive Names**: Use clear, behavior-focused test names
4. **Proper Setup**: Include necessary setup and teardown
5. **Edge Cases**: Don't forget to test error conditions
6. **Accessibility**: Always include accessibility tests
7. **Performance**: Add performance tests for critical components

Remember: Templates are starting points - adapt them to your specific needs while maintaining TDD principles!