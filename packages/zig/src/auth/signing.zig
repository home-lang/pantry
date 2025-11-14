const std = @import("std");

/// Package signature for verifying integrity and authenticity
pub const PackageSignature = struct {
    /// Algorithm used for signing (e.g., "ed25519", "rsa-pss-sha256")
    algorithm: []const u8,

    /// The actual signature bytes (base64 encoded)
    signature: []const u8,

    /// Public key ID or fingerprint used for verification
    key_id: []const u8,

    /// Timestamp when the signature was created
    timestamp: i64,

    /// Optional: URL to the public key
    key_url: ?[]const u8 = null,

    pub fn deinit(self: *PackageSignature, allocator: std.mem.Allocator) void {
        allocator.free(self.algorithm);
        allocator.free(self.signature);
        allocator.free(self.key_id);
        if (self.key_url) |url| allocator.free(url);
    }
};

/// Keyring for managing trusted signing keys
pub const Keyring = struct {
    /// Map of key ID -> public key (PEM format)
    keys: std.StringHashMap([]const u8),
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) Keyring {
        return .{
            .keys = std.StringHashMap([]const u8).init(allocator),
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *Keyring) void {
        var it = self.keys.iterator();
        while (it.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            self.allocator.free(entry.value_ptr.*);
        }
        self.keys.deinit();
    }

    /// Add a trusted public key to the keyring
    pub fn addKey(self: *Keyring, key_id: []const u8, public_key_pem: []const u8) !void {
        const key_id_owned = try self.allocator.dupe(u8, key_id);
        errdefer self.allocator.free(key_id_owned);

        const key_owned = try self.allocator.dupe(u8, public_key_pem);
        errdefer self.allocator.free(key_owned);

        try self.keys.put(key_id_owned, key_owned);
    }

    /// Get a public key by ID
    pub fn getKey(self: *const Keyring, key_id: []const u8) ?[]const u8 {
        return self.keys.get(key_id);
    }

    /// Remove a key from the keyring
    pub fn removeKey(self: *Keyring, key_id: []const u8) bool {
        if (self.keys.fetchRemove(key_id)) |kv| {
            self.allocator.free(kv.key);
            self.allocator.free(kv.value);
            return true;
        }
        return false;
    }
};

/// Signing errors
pub const SigningError = error{
    InvalidSignature,
    KeyNotFound,
    UnsupportedAlgorithm,
    InvalidPublicKey,
    SignatureVerificationFailed,
    InvalidKeyFormat,
};

/// Sign package data using Ed25519
pub fn signPackageEd25519(
    allocator: std.mem.Allocator,
    data: []const u8,
    private_key_seed: [32]u8,
) !PackageSignature {
    // Generate Ed25519 keypair from seed
    const key_pair = try std.crypto.sign.Ed25519.KeyPair.create(private_key_seed);

    // Sign the data
    const signature = try std.crypto.sign.Ed25519.sign(data, key_pair, null);

    // Encode signature to base64
    const encoder = std.base64.standard.Encoder;
    const sig_b64_len = encoder.calcSize(signature.len);
    const sig_b64 = try allocator.alloc(u8, sig_b64_len);
    errdefer allocator.free(sig_b64);

    _ = encoder.encode(sig_b64, &signature);

    // Generate key ID from public key (first 8 bytes of SHA256 hash)
    var hasher = std.crypto.hash.sha2.Sha256.init(.{});
    hasher.update(&key_pair.public_key);
    var hash: [32]u8 = undefined;
    hasher.final(&hash);

    const key_id = try std.fmt.allocPrint(
        allocator,
        "{x:0>16}",
        .{std.mem.readInt(u64, hash[0..8], .big)},
    );
    errdefer allocator.free(key_id);

    return PackageSignature{
        .algorithm = try allocator.dupe(u8, "ed25519"),
        .signature = sig_b64,
        .key_id = key_id,
        .timestamp = std.time.timestamp(),
        .key_url = null,
    };
}

/// Verify package signature using Ed25519
pub fn verifySignatureEd25519(
    data: []const u8,
    signature_b64: []const u8,
    public_key: [32]u8,
) !void {
    // Decode base64 signature
    const decoder = std.base64.standard.Decoder;
    var signature_buf: [64]u8 = undefined;

    const decoded_len = try decoder.calcSizeForSlice(signature_b64);
    if (decoded_len != 64) return error.InvalidSignature;

    try decoder.decode(&signature_buf, signature_b64);

    // Verify signature
    try std.crypto.sign.Ed25519.verify(signature_buf, data, public_key);
}

/// Verify package signature from keyring
pub fn verifyPackageSignature(
    data: []const u8,
    sig: *const PackageSignature,
    keyring: *const Keyring,
) !void {
    // Check if algorithm is supported
    if (!std.mem.eql(u8, sig.algorithm, "ed25519")) {
        return error.UnsupportedAlgorithm;
    }

    // Get public key from keyring
    const public_key_pem = keyring.getKey(sig.key_id) orelse return error.KeyNotFound;

    // Parse PEM format to extract raw public key
    const public_key_bytes = try parseEd25519PublicKey(public_key_pem);

    // Verify signature
    try verifySignatureEd25519(data, sig.signature, public_key_bytes);
}

/// Parse Ed25519 public key from PEM format
fn parseEd25519PublicKey(pem: []const u8) ![] const u8 {
    // Simple PEM parser for Ed25519 keys
    // Format: -----BEGIN PUBLIC KEY-----\nbase64data\n-----END PUBLIC KEY-----

    const begin_marker = "-----BEGIN PUBLIC KEY-----";
    const end_marker = "-----END PUBLIC KEY-----";

    const begin_idx = std.mem.indexOf(u8, pem, begin_marker) orelse return error.InvalidKeyFormat;
    const end_idx = std.mem.indexOf(u8, pem, end_marker) orelse return error.InvalidKeyFormat;

    if (begin_idx >= end_idx) return error.InvalidKeyFormat;

    // Extract base64 data between markers
    var start = begin_idx + begin_marker.len;
    while (start < end_idx and std.ascii.isWhitespace(pem[start])) : (start += 1) {}

    var end = end_idx;
    while (end > start and std.ascii.isWhitespace(pem[end - 1])) : (end -= 1) {}

    const b64_data = pem[start..end];

    // Remove any whitespace/newlines from base64
    var cleaned = std.ArrayList(u8).init(std.heap.page_allocator);
    defer cleaned.deinit();

    for (b64_data) |c| {
        if (!std.ascii.isWhitespace(c)) {
            try cleaned.append(c);
        }
    }

    // Decode base64
    const decoder = std.base64.standard.Decoder;
    const decoded_len = try decoder.calcSizeForSlice(cleaned.items);

    var decoded = try std.heap.page_allocator.alloc(u8, decoded_len);
    try decoder.decode(decoded, cleaned.items);

    // Ed25519 public key is 32 bytes (may be in ASN.1 DER format, so extract last 32 bytes)
    if (decoded.len < 32) return error.InvalidPublicKey;

    const key_start = decoded.len - 32;
    var public_key: [32]u8 = undefined;
    @memcpy(&public_key, decoded[key_start .. key_start + 32]);

    return &public_key;
}

/// Generate Ed25519 keypair and return as PEM format
pub fn generateEd25519KeyPair(allocator: std.mem.Allocator) !struct {
    public_key_pem: []const u8,
    private_key_seed: [32]u8,
    key_id: []const u8,
} {
    // Generate random seed
    var seed: [32]u8 = undefined;
    std.crypto.random.bytes(&seed);

    // Create keypair
    const key_pair = try std.crypto.sign.Ed25519.KeyPair.create(seed);

    // Encode public key to base64
    const encoder = std.base64.standard.Encoder;
    const pub_b64_len = encoder.calcSize(key_pair.public_key.len);
    const pub_b64 = try allocator.alloc(u8, pub_b64_len);
    defer allocator.free(pub_b64);

    _ = encoder.encode(pub_b64, &key_pair.public_key);

    // Create PEM format
    const pem = try std.fmt.allocPrint(
        allocator,
        "-----BEGIN PUBLIC KEY-----\n{s}\n-----END PUBLIC KEY-----\n",
        .{pub_b64},
    );

    // Generate key ID
    var hasher = std.crypto.hash.sha2.Sha256.init(.{});
    hasher.update(&key_pair.public_key);
    var hash: [32]u8 = undefined;
    hasher.final(&hash);

    const key_id = try std.fmt.allocPrint(
        allocator,
        "{x:0>16}",
        .{std.mem.readInt(u64, hash[0..8], .big)},
    );

    return .{
        .public_key_pem = pem,
        .private_key_seed = seed,
        .key_id = key_id,
    };
}

/// Compute SHA256 checksum of data
pub fn computeSHA256(allocator: std.mem.Allocator, data: []const u8) ![]const u8 {
    var hasher = std.crypto.hash.sha2.Sha256.init(.{});
    hasher.update(data);
    var hash: [32]u8 = undefined;
    hasher.final(&hash);

    // Convert to hex string
    return try std.fmt.allocPrint(allocator, "{x}", .{std.fmt.fmtSliceHexLower(&hash)});
}

/// Compute SHA512 checksum of data
pub fn computeSHA512(allocator: std.mem.Allocator, data: []const u8) ![]const u8 {
    var hasher = std.crypto.hash.sha2.Sha512.init(.{});
    hasher.update(data);
    var hash: [64]u8 = undefined;
    hasher.final(&hash);

    // Convert to hex string
    return try std.fmt.allocPrint(allocator, "{x}", .{std.fmt.fmtSliceHexLower(&hash)});
}
