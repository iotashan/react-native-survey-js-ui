/**
 * Tests for hooks index exports
 */

describe('hooks index exports', () => {
  it('should export useSurveyModel hook', () => {
    const hooks = require('./index');
    expect(hooks.useSurveyModel).toBeDefined();
    expect(typeof hooks.useSurveyModel).toBe('function');
  });

  it('should export useSurveyState hook', () => {
    const hooks = require('./index');
    expect(hooks.useSurveyState).toBeDefined();
    expect(typeof hooks.useSurveyState).toBe('function');
  });

  it('should export all hooks', () => {
    const hooks = require('./index');
    const exportedKeys = Object.keys(hooks);

    expect(exportedKeys).toContain('useSurveyModel');
    expect(exportedKeys).toContain('useSurveyState');
    expect(exportedKeys).toContain('useSurveyModelFixed');
    expect(exportedKeys).toContain('useSurveyStateFixed');
    expect(exportedKeys.length).toBe(5);
  });
});
