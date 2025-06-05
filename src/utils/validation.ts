import type { SurveyModel } from '../types';

/**
 * Validates that a survey model has the minimum required structure
 * @param model The survey model to validate
 * @returns true if the model is valid, false otherwise
 */
export function validateSurveyModel(model: SurveyModel): boolean {
  if (!model || typeof model !== 'object') {
    return false;
  }

  if (!Array.isArray(model.pages)) {
    return false;
  }

  // Check that each page has elements array
  for (const page of model.pages) {
    if (!Array.isArray(page.elements)) {
      return false;
    }

    // Check that each element has required properties
    for (const element of page.elements) {
      if (!element.name || !element.type) {
        return false;
      }
    }
  }

  return true;
}