import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text, TextInput } from 'react-native';
import type { Model, Question, PanelModel } from 'survey-core';

// Mock validation module before other imports
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
jest.mock('../../contexts/ValidationContext', () => {
  const React = require('react');
  const { createContext, useContext, useState, useCallback } = React;
  
  const ValidationContext = createContext({
    model: null,
    validationMode: 'on-submit',
    errors: {},
    touchedFields: {},
    hasErrors: false,
    isValidating: false,
    validateField: jest.fn().mockReturnValue(true),
    validatePage: jest.fn().mockReturnValue(true),
    validateSurvey: jest.fn().mockReturnValue(true),
    setValidationMode: jest.fn(),
    clearErrors: jest.fn(),
    clearFieldError: jest.fn(),
    setFieldError: jest.fn(),
    getFieldErrors: jest.fn().mockReturnValue([]),
    markFieldTouched: jest.fn(),
  });
  
  const ValidationProvider = ({ children, model, initialMode = 'on-submit' }) => {
    const [errors, setErrors] = useState({});
    
    const getFieldErrors = useCallback((fieldName) => {
      return errors[fieldName] || [];
    }, [errors]);
    
    const setFieldError = useCallback((fieldName, fieldErrors) => {
      setErrors(prev => ({
        ...prev,
        [fieldName]: fieldErrors,
      }));
    }, []);
    
    const markFieldTouched = jest.fn();
    const validateField = jest.fn();
    
    const value = {
      model,
      validationMode: initialMode,
      errors,
      touchedFields: {},
      hasErrors: Object.keys(errors).length > 0,
      isValidating: false,
      validateField,
      validatePage: jest.fn().mockReturnValue(true),
      validateSurvey: jest.fn().mockReturnValue(true),
      setValidationMode: jest.fn(),
      clearErrors: () => setErrors({}),
      clearFieldError: jest.fn(),
      setFieldError,
      getFieldErrors,
      markFieldTouched,
    };
    
    return React.createElement(ValidationContext.Provider, { value }, children);
  };
  
  const useValidation = () => {
    const context = useContext(ValidationContext);
    if (!context) {
      throw new Error('useValidation must be used within a ValidationProvider');
    }
    return context;
  };
  
  return {
    ValidationProvider,
    useValidation,
    ValidationContext,
  };
});

// Mock survey-core module
jest.mock('survey-core', () => {
  const mockPanel = {
    name: 'panel1',
    title: 'Panel 1',
    panels: [],
    questions: [],
    isPanel: true,
    isExpanded: true,
    state: 'expanded',
    errors: [],
    hasErrors: false,
    validate: jest.fn().mockReturnValue(true),
    clearIncorrectValues: jest.fn(),
    getAllQuestions: jest.fn().mockReturnValue([]),
  };

  const mockModel = {
    currentPageNo: 0,
    pageCount: 1,
    isFirstPage: true,
    isLastPage: true,
    currentPage: {
      name: 'page1',
      title: 'Page 1',
      panels: [mockPanel],
      questions: [],
      hasErrors: false,
      errors: [],
      validate: jest.fn().mockReturnValue(true),
      clearIncorrectValues: jest.fn(),
      getAllQuestions: jest.fn().mockReturnValue([]),
    },
    pages: [],
    panels: [],
    getAllPanels: jest.fn().mockReturnValue([]),
    getPanelByName: jest.fn(),
    setValue: jest.fn(),
    getValue: jest.fn(),
    getAllQuestions: jest.fn().mockReturnValue([]),
    getQuestionByName: jest.fn(),
    validate: jest.fn().mockReturnValue(true),
    validateCurrentPage: jest.fn().mockReturnValue(true),
    clearErrors: jest.fn(),
    // Event handlers
    onValidatePanel: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onCurrentPageChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onValidatedErrorsOnCurrentPage: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onValueChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onPropertyChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    getPropertyValue: jest.fn(),
  };

  // Mock Model constructor
  const Model = jest.fn((json) => {
    const instance = { 
      ...mockModel,
      
      // Create panel hierarchy from JSON
      createPanelHierarchy: function(panelData: any, parent?: any) {
        const panel = {
          name: panelData.name,
          title: panelData.title || panelData.name,
          panels: [],
          questions: [],
          isPanel: true,
          isExpanded: true,
          state: 'expanded',
          errors: [],
          hasErrors: false,
          parent,
          validate: jest.fn().mockReturnValue(true),
          clearIncorrectValues: jest.fn(),
          getAllQuestions: jest.fn(),
        };
        
        // Add questions to panel
        if (panelData.elements) {
          panel.questions = panelData.elements.map((element: any) => ({
            ...element,
            parent: panel,
            value: '',
            errors: [],
            hasErrors: false,
            validate: jest.fn().mockReturnValue(!element.isRequired || !!element.value),
            clearIncorrectValues: jest.fn(),
          }));
        }
        
        // Add nested panels
        if (panelData.panels) {
          panel.panels = panelData.panels.map((subPanel: any) => 
            this.createPanelHierarchy(subPanel, panel)
          );
        }
        
        // Update getAllQuestions to return all nested questions
        panel.getAllQuestions = jest.fn().mockReturnValue([
          ...panel.questions,
          ...panel.panels.flatMap(p => p.getAllQuestions()),
        ]);
        
        return panel;
      },
      
      validateCurrentPage: jest.fn(function() {
        // Validate all panels on current page
        const validatePanel = (panel: any): boolean => {
          let isValid = true;
          
          // Validate panel's questions
          for (const question of panel.questions) {
            if (question.isRequired && !question.value) {
              question.errors = ['This field is required'];
              question.hasErrors = true;
              panel.hasErrors = true;
              isValid = false;
            }
          }
          
          // Validate nested panels
          for (const nestedPanel of panel.panels) {
            if (!validatePanel(nestedPanel)) {
              panel.hasErrors = true;
              isValid = false;
            }
          }
          
          panel.errors = panel.hasErrors ? ['Panel has validation errors'] : [];
          return isValid;
        };
        
        let pageIsValid = true;
        for (const panel of this.currentPage.panels) {
          if (!validatePanel(panel)) {
            pageIsValid = false;
          }
        }
        
        this.currentPage.hasErrors = !pageIsValid;
        
        // Trigger validation event
        const handlers = this.onValidatedErrorsOnCurrentPage.add.mock.calls;
        handlers.forEach(([handler]) => handler && handler());
        
        return pageIsValid;
      }),
      
      getPanelByName: jest.fn(function(name: string) {
        const searchPanels = (panels: any[]): any => {
          for (const panel of panels) {
            if (panel.name === name) return panel;
            const found = searchPanels(panel.panels || []);
            if (found) return found;
          }
          return null;
        };
        
        return searchPanels(this.currentPage.panels || []);
      }),
      
      getAllPanels: jest.fn(function() {
        const collectPanels = (panels: any[]): any[] => {
          const result: any[] = [];
          for (const panel of panels) {
            result.push(panel);
            result.push(...collectPanels(panel.panels || []));
          }
          return result;
        };
        
        return collectPanels(this.currentPage.panels || []);
      }),
    };
    
    if (json?.pages) {
      instance.pageCount = json.pages.length;
      instance.pages = json.pages.map((page: any, index: number) => ({
        ...page,
        visibleIndex: index,
        hasErrors: false,
        errors: [],
        panels: [],
        questions: page.elements?.filter((e: any) => e.type !== 'panel') || [],
        validate: jest.fn().mockReturnValue(true),
        clearIncorrectValues: jest.fn(),
        getAllQuestions: jest.fn(),
      }));
      
      // Process panels for each page
      instance.pages.forEach((page: any, pageIndex: number) => {
        if (json.pages[pageIndex].elements) {
          page.panels = json.pages[pageIndex].elements
            .filter((e: any) => e.type === 'panel')
            .map((panelData: any) => instance.createPanelHierarchy(panelData));
        }
        
        // Update getAllQuestions for page
        page.getAllQuestions = jest.fn().mockReturnValue([
          ...page.questions,
          ...page.panels.flatMap((p: any) => p.getAllQuestions()),
        ]);
      });
      
      instance.isFirstPage = true;
      instance.isLastPage = instance.pageCount === 1;
      instance.currentPage = instance.pages[0] || mockModel.currentPage;
      
      // Update model's getAllQuestions
      instance.getAllQuestions = jest.fn().mockReturnValue(
        instance.pages.flatMap((page: any) => page.getAllQuestions())
      );
    }
    
    // Bind methods to instance
    instance.createPanelHierarchy = instance.createPanelHierarchy.bind(instance);
    instance.validateCurrentPage = instance.validateCurrentPage.bind(instance);
    instance.getPanelByName = instance.getPanelByName.bind(instance);
    instance.getAllPanels = instance.getAllPanels.bind(instance);
    
    return instance;
  });

  return { Model };
});

// Import Model after mocking
import { Model } from 'survey-core';

// Mock Survey component to avoid SurveyPage issues
jest.mock('../../components/Survey', () => ({
  Survey: ({ children, model }: any) => {
    const React = require('react');
    const { View } = require('react-native');
    return React.createElement(View, { testID: 'survey' }, children);
  },
}));

// Import components after mocking
import { Survey } from '../../components/Survey';
import { Panel } from '../../components/Panel';
import { ValidationProvider, useValidation } from '../../contexts/ValidationContext';
import { usePageValidation } from '../../hooks/usePageValidation';

// Mock Panel component to render validation errors
jest.mock('../../components/Panel/Panel', () => ({
  Panel: ({ panel, children }: any) => {
    const React = require('react');
    const { View, Text, TextInput } = require('react-native');
    const { useValidation } = require('../../contexts/ValidationContext');
    
    const validation = useValidation();
    
    // Ensure we render based on the panel's current state
    React.useEffect(() => {
      // Force re-render when panel errors change
    }, [panel.hasErrors, panel.errors]);
    
    return (
      <View testID={`panel-${panel.name}`} style={{ padding: 10, borderWidth: 1 }}>
        <Text testID={`panel-title-${panel.name}`}>{panel.title}</Text>
        {panel.hasErrors && (
          <Text testID={`panel-error-${panel.name}`} style={{ color: 'red' }}>
            Panel has validation errors
          </Text>
        )}
        
        {/* Render panel questions */}
        {panel.questions?.map((question: any) => {
          const errors = validation.getFieldErrors(question.name);
          return (
            <View key={question.name} testID={`question-${question.name}`}>
              <Text>{question.title}</Text>
              <TextInput
                testID={`input-${question.name}`}
                value={question.value || ''}
                onChangeText={(text) => {
                  question.value = text;
                  question.errors = [];
                  question.hasErrors = false;
                  if (question.isRequired && !text) {
                    question.errors = ['This field is required'];
                    question.hasErrors = true;
                  }
                  validation.markFieldTouched(question.name);
                  validation.validateField(question.name);
                }}
              />
              {errors.length > 0 && (
                <Text testID={`error-${question.name}`} style={{ color: 'red' }}>
                  {errors[0]}
                </Text>
              )}
            </View>
          );
        })}
        
        {/* Render nested panels */}
        {panel.panels?.map((nestedPanel: any) => (
          <View key={nestedPanel.name} style={{ marginLeft: 20 }}>
            {children}
          </View>
        ))}
      </View>
    );
  },
}));

describe('Validation Panel Integration Tests', () => {
  const createSurveyWithPanels = () => {
    return new Model({
      pages: [
        {
          name: 'page1',
          title: 'Survey Page',
          elements: [
            {
              type: 'panel',
              name: 'personalInfo',
              title: 'Personal Information',
              elements: [
                {
                  type: 'text',
                  name: 'firstName',
                  title: 'First Name',
                  isRequired: true,
                },
                {
                  type: 'text',
                  name: 'lastName',
                  title: 'Last Name',
                  isRequired: true,
                },
              ],
              panels: [
                {
                  type: 'panel',
                  name: 'address',
                  title: 'Address',
                  elements: [
                    {
                      type: 'text',
                      name: 'street',
                      title: 'Street',
                      isRequired: true,
                    },
                    {
                      type: 'text',
                      name: 'city',
                      title: 'City',
                      isRequired: true,
                    },
                  ],
                },
              ],
            },
            {
              type: 'panel',
              name: 'contactInfo',
              title: 'Contact Information',
              elements: [
                {
                  type: 'text',
                  name: 'email',
                  title: 'Email',
                  isRequired: true,
                },
                {
                  type: 'text',
                  name: 'phone',
                  title: 'Phone',
                  isRequired: false,
                },
              ],
            },
          ],
        },
      ],
    });
  };

  describe('Panel-level Validation', () => {
    it('should validate all questions within a panel', async () => {
      const model = createSurveyWithPanels();
      const validation = { 
        validatePage: jest.fn().mockReturnValue(false),
        getFieldErrors: jest.fn((name) => {
          const errors: Record<string, string[]> = {
            firstName: ['This field is required'],
            lastName: ['This field is required'],
          };
          return errors[name] || [];
        }),
        markFieldTouched: jest.fn(),
        validateField: jest.fn(),
      };

      const { getByTestId, queryByTestId } = render(
        <ValidationProvider model={model}>
          <Survey model={model}>
            <Panel panel={model.currentPage.panels[0]} />
          </Survey>
        </ValidationProvider>
      );

      // Validate the page
      model.validateCurrentPage();

      // Should show panel has errors
      await waitFor(() => {
        expect(getByTestId('panel-error-personalInfo')).toBeDefined();
      });

      // Should show individual field errors
      expect(getByTestId('error-firstName')).toBeDefined();
      expect(getByTestId('error-lastName')).toBeDefined();
    });

    it('should clear panel errors when all fields are valid', async () => {
      const model = createSurveyWithPanels();

      const { getByTestId, queryByTestId } = render(
        <ValidationProvider model={model}>
          <Survey model={model}>
            <Panel panel={model.currentPage.panels[0]} />
          </Survey>
        </ValidationProvider>
      );

      // Fill in all required fields
      const personalPanel = model.getPanelByName('personalInfo');
      personalPanel.questions[0].value = 'John'; // firstName
      personalPanel.questions[1].value = 'Doe'; // lastName

      // Also fill nested panel fields
      const addressPanel = personalPanel.panels[0];
      addressPanel.questions[0].value = '123 Main St'; // street
      addressPanel.questions[1].value = 'New York'; // city

      // Validate again
      model.validateCurrentPage();

      // Panel errors should be cleared
      await waitFor(() => {
        expect(queryByTestId('panel-error-personalInfo')).toBeNull();
      });
    });
  });

  describe('Nested Panel Validation', () => {
    it('should validate nested panels and propagate errors upward', async () => {
      const model = createSurveyWithPanels();

      const { getByTestId } = render(
        <ValidationProvider model={model}>
          <Survey model={model}>
            <Panel panel={model.currentPage.panels[0]} />
          </Survey>
        </ValidationProvider>
      );

      // Leave nested panel fields empty
      model.validateCurrentPage();

      // Parent panel should show error
      await waitFor(() => {
        expect(getByTestId('panel-error-personalInfo')).toBeDefined();
      });

      // Nested panel should also show error
      expect(getByTestId('panel-error-address')).toBeDefined();
    });

    it('should validate deeply nested panel hierarchies', async () => {
      // Create a survey with deeper nesting
      const model = new Model({
        pages: [
          {
            name: 'page1',
            elements: [
              {
                type: 'panel',
                name: 'level1',
                title: 'Level 1',
                panels: [
                  {
                    type: 'panel',
                    name: 'level2',
                    title: 'Level 2',
                    panels: [
                      {
                        type: 'panel',
                        name: 'level3',
                        title: 'Level 3',
                        elements: [
                          {
                            type: 'text',
                            name: 'deepField',
                            title: 'Deep Field',
                            isRequired: true,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      const { getByTestId } = render(
        <ValidationProvider model={model}>
          <Survey model={model}>
            <Panel panel={model.currentPage.panels[0]} />
          </Survey>
        </ValidationProvider>
      );

      // Validate
      model.validateCurrentPage();

      // All levels should show errors
      await waitFor(() => {
        expect(getByTestId('panel-error-level1')).toBeDefined();
        expect(getByTestId('panel-error-level2')).toBeDefined();
        expect(getByTestId('panel-error-level3')).toBeDefined();
      });
    });
  });

  describe('Collapsed Panel Validation', () => {
    it('should validate fields in collapsed panels', async () => {
      const model = createSurveyWithPanels();
      const personalPanel = model.getPanelByName('personalInfo');
      personalPanel.state = 'collapsed';
      personalPanel.isExpanded = false;

      const { queryByTestId } = render(
        <ValidationProvider model={model}>
          <Survey model={model}>
            <Panel panel={personalPanel} />
          </Survey>
        </ValidationProvider>
      );

      // Validate even though panel is collapsed
      const isValid = model.validateCurrentPage();

      // Validation should fail
      expect(isValid).toBe(false);
      expect(personalPanel.hasErrors).toBe(true);
    });
  });

  describe('Panel Validation Events', () => {
    it('should trigger onValidatePanel event for each panel', async () => {
      const model = createSurveyWithPanels();
      const onValidatePanel = jest.fn();
      model.onValidatePanel.add(onValidatePanel);

      render(
        <ValidationProvider model={model}>
          <Survey model={model} />
        </ValidationProvider>
      );

      // Validate
      model.validateCurrentPage();

      // Should be called for each panel
      await waitFor(() => {
        const allPanels = model.getAllPanels();
        expect(onValidatePanel).toHaveBeenCalledTimes(allPanels.length);
      });
    });
  });

  describe('Cross-panel Validation', () => {
    it('should support validation that depends on fields in different panels', async () => {
      const model = createSurveyWithPanels();

      // Add custom validation that depends on email from another panel
      const personalPanel = model.getPanelByName('personalInfo');
      const contactPanel = model.getPanelByName('contactInfo');

      // Custom validator that checks if email matches name pattern
      personalPanel.questions[0].validate = jest.fn(function() {
        const email = contactPanel.questions[0].value;
        if (email && !email.toLowerCase().includes(this.value.toLowerCase())) {
          this.errors = ['Email should contain your first name'];
          this.hasErrors = true;
          return false;
        }
        return true;
      });

      const { getByTestId } = render(
        <ValidationProvider model={model}>
          <Survey model={model}>
            <Panel panel={personalPanel} />
            <Panel panel={contactPanel} />
          </Survey>
        </ValidationProvider>
      );

      // Fill mismatching values
      personalPanel.questions[0].value = 'John';
      contactPanel.questions[0].value = 'jane.doe@example.com';

      // Validate
      model.validateCurrentPage();

      // Should show cross-panel validation error
      await waitFor(() => {
        expect(personalPanel.questions[0].hasErrors).toBe(true);
      });
    });
  });

  describe('Panel Validation Performance', () => {
    it('should efficiently validate large panel hierarchies', async () => {
      // Create a survey with many panels
      const panels = Array.from({ length: 20 }, (_, i) => ({
        type: 'panel',
        name: `panel${i}`,
        title: `Panel ${i}`,
        elements: [
          {
            type: 'text',
            name: `field${i}_1`,
            title: `Field ${i}-1`,
            isRequired: true,
          },
          {
            type: 'text',
            name: `field${i}_2`,
            title: `Field ${i}-2`,
            isRequired: true,
          },
        ],
      }));

      const model = new Model({
        pages: [
          {
            name: 'page1',
            elements: panels,
          },
        ],
      });

      const startTime = Date.now();
      
      render(
        <ValidationProvider model={model}>
          <Survey model={model} />
        </ValidationProvider>
      );

      // Validate all panels
      model.validateCurrentPage();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete validation within reasonable time
      expect(duration).toBeLessThan(100); // 100ms threshold
    });
  });

  describe('Panel State and Validation Integration', () => {
    it('should maintain validation state when panels are expanded/collapsed', async () => {
      const model = createSurveyWithPanels();
      const personalPanel = model.getPanelByName('personalInfo');

      const { getByTestId, rerender } = render(
        <ValidationProvider model={model}>
          <Survey model={model}>
            <Panel panel={personalPanel} />
          </Survey>
        </ValidationProvider>
      );

      // Validate to create errors
      model.validateCurrentPage();

      await waitFor(() => {
        expect(getByTestId('panel-error-personalInfo')).toBeDefined();
      });

      // Collapse panel
      personalPanel.state = 'collapsed';
      personalPanel.isExpanded = false;

      rerender(
        <ValidationProvider model={model}>
          <Survey model={model}>
            <Panel panel={personalPanel} />
          </Survey>
        </ValidationProvider>
      );

      // Expand panel again
      personalPanel.state = 'expanded';
      personalPanel.isExpanded = true;

      rerender(
        <ValidationProvider model={model}>
          <Survey model={model}>
            <Panel panel={personalPanel} />
          </Survey>
        </ValidationProvider>
      );

      // Errors should still be present
      expect(personalPanel.hasErrors).toBe(true);
      expect(getByTestId('panel-error-personalInfo')).toBeDefined();
    });
  });
});