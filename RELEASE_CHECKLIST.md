# Release Checklist

This checklist provides a step-by-step guide for creating a new release of Circada with the auto-update system.

---

## Pre-Release Checklist

### Code Quality

- [ ] All tests passing: `npm test`
- [ ] No TypeScript errors: `npm run build:typed`
- [ ] Linter clean: `npm run lint`
- [ ] No console errors in development mode
- [ ] App builds successfully: `npm run build:dev`

### Functionality Testing

- [ ] Core features working:
  - [ ] Circadian rhythm calculations accurate
  - [ ] Ultradian dashboard displays correctly
  - [ ] Timer countdown in menubar working
  - [ ] Live HealthKit integration functional (if applicable)
  - [ ] Theme switching works
  - [ ] Mock data testing functional

- [ ] New features tested:
  - [ ] Document what changed
  - [ ] Test all new UI elements
  - [ ] Verify no regressions

### Git Repository

- [ ] All changes committed
- [ ] Git status clean: `git status`
- [ ] On correct branch (usually `master` or `main`)
- [ ] Branch up to date with remote: `git pull`
- [ ] No merge conflicts

### Documentation

- [ ] CLAUDE.md updated with new features (if applicable)
- [ ] README.md updated (if user-facing changes)
- [ ] Code comments added for complex logic
- [ ] API changes documented

---

## Release Process

### Step 1: Determine Version Number

Use [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

**Decision Matrix**:

| Change Type | Example | Version Bump |
|------------|---------|--------------|
| Bug fix, minor tweak | Fix timer display bug | PATCH (1.0.0 → 1.0.1) |
| New feature, no breaking changes | Add export to CSV feature | MINOR (1.0.1 → 1.1.0) |
| Breaking change, major redesign | Complete UI overhaul | MAJOR (1.9.0 → 2.0.0) |

**Current Version**: Check `package.json` or:
```bash
grep '"version"' package.json
```

**New Version**: `___________` (fill this in)

---

### Step 2: Bump Version

Run the version bump script:

```bash
npm run version:bump <NEW_VERSION>
```

**Example**:
```bash
npm run version:bump 1.0.1
```

**Script will**:
1. ✅ Update `package.json` version
2. ✅ Update `src-tauri/tauri.conf.json` version
3. ✅ Show git diff for review
4. ✅ Ask for confirmation
5. ✅ Create commit: `chore: bump version to <NEW_VERSION>`
6. ✅ Create git tag: `v<NEW_VERSION>`

**Checklist**:
- [ ] Script completed successfully
- [ ] Versions updated correctly (review git diff)
- [ ] Commit created: `git log -1`
- [ ] Tag created: `git tag -l`

---

### Step 3: Push to GitHub

Push the tag **first** (this triggers the release workflow):

```bash
git push origin v<NEW_VERSION>
```

**Example**:
```bash
git push origin v1.0.1
```

Then push the commit:

```bash
git push
```

**Checklist**:
- [ ] Tag pushed: `git ls-remote --tags origin`
- [ ] Commit pushed: Check GitHub repository

---

### Step 4: Monitor GitHub Actions

1. **Navigate to Actions**:
   - Go to: https://github.com/maxmaeser/circada/actions
   - Find the "Release" workflow run (should be at the top)

2. **Monitor Progress** (~10-15 minutes):

   - [ ] ✅ Checkout repository
   - [ ] ✅ Setup Node.js
   - [ ] ✅ Setup Rust
   - [ ] ✅ Install dependencies
   - [ ] ✅ Build frontend
   - [ ] ✅ Build universal macOS app (longest step)
   - [ ] ✅ Extract version from tag
   - [ ] ✅ Create updater manifest (latest.json)
   - [ ] ✅ Create Release
   - [ ] ✅ Upload artifacts

3. **If Workflow Fails**:
   - [ ] Click on failed step to view logs
   - [ ] Identify error message
   - [ ] Fix issue locally
   - [ ] Delete failed release: `gh release delete v<VERSION>`
   - [ ] Delete tag: `git tag -d v<VERSION> && git push origin :refs/tags/v<VERSION>`
   - [ ] Return to Step 2 and try again

**Workflow Status**: _________________ (Success / Failed)

---

### Step 5: Verify Release Assets

1. **Navigate to Releases**:
   - Go to: https://github.com/maxmaeser/circada/releases
   - Click on the new release (e.g., "v1.0.1")

2. **Verify Assets Exist**:

   - [ ] ✅ `Circada_<VERSION>_universal.dmg` file present
   - [ ] ✅ `latest.json` file present
   - [ ] ✅ Release notes auto-generated
   - [ ] ✅ Release marked as "Latest"

3. **Download and Verify latest.json**:

   ```bash
   curl -L https://github.com/maxmaeser/circada/releases/latest/download/latest.json
   ```

   **Verify Content**:
   - [ ] `version` field matches new version
   - [ ] `pub_date` is ISO 8601 timestamp
   - [ ] `platforms.darwin-aarch64.url` is correct
   - [ ] `platforms.darwin-x86_64.url` is correct

4. **Test DMG Download** (optional):

   ```bash
   curl -I https://github.com/maxmaeser/circada/releases/download/v<VERSION>/Circada_<VERSION>_universal.dmg
   ```

   - [ ] Returns `HTTP/2 200` or `302 Found`
   - [ ] File size reasonable (~40-50 MB)

**Assets Verified**: ☐ Yes ☐ No

---

### Step 6: Test Update Mechanism

**Option A: Test on Previous Version** (Recommended)

1. **Install Previous Version**:
   - Download previous release DMG
   - Install to `/Applications/`
   - Launch app

2. **Trigger Update Check**:
   - Open Burger Menu (top-right hamburger icon)
   - Click "Check for Updates"

3. **Verify Update Flow**:
   - [ ] Status changes to "Checking for updates..."
   - [ ] Status changes to "Update available: v<NEW_VERSION>"
   - [ ] Status changes to "Downloading... X%"
   - [ ] Progress bar updates
   - [ ] Status changes to "Update ready! Restarting..."
   - [ ] App automatically relaunches

4. **Verify New Version**:
   - [ ] Open Burger Menu
   - [ ] Status shows "Version <NEW_VERSION>"
   - [ ] Status shows "You are up to date!"
   - [ ] Test core functionality still works

**Option B: Fresh Install** (Quicker)

1. **Download and Install**:
   - Download new release DMG
   - Install to `/Applications/`
   - Launch app

2. **Verify Version**:
   - [ ] Open Burger Menu
   - [ ] Check version number
   - [ ] Status shows "You are up to date!"

3. **Test Functionality**:
   - [ ] All core features working
   - [ ] New features working as expected
   - [ ] No crashes or errors

**Update Test**: ☐ Passed ☐ Failed

---

### Step 7: Post-Release Tasks

#### Update Documentation

- [ ] Add entry to CHANGELOG.md (if exists)
- [ ] Update version references in docs
- [ ] Update screenshots (if UI changed)

#### Announce Release (Optional)

- [ ] Post to social media (if applicable)
- [ ] Notify beta testers
- [ ] Update website download link (if applicable)
- [ ] Send newsletter (if applicable)

#### Monitor for Issues

- [ ] Watch GitHub Issues for bug reports
- [ ] Monitor crash reports (if crash reporting enabled)
- [ ] Check update analytics (if enabled)

#### Tag This Checklist

**Release Date**: _______________
**Released By**: _______________
**Notes**:
```
(Add any observations, issues encountered, or lessons learned)





```

---

## Rollback Procedure

If critical bug discovered after release:

### Option 1: Quick Fix Release

1. Fix the bug immediately
2. Bump to next patch version (e.g., 1.0.1 → 1.0.2)
3. Follow full release process above
4. Most users will update automatically

### Option 2: Delete Bad Release

1. **Delete GitHub Release**:
   ```bash
   gh release delete v<BAD_VERSION>
   ```

2. **Delete Git Tag**:
   ```bash
   git tag -d v<BAD_VERSION>
   git push origin :refs/tags/v<BAD_VERSION>
   ```

3. **Revert Version in Code**:
   ```bash
   git revert <COMMIT_HASH>
   git push
   ```

4. **Create New Release** with fix (important: must be higher version)

**Note**: Deleting a release doesn't un-install it from users who already updated. They would need to manually install an older version or wait for the next release.

---

## Troubleshooting

### Issue: Version Bump Script Fails

**Error**: `sed: command not found` or `jq: command not found`

**Solution**:
- Install jq: `brew install jq`
- Or manually edit `package.json` and `src-tauri/tauri.conf.json`
- Commit and tag manually:
  ```bash
  git add package.json src-tauri/tauri.conf.json
  git commit -m "chore: bump version to <VERSION>"
  git tag -a "v<VERSION>" -m "Release v<VERSION>"
  ```

---

### Issue: GitHub Actions Build Fails

**Common Causes**:

1. **TypeScript errors**:
   - Test locally: `npm run build:typed`
   - Fix errors and retry

2. **Rust compilation errors**:
   - Test locally: `cd src-tauri && cargo build --release`
   - Fix errors and retry

3. **Permission issues**:
   - Check: Settings → Actions → General → Workflow permissions
   - Set to: "Read and write permissions"

4. **Dependency issues**:
   - Check if `package-lock.json` is committed
   - Ensure all dependencies in `package.json` are correct

---

### Issue: latest.json Not Created

**Cause**: GitHub Actions workflow step failed

**Solution**:
1. Check workflow logs for errors
2. Verify step "Create updater manifest" completed
3. Manually create if needed:
   ```bash
   cat > latest.json <<EOF
   {
     "version": "<VERSION>",
     "notes": "Release notes",
     "pub_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
     "platforms": {
       "darwin-aarch64": {
         "signature": "",
         "url": "https://github.com/maxmaeser/circada/releases/download/v<VERSION>/Circada_<VERSION>_universal.dmg"
       },
       "darwin-x86_64": {
         "signature": "",
         "url": "https://github.com/maxmaeser/circada/releases/download/v<VERSION>/Circada_<VERSION>_universal.dmg"
       }
     }
   }
   EOF
   ```
4. Upload to release: `gh release upload v<VERSION> latest.json`

---

### Issue: Update Check Says "You are up to date"

**Cause**: Version comparison

**Debug**:
```bash
# Check current version
grep '"version"' package.json

# Check latest.json version
curl -L https://github.com/maxmaeser/circada/releases/latest/download/latest.json | grep '"version"'
```

**Solution**: Ensure new version is HIGHER than installed version

---

## Quick Reference

### Commands

```bash
# Check current version
grep '"version"' package.json

# Bump version
npm run version:bump <NEW_VERSION>

# Push tag (triggers release)
git push origin v<NEW_VERSION>

# Push commit
git push

# Delete release (if needed)
gh release delete v<VERSION>

# Delete tag (if needed)
git tag -d v<VERSION>
git push origin :refs/tags/v<VERSION>

# View workflow status
gh run list

# Download latest.json
curl -L https://github.com/maxmaeser/circada/releases/latest/download/latest.json
```

### Links

- **GitHub Actions**: https://github.com/maxmaeser/circada/actions
- **Releases**: https://github.com/maxmaeser/circada/releases
- **Detailed Guide**: [AUTO_UPDATE.md](./AUTO_UPDATE.md)

---

## Notes

### First Release Setup

If this is your first release (no previous versions):

- [ ] Ensure GitHub repository is public or actions have proper permissions
- [ ] Verify GitHub Actions is enabled
- [ ] Confirm workflow file exists: `.github/workflows/release.yml`
- [ ] Test workflow manually if possible

### Future Enhancements

When adding code signing:

- [ ] Update this checklist with signing steps
- [ ] Add verification of signatures
- [ ] Update rollback procedure for signed releases

---

**Checklist Version**: 1.0.0
**Last Updated**: 2025-01-15
**For Circada Version**: 1.0.0+
