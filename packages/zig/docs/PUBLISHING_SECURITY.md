# Publishing & Security Guide

This guide covers pantry's comprehensive publishing and security features, including OIDC authentication, trusted publishers, SLSA provenance generation, and package signing.

## Table of Contents

- [Publishing Packages](#publishing-packages)
- [OIDC Authentication](#oidc-authentication)
- [Trusted Publishers](#trusted-publishers)
- [SLSA Provenance](#slsa-provenance)
- [Package Signing & Verification](#package-signing--verification)
- [Security Best Practices](#security-best-practices)

---

## Publishing Packages

### Basic Publishing

Publish a package to the registry:

```bash
pantry publish
```

### Publishing Options

```bash
pantry publish [options]

Options:
  --dry-run          Perform dry run without publishing
  --access <level>   Package access level (public/restricted)
  --tag <tag>        Publish with tag (default: latest)
  --otp <code>       One-time password for 2FA
  --registry <url>   Registry URL
  --provenance       Generate provenance (default: true)
```

### Examples

```bash
# Publish with default settings
pantry publish

# Dry run to preview what will be published
pantry publish --dry-run

# Publish as restricted (private) package
pantry publish --access restricted

# Publish with specific tag
pantry publish --tag beta

# Publish with 2FA
pantry publish --otp 123456

# Publish to custom registry
pantry publish --registry https://my-registry.com

# Publish without provenance
pantry publish --provenance false
```

---

## OIDC Authentication

Pantry supports OpenID Connect (OIDC) authentication for publishing packages from CI/CD environments without requiring long-lived tokens.

### Supported CI/CD Providers

- **GitHub Actions** ✓
- **GitLab CI** ✓
- **Azure Pipelines** ✓
- **Bitbucket Pipelines** ✓
- **CircleCI** ✓
- **Jenkins** ✓
- **Travis CI** ✓

### How It Works

1. Your CI/CD provider generates a short-lived OIDC token
2. Pantry automatically detects the provider and retrieves the token
3. The token is validated against the registry
4. Publishing proceeds with the authenticated identity

### GitHub Actions Setup

```yaml
name: Publish Package

on:
  release:
    types: [published]

permissions:
  id-token: write  # Required for OIDC
  contents: read

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pantry
        run: |
          curl -fsSL https://pantry.sh/install.sh | sh

      - name: Publish
        run: pantry publish
```

### GitLab CI Setup

```yaml
publish:
  image: node:20
  id_tokens:
    PANTRY_OIDC_TOKEN:
      aud: pantry
  script:
    - curl -fsSL https://pantry.sh/install.sh | sh
    - pantry publish
  only:
    - tags
```

### Azure Pipelines Setup

```yaml
trigger:
  tags:
    include:
      - v*

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: AzureCLI@2
    inputs:
      azureSubscription: 'your-subscription'
      scriptType: 'bash'
      scriptLocation: 'inlineScript'
      inlineScript: |
        curl -fsSL https://pantry.sh/install.sh | sh
        pantry publish
```

### Environment Variables

Pantry automatically detects OIDC tokens from these environment variables:

| Provider          | Environment Variable                |
|-------------------|-------------------------------------|
| GitHub Actions    | `ACTIONS_ID_TOKEN_REQUEST_TOKEN`    |
| GitLab CI         | `CI_JOB_JWT_V2`                     |
| Azure Pipelines   | `SYSTEM_OIDCTOKEN`                  |
| Bitbucket         | `BITBUCKET_STEP_OIDC_TOKEN`         |
| CircleCI          | `CIRCLE_OIDC_TOKEN`                 |
| Jenkins           | `JENKINS_OIDC_TOKEN`                |
| Travis CI         | `TRAVIS_OIDC_TOKEN`                 |

### Fallback Authentication

If OIDC is not available, pantry falls back to token authentication:

```bash
export NPM_TOKEN=your-npm-token
pantry publish
```

---

## Trusted Publishers

Trusted publishers allow you to restrict who can publish versions of your package based on CI/CD workflow identity.

### Benefits

- **No long-lived tokens**: Eliminate the security risk of stored tokens
- **Fine-grained control**: Restrict publishing to specific workflows and branches
- **Audit trail**: Clear provenance of who published each version
- **Automatic verification**: Registry validates identity before accepting packages

### Configuration

Add trusted publisher configuration to your `pantry.json`:

```json
{
  "name": "my-package",
  "version": "1.0.0",
  "trustedPublishers": [
    {
      "type": "github-action",
      "owner": "my-org",
      "repository": "my-repo",
      "workflow": ".github/workflows/release.yml",
      "environment": "production",
      "allowedRefs": ["refs/heads/main", "refs/tags/v*"]
    }
  ]
}
```

### Trusted Publisher Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Publisher type (`github-action`, `gitlab-ci`) |
| `owner` | string | Yes | Repository owner/organization |
| `repository` | string | Yes | Repository name |
| `workflow` | string | No | Workflow path (GitHub) or pipeline (GitLab) |
| `environment` | string | No | Environment name for protection rules |
| `allowedRefs` | array | No | Allowed branches/tags (null = all allowed) |

### GitHub Actions Trusted Publisher

```json
{
  "trustedPublishers": [
    {
      "type": "github-action",
      "owner": "acme-corp",
      "repository": "awesome-lib",
      "workflow": ".github/workflows/publish.yml",
      "allowedRefs": ["refs/tags/v*"]
    }
  ]
}
```

This configuration only allows publishing from:
- Repository: `acme-corp/awesome-lib`
- Workflow: `.github/workflows/publish.yml`
- Ref pattern: Tags starting with `v`

### GitLab CI Trusted Publisher

```json
{
  "trustedPublishers": [
    {
      "type": "gitlab-ci",
      "owner": "acme-corp",
      "repository": "awesome-lib",
      "allowedRefs": ["refs/heads/main"]
    }
  ]
}
```

### Validation Process

When publishing with OIDC:

1. Registry receives OIDC token with the package
2. Token claims are extracted and validated
3. Claims are matched against trusted publisher rules
4. If match succeeds, package is accepted
5. If no match, publishing is rejected

---

## SLSA Provenance

Pantry automatically generates [SLSA](https://slsa.dev/) (Supply-chain Levels for Software Artifacts) provenance for published packages.

### What is SLSA Provenance?

SLSA provenance provides a verifiable record of how a package was built, including:

- Build environment (CI/CD system)
- Source repository and commit
- Build workflow/pipeline
- Build timestamp
- Builder identity

### Generated Provenance Format

Pantry generates provenance in the [in-toto](https://in-toto.io/) statement format:

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
      "buildInvocationId": "workflow-run-123",
      "buildStartedOn": "2024-01-01T00:00:00Z",
      "buildFinishedOn": "2024-01-01T00:05:00Z"
    }
  }
}
```

### Automatic Generation

Provenance is automatically generated when:

1. Publishing from a supported CI/CD environment
2. OIDC authentication is used
3. `--provenance` flag is not set to `false`

### Viewing Provenance

Provenance is stored with the package metadata and can be retrieved:

```bash
# View package provenance
pantry show my-package --provenance

# Download provenance file
pantry provenance my-package@1.0.0 > provenance.json
```

---

## Package Signing & Verification

Pantry supports cryptographic signing and verification of packages using Ed25519 signatures.

### Generating a Signing Key

```bash
# Generate new Ed25519 keypair
pantry keygen

# Output:
# Public Key ID: 0123456789abcdef
# Public Key saved to: ~/.pantry/keys/0123456789abcdef.pub
# Private Key saved to: ~/.pantry/keys/0123456789abcdef.key
#
# Add this to your pantry.json:
# "keyId": "0123456789abcdef"
```

### Signing Packages

Sign a package tarball:

```bash
# Sign during publishing (automatic)
pantry publish

# Sign existing tarball
pantry sign my-package-1.0.0.tgz --key ~/.pantry/keys/0123456789abcdef.key

# Output:
# ✓ Package signed successfully
# Signature: signature.json
```

### Signature Format

```json
{
  "algorithm": "ed25519",
  "signature": "base64-encoded-signature",
  "keyId": "0123456789abcdef",
  "timestamp": 1704067200,
  "keyUrl": "https://keys.pantry.sh/0123456789abcdef.pub"
}
```

### Verifying Signatures

```bash
# Verify package signature
pantry verify my-package@1.0.0

# Verify with specific keyring
pantry verify my-package@1.0.0 --keyring ~/.pantry/trusted-keys/
```

### Managing Trusted Keys

```bash
# Add trusted key to keyring
pantry trust add --key-id 0123456789abcdef --key-file publisher.pub

# List trusted keys
pantry trust list

# Remove trusted key
pantry trust remove 0123456789abcdef

# Import key from URL
pantry trust add --key-url https://example.com/keys/publisher.pub
```

### Keyring Storage

Trusted keys are stored in `~/.pantry/keyring/`:

```
~/.pantry/
├── keyring/
│   ├── 0123456789abcdef.pub
│   ├── fedcba9876543210.pub
│   └── ...
└── keys/
    ├── my-key.key (private)
    └── my-key.pub (public)
```

---

## Security Best Practices

### 1. Use OIDC Over Tokens

✅ **Do**: Use OIDC authentication from CI/CD
```yaml
# GitHub Actions with OIDC
permissions:
  id-token: write
```

❌ **Don't**: Store long-lived tokens in CI/CD
```yaml
# Avoid this
env:
  NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 2. Configure Trusted Publishers

✅ **Do**: Restrict publishing to specific workflows
```json
{
  "trustedPublishers": [{
    "type": "github-action",
    "owner": "my-org",
    "repository": "my-repo",
    "workflow": ".github/workflows/release.yml",
    "allowedRefs": ["refs/tags/v*"]
  }]
}
```

### 3. Enable Provenance

✅ **Do**: Always generate provenance
```bash
pantry publish  # Provenance enabled by default
```

❌ **Don't**: Disable provenance without good reason
```bash
pantry publish --provenance false  # Only if absolutely necessary
```

### 4. Sign Your Packages

✅ **Do**: Sign packages with Ed25519
```bash
pantry publish --sign
```

### 5. Verify Dependencies

✅ **Do**: Verify signatures before installing
```bash
pantry install --verify-signatures
```

### 6. Use Environment Protection

✅ **Do**: Require manual approval for production
```yaml
# GitHub Actions
environment:
  name: production
  protection_rules:
    required_approvers: 1
```

### 7. Rotate Keys Regularly

✅ **Do**: Generate new signing keys periodically
```bash
# Every 6-12 months
pantry keygen --rotate
```

### 8. Audit Publishing Activity

✅ **Do**: Review package provenance regularly
```bash
pantry audit my-package --provenance
```

### 9. Use 2FA

✅ **Do**: Enable 2FA on registry account
```bash
pantry publish --otp 123456
```

### 10. Minimal Permissions

✅ **Do**: Grant only necessary permissions
```yaml
# GitHub Actions
permissions:
  id-token: write  # For OIDC
  contents: read   # For checkout
  # Nothing else
```

---

## Troubleshooting

### OIDC Token Not Found

**Error**: `OIDC authentication not available`

**Solutions**:
1. Ensure CI/CD permissions include `id-token: write`
2. Check environment variables are set correctly
3. Verify provider is supported
4. Fall back to token authentication if needed

### Trusted Publisher Validation Failed

**Error**: `Package rejected: trusted publisher validation failed`

**Solutions**:
1. Verify `trustedPublishers` configuration in package.json
2. Check workflow path matches exactly
3. Confirm repository owner/name are correct
4. Ensure ref (branch/tag) is in `allowedRefs`

### Signature Verification Failed

**Error**: `Signature verification failed`

**Solutions**:
1. Ensure public key is in keyring
2. Check signature hasn't been tampered with
3. Verify package integrity (checksum)
4. Confirm key ID matches

### Missing Provenance

**Issue**: No provenance generated

**Solutions**:
1. Ensure publishing from CI/CD (not local)
2. Verify OIDC authentication is working
3. Check `--provenance` flag isn't set to `false`
4. Confirm CI/CD provider is supported

---

## API Reference

### Publishing Module

```zig
const publish = @import("pantry/packages/publish.zig");

// Extract package metadata
const metadata = try publish.extractMetadata(allocator, "pantry.json");
defer metadata.deinit(allocator);

// Validate package name
try publish.validatePackageName("my-package");

// Validate version
try publish.validateVersion("1.0.0");
```

### OIDC Module

```zig
const oidc = @import("pantry/auth/oidc.zig");

// Detect CI/CD provider
var provider = try oidc.detectProvider(allocator) orelse return null;
defer provider.deinit(allocator);

// Get OIDC token
const token_str = try oidc.getTokenFromEnvironment(allocator, &provider);
defer allocator.free(token_str);

// Decode token
var token = try oidc.decodeTokenUnsafe(allocator, token_str);
defer token.deinit(allocator);

// Validate expiration
try oidc.validateExpiration(&token.claims);
```

### Signing Module

```zig
const signing = @import("pantry/auth/signing.zig");

// Generate keypair
const keypair = try signing.generateEd25519KeyPair(allocator);
defer allocator.free(keypair.public_key_pem);
defer allocator.free(keypair.key_id);

// Sign package
var signature = try signing.signPackageEd25519(
    allocator,
    package_data,
    keypair.private_key_seed,
);
defer signature.deinit(allocator);

// Create keyring
var keyring = signing.Keyring.init(allocator);
defer keyring.deinit();

// Add key
try keyring.addKey(keypair.key_id, keypair.public_key_pem);

// Verify signature
try signing.verifyPackageSignature(package_data, &signature, &keyring);
```

---

## Additional Resources

- [SLSA Framework](https://slsa.dev/)
- [in-toto Attestations](https://in-toto.io/)
- [OpenID Connect](https://openid.net/connect/)
- [Ed25519 Signatures](https://ed25519.cr.yp.to/)
- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [GitLab CI OIDC](https://docs.gitlab.com/ee/ci/cloud_services/index.html)

---

## License

MIT License - See LICENSE file for details
