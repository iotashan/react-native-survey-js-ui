# NPM Publishing Guide

This guide covers the process of publishing react-native-survey-js-ui to npm.

## Pre-requisites

1. **npm Account**: You need an npm account with publish permissions
2. **Authentication**: Run `npm login` to authenticate
3. **Build System**: Ensure all dependencies are installed (`yarn install`)
4. **Clean Working Directory**: Commit all changes before publishing

## Pre-publish Checklist

- [ ] All tests pass (`yarn test`)
- [ ] TypeScript compilation succeeds (`yarn typecheck`)
- [ ] Build completes successfully (`yarn build`)
- [ ] No linting errors (`yarn lint`)
- [ ] Package validation passes (`yarn npm:validate`)
- [ ] Version number updated appropriately
- [ ] CHANGELOG.md updated with release notes

## Publishing Process

### 1. Validate Package

Before publishing, always validate the package:

```bash
# Run comprehensive validation
yarn npm:validate

# Check what files will be published
yarn npm:pack:dry

# Test publish without actually publishing
yarn npm:publish:dry
```

### 2. Version Management

We use semantic versioning (semver) for releases:

```bash
# For bug fixes (0.1.0 → 0.1.1)
yarn version:patch

# For new features (0.1.0 → 0.2.0)
yarn version:minor

# For breaking changes (0.1.0 → 1.0.0)
yarn version:major

# For pre-releases (0.1.0 → 0.1.1-beta.0)
yarn version:prerelease

# Dry run (see what would happen)
yarn version:patch:dry
```

### 3. Publish to npm

```bash
# Publish to npm (will run prepublishOnly hooks)
yarn npm:publish

# Publish beta version
yarn npm:publish:beta
```

The `prepublishOnly` script automatically:
- Builds the library for production
- Runs all tests
- Validates the package configuration

### 4. Post-publish Steps

1. **Verify Publication**: Check https://www.npmjs.com/package/react-native-survey-js-ui
2. **Test Installation**: In a new project, run `npm install react-native-survey-js-ui`
3. **Create GitHub Release**: Tag the release on GitHub with release notes
4. **Update Documentation**: Ensure README reflects the latest version

## Package Configuration

### Key Files

- **package.json**: Main configuration with entry points and metadata
- **.npmignore**: Controls which files are excluded from the published package
- **CHANGELOG.md**: Documents changes between versions
- **README.md**: Package documentation shown on npm

### Entry Points

```json
{
  "main": "./lib/commonjs/index.js",      // CommonJS build
  "module": "./lib/module/index.js",       // ES Module build
  "types": "./lib/typescript/module/index.d.ts", // TypeScript definitions
  "react-native": "./src/index.ts"         // React Native Metro bundler
}
```

### Peer Dependencies

The library expects consuming projects to provide:
- `react`: Any version
- `react-native`: Any version

### File Inclusion

The published package includes:
- `src/`: Source files (excluding tests)
- `lib/`: Built files (CommonJS, ES modules, TypeScript definitions)
- `README.md`, `LICENSE`, `CHANGELOG.md`

Excluded:
- Test files (`*.test.ts`, `*.test.tsx`)
- Mock files (`__mocks__`, `__tests__`)
- Development configuration files
- Example app
- Documentation

## Troubleshooting

### Build Failures

If the build fails during publishing:
1. Clean the build directory: `yarn clean`
2. Reinstall dependencies: `yarn install`
3. Run build manually: `yarn build`

### Version Conflicts

If version already exists:
1. Check npm: `npm view react-native-survey-js-ui versions`
2. Update to next version: `yarn version:patch`

### Authentication Issues

If publish fails with authentication error:
1. Check login status: `npm whoami`
2. Re-authenticate: `npm login`
3. Verify permissions on npm package page

## Automated Publishing (Future)

For CI/CD integration, consider:
1. Using `NPM_TOKEN` in GitHub Actions
2. Automating version bumps with conventional commits
3. Publishing on successful tag pushes

## Package Size Optimization

Current package size: ~74KB (compressed)

To maintain small package size:
- Use .npmignore to exclude unnecessary files
- Don't include test files or development dependencies
- Monitor size with `npm pack --dry-run`

## Version Strategy

- **0.x.y**: Pre-1.0 development (current phase)
  - Breaking changes allowed in minor versions
  - Use for initial development and API stabilization
- **1.x.y**: Stable release
  - Follow strict semver
  - Breaking changes only in major versions

## Support and Maintenance

- Monitor npm package page for user issues
- Respond to GitHub issues related to npm installation
- Keep dependencies updated for security
- Maintain backward compatibility within major versions