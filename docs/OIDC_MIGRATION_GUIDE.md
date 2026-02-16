# Migrating to OIDC Authentication

This guide will help you migrate from traditional token-based authentication to OIDC for publishing packages.

## Why Migrate

### Current Approach (Token-Based)

```yaml

- name: Publish

  run: npm publish
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Issues:**

- ❌ Long-lived tokens stored in secrets
- ❌ Tokens can be compromised if leaked
- ❌ No workflow-specific access control
- ❌ Manual token rotation required
- ❌ No provenance/attestation

### New Approach (OIDC)

```yaml
permissions:
  id-token: write

- name: Publish

  run: pantry publish
# No secrets needed
```

**Benefits:**

- ✅ Short-lived tokens (1 hour)
- ✅ Automatic token generation
- ✅ Workflow-specific access control
- ✅ No token management needed
- ✅ Automatic provenance generation
- ✅ Supply chain security

## Migration Steps

### Step 1: Understand Your Current Setup

Before migrating, document your current publishing workflow:

```bash
# What packages do you publish
npm whoami
npm access ls-packages

# What workflows publish them
# Review .github/workflows/*.yml files

# What environments are used
# Check GitHub repository settings > Environments
```

### Step 2: Configure Trusted Publishers

For each package, add a trusted publisher configuration.

#### Option A: Using npm Web UI (Recommended First Time)

1. Go to <https://www.npmjs.com/package/your-package/access>
2. Click "Publishing Access"
3. Click "Add Trusted Publisher"
4. Select your CI/CD provider (e.g., "GitHub Actions")
5. Fill in the details:
   - **Owner**: Your GitHub org/username
   - **Repository**: Repository name
   - **Workflow**: `.github/workflows/publish.yml` (or your workflow file)
   - **Environment**: (optional) `production`
6. Save

#### Option B: Using Pantry CLI

```bash
# Set NPM_TOKEN temporarily (only for this setup)
export NPM_TOKEN=your_npm_token

# Add trusted publisher
pantry publisher add \
  --package @org/package \
  --type github-action \
  --owner org-name \
  --repository repo-name \
  --workflow .github/workflows/publish.yml \
  --environment production

# Verify configuration
pantry publisher list --package @org/package

# Clear the token
unset NPM_TOKEN
```

### Step 3: Update Your Workflow

#### Before (Token-Based)

```yaml
name: Publish

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:

      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci
      - run: npm test
      - run: npm publish

        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

#### After (OIDC)

```yaml
name: Publish

on:
  release:
    types: [created]

# ADD THIS: OIDC permissions
permissions:
  id-token: write
  contents: read

jobs:
  publish:
    runs-on: ubuntu-latest
# ADD THIS: Environment protection (optional)
    environment: production

    steps:

      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

        with:
          node-version: '20'

      - run: npm ci
      - run: npm test

# CHANGED: Use pantry publish instead of npm publish

      - name: Publish with OIDC

        run: npx pantry publish
# No NODE_AUTH_TOKEN needed
```

### Step 4: Test the Migration

#### Option 1: Test with Dry Run

```yaml

- name: Test OIDC (Dry Run)

  run: npx pantry publish --dry-run
```

This will:

- Detect the OIDC provider
- Request an OIDC token
- Validate the token
- Show what would be published
- NOT actually publish

#### Option 2: Test with a Pre-release

Create a pre-release to test the full flow:

```bash
# Create a pre-release version
npm version 1.0.0-oidc-test.1

# Commit and tag
git add package.json
git commit -m "test: OIDC migration test"
git tag v1.0.0-oidc-test.1
git push origin v1.0.0-oidc-test.1

# Create a GitHub pre-release
# The workflow will run and publish using OIDC
```

After successful test:

```bash
# Deprecate the test version
npm deprecate your-package@1.0.0-oidc-test.1 "Test version for OIDC migration"
```

### Step 5: Update All Workflows

If you have multiple workflows that publish:

1. **Release Workflow** (`.github/workflows/release.yml`)
2. **Nightly Builds** (`.github/workflows/nightly.yml`)
3. **Manual Publish** (`.github/workflows/manual-publish.yml`)

Update each one to use OIDC.

### Step 6: Clean Up Secrets (Optional)

After confirming OIDC works:

1. Go to repository Settings > Secrets
2. Document which workflows used `NPM_TOKEN`
3. Remove or rotate the `NPM_TOKEN` secret
4. Monitor for any failures (some workflows might still need it)

⚠️ **Keep the token for a grace period** in case you need to rollback.

## Migration Checklist

- [ ] Document current publishing setup
- [ ] Install latest Pantry version
- [ ] Configure trusted publishers for all packages
- [ ] Update workflows with `id-token: write` permission
- [ ] Change `npm publish` to `pantry publish`
- [ ] Remove `NODE_AUTH_TOKEN` environment variable
- [ ] Test with dry-run mode
- [ ] Test with a pre-release version
- [ ] Monitor first real release
- [ ] Update remaining workflows
- [ ] Document new process for team
- [ ] Remove old NPM_TOKEN secret (after grace period)

## Rollback Plan

If you need to rollback to token-based auth:

### Quick Rollback

```yaml
# Keep both methods temporarily

- name: Publish

  run: |
    if pantry publish; then
      echo "Published with OIDC"
    else
      echo "OIDC failed, using token fallback"
      npm publish
    fi
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Full Rollback

1. Revert workflow changes
2. Restore `NODE_AUTH_TOKEN` usage
3. Re-enable `NPM_TOKEN` secret
4. Keep trusted publishers (they don't interfere)

## Common Migration Issues

### Issue 1: Missing `id-token: write` Permission

**Error:**

```
Error: OIDC token not available
```

**Solution:**

```yaml
permissions:
  id-token: write  # Add this!
  contents: read
```

### Issue 2: Trusted Publisher Mismatch

**Error:**

```
Error: Claims mismatch
```

**Solution:**
Verify your trusted publisher configuration matches exactly:

```bash
# Check configured publisher
pantry publisher list --package your-package

# Verify it matches
# - owner: correct org/username
# - repository: correct repo name
# - workflow: exact path to .yml file
```

### Issue 3: Environment Not Found

**Error:**

```
Error: Environment 'production' not found
```

**Solution:**
Either:

1. Create the environment in GitHub Settings > Environments
2. Or remove `environment:` from your workflow
3. Or remove environment restriction from trusted publisher

### Issue 4: Multiple Packages, Same Repo

**Scenario:**
You publish multiple packages from one repository.

**Solution:**
Add a trusted publisher for each package:

```bash
pantry publisher add --package @org/package-1 --type github-action --owner org --repository repo
pantry publisher add --package @org/package-2 --type github-action --owner org --repository repo
pantry publisher add --package @org/package-3 --type github-action --owner org --repository repo
```

## Advanced Migration Scenarios

### Scenario 1: Monorepo with Multiple Packages

```yaml
jobs:
  publish:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package:

          - packages/core
          - packages/cli
          - packages/utils

    steps:

      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Publish ${{ matrix.package }}

        run: |
          cd ${{ matrix.package }}
          npx pantry publish
```

Configure trusted publisher for each package in the monorepo.

### Scenario 2: Multiple Registries

```yaml

- name: Publish to npm

  run: npx pantry publish --registry https://registry.npmjs.org

- name: Publish to GitHub Packages

  run: npx pantry publish --registry https://npm.pkg.github.com
```

Add trusted publishers on each registry.

### Scenario 3: Conditional Publishing

```yaml

- name: Publish to npm

  if: github.event_name == 'release'
  run: npx pantry publish

- name: Publish to npm (beta)

  if: github.ref == 'refs/heads/develop'
  run: npx pantry publish --tag beta
```

Ensure your trusted publisher allows the necessary refs.

## GitLab CI Migration

### Before

```yaml
publish:
  stage: deploy
  script:

    - npm ci
    - npm publish

  only:

    - tags

  environment:
    name: production
```

### After

```yaml
publish:
  stage: deploy
  image: node:20
  script:

    - npm ci
    - npm run build
    - npx pantry publish

  only:

    - tags

  environment:
    name: production
# No id_tokens configuration needed for GitLab
# Token is automatically available
```

Configure trusted publisher:

```bash
pantry publisher add \
  --package your-package \
  --type gitlab-ci \
  --owner your-group \
  --repository your-project
```

## Validation

After migration, validate your setup:

```bash
# 1. Check trusted publishers
pantry publisher list --package your-package

# 2. Verify workflow permissions
# In .github/workflows/publish.yml, confirm
# permissions
# id-token: write

# 3. Test dry-run
pantry publish --dry-run

# 4. Check recent publishes
npm view your-package time

# 5. Verify provenance (after OIDC publish)
npm view your-package --json | jq .dist
```

## Support

If you encounter issues during migration:

1. Check the [troubleshooting guide](./OIDC_AUTHENTICATION.md#troubleshooting)
2. Review [GitHub Actions OIDC docs](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
3. Open an issue: <https://github.com/pantry-sh/pantry/issues>
4. Ask in Discord: <https://discord.gg/pantry>

## Timeline Recommendation

- **Week 1**: Test OIDC with one package in non-production environment
- **Week 2**: Migrate remaining packages to OIDC
- **Week 3**: Monitor for issues, keep token as fallback
- **Week 4**: Remove token secrets if everything is stable

## Success Metrics

Track these metrics to measure migration success:

- Successful OIDC publishes: Should be 100%
- Token fallbacks: Should decrease to 0%
- Provenance generation: Should be 100%
- Workflow failures: Should not increase

## Conclusion

Migrating to OIDC improves security and reduces maintenance burden. The migration is straightforward and can be done incrementally, allowing you to test thoroughly before full adoption.

**Remember**: You can keep both authentication methods during the transition period for safety.
