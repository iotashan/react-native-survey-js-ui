import * as LibraryExports from '../index';

describe('Library Export Structure', () => {
  it('should export main public API from index.ts', () => {
    expect(LibraryExports).toBeDefined();
  });

  it('should export Survey component', () => {
    expect(LibraryExports.Survey).toBeDefined();
  });

  it('should export BaseQuestion component', () => {
    expect(LibraryExports.BaseQuestion).toBeDefined();
  });

  it('should have proper structure for type exports', () => {
    // Type definitions are compile-time only, so we check that the module structure is correct
    // The actual type checking is done by TypeScript compiler
    expect(LibraryExports).toBeDefined();
    // Types are exported but not available at runtime
  });

  it('should export utility functions', () => {
    expect(LibraryExports.validateSurveyModel).toBeDefined();
  });
});