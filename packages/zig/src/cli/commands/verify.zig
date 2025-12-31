//! Package verification command
//!
//! Verifies package signatures to ensure authenticity and integrity

const std = @import("std");
const lib = @import("../../lib.zig");
const signing = @import("../../auth/signing.zig");

const CommandResult = struct {
    exit_code: u8,
    message: ?[]const u8 = null,

    pub fn deinit(self: *CommandResult, allocator: std.mem.Allocator) void {
        if (self.message) |msg| {
            allocator.free(msg);
        }
    }
};

/// Verify a package signature
pub fn verifyCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Usage: pantry verify <package-path> [--keyring <path>]"),
        };
    }

    const package_path = args[0];

    // Parse optional keyring path
    var keyring_path: ?[]const u8 = null;
    if (args.len >= 3 and std.mem.eql(u8, args[1], "--keyring")) {
        keyring_path = args[2];
    }

    std.debug.print("🔍 Verifying package: {s}\n", .{package_path});

    // Load keyring
    var keyring = signing.Keyring.init(allocator);
    defer keyring.deinit();

    if (keyring_path) |kr_path| {
        try loadKeyringFromFile(&keyring, allocator, kr_path);
    } else {
        // Load default keyring from ~/.pantry/keyring.json
        const home = try lib.Paths.home(allocator);
        defer allocator.free(home);

        const default_keyring = try std.fs.path.join(allocator, &[_][]const u8{
            home,
            ".pantry",
            "keyring.json",
        });
        defer allocator.free(default_keyring);

        loadKeyringFromFile(&keyring, allocator, default_keyring) catch |err| {
            if (err == error.FileNotFound) {
                std.debug.print("⚠️  No keyring found. Use --keyring to specify a keyring.\n", .{});
                return .{ .exit_code = 1 };
            }
            return err;
        };
    }

    std.debug.print("📋 Loaded keyring with {d} key(s)\n", .{keyring.keys.count()});

    // Read package signature file
    const sig_path = try std.fmt.allocPrint(allocator, "{s}.sig", .{package_path});
    defer allocator.free(sig_path);

    const sig_content = std.Io.Dir.cwd().readFileAlloc(
        sig_path,
        allocator,
        @enumFromInt(1024 * 1024),
    ) catch |err| {
        const msg = try std.fmt.allocPrint(
            allocator,
            "❌ Failed to read signature file: {}",
            .{err},
        );
        return .{ .exit_code = 1, .message = msg };
    };
    defer allocator.free(sig_content);

    // Parse signature JSON
    const parsed = try std.json.parseFromSlice(
        std.json.Value,
        allocator,
        sig_content,
        .{},
    );
    defer parsed.deinit();

    const sig_obj = parsed.value.object;
    var signature = signing.PackageSignature{
        .algorithm = try allocator.dupe(u8, sig_obj.get("algorithm").?.string),
        .signature = try allocator.dupe(u8, sig_obj.get("signature").?.string),
        .key_id = try allocator.dupe(u8, sig_obj.get("key_id").?.string),
        .timestamp = @intCast(sig_obj.get("timestamp").?.integer),
        .key_url = if (sig_obj.get("key_url")) |url| try allocator.dupe(u8, url.string) else null,
    };
    defer signature.deinit(allocator);

    // Read package data
    const package_data = try std.Io.Dir.cwd().readFileAlloc(
        package_path,
        allocator,
        @enumFromInt(100 * 1024 * 1024), // 100MB max
    );
    defer allocator.free(package_data);

    // Verify signature
    signing.verifyPackageSignature(package_data, &signature, &keyring) catch |err| {
        const msg = try std.fmt.allocPrint(
            allocator,
            "❌ Signature verification failed: {}",
            .{err},
        );
        return .{ .exit_code = 1, .message = msg };
    };

    // Compute checksum for display
    const checksum = try signing.computeSHA256(allocator, package_data);
    defer allocator.free(checksum);

    std.debug.print("✅ Signature verified successfully!\n", .{});
    std.debug.print("   Algorithm: {s}\n", .{signature.algorithm});
    std.debug.print("   Key ID: {s}\n", .{signature.key_id});
    std.debug.print("   SHA256: {s}\n", .{checksum});

    return .{ .exit_code = 0 };
}

/// Load keyring from JSON file
fn loadKeyringFromFile(keyring: *signing.Keyring, allocator: std.mem.Allocator, path: []const u8) !void {
    const content = try std.Io.Dir.cwd().readFileAlloc(
        path,
        allocator,
        @enumFromInt(1024 * 1024),
    );
    defer allocator.free(content);

    const parsed = try std.json.parseFromSlice(
        std.json.Value,
        allocator,
        content,
        .{},
    );
    defer parsed.deinit();

    const keys_obj = parsed.value.object;
    var it = keys_obj.iterator();
    while (it.next()) |entry| {
        const key_id = entry.key_ptr.*;
        const public_key_pem = entry.value_ptr.*.string;
        try keyring.addKey(key_id, public_key_pem);
    }
}

/// Generate a new signing keypair
pub fn generateKeyCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    _ = args;

    std.debug.print("🔑 Generating new Ed25519 keypair...\n", .{});

    const keypair = try signing.generateEd25519KeyPair(allocator);
    defer {
        allocator.free(keypair.public_key_pem);
        allocator.free(keypair.key_id);
    }

    std.debug.print("✅ Keypair generated!\n\n", .{});
    std.debug.print("Key ID: {s}\n\n", .{keypair.key_id});
    std.debug.print("Public Key (PEM):\n{s}\n", .{keypair.public_key_pem});
    std.debug.print("Private Key Seed (hex): ", .{});
    for (keypair.private_key_seed) |byte| {
        std.debug.print("{x:0>2}", .{byte});
    }
    std.debug.print("\n\n", .{});
    std.debug.print("⚠️  Store the private key seed securely!\n", .{});
    std.debug.print("💾 Add the public key to your keyring.json:\n", .{});
    std.debug.print("   {{\n", .{});
    std.debug.print("     \"{s}\": \"{s}\"\n", .{ keypair.key_id, keypair.public_key_pem });
    std.debug.print("   }}\n", .{});

    return .{ .exit_code = 0 };
}

/// Sign a package
pub fn signCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len < 2) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Usage: pantry sign <package-path> <private-key-seed-hex>"),
        };
    }

    const package_path = args[0];
    const seed_hex = args[1];

    // Parse hex seed
    if (seed_hex.len != 64) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Private key seed must be 64 hex characters (32 bytes)"),
        };
    }

    var seed: [32]u8 = undefined;
    for (0..32) |i| {
        seed[i] = try std.fmt.parseInt(u8, seed_hex[i * 2 .. i * 2 + 2], 16);
    }

    std.debug.print("✍️  Signing package: {s}\n", .{package_path});

    // Read package data
    const package_data = try std.Io.Dir.cwd().readFileAlloc(
        package_path,
        allocator,
        @enumFromInt(100 * 1024 * 1024), // 100MB max
    );
    defer allocator.free(package_data);

    // Sign the package
    var signature = try signing.signPackageEd25519(allocator, package_data, seed);
    defer signature.deinit(allocator);

    // Write signature to JSON file
    const sig_path = try std.fmt.allocPrint(allocator, "{s}.sig", .{package_path});
    defer allocator.free(sig_path);

    const sig_json = try std.fmt.allocPrint(
        allocator,
        \\{{
        \\  "algorithm": "{s}",
        \\  "signature": "{s}",
        \\  "key_id": "{s}",
        \\  "timestamp": {d}
        \\}}
        \\
    ,
        .{
            signature.algorithm,
            signature.signature,
            signature.key_id,
            signature.timestamp,
        },
    );
    defer allocator.free(sig_json);

    const sig_file = try std.Io.Dir.cwd().createFile(sig_path, .{});
    defer sig_file.close();
    try sig_file.writeAll(sig_json);

    std.debug.print("✅ Package signed successfully!\n", .{});
    std.debug.print("   Signature file: {s}\n", .{sig_path});
    std.debug.print("   Key ID: {s}\n", .{signature.key_id});

    return .{ .exit_code = 0 };
}
