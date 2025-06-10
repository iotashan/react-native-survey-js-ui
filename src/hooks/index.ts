// Export the fixed versions as the main hooks to solve React null error
export { useSurveyModelFixed as useSurveyModel } from './useSurveyModelFixed';
export type {
  UseSurveyModelOptions,
  UseSurveyModelResult,
} from './useSurveyModelFixed';

// Also export the fixed versions under their own names for backward compatibility
export { useSurveyModelFixed } from './useSurveyModelFixed';

export { useSurveyState } from './useSurveyState';
export type { 
  SurveyState, 
  UseSurveyStateReturn,
  ValidationState as SurveyValidationState,
  ValidationError as SurveyValidationError
} from './useSurveyState';

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

// Panel state hook
export { usePanelState } from './usePanelState';
export type {
  UsePanelStateOptions,
  UsePanelStateReturn
} from './usePanelState';

// Submission mode hook
export { useSubmissionMode } from './useSubmissionMode';

// Navigation state hook - enhanced navigation with validation integration
export { useNavigationState } from './useNavigationState';
export type {
  NavigationState as EnhancedNavigationState,
  UseNavigationStateReturn
} from './useNavigationState';

// Panel validation hook
export { usePanelValidation } from './usePanelValidation';
export type {
  PanelValidationResult
} from './usePanelValidation';
