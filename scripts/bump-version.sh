#!/bin/bash

# Version Bump Script
# Updates version in package.json and tauri.conf.json, creates git tag
# Usage: ./scripts/bump-version.sh <version>
# Example: ./scripts/bump-version.sh 1.0.1

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if version argument is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: Version number required${NC}"
  echo "Usage: $0 <version>"
  echo "Example: $0 1.0.1"
  exit 1
fi

NEW_VERSION=$1

# Validate version format (basic semver check)
if ! [[ $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo -e "${RED}Error: Invalid version format${NC}"
  echo "Version must be in format: X.Y.Z (e.g., 1.0.1)"
  exit 1
fi

echo -e "${YELLOW}Bumping version to $NEW_VERSION...${NC}"

# Update package.json
echo "Updating package.json..."
if command -v jq &> /dev/null; then
  # Use jq if available (more reliable)
  jq ".version = \"$NEW_VERSION\"" package.json > package.json.tmp
  mv package.json.tmp package.json
else
  # Fallback to sed
  sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" package.json
fi

# Update tauri.conf.json
echo "Updating src-tauri/tauri.conf.json..."
if command -v jq &> /dev/null; then
  jq ".version = \"$NEW_VERSION\"" src-tauri/tauri.conf.json > src-tauri/tauri.conf.json.tmp
  mv src-tauri/tauri.conf.json.tmp src-tauri/tauri.conf.json
else
  sed -i '' "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" src-tauri/tauri.conf.json
fi

echo -e "${GREEN}✓ Version files updated${NC}"

# Show git diff
echo ""
echo "Changes to be committed:"
git diff package.json src-tauri/tauri.conf.json

# Ask for confirmation
read -p "Commit and tag version $NEW_VERSION? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Aborted. Version files updated but not committed.${NC}"
  exit 0
fi

# Git operations
echo ""
echo "Creating git commit and tag..."

# Add files
git add package.json src-tauri/tauri.conf.json

# Create commit
git commit -m "chore: bump version to $NEW_VERSION"

# Create tag
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

echo -e "${GREEN}✓ Commit and tag created${NC}"
echo ""
echo "Next steps:"
echo "1. Review the changes: git show v$NEW_VERSION"
echo "2. Push the tag to trigger release: git push origin v$NEW_VERSION"
echo "3. Push the commit: git push"
echo ""
echo -e "${YELLOW}Note: Pushing the tag will trigger the GitHub Actions release workflow${NC}"
