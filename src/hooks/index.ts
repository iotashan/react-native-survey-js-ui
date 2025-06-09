// Export the fixed versions as the main hooks to solve React null error
export { useSurveyModelFixed as useSurveyModel } from './useSurveyModelFixed';
export type {
  UseSurveyModelOptions,
  UseSurveyModelResult,
} from './useSurveyModelFixed';

// Also export the fixed versions under their own names for backward compatibility
export { useSurveyModelFixed } from './useSurveyModelFixed';

export { useSurveyStateFixed as useSurveyState } from './useSurveyStateFixed';
export type { SurveyState } from './useSurveyStateFixed';

export { useSurveyStateFixed } from './useSurveyStateFixed';

// Page navigation hook
export { usePageNavigation } from './usePageNavigation';
export type { 
  NavigationState, 
  UsePageNavigationReturn 
} from './usePageNavigation';

// Page validation hook
export { usePageValidation } from './usePageValidation';
export type {
  ValidationState,
  ValidationError,
  UsePageValidationReturn
} from './usePageValidation';
