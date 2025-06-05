/**
 * Core type definitions for SurveyJS models
 * Compatible with survey-core library
 */

export interface SurveyModel {
  title?: string;
  description?: string;
  pages: PageModel[];
  locale?: string;
  showProgressBar?: 'top' | 'bottom' | 'both' | 'off';
  showQuestionNumbers?: 'on' | 'off';
  [key: string]: any; // Allow additional SurveyJS properties
}

export interface PageModel {
  name?: string;
  title?: string;
  description?: string;
  elements: QuestionModel[];
  visible?: boolean;
  visibleIf?: string;
}

export interface QuestionModel {
  name: string;
  type: string;
  title?: string;
  description?: string;
  isRequired?: boolean;
  visible?: boolean;
  visibleIf?: string;
  validators?: ValidatorModel[];
  [key: string]: any; // Allow additional question-specific properties
}

export interface ValidatorModel {
  type: string;
  text?: string;
  [key: string]: any; // Allow validator-specific properties
}

// Common question types
export type QuestionType = 
  | 'text'
  | 'radiogroup'
  | 'checkbox'
  | 'dropdown'
  | 'comment'
  | 'rating'
  | 'boolean'
  | 'matrix'
  | 'matrixdropdown'
  | 'matrixdynamic'
  | 'multipletext'
  | 'panel'
  | 'paneldynamic'
  | 'html'
  | 'expression'
  | 'file'
  | 'imagepicker';