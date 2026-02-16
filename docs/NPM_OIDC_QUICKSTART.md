# npm OIDC Publishing - Quick Start

Get started with secure, tokenless npm publishing in 5 minutes.

## Prerequisites

- npm package ready to publish
- GitHub repository with the package
- npm account

## Step 1: Configure Trusted Publisher on npm

1. Go to [npmjs.com](https://www.npmjs.com) → Sign in
2. Navigate to your package → Settings → Publishing access
3. Click "Add trusted publisher"
4. Fill in:
   - **Provider**: GitHub Actions
   - **Organization**: `your-org`
   - **Repository**: `your-repo`
   - **Workflow**: `.github/workflows/publish.yml`
5. Save

## Step 2: Add publishConfig to package.json

```json
{
  "name": "@your-org/your-package",
  "version": "1.0.0",
  "publishConfig": {
    "registry": "https://registry.npmjs.org",
    "access": "public"
  }
}
```

## Step 3: Create GitHub Actions Workflow

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:

      - uses: actions/checkout@v4
      - run: curl -fsSL https://pantry.sh/install.sh | bash
      - run: pantry publish

```

## Step 4: Publish

1. Create a GitHub release
2. The workflow runs automatically
3. Your package is published to npm with OIDC!

No tokens. No secrets. Just works. ✨

## What Happens

1. GitHub generates a short-lived OIDC token
2. Pantry requests the token from GitHub
3. npm validates the token against your trusted publisher config
4. Package is published with automatic provenance
5. Token expires after a few minutes

## Verify It Worked

```bash
npm view @your-org/your-package
```

Look for the "Provenance" section showing it was built on GitHub Actions.

## Troubleshooting

### First Publish

OIDC doesn't work for the first publish. Use token auth:

```bash
NPM_TOKEN=your_token pantry publish --no-oidc
```

Then configure trusted publisher for subsequent publishes.

### Permission Denied

Ensure `id-token: write` permission is set in your workflow.

### Claims Mismatch

Verify the workflow file path in npm trusted publisher config matches exactly:

- ✅ `.github/workflows/publish.yml`
- ❌ `publish.yml`

## Next Steps

- [Full npm OIDC Guide](./NPM_OIDC_PUBLISHING.md)
- [GitHub Actions Example](../examples/github-actions-npm-oidc-publish.yml)
- [OIDC Implementation Details](./OIDC_IMPLEMENTATION_SUMMARY.md)

## Multiple Registries

Publish to npm AND your custom registry:

```yaml

- run: pantry publish --registry https://registry.npmjs.org
- run: pantry publish --registry https://registry.pantry.dev

```

Both use OIDC. No tokens needed. 🎉
