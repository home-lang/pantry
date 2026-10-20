const std = @import("std");
const generated = @import("generated.zig");

/// Parsed semver version
pub const Version = struct {
    major: u32,
    minor: u32,
    patch: u32,
};

/// Semver constraint types
pub const ConstraintType = enum {
    exact, // 1.2.3
    caret, // ^1.2.3 - compatible with version
    tilde, // ~1.2.3 - approximately equivalent
    gte, // >=1.2.3
    lte, // <=1.2.3
    gt, // >1.2.3
    lt, // <1.2.3
};

pub const Constraint = struct {
    type: ConstraintType,
    major: u32,
    minor: u32,
    patch: u32,
    allows_prerelease: bool = false,
    prerelease_number: ?u64 = null,
    raw_version: ?[]const u8 = null,
    /// How many components the constraint actually named: `^0` is one, `^0.13`
    /// is two. A missing minor parses as zero, which is indistinguishable from
    /// a written zero without this - and the two mean different things under a
    /// caret on a zero major.
    components: u8 = 3,
    /// Remaining AND bounds, borrowed from the original constraint string.
    and_rest: ?[]const u8 = null,
};

/// Parse a semver version string into major.minor.patch
pub fn parseVersion(version: []const u8) !Version {
    var clean_version = version;

    // Strip 'v' prefix if present
    if (std.mem.startsWith(u8, clean_version, "v")) {
        clean_version = clean_version[1..];
    }

    // Split by '.' and '-' (for pre-release versions)
    var parts = std.mem.splitAny(u8, clean_version, ".-");

    const major_str = parts.next() orelse return error.InvalidVersion;
    // Missing minor/patch (e.g. "1" or "1.2") defaults to 0 — matches bun/npm behaviour.
    // But if present, they MUST parse cleanly — "1.invalid.3" is a real user error and
    // silently rewriting it to "1.0.0" masks corrupt lockfiles and typos upstream.
    const minor_str_opt = parts.next();
    const patch_str_opt = parts.next();

    const major = try parseComponent(major_str);
    const minor: u32 = if (minor_str_opt) |s| try parseComponent(s) else 0;
    const patch: u32 = if (patch_str_opt) |s| try parseComponent(s) else 0;

    return .{ .major = major, .minor = minor, .patch = patch };
}

/// Parse the numeric part of a single version component, tolerating a trailing
/// non-numeric suffix. openssl ships letter-suffixed patch releases like
/// "1.1.1w" (patch component "1w"); without this, `parseInt("1w")` fails and
/// every openssl 1.x version is treated as unparseable, so `^1` matches
/// nothing even though 1.1.1w is in the registry. Takes the leading ASCII
/// digits ("1w" -> 1) and ignores the suffix — but a component with NO leading
/// digit ("foo", "invalid") is still a genuine error, so real typos and corrupt
/// lockfiles are not silently rewritten to 0.
fn parseComponent(s: []const u8) !u32 {
    var end: usize = 0;
    while (end < s.len and s[end] >= '0' and s[end] <= '9') : (end += 1) {}
    if (end == 0) return error.InvalidVersion;
    return std.fmt.parseInt(u32, s[0..end], 10) catch error.InvalidVersion;
}

test "parseVersion rejects non-numeric components" {
    try std.testing.expectError(error.InvalidVersion, parseVersion("1.invalid.3"));
    try std.testing.expectError(error.InvalidVersion, parseVersion("1.2.foo"));
    // Short forms still accepted — npm treats "1" as "1.0.0"
    const short = try parseVersion("1");
    try std.testing.expectEqual(@as(u32, 1), short.major);
    try std.testing.expectEqual(@as(u32, 0), short.minor);
    try std.testing.expectEqual(@as(u32, 0), short.patch);
    // 'v' prefix still stripped
    const prefixed = try parseVersion("v1.2.3");
    try std.testing.expectEqual(@as(u32, 1), prefixed.major);
    try std.testing.expectEqual(@as(u32, 2), prefixed.minor);
    try std.testing.expectEqual(@as(u32, 3), prefixed.patch);
}

test "parseVersion accepts openssl-style letter-suffixed patch (1.1.1w)" {
    // openssl ships "1.1.1w"; the trailing letter must not make the whole
    // version unparseable, or `^1` matches none of the 1.x line.
    const v = try parseVersion("1.1.1w");
    try std.testing.expectEqual(@as(u32, 1), v.major);
    try std.testing.expectEqual(@as(u32, 1), v.minor);
    try std.testing.expectEqual(@as(u32, 1), v.patch);
    // But a component with no leading digit is still rejected.
    try std.testing.expectError(error.InvalidVersion, parseVersion("1.2.foo"));
}

/// Parse a version constraint string like "^1.2.3" or ">=1.0.0"
pub fn parseConstraint(constraint_str: []const u8) !Constraint {
    const first = try splitBound(constraint_str);
    var result = try parseAtomicConstraint(first.head);
    if (first.rest.len > 0) result.and_rest = first.rest;
    var rest = first.rest;
    while (rest.len > 0) {
        const token = try splitBound(rest);
        _ = try parseAtomicConstraint(token.head);
        rest = token.rest;
    }
    return result;
}

const BoundToken = struct { head: []const u8, rest: []const u8 };

fn splitBound(input: []const u8) !BoundToken {
    const text = std.mem.trim(u8, input, " \t\r\n");
    if (text.len == 0 or std.mem.indexOfAny(u8, text, "|&,()") != null) return error.InvalidConstraint;
    var start: usize = 0;
    while (start < text.len and std.mem.indexOfScalar(u8, "<>=^~", text[start]) != null) : (start += 1) {}
    while (start < text.len and std.ascii.isWhitespace(text[start])) : (start += 1) {}
    var end = start;
    while (end < text.len and !std.ascii.isWhitespace(text[end]) and std.mem.indexOfScalar(u8, "<>=^~", text[end]) == null) : (end += 1) {}
    if (end == start) return error.InvalidConstraint;
    return .{ .head = text[0..end], .rest = std.mem.trim(u8, text[end..], " \t\r\n") };
}

fn parseAtomicConstraint(constraint_str: []const u8) !Constraint {
    var version_str = constraint_str;
    var constraint_type = ConstraintType.exact;

    // Detect constraint type and strip prefix
    if (std.mem.startsWith(u8, version_str, "^")) {
        constraint_type = .caret;
        version_str = version_str[1..];
    } else if (std.mem.startsWith(u8, version_str, "~")) {
        constraint_type = .tilde;
        version_str = version_str[1..];
    } else if (std.mem.startsWith(u8, version_str, ">=")) {
        constraint_type = .gte;
        version_str = version_str[2..];
    } else if (std.mem.startsWith(u8, version_str, "<=")) {
        constraint_type = .lte;
        version_str = version_str[2..];
    } else if (std.mem.startsWith(u8, version_str, ">")) {
        constraint_type = .gt;
        version_str = version_str[1..];
    } else if (std.mem.startsWith(u8, version_str, "<")) {
        constraint_type = .lt;
        version_str = version_str[1..];
    } else if (std.mem.startsWith(u8, version_str, "=")) {
        constraint_type = .exact;
        version_str = version_str[1..];
    }

    version_str = std.mem.trim(u8, version_str, " \t");
    const version = try parseVersion(version_str);

    // Normalize partial / loose specifiers to ranges, matching npm/bun semantics.
    // Without this a bare major like "1" parses as exact 1.0.0 and never matches
    // the published 1.3.2, so deps such as `zlib.net@1`, `sourceware.org/bzip2@1`
    // and `libexpat.github.io@~2` resolve to "not found in registry".
    //   "1"     -> ^1    (>=1.0.0 <2.0.0)
    //   "1.2"   -> ~1.2  (>=1.2.0 <1.3.0)
    //   "1.2.3" -> exact
    //   "~2"    -> ^2    (a tilde with only a major behaves like caret: 2.x)
    const components = versionComponentCount(version_str);
    if (constraint_type == .exact) {
        if (components == 1) {
            constraint_type = .caret;
        } else if (components == 2) {
            constraint_type = .tilde;
        }
    } else if (constraint_type == .tilde and components == 1) {
        constraint_type = .caret;
    }

    return Constraint{
        .type = constraint_type,
        .major = version.major,
        .minor = version.minor,
        .patch = version.patch,
        .allows_prerelease = isPrerelease(version_str),
        .prerelease_number = prereleaseNumber(version_str),
        .raw_version = version_str,
        .components = @intCast(@min(components, 3)),
    };
}

/// Number of dot-separated numeric components in a version string, ignoring a
/// leading `v` and any `-prerelease`/`+build` suffix. "1" -> 1, "1.2" -> 2,
/// "1.2.3-dev" -> 3.
fn versionComponentCount(version_str: []const u8) usize {
    var s = version_str;
    if (std.mem.startsWith(u8, s, "v")) s = s[1..];
    var core_len: usize = 0;
    while (core_len < s.len and (std.ascii.isDigit(s[core_len]) or s[core_len] == '.')) : (core_len += 1) {}
    const core = s[0..core_len];
    if (core.len == 0) return 0;
    var count: usize = 1;
    for (core) |c| {
        if (c == '.') count += 1;
    }
    return count;
}

/// Split a version into its numeric core ("3.15.0") and whatever follows it
/// ("rc1", "-dev.1422+e863bf3be", "w"), after an optional leading "v".
fn splitCore(version_str: []const u8) struct { core: []const u8, rest: []const u8 } {
    const v = if (std.mem.startsWith(u8, version_str, "v")) version_str[1..] else version_str;
    var end: usize = 0;
    while (end < v.len and (std.ascii.isDigit(v[end]) or v[end] == '.')) : (end += 1) {}
    while (end > 0 and v[end - 1] == '.') end -= 1;
    return .{ .core = v[0..end], .rest = v[end..] };
}

/// The suffix with one leading separator dropped: "-RC2" -> "RC2", "_beta" -> "beta".
fn suffixTag(rest: []const u8) []const u8 {
    if (rest.len > 0 and (rest[0] == '-' or rest[0] == '+' or rest[0] == '_' or rest[0] == '.')) return rest[1..];
    return rest;
}

/// True if a version string carries a pre-release tag (e.g. "2.10.0-RC1",
/// "1.2.0-beta.3", "3.15.0rc1"). Standard semver marks a pre-release with a "-"
/// after the numeric core, and release versions never contain one. Upstreams
/// that skip the dash — libgeos.org ships "3.15.0beta1" and "3.15.0rc1" — still
/// name the channel, so an alpha/beta/rc/dev/pre tag counts as well. Any other
/// letter suffix stays a release: openssl's "1.1.1w" is not a prerelease.
pub fn isPrerelease(version_str: []const u8) bool {
    const parts = splitCore(version_str);
    if (std.mem.indexOfScalar(u8, parts.rest, '-') != null) return true;
    if (parts.rest.len > 0 and parts.rest[0] == '+') return false;
    const tag = suffixTag(parts.rest);
    for ([_][]const u8{ "alpha", "beta", "rc", "dev", "pre" }) |marker| {
        if (std.ascii.startsWithIgnoreCase(tag, marker)) return true;
    }
    return false;
}

test "isPrerelease recognizes tags written without a dash" {
    try std.testing.expect(isPrerelease("3.15.0beta1"));
    try std.testing.expect(isPrerelease("3.15.0rc1"));
    try std.testing.expect(isPrerelease("3.15.0RC1"));
    try std.testing.expect(isPrerelease("2.0.0alpha"));
    try std.testing.expect(isPrerelease("1.0pre3"));
    try std.testing.expect(isPrerelease("3.6.1_beta"));
    try std.testing.expect(isPrerelease("2.0.0.rc1"));
    try std.testing.expect(isPrerelease("5.44.0-RC2"));
    try std.testing.expect(isPrerelease("0.17.0-dev.1422+e863bf3be"));
    try std.testing.expect(isPrerelease("v1.2.0-beta.3"));

    try std.testing.expect(!isPrerelease("3.15.0"));
    try std.testing.expect(!isPrerelease("1.1.1w"));
    try std.testing.expect(!isPrerelease("9.9p1"));
    try std.testing.expect(!isPrerelease("1.2.3+build.5"));
    try std.testing.expect(!isPrerelease("v2.4"));
}

test "a stable range does not match a dashless prerelease" {
    const constraint = try parseConstraint("^3.14");
    try std.testing.expect(satisfiesConstraint("3.14.1", constraint));
    try std.testing.expect(satisfiesConstraint("3.15.0", constraint));
    try std.testing.expect(!satisfiesConstraint("3.15.0beta1", constraint));
    try std.testing.expect(!satisfiesConstraint("3.15.0rc1", constraint));
    // …but naming the prerelease exactly still selects it, and only it.
    const exact = try parseConstraint("3.15.0rc1");
    try std.testing.expect(satisfiesConstraint("3.15.0rc1", exact));
    try std.testing.expect(!satisfiesConstraint("3.15.0beta1", exact));
    try std.testing.expect(!satisfiesConstraint("3.15.0", exact));
}

test "compareVersions orders releases, prereleases and suffixes" {
    const order = std.math.Order;
    try std.testing.expectEqual(order.gt, compareVersions("3.15.0", "3.15.0rc1"));
    try std.testing.expectEqual(order.gt, compareVersions("3.15.0rc1", "3.15.0beta3"));
    try std.testing.expectEqual(order.gt, compareVersions("3.15.0beta2", "3.15.0beta1"));
    try std.testing.expectEqual(order.gt, compareVersions("3.15.0beta1", "3.14.9"));
    try std.testing.expectEqual(order.gt, compareVersions("5.44.0-RC2", "5.44.0-RC1"));
    try std.testing.expectEqual(order.gt, compareVersions("1.10.0", "1.9.10"));
    try std.testing.expectEqual(order.gt, compareVersions("1.2.3.4", "1.2.3"));
    try std.testing.expectEqual(order.gt, compareVersions("1.1.1w", "1.1.1v"));
    try std.testing.expectEqual(order.gt, compareVersions("1.1.1a", "1.1.1"));
    try std.testing.expectEqual(order.gt, compareVersions("0.17.0-dev.1422+e863bf3be", "0.17.0-dev.986_f3544a707"));
    try std.testing.expectEqual(order.gt, compareVersions("0.17.0-dev.1", "0.16.0"));
    try std.testing.expectEqual(order.eq, compareVersions("v1.2.3", "1.2.3"));
    try std.testing.expectEqual(order.lt, compareVersions("3.14.6", "3.14.7"));
}

/// Order two concrete version strings. Numeric components first (every one,
/// not only the first three), then a release above its own prereleases, then
/// the suffixes compared with digit runs as numbers — so rc1 > beta3,
/// RC2 > RC1, dev.1422 > dev.986 and openssl's 1.1.1w > 1.1.1v.
pub fn compareVersions(a: []const u8, b: []const u8) std.math.Order {
    const left = splitCore(a);
    const right = splitCore(b);

    var left_it = std.mem.splitScalar(u8, left.core, '.');
    var right_it = std.mem.splitScalar(u8, right.core, '.');
    while (true) {
        const l = left_it.next();
        const r = right_it.next();
        if (l == null and r == null) break;
        const ln = if (l) |s| std.fmt.parseInt(u64, s, 10) catch 0 else 0;
        const rn = if (r) |s| std.fmt.parseInt(u64, s, 10) catch 0 else 0;
        if (ln != rn) return std.math.order(ln, rn);
    }

    const left_pre = isPrerelease(a);
    const right_pre = isPrerelease(b);
    if (left_pre != right_pre) return if (left_pre) .lt else .gt;

    return compareNatural(suffixTag(left.rest), suffixTag(right.rest));
}

/// Case-insensitive comparison that reads runs of digits as numbers.
fn compareNatural(a: []const u8, b: []const u8) std.math.Order {
    var i: usize = 0;
    var j: usize = 0;
    while (i < a.len and j < b.len) {
        if (std.ascii.isDigit(a[i]) and std.ascii.isDigit(b[j])) {
            const i_start = i;
            const j_start = j;
            while (i < a.len and std.ascii.isDigit(a[i])) : (i += 1) {}
            while (j < b.len and std.ascii.isDigit(b[j])) : (j += 1) {}
            const an = std.fmt.parseInt(u64, a[i_start..i], 10) catch 0;
            const bn = std.fmt.parseInt(u64, b[j_start..j], 10) catch 0;
            if (an != bn) return std.math.order(an, bn);
            continue;
        }
        const ac = std.ascii.toLower(a[i]);
        const bc = std.ascii.toLower(b[j]);
        if (ac != bc) return std.math.order(ac, bc);
        i += 1;
        j += 1;
    }
    return std.math.order(a.len - i, b.len - j);
}

fn prereleaseNumber(version_str: []const u8) ?u64 {
    const marker = "-dev.";
    const start = (std.mem.indexOf(u8, version_str, marker) orelse return null) + marker.len;
    var end = start;
    while (end < version_str.len and std.ascii.isDigit(version_str[end])) : (end += 1) {}
    if (end == start) return null;
    return std.fmt.parseInt(u64, version_str[start..end], 10) catch null;
}

fn versionOrderAgainstConstraint(version_str: []const u8, version: Version, constraint: Constraint) std.math.Order {
    if (constraint.raw_version) |raw| return compareVersions(version_str, raw);
    if (version.major != constraint.major) return std.math.order(version.major, constraint.major);
    if (version.minor != constraint.minor) return std.math.order(version.minor, constraint.minor);
    if (version.patch != constraint.patch) return std.math.order(version.patch, constraint.patch);

    if (!constraint.allows_prerelease) return if (isPrerelease(version_str)) .lt else .eq;
    if (!isPrerelease(version_str)) return .gt;
    return std.math.order(prereleaseNumber(version_str) orelse 0, constraint.prerelease_number orelse 0);
}

test "package build revisions retain exact identity and every numeric range bound" {
    const versions = [_][]const u8{ "155.0.8059.84", "155.0.8059.84.1", "155.0.8059.84.2", "155.0.8059.85" };
    try std.testing.expectEqualStrings("155.0.8059.84.2", findBestMatch(&versions, ">155.0.8059.84.1 <155.0.8059.85").?);
    try std.testing.expectEqualStrings("155.0.8059.84.1", findBestMatch(&versions, "155.0.8059.84.1").?);
    try std.testing.expect(!satisfiesConstraint("155.0.8059.84", try parseConstraint(">=155.0.8059.84.1")));
    try std.testing.expect(!satisfiesConstraint("155.0.8059.84.2", try parseConstraint("<=155.0.8059.84.1")));
}

fn sameRegistryVersion(a: []const u8, b: []const u8) bool {
    const left = if (std.mem.startsWith(u8, a, "v")) a[1..] else a;
    const right = if (std.mem.startsWith(u8, b, "v")) b[1..] else b;
    if (left.len != right.len) return false;
    for (left, right) |l, r| {
        if (l == r) continue;
        if ((l == '+' or l == '_') and (r == '+' or r == '_')) continue;
        return false;
    }
    return true;
}

/// Check if a version satisfies a constraint
pub fn satisfiesConstraint(version_str: []const u8, constraint: Constraint) bool {
    if (constraint.and_rest == null) return satisfiesAtomicConstraint(version_str, constraint, false);
    const version = parseVersion(version_str) catch return false;
    var allow_prerelease = false;
    var probe = BoundIterator{ .first = constraint, .rest = constraint.and_rest.? };
    while (probe.next() catch return false) |bound| {
        if (bound.allows_prerelease and version.major == bound.major and version.minor == bound.minor and version.patch == bound.patch)
            allow_prerelease = true;
    }
    var bounds = BoundIterator{ .first = constraint, .rest = constraint.and_rest.? };
    while (bounds.next() catch return false) |bound| {
        if (!satisfiesAtomicConstraint(version_str, bound, allow_prerelease)) return false;
    }
    return true;
}

const BoundIterator = struct {
    first: ?Constraint,
    rest: []const u8,

    fn next(self: *BoundIterator) !?Constraint {
        if (self.first) |bound| {
            self.first = null;
            return bound;
        }
        if (self.rest.len == 0) return null;
        const token = try splitBound(self.rest);
        self.rest = token.rest;
        return try parseAtomicConstraint(token.head);
    }
};

fn satisfiesAtomicConstraint(version_str: []const u8, constraint: Constraint, allow_prerelease: bool) bool {
    const version = parseVersion(version_str) catch return false;

    // Stable constraints never opt into prereleases. A constraint which names a
    // prerelease channel, such as ^0.17.0-dev, may select matching builds.
    if (isPrerelease(version_str) and !constraint.allows_prerelease and !allow_prerelease) return false;

    const order = versionOrderAgainstConstraint(version_str, version, constraint);

    return switch (constraint.type) {
        .exact => if (constraint.raw_version) |raw|
            if (std.mem.endsWith(u8, raw, "-dev"))
                version.major == constraint.major and version.minor == constraint.minor and version.patch == constraint.patch and
                    std.mem.startsWith(u8, version_str, raw) and version_str.len > raw.len and version_str[raw.len] == '.'
            else
                sameRegistryVersion(version_str, raw)
        else
            version.major == constraint.major and version.minor == constraint.minor and version.patch == constraint.patch,

        // ^1.2.3 := >=1.2.3 <2.0.0
        .caret => {
            if (order == .lt) return false;
            if (constraint.major == 0) {
                // `^0` names only a major, and npm reads it as >=0.0.0 <1.0.0:
                // every 0.x.y. Treating it as `^0.0.0` instead demanded an exact
                // 0.0.0, so a dependency written `pkg@0` resolved to nothing at
                // all - libcbor ships 0.13.0 and 0.10.1, libfido2 depends on
                // `libcbor@0`, and mysql.com depends on libfido2, so installing
                // MySQL failed with "could not resolve version" three levels
                // down from anything the operator typed.
                if (constraint.components == 1) return version.major == 0;

                if (constraint.minor == 0) {
                    // ^0.0.x: only exact patch match (>=0.0.x <0.0.(x+1))
                    return version.major == 0 and version.minor == 0 and
                        version.patch == constraint.patch;
                }
                // ^0.x.y: same minor, patch >= constraint patch (>=0.x.y <0.(x+1).0)
                return version.major == 0 and
                    version.minor == constraint.minor and
                    version.patch >= constraint.patch;
            } else {
                // ^1.2.3 allows 1.x.x but not 2.0.0
                return version.major == constraint.major and
                    (version.minor > constraint.minor or
                        (version.minor == constraint.minor and version.patch >= constraint.patch));
            }
        },

        // ~1.2.3 := >=1.2.3 <1.3.0
        .tilde => order != .lt and version.major == constraint.major and
            version.minor == constraint.minor and
            version.patch >= constraint.patch,

        .gte => order != .lt,

        .lte => order != .gt,

        .gt => order == .gt,

        .lt => order == .lt,
    };
}

/// Check if a version string looks like a semver range (^, ~, >=, etc.)
pub fn isSemverRange(version: []const u8) bool {
    if (version.len == 0) return false;
    return version[0] == '^' or version[0] == '~' or version[0] == '>' or version[0] == '<' or version[0] == '=';
}

/// Find the best (highest) matching version from a list of version strings.
/// Returns the version string that best matches the constraint, or null.
pub fn findBestMatch(versions: []const []const u8, constraint_str: []const u8) ?[]const u8 {
    const constraint = parseConstraint(constraint_str) catch return null;

    var best: ?[]const u8 = null;
    var best_v: ?Version = null;

    for (versions) |ver| {
        if (!satisfiesConstraint(ver, constraint)) continue;
        const v = parseVersion(ver) catch continue;
        if (best_v) |bv| {
            // Pick higher version
            if (v.major > bv.major or
                (v.major == bv.major and v.minor > bv.minor) or
                (v.major == bv.major and v.minor == bv.minor and v.patch > bv.patch))
            {
                best = ver;
                best_v = v;
            }
        } else {
            best = ver;
            best_v = v;
        }
    }
    return best;
}

/// Find the best matching version from a JSON object's keys (e.g., npm versions object).
/// The keys are version strings like "1.2.3", "1.3.0", etc.
pub fn findBestMatchFromJsonKeys(
    versions_obj: std.json.ObjectMap,
    constraint_str: []const u8,
) ?[]const u8 {
    const constraint = parseConstraint(constraint_str) catch return null;

    var best: ?[]const u8 = null;
    var best_v: ?Version = null;

    var it = versions_obj.iterator();
    while (it.next()) |entry| {
        const ver = entry.key_ptr.*;
        if (!satisfiesConstraint(ver, constraint)) continue;
        const v = parseVersion(ver) catch continue;
        if (best_v) |bv| {
            if (v.major > bv.major or
                (v.major == bv.major and v.minor > bv.minor) or
                (v.major == bv.major and v.minor == bv.minor and v.patch > bv.patch))
            {
                best = ver;
                best_v = v;
            }
        } else {
            best = ver;
            best_v = v;
        }
    }
    return best;
}

/// Resolve a version constraint to the latest matching version for a package
/// Returns the resolved version string or null if no match found
pub fn resolveVersion(domain: []const u8, constraint_str: []const u8) ?[]const u8 {
    // Get package by domain
    const pkg = generated.getPackageByDomain(domain) orelse return null;

    // Handle "latest" as a special case - return the newest *stable* version.
    // `latest` must never resolve to a dev/prerelease build (npm semantics; this
    // also matches the TS resolver's latestFromPackageMetadata). Versions are
    // sorted newest-first, so the first non-prerelease is the latest stable.
    // e.g. for zig — whose catalog leads with 0.17.0-dev.956 — `latest` resolves
    // to 0.16.0, while `0.17.0-dev` still explicitly opts into the dev channel.
    if (std.mem.eql(u8, constraint_str, "latest")) {
        if (pkg.versions.len == 0) return null;
        for (pkg.versions) |version| {
            if (!isPrerelease(version)) return version;
        }
        // Package only ships prereleases — fall back to the newest so `latest`
        // still resolves to something.
        return pkg.versions[0];
    }

    // Parse constraint
    const constraint = parseConstraint(constraint_str) catch return null;

    // Versions are already sorted from newest to oldest
    // Return the first (newest) version that satisfies the constraint
    for (pkg.versions) |version| {
        if (satisfiesConstraint(version, constraint)) {
            return version;
        }
    }

    return null;
}

test "latest resolves to newest stable, not a prerelease" {
    // ziglang.org's catalog leads with dev builds (0.17.0-dev.*) followed by
    // stable 0.16.0 — `latest` must skip the dev builds (npm semantics).
    const latest = resolveVersion("ziglang.org", "latest") orelse return error.NoLatest;
    try std.testing.expect(!isPrerelease(latest));
    // …while the dev channel stays reachable when explicitly requested.
    const dev = resolveVersion("ziglang.org", "0.17.0-dev") orelse return error.NoDev;
    try std.testing.expect(isPrerelease(dev));
}

test "prerelease ranges select only the requested development line" {
    const development = try parseConstraint("^0.17.0-dev");
    try std.testing.expect(development.allows_prerelease);
    try std.testing.expect(satisfiesConstraint("0.17.0-dev.131+73c51c142", development));
    try std.testing.expect(satisfiesConstraint("0.17.0-dev.1441_d5181a9c9", development));
    try std.testing.expect(!satisfiesConstraint("0.18.0-dev.1_deadbeef", development));

    const bounded = try parseConstraint(">=0.17.0-dev.1417+20befa4e6");
    try std.testing.expect(!satisfiesConstraint("0.17.0-dev.131+73c51c142", bounded));
    try std.testing.expect(satisfiesConstraint("0.17.0-dev.1441_d5181a9c9", bounded));

    const stable = try parseConstraint("^0.17.0");
    try std.testing.expect(!satisfiesConstraint("0.17.0-dev.1441_d5181a9c9", stable));
}

test "exact prerelease keys retain build identity" {
    const exact = try parseConstraint("0.17.0-dev.1441+d5181a9c9");
    try std.testing.expect(satisfiesConstraint("0.17.0-dev.1441_d5181a9c9", exact));
    try std.testing.expect(!satisfiesConstraint("0.17.0-dev.1417_20befa4e6", exact));
}

test "parse version" {
    const v1 = try parseVersion("1.2.3");
    try std.testing.expectEqual(@as(u32, 1), v1.major);
    try std.testing.expectEqual(@as(u32, 2), v1.minor);
    try std.testing.expectEqual(@as(u32, 3), v1.patch);

    const v2 = try parseVersion("v1.2.3");
    try std.testing.expectEqual(@as(u32, 1), v2.major);

    const v3 = try parseVersion("1.2.3-beta");
    try std.testing.expectEqual(@as(u32, 1), v3.major);
    try std.testing.expectEqual(@as(u32, 2), v3.minor);
    try std.testing.expectEqual(@as(u32, 3), v3.patch);
}

test "parse constraint" {
    const c1 = try parseConstraint("^1.2.3");
    try std.testing.expectEqual(ConstraintType.caret, c1.type);
    try std.testing.expectEqual(@as(u32, 1), c1.major);

    const c2 = try parseConstraint("~1.2.0");
    try std.testing.expectEqual(ConstraintType.tilde, c2.type);

    const c3 = try parseConstraint(">=1.0.0");
    try std.testing.expectEqual(ConstraintType.gte, c3.type);
}

test "satisfies constraint - exact" {
    const c = Constraint{ .type = .exact, .major = 1, .minor = 2, .patch = 3 };
    try std.testing.expect(satisfiesConstraint("1.2.3", c));
    try std.testing.expect(!satisfiesConstraint("1.2.4", c));
}

test "satisfies constraint - caret" {
    const c = Constraint{ .type = .caret, .major = 1, .minor = 2, .patch = 16 };

    // Should allow 1.2.16, 1.2.17, ..., 1.3.0, 1.99.99
    try std.testing.expect(satisfiesConstraint("1.2.16", c));
    try std.testing.expect(satisfiesConstraint("1.2.23", c));
    try std.testing.expect(satisfiesConstraint("1.3.0", c));
    try std.testing.expect(satisfiesConstraint("1.99.99", c));

    // Should NOT allow 2.0.0 or 1.2.15
    try std.testing.expect(!satisfiesConstraint("2.0.0", c));
    try std.testing.expect(!satisfiesConstraint("1.2.15", c));
    try std.testing.expect(!satisfiesConstraint("1.1.0", c));
}

test "satisfies constraint - tilde" {
    const c = Constraint{ .type = .tilde, .major = 1, .minor = 2, .patch = 0 };

    // Should allow 1.2.0, 1.2.1, ..., 1.2.99
    try std.testing.expect(satisfiesConstraint("1.2.0", c));
    try std.testing.expect(satisfiesConstraint("1.2.23", c));

    // Should NOT allow 1.3.0
    try std.testing.expect(!satisfiesConstraint("1.3.0", c));
}

test "parse constraint - loose/partial specifiers resolve to ranges" {
    // Bare major "1" behaves like ^1 (1.x), so 1.3.2 satisfies it.
    const c1 = try parseConstraint("1");
    try std.testing.expectEqual(ConstraintType.caret, c1.type);
    try std.testing.expect(satisfiesConstraint("1.3.2", c1));
    try std.testing.expect(satisfiesConstraint("1.0.8", c1));
    try std.testing.expect(!satisfiesConstraint("2.0.0", c1));

    // "1.2" behaves like ~1.2 (1.2.x).
    const c2 = try parseConstraint("1.2");
    try std.testing.expectEqual(ConstraintType.tilde, c2.type);
    try std.testing.expect(satisfiesConstraint("1.2.13", c2));
    try std.testing.expect(!satisfiesConstraint("1.3.0", c2));

    // "~2" (tilde, major only) behaves like ^2 (2.x), so 2.7.5 satisfies it.
    const c3 = try parseConstraint("~2");
    try std.testing.expectEqual(ConstraintType.caret, c3.type);
    try std.testing.expect(satisfiesConstraint("2.7.5", c3));
    try std.testing.expect(!satisfiesConstraint("3.0.0", c3));

    // A full "1.2.3" stays exact.
    const c4 = try parseConstraint("1.2.3");
    try std.testing.expectEqual(ConstraintType.exact, c4.type);
    try std.testing.expect(!satisfiesConstraint("1.2.4", c4));
}

test "resolve version - bun ^1.2.16" {
    // `bun.com`: bun renamed its domain and the catalog followed. These two
    // tests kept asking for `bun.sh` and had been failing ever since - the same
    // half-finished rename that made `pantry install bun` resolve to npm's shim,
    // because the recipe still published artifacts under the old domain.
    const resolved = resolveVersion("bun.com", "^1.2.16");
    if (resolved) |version| {
        // Should resolve to latest 1.x version (1.2.23 or higher)
        const v = try parseVersion(version);
        try std.testing.expectEqual(@as(u32, 1), v.major);
        try std.testing.expect(v.minor >= 2);
        if (v.minor == 2) {
            try std.testing.expect(v.patch >= 16);
        }
    } else {
        try std.testing.expect(false); // Should find a version
    }
}

test "resolve version - exact match" {
    const resolved = resolveVersion("bun.com", "1.2.20");
    if (resolved) |version| {
        try std.testing.expectEqualStrings("1.2.20", version);
    } else {
        try std.testing.expect(false);
    }
}

test "satisfies constraint - gte" {
    const c = Constraint{ .type = .gte, .major = 1, .minor = 2, .patch = 0 };
    try std.testing.expect(satisfiesConstraint("1.2.0", c));
    try std.testing.expect(satisfiesConstraint("1.2.1", c));
    try std.testing.expect(satisfiesConstraint("2.0.0", c));
    try std.testing.expect(!satisfiesConstraint("1.1.9", c));
    try std.testing.expect(!satisfiesConstraint("0.9.0", c));
}

test "satisfies constraint - lt" {
    const c = Constraint{ .type = .lt, .major = 2, .minor = 0, .patch = 0 };
    try std.testing.expect(satisfiesConstraint("1.9.9", c));
    try std.testing.expect(satisfiesConstraint("1.0.0", c));
    try std.testing.expect(!satisfiesConstraint("2.0.0", c));
    try std.testing.expect(!satisfiesConstraint("3.0.0", c));
}

test "satisfies constraint - gt" {
    const c = Constraint{ .type = .gt, .major = 1, .minor = 0, .patch = 0 };
    try std.testing.expect(satisfiesConstraint("1.0.1", c));
    try std.testing.expect(satisfiesConstraint("2.0.0", c));
    try std.testing.expect(!satisfiesConstraint("1.0.0", c));
    try std.testing.expect(!satisfiesConstraint("0.9.9", c));
}

test "satisfies constraint - lte" {
    const c = Constraint{ .type = .lte, .major = 1, .minor = 5, .patch = 0 };
    try std.testing.expect(satisfiesConstraint("1.5.0", c));
    try std.testing.expect(satisfiesConstraint("1.4.9", c));
    try std.testing.expect(satisfiesConstraint("0.0.1", c));
    try std.testing.expect(!satisfiesConstraint("1.5.1", c));
    try std.testing.expect(!satisfiesConstraint("2.0.0", c));
}

test "isSemverRange" {
    try std.testing.expect(isSemverRange("^1.0.0"));
    try std.testing.expect(isSemverRange("~1.0.0"));
    try std.testing.expect(isSemverRange(">=1.0.0"));
    try std.testing.expect(isSemverRange(">1.0.0"));
    try std.testing.expect(isSemverRange("<2.0.0"));
    try std.testing.expect(isSemverRange("<=2.0.0"));
    try std.testing.expect(isSemverRange("=1.0.0"));
    try std.testing.expect(!isSemverRange("1.0.0"));
    try std.testing.expect(!isSemverRange("latest"));
    try std.testing.expect(!isSemverRange(""));
}

test "findBestMatch" {
    const versions = [_][]const u8{ "1.0.0", "1.1.0", "1.2.0", "2.0.0" };
    const result = findBestMatch(&versions, "^1.0.0");
    try std.testing.expect(result != null);
    try std.testing.expectEqualStrings("1.2.0", result.?);
}

test "findBestMatch - no match" {
    const versions = [_][]const u8{ "1.0.0", "1.1.0" };
    const result = findBestMatch(&versions, "^2.0.0");
    try std.testing.expect(result == null);
}

test "parse version with v prefix" {
    const v = try parseVersion("v2.3.4");
    try std.testing.expectEqual(@as(u32, 2), v.major);
    try std.testing.expectEqual(@as(u32, 3), v.minor);
    try std.testing.expectEqual(@as(u32, 4), v.patch);
}

test "parse constraint with = prefix" {
    const c = try parseConstraint("=1.5.0");
    try std.testing.expectEqual(ConstraintType.exact, c.type);
    try std.testing.expectEqual(@as(u32, 1), c.major);
    try std.testing.expectEqual(@as(u32, 5), c.minor);
    try std.testing.expectEqual(@as(u32, 0), c.patch);
}

test "caret ^0.1.2 matches 0.1.x but not 0.2.0" {
    const c = try parseConstraint("^0.1.2");
    try std.testing.expect(satisfiesConstraint("0.1.2", c));
    try std.testing.expect(satisfiesConstraint("0.1.3", c));
    try std.testing.expect(satisfiesConstraint("0.1.99", c));
    try std.testing.expect(!satisfiesConstraint("0.2.0", c));
    try std.testing.expect(!satisfiesConstraint("0.1.1", c));
    try std.testing.expect(!satisfiesConstraint("1.0.0", c));
}

test "tilde ~1.2.3 matches 1.2.x but not 1.3.0" {
    const c = try parseConstraint("~1.2.3");
    try std.testing.expect(satisfiesConstraint("1.2.3", c));
    try std.testing.expect(satisfiesConstraint("1.2.4", c));
    try std.testing.expect(satisfiesConstraint("1.2.99", c));
    try std.testing.expect(!satisfiesConstraint("1.3.0", c));
    try std.testing.expect(!satisfiesConstraint("1.2.2", c));
    try std.testing.expect(!satisfiesConstraint("2.0.0", c));
}

test "caret constraint with 0.x" {
    // ^0.2.3 should only allow 0.2.x where x >= 3
    const c = Constraint{ .type = .caret, .major = 0, .minor = 2, .patch = 3 };
    try std.testing.expect(satisfiesConstraint("0.2.3", c));
    try std.testing.expect(satisfiesConstraint("0.2.4", c));
    try std.testing.expect(!satisfiesConstraint("0.3.0", c));
    try std.testing.expect(!satisfiesConstraint("0.2.2", c));
    try std.testing.expect(!satisfiesConstraint("1.0.0", c));
}

test "caret on a bare zero major matches every 0.x, the way npm reads it" {
    // `^0` := >=0.0.0 <1.0.0. The old reading demanded an exact 0.0.0, which
    // made `pkg@0` unresolvable for every package whose versions are all 0.x -
    // and that is most young C libraries, including libcbor.
    const c = try parseConstraint("^0");

    try std.testing.expect(satisfiesConstraint("0.13.0", c));
    try std.testing.expect(satisfiesConstraint("0.10.1", c));
    try std.testing.expect(satisfiesConstraint("0.0.1", c));
    try std.testing.expect(!satisfiesConstraint("1.0.0", c));
}

test "while a caret naming a minor still pins it" {
    // `^0.13` is >=0.13.0 <0.14.0: the rule that makes a zero major cautious,
    // which the fix above must not undo.
    const c = try parseConstraint("^0.13");

    try std.testing.expect(satisfiesConstraint("0.13.1", c));
    try std.testing.expect(!satisfiesConstraint("0.14.0", c));
    try std.testing.expect(!satisfiesConstraint("0.12.0", c));
}

test "and the dependency that found this resolves" {
    const resolved = resolveVersion("github.com/PJK/libcbor", "^0") orelse return error.NoVersion;

    try std.testing.expect(std.mem.startsWith(u8, resolved, "0."));
}

test "conjunctive native ranges enforce every upper and lower bound" {
    for ([_][]const u8{ ">=3.10<3.15", ">=3.10 <3.15", ">= 3.10 < 3.15" }) |text| {
        const constraint = try parseConstraint(text);
        try std.testing.expect(satisfiesConstraint("3.10.0", constraint));
        try std.testing.expect(satisfiesConstraint("3.14.8", constraint));
        try std.testing.expect(!satisfiesConstraint("3.9.18", constraint));
        try std.testing.expect(!satisfiesConstraint("3.15.0", constraint));
        try std.testing.expectEqualStrings("3.14.8", findBestMatch(&.{ "3.15.0", "3.14.8", "3.10.0" }, text).?);
    }
    const strict = try parseConstraint(">8.5<12");
    try std.testing.expect(!satisfiesConstraint("8.5.0", strict));
    try std.testing.expect(satisfiesConstraint("9.0.0", strict));
    try std.testing.expect(satisfiesConstraint("11.9.0", strict));
    try std.testing.expect(!satisfiesConstraint("12.0.0", strict));
    const development = try parseConstraint(">=0.17.0-dev.131<0.18.0");
    try std.testing.expect(satisfiesConstraint("0.17.0-dev.2384+ac77c23af", development));
    try std.testing.expect(!satisfiesConstraint("0.18.0-dev.1+abcdef", development));
}
