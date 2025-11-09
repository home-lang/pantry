const std = @import("std");
const testing = std.testing;
const oidc = @import("oidc.zig");

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

    const result = try publisher.validateClaims(&claims);
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

    const result = try publisher.validateClaims(&claims);
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

    const result = try publisher.validateClaims(&claims);
    try testing.expect(result);
}

test "Validate Token Expiration - Valid" {
    const claims = oidc.OIDCToken.Claims{
        .iss = "https://token.actions.githubusercontent.com",
        .sub = "repo:owner/repo:ref:refs/heads/main",
        .aud = "pantry",
        .exp = std.time.timestamp() + 3600, // Expires in 1 hour
        .iat = std.time.timestamp() - 60, // Issued 1 minute ago
        .nbf = std.time.timestamp() - 60, // Valid from 1 minute ago
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
        .exp = std.time.timestamp() - 3600, // Expired 1 hour ago
        .iat = std.time.timestamp() - 7200, // Issued 2 hours ago
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

    const result_valid = try publisher.validateClaims(&claims_valid);
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

    const result_invalid = try publisher.validateClaims(&claims_invalid);
    try testing.expect(!result_invalid);
}
