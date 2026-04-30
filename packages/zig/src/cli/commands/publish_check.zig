//! Publish Check Command
//!
//! Pre-flight validation before publishing: replicates npm's name rules
//! and additionally checks the npm registry for exact matches and similar
//! names (typo-squatting territory). Suggests scoped alternatives when the
//! requested name is taken or risky.
//!
//! Usage:
//!   pantry publish:check                # checks ./package.json
//!   pantry publish:check ./packages/foo

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const style = @import("../style.zig");
const common = @import("common.zig");

const CommandResult = common.CommandResult;

pub const PublishCheckOptions = struct {
    /// Skip the npm registry network calls (offline mode).
    offline: bool = false,
    /// Maximum edit distance to consider a name "similar".
    similarity_threshold: usize = 3,
};

pub fn publishCheckCommand(
    allocator: std.mem.Allocator,
    args: []const []const u8,
    options: PublishCheckOptions,
) !CommandResult {
    // Determine target package directory (default: cwd)
    const target_path = if (args.len > 0) args[0] else ".";

    const cwd = io_helper.realpathAlloc(allocator, ".") catch {
        return CommandResult.err(allocator, "Error: Could not determine current directory");
    };
    defer allocator.free(cwd);

    const pkg_dir = if (std.fs.path.isAbsolute(target_path))
        try allocator.dupe(u8, target_path)
    else
        try std.fs.path.join(allocator, &.{ cwd, target_path });
    defer allocator.free(pkg_dir);

    // Detect a workspace root: if package.json declares `workspaces`, expand
    // those globs and check each child instead of the root itself. This
    // mirrors `pantry publish:commit '.'`'s behaviour and matches the reality
    // that the root of a monorepo is typically `private: true` and never
    // intended to be published.
    const child_dirs = collectWorkspaceDirs(allocator, pkg_dir) catch null;
    if (child_dirs) |dirs| {
        defer {
            for (dirs.items) |d| allocator.free(d);
            var mut = dirs;
            mut.deinit(allocator);
        }

        if (dirs.items.len == 0) {
            return CommandResult.err(allocator, "Error: workspaces declared but no matching child packages were found");
        }

        style.print("\n{s}Checking workspace root at {s}{s}{s}...{s}\n", .{ style.bold, style.cyan, target_path, style.reset ++ style.bold, style.reset });
        style.print("Found {d} workspace package(s).\n", .{dirs.items.len});

        var any_failed = false;
        for (dirs.items, 0..) |child, i| {
            style.print("\n{s}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{s}\n", .{ style.dim, style.reset });
            style.print("{s}[{d}/{d}]{s} {s}\n", .{ style.bold, i + 1, dirs.items.len, style.reset, child });

            const child_failed = checkSinglePackageDir(allocator, child, options) catch |err| blk: {
                style.print("  {s}!{s} Check failed: {s}\n", .{ style.yellow, style.reset, @errorName(err) });
                break :blk true;
            };
            if (child_failed) any_failed = true;
        }

        return .{ .exit_code = if (any_failed) 1 else 0 };
    }

    style.print("\n{s}Checking package at {s}{s}{s}...{s}\n", .{ style.bold, style.cyan, target_path, style.reset ++ style.bold, style.reset });
    const failed = try checkSinglePackageDir(allocator, pkg_dir, options);
    return .{ .exit_code = if (failed) 1 else 0 };
}

/// Run all checks against a single package directory. Returns true if any
/// blocking issue (invalid name, name already taken, etc.) was reported, so
/// callers can aggregate the exit code across multiple workspace packages.
fn checkSinglePackageDir(
    allocator: std.mem.Allocator,
    pkg_dir: []const u8,
    options: PublishCheckOptions,
) !bool {
    const config_path = try std.fs.path.join(allocator, &.{ pkg_dir, "package.json" });
    defer allocator.free(config_path);

    const content = io_helper.readFileAlloc(allocator, config_path, 10 * 1024 * 1024) catch |err| {
        style.print("  {s}✗{s} Could not read {s}: {s}\n", .{ style.red, style.reset, config_path, @errorName(err) });
        return true;
    };
    defer allocator.free(content);

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch |err| {
        style.print("  {s}✗{s} package.json is not valid JSON: {s}\n", .{ style.red, style.reset, @errorName(err) });
        return true;
    };
    defer parsed.deinit();

    const root = parsed.value;
    if (root != .object) {
        style.print("  {s}✗{s} package.json must be a JSON object at the top level\n", .{ style.red, style.reset });
        return true;
    }

    const name_val = root.object.get("name") orelse {
        style.print("  {s}✗{s} package.json is missing a 'name' field\n", .{ style.red, style.reset });
        return true;
    };
    if (name_val != .string) {
        style.print("  {s}✗{s} package.json 'name' field must be a string\n", .{ style.red, style.reset });
        return true;
    }
    const name = name_val.string;

    const validation = validateName(name);
    if (validation.errors.len > 0) {
        style.print("  {s}✗{s} Name {s}'{s}'{s} is not a valid npm package name:\n", .{
            style.red, style.reset, style.cyan, name, style.reset,
        });
        for (validation.errors) |e| {
            style.print("      - {s}\n", .{e});
        }
        return true;
    }
    if (validation.warnings.len > 0) {
        style.print("  {s}!{s} Name {s}'{s}'{s} has warnings:\n", .{
            style.yellow, style.reset, style.cyan, name, style.reset,
        });
        for (validation.warnings) |w| {
            style.print("      - {s}\n", .{w});
        }
    } else {
        style.print("  {s}✓{s} Name {s}'{s}'{s} passes syntactic validation\n", .{
            style.green, style.reset, style.cyan, name, style.reset,
        });
    }

    const is_private = if (root.object.get("private")) |p|
        if (p == .bool) p.bool else false
    else
        false;
    if (is_private) {
        style.print("  {s}!{s} package.json has {s}\"private\": true{s} — this package will not be published\n", .{
            style.yellow, style.reset, style.cyan, style.reset,
        });
        // Private packages don't need registry / similar-name checks
        return false;
    }

    if (options.offline) {
        style.print("  {s}Skipping registry checks ({s}--offline{s}).{s}\n", .{ style.dim, style.bold, style.reset ++ style.dim, style.reset });
        return false;
    }

    const exact_taken = checkExactExists(allocator, name) catch |err| blk: {
        style.print("  {s}!{s} Could not reach npm registry: {s}\n", .{ style.yellow, style.reset, @errorName(err) });
        break :blk false;
    };

    if (exact_taken) {
        style.print("  {s}✗{s} Package {s}'{s}'{s} already exists on npm\n", .{
            style.red, style.reset, style.cyan, name, style.reset,
        });
        style.print("      https://www.npmjs.com/package/{s}\n", .{name});
    } else {
        style.print("  {s}✓{s} Name {s}'{s}'{s} is available on npm\n", .{
            style.green, style.reset, style.cyan, name, style.reset,
        });
    }

    const is_scoped = name.len > 0 and name[0] == '@';
    if (!is_scoped) {
        var similar = searchSimilar(allocator, name, options.similarity_threshold) catch |err| blk: {
            style.print("  {s}!{s} Similar-name search failed: {s}\n", .{ style.yellow, style.reset, @errorName(err) });
            break :blk std.ArrayList(SimilarMatch).empty;
        };
        defer {
            for (similar.items) |*m| m.deinit(allocator);
            similar.deinit(allocator);
        }

        if (similar.items.len == 0) {
            style.print("  {s}✓{s} No close matches on npm\n", .{ style.green, style.reset });
        } else {
            style.print("  {s}!{s} Found {d} similar package(s) on npm:\n", .{ style.yellow, style.reset, similar.items.len });
            for (similar.items) |m| {
                style.print("      - {s} (distance {d})\n", .{ m.name, m.distance });
            }
        }
    }

    if (exact_taken) {
        try printSuggestions(allocator, name, &root);
    }

    return exact_taken;
}

/// If `pkg_dir`'s package.json declares `workspaces`, return the absolute
/// paths of the matching child packages. Returns null if there's no
/// workspaces field (single-package mode), or an error if reading fails.
///
/// Supported shapes:
///   - "workspaces": ["packages/*"]                   (npm/yarn/bun)
///   - "workspaces": { "packages": ["packages/*"] }   (yarn classic)
fn collectWorkspaceDirs(allocator: std.mem.Allocator, pkg_dir: []const u8) !?std.ArrayList([]const u8) {
    const config_path = try std.fs.path.join(allocator, &.{ pkg_dir, "package.json" });
    defer allocator.free(config_path);

    const content = io_helper.readFileAlloc(allocator, config_path, 10 * 1024 * 1024) catch return null;
    defer allocator.free(content);

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch return null;
    defer parsed.deinit();

    if (parsed.value != .object) return null;
    const ws = parsed.value.object.get("workspaces") orelse return null;

    const patterns: ?std.json.Array = switch (ws) {
        .array => |a| a,
        .object => |o| if (o.get("packages")) |p|
            if (p == .array) p.array else null
        else
            null,
        else => null,
    };
    const list = patterns orelse return null;
    if (list.items.len == 0) return null;

    var dirs = std.ArrayList([]const u8).empty;
    errdefer {
        for (dirs.items) |d| allocator.free(d);
        dirs.deinit(allocator);
    }

    for (list.items) |item| {
        if (item != .string) continue;
        try expandWorkspacePattern(allocator, pkg_dir, item.string, &dirs);
    }

    return dirs;
}

/// Expand a single workspaces pattern. Supports two shapes:
///   - "path/to/dir/*"  → iterate that dir, append every subdir that has a package.json
///   - "path/to/dir"    → append directly if it has a package.json
fn expandWorkspacePattern(
    allocator: std.mem.Allocator,
    base: []const u8,
    pattern: []const u8,
    dirs: *std.ArrayList([]const u8),
) !void {
    var clean = pattern;
    if (std.mem.startsWith(u8, clean, "./")) clean = clean[2..];

    if (std.mem.endsWith(u8, clean, "/*")) {
        const prefix = clean[0 .. clean.len - 2];
        const parent = try std.fs.path.join(allocator, &.{ base, prefix });
        defer allocator.free(parent);

        var dir = io_helper.openDirForIteration(parent) catch return;
        defer dir.close();
        var iter = dir.iterate();
        while (iter.next() catch null) |entry| {
            if (entry.kind != .directory) continue;
            if (std.mem.startsWith(u8, entry.name, ".")) continue;
            if (std.mem.eql(u8, entry.name, "node_modules")) continue;

            const child = try std.fs.path.join(allocator, &.{ parent, entry.name });
            const child_pkg = try std.fs.path.join(allocator, &.{ child, "package.json" });
            defer allocator.free(child_pkg);

            const exists = blk: {
                io_helper.accessAbsolute(child_pkg, .{}) catch break :blk false;
                break :blk true;
            };
            if (!exists) {
                allocator.free(child);
                continue;
            }
            try dirs.append(allocator, child);
        }
        return;
    }

    // Plain path — check if it's a package directory
    const child = try std.fs.path.join(allocator, &.{ base, clean });
    const child_pkg = try std.fs.path.join(allocator, &.{ child, "package.json" });
    defer allocator.free(child_pkg);

    const exists = blk: {
        io_helper.accessAbsolute(child_pkg, .{}) catch break :blk false;
        break :blk true;
    };
    if (!exists) {
        allocator.free(child);
        return;
    }
    try dirs.append(allocator, child);
}

// ============================================================================
// Name Validation (mirrors validate-npm-package-name)
// ============================================================================

/// Result of npm-style name validation.
const ValidationResult = struct {
    errors: []const []const u8,
    warnings: []const []const u8,
    has_warnings: bool,
};

/// Validate a package name against npm's documented rules. Returns errors
/// (publish must fail) and warnings (publish can proceed but is risky).
fn validateName(name: []const u8) ValidationResult {
    // Static-storage error/warning lists. Each rule writes to a fixed buffer
    // so we don't have to thread an allocator through the validator.
    const errors_buf = struct {
        var list: [16][]const u8 = undefined;
        var n: usize = 0;
    };
    const warnings_buf = struct {
        var list: [16][]const u8 = undefined;
        var n: usize = 0;
    };
    errors_buf.n = 0;
    warnings_buf.n = 0;

    const addError = struct {
        fn f(msg: []const u8) void {
            if (errors_buf.n < errors_buf.list.len) {
                errors_buf.list[errors_buf.n] = msg;
                errors_buf.n += 1;
            }
        }
    }.f;
    const addWarning = struct {
        fn f(msg: []const u8) void {
            if (warnings_buf.n < warnings_buf.list.len) {
                warnings_buf.list[warnings_buf.n] = msg;
                warnings_buf.n += 1;
            }
        }
    }.f;

    if (name.len == 0) {
        addError("name length must be greater than zero");
        return .{
            .errors = errors_buf.list[0..errors_buf.n],
            .warnings = warnings_buf.list[0..warnings_buf.n],
            .has_warnings = warnings_buf.n > 0,
        };
    }

    if (name[0] == '.') addError("name cannot start with a period");
    if (name[0] == '_') addError("name cannot start with an underscore");
    if (name.len > 0 and (name[0] == ' ' or name[name.len - 1] == ' ')) {
        addError("name cannot contain leading or trailing spaces");
    }

    // Blocklisted names (npm refuses these outright)
    const blocklist = [_][]const u8{ "node_modules", "favicon.ico" };
    for (blocklist) |b| {
        if (asciiEqlIgnoreCase(name, b)) {
            addError("name is on the blocklist (node_modules / favicon.ico)");
        }
    }

    // Node.js core module names — npm warns rather than errors
    const core_modules = [_][]const u8{
        "assert",         "async_hooks",   "buffer",  "child_process", "cluster",   "console",
        "constants",      "crypto",        "dgram",   "diagnostics_channel",        "dns",
        "domain",         "events",        "fs",      "http",          "http2",     "https",
        "inspector",      "module",        "net",     "os",            "path",      "perf_hooks",
        "process",        "punycode",      "querystring",                           "readline",
        "repl",           "stream",        "string_decoder",                        "sys",
        "timers",         "tls",           "trace_events",                          "tty",
        "url",            "util",          "v8",      "vm",            "wasi",      "worker_threads",
        "zlib",
    };
    for (core_modules) |m| {
        if (asciiEqlIgnoreCase(name, m)) {
            addWarning("name matches a Node.js core module — `require('<name>')` will resolve to the core module, not your package");
        }
    }

    if (name.len > 214) addWarning("name is longer than 214 characters (npm limit)");

    // Lowercase rule — npm warns; we enforce as warning to mirror their
    // "legacy publishers grandfathered, new ones discouraged" stance.
    if (!isAllLowercase(name)) addWarning("name should not contain capital letters");

    // Special chars in the unscoped portion (~'!()*) — npm warns
    const unscoped = unscopedPart(name);
    if (containsAny(unscoped, "~'!()*")) {
        addWarning("name should not contain special characters (~'!()*)");
    }

    // URL-safety: every char should pass through encodeURIComponent unchanged,
    // except for the '/' separating scope from name in `@scope/name`.
    if (!isUrlFriendly(name)) {
        addError("name can only contain URL-friendly characters");
    }

    return .{
        .errors = errors_buf.list[0..errors_buf.n],
        .warnings = warnings_buf.list[0..warnings_buf.n],
        .has_warnings = warnings_buf.n > 0,
    };
}

fn asciiEqlIgnoreCase(a: []const u8, b: []const u8) bool {
    if (a.len != b.len) return false;
    for (a, b) |ca, cb| {
        if (std.ascii.toLower(ca) != std.ascii.toLower(cb)) return false;
    }
    return true;
}

fn isAllLowercase(s: []const u8) bool {
    for (s) |c| {
        if (c >= 'A' and c <= 'Z') return false;
    }
    return true;
}

fn containsAny(s: []const u8, chars: []const u8) bool {
    for (s) |c| {
        for (chars) |bad| {
            if (c == bad) return true;
        }
    }
    return false;
}

fn unscopedPart(name: []const u8) []const u8 {
    if (name.len == 0 or name[0] != '@') return name;
    if (std.mem.indexOfScalar(u8, name, '/')) |slash| return name[slash + 1 ..];
    return name;
}

/// True if every char in `name` is a URL-friendly char (per encodeURIComponent
/// equivalence), with one exception: a single '/' separating an `@scope` from
/// the rest is allowed.
fn isUrlFriendly(name: []const u8) bool {
    var seen_slash = false;
    for (name, 0..) |c, i| {
        if (c == '/') {
            // Allowed only as the @scope/name separator
            if (seen_slash) return false;
            if (i == 0 or name[0] != '@') return false;
            seen_slash = true;
            continue;
        }
        if (!isUrlFriendlyChar(c)) return false;
    }
    return true;
}

fn isUrlFriendlyChar(c: u8) bool {
    if (c >= 'a' and c <= 'z') return true;
    if (c >= 'A' and c <= 'Z') return true;
    if (c >= '0' and c <= '9') return true;
    return switch (c) {
        '-', '_', '.', '~', '@' => true,
        else => false,
    };
}

// ============================================================================
// npm Registry Lookups
// ============================================================================

/// Returns true if `GET https://registry.npmjs.org/<name>` returns 200.
/// Returns false for 404. Bubbles up other failures (DNS, TLS, etc.).
fn checkExactExists(allocator: std.mem.Allocator, name: []const u8) !bool {
    // npm registry expects the @scope/name form to be encoded with %2F.
    const url_buf = try std.fmt.allocPrint(allocator, "https://registry.npmjs.org/{s}", .{name});
    defer allocator.free(url_buf);

    return httpExists(allocator, url_buf);
}

/// HTTP GET that returns true on 200, false on 404, error on anything else
/// (network errors, 5xx, etc.).
fn httpExists(allocator: std.mem.Allocator, url: []const u8) !bool {
    var client: std.http.Client = .{
        .allocator = allocator,
        .io = io_helper.io,
    };
    defer client.deinit();

    var sink = std.Io.Writer.Discarding.init(&.{});

    var redirect_buf: [8192]u8 = undefined;

    const result = client.fetch(.{
        .location = .{ .url = url },
        .response_writer = &sink.writer,
        .redirect_buffer = &redirect_buf,
        .redirect_behavior = @enumFromInt(10),
    }) catch {
        return error.HttpRequestFailed;
    };

    return switch (result.status) {
        .ok => true,
        .not_found => false,
        else => error.UnexpectedStatus,
    };
}

const SimilarMatch = struct {
    name: []const u8,
    distance: usize,

    fn deinit(self: *SimilarMatch, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
    }
};

/// Search npm for packages whose names are within `threshold` Levenshtein
/// distance from `name`. Uses the npm public search API.
///
/// We normalize the query (strip `-_.`) and search on that, then filter by
/// edit distance against the original name. This catches both "same letters,
/// different separators" (the canonical typo-squatting axis) and standard
/// typos within a few characters.
fn searchSimilar(
    allocator: std.mem.Allocator,
    name: []const u8,
    threshold: usize,
) !std.ArrayList(SimilarMatch) {
    var results = std.ArrayList(SimilarMatch).empty;
    errdefer {
        for (results.items) |*m| m.deinit(allocator);
        results.deinit(allocator);
    }

    // Normalize for the search query
    const normalized = try normalizeName(allocator, name);
    defer allocator.free(normalized);

    if (normalized.len == 0) return results;

    const url = try std.fmt.allocPrint(
        allocator,
        "https://registry.npmjs.org/-/v1/search?text={s}&size=25",
        .{normalized},
    );
    defer allocator.free(url);

    const body = io_helper.httpGet(allocator, url) catch return results;
    defer allocator.free(body);

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, body, .{}) catch return results;
    defer parsed.deinit();

    if (parsed.value != .object) return results;
    const objects_val = parsed.value.object.get("objects") orelse return results;
    if (objects_val != .array) return results;

    for (objects_val.array.items) |obj| {
        if (obj != .object) continue;
        const pkg_val = obj.object.get("package") orelse continue;
        if (pkg_val != .object) continue;
        const found_name_val = pkg_val.object.get("name") orelse continue;
        if (found_name_val != .string) continue;
        const found_name = found_name_val.string;

        if (std.mem.eql(u8, found_name, name)) continue; // exact match: handled separately

        const distance = editDistance(name, found_name);

        // Also check distance after normalization — catches "my-package" vs "mypackage"
        const found_normalized = normalizeName(allocator, found_name) catch continue;
        defer allocator.free(found_normalized);
        const norm_distance = editDistance(normalized, found_normalized);

        const min_distance = @min(distance, norm_distance);
        if (min_distance > threshold) continue;

        const owned = try allocator.dupe(u8, found_name);
        try results.append(allocator, .{ .name = owned, .distance = min_distance });
    }

    // Sort ascending by distance so closest matches print first
    std.mem.sort(SimilarMatch, results.items, {}, struct {
        fn lt(_: void, a: SimilarMatch, b: SimilarMatch) bool {
            return a.distance < b.distance;
        }
    }.lt);

    // Trim to top 5 to keep output readable
    if (results.items.len > 5) {
        for (results.items[5..]) |*m| m.deinit(allocator);
        results.shrinkRetainingCapacity(5);
    }

    return results;
}

/// Lowercase + strip non-alphanumeric so "my-package" / "my_package" /
/// "MyPackage" all collapse to "mypackage".
fn normalizeName(allocator: std.mem.Allocator, name: []const u8) ![]u8 {
    var buf = try allocator.alloc(u8, name.len);
    var n: usize = 0;
    for (name) |c| {
        const lower = std.ascii.toLower(c);
        const is_alnum = (lower >= 'a' and lower <= 'z') or (lower >= '0' and lower <= '9');
        if (is_alnum) {
            buf[n] = lower;
            n += 1;
        }
    }
    return try allocator.realloc(buf, n);
}

/// Standard Levenshtein distance, two-row DP. O(|a| * |b|) time, O(|b|) memory.
fn editDistance(a: []const u8, b: []const u8) usize {
    if (a.len == 0) return b.len;
    if (b.len == 0) return a.len;

    var prev_buf: [256]usize = undefined;
    var curr_buf: [256]usize = undefined;
    if (b.len + 1 > prev_buf.len) {
        // Bounded fallback for unusually long names — clamp distance to "very far"
        return @max(a.len, b.len);
    }
    var prev = prev_buf[0 .. b.len + 1];
    var curr = curr_buf[0 .. b.len + 1];

    for (0..b.len + 1) |j| prev[j] = j;

    for (a, 0..) |ca, i| {
        curr[0] = i + 1;
        for (b, 0..) |cb, j| {
            const cost: usize = if (ca == cb) 0 else 1;
            const ins = curr[j] + 1;
            const del = prev[j + 1] + 1;
            const sub = prev[j] + cost;
            curr[j + 1] = @min(@min(ins, del), sub);
        }
        const tmp = prev;
        prev = curr;
        curr = tmp;
    }

    return prev[b.len];
}

// ============================================================================
// Suggestions
// ============================================================================

fn printSuggestions(allocator: std.mem.Allocator, name: []const u8, root: *const std.json.Value) !void {
    style.print("\n{s}Suggested alternatives:{s}\n", .{ style.bold, style.reset });

    const unscoped = unscopedPart(name);

    // GitHub username from `git config user.name` (best-effort, often the user's handle)
    if (getGitConfig(allocator, "user.name") catch null) |u| {
        defer allocator.free(u);
        if (looksLikeHandle(u)) {
            const lower = try toLowerOwned(allocator, u);
            defer allocator.free(lower);
            style.print("  - {s}@{s}/{s}{s}    {s}(your git user.name){s}\n", .{
                style.cyan, lower, unscoped, style.reset,
                style.dim, style.reset,
            });
        }
    }

    // Author handle from package.json `author` field, if present
    if (root.object.get("author")) |a| {
        if (extractHandleFromAuthor(a)) |h| {
            const lower = try toLowerOwned(allocator, h);
            defer allocator.free(lower);
            style.print("  - {s}@{s}/{s}{s}    {s}(from package.json author){s}\n", .{
                style.cyan, lower, unscoped, style.reset,
                style.dim, style.reset,
            });
        }
    }

    style.print("  - {s}@yourorg/{s}{s}    {s}(generic scope placeholder){s}\n", .{
        style.cyan, unscoped, style.reset,
        style.dim, style.reset,
    });
}

fn looksLikeHandle(s: []const u8) bool {
    // A "handle-ish" name: short, no spaces. Excludes typical full names like
    // "Glenn Michael" but accepts "glennmichael123".
    if (s.len == 0 or s.len > 39) return false;
    if (std.mem.indexOfScalar(u8, s, ' ') != null) return false;
    return true;
}

fn toLowerOwned(allocator: std.mem.Allocator, s: []const u8) ![]u8 {
    const out = try allocator.alloc(u8, s.len);
    for (s, 0..) |c, i| out[i] = std.ascii.toLower(c);
    return out;
}

/// Extract a `@handle` from a package.json `author` field. Accepts both
/// the string form ("Name <email> (url)") and the object form
/// ({ "name": "...", "url": "https://github.com/HANDLE" }).
fn extractHandleFromAuthor(author: std.json.Value) ?[]const u8 {
    switch (author) {
        .string => |s| {
            // Look for a "(https://github.com/HANDLE)" segment
            if (std.mem.indexOf(u8, s, "github.com/")) |gh_idx| {
                const after = s[gh_idx + "github.com/".len ..];
                var end: usize = 0;
                while (end < after.len) : (end += 1) {
                    const c = after[end];
                    if (c == ')' or c == '/' or c == ' ' or c == '>') break;
                }
                if (end > 0) return after[0..end];
            }
            return null;
        },
        .object => |o| {
            if (o.get("url")) |u| {
                if (u == .string) {
                    if (std.mem.indexOf(u8, u.string, "github.com/")) |gh_idx| {
                        const after = u.string[gh_idx + "github.com/".len ..];
                        var end: usize = 0;
                        while (end < after.len) : (end += 1) {
                            const c = after[end];
                            if (c == '/' or c == ' ') break;
                        }
                        if (end > 0) return after[0..end];
                    }
                }
            }
            return null;
        },
        else => return null,
    }
}

fn getGitConfig(allocator: std.mem.Allocator, key: []const u8) !?[]u8 {
    const result = io_helper.childRun(allocator, &[_][]const u8{ "git", "config", "--get", key }) catch return null;
    defer allocator.free(result.stderr);
    defer allocator.free(result.stdout);

    switch (result.term) {
        .exited => |code| if (code != 0) return null,
        else => return null,
    }

    // Strip trailing newline
    var trimmed = result.stdout;
    while (trimmed.len > 0 and (trimmed[trimmed.len - 1] == '\n' or trimmed[trimmed.len - 1] == '\r')) {
        trimmed = trimmed[0 .. trimmed.len - 1];
    }
    if (trimmed.len == 0) return null;

    return try allocator.dupe(u8, trimmed);
}
