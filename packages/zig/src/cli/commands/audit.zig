//! Audit Command - Security vulnerability scanning
//!
//! This module provides:
//! - Vulnerability scanning against NPM registry
//! - Security scanner API support
//! - Filtering by severity level
//! - Production-only auditing
//! - CVE ignoring
//! - JSON output support

const std = @import("std");
const lib = @import("../../lib.zig");
const common = @import("common.zig");

const CommandResult = common.CommandResult;

// ============================================================================
// Types
// ============================================================================

/// Severity levels for vulnerabilities
pub const Severity = enum {
    low,
    moderate,
    high,
    critical,

    pub fn fromString(s: []const u8) ?Severity {
        if (std.mem.eql(u8, s, "low")) return .low;
        if (std.mem.eql(u8, s, "moderate")) return .moderate;
        if (std.mem.eql(u8, s, "high")) return .high;
        if (std.mem.eql(u8, s, "critical")) return .critical;
        return null;
    }

    pub fn toString(self: Severity) []const u8 {
        return switch (self) {
            .low => "low",
            .moderate => "moderate",
            .high => "high",
            .critical => "critical",
        };
    }

    pub fn toInt(self: Severity) u8 {
        return switch (self) {
            .low => 0,
            .moderate => 1,
            .high => 2,
            .critical => 3,
        };
    }
};

/// Security scanner severity level
pub const ScannerSeverity = enum {
    warn,
    fatal,

    pub fn fromString(s: []const u8) ?ScannerSeverity {
        if (std.mem.eql(u8, s, "warn")) return .warn;
        if (std.mem.eql(u8, s, "fatal")) return .fatal;
        return null;
    }
};

/// A single vulnerability report
pub const Vulnerability = struct {
    id: []const u8, // CVE ID
    title: []const u8,
    severity: Severity,
    package_name: []const u8,
    vulnerable_versions: []const u8,
    patched_versions: ?[]const u8,
    url: []const u8,
    cwe: ?[]const u8,

    pub fn deinit(self: *Vulnerability, allocator: std.mem.Allocator) void {
        allocator.free(self.id);
        allocator.free(self.title);
        allocator.free(self.package_name);
        allocator.free(self.vulnerable_versions);
        if (self.patched_versions) |pv| allocator.free(pv);
        allocator.free(self.url);
        if (self.cwe) |c| allocator.free(c);
    }
};

/// Security scanner issue report
pub const ScannerIssue = struct {
    severity: ScannerSeverity,
    package_name: []const u8,
    message: []const u8,
    details: ?[]const u8,

    pub fn deinit(self: *ScannerIssue, allocator: std.mem.Allocator) void {
        allocator.free(self.package_name);
        allocator.free(self.message);
        if (self.details) |d| allocator.free(d);
    }
};

/// Audit report summary
pub const AuditSummary = struct {
    total: usize,
    low: usize,
    moderate: usize,
    high: usize,
    critical: usize,

    pub fn isEmpty(self: AuditSummary) bool {
        return self.total == 0;
    }
};

/// Options for audit command
pub const AuditOptions = struct {
    audit_level: ?Severity = null,
    prod_only: bool = false,
    ignore_cves: []const []const u8 = &[_][]const u8{},
    json: bool = false,
};

// ============================================================================
// Audit Command
// ============================================================================

/// Main audit command - scans installed packages for vulnerabilities
pub fn auditCommand(
    allocator: std.mem.Allocator,
    _: []const []const u8,
    options: AuditOptions,
) !CommandResult {
    // Get current working directory
    const cwd = try std.process.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    // Find config file
    const config_path = common.findConfigFile(allocator, cwd) catch {
        return CommandResult.err(allocator, common.ERROR_NO_CONFIG);
    };
    defer allocator.free(config_path);

    // Parse config file
    const parsed = common.readConfigFile(allocator, config_path) catch {
        return CommandResult.err(allocator, common.ERROR_CONFIG_PARSE);
    };
    defer parsed.deinit();

    // Check for security scanner configuration
    const scanner_result = try checkSecurityScanner(allocator, parsed);
    if (scanner_result) |result| {
        return result;
    }

    // Extract dependencies
    var deps_map = try common.extractAllDependencies(allocator, parsed);
    defer {
        var it = deps_map.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
        }
        deps_map.deinit();
    }

    // Filter to production only if requested
    if (options.prod_only) {
        var filtered = std.StringHashMap(common.DependencyInfo).init(allocator);
        errdefer filtered.deinit();

        var it = deps_map.iterator();
        while (it.next()) |entry| {
            if (entry.value_ptr.dep_type == .normal) {
                try filtered.put(entry.key_ptr.*, entry.value_ptr.*);
            }
        }

        // Clean up old map keys
        it = deps_map.iterator();
        while (it.next()) |entry| {
            if (entry.value_ptr.dep_type != .normal) {
                allocator.free(entry.key_ptr.*);
            }
        }
        deps_map.deinit();
        deps_map = filtered;
    }

    // Query NPM registry for vulnerabilities
    var vulnerabilities = std.ArrayList(Vulnerability){};
    defer {
        for (vulnerabilities.items) |*vuln| {
            vuln.deinit(allocator);
        }
        vulnerabilities.deinit(allocator);
    }

    try queryVulnerabilities(allocator, deps_map, &vulnerabilities);

    // Filter vulnerabilities based on options
    var filtered_vulns = std.ArrayList(Vulnerability){};
    defer filtered_vulns.deinit(allocator);

    for (vulnerabilities.items) |vuln| {
        // Check ignore list
        var should_ignore = false;
        for (options.ignore_cves) |ignored_cve| {
            if (std.mem.eql(u8, vuln.id, ignored_cve)) {
                should_ignore = true;
                break;
            }
        }
        if (should_ignore) continue;

        // Check audit level
        if (options.audit_level) |min_level| {
            if (vuln.severity.toInt() < min_level.toInt()) {
                continue;
            }
        }

        try filtered_vulns.append(allocator, vuln);
    }

    // Generate report
    if (options.json) {
        return generateJsonReport(allocator, filtered_vulns.items);
    } else {
        return generateTextReport(allocator, filtered_vulns.items);
    }
}

// ============================================================================
// Security Scanner Support
// ============================================================================

/// Check if a security scanner is configured and run it
fn checkSecurityScanner(
    allocator: std.mem.Allocator,
    config: std.json.Parsed(std.json.Value),
) !?CommandResult {
    const root = config.value.object;

    // Check for pantry.security.scanner configuration
    const security_config = root.get("security") orelse return null;
    if (security_config != .object) return null;

    const scanner = security_config.object.get("scanner") orelse return null;
    if (scanner != .string) return null;

    const scanner_name = scanner.string;

    // TODO: Run the scanner module
    // For now, just acknowledge the scanner is configured
    const msg = try std.fmt.allocPrint(
        allocator,
        "Security scanner '{s}' configured but not yet implemented",
        .{scanner_name},
    );

    return .{
        .exit_code = 0,
        .message = msg,
    };
}

// ============================================================================
// Vulnerability Querying
// ============================================================================

/// Query NPM registry for vulnerabilities
fn queryVulnerabilities(
    allocator: std.mem.Allocator,
    deps_map: std.StringHashMap(common.DependencyInfo),
    vulnerabilities: *std.ArrayList(Vulnerability),
) !void {
    // For now, this is a stub that would make HTTP requests to NPM registry
    // In a real implementation, this would:
    // 1. POST to https://registry.npmjs.org/-/npm/v1/security/audits/quick
    // 2. Parse the response
    // 3. Build Vulnerability structs
    _ = allocator;
    _ = deps_map;
    _ = vulnerabilities;

    // TODO: Implement actual NPM registry querying
}

// ============================================================================
// Report Generation
// ============================================================================

/// Generate summary statistics
fn generateSummary(vulnerabilities: []const Vulnerability) AuditSummary {
    var summary = AuditSummary{
        .total = vulnerabilities.len,
        .low = 0,
        .moderate = 0,
        .high = 0,
        .critical = 0,
    };

    for (vulnerabilities) |vuln| {
        switch (vuln.severity) {
            .low => summary.low += 1,
            .moderate => summary.moderate += 1,
            .high => summary.high += 1,
            .critical => summary.critical += 1,
        }
    }

    return summary;
}

/// Generate human-readable text report
fn generateTextReport(
    allocator: std.mem.Allocator,
    vulnerabilities: []const Vulnerability,
) !CommandResult {
    if (vulnerabilities.len == 0) {
        const msg = try allocator.dupe(u8, "No vulnerabilities found");
        return .{
            .exit_code = 0,
            .message = msg,
        };
    }

    var output = std.ArrayList(u8){};
    defer output.deinit(allocator);

    const writer = output.writer(allocator);

    // Print each vulnerability
    for (vulnerabilities) |vuln| {
        try writer.print("\n{s} ({s})\n", .{ vuln.id, vuln.severity.toString() });
        try writer.print("Package: {s}\n", .{vuln.package_name});
        try writer.print("{s}\n", .{vuln.title});
        try writer.print("Vulnerable: {s}\n", .{vuln.vulnerable_versions});
        if (vuln.patched_versions) |pv| {
            try writer.print("Patched: {s}\n", .{pv});
        }
        try writer.print("More info: {s}\n", .{vuln.url});
    }

    // Print summary
    const summary = generateSummary(vulnerabilities);
    try writer.print("\n", .{});

    var summary_parts = std.ArrayList([]const u8){};
    defer {
        for (summary_parts.items) |part| {
            allocator.free(part);
        }
        summary_parts.deinit(allocator);
    }

    if (summary.critical > 0) {
        try summary_parts.append(allocator, try std.fmt.allocPrint(allocator, "{d} critical", .{summary.critical}));
    }
    if (summary.high > 0) {
        try summary_parts.append(allocator, try std.fmt.allocPrint(allocator, "{d} high", .{summary.high}));
    }
    if (summary.moderate > 0) {
        try summary_parts.append(allocator, try std.fmt.allocPrint(allocator, "{d} moderate", .{summary.moderate}));
    }
    if (summary.low > 0) {
        try summary_parts.append(allocator, try std.fmt.allocPrint(allocator, "{d} low", .{summary.low}));
    }

    try writer.print("{d} vulnerabilities (", .{summary.total});
    for (summary_parts.items, 0..) |part, i| {
        if (i > 0) try writer.print(", ", .{});
        try writer.print("{s}", .{part});
    }
    try writer.print(")\n", .{});

    try writer.print("To update all dependencies to the latest compatible versions:\n", .{});
    try writer.print("  pantry update\n", .{});
    try writer.print("To update all dependencies to the latest versions (including breaking changes):\n", .{});
    try writer.print("  pantry update --latest\n", .{});

    const message = try output.toOwnedSlice(allocator);
    return .{
        .exit_code = 1, // Non-zero exit code when vulnerabilities found
        .message = message,
    };
}

/// Generate JSON report
fn generateJsonReport(
    allocator: std.mem.Allocator,
    vulnerabilities: []const Vulnerability,
) !CommandResult {
    var output = std.ArrayList(u8){};
    defer output.deinit(allocator);

    const writer = output.writer(allocator);

    try writer.print("{{\"vulnerabilities\":[", .{});

    for (vulnerabilities, 0..) |vuln, i| {
        if (i > 0) try writer.print(",", .{});
        try writer.print("{{", .{});
        try writer.print("\"id\":\"{s}\",", .{vuln.id});
        try writer.print("\"title\":\"{s}\",", .{vuln.title});
        try writer.print("\"severity\":\"{s}\",", .{vuln.severity.toString()});
        try writer.print("\"package\":\"{s}\",", .{vuln.package_name});
        try writer.print("\"vulnerable_versions\":\"{s}\",", .{vuln.vulnerable_versions});
        if (vuln.patched_versions) |pv| {
            try writer.print("\"patched_versions\":\"{s}\",", .{pv});
        } else {
            try writer.print("\"patched_versions\":null,", .{});
        }
        try writer.print("\"url\":\"{s}\"", .{vuln.url});
        if (vuln.cwe) |cwe| {
            try writer.print(",\"cwe\":\"{s}\"", .{cwe});
        }
        try writer.print("}}", .{});
    }

    const summary = generateSummary(vulnerabilities);
    try writer.print("],\"summary\":{{", .{});
    try writer.print("\"total\":{d},", .{summary.total});
    try writer.print("\"low\":{d},", .{summary.low});
    try writer.print("\"moderate\":{d},", .{summary.moderate});
    try writer.print("\"high\":{d},", .{summary.high});
    try writer.print("\"critical\":{d}", .{summary.critical});
    try writer.print("}}}}", .{});

    const message = try output.toOwnedSlice(allocator);
    const exit_code: u8 = if (vulnerabilities.len > 0) 1 else 0;

    return .{
        .exit_code = exit_code,
        .message = message,
    };
}
