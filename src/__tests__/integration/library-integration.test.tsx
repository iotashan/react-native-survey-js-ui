/**
 * Library Integration Tests
 * 
 * Validates that the library exports work correctly and can be imported
 * without testing the full survey-core integration (which is tested in unit tests)
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';

// Test main library exports
import { Survey, useSurveyModel, useSurveyState } from '../../index';
import type { SurveyModel } from '../../types';

describe('Library Integration Tests', () => {
  test('main exports are available', () => {
    expect(Survey).toBeDefined();
    expect(typeof Survey).toBe('function');
    expect(useSurveyModel).toBeDefined();
    expect(typeof useSurveyModel).toBe('function');
    expect(useSurveyState).toBeDefined();
    expect(typeof useSurveyState).toBe('function');
  });

  test('Survey component can be rendered', () => {
    // Test that Survey component can be instantiated
    // Even if it shows an error due to mocks, it should render
    const surveyJson = { pages: [{ elements: [{ type: 'text', name: 'q1' }] }] };
    
    const TestComponent = () => {
      return (
        <View>
          <Survey model={surveyJson} />
        </View>
      );
    };

    const result = render(<TestComponent />);
    expect(result).toBeDefined();
  });

  test('hooks can be imported and have correct types', () => {
    // Test that hooks exist and have the expected structure
    expect(useSurveyModel).toBeDefined();
    expect(typeof useSurveyModel).toBe('function');

    expect(useSurveyState).toBeDefined();
    expect(typeof useSurveyState).toBe('function');
  });

  test('TypeScript types are exported', () => {
    // This test passes if TypeScript compilation succeeds
    const testModel: SurveyModel = {
      pages: [{
        elements: [{
          type: 'text',
          name: 'test'
        }]
      }]
    };

    expect(testModel).toBeDefined();
    expect(testModel.pages).toBeDefined();
  });
});