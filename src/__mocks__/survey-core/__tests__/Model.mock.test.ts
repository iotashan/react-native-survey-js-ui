import { Model } from '../Model.mock';
import { MockSurveyModel } from '../Model.mock';

describe('MockSurveyModel', () => {
  let mockModel: MockSurveyModel;
  const testJson = {
    title: 'Test Survey',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'text',
            name: 'question1',
            title: 'What is your name?',
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    mockModel = new MockSurveyModel(testJson);
  });

  describe('constructor', () => {
    it('should initialize with provided JSON', () => {
      expect(mockModel.getJSON()).toEqual(testJson);
    });

    it('should initialize with default values', () => {
      expect(mockModel.data).toEqual({});
      expect(mockModel.currentPageNo).toBe(0);
      expect(mockModel.isCompleted).toBe(false);
    });

    it('should initialize event handlers', () => {
      expect(mockModel.onComplete).toBeDefined();
      expect(mockModel.onValueChanged).toBeDefined();
      expect(mockModel.onCurrentPageChanged).toBeDefined();
      expect(mockModel.onPageVisibleChanged).toBeDefined();
      expect(mockModel.onQuestionVisibleChanged).toBeDefined();
    });
  });

  describe('page navigation', () => {
    it('should have correct initial page state', () => {
      expect(mockModel.currentPageNo).toBe(0);
      expect(mockModel.isFirstPage).toBe(true);
      expect(mockModel.isLastPage).toBe(true); // only one page
      expect(mockModel.pageCount).toBe(1);
    });

    it('should navigate to next page', () => {
      const handler = jest.fn();
      mockModel.onCurrentPageChanged.add(handler);

      mockModel.nextPage();

      expect(handler).toHaveBeenCalledWith(mockModel, {
        oldValue: 0,
        newValue: 0, // stays same as only one page
      });
    });

    it('should complete survey', () => {
      const handler = jest.fn();
      mockModel.onComplete.add(handler);

      mockModel.completeLastPage();

      expect(mockModel.isCompleted).toBe(true);
      expect(handler).toHaveBeenCalledWith(mockModel, {});
    });
  });

  describe('value management', () => {
    it('should set and get values', () => {
      const handler = jest.fn();
      mockModel.onValueChanged.add(handler);

      mockModel.setValue('question1', 'John Doe');

      expect(mockModel.getValue('question1')).toBe('John Doe');
      expect(mockModel.data.question1).toBe('John Doe');
      expect(handler).toHaveBeenCalledWith(mockModel, {
        name: 'question1',
        value: 'John Doe',
      });
    });

    it('should handle getPropertyValue', () => {
      mockModel.setValue('question1', 'test');
      expect(mockModel.getPropertyValue('question1')).toBe('test');

      expect(mockModel.getPropertyValue('isCompleted')).toBe(false);
      mockModel.completeLastPage();
      expect(mockModel.getPropertyValue('isCompleted')).toBe(true);
    });
  });

  describe('questions', () => {
    it('should get all questions', () => {
      const questions = mockModel.getAllQuestions();

      expect(questions).toHaveLength(1);
      expect(questions[0]).toMatchObject({
        name: 'question1',
        title: 'What is your name?',
        type: 'text',
        getType: expect.any(Function),
        value: undefined,
        visible: true,
        readOnly: false,
        isRequired: false,
      });
    });

    it('should get question by name', () => {
      const question = mockModel.getQuestionByName('question1');

      expect(question).toBeDefined();
      expect(question?.name).toBe('question1');
    });

    it('should return undefined for non-existent question', () => {
      const question = mockModel.getQuestionByName('nonexistent');
      expect(question).toBeUndefined();
    });
  });

  describe('event system', () => {
    it('should support adding and removing event handlers', () => {
      const handler = jest.fn();

      mockModel.onValueChanged.add(handler);
      mockModel.setValue('question1', 'test');
      expect(handler).toHaveBeenCalledTimes(1);

      mockModel.onValueChanged.remove(handler);
      mockModel.setValue('question1', 'test2');
      expect(handler).toHaveBeenCalledTimes(1); // not called again
    });

    it('should support multiple event handlers', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      mockModel.onValueChanged.add(handler1);
      mockModel.onValueChanged.add(handler2);

      mockModel.setValue('question1', 'test');

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('disposal', () => {
    it('should dispose properly', () => {
      const handler = jest.fn();
      mockModel.onValueChanged.add(handler);

      mockModel.dispose();

      // Should clear all handlers
      mockModel.setValue('question1', 'test');
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Model class export', () => {
    it('should export Model as MockSurveyModel', () => {
      expect(Model).toBe(MockSurveyModel);
    });

    it('should be constructable through Model export', () => {
      const model = new Model(testJson);
      expect(model).toBeInstanceOf(MockSurveyModel);
    });
  });
});
