// Import React hooks directly to avoid resolution issues
import * as React from 'react';
import { Model } from 'survey-core';

export interface SurveyState {
  /**
   * Survey data/answers
   */
  data: any;
  /**
   * Current page number (0-based)
   */
  currentPageNo: number;
  /**
   * Total number of pages
   */
  pageCount: number;
  /**
   * Whether currently on first page
   */
  isFirstPage: boolean;
  /**
   * Whether currently on last page
   */
  isLastPage: boolean;
  /**
   * Whether the survey is completed
   */
  isCompleted: boolean;
  /**
   * All questions with their current values
   */
  questions: Array<{
    name: string;
    value: any;
    type: string;
    [key: string]: any;
  }>;
}

/**
 * React hook for tracking survey-core model state (fixed version)
 * Subscribes to model events and provides reactive state
 * @param model - Survey model instance
 * @returns Current survey state
 */
export function useSurveyStateFixed(model: Model | null): SurveyState {
  const stateResult = React.useState<SurveyState>(() => ({
    data: model?.data || {},
    currentPageNo: model?.currentPageNo || 0,
    pageCount: model?.pageCount || 1,
    isFirstPage: model?.isFirstPage ?? true,
    isLastPage: model?.isLastPage ?? false,
    isCompleted: model ? model.getPropertyValue('isCompleted') === true : false,
    questions: getQuestions(model),
  }));
  // Store the entire state tuple to avoid babel destructuring
  const state = stateResult[0];
  const setState = stateResult[1];

  React.useEffect(() => {
    if (!model) {
      setState({
        data: {},
        currentPageNo: 0,
        pageCount: 1,
        isFirstPage: true,
        isLastPage: false,
        isCompleted: false,
        questions: [],
      });
      return;
    }

    // Update state with current model values
    setState({
      data: model.data || {},
      currentPageNo: model.currentPageNo || 0,
      pageCount: model.pageCount || 1,
      isFirstPage: model.isFirstPage,
      isLastPage: model.isLastPage,
      isCompleted: model.getPropertyValue('isCompleted') === true,
      questions: getQuestions(model),
    });

    // Event handlers
    const handleValueChanged = (sender: Model) => {
      setState((prev) => ({
        ...prev,
        data: sender.data || {},
        questions: getQuestions(sender),
      }));
    };

    const handlePageChanged = (sender: Model) => {
      setState((prev) => ({
        ...prev,
        currentPageNo: sender.currentPageNo || 0,
        isFirstPage: sender.isFirstPage,
        isLastPage: sender.isLastPage,
      }));
    };

    const handleComplete = () => {
      setState((prev) => ({
        ...prev,
        isCompleted: true,
      }));
    };

    // Subscribe to events
    model.onValueChanged.add(handleValueChanged);
    model.onCurrentPageChanged.add(handlePageChanged);
    model.onComplete.add(handleComplete);

    // Cleanup
    return () => {
      model.onValueChanged.remove(handleValueChanged);
      model.onCurrentPageChanged.remove(handlePageChanged);
      model.onComplete.remove(handleComplete);
    };
  }, [model]);

  return state;
}

/**
 * Extract questions and their values from model
 */
function getQuestions(
  model: Model | null
): Array<{ name: string; value: any; type: string; [key: string]: any }> {
  if (!model) {
    return [];
  }

  const questions = model.getAllQuestions();
  return questions.map((q: any) => ({
    name: q.name,
    value: q.value,
    type: q.getType(),
    title: q.title,
    description: q.description,
    isRequired: q.isRequired,
    visible: q.visible,
    readOnly: q.readOnly,
  }));
}
