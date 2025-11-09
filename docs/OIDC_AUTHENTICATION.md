# OIDC Authentication for Pantry

Pantry supports **OpenID Connect (OIDC)** authentication for publishing packages, similar to [npm's trusted publishers](https://docs.npmjs.com/trusted-publishers). This allows you to publish packages from CI/CD environments without managing long-lived authentication tokens.

## Table of Contents

- [Overview](#overview)
- [Benefits](#benefits)
- [Supported Providers](#supported-providers)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Publishing with OIDC](#publishing-with-oidc)
- [Managing Trusted Publishers](#managing-trusted-publishers)
- [Security](#security)
- [Provenance](#provenance)
- [Troubleshooting](#troubleshooting)

## Overview

OIDC authentication enables secure, tokenless publishing by leveraging short-lived tokens issued by CI/CD providers. These tokens contain verified claims about the repository, workflow, and environment, ensuring that only authorized workflows can publish your packages.

### How It Works

1. **CI/CD Provider Issues Token**: When your workflow runs, the CI/CD provider (e.g., GitHub Actions) issues a short-lived OIDC token containing claims about the workflow.

2. **Pantry Validates Token**: Pantry validates the token's signature and claims against your configured trusted publishers.

3. **Package Published**: If validation succeeds, the package is published to the registry.

## Benefits

- **No Long-Lived Tokens**: Eliminates the need to store NPM_TOKEN in secrets
- **Enhanced Security**: Short-lived tokens (typically 1 hour) that can't be reused
- **Workflow Verification**: Ensures packages are only published from specific workflows
- **Environment Protection**: Can restrict publishing to specific environments
- **Audit Trail**: Full transparency of what workflow published each version
- **Provenance**: Automatic generation of SLSA provenance attestations

## Supported Providers

Pantry supports OIDC authentication from the following CI/CD providers:

| Provider | Status | Environment Detection |
|----------|--------|-----------------------|
| **GitHub Actions** | ✅ Fully Supported | `GITHUB_ACTIONS=true` |
| **GitLab CI** | ✅ Fully Supported | `GITLAB_CI=true` |
| **Bitbucket Pipelines** | ✅ Fully Supported | `BITBUCKET_BUILD_NUMBER` |
| **CircleCI** | ✅ Fully Supported | `CIRCLECI=true` |

## Quick Start

### GitHub Actions Example

1. **Enable OIDC in Your Workflow**

```yaml
# .github/workflows/publish.yml
name: Publish Package

on:
  release:
    types: [created]

permissions:
  id-token: write  # Required for OIDC
  contents: read

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Pantry
        run: curl -fsSL https://pantry.sh/install | bash

      - name: Publish to npm
        run: pantry publish
        # No NPM_TOKEN needed! OIDC handles authentication
```

2. **Configure Trusted Publisher** (one-time setup)

You'll need to configure your package to accept OIDC tokens from your repository:

```bash
# Using NPM_TOKEN for initial setup (only needed once)
export NPM_TOKEN=your_token

pantry publisher add \
  --package my-package \
  --type github-action \
  --owner my-org \
  --repository my-repo \
  --workflow .github/workflows/publish.yml \
  --environment production
```

3. **Publish!**

Now your workflow can publish without any stored secrets:

```bash
pantry publish  # Automatically uses OIDC
```

## Configuration

### Trusted Publisher Configuration

A trusted publisher defines which CI/CD workflows are authorized to publish your package:

```typescript
interface TrustedPublisher {
  type: string;              // "github-action", "gitlab-ci", etc.
  owner: string;             // Repository owner/organization
  repository: string;        // Repository name
  workflow?: string;         // Workflow file path (GitHub)
  environment?: string;      // Environment name (optional)
  allowed_refs?: string[];   // Allowed branches/tags (optional)
}
```

### GitHub Actions Configuration

```bash
pantry publisher add \
  --package @my-org/my-package \
  --type github-action \
  --owner my-org \
  --repository my-repo \
  --workflow .github/workflows/publish.yml \
  --environment production \
  --allowed-refs refs/heads/main,refs/tags/v*
```

### GitLab CI Configuration

```bash
pantry publisher add \
  --package @my-org/my-package \
  --type gitlab-ci \
  --owner my-org \
  --repository my-project \
  --allowed-refs refs/heads/main
```

### Bitbucket Pipelines Configuration

```bash
pantry publisher add \
  --package @my-org/my-package \
  --type bitbucket \
  --owner my-workspace \
  --repository my-repo
```

## Publishing with OIDC

### Publish Command

```bash
# Publish using OIDC (default)
pantry publish

# Disable OIDC and use traditional token auth
pantry publish --no-oidc

# Dry run to test without publishing
pantry publish --dry-run

# Specify custom registry
pantry publish --registry https://registry.pantry.sh

# Disable provenance generation
pantry publish --no-provenance
```

### Publish Options

| Option | Description | Default |
|--------|-------------|---------|
| `--dry-run` | Test without actually publishing | `false` |
| `--registry <url>` | Custom registry URL | `https://registry.npmjs.org` |
| `--use-oidc` | Enable OIDC authentication | `true` |
| `--provenance` | Generate provenance metadata | `true` |
| `--access <level>` | Package access level | `public` |
| `--tag <name>` | Publish with a dist-tag | `latest` |

## Managing Trusted Publishers

### Add a Trusted Publisher

```bash
pantry publisher add \
  --package my-package \
  --type github-action \
  --owner my-org \
  --repository my-repo
```

### List Trusted Publishers

```bash
# Table format
pantry publisher list --package my-package

# JSON format
pantry publisher list --package my-package --json
```

Example output:

```
Trusted Publishers for my-package:

1. Type: github-action
   Owner: my-org
   Repository: my-repo
   Workflow: .github/workflows/publish.yml
   Environment: production

2. Type: gitlab-ci
   Owner: my-org
   Repository: my-project
```

### Remove a Trusted Publisher

```bash
pantry publisher remove \
  --package my-package \
  --publisher-id <id>
```

## Security

### Token Validation

Pantry validates OIDC tokens through multiple security checks:

1. **Signature Verification**: Token signature is verified against the provider's public keys (JWKS)
2. **Expiration**: Token must not be expired
3. **Issuer**: Token must come from a trusted OIDC provider
4. **Audience**: Token audience must match the registry
5. **Claims Matching**: Repository, workflow, and environment claims must match the configured trusted publisher

### Claims Verification

#### GitHub Actions Claims

```json
{
  "iss": "https://token.actions.githubusercontent.com",
  "sub": "repo:owner/repo:ref:refs/heads/main",
  "aud": "pantry",
  "repository_owner": "owner",
  "repository": "owner/repo",
  "job_workflow_ref": "owner/repo/.github/workflows/publish.yml@refs/heads/main",
  "ref": "refs/heads/main",
  "sha": "abc123..."
}
```

#### GitLab CI Claims

```json
{
  "iss": "https://gitlab.com",
  "sub": "project_path:owner/repo:ref_type:branch:ref:main",
  "aud": "pantry",
  "namespace_path": "owner",
  "project_path": "owner/repo",
  "ref": "main",
  "pipeline_source": "push"
}
```

### Best Practices

1. **Use Environment Protection**: Configure GitHub/GitLab environments with required reviewers
2. **Restrict Allowed Refs**: Only allow publishing from main branch or version tags
3. **Monitor Publishes**: Review the audit log for unexpected publishes
4. **Use Provenance**: Enable provenance generation for supply chain security
5. **Workflow Restrictions**: Specify the exact workflow file that can publish

## Provenance

Pantry automatically generates [SLSA](https://slsa.dev/) provenance attestations when publishing with OIDC.

### Provenance Format

Pantry generates provenance in the [in-toto](https://in-toto.io/) format:

```json
{
  "_type": "https://in-toto.io/Statement/v0.1",
  "subject": [{
    "name": "my-package@1.0.0",
    "digest": {
      "sha256": "abc123..."
    }
  }],
  "predicateType": "https://slsa.dev/provenance/v0.2",
  "predicate": {
    "builder": {
      "id": "https://token.actions.githubusercontent.com"
    },
    "buildType": "https://slsa.dev/build-type/v1",
    "invocation": {
      "configSource": {
        "uri": "git+https://github.com/owner/repo",
        "digest": {
          "sha1": "abc123..."
        }
      }
    },
    "metadata": {
      "buildInvocationId": "workflow-run-id",
      "completeness": {
        "parameters": true,
        "environment": true,
        "materials": true
      },
      "reproducible": false
    }
  }
}
```

### Verifying Provenance

Provenance files are generated alongside the package tarball:

```bash
my-package-1.0.0.tgz
my-package-1.0.0.provenance.json
```

## Troubleshooting

### OIDC Token Not Available

**Error**: `OIDC authentication not available`

**Solutions**:
- Ensure `id-token: write` permission is set in your workflow
- Verify you're running in a supported CI/CD environment
- Check that the environment variable is accessible

### Token Expired

**Error**: `ExpiredToken`

**Solutions**:
- OIDC tokens typically expire after 1 hour
- Ensure the publish step runs soon after checkout
- Check if your workflow is running for an extended time

### Claims Mismatch

**Error**: `ClaimsMismatch`

**Solutions**:
- Verify the trusted publisher configuration matches your workflow
- Check repository owner/name match exactly
- Ensure workflow path is correct (include `.github/workflows/`)
- Verify ref restrictions if using `allowed_refs`

### Missing Permissions

**Error**: `Error: Failed to request OIDC token`

**Solutions**:
- Add `id-token: write` to workflow permissions
- Ensure you're using actions/checkout@v4 or later
- Check organization/repository settings allow OIDC

### Registry Not Supported

**Error**: `Registry does not support OIDC`

**Solutions**:
- Verify the registry URL is correct
- Check if the registry has OIDC support enabled
- Fall back to traditional token auth with `--no-oidc`

## Examples

### GitHub Actions - Release Workflow

```yaml
name: Release and Publish

on:
  push:
    tags:
      - 'v*'

permissions:
  id-token: write
  contents: read

jobs:
  publish:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Publish to npm
        run: pantry publish
```

### GitLab CI - Automated Publishing

```yaml
# .gitlab-ci.yml
publish:
  stage: deploy
  image: node:20
  only:
    - tags
  script:
    - curl -fsSL https://pantry.sh/install | bash
    - pantry publish
  environment:
    name: production
```

### Multi-Registry Publishing

```yaml
- name: Publish to npm
  run: pantry publish --registry https://registry.npmjs.org

- name: Publish to GitHub Packages
  run: pantry publish --registry https://npm.pkg.github.com
```

## Advanced Configuration

### Custom Audiences

By default, Pantry requests OIDC tokens with the audience `pantry`. You can customize this:

```bash
# Request token with custom audience
OIDC_AUDIENCE=custom-registry pantry publish
```

### Multiple Trusted Publishers

You can configure multiple trusted publishers for the same package:

```bash
# GitHub Actions
pantry publisher add --package my-pkg --type github-action --owner org1 --repository repo1

# GitLab CI
pantry publisher add --package my-pkg --type gitlab-ci --owner org2 --repository repo2

# List all
pantry publisher list --package my-pkg
```

### Conditional OIDC Usage

```yaml
- name: Publish
  run: |
    if [ -n "$GITHUB_ACTIONS" ]; then
      # Use OIDC in CI
      pantry publish
    else
      # Use traditional token locally
      pantry publish --no-oidc
    fi
  env:
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}  # Only for local/fallback
```

## API Reference

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_ACTIONS` | Indicates GitHub Actions environment | `true` |
| `ACTIONS_ID_TOKEN_REQUEST_URL` | OIDC token request URL (GitHub) | `https://...` |
| `ACTIONS_ID_TOKEN_REQUEST_TOKEN` | Request token (GitHub) | `***` |
| `CI_JOB_JWT_V2` | OIDC token (GitLab) | `eyJ...` |
| `BITBUCKET_STEP_OIDC_TOKEN` | OIDC token (Bitbucket) | `eyJ...` |
| `CIRCLE_OIDC_TOKEN` | OIDC token (CircleCI) | `eyJ...` |
| `NPM_TOKEN` | Fallback authentication token | `npm_...` |

### CLI Commands

```bash
# Publishing
pantry publish [options]

# Trusted Publisher Management
pantry publisher add [options]
pantry publisher list --package <name> [--json]
pantry publisher remove --package <name> --publisher-id <id>

# Help
pantry publish --help
pantry publisher --help
```

## Resources

- [OIDC Specification](https://openid.net/connect/)
- [SLSA Provenance](https://slsa.dev/provenance)
- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [GitLab CI OIDC](https://docs.gitlab.com/ee/ci/cloud_services/index.html)
- [npm Trusted Publishers](https://docs.npmjs.com/trusted-publishers)
- [Supply Chain Security](https://www.cisa.gov/supply-chain)

## Support

For issues or questions:
- GitHub Issues: https://github.com/pantry-sh/pantry/issues
- Documentation: https://pantry.sh/docs
- Community: https://discord.gg/pantry
