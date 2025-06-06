/**
 * Tests for utils index exports
 */

describe('utils index exports', () => {
  it('should export validateSurveyModel from validation', () => {
    const utils = require('./index');
    expect(utils.validateSurveyModel).toBeDefined();
    expect(typeof utils.validateSurveyModel).toBe('function');
  });

  it('should export survey core utilities', () => {
    const utils = require('./index');

    expect(utils.initializeSurveyCore).toBeDefined();
    expect(typeof utils.initializeSurveyCore).toBe('function');

    expect(utils.createSurveyModel).toBeDefined();
    expect(typeof utils.createSurveyModel).toBe('function');

    expect(utils.disposeSurveyModel).toBeDefined();
    expect(typeof utils.disposeSurveyModel).toBe('function');

    expect(utils.SurveyModelManager).toBeDefined();
    expect(typeof utils.SurveyModelManager).toBe('function');
  });

  it('should not export internal implementation details', () => {
    const utils = require('./index');

    // These should not be exported
    expect(utils.polyfills).toBeUndefined();
    expect(utils.window).toBeUndefined();
    expect(utils.document).toBeUndefined();
  });
});
