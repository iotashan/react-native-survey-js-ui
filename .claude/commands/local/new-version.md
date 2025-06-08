# New Version Release Command

Creates a new version of react-native-survey-js-ui based on latest survey-core.

## Usage
```bash
# Check for updates and create new version
new-version [--dry-run] [--target-version=1.12.30]
```

## Process Overview

This command handles the complex process of:
1. Checking upstream survey-core for new versions
2. Updating our fork with upstream changes  
3. Rebuilding survey-core with React Native fixes
4. Testing the updated integration
5. Updating documentation and changelogs
6. Creating a new release with proper version locking

## Detailed Process

### 1. Pre-flight Checks
- Ensure clean git working directory
- Verify we're on main branch
- Check that all tests pass
- Verify current survey-core version in survey-core-rn/package.json

### 2. Upstream Version Discovery
- Fetch latest tags from upstream survey-core repository
- Compare with our current version (from survey-core-rn/package.json)
- List available updates
- If --target-version specified, validate it exists
- If no updates available, exit gracefully

### 3. Fork Update Process
- Navigate to survey-library-fork/
- Fetch upstream changes: `git fetch upstream`
- Create update branch: `git checkout -b update-to-{version}`
- Merge/rebase upstream changes: `git merge upstream/master`
- Resolve any conflicts (may require manual intervention)
- Verify our React Native fixes are still applied:
  - Check src/dragdrop/dom-adapter.ts
  - Check src/settings.ts
  - Verify polyfill implementations

### 4. Build Updated Survey-Core
- Navigate to survey-library-fork/packages/survey-core/
- Install dependencies: `npm install`
- Run build: `npm run build`
- Copy built artifacts to ../../survey-core-rn/
- Update survey-core-rn/package.json with new version number

### 5. Integration Testing
- Run our full test suite: `yarn test`
- Test example app functionality
- Verify React Native compatibility
- Test on both iOS and Android if possible
- Performance regression testing

### 6. Documentation Updates

#### Update README.md Version Table
```markdown
| react-native-survey-js-ui | survey-core | Release Date | Notes |
|---------------------------|-------------|--------------|-------|
| {new-version}             | {survey-core-version} | {today} | Updated survey-core, fixed... |
```

#### Update CHANGELOG.md
- Add new version section
- List survey-core changes (from their CHANGELOG)
- List our changes and fixes
- Note any breaking changes

#### Update package.json
- Bump version following semver
- Update surveyCoreVersion field to match new survey-core version
- Keep survey-core dependency as "file:./survey-core-rn" (local build)
- Update any related metadata

### 7. Dependency Locking
- survey-core dependency remains as "file:./survey-core-rn" (our local build)
- Version tracking is done via surveyCoreVersion field in package.json
- Update yarn.lock: `yarn install`
- Verify lockfile changes are correct

### 8. Final Validation
- Run complete test suite one more time
- Build and verify library exports
- Test example app end-to-end
- Verify TypeScript compilation

### 9. Release Creation
- Commit all changes with conventional commit message
- Create git tag with new version
- Push changes and tag to origin
- Create GitHub release with CHANGELOG excerpt
- Optionally: Publish to npm (if configured)

## Safety Measures

### Automatic Rollback
- If any step fails, automatically rollback changes
- Restore previous survey-core-rn/ state
- Switch back to main branch
- Clean up temporary branches

### Manual Intervention Points
- Merge conflict resolution during fork update
- Breaking changes in survey-core API
- Test failures that require investigation
- Version numbering decisions (major vs minor vs patch)

### Dry Run Mode
With --dry-run:
- Perform all checks and discovery
- Show what would be updated
- Validate process without making changes
- Useful for CI/CD planning

## Configuration

### Environment Variables
- SURVEY_CORE_UPSTREAM_URL: Override upstream repository URL
- SKIP_TESTS: Skip test execution (not recommended)
- AUTO_PUBLISH: Automatically publish to npm after success

### Required Tools
- git (with upstream remote configured)
- node/npm (for building survey-core)
- yarn (for our project dependencies)

## Error Handling

### Common Issues
1. **Merge conflicts in fork update**
   - Pause process and provide resolution guidance
   - Show conflicted files and our expected fixes
   - Resume after manual resolution

2. **Test failures after update**
   - Show detailed test output
   - Suggest investigation steps
   - Option to continue with failing tests (not recommended)

3. **Build failures in survey-core**
   - Check for upstream build issues
   - Verify our patches are still compatible
   - May require manual fix to our patches

4. **Breaking changes in survey-core**
   - Detect API changes that might affect our code
   - Warn about potential breaking changes
   - Suggest manual review of changes

## Output Format

### Success
```
✅ New version 0.2.0 created successfully!

📊 Summary:
- Updated survey-core from 1.12.28 → 1.12.30
- Applied React Native fixes
- Updated documentation
- All tests passing (355/355)

🚀 Next steps:
- Review CHANGELOG.md
- Test example app manually
- Create GitHub release
- Publish to npm if ready
```

### Failure
```
❌ Version update failed at step: Build Updated Survey-Core

🔍 Details:
- survey-core build failed with TypeScript errors
- Conflicts in src/dragdrop/dom-adapter.ts
- Our polyfill patches may need updating

🛠️ Manual steps required:
1. cd survey-library-fork/packages/survey-core
2. Fix TypeScript errors in build
3. Verify React Native patches still work
4. Re-run: yarn new-version --resume

📞 Need help? Check: docs/TROUBLESHOOTING.md#version-updates
```

## Integration with Existing Commands

This command should integrate with:
- Existing test suite (test.md)
- Build verification (validate-build.js)
- Documentation generation
- Release-it configuration

## Future Enhancements

1. **Automated Conflict Resolution**
   - Smart detection of our patches
   - Automatic reapplication after upstream merges
   - Machine learning for conflict resolution

2. **Continuous Integration**
   - Daily checks for new survey-core versions
   - Automated PR creation for updates
   - Integration with GitHub Actions

3. **Semantic Version Detection**
   - Analyze survey-core changes for breaking changes
   - Automatically determine if major/minor/patch bump needed
   - Integration with conventional commits

4. **Multi-version Support**
   - Support for maintaining multiple survey-core versions
   - Backport critical fixes to older versions
   - LTS version management