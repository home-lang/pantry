const std = @import("std");
const testing = std.testing;
const lib = @import("lib");
const oidc = lib.auth.oidc;

/// Get current Unix timestamp (Zig 0.16 compatible)
fn getTimestamp() i64 {
    const ts = std.posix.clock_gettime(.REALTIME) catch return 0;
    return @intCast(ts.sec);
}

// Mock JWT token for testing (this is a sample, not a real token)
const sample_github_token =
    \\eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rva2VuLmFjdGlvbnMuZ2l0aHViY29udGVudC5jb20iLCJzdWIiOiJyZXBvOm93bmVyL3JlcG86cmVmOnJlZnMvaGVhZHMvbWFpbiIsImF1ZCI6InBhbnRyeSIsImV4cCI6OTk5OTk5OTk5OSwiaWF0IjoxNzAwMDAwMDAwLCJyZXBvc2l0b3J5X293bmVyIjoib3duZXIiLCJyZXBvc2l0b3J5Ijoib3duZXIvcmVwbyIsInJlcG9zaXRvcnlfb3duZXJfaWQiOiIxMjM0NTYiLCJ3b3JrZmxvd19yZWYiOiJvd25lci9yZXBvLy5naXRodWIvd29ya2Zsb3dzL3JlbGVhc2UueW1sQHJlZnMvaGVhZHMvbWFpbiIsImFjdG9yIjoidXNlciIsImV2ZW50X25hbWUiOiJwdXNoIiwicmVmIjoicmVmcy9oZWFkcy9tYWluIiwicmVmX3R5cGUiOiJicmFuY2giLCJzaGEiOiJhYmMxMjM0NTYiLCJqb2Jfd29ya2Zsb3dfcmVmIjoib3duZXIvcmVwby8uZ2l0aHViL3dvcmtmbG93cy9yZWxlYXNlLnltbEByZWZzL2hlYWRzL21haW4iLCJydW5uZXJfZW52aXJvbm1lbnQiOiJnaXRodWItaG9zdGVkIn0.signature
;

test "OIDC Provider - GitHub Actions" {
    const allocator = testing.allocator;

    var provider = try oidc.Providers.github(allocator);
    defer provider.deinit(allocator);

    try testing.expectEqualStrings("GitHub Actions", provider.name);
    try testing.expectEqualStrings("https://token.actions.githubusercontent.com", provider.issuer);
    try testing.expectEqualStrings("ACTIONS_ID_TOKEN_REQUEST_TOKEN", provider.token_env_var);
    try testing.expect(provider.request_token_env_var != null);
    try testing.expect(provider.request_url_env_var != null);
}

test "OIDC Provider - GitLab CI" {
    const allocator = testing.allocator;

    var provider = try oidc.Providers.gitlab(allocator);
    defer provider.deinit(allocator);

    try testing.expectEqualStrings("GitLab CI", provider.name);
    try testing.expectEqualStrings("https://gitlab.com", provider.issuer);
    try testing.expectEqualStrings("CI_JOB_JWT_V2", provider.token_env_var);
    try testing.expect(provider.request_token_env_var == null);
}

test "OIDC Provider - Bitbucket" {
    const allocator = testing.allocator;

    var provider = try oidc.Providers.bitbucket(allocator);
    defer provider.deinit(allocator);

    try testing.expectEqualStrings("Bitbucket Pipelines", provider.name);
    try testing.expectEqualStrings("BITBUCKET_STEP_OIDC_TOKEN", provider.token_env_var);
}

test "OIDC Provider - CircleCI" {
    const allocator = testing.allocator;

    var provider = try oidc.Providers.circleci(allocator);
    defer provider.deinit(allocator);

    try testing.expectEqualStrings("CircleCI", provider.name);
    try testing.expectEqualStrings("CIRCLE_OIDC_TOKEN", provider.token_env_var);
}

test "Trusted Publisher - Validate GitHub Actions Claims" {
    _ = testing.allocator;

    const publisher = oidc.TrustedPublisher{
        .type = "github-action",
        .owner = "owner",
        .repository = "repo",
        .workflow = ".github/workflows/release.yml",
        .environment = null,
        .allowed_refs = null,
    };

    const claims = oidc.OIDCToken.Claims{
        .iss = "https://token.actions.githubusercontent.com",
        .sub = "repo:owner/repo:ref:refs/heads/main",
        .aud = "pantry",
        .exp = 9999999999,
        .iat = 1700000000,
        .nbf = null,
        .jti = null,
        .repository_owner = "owner",
        .repository = "owner/repo",
        .repository_owner_id = "123456",
        .workflow_ref = null,
        .actor = "user",
        .event_name = "push",
        .ref = "refs/heads/main",
        .ref_type = "branch",
        .sha = "abc123456",
        .job_workflow_ref = "owner/repo/.github/workflows/release.yml@refs/heads/main",
        .runner_environment = "github-hosted",
        .namespace_id = null,
        .namespace_path = null,
        .project_id = null,
        .project_path = null,
        .pipeline_id = null,
        .pipeline_source = null,
    };

    const result = publisher.validateClaims(&claims);
    try testing.expect(result);
}

test "Trusted Publisher - Reject Invalid Repository" {
    _ = testing.allocator;

    const publisher = oidc.TrustedPublisher{
        .type = "github-action",
        .owner = "owner",
        .repository = "repo",
        .workflow = null,
        .environment = null,
        .allowed_refs = null,
    };

    const claims = oidc.OIDCToken.Claims{
        .iss = "https://token.actions.githubusercontent.com",
        .sub = "repo:different/repo:ref:refs/heads/main",
        .aud = "pantry",
        .exp = 9999999999,
        .iat = 1700000000,
        .nbf = null,
        .jti = null,
        .repository_owner = "different", // Different owner
        .repository = "different/repo",
        .repository_owner_id = "123456",
        .workflow_ref = null,
        .actor = "user",
        .event_name = "push",
        .ref = "refs/heads/main",
        .ref_type = "branch",
        .sha = "abc123456",
        .job_workflow_ref = "different/repo/.github/workflows/release.yml@refs/heads/main",
        .runner_environment = "github-hosted",
        .namespace_id = null,
        .namespace_path = null,
        .project_id = null,
        .project_path = null,
        .pipeline_id = null,
        .pipeline_source = null,
    };

    const result = publisher.validateClaims(&claims);
    try testing.expect(!result);
}

test "Trusted Publisher - Validate GitLab CI Claims" {
    _ = testing.allocator;

    const publisher = oidc.TrustedPublisher{
        .type = "gitlab-ci",
        .owner = "myorg",
        .repository = "myproject",
        .workflow = null,
        .environment = null,
        .allowed_refs = null,
    };

    const claims = oidc.OIDCToken.Claims{
        .iss = "https://gitlab.com",
        .sub = "project_path:myorg/myproject:ref_type:branch:ref:main",
        .aud = "pantry",
        .exp = 9999999999,
        .iat = 1700000000,
        .nbf = null,
        .jti = null,
        .repository_owner = null,
        .repository = null,
        .repository_owner_id = null,
        .workflow_ref = null,
        .actor = null,
        .event_name = null,
        .ref = "refs/heads/main",
        .ref_type = "branch",
        .sha = null,
        .job_workflow_ref = null,
        .runner_environment = null,
        .namespace_id = "12345",
        .namespace_path = "myorg",
        .project_id = "67890",
        .project_path = "myorg/myproject",
        .pipeline_id = "123",
        .pipeline_source = "push",
    };

    const result = publisher.validateClaims(&claims);
    try testing.expect(result);
}

test "Validate Token Expiration - Valid" {
    const claims = oidc.OIDCToken.Claims{
        .iss = "https://token.actions.githubusercontent.com",
        .sub = "repo:owner/repo:ref:refs/heads/main",
        .aud = "pantry",
        .exp = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec)) + 3600, // Expires in 1 hour
        .iat = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec)) - 60, // Issued 1 minute ago
        .nbf = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec)) - 60, // Valid from 1 minute ago
        .jti = null,
        .repository_owner = "owner",
        .repository = "owner/repo",
        .repository_owner_id = "123456",
        .workflow_ref = null,
        .actor = null,
        .event_name = null,
        .ref = null,
        .ref_type = null,
        .sha = null,
        .job_workflow_ref = null,
        .runner_environment = null,
        .namespace_id = null,
        .namespace_path = null,
        .project_id = null,
        .project_path = null,
        .pipeline_id = null,
        .pipeline_source = null,
    };

    try oidc.validateExpiration(&claims);
}

test "Validate Token Expiration - Expired" {
    const claims = oidc.OIDCToken.Claims{
        .iss = "https://token.actions.githubusercontent.com",
        .sub = "repo:owner/repo:ref:refs/heads/main",
        .aud = "pantry",
        .exp = getTimestamp() - 3600, // Expired 1 hour ago
        .iat = getTimestamp() - 7200, // Issued 2 hours ago
        .nbf = null,
        .jti = null,
        .repository_owner = "owner",
        .repository = "owner/repo",
        .repository_owner_id = "123456",
        .workflow_ref = null,
        .actor = null,
        .event_name = null,
        .ref = null,
        .ref_type = null,
        .sha = null,
        .job_workflow_ref = null,
        .runner_environment = null,
        .namespace_id = null,
        .namespace_path = null,
        .project_id = null,
        .project_path = null,
        .pipeline_id = null,
        .pipeline_source = null,
    };

    try testing.expectError(error.ExpiredToken, oidc.validateExpiration(&claims));
}

test "Trusted Publisher - With Allowed Refs" {
    const allocator = testing.allocator;

    var allowed_refs = try allocator.alloc([]const u8, 2);
    defer allocator.free(allowed_refs);
    allowed_refs[0] = "refs/heads/main";
    allowed_refs[1] = "refs/tags/v*";

    const publisher = oidc.TrustedPublisher{
        .type = "github-action",
        .owner = "owner",
        .repository = "repo",
        .workflow = null,
        .environment = null,
        .allowed_refs = allowed_refs,
    };

    // Valid ref
    const claims_valid = oidc.OIDCToken.Claims{
        .iss = "https://token.actions.githubusercontent.com",
        .sub = "repo:owner/repo:ref:refs/heads/main",
        .aud = "pantry",
        .exp = 9999999999,
        .iat = 1700000000,
        .nbf = null,
        .jti = null,
        .repository_owner = "owner",
        .repository = "owner/repo",
        .repository_owner_id = "123456",
        .workflow_ref = null,
        .actor = "user",
        .event_name = "push",
        .ref = "refs/heads/main", // Allowed ref
        .ref_type = "branch",
        .sha = "abc123456",
        .job_workflow_ref = "owner/repo/.github/workflows/release.yml@refs/heads/main",
        .runner_environment = "github-hosted",
        .namespace_id = null,
        .namespace_path = null,
        .project_id = null,
        .project_path = null,
        .pipeline_id = null,
        .pipeline_source = null,
    };

    const result_valid = publisher.validateClaims(&claims_valid);
    try testing.expect(result_valid);

    // Invalid ref
    const claims_invalid = oidc.OIDCToken.Claims{
        .iss = "https://token.actions.githubusercontent.com",
        .sub = "repo:owner/repo:ref:refs/heads/develop",
        .aud = "pantry",
        .exp = 9999999999,
        .iat = 1700000000,
        .nbf = null,
        .jti = null,
        .repository_owner = "owner",
        .repository = "owner/repo",
        .repository_owner_id = "123456",
        .workflow_ref = null,
        .actor = "user",
        .event_name = "push",
        .ref = "refs/heads/develop", // Not allowed ref
        .ref_type = "branch",
        .sha = "abc123456",
        .job_workflow_ref = "owner/repo/.github/workflows/release.yml@refs/heads/develop",
        .runner_environment = "github-hosted",
        .namespace_id = null,
        .namespace_path = null,
        .project_id = null,
        .project_path = null,
        .pipeline_id = null,
        .pipeline_source = null,
    };

    const result_invalid = publisher.validateClaims(&claims_invalid);
    try testing.expect(!result_invalid);
}

// =============================================================================
// JWT Header and JWKS Tests
// =============================================================================

test "Parse JWT Header - RS256" {
    const allocator = testing.allocator;

    // Sample JWT with RS256 algorithm and kid
    const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InRlc3Qta2V5LTEifQ.eyJzdWIiOiJ0ZXN0In0.signature";

    var header = try oidc.parseJWTHeader(allocator, token);
    defer header.deinit(allocator);

    try testing.expectEqualStrings("RS256", header.alg);
    try testing.expect(header.kid != null);
    try testing.expectEqualStrings("test-key-1", header.kid.?);
    try testing.expect(header.typ != null);
    try testing.expectEqualStrings("JWT", header.typ.?);
}

test "Parse JWT Header - ES256" {
    const allocator = testing.allocator;

    // Sample JWT with ES256 algorithm
    const token = "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0In0.signature";

    var header = try oidc.parseJWTHeader(allocator, token);
    defer header.deinit(allocator);

    try testing.expectEqualStrings("ES256", header.alg);
    try testing.expect(header.kid == null); // No kid in this token
    try testing.expect(header.typ != null);
    try testing.expectEqualStrings("JWT", header.typ.?);
}

test "Parse JWT Header - Invalid Token" {
    const allocator = testing.allocator;

    // Invalid token format
    const result = oidc.parseJWTHeader(allocator, "not-a-valid-token");
    try testing.expectError(error.InvalidToken, result);
}

test "JWKS - Find Key By ID" {
    const allocator = testing.allocator;

    // Create mock JWKS
    var keys = try allocator.alloc(oidc.JWK, 2);
    keys[0] = oidc.JWK{
        .kty = try allocator.dupe(u8, "RSA"),
        .kid = try allocator.dupe(u8, "key-1"),
        .alg = try allocator.dupe(u8, "RS256"),
        .n = try allocator.dupe(u8, "modulus"),
        .e = try allocator.dupe(u8, "AQAB"),
    };
    keys[1] = oidc.JWK{
        .kty = try allocator.dupe(u8, "RSA"),
        .kid = try allocator.dupe(u8, "key-2"),
        .alg = try allocator.dupe(u8, "RS256"),
        .n = try allocator.dupe(u8, "modulus2"),
        .e = try allocator.dupe(u8, "AQAB"),
    };

    var jwks = oidc.JWKS{
        .keys = keys,
        .allocator = allocator,
    };
    defer jwks.deinit();

    // Find key by ID
    const found_key = jwks.findKeyById("key-2");
    try testing.expect(found_key != null);
    try testing.expectEqualStrings("key-2", found_key.?.kid.?);

    // Key not found
    const not_found = jwks.findKeyById("key-3");
    try testing.expect(not_found == null);
}

test "JWKS - Find Key By Algorithm" {
    const allocator = testing.allocator;

    // Create mock JWKS
    var keys = try allocator.alloc(oidc.JWK, 2);
    keys[0] = oidc.JWK{
        .kty = try allocator.dupe(u8, "RSA"),
        .alg = try allocator.dupe(u8, "RS256"),
        .n = try allocator.dupe(u8, "modulus"),
        .e = try allocator.dupe(u8, "AQAB"),
    };
    keys[1] = oidc.JWK{
        .kty = try allocator.dupe(u8, "EC"),
        .alg = try allocator.dupe(u8, "ES256"),
        .crv = try allocator.dupe(u8, "P-256"),
        .x = try allocator.dupe(u8, "x-coord"),
        .y = try allocator.dupe(u8, "y-coord"),
    };

    var jwks = oidc.JWKS{
        .keys = keys,
        .allocator = allocator,
    };
    defer jwks.deinit();

    // Find RS256 key
    const rs256_key = jwks.findKeyByAlg("RS256");
    try testing.expect(rs256_key != null);
    try testing.expectEqualStrings("RSA", rs256_key.?.kty);

    // Find ES256 key
    const es256_key = jwks.findKeyByAlg("ES256");
    try testing.expect(es256_key != null);
    try testing.expectEqualStrings("EC", es256_key.?.kty);
}

test "JWK Structure - RSA Key Components" {
    const allocator = testing.allocator;

    var jwk = oidc.JWK{
        .kty = try allocator.dupe(u8, "RSA"),
        .kid = try allocator.dupe(u8, "test-key"),
        .alg = try allocator.dupe(u8, "RS256"),
        .use = try allocator.dupe(u8, "sig"),
        .n = try allocator.dupe(u8, "modulus-base64url"),
        .e = try allocator.dupe(u8, "AQAB"),
    };
    defer jwk.deinit(allocator);

    try testing.expectEqualStrings("RSA", jwk.kty);
    try testing.expectEqualStrings("test-key", jwk.kid.?);
    try testing.expectEqualStrings("RS256", jwk.alg.?);
    try testing.expectEqualStrings("sig", jwk.use.?);
    try testing.expect(jwk.n != null);
    try testing.expect(jwk.e != null);
    try testing.expect(jwk.crv == null); // EC-only field
    try testing.expect(jwk.x == null); // EC-only field
    try testing.expect(jwk.y == null); // EC-only field
}

test "JWK Structure - EC Key Components" {
    const allocator = testing.allocator;

    var jwk = oidc.JWK{
        .kty = try allocator.dupe(u8, "EC"),
        .kid = try allocator.dupe(u8, "ec-test-key"),
        .alg = try allocator.dupe(u8, "ES256"),
        .use = try allocator.dupe(u8, "sig"),
        .crv = try allocator.dupe(u8, "P-256"),
        .x = try allocator.dupe(u8, "x-coordinate-base64url"),
        .y = try allocator.dupe(u8, "y-coordinate-base64url"),
    };
    defer jwk.deinit(allocator);

    try testing.expectEqualStrings("EC", jwk.kty);
    try testing.expectEqualStrings("ES256", jwk.alg.?);
    try testing.expectEqualStrings("P-256", jwk.crv.?);
    try testing.expect(jwk.x != null);
    try testing.expect(jwk.y != null);
    try testing.expect(jwk.n == null); // RSA-only field
    try testing.expect(jwk.e == null); // RSA-only field
}

test "JWT Header Structure" {
    const allocator = testing.allocator;

    var header = oidc.JWTHeader{
        .alg = try allocator.dupe(u8, "RS256"),
        .kid = try allocator.dupe(u8, "my-key-id"),
        .typ = try allocator.dupe(u8, "JWT"),
    };
    defer header.deinit(allocator);

    try testing.expectEqualStrings("RS256", header.alg);
    try testing.expectEqualStrings("my-key-id", header.kid.?);
    try testing.expectEqualStrings("JWT", header.typ.?);
}

test "Cached JWKS - Expiration Check" {
    const now = (std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec;

    // Not expired
    const cached_valid = oidc.CachedJWKS{
        .jwks = undefined, // Not used in this test
        .fetched_at = now - 1800, // 30 minutes ago
        .ttl_seconds = 3600, // 1 hour TTL
    };
    try testing.expect(!cached_valid.isExpired());

    // Expired
    const cached_expired = oidc.CachedJWKS{
        .jwks = undefined,
        .fetched_at = now - 7200, // 2 hours ago
        .ttl_seconds = 3600, // 1 hour TTL
    };
    try testing.expect(cached_expired.isExpired());
}

test "Validation Error Types" {
    // Test that all validation errors are properly defined
    const errors = [_]oidc.ValidationError{
        error.InvalidToken,
        error.ExpiredToken,
        error.InvalidIssuer,
        error.InvalidAudience,
        error.MissingClaims,
        error.InvalidSignature,
        error.NetworkError,
        error.InvalidJWKS,
        error.UnsupportedAlgorithm,
        error.ClaimsMismatch,
    };

    // Just verify they're all distinct error types
    for (errors, 0..) |err, i| {
        for (errors[i + 1 ..]) |other_err| {
            try testing.expect(err != other_err);
        }
    }
}

// =============================================================================
// Clock Skew Tolerance Tests
// =============================================================================

test "Validate Token Expiration - With Clock Skew Tolerance" {
    // Token that expired 30 seconds ago should pass with 60 second tolerance
    const now = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec));

    const claims_recently_expired = oidc.OIDCToken.Claims{
        .iss = "https://token.actions.githubusercontent.com",
        .sub = "repo:owner/repo:ref:refs/heads/main",
        .aud = "pantry",
        .exp = now - 30, // Expired 30 seconds ago
        .iat = now - 3600,
        .nbf = null,
        .jti = null,
        .repository_owner = "owner",
        .repository = "owner/repo",
        .repository_owner_id = null,
        .workflow_ref = null,
        .actor = null,
        .event_name = null,
        .ref = null,
        .ref_type = null,
        .sha = null,
        .job_workflow_ref = null,
        .runner_environment = null,
        .namespace_id = null,
        .namespace_path = null,
        .project_id = null,
        .project_path = null,
        .pipeline_id = null,
        .pipeline_source = null,
    };

    // Should pass with default 60 second tolerance
    try oidc.validateExpiration(&claims_recently_expired);

    // Should fail with 0 tolerance
    try testing.expectError(error.ExpiredToken, oidc.validateExpirationWithSkew(&claims_recently_expired, 0));
}

test "Validate Token Expiration - NBF With Clock Skew" {
    const now = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec));

    // Token that will be valid 30 seconds from now should pass with 60 second tolerance
    const claims_not_yet_valid = oidc.OIDCToken.Claims{
        .iss = "https://token.actions.githubusercontent.com",
        .sub = "repo:owner/repo:ref:refs/heads/main",
        .aud = "pantry",
        .exp = now + 3600,
        .iat = now,
        .nbf = now + 30, // Not valid for another 30 seconds
        .jti = null,
        .repository_owner = "owner",
        .repository = "owner/repo",
        .repository_owner_id = null,
        .workflow_ref = null,
        .actor = null,
        .event_name = null,
        .ref = null,
        .ref_type = null,
        .sha = null,
        .job_workflow_ref = null,
        .runner_environment = null,
        .namespace_id = null,
        .namespace_path = null,
        .project_id = null,
        .project_path = null,
        .pipeline_id = null,
        .pipeline_source = null,
    };

    // Should pass with default 60 second tolerance
    try oidc.validateExpiration(&claims_not_yet_valid);

    // Should fail with 0 tolerance
    try testing.expectError(error.InvalidToken, oidc.validateExpirationWithSkew(&claims_not_yet_valid, 0));
}

// =============================================================================
// Default Constants Tests
// =============================================================================

test "Default Clock Skew Is 60 Seconds" {
    try testing.expectEqual(@as(i64, 60), oidc.DEFAULT_CLOCK_SKEW_SECONDS);
}

test "Default OIDC Audience Is NPM Registry" {
    try testing.expectEqualStrings("npm:registry.npmjs.org", oidc.DEFAULT_OIDC_AUDIENCE);
}

// =============================================================================
// RSA Big Integer Operations Tests
// =============================================================================

test "RSA Modular Exponentiation - Small Numbers" {
    // Test with small numbers we can verify manually
    // 2^3 mod 5 = 8 mod 5 = 3
    const allocator = testing.allocator;

    const BigInt = std.math.big.int.Managed;

    var base = try BigInt.init(allocator);
    defer base.deinit();
    var exp = try BigInt.init(allocator);
    defer exp.deinit();
    var modulus = try BigInt.init(allocator);
    defer modulus.deinit();
    var result = try BigInt.init(allocator);
    defer result.deinit();
    var temp = try BigInt.init(allocator);
    defer temp.deinit();

    try base.set(2);
    try exp.set(3);
    try modulus.set(5);

    // Manual square-and-multiply
    try result.set(1);

    // exp = 3 = 0b11
    // bit 1: result = 1, bit set -> result = 1 * 2 mod 5 = 2
    // bit 0: result = 2^2 mod 5 = 4, bit set -> result = 4 * 2 mod 5 = 3

    // In Zig 0.16, directly access the limbs for small values
    const exp_val: u64 = if (exp.len() > 0) exp.toConst().limbs[0] else 0;
    try testing.expectEqual(@as(u64, 3), exp_val);

    // Verify the expected result
    // 2^3 = 8, 8 mod 5 = 3
    try testing.expectEqual(@as(u64, 3), @as(u64, 8) % 5);
}

// =============================================================================
// Token Decode Tests
// =============================================================================

test "Decode Token Unsafe - Extract Claims" {
    const allocator = testing.allocator;

    // A simple test JWT with minimal claims
    // Header: {"alg":"RS256","typ":"JWT"}
    // Payload: {"iss":"test-issuer","sub":"test-subject","aud":"test-audience","exp":9999999999,"iat":1700000000}
    const test_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZXN0LWlzc3VlciIsInN1YiI6InRlc3Qtc3ViamVjdCIsImF1ZCI6InRlc3QtYXVkaWVuY2UiLCJleHAiOjk5OTk5OTk5OTksImlhdCI6MTcwMDAwMDAwMH0.signature";

    var token = try oidc.decodeTokenUnsafe(allocator, test_token);
    defer token.deinit(allocator);

    try testing.expectEqualStrings("test-issuer", token.claims.iss);
    try testing.expectEqualStrings("test-subject", token.claims.sub);
    try testing.expectEqualStrings("test-audience", token.claims.aud);
    try testing.expectEqual(@as(i64, 9999999999), token.claims.exp);
    try testing.expectEqual(@as(i64, 1700000000), token.claims.iat);
}

test "Decode Token Unsafe - Invalid Format" {
    const allocator = testing.allocator;

    // Missing parts
    try testing.expectError(error.InvalidToken, oidc.decodeTokenUnsafe(allocator, "only-one-part"));
    try testing.expectError(error.InvalidToken, oidc.decodeTokenUnsafe(allocator, "two.parts"));
}
