const std = @import("std");
const testing = std.testing;
const signing = @import("signing.zig");
const io_helper = @import("../io_helper.zig");

test "Generate Ed25519 keypair" {
    const allocator = testing.allocator;

    const keypair = try signing.generateEd25519KeyPair(allocator);
    defer allocator.free(keypair.public_key_pem);
    defer allocator.free(keypair.key_id);

    // Check that PEM format is correct
    try testing.expect(std.mem.startsWith(u8, keypair.public_key_pem, "-----BEGIN PUBLIC KEY-----"));
    try testing.expect(std.mem.endsWith(u8, keypair.public_key_pem, "-----END PUBLIC KEY-----\n"));

    // Check that key ID is 16 hex characters
    try testing.expectEqual(@as(usize, 16), keypair.key_id.len);
}

test "Sign and verify package with Ed25519" {
    const allocator = testing.allocator;

    const test_data = "This is test package data";

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

    // Verify signature matches key ID
    try testing.expectEqualStrings(keypair.key_id, signature.key_id);
    try testing.expectEqualStrings("ed25519", signature.algorithm);

    // Create keyring and add public key
    var keyring = signing.Keyring.init(allocator);
    defer keyring.deinit();

    try keyring.addKey(keypair.key_id, keypair.public_key_pem);

    // Verify the signature
    try signing.verifyPackageSignature(test_data, &signature, &keyring);
}

test "Verify signature fails with wrong data" {
    const allocator = testing.allocator;

    const test_data = "This is test package data";
    const wrong_data = "This is different data";

    // Generate keypair
    const keypair = try signing.generateEd25519KeyPair(allocator);
    defer allocator.free(keypair.public_key_pem);
    defer allocator.free(keypair.key_id);

    // Sign the original data
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

    // Try to verify with wrong data - should fail
    try testing.expectError(
        error.SignatureVerificationFailed,
        signing.verifyPackageSignature(wrong_data, &signature, &keyring),
    );
}

test "Keyring operations" {
    const allocator = testing.allocator;

    var keyring = signing.Keyring.init(allocator);
    defer keyring.deinit();

    const test_key_id = "0123456789abcdef";
    const test_key_pem = "-----BEGIN PUBLIC KEY-----\ntest\n-----END PUBLIC KEY-----\n";

    // Add key
    try keyring.addKey(test_key_id, test_key_pem);

    // Get key
    const retrieved = keyring.getKey(test_key_id);
    try testing.expect(retrieved != null);
    try testing.expectEqualStrings(test_key_pem, retrieved.?);

    // Remove key
    const removed = keyring.removeKey(test_key_id);
    try testing.expect(removed);

    // Key should no longer exist
    try testing.expect(keyring.getKey(test_key_id) == null);

    // Removing non-existent key should return false
    const removed_again = keyring.removeKey(test_key_id);
    try testing.expect(!removed_again);
}

test "Compute SHA256 checksum" {
    const allocator = testing.allocator;

    const test_data = "Hello, World!";
    const checksum = try signing.computeSHA256(allocator, test_data);
    defer allocator.free(checksum);

    // Known SHA256 hash of "Hello, World!"
    const expected = "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f";
    try testing.expectEqualStrings(expected, checksum);
}

test "Compute SHA512 checksum" {
    const allocator = testing.allocator;

    const test_data = "Hello, World!";
    const checksum = try signing.computeSHA512(allocator, test_data);
    defer allocator.free(checksum);

    // Known SHA512 hash of "Hello, World!"
    const expected = "374d794a95cdcfd8b35993185fef9ba368f160d8daf432d08ba9f1ed1e5abe6cc69291e0fa2fe0006a52570ef18c19def4e617c33ce52ef0a6e5fbe318cb0387";
    try testing.expectEqualStrings(expected, checksum);
}

test "Verify with missing key returns error" {
    const allocator = testing.allocator;

    const test_data = "test data";

    var signature = signing.PackageSignature{
        .algorithm = "ed25519",
        .signature = "dummy_signature",
        .key_id = "nonexistent_key",
        .timestamp = @as(i64, @intCast((io_helper.clockGettime()).sec)),
    };

    var keyring = signing.Keyring.init(allocator);
    defer keyring.deinit();

    // Should fail with KeyNotFound
    try testing.expectError(
        error.KeyNotFound,
        signing.verifyPackageSignature(test_data, &signature, &keyring),
    );
}

test "Verify with unsupported algorithm returns error" {
    const allocator = testing.allocator;

    const test_data = "test data";

    var signature = signing.PackageSignature{
        .algorithm = "unsupported_algo",
        .signature = "dummy_signature",
        .key_id = "some_key",
        .timestamp = @as(i64, @intCast((io_helper.clockGettime()).sec)),
    };

    var keyring = signing.Keyring.init(allocator);
    defer keyring.deinit();

    // Should fail with UnsupportedAlgorithm
    try testing.expectError(
        error.UnsupportedAlgorithm,
        signing.verifyPackageSignature(test_data, &signature, &keyring),
    );
}
