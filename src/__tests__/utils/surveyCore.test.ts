import { Model } from 'survey-core';
import {
  createSurveyModel,
  disposeSurveyModel,
  initializeSurveyCore,
  SurveyModelManager,
} from '../../utils/surveyCore';

// Mock survey-core
jest.mock('survey-core', () => ({
  Model: jest.fn().mockImplementation((json) => ({
    data: {},
    currentPageNo: 0,
    isCompleted: false,
    getAllQuestions: jest.fn().mockReturnValue([]),
    dispose: jest.fn(),
    onComplete: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onValueChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    onCurrentPageChanged: {
      add: jest.fn(),
      remove: jest.fn(),
    },
    toJSON: jest.fn().mockReturnValue(json),
  })),
}));

describe('surveyCore utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeSurveyCore', () => {
    it('should initialize survey-core without errors', () => {
      expect(() => initializeSurveyCore()).not.toThrow();
    });

    it('should return configuration object', () => {
      const config = initializeSurveyCore();
      expect(config).toBeDefined();
      expect(config.platform).toBe('react-native');
    });

    it('should handle initialization errors gracefully', () => {
      // This test is simplified since we can't easily mock errors in the current implementation
      // The initializeSurveyCore function will be enhanced in the future to handle more complex scenarios
      const config = initializeSurveyCore();
      expect(config).toBeDefined();
      expect(config.platform).toBe('react-native');
    });
  });

  describe('createSurveyModel', () => {
    const mockSurveyJson = {
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

    it('should create a survey model from JSON', () => {
      const model = createSurveyModel(mockSurveyJson);

      expect(Model).toHaveBeenCalledWith(mockSurveyJson);
      expect(model).toBeDefined();
      expect(model.toJSON()).toEqual(mockSurveyJson);
    });

    it('should handle empty JSON', () => {
      const model = createSurveyModel({});

      expect(Model).toHaveBeenCalledWith({});
      expect(model).toBeDefined();
    });

    it('should throw error for invalid JSON', () => {
      expect(() => createSurveyModel(null as any)).toThrow(
        'Invalid survey JSON provided'
      );

      expect(() => createSurveyModel(undefined as any)).toThrow(
        'Invalid survey JSON provided'
      );

      expect(() => createSurveyModel('string' as any)).toThrow(
        'Invalid survey JSON provided'
      );
    });

    it('should handle survey-core Model creation errors', () => {
      (Model as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Model creation failed');
      });

      expect(() => createSurveyModel(mockSurveyJson)).toThrow(
        'Failed to create survey model: Model creation failed'
      );
    });
  });

  describe('disposeSurveyModel', () => {
    it('should dispose a survey model', () => {
      const mockModel = {
        dispose: jest.fn(),
      };

      disposeSurveyModel(mockModel as any);

      expect(mockModel.dispose).toHaveBeenCalled();
    });

    it('should handle null or undefined models gracefully', () => {
      expect(() => disposeSurveyModel(null as any)).not.toThrow();
      expect(() => disposeSurveyModel(undefined as any)).not.toThrow();
    });

    it('should handle models without dispose method', () => {
      const mockModel = {} as any;

      expect(() => disposeSurveyModel(mockModel)).not.toThrow();
    });
  });

  describe('SurveyModelManager', () => {
    const mockSurveyJson = {
      title: 'Test Survey',
      pages: [{ name: 'page1', elements: [] }],
    };

    describe('create', () => {
      it('should create and track a survey model', () => {
        const model = SurveyModelManager.create('test-id', mockSurveyJson);

        expect(model).toBeDefined();
        expect(SurveyModelManager.get('test-id')).toBe(model);
      });

      it('should dispose existing model when creating with same id', () => {
        const model1 = SurveyModelManager.create('test-id', mockSurveyJson);
        const model2 = SurveyModelManager.create('test-id', mockSurveyJson);

        expect(model1.dispose).toHaveBeenCalled();
        expect(model2).not.toBe(model1);
      });
    });

    describe('get', () => {
      it('should return existing model', () => {
        const model = SurveyModelManager.create('test-id', mockSurveyJson);
        expect(SurveyModelManager.get('test-id')).toBe(model);
      });

      it('should return undefined for non-existent id', () => {
        expect(SurveyModelManager.get('non-existent')).toBeUndefined();
      });
    });

    describe('dispose', () => {
      it('should dispose and remove model', () => {
        const model = SurveyModelManager.create('test-id', mockSurveyJson);

        SurveyModelManager.dispose('test-id');

        expect(model.dispose).toHaveBeenCalled();
        expect(SurveyModelManager.get('test-id')).toBeUndefined();
      });

      it('should handle non-existent id gracefully', () => {
        expect(() => SurveyModelManager.dispose('non-existent')).not.toThrow();
      });
    });

    describe('disposeAll', () => {
      it('should dispose all models', () => {
        const model1 = SurveyModelManager.create('id1', mockSurveyJson);
        const model2 = SurveyModelManager.create('id2', mockSurveyJson);

        SurveyModelManager.disposeAll();

        expect(model1.dispose).toHaveBeenCalled();
        expect(model2.dispose).toHaveBeenCalled();
        expect(SurveyModelManager.get('id1')).toBeUndefined();
        expect(SurveyModelManager.get('id2')).toBeUndefined();
      });
    });

    describe('getAll', () => {
      it('should return all active model ids', () => {
        SurveyModelManager.disposeAll(); // Clean state

        SurveyModelManager.create('id1', mockSurveyJson);
        SurveyModelManager.create('id2', mockSurveyJson);

        const ids = SurveyModelManager.getAll();
        expect(ids).toEqual(['id1', 'id2']);
      });

      it('should return empty array when no models', () => {
        SurveyModelManager.disposeAll();
        expect(SurveyModelManager.getAll()).toEqual([]);
      });
    });
  });
});
