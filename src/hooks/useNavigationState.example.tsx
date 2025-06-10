import * as React from 'react';
import { View, Text, Button } from 'react-native';
import { Model } from 'survey-core';
import { useSurveyModel } from '../useSurveyModel';
import { useSurveyState } from '../useSurveyState';
import { useNavigationState } from '../useNavigationState';
import { PageNavigation } from '../../components/PageNavigation';

/**
 * Example: Basic Navigation with Enhanced State Management
 * 
 * This example shows how to use the useNavigationState hook
 * to manage survey navigation with integrated validation
 */
export function BasicNavigationExample() {
  const surveyJson = {
    pages: [
      {
        name: "page1",
        elements: [
          {
            type: "text",
            name: "name",
            title: "What is your name?",
            isRequired: true
          }
        ]
      },
      {
        name: "page2",
        elements: [
          {
            type: "text",
            name: "email",
            title: "What is your email?",
            isRequired: true,
            validators: [{ type: "email" }]
          }
        ]
      },
      {
        name: "page3",
        elements: [
          {
            type: "comment",
            name: "feedback",
            title: "Any feedback?"
          }
        ]
      }
    ]
  };

  const { model } = useSurveyModel({ json: surveyJson });
  const surveyState = useSurveyState(model);
  const { navigationState, navigateNext, navigatePrevious, completeSurvey } = 
    useNavigationState(model, surveyState.validation);

  return (
    <View>
      <Text>Page {navigationState.currentPageNo + 1} of {navigationState.pageCount}</Text>
      
      {/* Survey content would go here */}
      
      <PageNavigation
        navigationState={{
          ...navigationState,
          validationError: navigationState.navigationError,
        }}
        onNext={() => navigateNext(surveyState.validateCurrentPage)}
        onPrevious={() => navigatePrevious()}
        onComplete={() => completeSurvey(surveyState.validateCurrentPage)}
        validationState={surveyState.validation}
      />
    </View>
  );
}

/**
 * Example: Single Page Survey
 * 
 * Demonstrates how navigation state automatically handles
 * single-page surveys by only showing the Complete button
 */
export function SinglePageSurveyExample() {
  const surveyJson = {
    pages: [
      {
        name: "singlePage",
        elements: [
          {
            type: "text",
            name: "fullName",
            title: "Full Name",
            isRequired: true
          },
          {
            type: "text",
            name: "phone",
            title: "Phone Number",
            isRequired: true
          }
        ]
      }
    ]
  };

  const { model } = useSurveyModel({ json: surveyJson });
  const surveyState = useSurveyState(model);
  const { navigationState, completeSurvey } = 
    useNavigationState(model, surveyState.validation);

  return (
    <View>
      <Text>Single Page Survey</Text>
      
      {/* Survey will only show Complete button */}
      <View>
        <Text>Show Previous: {navigationState.showPrevious ? 'Yes' : 'No'}</Text>
        <Text>Show Next: {navigationState.showNext ? 'Yes' : 'No'}</Text>
        <Text>Show Complete: {navigationState.showComplete ? 'Yes' : 'No'}</Text>
      </View>
      
      {navigationState.showComplete && (
        <Button
          title="Complete"
          disabled={!navigationState.canComplete}
          onPress={() => completeSurvey(surveyState.validateCurrentPage)}
        />
      )}
    </View>
  );
}

/**
 * Example: Custom Navigation with Validation
 * 
 * Shows how to implement custom navigation logic while
 * leveraging the navigation state management
 */
export function CustomNavigationExample() {
  const surveyJson = {
    pages: [
      {
        name: "page1",
        elements: [
          {
            type: "radiogroup",
            name: "experience",
            title: "Rate your experience",
            isRequired: true,
            choices: ["Excellent", "Good", "Fair", "Poor"]
          }
        ]
      },
      {
        name: "page2",
        elements: [
          {
            type: "comment",
            name: "improvements",
            title: "What could we improve?",
            visibleIf: "{experience} = 'Fair' or {experience} = 'Poor'",
            isRequired: true
          }
        ]
      }
    ],
    checkErrorsMode: "onComplete" // Allow navigation with errors until completion
  };

  const { model } = useSurveyModel({ json: surveyJson });
  const surveyState = useSurveyState(model);
  const { navigationState, navigateNext, navigatePrevious, completeSurvey } = 
    useNavigationState(model, surveyState.validation);

  // Custom validation logic
  const handleNext = async () => {
    // You can add custom logic before navigation
    console.log('Current answers:', surveyState.data);
    
    // Navigate with validation
    await navigateNext(surveyState.validateCurrentPage);
    
    // Custom logic after navigation
    if (!navigationState.navigationError) {
      console.log('Successfully navigated to page', navigationState.currentPageNo + 1);
    }
  };

  const handleComplete = async () => {
    // Validate all pages before completion
    const allPagesValid = surveyState.validateAllPages();
    
    if (allPagesValid) {
      await completeSurvey();
      console.log('Survey completed with data:', surveyState.data);
    } else {
      console.log('Please fix all errors before submitting');
    }
  };

  return (
    <View>
      <Text>Navigation State Details:</Text>
      <Text>Current Page: {navigationState.currentPageNo + 1}</Text>
      <Text>Is Navigating: {navigationState.isNavigating ? 'Yes' : 'No'}</Text>
      <Text>Has Errors: {surveyState.validation.hasErrors ? 'Yes' : 'No'}</Text>
      <Text>Can Go Next: {navigationState.canGoNext ? 'Yes' : 'No'}</Text>
      
      {navigationState.navigationError && (
        <Text style={{ color: 'red' }}>{navigationState.navigationError}</Text>
      )}
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {navigationState.showPrevious && (
          <Button
            title="Previous"
            disabled={!navigationState.canGoPrevious}
            onPress={() => navigatePrevious()}
          />
        )}
        
        {navigationState.showNext && (
          <Button
            title="Next"
            disabled={!navigationState.canGoNext}
            onPress={handleNext}
          />
        )}
        
        {navigationState.showComplete && (
          <Button
            title="Complete"
            disabled={!navigationState.canComplete}
            onPress={handleComplete}
          />
        )}
      </View>
    </View>
  );
}

/**
 * Example: Handling Navigation Events
 * 
 * Demonstrates how to respond to navigation state changes
 * and survey completion
 */
export function NavigationEventsExample() {
  const surveyJson = {
    pages: [
      { name: "page1", elements: [{ type: "text", name: "q1" }] },
      { name: "page2", elements: [{ type: "text", name: "q2" }] }
    ]
  };

  const { model } = useSurveyModel({ json: surveyJson });
  const surveyState = useSurveyState(model);
  const { navigationState, navigateNext, completeSurvey } = 
    useNavigationState(model, surveyState.validation);

  // React to navigation state changes
  React.useEffect(() => {
    if (navigationState.isCompleted) {
      console.log('Survey completed!');
      // Handle completion (e.g., submit data, show thank you page)
    }
  }, [navigationState.isCompleted]);

  React.useEffect(() => {
    if (navigationState.isCompleting) {
      console.log('Survey is being completed...');
      // Show completion progress
    }
  }, [navigationState.isCompleting]);

  React.useEffect(() => {
    console.log(`Navigated to page ${navigationState.currentPageNo + 1}`);
    // Analytics, progress tracking, etc.
  }, [navigationState.currentPageNo]);

  return (
    <View>
      <Text>Survey Status:</Text>
      <Text>Completed: {navigationState.isCompleted ? 'Yes' : 'No'}</Text>
      <Text>Completing: {navigationState.isCompleting ? 'Yes' : 'No'}</Text>
      
      {/* Navigation buttons */}
    </View>
  );
}