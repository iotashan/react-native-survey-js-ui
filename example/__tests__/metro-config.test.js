/**
 * @jest-environment node
 */
const path = require('path');

// Mock dependencies
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

jest.mock('metro-cache', () => ({
  FileStore: jest.fn(function FileStore(options) {
    this.root = options.root;
  }),
}));

jest.mock(
  '@expo/metro-config/babel-transformer',
  () => 'mocked-transformer-path',
  { virtual: true }
);

describe('Metro Configuration', () => {
  let metroConfig;

  beforeEach(() => {
    // Reset module cache to ensure fresh import
    delete require.cache[require.resolve('../metro.config.js')];
    metroConfig = require('../metro.config.js');
  });

  describe('Basic Configuration', () => {
    it('should have correct resolver configuration', () => {
      expect(metroConfig.resolver).toBeDefined();
      expect(metroConfig.resolver.unstable_enablePackageExports).toBe(true);
      expect(metroConfig.resolver.sourceExts).toContain('ts');
      expect(metroConfig.resolver.sourceExts).toContain('tsx');
    });

    it('should include necessary watch folders for library development', () => {
      expect(metroConfig.watchFolders).toBeDefined();
      expect(Array.isArray(metroConfig.watchFolders)).toBe(true);

      const watchFolders = metroConfig.watchFolders;
      const rootPath = path.resolve(__dirname, '../..');
      const srcPath = path.resolve(rootPath, 'src');
      const libPath = path.resolve(rootPath, 'lib');

      expect(watchFolders).toContain(rootPath);
      expect(watchFolders).toContain(srcPath);
      expect(watchFolders).toContain(libPath);
    });
  });

  describe('Performance Optimizations', () => {
    it('should have cache configuration', () => {
      expect(metroConfig.cacheStores).toBeDefined();
      expect(Array.isArray(metroConfig.cacheStores)).toBe(true);
      expect(metroConfig.cacheStores.length).toBeGreaterThan(0);
    });

    it('should have resetCache set to false for performance', () => {
      expect(metroConfig.resetCache).toBe(false);
    });
  });

  describe('Development Features', () => {
    it('should have source map configuration', () => {
      expect(metroConfig.transformer).toBeDefined();
      expect(metroConfig.transformer.sourceMap).toBeDefined();
      expect(metroConfig.transformer.sourceMap.sourceMapUrl).toBe(true);
    });

    it('should have serializer configuration for debugging', () => {
      expect(metroConfig.serializer).toBeDefined();
      expect(metroConfig.serializer.createModuleIdFactory).toBeDefined();
      expect(typeof metroConfig.serializer.createModuleIdFactory).toBe(
        'function'
      );
    });

    it('should generate stable module IDs', () => {
      const moduleIdFactory = metroConfig.serializer.createModuleIdFactory();
      const testPath = '/some/test/path.js';

      const id1 = moduleIdFactory(testPath);
      const id2 = moduleIdFactory(testPath);

      expect(id1).toBe(id2); // Should be deterministic
      expect(typeof id1).toBe('string');
      expect(id1.length).toBe(8); // Should be 8 characters from SHA1 hash
    });
  });

  describe('Library Integration', () => {
    it('should properly configure babel transformer', () => {
      expect(metroConfig.transformer.babelTransformerPath).toBeDefined();
      expect(metroConfig.transformer.babelTransformerPath).toContain(
        'babel-transformer'
      );
    });
  });
});
