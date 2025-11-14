const std = @import("std");
const signing = @import("signing.zig");

/// Signature policy enforcement level
pub const PolicyLevel = enum {
    /// No signature verification required
    none,
    /// Warn if signatures are missing or invalid, but allow installation
    warn,
    /// Require valid signatures for all packages
    strict,

    pub fn fromString(s: []const u8) ?PolicyLevel {
        if (std.mem.eql(u8, s, "none")) return .none;
        if (std.mem.eql(u8, s, "warn")) return .warn;
        if (std.mem.eql(u8, s, "strict")) return .strict;
        return null;
    }

    pub fn toString(self: PolicyLevel) []const u8 {
        return switch (self) {
            .none => "none",
            .warn => "warn",
            .strict => "strict",
        };
    }
};

/// Signature policy configuration
pub const SignaturePolicy = struct {
    /// Enforcement level
    level: PolicyLevel,

    /// List of package patterns that require signatures (e.g., "@org/*", "lodash")
    /// If null, policy applies to all packages
    required_for: ?[][]const u8 = null,

    /// List of package patterns exempt from signature requirements
    /// Useful for internal/private packages
    exempt: ?[][]const u8 = null,

    /// Require specific key IDs (trusted signers)
    /// If null, any key in the keyring is accepted
    trusted_keys: ?[][]const u8 = null,

    /// Allow self-signed certificates for development
    allow_self_signed: bool = false,

    pub fn deinit(self: *SignaturePolicy, allocator: std.mem.Allocator) void {
        if (self.required_for) |patterns| {
            for (patterns) |pattern| {
                allocator.free(pattern);
            }
            allocator.free(patterns);
        }
        if (self.exempt) |patterns| {
            for (patterns) |pattern| {
                allocator.free(pattern);
            }
            allocator.free(patterns);
        }
        if (self.trusted_keys) |keys| {
            for (keys) |key| {
                allocator.free(key);
            }
            allocator.free(keys);
        }
    }
};

/// Policy violation
pub const PolicyViolation = struct {
    package_name: []const u8,
    reason: Reason,
    details: ?[]const u8 = null,

    pub const Reason = enum {
        missing_signature,
        invalid_signature,
        untrusted_key,
        signature_verification_failed,
        policy_violation,
    };

    pub fn deinit(self: *PolicyViolation, allocator: std.mem.Allocator) void {
        allocator.free(self.package_name);
        if (self.details) |d| allocator.free(d);
    }

    pub fn format(self: PolicyViolation) []const u8 {
        return switch (self.reason) {
            .missing_signature => "Package has no signature",
            .invalid_signature => "Package signature is invalid",
            .untrusted_key => "Package signed by untrusted key",
            .signature_verification_failed => "Signature verification failed",
            .policy_violation => "Package violates signature policy",
        };
    }
};

/// Policy enforcement result
pub const PolicyResult = struct {
    allowed: bool,
    violations: []PolicyViolation,
    warnings: [][]const u8,

    pub fn deinit(self: *PolicyResult, allocator: std.mem.Allocator) void {
        for (self.violations) |*v| {
            v.deinit(allocator);
        }
        allocator.free(self.violations);

        for (self.warnings) |w| {
            allocator.free(w);
        }
        allocator.free(self.warnings);
    }
};

/// Check if a package name matches a pattern
fn matchesPattern(package_name: []const u8, pattern: []const u8) bool {
    // Simple glob matching: "*" matches anything
    if (std.mem.eql(u8, pattern, "*")) return true;

    // Exact match
    if (std.mem.eql(u8, package_name, pattern)) return true;

    // Scoped package pattern: "@org/*"
    if (std.mem.endsWith(u8, pattern, "/*")) {
        const prefix = pattern[0 .. pattern.len - 2];
        return std.mem.startsWith(u8, package_name, prefix);
    }

    // Prefix pattern: "lodash*"
    if (std.mem.endsWith(u8, pattern, "*")) {
        const prefix = pattern[0 .. pattern.len - 1];
        return std.mem.startsWith(u8, package_name, prefix);
    }

    return false;
}

/// Check if a package is exempt from signature requirements
fn isExempt(policy: *const SignaturePolicy, package_name: []const u8) bool {
    if (policy.exempt) |patterns| {
        for (patterns) |pattern| {
            if (matchesPattern(package_name, pattern)) {
                return true;
            }
        }
    }
    return false;
}

/// Check if a package requires a signature
fn requiresSignature(policy: *const SignaturePolicy, package_name: []const u8) bool {
    // If package is exempt, it doesn't require signature
    if (isExempt(policy, package_name)) return false;

    // If no required_for patterns, all packages require signatures
    if (policy.required_for == null) return true;

    // Check if package matches any required pattern
    if (policy.required_for) |patterns| {
        for (patterns) |pattern| {
            if (matchesPattern(package_name, pattern)) {
                return true;
            }
        }
    }

    return false;
}

/// Enforce signature policy for a package
pub fn enforcePolicy(
    allocator: std.mem.Allocator,
    policy: *const SignaturePolicy,
    package_name: []const u8,
    signature: ?*const signing.PackageSignature,
    package_data: []const u8,
    keyring: *const signing.Keyring,
) !PolicyResult {
    var violations = std.ArrayList(PolicyViolation).init(allocator);
    errdefer {
        for (violations.items) |*v| {
            v.deinit(allocator);
        }
        violations.deinit();
    }

    var warnings = std.ArrayList([]const u8).init(allocator);
    errdefer {
        for (warnings.items) |w| {
            allocator.free(w);
        }
        warnings.deinit();
    }

    // If policy level is none, allow everything
    if (policy.level == .none) {
        return PolicyResult{
            .allowed = true,
            .violations = try violations.toOwnedSlice(),
            .warnings = try warnings.toOwnedSlice(),
        };
    }

    // Check if package requires signature
    const needs_signature = requiresSignature(policy, package_name);

    if (!needs_signature) {
        // Package doesn't require signature, allow it
        return PolicyResult{
            .allowed = true,
            .violations = try violations.toOwnedSlice(),
            .warnings = try warnings.toOwnedSlice(),
        };
    }

    // Package requires signature - check if it has one
    if (signature == null) {
        const violation = PolicyViolation{
            .package_name = try allocator.dupe(u8, package_name),
            .reason = .missing_signature,
            .details = try std.fmt.allocPrint(
                allocator,
                "Package '{s}' requires a signature but none was provided",
                .{package_name},
            ),
        };
        try violations.append(violation);

        if (policy.level == .warn) {
            try warnings.append(try std.fmt.allocPrint(
                allocator,
                "Warning: {s} - {s}",
                .{ package_name, violation.format() },
            ));
            return PolicyResult{
                .allowed = true,
                .violations = try violations.toOwnedSlice(),
                .warnings = try warnings.toOwnedSlice(),
            };
        }

        return PolicyResult{
            .allowed = false,
            .violations = try violations.toOwnedSlice(),
            .warnings = try warnings.toOwnedSlice(),
        };
    }

    const sig = signature.?;

    // Check if key is trusted (if trusted_keys is specified)
    if (policy.trusted_keys) |trusted| {
        var is_trusted = false;
        for (trusted) |key_id| {
            if (std.mem.eql(u8, sig.key_id, key_id)) {
                is_trusted = true;
                break;
            }
        }

        if (!is_trusted) {
            const violation = PolicyViolation{
                .package_name = try allocator.dupe(u8, package_name),
                .reason = .untrusted_key,
                .details = try std.fmt.allocPrint(
                    allocator,
                    "Package '{s}' signed by untrusted key: {s}",
                    .{ package_name, sig.key_id },
                ),
            };
            try violations.append(violation);

            if (policy.level == .warn) {
                try warnings.append(try std.fmt.allocPrint(
                    allocator,
                    "Warning: {s} - {s}",
                    .{ package_name, violation.format() },
                ));
                return PolicyResult{
                    .allowed = true,
                    .violations = try violations.toOwnedSlice(),
                    .warnings = try warnings.toOwnedSlice(),
                };
            }

            return PolicyResult{
                .allowed = false,
                .violations = try violations.toOwnedSlice(),
                .warnings = try warnings.toOwnedSlice(),
            };
        }
    }

    // Verify the signature
    signing.verifyPackageSignature(package_data, sig, keyring) catch |err| {
        const violation = PolicyViolation{
            .package_name = try allocator.dupe(u8, package_name),
            .reason = .signature_verification_failed,
            .details = try std.fmt.allocPrint(
                allocator,
                "Signature verification failed for '{s}': {any}",
                .{ package_name, err },
            ),
        };
        try violations.append(violation);

        if (policy.level == .warn) {
            try warnings.append(try std.fmt.allocPrint(
                allocator,
                "Warning: {s} - {s}",
                .{ package_name, violation.format() },
            ));
            return PolicyResult{
                .allowed = true,
                .violations = try violations.toOwnedSlice(),
                .warnings = try warnings.toOwnedSlice(),
            };
        }

        return PolicyResult{
            .allowed = false,
            .violations = try violations.toOwnedSlice(),
            .warnings = try warnings.toOwnedSlice(),
        };
    };

    // Signature is valid
    return PolicyResult{
        .allowed = true,
        .violations = try violations.toOwnedSlice(),
        .warnings = try warnings.toOwnedSlice(),
    };
}

/// Load signature policy from configuration
pub fn loadFromConfig(allocator: std.mem.Allocator, config: std.json.Value) !SignaturePolicy {
    if (config != .object) return error.InvalidConfig;

    const obj = config.object;

    // Get policy level
    const level_str = if (obj.get("level")) |l|
        if (l == .string) l.string else "none"
    else
        "none";

    const level = PolicyLevel.fromString(level_str) orelse .none;

    // Get required_for patterns
    var required_for: ?[][]const u8 = null;
    if (obj.get("requiredFor")) |rf| {
        if (rf == .array) {
            var patterns = std.ArrayList([]const u8).init(allocator);
            for (rf.array.items) |item| {
                if (item == .string) {
                    try patterns.append(try allocator.dupe(u8, item.string));
                }
            }
            required_for = try patterns.toOwnedSlice();
        }
    }

    // Get exempt patterns
    var exempt: ?[][]const u8 = null;
    if (obj.get("exempt")) |ex| {
        if (ex == .array) {
            var patterns = std.ArrayList([]const u8).init(allocator);
            for (ex.array.items) |item| {
                if (item == .string) {
                    try patterns.append(try allocator.dupe(u8, item.string));
                }
            }
            exempt = try patterns.toOwnedSlice();
        }
    }

    // Get trusted keys
    var trusted_keys: ?[][]const u8 = null;
    if (obj.get("trustedKeys")) |tk| {
        if (tk == .array) {
            var keys = std.ArrayList([]const u8).init(allocator);
            for (tk.array.items) |item| {
                if (item == .string) {
                    try keys.append(try allocator.dupe(u8, item.string));
                }
            }
            trusted_keys = try keys.toOwnedSlice();
        }
    }

    // Get allow_self_signed
    const allow_self_signed = if (obj.get("allowSelfSigned")) |ass|
        if (ass == .bool) ass.bool else false
    else
        false;

    return SignaturePolicy{
        .level = level,
        .required_for = required_for,
        .exempt = exempt,
        .trusted_keys = trusted_keys,
        .allow_self_signed = allow_self_signed,
    };
}
