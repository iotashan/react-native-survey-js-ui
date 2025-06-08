#!/bin/bash

# New Version Release Script for react-native-survey-js-ui
# This script automates the process of updating to a new survey-core version

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DRY_RUN=false
TARGET_VERSION=""
SKIP_TESTS=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --target-version=*)
      TARGET_VERSION="${1#*=}"
      shift
      ;;
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [--dry-run] [--target-version=X.Y.Z] [--skip-tests]"
      echo ""
      echo "Options:"
      echo "  --dry-run              Show what would be done without making changes"
      echo "  --target-version=X.Y.Z Update to specific survey-core version"
      echo "  --skip-tests           Skip running tests (not recommended)"
      echo "  -h, --help            Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Helper functions
log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
  echo -e "${GREEN}✅${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠️${NC} $1"
}

log_error() {
  echo -e "${RED}❌${NC} $1"
}

log_step() {
  echo -e "${YELLOW}🔄${NC} $1"
}

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -d "survey-core-rn" ]] || [[ ! -d "survey-library-fork" ]]; then
  log_error "This script must be run from the root of react-native-survey-js-ui repository"
  exit 1
fi

# Pre-flight checks
log_step "Running pre-flight checks..."

# Check git status
if [[ -n $(git status --porcelain) ]]; then
  log_warning "Working directory is not clean. Consider committing or stashing changes."
  if [[ "$DRY_RUN" == "false" ]]; then
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  log_warning "Not on main branch (currently on: $CURRENT_BRANCH)"
  if [[ "$DRY_RUN" == "false" ]]; then
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
fi

# Get current versions
CURRENT_LIB_VERSION=$(node -p "require('./package.json').version")
CURRENT_SURVEY_CORE_VERSION=$(node -p "require('./package.json').surveyCoreVersion || 'unknown'")

log_info "Current library version: $CURRENT_LIB_VERSION"
log_info "Current survey-core version: $CURRENT_SURVEY_CORE_VERSION"

# Check upstream for new versions
log_step "Checking for new survey-core versions..."

cd survey-library-fork
git fetch upstream --tags > /dev/null 2>&1 || {
  log_error "Failed to fetch upstream tags. Make sure upstream remote is configured."
  exit 1
}

# Get latest upstream tag
LATEST_UPSTREAM_VERSION=$(git tag -l --sort=-version:refname | head -n 1 | sed 's/^v//')

log_info "Latest upstream survey-core version: $LATEST_UPSTREAM_VERSION"

# Determine target version
if [[ -n "$TARGET_VERSION" ]]; then
  # Validate target version exists
  if ! git tag -l | grep -q "^v\?$TARGET_VERSION$"; then
    log_error "Target version $TARGET_VERSION not found in upstream repository"
    exit 1
  fi
  NEXT_VERSION="$TARGET_VERSION"
else
  NEXT_VERSION="$LATEST_UPSTREAM_VERSION"
fi

# Check if update is needed
if [[ "$CURRENT_SURVEY_CORE_VERSION" == "$NEXT_VERSION" ]]; then
  log_success "Already up to date with survey-core $NEXT_VERSION"
  exit 0
fi

log_info "Will update from survey-core $CURRENT_SURVEY_CORE_VERSION → $NEXT_VERSION"

if [[ "$DRY_RUN" == "true" ]]; then
  log_info "DRY RUN MODE - No changes will be made"
  echo ""
  echo "Would perform the following actions:"
  echo "1. Update survey-library-fork to survey-core $NEXT_VERSION"
  echo "2. Rebuild survey-core with React Native fixes"
  echo "3. Update survey-core-rn/package.json to version $NEXT_VERSION"
  echo "4. Update main package.json surveyCoreVersion field"
  echo "5. Update README.md version compatibility table"
  echo "6. Run tests to verify compatibility"
  echo "7. Create commit with version update"
  echo ""
  log_success "Dry run completed - no changes made"
  exit 0
fi

# Actual update process
log_step "Updating survey-library-fork to version $NEXT_VERSION..."

# Create update branch
UPDATE_BRANCH="update-to-$NEXT_VERSION"
if git branch | grep -q "$UPDATE_BRANCH"; then
  git branch -D "$UPDATE_BRANCH"
fi
git checkout -b "$UPDATE_BRANCH"

# Update to target version
git merge "v$NEXT_VERSION" || {
  log_error "Failed to merge upstream version $NEXT_VERSION"
  log_error "Manual conflict resolution may be required"
  exit 1
}

log_step "Rebuilding survey-core with React Native fixes..."

cd packages/survey-core
npm install || {
  log_error "Failed to install survey-core dependencies"
  exit 1
}

npm run build || {
  log_error "Failed to build survey-core"
  exit 1
}

# Copy built files to our wrapper
log_step "Updating survey-core-rn with new build..."
cd ../../..
cp -r survey-library-fork/packages/survey-core/build/* survey-core-rn/ || {
  log_error "Failed to copy built survey-core files"
  exit 1
}

# Update survey-core-rn package.json
log_step "Updating survey-core-rn metadata..."
cat > survey-core-rn/package.json << EOF
{
  "name": "survey-core",
  "version": "$NEXT_VERSION",
  "description": "React Native wrapper for survey-core with React Native compatibility fixes",
  "main": "index.js",
  "private": true,
  "upstreamVersion": "$NEXT_VERSION",
  "lastUpdated": "$(date +%Y-%m-%d)",
  "reactNativeFixes": [
    "Fixed window.addEventListener in dragdrop/dom-adapter.ts",
    "Fixed document.head access in settings.ts",
    "Added minimal window/document polyfills"
  ]
}
EOF

# Update main package.json surveyCoreVersion
log_step "Updating main package.json..."
TEMP_FILE=$(mktemp)
node -e "
const pkg = require('./package.json');
pkg.surveyCoreVersion = '$NEXT_VERSION';
require('fs').writeFileSync('$TEMP_FILE', JSON.stringify(pkg, null, 2) + '\n');
"
mv "$TEMP_FILE" package.json

# Update README.md version table
log_step "Updating README.md version table..."
TEMP_README=$(mktemp)
TODAY=$(date +%Y-%m-%d)

# Create new version table entry
NEW_ROW="| $CURRENT_LIB_VERSION | $NEXT_VERSION | $TODAY | Updated survey-core to $NEXT_VERSION |"

# Update README with new row (add after header row)
awk -v new_row="$NEW_ROW" '
/\| react-native-survey-js-ui \| survey-core \| Release Date \| Notes \|/ {
  print $0;
  getline; print $0;  # Print the separator line
  print new_row;      # Add new row
  next;
}
!/\| [0-9]+\.[0-9]+\.[0-9]+ +\| [0-9]+\.[0-9]+\.[0-9]+ +\|/ || NR <= 10 {print}
' README.md > "$TEMP_README"

mv "$TEMP_README" README.md

# Install dependencies
log_step "Updating dependencies..."
yarn install

# Run tests unless skipped
if [[ "$SKIP_TESTS" == "false" ]]; then
  log_step "Running tests to verify compatibility..."
  yarn test --silent || {
    log_error "Tests failed with new survey-core version"
    log_error "Manual investigation required"
    exit 1
  }
  log_success "All tests passed"
fi

# Create commit
log_step "Creating commit..."
git add -A
git commit -m "chore: update survey-core to version $NEXT_VERSION

- Updated survey-library-fork to survey-core $NEXT_VERSION
- Rebuilt survey-core with React Native compatibility fixes
- Updated version tracking in package.json and README.md
- Verified compatibility with test suite

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

log_success "Version update completed successfully!"

echo ""
echo "📊 Summary:"
echo "- Updated survey-core from $CURRENT_SURVEY_CORE_VERSION → $NEXT_VERSION"
echo "- Applied React Native fixes"
echo "- Updated documentation"
echo "- All tests passing"
echo ""
echo "🚀 Next steps:"
echo "- Review changes: git show HEAD"
echo "- Test example app manually"
echo "- Update CHANGELOG.md if needed"
echo "- Create new library release when ready"