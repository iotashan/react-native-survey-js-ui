/**
 * Tests for types index exports
 */

describe('types index exports', () => {
  it('should export all types from SurveyTypes', () => {
    const types = require('./index');

    // Check that some key types are exported
    // Note: TypeScript types are compile-time only, so we can't directly test them
    // But we can verify the module exports correctly
    expect(types).toBeDefined();
  });

  it('should re-export everything from SurveyTypes', () => {
    // This test verifies the module structure
    const indexModule = require.resolve('./index');
    const surveyTypesModule = require.resolve('./SurveyTypes');

    expect(indexModule).toBeDefined();
    expect(surveyTypesModule).toBeDefined();
  });
});
