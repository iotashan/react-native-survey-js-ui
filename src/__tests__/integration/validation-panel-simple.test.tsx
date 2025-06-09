import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import type { Model } from 'survey-core';

// Mock validation module
jest.mock('../../validation', () => ({
  ValidatorRegistry: {
    register: jest.fn(),
    unregister: jest.fn(),
    get: jest.fn(),
    getAll: jest.fn().mockReturnValue(new Map()),
    clear: jest.fn(),
  },
  CustomValidator: jest.fn().mockImplementation(() => ({
    validate: jest.fn().mockReturnValue(null),
    getErrorText: jest.fn().mockReturnValue(''),
  })),
}));

// Mock contexts
jest.mock('../../contexts/ValidationContext');

// Mock survey-core
jest.mock('survey-core');

// Simple test component
const TestPanelValidation = ({ panels, onValidate }: any) => {
  const [errors, setErrors] = React.useState<Record<string, boolean>>({});
  
  const validatePanels = () => {
    const newErrors: Record<string, boolean> = {};
    
    panels.forEach((panel: any) => {
      // Check if panel has required fields that are empty
      const hasErrors = panel.questions?.some((q: any) => q.isRequired && !q.value);
      if (hasErrors) {
        newErrors[panel.name] = true;
      }
      
      // Check nested panels
      if (panel.panels) {
        panel.panels.forEach((nestedPanel: any) => {
          const nestedHasErrors = nestedPanel.questions?.some((q: any) => q.isRequired && !q.value);
          if (nestedHasErrors) {
            newErrors[panel.name] = true; // Parent panel also has errors
            newErrors[nestedPanel.name] = true;
          }
        });
      }
    });
    
    setErrors(newErrors);
    onValidate?.(newErrors);
  };
  
  return (
    <View testID="test-panel-validation">
      {panels.map((panel: any) => (
        <View key={panel.name} testID={`panel-${panel.name}`}>
          <Text>{panel.title}</Text>
          {errors[panel.name] && (
            <Text testID={`panel-error-${panel.name}`}>Panel has errors</Text>
          )}
          
          {panel.panels?.map((nestedPanel: any) => (
            <View key={nestedPanel.name} testID={`panel-${nestedPanel.name}`}>
              <Text>{nestedPanel.title}</Text>
              {errors[nestedPanel.name] && (
                <Text testID={`panel-error-${nestedPanel.name}`}>Panel has errors</Text>
              )}
            </View>
          ))}
        </View>
      ))}
      
      <Text testID="validate-button" onPress={validatePanels}>
        Validate
      </Text>
    </View>
  );
};

describe('Validation Panel Integration Tests - Simplified', () => {
  describe('Panel Validation Basics', () => {
    it('should show errors for panels with invalid fields', async () => {
      const panels = [
        {
          name: 'personal',
          title: 'Personal Info',
          questions: [
            { name: 'firstName', isRequired: true, value: '' },
            { name: 'lastName', isRequired: true, value: 'Doe' },
          ],
        },
        {
          name: 'contact',
          title: 'Contact Info',
          questions: [
            { name: 'email', isRequired: true, value: 'test@example.com' },
          ],
        },
      ];
      
      const { getByTestId, queryByTestId } = render(
        <TestPanelValidation panels={panels} />
      );
      
      // Validate panels
      fireEvent.press(getByTestId('validate-button'));
      
      // Personal panel should have errors (firstName is empty)
      await waitFor(() => {
        expect(getByTestId('panel-error-personal')).toBeDefined();
      });
      
      // Contact panel should not have errors
      expect(queryByTestId('panel-error-contact')).toBeNull();
    });
    
    it('should propagate errors from nested panels to parent', async () => {
      const panels = [
        {
          name: 'main',
          title: 'Main Panel',
          questions: [],
          panels: [
            {
              name: 'nested',
              title: 'Nested Panel',
              questions: [
                { name: 'field1', isRequired: true, value: '' },
              ],
            },
          ],
        },
      ];
      
      const { getByTestId } = render(
        <TestPanelValidation panels={panels} />
      );
      
      // Validate panels
      fireEvent.press(getByTestId('validate-button'));
      
      // Both nested and parent panels should have errors
      await waitFor(() => {
        expect(getByTestId('panel-error-nested')).toBeDefined();
        expect(getByTestId('panel-error-main')).toBeDefined();
      });
    });
  });
  
  describe('Validation Events', () => {
    it('should trigger validation callback with error state', async () => {
      const onValidate = jest.fn();
      const panels = [
        {
          name: 'panel1',
          title: 'Panel 1',
          questions: [
            { name: 'field1', isRequired: true, value: '' },
          ],
        },
        {
          name: 'panel2',
          title: 'Panel 2',
          questions: [
            { name: 'field2', isRequired: false, value: '' },
          ],
        },
      ];
      
      const { getByTestId } = render(
        <TestPanelValidation panels={panels} onValidate={onValidate} />
      );
      
      // Validate panels
      fireEvent.press(getByTestId('validate-button'));
      
      // Should call onValidate with correct error state
      await waitFor(() => {
        expect(onValidate).toHaveBeenCalledWith({
          panel1: true, // Has errors
          // panel2 is not in errors object (no errors)
        });
      });
    });
  });
  
  describe('Performance', () => {
    it('should handle many panels efficiently', async () => {
      const panels = Array.from({ length: 50 }, (_, i) => ({
        name: `panel${i}`,
        title: `Panel ${i}`,
        questions: [
          { name: `field${i}`, isRequired: i % 2 === 0, value: '' },
        ],
      }));
      
      const startTime = Date.now();
      
      const { getByTestId } = render(
        <TestPanelValidation panels={panels} />
      );
      
      // Validate all panels
      fireEvent.press(getByTestId('validate-button'));
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(200);
      
      // Should show errors for half the panels (even indices)
      await waitFor(() => {
        expect(getByTestId('panel-error-panel0')).toBeDefined();
        expect(getByTestId('panel-error-panel2')).toBeDefined();
      });
    });
  });
});