# Metro Configuration Documentation

## Overview

This document explains the Metro bundler configuration for the React Native library development environment. The configuration is optimized for library development with hot reload support, debugging capabilities, and performance optimizations.

## Configuration Structure

The Metro configuration builds upon Expo's default configuration and adds enhancements for library development:

```javascript
// Base configuration from Expo + react-native-monorepo-config
const config = withMetroConfig(getDefaultConfig(__dirname), {
  root,
  dirname: __dirname,
});
```

## Key Configuration Areas

### 1. Resolver Configuration

**Purpose**: Optimizes module resolution for library development

```javascript
config.resolver.unstable_enablePackageExports = true;
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];
```

**Rationale**:
- `unstable_enablePackageExports`: Enables support for package.json exports field, allowing the library to define custom entry points
- Extended `sourceExts`: Adds TypeScript support for both `.ts` and `.tsx` files

### 2. Watch Folders Configuration

**Purpose**: Enables hot reload for library source changes

```javascript
config.watchFolders = [
  root,                    // Project root
  librarySrcPath,         // Library source directory
  path.resolve(root, 'lib'), // Built library output
  ...config.watchFolders,
];
```

**Rationale**:
- **Library Source (`src/`)**: Watches for changes in library source code to trigger hot reload
- **Build Output (`lib/`)**: Watches built library files for changes when using development builds
- **Project Root**: Maintains compatibility with existing workspace structure

### 3. Source Map Configuration

**Purpose**: Enables debugging of library code in development

```javascript
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('@expo/metro-config/babel-transformer'),
  sourceMap: {
    sourceMapUrl: true,
  },
};
```

**Rationale**:
- **Source Maps**: Essential for debugging TypeScript library code in React Native debugger
- **Expo Transformer**: Maintains compatibility with Expo development tools
- **sourceMapUrl**: Enables proper source map linking for development builds

### 4. Module ID Generation

**Purpose**: Provides stable module IDs for consistent debugging

```javascript
config.serializer = {
  ...config.serializer,
  createModuleIdFactory: function() {
    return function(path) {
      return require('crypto').createHash('sha1').update(path).digest('hex').substring(0, 8);
    };
  },
};
```

**Rationale**:
- **Deterministic IDs**: Same module always gets same ID across builds
- **8-character Hash**: Provides sufficient uniqueness while keeping IDs readable
- **Path-based**: Module ID based on file path ensures consistency

### 5. Performance Optimizations

**Purpose**: Improves build performance and development experience

```javascript
config.resetCache = false;
config.cacheStores = [
  new (require('metro-cache')).FileStore({
    root: path.join(__dirname, 'node_modules', '.cache', 'metro'),
  }),
];
```

**Rationale**:
- **Persistent Cache**: Avoids clearing cache unnecessarily, improving rebuild times
- **File-based Cache**: Stores cache in node_modules for better performance
- **Custom Cache Location**: Prevents cache conflicts with other projects

## Development Workflow Benefits

### Hot Reload for Library Development

The configuration enables seamless hot reload when:
1. Making changes to library source code in `src/`
2. Modifying TypeScript interfaces and types
3. Updating component implementations
4. Changes to exported library APIs

### Debugging Support

Enhanced debugging capabilities include:
- Source map support for TypeScript files
- Stable module IDs for consistent breakpoint placement
- Proper file path resolution in debugger

### Performance Improvements

- Faster rebuild times through intelligent caching
- Reduced memory usage through optimized watch folders
- TypeScript compilation optimizations

## Mobile Platform Support

The configuration is optimized for mobile-only development:
- **iOS Support**: Full compatibility with iOS simulator and devices
- **Android Support**: Complete Android emulator and device support
- **No Web Support**: Configuration specifically excludes web platform optimizations

## Testing

The Metro configuration includes comprehensive tests:
- **Configuration Validation**: Verifies all settings are correctly applied
- **Hot Reload Testing**: Ensures watch folders are properly configured
- **Performance Testing**: Validates cache and optimization settings
- **TypeScript Support**: Confirms TypeScript file resolution

## Integration with Example App

The example app uses this configuration to:
1. Import the library as a local dependency: `react-native-survey-js-ui`
2. Enable hot reload when library source changes
3. Provide debugging capabilities for library development
4. Maintain compatibility with Expo development server

## Compatibility

- **Expo**: Full compatibility with Expo development tools
- **React Native**: Compatible with React Native 0.79.2+
- **TypeScript**: Full TypeScript support for library development
- **Yarn Workspaces**: Integrates with monorepo workspace structure

## Troubleshooting

### Common Issues

1. **Cache Issues**: Run `npx expo start --clear` to clear Metro cache
2. **Watch Folder Problems**: Ensure library `src/` directory exists
3. **TypeScript Errors**: Verify `tsconfig.json` configuration
4. **Module Resolution**: Check package.json exports configuration

### Performance Tuning

For large libraries:
- Increase Metro worker count: `--max-workers`
- Adjust cache size if needed
- Consider excluding large directories from watch folders

## Future Enhancements

Planned improvements:
- Web platform support (if needed)
- Additional cache optimizations
- Enhanced source map configuration
- Custom transformer plugins for SurveyJS integration