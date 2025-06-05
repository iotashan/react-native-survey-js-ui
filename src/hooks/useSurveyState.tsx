import { useEffect, useState } from 'react';
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
   * Whether the survey is completed
   */
  isCompleted: boolean;
  /**
   * All questions with their current values
   */
  questions: Array<{ name: string; value: any }>;
}

/**
 * React hook for tracking survey-core model state
 * Subscribes to model events and provides reactive state
 * @param model - Survey model instance
 * @returns Current survey state
 */
export function useSurveyState(model: Model | null): SurveyState {
  const [state, setState] = useState<SurveyState>(() => ({
    data: model?.data || {},
    currentPageNo: model?.currentPageNo || 0,
    isCompleted: model ? model.getPropertyValue('isCompleted') === true : false,
    questions: getQuestions(model),
  }));

  useEffect(() => {
    if (!model) {
      setState({
        data: {},
        currentPageNo: 0,
        isCompleted: false,
        questions: [],
      });
      return;
    }

    // Update state with current model values
    setState({
      data: model.data || {},
      currentPageNo: model.currentPageNo || 0,
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
): Array<{ name: string; value: any }> {
  if (!model) {
    return [];
  }

  const questions = model.getAllQuestions();
  return questions.map((q: any) => ({
    name: q.name,
    value: q.value,
  }));
}
