/**
 * Tests for components index exports
 */

describe('components index exports', () => {
  it('should export Survey component', () => {
    const components = require('./index');
    expect(components.Survey).toBeDefined();
    expect(typeof components.Survey).toBe('function');
  });

  it('should export BaseQuestion component', () => {
    const components = require('./index');
    expect(components.BaseQuestion).toBeDefined();
    expect(typeof components.BaseQuestion).toBe('function');
  });

  it('should export only public API components', () => {
    const components = require('./index');
    const exportedKeys = Object.keys(components);

    // Should only export public API
    expect(exportedKeys).toContain('Survey');
    expect(exportedKeys).toContain('BaseQuestion');

    // Should not export internal components
    expect(exportedKeys).not.toContain('QuestionFactory');
    expect(exportedKeys).not.toContain('TextQuestion');
  });
});
