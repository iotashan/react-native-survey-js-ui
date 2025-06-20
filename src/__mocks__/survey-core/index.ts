/**
 * Main mock file for survey-core
 * Exports all mocked classes and utilities
 */

// Import the mock
import { MockSurveyModel } from './Model.mock';


// Export MockSurveyModel as Model to match survey-core API
export { MockSurveyModel as Model, MockSurveyModel };
export default MockSurveyModel;

// Additional survey-core exports that might be needed
export const SurveyModel = jest.fn();
export const Question = jest.fn();
export const QuestionTextModel = jest.fn();
export const QuestionDropdownModel = jest.fn();
export const QuestionCheckboxModel = jest.fn();
export const QuestionRadiogroupModel = jest.fn();
export const QuestionCommentModel = jest.fn();
export const QuestionBooleanModel = jest.fn();
export const QuestionMatrixModel = jest.fn();
export const QuestionRatingModel = jest.fn();

// Survey settings mock
export const settings = {
  supportCreatorV2: true,
  showDefaultItemsInCreatorV2: true,
};

// Serializer mock
export const Serializer = {
  addProperty: jest.fn(),
  removeProperty: jest.fn(),
  findProperty: jest.fn(),
};

// Event mock
export const Event = jest.fn();

// Base classes
export const Base = jest.fn();
export const ItemValue = jest.fn();
export const QuestionFactory = {
  Instance: {
    registerQuestion: jest.fn(),
    unregisterQuestion: jest.fn(),
    getAllQuestions: jest.fn(),
  },
};

// Style manager mock
export const StylesManager = {
  applyTheme: jest.fn(),
  ThemeColors: {},
};

// Component collection mock
export const ComponentCollection = {
  Instance: {
    add: jest.fn(),
    remove: jest.fn(),
    clear: jest.fn(),
  },
};

// Validator classes for CustomValidator
export class SurveyValidator {
  constructor() {}
  text = '';
  isAsync = false;
  isRunning = false;
  validate = jest.fn().mockReturnValue(null);
  createCustomError = jest.fn();
  getErrorText = jest.fn();
  onAsyncCompleted = null;
  errorOwner = null;
}

export class ValidatorResult {
  constructor(public value: any, public error: any = null) {}
}

export class CustomError {
  constructor(public text: string, public errorOwner: any) {}
}

export const JsonObject = {
  getValue: jest.fn((obj: any, name: string) => obj[name]),
  setValue: jest.fn((obj: any, name: string, value: any) => { obj[name] = value; }),
};
