const std = @import("std");
const testing = std.testing;

// Import modules
const oidc = @import("../src/auth/oidc.zig");
const signing = @import("../src/auth/signing.zig");
const policy = @import("../src/auth/policy.zig");
const publish = @import("../src/packages/publish.zig");

// ============================================================================
// Mock Registry Server
// ============================================================================

const MockRegistry = struct {
    allocator: std.mem.Allocator,
    published_packages: std.StringHashMap(PackageInfo),
    oidc_tokens: std.StringHashMap(oidc.OIDCToken),

    const PackageInfo = struct {
        name: []const u8,
        version: []const u8,
        tarball_sha256: []const u8,
        signature: ?[]const u8,
        provenance: ?[]const u8,
    };

    pub fn init(allocator: std.mem.Allocator) MockRegistry {
        return .{
            .allocator = allocator,
            .published_packages = std.StringHashMap(PackageInfo).init(allocator),
            .oidc_tokens = std.StringHashMap(oidc.OIDCToken).init(allocator),
        };
    }

    pub fn deinit(self: *MockRegistry) void {
        var it = self.published_packages.iterator();
        while (it.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
        }
        self.published_packages.deinit();

        var token_it = self.oidc_tokens.iterator();
        while (token_it.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
        }
        self.oidc_tokens.deinit();
    }

    pub fn publishPackage(
        self: *MockRegistry,
        name: []const u8,
        version: []const u8,
        tarball_sha256: []const u8,
        signature: ?[]const u8,
        provenance: ?[]const u8,
    ) !void {
        const key = try std.fmt.allocPrint(self.allocator, "{s}@{s}", .{ name, version });
        try self.published_packages.put(key, PackageInfo{
            .name = name,
            .version = version,
            .tarball_sha256 = tarball_sha256,
            .signature = signature,
            .provenance = provenance,
        });
    }

    pub fn getPackage(self: *const MockRegistry, name: []const u8, version: []const u8) ?PackageInfo {
        const key_buf: [256]u8 = undefined;
        const key = std.fmt.bufPrint(&key_buf, "{s}@{s}", .{ name, version }) catch return null;
        return self.published_packages.get(key);
    }
};

// ============================================================================
// Integration Tests
// ============================================================================

test "End-to-end: OIDC authentication flow" {
    const allocator = testing.allocator;

    // Create mock OIDC token
    const token_payload =
        \\eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Rva2VuLmFjdGlvbnMuZ2l0aHViY29udGVudC5jb20iLCJzdWIiOiJyZXBvOm93bmVyL3JlcG86cmVmOnJlZnMvaGVhZHMvbWFpbiIsImF1ZCI6InBhbnRyeSIsImV4cCI6OTk5OTk5OTk5OSwiaWF0IjoxNzAwMDAwMDAwLCJyZXBvc2l0b3J5X293bmVyIjoib3duZXIiLCJyZXBvc2l0b3J5Ijoib3duZXIvcmVwbyIsInJlcG9zaXRvcnlfb3duZXJfaWQiOiIxMjM0NTYiLCJ3b3JrZmxvd19yZWYiOiJvd25lci9yZXBvLy5naXRodWIvd29ya2Zsb3dzL3JlbGVhc2UueW1sQHJlZnMvaGVhZHMvbWFpbiIsImFjdG9yIjoidXNlciIsImV2ZW50X25hbWUiOiJwdXNoIiwicmVmIjoicmVmcy9oZWFkcy9tYWluIiwicmVmX3R5cGUiOiJicmFuY2giLCJzaGEiOiJhYmMxMjM0NTYiLCJqb2Jfd29ya2Zsb3dfcmVmIjoib3duZXIvcmVwby8uZ2l0aHViL3dvcmtmbG93cy9yZWxlYXNlLnltbEByZWZzL2hlYWRzL21haW4iLCJydW5uZXJfZW52aXJvbm1lbnQiOiJnaXRodWItaG9zdGVkIn0.signature
    ;

    // Decode token
    var token = try oidc.decodeTokenUnsafe(allocator, token_payload);
    defer token.deinit(allocator);

    // Validate claims
    try testing.expectEqualStrings("https://token.actions.githubusercontent.com", token.claims.iss);
    try testing.expectEqualStrings("owner", token.claims.repository_owner.?);
    try testing.expectEqualStrings("owner/repo", token.claims.repository.?);

    // Validate expiration
    try oidc.validateExpiration(&token.claims);
}

test "End-to-end: Package signing and verification" {
    const allocator = testing.allocator;

    const package_data = "This is the package tarball data";

    // 1. Generate signing key
    const keypair = try signing.generateEd25519KeyPair(allocator);
    defer allocator.free(keypair.public_key_pem);
    defer allocator.free(keypair.key_id);

    // 2. Sign the package
    var signature = try signing.signPackageEd25519(
        allocator,
        package_data,
        keypair.private_key_seed,
    );
    defer signature.deinit(allocator);

    // 3. Create keyring and add publisher's public key
    var keyring = signing.Keyring.init(allocator);
    defer keyring.deinit();
    try keyring.addKey(keypair.key_id, keypair.public_key_pem);

    // 4. Verify the signature
    try signing.verifyPackageSignature(package_data, &signature, &keyring);

    // 5. Verification should fail with tampered data
    const tampered_data = "Tampered package data";
    try testing.expectError(
        error.SignatureVerificationFailed,
        signing.verifyPackageSignature(tampered_data, &signature, &keyring),
    );
}

test "End-to-end: Policy enforcement workflow" {
    const allocator = testing.allocator;

    const package_data = "Package tarball";

    // 1. Create signature policy (strict mode)
    var sig_policy = policy.SignaturePolicy{
        .level = .strict,
    };

    // 2. Generate signing key
    const keypair = try signing.generateEd25519KeyPair(allocator);
    defer allocator.free(keypair.public_key_pem);
    defer allocator.free(keypair.key_id);

    // 3. Sign package
    var signature = try signing.signPackageEd25519(
        allocator,
        package_data,
        keypair.private_key_seed,
    );
    defer signature.deinit(allocator);

    // 4. Create keyring
    var keyring = signing.Keyring.init(allocator);
    defer keyring.deinit();
    try keyring.addKey(keypair.key_id, keypair.public_key_pem);

    // 5. Enforce policy - should pass with valid signature
    var result = try policy.enforcePolicy(
        allocator,
        &sig_policy,
        "my-package",
        &signature,
        package_data,
        &keyring,
    );
    defer result.deinit(allocator);

    try testing.expect(result.allowed);
    try testing.expectEqual(@as(usize, 0), result.violations.len);

    // 6. Enforce policy without signature - should fail in strict mode
    var result_no_sig = try policy.enforcePolicy(
        allocator,
        &sig_policy,
        "my-package",
        null,
        package_data,
        &keyring,
    );
    defer result_no_sig.deinit(allocator);

    try testing.expect(!result_no_sig.allowed);
    try testing.expectEqual(@as(usize, 1), result_no_sig.violations.len);
}

test "End-to-end: Trusted publisher validation" {
    const allocator = testing.allocator;

    // 1. Define trusted publisher
    const trusted_pub = oidc.TrustedPublisher{
        .type = "github-action",
        .owner = "my-org",
        .repository = "my-package",
        .workflow = ".github/workflows/publish.yml",
        .environment = null,
        .allowed_refs = null,
    };

    // 2. Create valid claims
    const valid_claims = oidc.OIDCToken.Claims{
        .iss = "https://token.actions.githubusercontent.com",
        .sub = "repo:my-org/my-package:ref:refs/heads/main",
        .aud = "pantry",
        .exp = 9999999999,
        .iat = 1700000000,
        .nbf = null,
        .jti = null,
        .repository_owner = "my-org",
        .repository = "my-org/my-package",
        .repository_owner_id = "123",
        .workflow_ref = null,
        .actor = "user",
        .event_name = "push",
        .ref = "refs/heads/main",
        .ref_type = "branch",
        .sha = "abc123",
        .job_workflow_ref = "my-org/my-package/.github/workflows/publish.yml@refs/heads/main",
        .runner_environment = "github-hosted",
        .namespace_id = null,
        .namespace_path = null,
        .project_id = null,
        .project_path = null,
        .pipeline_id = null,
        .pipeline_source = null,
    };

    // 3. Validate claims
    const is_valid = try trusted_pub.validateClaims(&valid_claims);
    try testing.expect(is_valid);

    // 4. Test with wrong repository
    const invalid_claims = oidc.OIDCToken.Claims{
        .iss = "https://token.actions.githubusercontent.com",
        .sub = "repo:different-org/my-package:ref:refs/heads/main",
        .aud = "pantry",
        .exp = 9999999999,
        .iat = 1700000000,
        .nbf = null,
        .jti = null,
        .repository_owner = "different-org",
        .repository = "different-org/my-package",
        .repository_owner_id = "456",
        .workflow_ref = null,
        .actor = "user",
        .event_name = "push",
        .ref = "refs/heads/main",
        .ref_type = "branch",
        .sha = "def456",
        .job_workflow_ref = "different-org/my-package/.github/workflows/publish.yml@refs/heads/main",
        .runner_environment = "github-hosted",
        .namespace_id = null,
        .namespace_path = null,
        .project_id = null,
        .project_path = null,
        .pipeline_id = null,
        .pipeline_source = null,
    };

    const is_invalid = try trusted_pub.validateClaims(&invalid_claims);
    try testing.expect(!is_invalid);
}

test "End-to-end: Complete publishing workflow simulation" {
    const allocator = testing.allocator;

    // Setup mock registry
    var registry = MockRegistry.init(allocator);
    defer registry.deinit();

    // 1. Package metadata
    const pkg_name = "my-awesome-package";
    const pkg_version = "1.0.0";
    const package_data = "Package tarball content here";

    // 2. Generate signing key
    const keypair = try signing.generateEd25519KeyPair(allocator);
    defer allocator.free(keypair.public_key_pem);
    defer allocator.free(keypair.key_id);

    // 3. Sign package
    var signature = try signing.signPackageEd25519(
        allocator,
        package_data,
        keypair.private_key_seed,
    );
    defer signature.deinit(allocator);

    // 4. Compute checksum
    const checksum = try signing.computeSHA256(allocator, package_data);
    defer allocator.free(checksum);

    // 5. Create provenance (simulated)
    const provenance_data = try std.fmt.allocPrint(
        allocator,
        \\{{
        \\  "_type": "https://in-toto.io/Statement/v0.1",
        \\  "subject": [{{
        \\    "name": "{s}@{s}",
        \\    "digest": {{"sha256": "{s}"}}
        \\  }}],
        \\  "predicateType": "https://slsa.dev/provenance/v0.2"
        \\}}
        ,
        .{ pkg_name, pkg_version, checksum },
    );
    defer allocator.free(provenance_data);

    // 6. Publish to registry
    try registry.publishPackage(
        pkg_name,
        pkg_version,
        checksum,
        signature.signature,
        provenance_data,
    );

    // 7. Verify package was published
    const published = registry.getPackage(pkg_name, pkg_version);
    try testing.expect(published != null);
    try testing.expectEqualStrings(pkg_name, published.?.name);
    try testing.expectEqualStrings(pkg_version, published.?.version);
    try testing.expectEqualStrings(checksum, published.?.tarball_sha256);
    try testing.expect(published.?.signature != null);
    try testing.expect(published.?.provenance != null);
}

test "End-to-end: Policy with multiple constraints" {
    const allocator = testing.allocator;

    // Create policy that:
    // - Requires signatures for @org/* packages
    // - Exempts internal-* packages
    // - Only trusts specific key IDs
    var required_for = try allocator.alloc([]const u8, 1);
    defer allocator.free(required_for);
    required_for[0] = "@org/*";

    var exempt = try allocator.alloc([]const u8, 1);
    defer allocator.free(exempt);
    exempt[0] = "internal-*";

    const keypair = try signing.generateEd25519KeyPair(allocator);
    defer allocator.free(keypair.public_key_pem);
    defer allocator.free(keypair.key_id);

    var trusted_keys = try allocator.alloc([]const u8, 1);
    defer allocator.free(trusted_keys);
    trusted_keys[0] = keypair.key_id;

    var sig_policy = policy.SignaturePolicy{
        .level = .strict,
        .required_for = required_for,
        .exempt = exempt,
        .trusted_keys = trusted_keys,
    };
    defer {
        sig_policy.required_for = null;
        sig_policy.exempt = null;
        sig_policy.trusted_keys = null;
    }

    var keyring = signing.Keyring.init(allocator);
    defer keyring.deinit();
    try keyring.addKey(keypair.key_id, keypair.public_key_pem);

    const package_data = "test data";

    // Test 1: @org/package requires signature
    {
        var result = try policy.enforcePolicy(
            allocator,
            &sig_policy,
            "@org/my-package",
            null,
            package_data,
            &keyring,
        );
        defer result.deinit(allocator);
        try testing.expect(!result.allowed);
    }

    // Test 2: internal-package is exempt
    {
        var result = try policy.enforcePolicy(
            allocator,
            &sig_policy,
            "internal-utils",
            null,
            package_data,
            &keyring,
        );
        defer result.deinit(allocator);
        try testing.expect(result.allowed);
    }

    // Test 3: @org/package with valid signature from trusted key
    {
        var signature = try signing.signPackageEd25519(
            allocator,
            package_data,
            keypair.private_key_seed,
        );
        defer signature.deinit(allocator);

        var result = try policy.enforcePolicy(
            allocator,
            &sig_policy,
            "@org/my-package",
            &signature,
            package_data,
            &keyring,
        );
        defer result.deinit(allocator);
        try testing.expect(result.allowed);
    }

    // Test 4: Other packages don't require signatures
    {
        var result = try policy.enforcePolicy(
            allocator,
            &sig_policy,
            "lodash",
            null,
            package_data,
            &keyring,
        );
        defer result.deinit(allocator);
        try testing.expect(result.allowed);
    }
}
