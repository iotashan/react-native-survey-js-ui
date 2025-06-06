/**
 * Tests for Questions index exports
 */

describe('Questions index exports', () => {
  it('should export BaseQuestion component', () => {
    const questions = require('./index');
    expect(questions.BaseQuestion).toBeDefined();
    expect(typeof questions.BaseQuestion).toBe('function');
  });

  it('should export QuestionFactory component', () => {
    const questions = require('./index');
    expect(questions.QuestionFactory).toBeDefined();
    expect(typeof questions.QuestionFactory).toBe('function');
  });

  it('should export TextQuestion component', () => {
    const questions = require('./index');
    expect(questions.TextQuestion).toBeDefined();
    expect(typeof questions.TextQuestion).toBe('function');
  });

  it('should export all question components', () => {
    const questions = require('./index');
    const exportedKeys = Object.keys(questions);

    expect(exportedKeys).toContain('BaseQuestion');
    expect(exportedKeys).toContain('QuestionFactory');
    expect(exportedKeys).toContain('TextQuestion');
  });
});
