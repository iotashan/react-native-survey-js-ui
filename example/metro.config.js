const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');
const { withMetroConfig } = require('react-native-monorepo-config');

const root = path.resolve(__dirname, '..');
const librarySrcPath = path.resolve(root, 'src');

/**
 * Metro configuration optimized for library development
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = withMetroConfig(getDefaultConfig(__dirname), {
  root,
  dirname: __dirname,
});

// Enhanced resolver configuration for library development
config.resolver.unstable_enablePackageExports = true;
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];

// Optimize watch folders for library development
config.watchFolders = [
  root,
  librarySrcPath,
  path.resolve(root, 'lib'),
  ...config.watchFolders,
];

// Configure source maps for debugging
config.serializer = {
  ...config.serializer,
  createModuleIdFactory: function () {
    return function (path) {
      // Use stable module IDs for better debugging
      return require('crypto')
        .createHash('sha1')
        .update(path)
        .digest('hex')
        .substring(0, 8);
    };
  },
};

// Optimize transformer for TypeScript and library development
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('@expo/metro-config/babel-transformer'),
  sourceMap: {
    // Enable source maps for library debugging
    sourceMapUrl: true,
  },
};

// Performance optimizations
config.resetCache = false;
config.cacheStores = [
  new (require('metro-cache').FileStore)({
    root: path.join(__dirname, 'node_modules', '.cache', 'metro'),
  }),
];

module.exports = config;
