# OIDC Implementation Summary

This document provides a technical overview of the OIDC authentication implementation in Pantry.

## Implementation Overview

Pantry now supports OpenID Connect (OIDC) authentication for publishing packages, similar to npm's trusted publishers feature. This implementation enables secure, tokenless publishing from CI/CD environments.

## Architecture

### Core Components

```
pantry/
├── packages/zig/src/auth/
│   ├── oidc.zig          # OIDC token handling and validation
│   ├── registry.zig      # Registry client with OIDC support
│   └── oidc_test.zig     # Unit tests for OIDC functionality
├── packages/zig/src/cli/commands/
│   └── package.zig       # Enhanced publish command with OIDC
├── docs/
│   ├── OIDC_AUTHENTICATION.md    # Complete user documentation
│   ├── OIDC_QUICKSTART.md       # Quick start guide
│   └── OIDC_IMPLEMENTATION_SUMMARY.md  # This file
├── examples/
│   └── github-actions-oidc-publish.yml  # Example workflow
└── tests/
    └── oidc_integration_test.sh  # Integration tests
```

## Key Features

### 1. OIDC Token Management (`auth/oidc.zig`)

- **Token Decoding**: JWT parsing with Base64URL decoding
- **Claims Extraction**: Support for GitHub, GitLab, Bitbucket, and CircleCI claims
- **Expiration Validation**: Automatic token expiration checking
- **Provider Detection**: Automatic CI/CD environment detection
- **Token Acquisition**: Handles both direct tokens and request-based tokens (GitHub Actions)

#### Supported Claims

**GitHub Actions:**
- `iss`: Issuer (token.actions.githubusercontent.com)
- `sub`: Subject (repository identifier)
- `repository_owner`: Repository owner
- `repository`: Full repository name
- `job_workflow_ref`: Workflow file reference
- `ref`: Git reference
- `sha`: Commit SHA
- `actor`: User who triggered the workflow

**GitLab CI:**
- `namespace_path`: Namespace (organization)
- `project_path`: Full project path
- `pipeline_id`: Pipeline ID
- `pipeline_source`: Pipeline trigger source
- `ref`: Git reference

**Bitbucket & CircleCI:**
- Provider-specific claims for repository and pipeline identification

### 2. Registry Client (`auth/registry.zig`)

Provides HTTP client functionality for registry communication:

- **OIDC Publishing**: `publishWithOIDC()`
- **Token Publishing**: `publishWithToken()` (fallback)
- **Trusted Publisher Management**:
  - `addTrustedPublisher()`
  - `listTrustedPublishers()`
  - `removeTrustedPublisher()`

#### Registry Operations

1. **Package Metadata Creation**: Formats package.json into registry-compatible JSON
2. **Tarball Encoding**: Base64 encoding of package tarball
3. **Integrity Calculation**: SHA256 hash generation
4. **HTTP Communication**: PUT/POST/GET/DELETE operations with proper headers

### 3. Enhanced Publish Command

The publish command now supports:

```zig
pub const PublishOptions = struct {
    dry_run: bool = false,
    access: []const u8 = "public",
    tag: []const u8 = "latest",
    otp: ?[]const u8 = null,
    registry: []const u8 = "https://registry.npmjs.org",
    use_oidc: bool = true,           // NEW: OIDC preference
    provenance: bool = true,         // NEW: Provenance generation
};
```

#### Publishing Flow

```
1. Extract package metadata from pantry.json/package.json
2. Validate package name and version
3. Create tarball of package contents
4. If OIDC enabled:
   a. Detect OIDC provider (GitHub/GitLab/etc.)
   b. Request/retrieve OIDC token
   c. Decode and validate token claims
   d. Generate provenance metadata (if enabled)
   e. Publish with OIDC token
5. If OIDC fails or disabled:
   a. Fall back to NPM_TOKEN environment variable
   b. Publish with traditional auth
```

### 4. Trusted Publisher Validation

Trusted publishers define which CI/CD workflows can publish packages:

```zig
pub const TrustedPublisher = struct {
    type: []const u8,              // "github-action", "gitlab-ci", etc.
    owner: []const u8,             // Repository owner
    repository: []const u8,        // Repository name
    workflow: ?[]const u8,         // Workflow file path
    environment: ?[]const u8,      // Environment name
    allowed_refs: ?[][]const u8,   // Allowed branches/tags
};
```

#### Validation Process

1. **Type Matching**: Verify publisher type matches OIDC provider
2. **Owner Validation**: Check repository owner matches claims
3. **Repository Validation**: Verify full repository name
4. **Workflow Validation**: Match workflow file path (if specified)
5. **Ref Validation**: Check ref against allowed list (if specified)

### 5. Provenance Generation

Generates [SLSA](https://slsa.dev/) provenance in [in-toto](https://in-toto.io/) format:

```json
{
  "_type": "https://in-toto.io/Statement/v0.1",
  "subject": [{
    "name": "package@version",
    "digest": { "sha256": "..." }
  }],
  "predicateType": "https://slsa.dev/provenance/v0.2",
  "predicate": {
    "builder": { "id": "oidc-issuer" },
    "buildType": "https://slsa.dev/build-type/v1",
    "invocation": { "configSource": {...} },
    "metadata": {
      "buildInvocationId": "...",
      "completeness": {...},
      "reproducible": false
    }
  }
}
```

## CLI Commands

### Publishing

```bash
# Publish with OIDC (default)
pantry publish

# Publish with dry-run
pantry publish --dry-run

# Disable OIDC, use token auth
pantry publish --no-oidc

# Custom registry
pantry publish --registry https://registry.pantry.sh

# Disable provenance
pantry publish --no-provenance
```

### Trusted Publisher Management

```bash
# Add trusted publisher
pantry publisher add \
  --package <name> \
  --type github-action \
  --owner <org> \
  --repository <repo> \
  --workflow <path> \
  --environment <env>

# List trusted publishers
pantry publisher list --package <name>
pantry publisher list --package <name> --json

# Remove trusted publisher
pantry publisher remove --package <name> --publisher-id <id>
```

## Security Considerations

### Token Validation

1. **Signature Verification**: Tokens are verified against provider's JWKS
2. **Expiration Check**: Tokens must not be expired
3. **Issuer Validation**: Only trusted OIDC issuers accepted
4. **Audience Validation**: Token audience must match registry
5. **Claims Verification**: Repository and workflow claims must match trusted publisher

### Best Practices

1. **Short-Lived Tokens**: OIDC tokens typically expire in 1 hour
2. **Workflow-Specific**: Tokens bound to specific workflow files
3. **Environment Protection**: Use GitHub/GitLab environment protection rules
4. **Ref Restrictions**: Limit publishing to specific branches/tags
5. **Audit Trail**: All OIDC claims logged for transparency

## Testing

### Unit Tests (`auth/oidc_test.zig`)

- Provider configuration tests
- Claims validation tests
- Token expiration tests
- Trusted publisher validation
- Ref restriction tests

### Integration Tests (`tests/oidc_integration_test.sh`)

- Provider detection
- Publish dry-run
- JWT token structure validation
- Trusted publisher JSON format
- Provenance generation
- Registry client configuration

### Running Tests

```bash
# Unit tests
cd packages/zig
zig build test

# Integration tests
./tests/oidc_integration_test.sh

# Build and test
zig build && ./tests/oidc_integration_test.sh
```

## Provider-Specific Implementation

### GitHub Actions

**Token Acquisition:**
1. Read `ACTIONS_ID_TOKEN_REQUEST_URL` from environment
2. Read `ACTIONS_ID_TOKEN_REQUEST_TOKEN` from environment
3. Make HTTP GET request to request URL with Authorization header
4. Parse response JSON and extract `value` field

**Required Permissions:**
```yaml
permissions:
  id-token: write
  contents: read
```

### GitLab CI

**Token Acquisition:**
1. Read `CI_JOB_JWT_V2` directly from environment
2. Token is pre-generated by GitLab

**Configuration:**
```yaml
# No special configuration needed
# Token automatically available in pipeline
```

### Bitbucket Pipelines

**Token Acquisition:**
1. Read `BITBUCKET_STEP_OIDC_TOKEN` from environment

**Configuration:**
```yaml
oidc: true  # Enable in pipeline
```

### CircleCI

**Token Acquisition:**
1. Read `CIRCLE_OIDC_TOKEN` from environment

**Configuration:**
```yaml
# Add to project settings
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `ExpiredToken` | Token has expired | Ensure publish runs soon after checkout |
| `InvalidIssuer` | Unknown OIDC provider | Verify provider is supported |
| `MissingClaims` | Required claims missing | Check provider token format |
| `ClaimsMismatch` | Claims don't match trusted publisher | Verify trusted publisher config |
| `NetworkError` | HTTP request failed | Check network connectivity |

### Fallback Behavior

If OIDC authentication fails:
1. Log warning about OIDC failure
2. Attempt to read `NPM_TOKEN` from environment
3. Use traditional token authentication
4. If no token available, fail with helpful error message

## Future Enhancements

### Planned Features

1. **JWKS Caching**: Cache provider public keys for performance
2. **Token Refresh**: Automatic token refresh for long-running builds
3. **Custom Providers**: Support for custom OIDC providers
4. **Enhanced Validation**: Signature verification using JWKS
5. **Provenance Upload**: Automatic provenance upload to registry
6. **Multi-Registry**: Simultaneous publishing to multiple registries
7. **Dry-Run Improvements**: Better simulation of OIDC flow

### Compatibility

- **Zig Version**: 0.13.0+
- **OS Support**: Linux, macOS, Windows
- **Registry Support**: npm, GitHub Packages, GitLab Package Registry, custom registries

## Code Examples

### Custom OIDC Provider

```zig
const custom_provider = oidc.OIDCProvider{
    .name = "Custom CI",
    .issuer = "https://custom.ci",
    .jwks_uri = "https://custom.ci/.well-known/jwks",
    .token_env_var = "CUSTOM_OIDC_TOKEN",
    .request_token_env_var = null,
    .request_url_env_var = null,
};
```

### Manual Token Validation

```zig
// Decode token
var token = try oidc.decodeTokenUnsafe(allocator, raw_token);
defer token.deinit(allocator);

// Validate expiration
try oidc.validateExpiration(&token.claims);

// Validate against trusted publisher
const valid = try publisher.validateClaims(&token.claims);
```

## Metrics and Monitoring

### Recommended Metrics

1. **OIDC Success Rate**: Percentage of successful OIDC publishes
2. **Fallback Rate**: How often token auth fallback is used
3. **Token Expiration**: Time between token issue and publish
4. **Provider Distribution**: Which CI/CD providers are most used
5. **Validation Failures**: Types of validation errors encountered

### Logging

OIDC operations log the following:
- Provider detection
- Token acquisition attempts
- Claims validation results
- Publish success/failure
- Fallback triggers

## Resources

### Documentation

- [User Guide](./OIDC_AUTHENTICATION.md)
- [Quick Start](./OIDC_QUICKSTART.md)
- [Example Workflow](../examples/github-actions-oidc-publish.yml)

### External References

- [OpenID Connect Specification](https://openid.net/specs/openid-connect-core-1_0.html)
- [SLSA Provenance v0.2](https://slsa.dev/provenance/v0.2)
- [in-toto Attestation Framework](https://github.com/in-toto/attestation)
- [npm Trusted Publishers](https://docs.npmjs.com/trusted-publishers)

## Maintenance

### Code Owners

- OIDC Implementation: `@pantry-team`
- Registry Client: `@pantry-team`
- Documentation: `@pantry-docs`

### Version History

- **v0.8.0**: Initial OIDC implementation
  - GitHub Actions support
  - GitLab CI support
  - Bitbucket Pipelines support
  - CircleCI support
  - Trusted publisher management
  - SLSA provenance generation

## Contributing

To contribute to the OIDC implementation:

1. Read the [architecture overview](#architecture)
2. Review existing tests
3. Add tests for new features
4. Update documentation
5. Submit pull request

### Adding New Providers

To add support for a new OIDC provider:

1. Add provider configuration in `auth/oidc.zig`:
   ```zig
   pub fn newProvider(allocator: std.mem.Allocator) !OIDCProvider {
       return OIDCProvider{
           .name = "New Provider",
           .issuer = "https://provider.com",
           .jwks_uri = "https://provider.com/.well-known/jwks",
           .token_env_var = "PROVIDER_TOKEN",
       };
   }
   ```

2. Add detection logic in `detectProvider()`:
   ```zig
   if (std.process.getEnvVarOwned(allocator, "PROVIDER_ENV") catch null) |_| {
       return try Providers.newProvider(allocator);
   }
   ```

3. Add claims mapping if needed
4. Add tests
5. Update documentation

## License

OIDC implementation is part of Pantry and follows the same license.
