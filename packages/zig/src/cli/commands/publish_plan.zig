//! Decisions `pantry publish` makes about a monorepo release as a whole,
//! rather than about one upload: which packages must wait because something
//! they need did not make it, and what to say when npm has no such scope.
//!
//! Kept apart from package.zig, as publish_conflict.zig is, so the tests
//! below actually run (test_registry_root.zig imports this file).

const std = @import("std");

/// The sections whose packages an install of the published package fetches.
/// devDependencies are not installed by consumers, so a sibling that only
/// appears there holds nothing back.
const install_sections = [_][]const u8{ "dependencies", "peerDependencies", "optionalDependencies" };

/// The first dependency of the manifest in `content` that is one of
/// `failed`: a workspace sibling that did not publish in this run.
///
/// Publishing a package anyway would put a version on npm that cannot be
/// installed — its dependency's version is not there — and npm versions can't
/// be replaced, only superseded. Holding it back costs nothing: the next run,
/// once the sibling is fixed, publishes both.
///
/// A manifest that can't be parsed holds nothing back; the publish itself will
/// say what is wrong with it.
pub fn heldBackBy(allocator: std.mem.Allocator, content: []const u8, failed: []const []const u8) ?[]const u8 {
    if (failed.len == 0) return null;
    const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch return null;
    defer parsed.deinit();
    if (parsed.value != .object) return null;
    for (install_sections) |section| {
        const deps = parsed.value.object.get(section) orelse continue;
        if (deps != .object) continue;
        var it = deps.object.iterator();
        while (it.next()) |entry| {
            // Return the caller's own slice, which outlives the parse.
            for (failed) |name| {
                if (std.mem.eql(u8, name, entry.key_ptr.*)) return name;
            }
        }
    }
    return null;
}

/// An accepted upload whose public readback waits for the rest of its batch.
pub const DeferredReadback = struct {
    name: []const u8,
    version: []const u8,
    integrity: [95]u8,
    registry_url: []const u8,

    pub fn deinit(self: DeferredReadback, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.version);
        allocator.free(self.registry_url);
    }
};

pub const ReadbackQueue = std.ArrayList(DeferredReadback);

pub fn deferReadback(allocator: std.mem.Allocator, queue: *ReadbackQueue, name: []const u8, version: []const u8, integrity: [95]u8, registry_url: []const u8) !void {
    const owned_name = try allocator.dupe(u8, name);
    errdefer allocator.free(owned_name);
    const owned_version = try allocator.dupe(u8, version);
    errdefer allocator.free(owned_version);
    const owned_url = try allocator.dupe(u8, registry_url);
    errdefer allocator.free(owned_url);
    try queue.append(allocator, .{ .name = owned_name, .version = owned_version, .integrity = integrity, .registry_url = owned_url });
}

/// The queued upload `manifest` installs, if any, by its index in `queue`.
pub fn queuedDependency(allocator: std.mem.Allocator, manifest: []const u8, queue: []const DeferredReadback) ?usize {
    if (queue.len == 0) return null;
    var names: std.ArrayList([]const u8) = .empty;
    defer names.deinit(allocator);
    for (queue) |item| names.append(allocator, item.name) catch return null;
    const name = heldBackBy(allocator, manifest, names.items) orelse return null;
    for (queue, 0..) |item, index| {
        if (std.mem.eql(u8, item.name, name)) return index;
    }
    return null;
}

/// The scope npm says does not exist, for a scoped package rejected with
/// "Scope not found": `@ts-maps` for `@ts-maps/react`.
///
/// npm answers a publish to an organisation that was never created with a
/// bare 404, which reads like a token problem. It isn't one, and no token can
/// fix it: the org has to exist, and the publishing account has to belong to
/// it.
pub fn missingScope(package_name: []const u8, message: ?[]const u8) ?[]const u8 {
    if (package_name.len < 2 or package_name[0] != '@') return null;
    const msg = message orelse return null;
    if (std.ascii.findIgnoreCase(msg, "scope not found") == null) return null;
    const slash = std.mem.indexOfScalar(u8, package_name, '/') orelse return null;
    return package_name[0..slash];
}

test "a package waits for a sibling it installs that failed" {
    const a = std.testing.allocator;
    const manifest =
        \\{ "name": "ts-maps-nuxt", "dependencies": { "@ts-maps/vue": "workspace:*", "ts-maps": "workspace:*" } }
    ;
    try std.testing.expectEqualStrings("@ts-maps/vue", heldBackBy(a, manifest, &.{ "@ts-maps/react", "@ts-maps/vue" }).?);
    try std.testing.expect(heldBackBy(a, manifest, &.{"@ts-maps/react"}) == null);
    try std.testing.expect(heldBackBy(a, manifest, &.{}) == null);
}

test "peer and optional dependencies hold a package back; dev dependencies don't" {
    const a = std.testing.allocator;
    try std.testing.expect(heldBackBy(a,
        \\{ "peerDependencies": { "core": "^1.0.0" } }
    , &.{"core"}) != null);
    try std.testing.expect(heldBackBy(a,
        \\{ "optionalDependencies": { "core": "^1.0.0" } }
    , &.{"core"}) != null);
    try std.testing.expect(heldBackBy(a,
        \\{ "devDependencies": { "core": "workspace:*" } }
    , &.{"core"}) == null);
}

test "a manifest that can't be read holds nothing back" {
    try std.testing.expect(heldBackBy(std.testing.allocator, "{ not json", &.{"core"}) == null);
}

test "a missing scope is named from npm's message" {
    try std.testing.expectEqualStrings("@ts-maps", missingScope("@ts-maps/react", "404 Not Found: Scope not found").?);
    try std.testing.expectEqualStrings("@ts-maps", missingScope("@ts-maps/react", "scope not found").?);
    try std.testing.expect(missingScope("ts-maps", "Scope not found") == null);
    try std.testing.expect(missingScope("@ts-maps/react", "Not found") == null);
    try std.testing.expect(missingScope("@ts-maps/react", null) == null);
}

test "a queued upload is read back before a package that installs it, and only then" {
    const allocator = std.testing.allocator;
    var queue: ReadbackQueue = .empty;
    defer {
        for (queue.items) |item| item.deinit(allocator);
        queue.deinit(allocator);
    }
    const integrity: [95]u8 = @splat('a');
    try deferReadback(allocator, &queue, "@stacksjs/sanitizer", "0.2.603", integrity, "https://registry.npmjs.org");
    try deferReadback(allocator, &queue, "stx-router", "0.2.603", integrity, "https://registry.npmjs.org");

    // bun-plugin-stx installs stx-router, which is still propagating.
    const plugin = "{\"name\":\"bun-plugin-stx\",\"dependencies\":{\"stx-router\":\"0.2.603\"}}";
    try std.testing.expectEqual(@as(?usize, 1), queuedDependency(allocator, plugin, queue.items));
    // A package that installs nothing queued uploads without waiting.
    const unrelated = "{\"name\":\"@stacksjs/desktop\",\"dependencies\":{\"craft-native\":\">=0.0.111\"}}";
    try std.testing.expectEqual(@as(?usize, null), queuedDependency(allocator, unrelated, queue.items));
    try std.testing.expectEqual(@as(?usize, null), queuedDependency(allocator, plugin, &.{}));
    // The queue owns copies, not the caller's strings.
    try std.testing.expectEqualStrings("stx-router", queue.items[1].name);
    try std.testing.expectEqualStrings("https://registry.npmjs.org", queue.items[1].registry_url);
}
