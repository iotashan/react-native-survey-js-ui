/**
 * Main mock file for survey-core
 * Exports all mocked classes and utilities
 */

export { Model, MockSurveyModel } from './Model.mock';

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
