/**
 * Core type definitions for SurveyJS models
 * Compatible with survey-core library
 */

/**
 * Main survey model interface representing the entire survey structure
 */
export interface SurveyModel {
  /** Survey title displayed at the top */
  title?: string;
  /** Survey description shown below title */
  description?: string;
  /** Array of pages in the survey */
  pages: PageModel[];
  /** Current locale for multilingual surveys */
  locale?: string;
  /** Progress bar display position */
  showProgressBar?: 'top' | 'bottom' | 'both' | 'off';
  /** Whether to show question numbers */
  showQuestionNumbers?: 'on' | 'off';

  // Navigation properties
  /** Show navigation buttons (prev/next/complete) */
  showNavigationButtons?: boolean;
  /** Show previous button */
  showPrevButton?: boolean;
  /** Show complete button */
  showCompleteButton?: boolean;
  /** Show page titles in navigation */
  showPageTitles?: boolean;
  /** Show page numbers */
  showPageNumbers?: boolean;
  /** URL to navigate after completion */
  navigateToUrl?: string;
  /** Conditional navigation rules */
  navigateToUrlOnCondition?: Array<{
    expression: string;
    url: string;
  }>;

  // Timing properties
  /** Show timer panel position */
  showTimerPanel?: 'top' | 'bottom' | 'none';
  /** Timer panel mode */
  showTimerPanelMode?: 'page' | 'survey';
  /** Maximum time to complete survey (seconds) */
  maxTimeToFinish?: number;
  /** Maximum time per page (seconds) */
  maxTimeToFinishPage?: number;

  // Completion properties
  /** HTML to show on survey completion */
  completedHtml?: string;
  /** HTML to show before completion */
  completedBeforeHtml?: string;
  /** HTML to show while loading */
  loadingHtml?: string;
  /** Conditional completion HTML */
  completedHtmlOnCondition?: Array<{
    expression: string;
    html: string;
  }>;

  // Data and mode
  /** Survey mode */
  mode?: SurveyMode;
  /** Current survey data */
  data?: SurveyData;
  /** When to clear invisible values */
  clearInvisibleValues?:
    | 'onComplete'
    | 'onHidden'
    | 'onHiddenContainer'
    | 'none';
  /** Questions display mode */
  questionsOnPageMode?: 'standard' | 'singlePage' | 'questionPerPage';

  // Advanced features
  /** Survey triggers */
  triggers?: SurveyTrigger[];
  /** Calculated values */
  calculatedValues?: SurveyCalculatedValue[];
  /** Survey variables */
  variables?: SurveyVariable[];

  /** Allow additional SurveyJS properties */
  [key: string]: any;
}

/**
 * Page model interface representing a single page in the survey
 */
export interface PageModel {
  /** Unique page name */
  name?: string;
  /** Page title displayed to user */
  title?: string;
  /** Page description */
  description?: string;
  /** Array of questions/panels on the page */
  elements: QuestionModel[];
  /** Page visibility */
  visible?: boolean;
  /** Conditional visibility expression */
  visibleIf?: string;

  // Navigation properties
  /** Navigation buttons visibility */
  navigationButtonsVisibility?: 'show' | 'hide' | 'inherit';
  /** Max time to complete page */
  maxTimeToFinish?: number;
  /** Questions display order */
  questionsOrder?: 'initial' | 'random';
  /** Navigation title */
  navigationTitle?: string;
  /** Navigation description */
  navigationDescription?: string;

  // Conditions
  /** Enable condition */
  enableIf?: string;
  /** Required condition */
  requiredIf?: string;

  /** Allow additional page properties */
  [key: string]: any;
}

/**
 * Question model interface representing a survey question
 */
export interface QuestionModel {
  /** Unique question name (required for data binding) */
  name: string;
  /** Question type */
  type: string;
  /** Question title/label */
  title?: string;
  /** Question description/help text */
  description?: string;
  /** Whether question is required */
  isRequired?: boolean;
  /** Question visibility */
  visible?: boolean;
  /** Conditional visibility expression */
  visibleIf?: string;
  /** Array of validators */
  validators?: ValidatorModel[];

  // State properties
  /** Read-only state */
  readOnly?: boolean;
  /** Enable condition */
  enableIf?: string;
  /** Required condition */
  requiredIf?: string;
  /** Default value */
  defaultValue?: any;
  /** Correct answer for quiz mode */
  correctAnswer?: any;
  /** Start on new line */
  startWithNewLine?: boolean;
  /** Indentation level */
  indent?: number;
  /** Question width */
  width?: string;

  // Validation
  /** Required error text */
  requiredErrorText?: string;
  /** Input type for text questions */
  inputType?: string;
  /** Placeholder text */
  placeholder?: string;

  // Choice questions
  /** Choices for selection questions */
  choices?: Array<ChoiceItem | string>;
  /** Choices display order */
  choicesOrder?: 'none' | 'random' | 'asc' | 'desc';
  /** Has other option */
  hasOther?: boolean;
  /** Other option text */
  otherText?: string;
  /** Has none option */
  hasNone?: boolean;
  /** None option text */
  noneText?: string;

  // Rating questions
  /** Minimum rate value */
  rateMin?: number;
  /** Maximum rate value */
  rateMax?: number;
  /** Rate step */
  rateStep?: number;
  /** Min rate description */
  minRateDescription?: string;
  /** Max rate description */
  maxRateDescription?: string;

  // Matrix questions
  /** Matrix columns */
  columns?: Array<MatrixColumn | string>;
  /** Matrix rows */
  rows?: Array<MatrixRow | string>;
  /** All rows required */
  isAllRowRequired?: boolean;

  /** Allow additional question-specific properties */
  [key: string]: any;
}

/**
 * Validator model for question validation rules
 */
export interface ValidatorModel {
  /** Validator type */
  type: string;
  /** Error text to display */
  text?: string;

  // Numeric validator
  /** Minimum value */
  minValue?: number;
  /** Maximum value */
  maxValue?: number;

  // Text validator
  /** Minimum length */
  minLength?: number;
  /** Maximum length */
  maxLength?: number;

  // Regex validator
  /** Regular expression pattern */
  regex?: string;

  // Expression validator
  /** Boolean expression */
  expression?: string;

  /** Allow validator-specific properties */
  [key: string]: any;
}

/**
 * Survey event interface
 */
export interface SurveyEvent {
  /** Event type */
  type: string;
  /** Event sender */
  sender: any;
  /** Additional event data */
  data?: any;
  /** Question name (for value change events) */
  name?: string;
  /** New value */
  value?: any;
  /** Old value */
  oldValue?: any;
}

/**
 * Event handler for survey value changes
 */
export interface SurveyValueChangedEvent {
  /** Question name that changed */
  name: string;
  /** New value */
  value: any;
  /** Previous value */
  oldValue?: any;
  /** Question object that changed */
  question?: QuestionModel;
}

/**
 * Event handler for page navigation changes
 */
export interface SurveyCurrentPageChangedEvent {
  /** Previous page object */
  oldCurrentPage?: PageModel;
  /** New current page object */
  newCurrentPage?: PageModel;
  /** Whether this is a forward navigation */
  isNextPage?: boolean;
  /** Whether this is a backward navigation */
  isPrevPage?: boolean;
}

/**
 * Event handler for survey completion
 */
export interface SurveyCompleteEvent {
  /** Survey data at completion */
  data: SurveyData;
  /** Survey model instance */
  sender?: any;
}

/**
 * Survey event handler function types
 */
export type SurveyValueChangedHandler = (event: SurveyValueChangedEvent) => void;
export type SurveyCurrentPageChangedHandler = (event: SurveyCurrentPageChangedEvent) => void;
export type SurveyCompleteHandler = (event: SurveyCompleteEvent) => void;

/**
 * Survey data structure
 */
export interface SurveyData {
  [questionName: string]: any;
}

/**
 * Survey result interface
 */
export interface SurveyResult {
  /** Survey data */
  data: SurveyData;
  /** Whether survey was completed */
  isCompleted: boolean;
  /** Completion timestamp */
  completedAt?: string;
  /** Time spent in seconds */
  timeSpent?: number;
}

/**
 * Survey theme configuration
 */
export interface SurveyTheme {
  /** Theme name */
  themeName?: string;
  /** Color palette */
  colorPalette?: 'light' | 'dark';
  /** Panelless mode */
  isPanelless?: boolean;
  /** Background image */
  backgroundImage?: string;
  /** Background opacity */
  backgroundOpacity?: number;
  /** CSS variables */
  cssVariables?: Record<string, string>;
}

/**
 * Choice item for selection questions
 */
export interface ChoiceItem {
  /** Choice value */
  value: string | number;
  /** Display text */
  text?: string;
  /** Visibility condition */
  visibleIf?: string;
  /** Enable condition */
  enableIf?: string;
}

/**
 * Matrix row definition
 */
export interface MatrixRow {
  /** Row value */
  value: string | number;
  /** Display text */
  text?: string;
  /** Visibility condition */
  visibleIf?: string;
}

/**
 * Matrix column definition
 */
export interface MatrixColumn {
  /** Column value */
  value: string | number;
  /** Display text */
  text?: string;
  /** Column width */
  width?: string;
}

/**
 * Localizable string supporting multiple languages
 */
export interface LocalizableString {
  /** Default text */
  default?: string;
  /** Language-specific texts */
  [locale: string]: string | undefined;
}

/**
 * Survey trigger definition
 */
export interface SurveyTrigger {
  /** Trigger type */
  type: string;
  /** Trigger condition expression */
  expression: string;
  /** Trigger name */
  name?: string;
}

/**
 * Calculated value definition
 */
export interface SurveyCalculatedValue {
  /** Calculated value name */
  name: string;
  /** Calculation expression */
  expression: string;
  /** Include in survey result */
  includeIntoResult?: boolean;
}

/**
 * Survey variable definition
 */
export interface SurveyVariable {
  /** Variable name */
  name: string;
  /** Variable value */
  value: any;
}

/**
 * Survey completion options
 */
export interface SurveyCompletedOptions {
  /** Show data saving indicator */
  showDataSaving?: boolean;
  /** Show clear button during save */
  showDataSavingClear?: boolean;
  /** Show success message */
  showDataSavingSuccess?: boolean;
  /** Show error message */
  showDataSavingError?: boolean;
}

/**
 * Survey mode enum
 */
export type SurveyMode = 'edit' | 'display' | 'preview';

/**
 * Common question types supported by SurveyJS
 */
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
  | 'imagepicker'
  | 'ranking'
  | 'image'
  | 'empty'
  | 'signaturepad';

/**
 * Type guard to check if an object is a SurveyModel
 */
export function isSurveyModel(obj: any): obj is SurveyModel {
  return !!(obj && typeof obj === 'object' && Array.isArray(obj.pages));
}

/**
 * Type guard to check if an object is a PageModel
 */
export function isPageModel(obj: any): obj is PageModel {
  return !!(obj && typeof obj === 'object' && Array.isArray(obj.elements));
}

/**
 * Type guard to check if an object is a QuestionModel
 */
export function isQuestionModel(obj: any): obj is QuestionModel {
  return !!(
    obj &&
    typeof obj === 'object' &&
    typeof obj.name === 'string' &&
    typeof obj.type === 'string'
  );
}
