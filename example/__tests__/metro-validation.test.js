/**
 * Metro Configuration Validation Test
 * Tests the actual metro configuration in a development environment
 */

const path = require('path');

describe('Metro Configuration Validation', () => {
  let metroConfig;

  beforeAll(() => {
    // Mock dependencies for testing
    jest.mock('@expo/metro-config', () => ({
      getDefaultConfig: jest.fn(() => ({
        resolver: {
          sourceExts: ['js', 'jsx'],
        },
        watchFolders: [],
        transformer: {},
        serializer: {},
      })),
    }));

    jest.mock('react-native-monorepo-config', () => ({
      withMetroConfig: jest.fn((config, options) => ({
        ...config,
        root: options.root,
        dirname: options.dirname,
      })),
    }));

    metroConfig = require('../metro.config.js');
  });

  describe('Hot Reload Configuration', () => {
    it('should watch library source directory for hot reload', () => {
      expect(metroConfig.watchFolders).toBeDefined();

      const librarySrcPath = path.resolve(__dirname, '../../src');
      expect(metroConfig.watchFolders).toContain(librarySrcPath);
    });

    it('should watch library build output for changes', () => {
      const libraryLibPath = path.resolve(__dirname, '../../lib');
      expect(metroConfig.watchFolders).toContain(libraryLibPath);
    });

    it('should have source map configuration for debugging', () => {
      expect(metroConfig.transformer.sourceMap).toBeDefined();
      expect(metroConfig.transformer.sourceMap.sourceMapUrl).toBe(true);
    });
  });

  describe('Performance Optimizations', () => {
    it('should have cache configuration for faster rebuilds', () => {
      expect(metroConfig.cacheStores).toBeDefined();
      expect(Array.isArray(metroConfig.cacheStores)).toBe(true);
    });

    it('should have TypeScript support in resolver', () => {
      expect(metroConfig.resolver.sourceExts).toContain('ts');
      expect(metroConfig.resolver.sourceExts).toContain('tsx');
    });

    it('should have package exports enabled', () => {
      expect(metroConfig.resolver.unstable_enablePackageExports).toBe(true);
    });
  });

  describe('Library Development Support', () => {
    // Test removed: createModuleIdFactory was commented out in T002 for Hermes compatibility
    it('should have serializer configuration', () => {
      expect(metroConfig.serializer).toBeDefined();
      // createModuleIdFactory is intentionally undefined after T002 fix
      expect(metroConfig.serializer.createModuleIdFactory).toBeUndefined();
    });

    it('should use Expo babel transformer for compatibility', () => {
      expect(metroConfig.transformer.babelTransformerPath).toContain(
        'babel-transformer'
      );
    });
  });
});
