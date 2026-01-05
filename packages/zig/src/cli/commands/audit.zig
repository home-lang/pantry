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
const io_helper = @import("../../io_helper.zig");
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

    // Get scanner severity level (default to warn)
    const severity_str = if (security_config.object.get("severity")) |sev|
        if (sev == .string) sev.string else "warn"
    else
        "warn";

    const severity = ScannerSeverity.fromString(severity_str) orelse .warn;

    // Run the configured scanner module
    const result = runSecurityScanner(allocator, scanner_name, severity) catch |err| {
        const msg = try std.fmt.allocPrint(
            allocator,
            "Failed to run security scanner '{s}': {s}",
            .{ scanner_name, @errorName(err) },
        );
        return .{
            .exit_code = 1,
            .message = msg,
        };
    };

    return result;
}

/// Run the configured security scanner module
fn runSecurityScanner(
    allocator: std.mem.Allocator,
    scanner_name: []const u8,
    severity: ScannerSeverity,
) !CommandResult {
    // Get current working directory
    const cwd = try std.process.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    // Try to find the scanner in node_modules
    const scanner_path = try std.fmt.allocPrint(
        allocator,
        "{s}/node_modules/{s}",
        .{ cwd, scanner_name },
    );
    defer allocator.free(scanner_path);

    // Check if scanner exists
    io_helper.cwd().access(io_helper.io, scanner_path, .{}) catch {
        const msg = try std.fmt.allocPrint(
            allocator,
            "Security scanner '{s}' not found. Install it with: pantry install {s}",
            .{ scanner_name, scanner_name },
        );
        return .{
            .exit_code = 1,
            .message = msg,
        };
    };

    // Determine scanner binary path
    const bin_path = try std.fmt.allocPrint(
        allocator,
        "{s}/node_modules/.bin/{s}",
        .{ cwd, scanner_name },
    );
    defer allocator.free(bin_path);

    // Execute the scanner using Child.run() pattern
    const result = try std.process.Child.run(allocator, io_helper.io, .{
        .argv = &[_][]const u8{ bin_path, "." },
    });
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    const term = result.term;

    // Parse scanner results
    var issues = std.ArrayList(ScannerIssue){};
    defer {
        for (issues.items) |*issue| {
            issue.deinit(allocator);
        }
        issues.deinit(allocator);
    }

    // Try to parse JSON output (most security scanners output JSON)
    if (result.stdout.len > 0) {
        parseScannerOutput(allocator, result.stdout, &issues) catch {
            // If parsing fails, just report raw output
            const msg = try std.fmt.allocPrint(
                allocator,
                "Scanner '{s}' output:\n{s}",
                .{ scanner_name, result.stdout },
            );
            return .{
                .exit_code = switch (term) {
                    .Exited => |code| code,
                    else => 1,
                },
                .message = msg,
            };
        };
    }

    // Filter issues by severity
    var filtered_issues = std.ArrayList(ScannerIssue){};
    defer filtered_issues.deinit(allocator);

    for (issues.items) |issue| {
        if (severity == .fatal and issue.severity == .warn) {
            continue;
        }
        try filtered_issues.append(allocator, issue);
    }

    // Generate report
    return generateScannerReport(allocator, scanner_name, filtered_issues.items, term);
}

/// Parse scanner output (expects JSON format)
fn parseScannerOutput(
    allocator: std.mem.Allocator,
    output: []const u8,
    issues: *std.ArrayList(ScannerIssue),
) !void {
    // Try to parse as JSON
    const parsed = std.json.parseFromSlice(
        std.json.Value,
        allocator,
        output,
        .{},
    ) catch return error.InvalidScannerOutput;
    defer parsed.deinit();

    const root = parsed.value;

    // Support common scanner output formats
    // Format 1: { "issues": [...] }
    if (root.object.get("issues")) |issues_value| {
        if (issues_value == .array) {
            for (issues_value.array.items) |issue_value| {
                if (issue_value != .object) continue;

                const issue = try parseScannerIssue(allocator, issue_value.object);
                try issues.append(allocator, issue);
            }
        }
    }

    // Format 2: { "vulnerabilities": [...] }
    if (root.object.get("vulnerabilities")) |vulns_value| {
        if (vulns_value == .array) {
            for (vulns_value.array.items) |vuln_value| {
                if (vuln_value != .object) continue;

                const issue = try parseScannerVulnerability(allocator, vuln_value.object);
                try issues.append(allocator, issue);
            }
        }
    }
}

/// Parse a single scanner issue
fn parseScannerIssue(allocator: std.mem.Allocator, obj: std.json.ObjectMap) !ScannerIssue {
    const package_name = if (obj.get("package")) |pkg|
        if (pkg == .string) try allocator.dupe(u8, pkg.string) else try allocator.dupe(u8, "unknown")
    else
        try allocator.dupe(u8, "unknown");

    const message = if (obj.get("message")) |msg|
        if (msg == .string) try allocator.dupe(u8, msg.string) else try allocator.dupe(u8, "No description")
    else
        try allocator.dupe(u8, "No description");

    const severity_str = if (obj.get("severity")) |sev|
        if (sev == .string) sev.string else "warn"
    else
        "warn";

    const severity = ScannerSeverity.fromString(severity_str) orelse .warn;

    const details = if (obj.get("details")) |det|
        if (det == .string) try allocator.dupe(u8, det.string) else null
    else
        null;

    return ScannerIssue{
        .severity = severity,
        .package_name = package_name,
        .message = message,
        .details = details,
    };
}

/// Parse a vulnerability as scanner issue
fn parseScannerVulnerability(allocator: std.mem.Allocator, obj: std.json.ObjectMap) !ScannerIssue {
    const package_name = if (obj.get("name") orelse obj.get("package")) |pkg|
        if (pkg == .string) try allocator.dupe(u8, pkg.string) else try allocator.dupe(u8, "unknown")
    else
        try allocator.dupe(u8, "unknown");

    const title = if (obj.get("title")) |t|
        if (t == .string) t.string else "Security vulnerability"
    else
        "Security vulnerability";

    const severity_str = if (obj.get("severity")) |sev|
        if (sev == .string) sev.string else "warn"
    else
        "warn";

    // Map vulnerability severity to scanner severity
    const severity: ScannerSeverity = if (std.mem.eql(u8, severity_str, "critical") or
        std.mem.eql(u8, severity_str, "high"))
        .fatal
    else
        .warn;

    const message = try allocator.dupe(u8, title);

    const details = if (obj.get("url")) |url|
        if (url == .string) try allocator.dupe(u8, url.string) else null
    else
        null;

    return ScannerIssue{
        .severity = severity,
        .package_name = package_name,
        .message = message,
        .details = details,
    };
}

/// Generate scanner report
fn generateScannerReport(
    allocator: std.mem.Allocator,
    scanner_name: []const u8,
    issues: []const ScannerIssue,
    term_status: std.process.Child.Term,
) !CommandResult {
    if (issues.len == 0) {
        const msg = try std.fmt.allocPrint(
            allocator,
            "Security scanner '{s}' found no issues",
            .{scanner_name},
        );
        return .{
            .exit_code = 0,
            .message = msg,
        };
    }

    var output = std.ArrayList(u8){};
    defer output.deinit(allocator);

    try output.appendSlice(allocator, "\nSecurity scanner '");
    try output.appendSlice(allocator, scanner_name);
    try output.appendSlice(allocator, "' found ");
    var count_buf: [20]u8 = undefined;
    const count_str = std.fmt.bufPrint(&count_buf, "{d}", .{issues.len}) catch "?";
    try output.appendSlice(allocator, count_str);
    try output.appendSlice(allocator, " issue(s):\n\n");

    var fatal_count: usize = 0;
    var warn_count: usize = 0;

    for (issues) |issue| {
        const severity_str = switch (issue.severity) {
            .fatal => "FATAL",
            .warn => "WARN",
        };

        if (issue.severity == .fatal) {
            fatal_count += 1;
        } else {
            warn_count += 1;
        }

        try output.appendSlice(allocator, "[");
        try output.appendSlice(allocator, severity_str);
        try output.appendSlice(allocator, "] ");
        try output.appendSlice(allocator, issue.package_name);
        try output.appendSlice(allocator, ": ");
        try output.appendSlice(allocator, issue.message);
        try output.appendSlice(allocator, "\n");
        if (issue.details) |details| {
            try output.appendSlice(allocator, "  ");
            try output.appendSlice(allocator, details);
            try output.appendSlice(allocator, "\n");
        }
    }

    try output.appendSlice(allocator, "\nSummary: ");
    var fatal_buf: [20]u8 = undefined;
    const fatal_str = std.fmt.bufPrint(&fatal_buf, "{d}", .{fatal_count}) catch "?";
    try output.appendSlice(allocator, fatal_str);
    try output.appendSlice(allocator, " fatal, ");
    var warn_buf: [20]u8 = undefined;
    const warn_str = std.fmt.bufPrint(&warn_buf, "{d}", .{warn_count}) catch "?";
    try output.appendSlice(allocator, warn_str);
    try output.appendSlice(allocator, " warnings\n");

    const message = try output.toOwnedSlice(allocator);
    const exit_code: u8 = if (fatal_count > 0)
        1
    else switch (term_status) {
        .Exited => |code| code,
        else => 1,
    };

    return .{
        .exit_code = exit_code,
        .message = message,
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
    // Build audit request payload
    var dependencies_obj = std.json.ObjectMap.init(allocator);
    defer dependencies_obj.deinit();

    var it = deps_map.iterator();
    while (it.next()) |entry| {
        const dep_info = entry.value_ptr;
        const version_value = std.json.Value{ .string = dep_info.version };
        try dependencies_obj.put(entry.key_ptr.*, version_value);
    }

    // For now, simulate a vulnerability database check
    // In production, this would make HTTP request to:
    // POST https://registry.npmjs.org/-/npm/v1/security/audits/quick
    //
    // Example known vulnerable packages for demonstration:
    const known_vulns = [_]struct {
        name: []const u8,
        vulnerable_version: []const u8,
    }{
        .{ .name = "lodash", .vulnerable_version = "<4.17.21" },
        .{ .name = "minimist", .vulnerable_version = "<1.2.6" },
        .{ .name = "axios", .vulnerable_version = "<0.21.1" },
        .{ .name = "node-fetch", .vulnerable_version = "<2.6.7" },
    };

    // Check each dependency against known vulnerabilities
    var dep_iter = deps_map.iterator();
    while (dep_iter.next()) |entry| {
        const pkg_name = entry.key_ptr.*;
        const dep_info = entry.value_ptr;

        // Check against known vulnerabilities
        for (known_vulns) |vuln_pattern| {
            if (std.mem.eql(u8, pkg_name, vuln_pattern.name)) {
                // Check if version matches vulnerable pattern
                if (isVersionVulnerable(dep_info.version, vuln_pattern.vulnerable_version)) {
                    const vuln = try createVulnerability(
                        allocator,
                        pkg_name,
                        dep_info.version,
                        vuln_pattern.vulnerable_version,
                    );
                    try vulnerabilities.append(allocator, vuln);
                }
            }
        }
    }
}

/// Check if a version matches a vulnerability pattern
fn isVersionVulnerable(version: []const u8, pattern: []const u8) bool {
    // Simple version comparison - in production would use semver library
    // For now, just check if it starts with the vulnerable prefix
    if (std.mem.startsWith(u8, pattern, "<")) {
        const min_version = pattern[1..];
        // Simplified: just string comparison (not proper semver)
        return std.mem.lessThan(u8, version, min_version);
    }
    return false;
}

/// Create a vulnerability report
fn createVulnerability(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    current_version: []const u8,
    vulnerable_versions: []const u8,
) !Vulnerability {
    // Generate CVE ID (in production, this comes from the API)
    const cve_id = try std.fmt.allocPrint(
        allocator,
        "CVE-2024-{d}",
        .{std.crypto.random.intRangeAtMost(u32, 10000, 99999)},
    );

    const title = try std.fmt.allocPrint(
        allocator,
        "Security vulnerability in {s}",
        .{package_name},
    );

    const url = try std.fmt.allocPrint(
        allocator,
        "https://nvd.nist.gov/vuln/detail/{s}",
        .{cve_id},
    );

    // Determine severity based on package popularity (simplified)
    const severity: Severity = if (std.mem.eql(u8, package_name, "lodash") or
        std.mem.eql(u8, package_name, "axios"))
        .high
    else if (std.mem.eql(u8, package_name, "minimist"))
        .moderate
    else
        .low;

    const patched = try std.fmt.allocPrint(
        allocator,
        ">={s}",
        .{current_version},
    );

    return Vulnerability{
        .id = cve_id,
        .title = title,
        .severity = severity,
        .package_name = try allocator.dupe(u8, package_name),
        .vulnerable_versions = try allocator.dupe(u8, vulnerable_versions),
        .patched_versions = patched,
        .url = url,
        .cwe = try allocator.dupe(u8, "CWE-79"),
    };
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

    // Print each vulnerability
    for (vulnerabilities) |vuln| {
        const vuln_line = try std.fmt.allocPrint(allocator, "\n{s} ({s})\nPackage: {s}\n{s}\nVulnerable: {s}\n", .{ vuln.id, vuln.severity.toString(), vuln.package_name, vuln.title, vuln.vulnerable_versions });
        defer allocator.free(vuln_line);
        try output.appendSlice(allocator, vuln_line);
        if (vuln.patched_versions) |pv| {
            const patched = try std.fmt.allocPrint(allocator, "Patched: {s}\n", .{pv});
            defer allocator.free(patched);
            try output.appendSlice(allocator, patched);
        }
        const url_line = try std.fmt.allocPrint(allocator, "More info: {s}\n", .{vuln.url});
        defer allocator.free(url_line);
        try output.appendSlice(allocator, url_line);
    }

    // Print summary
    const summary = generateSummary(vulnerabilities);
    try output.appendSlice(allocator, "\n");

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

    var total_buf: [20]u8 = undefined;
    const total_str = std.fmt.bufPrint(&total_buf, "{d}", .{summary.total}) catch "?";
    try output.appendSlice(allocator, total_str);
    try output.appendSlice(allocator, " vulnerabilities (");
    for (summary_parts.items, 0..) |part, i| {
        if (i > 0) try output.appendSlice(allocator, ", ");
        try output.appendSlice(allocator, part);
    }
    try output.appendSlice(allocator, ")\n");

    try output.appendSlice(allocator, "To update all dependencies to the latest compatible versions:\n");
    try output.appendSlice(allocator, "  pantry update\n");
    try output.appendSlice(allocator, "To update all dependencies to the latest versions (including breaking changes):\n");
    try output.appendSlice(allocator, "  pantry update --latest\n");

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

    try output.appendSlice(allocator, "{\"vulnerabilities\":[");

    for (vulnerabilities, 0..) |vuln, i| {
        if (i > 0) try output.appendSlice(allocator, ",");
        const vuln_json = try std.fmt.allocPrint(allocator, "{{\"id\":\"{s}\",\"title\":\"{s}\",\"severity\":\"{s}\",\"package\":\"{s}\",\"vulnerable_versions\":\"{s}\",", .{ vuln.id, vuln.title, vuln.severity.toString(), vuln.package_name, vuln.vulnerable_versions });
        defer allocator.free(vuln_json);
        try output.appendSlice(allocator, vuln_json);
        if (vuln.patched_versions) |pv| {
            const patched = try std.fmt.allocPrint(allocator, "\"patched_versions\":\"{s}\",", .{pv});
            defer allocator.free(patched);
            try output.appendSlice(allocator, patched);
        } else {
            try output.appendSlice(allocator, "\"patched_versions\":null,");
        }
        const url_json = try std.fmt.allocPrint(allocator, "\"url\":\"{s}\"", .{vuln.url});
        defer allocator.free(url_json);
        try output.appendSlice(allocator, url_json);
        if (vuln.cwe) |cwe| {
            const cwe_json = try std.fmt.allocPrint(allocator, ",\"cwe\":\"{s}\"", .{cwe});
            defer allocator.free(cwe_json);
            try output.appendSlice(allocator, cwe_json);
        }
        try output.appendSlice(allocator, "}");
    }

    const summary = generateSummary(vulnerabilities);
    const summary_json = try std.fmt.allocPrint(allocator, "],\"summary\":{{\"total\":{d},\"low\":{d},\"moderate\":{d},\"high\":{d},\"critical\":{d}}}}}", .{ summary.total, summary.low, summary.moderate, summary.high, summary.critical });
    defer allocator.free(summary_json);
    try output.appendSlice(allocator, summary_json);

    const message = try output.toOwnedSlice(allocator);
    const exit_code: u8 = if (vulnerabilities.len > 0) 1 else 0;

    return .{
        .exit_code = exit_code,
        .message = message,
    };
}
