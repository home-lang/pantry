# OIDC Quick Start Guide

Get started with OIDC authentication in Pantry in under 5 minutes!

## Prerequisites

- A package published to npm (or ready to publish)
- Access to your package on npm (maintainer/owner)
- GitHub Actions, GitLab CI, or another supported CI/CD provider

## Step 1: Configure Trusted Publisher (One-Time Setup)

First, you need to tell npm that your GitHub repository is allowed to publish your package.

### Using Web UI (Recommended for First-Time Setup)

1. Go to https://www.npmjs.com/package/your-package/access
2. Click "Publishing Access"
3. Click "Add Trusted Publisher"
4. Select "GitHub Actions"
5. Fill in:
   - **Owner**: Your GitHub username or org (e.g., `my-org`)
   - **Repository**: Your repo name (e.g., `my-package`)
   - **Workflow**: `.github/workflows/publish.yml`
   - **Environment** (optional): `production`

### Using Pantry CLI

```bash
# Set your npm token (only needed for this setup step)
export NPM_TOKEN=your_npm_token

# Add trusted publisher
pantry publisher add \
  --package your-package \
  --type github-action \
  --owner your-org \
  --repository your-repo \
  --workflow .github/workflows/publish.yml
```

## Step 2: Create GitHub Actions Workflow

Create `.github/workflows/publish.yml` in your repository:

```yaml
name: Publish Package

on:
  release:
    types: [created]

permissions:
  id-token: write  # IMPORTANT: Required for OIDC
  contents: read

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Publish with OIDC
        run: npx pantry publish
```

**Key Points:**
- `id-token: write` permission is **required**
- No `NPM_TOKEN` secret needed!
- Works automatically in CI

## Step 3: Test It!

### Create a Release

```bash
git tag v1.0.0
git push origin v1.0.0
```

Or use GitHub's web UI to create a release.

### Watch the Workflow

Go to your repository's Actions tab and watch the publish workflow run. You should see:

```
✓ Detected OIDC provider: GitHub Actions
✓ OIDC Claims validated
✓ Package published successfully using OIDC
✓ Generated provenance: your-package-1.0.0.provenance.json
```

## Step 4: Verify Publication

Check that your package was published:

```bash
npm view your-package@1.0.0
```

You should see the new version!

## That's It!

Your package is now published using OIDC authentication. No secrets to manage, no tokens to rotate!

## Next Steps

- [Read the full OIDC documentation](./OIDC_AUTHENTICATION.md)
- [Learn about provenance](./OIDC_AUTHENTICATION.md#provenance)
- [Configure multiple trusted publishers](./OIDC_AUTHENTICATION.md#multiple-trusted-publishers)
- [Set up environment protection](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)

## Common Issues

### "OIDC token not available"

**Solution**: Make sure you added `id-token: write` to your workflow permissions:

```yaml
permissions:
  id-token: write
  contents: read
```

### "Claims mismatch"

**Solution**: Verify your trusted publisher configuration matches exactly:
- Repository owner must match
- Repository name must match
- Workflow path must match (including `.github/workflows/`)

### "Permission denied"

**Solution**: Check that:
1. You're a maintainer of the package on npm
2. The trusted publisher is correctly configured
3. Your workflow is running from the correct repository

## GitLab CI Quick Start

For GitLab CI, the process is similar:

```yaml
# .gitlab-ci.yml
publish:
  stage: deploy
  image: node:20
  only:
    - tags
  script:
    - npm install
    - npm run build
    - npx pantry publish
```

Configure the trusted publisher:

```bash
pantry publisher add \
  --package your-package \
  --type gitlab-ci \
  --owner your-group \
  --repository your-project
```

## Need Help?

- Check the [full documentation](./OIDC_AUTHENTICATION.md)
- Open an issue on [GitHub](https://github.com/pantry-sh/pantry/issues)
- Join our [Discord community](https://discord.gg/pantry)
