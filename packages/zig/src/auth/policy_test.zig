const std = @import("std");
const testing = std.testing;
const policy = @import("policy.zig");
const signing = @import("signing.zig");

test "Policy level from string" {
    try testing.expectEqual(policy.PolicyLevel.none, policy.PolicyLevel.fromString("none").?);
    try testing.expectEqual(policy.PolicyLevel.warn, policy.PolicyLevel.fromString("warn").?);
    try testing.expectEqual(policy.PolicyLevel.strict, policy.PolicyLevel.fromString("strict").?);
    try testing.expect(policy.PolicyLevel.fromString("invalid") == null);
}

test "Pattern matching - exact match" {
    try testing.expect(policy.matchesPattern("lodash", "lodash"));
    try testing.expect(!policy.matchesPattern("lodash", "axios"));
}

test "Pattern matching - wildcard" {
    try testing.expect(policy.matchesPattern("anything", "*"));
    try testing.expect(policy.matchesPattern("lodash", "*"));
}

test "Pattern matching - scoped packages" {
    try testing.expect(policy.matchesPattern("@org/package", "@org/*"));
    try testing.expect(policy.matchesPattern("@org/another", "@org/*"));
    try testing.expect(!policy.matchesPattern("@other/package", "@org/*"));
}

test "Pattern matching - prefix" {
    try testing.expect(policy.matchesPattern("lodash", "lodash*"));
    try testing.expect(policy.matchesPattern("lodash-extra", "lodash*"));
    try testing.expect(!policy.matchesPattern("axios", "lodash*"));
}

test "Policy enforcement - none level allows all" {
    const allocator = testing.allocator;

    var sig_policy = policy.SignaturePolicy{
        .level = .none,
    };

    var keyring = signing.Keyring.init(allocator);
    defer keyring.deinit();

    var result = try policy.enforcePolicy(
        allocator,
        &sig_policy,
        "test-package",
        null, // No signature
        "test data",
        &keyring,
    );
    defer result.deinit(allocator);

    try testing.expect(result.allowed);
    try testing.expectEqual(@as(usize, 0), result.violations.len);
}

test "Policy enforcement - warn level with missing signature" {
    const allocator = testing.allocator;

    var sig_policy = policy.SignaturePolicy{
        .level = .warn,
        .required_for = null, // All packages require signatures
    };

    var keyring = signing.Keyring.init(allocator);
    defer keyring.deinit();

    var result = try policy.enforcePolicy(
        allocator,
        &sig_policy,
        "test-package",
        null, // No signature
        "test data",
        &keyring,
    );
    defer result.deinit(allocator);

    try testing.expect(result.allowed); // Warn level allows despite violation
    try testing.expectEqual(@as(usize, 1), result.violations.len);
    try testing.expectEqual(@as(usize, 1), result.warnings.len);
}

test "Policy enforcement - strict level rejects missing signature" {
    const allocator = testing.allocator;

    var sig_policy = policy.SignaturePolicy{
        .level = .strict,
    };

    var keyring = signing.Keyring.init(allocator);
    defer keyring.deinit();

    var result = try policy.enforcePolicy(
        allocator,
        &sig_policy,
        "test-package",
        null, // No signature
        "test data",
        &keyring,
    );
    defer result.deinit(allocator);

    try testing.expect(!result.allowed); // Strict level rejects
    try testing.expectEqual(@as(usize, 1), result.violations.len);
    try testing.expectEqual(policy.PolicyViolation.Reason.missing_signature, result.violations[0].reason);
}

test "Policy enforcement - exempt packages allowed without signature" {
    const allocator = testing.allocator;

    var exempt_list = try allocator.alloc([]const u8, 1);
    defer allocator.free(exempt_list);
    exempt_list[0] = "internal-*";

    var sig_policy = policy.SignaturePolicy{
        .level = .strict,
        .exempt = exempt_list,
    };
    defer sig_policy.exempt = null; // Prevent double-free

    var keyring = signing.Keyring.init(allocator);
    defer keyring.deinit();

    var result = try policy.enforcePolicy(
        allocator,
        &sig_policy,
        "internal-package",
        null, // No signature
        "test data",
        &keyring,
    );
    defer result.deinit(allocator);

    try testing.expect(result.allowed); // Exempt package allowed
    try testing.expectEqual(@as(usize, 0), result.violations.len);
}

test "Policy enforcement - valid signature accepted" {
    const allocator = testing.allocator;

    const test_data = "test package data";

    // Generate keypair
    const keypair = try signing.generateEd25519KeyPair(allocator);
    defer allocator.free(keypair.public_key_pem);
    defer allocator.free(keypair.key_id);

    // Sign the data
    var signature = try signing.signPackageEd25519(
        allocator,
        test_data,
        keypair.private_key_seed,
    );
    defer signature.deinit(allocator);

    // Create keyring with the public key
    var keyring = signing.Keyring.init(allocator);
    defer keyring.deinit();
    try keyring.addKey(keypair.key_id, keypair.public_key_pem);

    // Create strict policy
    var sig_policy = policy.SignaturePolicy{
        .level = .strict,
    };

    var result = try policy.enforcePolicy(
        allocator,
        &sig_policy,
        "test-package",
        &signature,
        test_data,
        &keyring,
    );
    defer result.deinit(allocator);

    try testing.expect(result.allowed);
    try testing.expectEqual(@as(usize, 0), result.violations.len);
}

test "Policy enforcement - trusted keys restriction" {
    const allocator = testing.allocator;

    const test_data = "test package data";

    // Generate keypair
    const keypair = try signing.generateEd25519KeyPair(allocator);
    defer allocator.free(keypair.public_key_pem);
    defer allocator.free(keypair.key_id);

    // Sign the data
    var signature = try signing.signPackageEd25519(
        allocator,
        test_data,
        keypair.private_key_seed,
    );
    defer signature.deinit(allocator);

    // Create keyring
    var keyring = signing.Keyring.init(allocator);
    defer keyring.deinit();
    try keyring.addKey(keypair.key_id, keypair.public_key_pem);

    // Create policy with different trusted key
    var trusted_list = try allocator.alloc([]const u8, 1);
    defer allocator.free(trusted_list);
    trusted_list[0] = "different-key-id";

    var sig_policy = policy.SignaturePolicy{
        .level = .strict,
        .trusted_keys = trusted_list,
    };
    defer sig_policy.trusted_keys = null; // Prevent double-free

    var result = try policy.enforcePolicy(
        allocator,
        &sig_policy,
        "test-package",
        &signature,
        test_data,
        &keyring,
    );
    defer result.deinit(allocator);

    try testing.expect(!result.allowed);
    try testing.expectEqual(@as(usize, 1), result.violations.len);
    try testing.expectEqual(policy.PolicyViolation.Reason.untrusted_key, result.violations[0].reason);
}

test "Load policy from JSON config" {
    const allocator = testing.allocator;

    const config_json =
        \\{
        \\  "level": "strict",
        \\  "requiredFor": ["@org/*", "lodash"],
        \\  "exempt": ["internal-*"],
        \\  "trustedKeys": ["key123", "key456"],
        \\  "allowSelfSigned": true
        \\}
    ;

    var parsed = try std.json.parseFromSlice(
        std.json.Value,
        allocator,
        config_json,
        .{},
    );
    defer parsed.deinit();

    var sig_policy = try policy.loadFromConfig(allocator, parsed.value);
    defer sig_policy.deinit(allocator);

    try testing.expectEqual(policy.PolicyLevel.strict, sig_policy.level);
    try testing.expect(sig_policy.required_for != null);
    try testing.expectEqual(@as(usize, 2), sig_policy.required_for.?.len);
    try testing.expect(sig_policy.exempt != null);
    try testing.expectEqual(@as(usize, 1), sig_policy.exempt.?.len);
    try testing.expect(sig_policy.trusted_keys != null);
    try testing.expectEqual(@as(usize, 2), sig_policy.trusted_keys.?.len);
    try testing.expect(sig_policy.allow_self_signed);
}
