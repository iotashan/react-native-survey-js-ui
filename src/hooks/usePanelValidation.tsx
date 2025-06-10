import { useMemo } from 'react';
import { useValidation } from '../contexts/ValidationContext';
import type { PanelModel, Question } from 'survey-core';

export interface PanelValidationResult {
  /**
   * Total count of validation errors in the panel and its nested panels
   */
  errorCount: number;
  
  /**
   * Whether the panel has any validation errors
   */
  hasErrors: boolean;
  
  /**
   * Map of question names to their validation errors
   */
  errorsByQuestion: Record<string, string[]>;
  
  /**
   * List of question names that have validation errors
   */
  questionsWithErrors: string[];
}

/**
 * Hook to aggregate validation errors for a panel and its nested content
 * @param panel The panel to check for validation errors
 * @returns Aggregated validation information for the panel
 */
export function usePanelValidation(
  panel: PanelModel | null | undefined
): PanelValidationResult {
  // Try to get validation context, but handle case where it doesn't exist
  let errors: Record<string, string[]> = {};
  
  try {
    const validationContext = useValidation();
    errors = validationContext.errors;
  } catch (error) {
    // If we're outside ValidationProvider, just use empty errors
  }
  
  // If no panel, return empty result
  if (!panel) {
    return {
      errorCount: 0,
      hasErrors: false,
      errorsByQuestion: {},
      questionsWithErrors: [],
    };
  }
  
  // Memoize the calculation to prevent unnecessary recalculations
  const result = useMemo(() => {
    const errorsByQuestion: Record<string, string[]> = {};
    const questionsWithErrors: string[] = [];
    let totalErrorCount = 0;
    
    // Helper function to collect errors from questions
    const collectQuestionErrors = (questions: Question[]) => {
      for (const question of questions) {
        // Only count errors for visible questions
        if (!question.visible) continue;
        
        const questionErrors = errors[question.name];
        if (questionErrors && questionErrors.length > 0) {
          errorsByQuestion[question.name] = questionErrors;
          questionsWithErrors.push(question.name);
          totalErrorCount += questionErrors.length;
        }
      }
    };
    
    // Helper function to recursively collect errors from panels
    const collectPanelErrors = (currentPanel: PanelModel) => {
      // Skip invisible panels
      if (!currentPanel.visible) return;
      
      // Collect errors from direct questions
      if (currentPanel.questions) {
        collectQuestionErrors(currentPanel.questions);
      }
      
      // Recursively collect errors from nested panels
      if (currentPanel.panels) {
        for (const nestedPanel of currentPanel.panels) {
          collectPanelErrors(nestedPanel);
        }
      }
    };
    
    // Start collecting errors from the root panel
    collectPanelErrors(panel);
    
    return {
      errorCount: totalErrorCount,
      hasErrors: totalErrorCount > 0,
      errorsByQuestion,
      questionsWithErrors,
    };
  }, [panel, errors]);
  
  return result;
}