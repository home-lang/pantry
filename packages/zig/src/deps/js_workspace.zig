//! JavaScript workspace ownership. The selected JS package manager owns its
//! complete graph; Pantry owns explicitly declared system/companion packages.
const std = @import("std");
const io_helper = @import("../io_helper.zig");
const package_types = @import("../packages/types.zig");

pub const Ownership = struct {
    allocator: std.mem.Allocator,
    enabled: bool = false,
    names: std.StringHashMap(void),
    members: std.StringHashMap(void),

    pub fn init(allocator: std.mem.Allocator) Ownership {
        return .{ .allocator = allocator, .names = std.StringHashMap(void).init(allocator), .members = std.StringHashMap(void).init(allocator) };
    }

    pub fn deinit(self: *Ownership) void {
        var it = self.names.keyIterator();
        while (it.next()) |name| self.allocator.free(name.*);
        self.names.deinit();
        var members = self.members.keyIterator();
        while (members.next()) |name| self.allocator.free(name.*);
        self.members.deinit();
    }

    fn add(self: *Ownership, name: []const u8) !void {
        if (self.names.contains(name)) return;
        const owned = try self.allocator.dupe(u8, name);
        errdefer self.allocator.free(owned);
        try self.names.put(owned, {});
    }

    pub fn readManifest(self: *Ownership, directory: []const u8, root: bool) !void {
        const path = try std.fs.path.join(self.allocator, &.{ directory, "package.json" });
        defer self.allocator.free(path);
        const content = io_helper.readFileAlloc(self.allocator, path, 4 * 1024 * 1024) catch |err| switch (err) {
            error.FileNotFound => return,
            else => return err,
        };
        defer self.allocator.free(content);
        const parsed = try std.json.parseFromSlice(std.json.Value, self.allocator, content, .{});
        defer parsed.deinit();
        if (parsed.value != .object) return error.InvalidJavaScriptManifest;
        if (root) self.enabled = hasWorkspacePatterns(parsed.value.object);
        if (!root) {
            if (parsed.value.object.get("name")) |name| {
                if (name == .string and !self.members.contains(name.string)) {
                    const owned = try self.allocator.dupe(u8, name.string);
                    errdefer self.allocator.free(owned);
                    try self.members.put(owned, {});
                }
            }
        }
        inline for (.{ "dependencies", "devDependencies", "optionalDependencies", "peerDependencies" }) |section| {
            const deps = parsed.value.object.get(section) orelse continue;
            if (deps != .object) continue;
            var it = deps.object.keyIterator();
            while (it.next()) |name| try self.add(name.*);
        }
    }

    /// Include only the dependency closure of lock entries reached from the
    /// declared JS graph. Unrelated explicit Pantry npm entries stay owned by
    /// Pantry and cannot be deleted by a JavaScript migration.
    pub fn includeLegacyDependencies(self: *Ownership, lockfile: *const package_types.Lockfile) !void {
        if (!self.enabled) return;
        var changed = true;
        while (changed) {
            const before = self.names.count();
            var it = lockfile.packages.valueIterator();
            while (it.next()) |entry| {
                if (entry.source != .npm or !self.names.contains(entry.name)) continue;
                if (entry.dependencies) |dependencies| {
                    var deps = dependencies.keyIterator();
                    while (deps.next()) |name| try self.add(name.*);
                }
            }
            changed = self.names.count() != before;
        }
    }

    pub fn owns(self: *const Ownership, name: []const u8, source: package_types.PackageSource) bool {
        return self.enabled and source != .pantry and self.names.contains(name);
    }

    /// Called only after the selected JS manager succeeds, while the old
    /// committed Pantry lock still establishes the provenance of legacy files.
    pub fn removeLegacyShadows(self: *Ownership, project_root: []const u8, modules_dir: []const u8, old: *const package_types.Lockfile, frozen: bool) !void {
        if (!self.enabled) return;
        try self.includeLegacyDependencies(old);
        var it = old.packages.valueIterator();
        while (it.next()) |entry| {
            if (entry.source != .npm or !self.names.contains(entry.name)) continue;
            if (frozen) return error.JavaScriptWorkspaceLockNeedsMigration;
            // Workspace member links have already been refreshed by the
            // workspace installer; they are not legacy external npm caches.
            if (self.members.contains(entry.name)) continue;
            if (!validManagedName(entry.name)) return error.InvalidManagedJavaScriptPackage;
            const directory = try std.fs.path.join(self.allocator, &.{ project_root, modules_dir, entry.name });
            defer self.allocator.free(directory);
            const manifest = try std.fs.path.join(self.allocator, &.{ directory, "package.json" });
            defer self.allocator.free(manifest);
            const bytes = io_helper.readFileAlloc(self.allocator, manifest, 4 * 1024 * 1024) catch |err| switch (err) {
                error.FileNotFound => continue,
                else => return err,
            };
            defer self.allocator.free(bytes);
            const parsed = try std.json.parseFromSlice(std.json.Value, self.allocator, bytes, .{});
            defer parsed.deinit();
            if (parsed.value != .object) return error.UnownedJavaScriptShadow;
            const name = parsed.value.object.get("name") orelse return error.UnownedJavaScriptShadow;
            const version = parsed.value.object.get("version") orelse return error.UnownedJavaScriptShadow;
            if (name != .string or version != .string or !std.mem.eql(u8, name.string, entry.name) or !std.mem.eql(u8, version.string, entry.version))
                return error.UnownedJavaScriptShadow;

            // Delete only bin links whose actual target is inside this owned
            // installation. Ordinary files and other providers are preserved.
            if (entry.bin) |bins| {
                var names = bins.keyIterator();
                while (names.next()) |bin| {
                    if (!validManagedName(bin.*) or std.mem.indexOfScalar(u8, bin.*, '/') != null) continue;
                    const bin_dir = try std.fs.path.join(self.allocator, &.{ project_root, modules_dir, ".bin" });
                    defer self.allocator.free(bin_dir);
                    const link = try std.fs.path.join(self.allocator, &.{ bin_dir, bin.* });
                    defer self.allocator.free(link);
                    const target = io_helper.readLinkAlloc(self.allocator, link) catch continue;
                    defer self.allocator.free(target);
                    const absolute = try std.fs.path.resolve(self.allocator, &.{ bin_dir, target });
                    defer self.allocator.free(absolute);
                    if (std.mem.startsWith(u8, absolute, directory) and absolute.len > directory.len and (absolute[directory.len] == '/' or absolute[directory.len] == '\\'))
                        try io_helper.deleteFile(link);
                }
            }
            try io_helper.deleteTree(directory);
            if (io_helper.statFile(directory)) |_| {
                return error.LegacyJavaScriptShadowRemovalFailed;
            } else |err| switch (err) {
                error.FileNotFound => {},
                else => return err,
            }
        }
    }
};

pub fn hasWorkspacePatterns(object: std.json.ObjectMap) bool {
    const workspaces = object.get("workspaces") orelse return false;
    const patterns = switch (workspaces) {
        .array => |list| list,
        .object => |nested| blk: {
            const packages = nested.get("packages") orelse return false;
            if (packages != .array) return false;
            break :blk packages.array;
        },
        else => return false,
    };
    for (patterns.items) |pattern| {
        if (pattern == .string and pattern.string.len > 0 and pattern.string[0] != '!') return true;
    }
    return false;
}

/// A lock entry and matching installed identity establish ownership of a
/// legacy Pantry npm shadow. This never accepts an arbitrary directory or a
/// path that escapes the managed modules namespace.
pub fn validManagedName(name: []const u8) bool {
    if (name.len == 0 or std.mem.indexOfScalar(u8, name, '\\') != null or std.mem.indexOfScalar(u8, name, ':') != null or std.mem.indexOfScalar(u8, name, 0) != null) return false;
    if (name[0] == '@') {
        const slash = std.mem.indexOfScalar(u8, name, '/') orelse return false;
        if (slash <= 1 or slash + 1 >= name.len) return false;
        if (std.mem.indexOfScalar(u8, name[slash + 1 ..], '/') != null) return false;
        return !std.mem.eql(u8, name[slash + 1 ..], ".") and !std.mem.eql(u8, name[slash + 1 ..], "..");
    }
    return std.mem.indexOfScalar(u8, name, '/') == null and !std.mem.eql(u8, name, ".") and !std.mem.eql(u8, name, "..");
}

test "JS workspace ownership recognizes both manifest forms without claiming system packages" {
    const allocator = std.testing.allocator;
    for ([_][]const u8{ "{\"workspaces\":[\"packages/*\"]}", "{\"workspaces\":{\"packages\":[\"packages/*\"]}}" }) |text| {
        const parsed = try std.json.parseFromSlice(std.json.Value, allocator, text, .{});
        defer parsed.deinit();
        try std.testing.expect(hasWorkspacePatterns(parsed.value.object));
    }
    var owner = Ownership.init(allocator);
    defer owner.deinit();
    owner.enabled = true;
    try owner.add("@scope/parent");
    try owner.add("ziglang.org");
    try std.testing.expect(owner.owns("@scope/parent", .npm));
    try std.testing.expect(!owner.owns("ziglang.org", .pantry));
    try std.testing.expect(!owner.owns("unrelated-user-package", .npm));
}

test "legacy JS migration cannot claim paths outside its managed namespace" {
    for ([_][]const u8{ "", ".", "..", "../user", "/user", "@scope/../user", "@scope/..", "@/pkg", "C:\\user" }) |name|
        try std.testing.expect(!validManagedName(name));
    try std.testing.expect(validManagedName("@scope/package"));
    try std.testing.expect(validManagedName("package"));
}

test "legacy migration preserves unrelated files and refuses frozen lock changes" {
    const allocator = std.testing.allocator;
    var temp = std.testing.tmpDir(.{});
    defer temp.cleanup();
    try temp.dir.createDirPath(io_helper.io, "pantry/owned");
    try temp.dir.createDirPath(io_helper.io, "node_modules/user-file");
    try temp.dir.writeFile(io_helper.io, .{ .sub_path = "pantry/owned/package.json", .data = "{\"name\":\"owned\",\"version\":\"1.0.0\"}" });
    try temp.dir.writeFile(io_helper.io, .{ .sub_path = "node_modules/user-file/data", .data = "preserve me" });
    var buffer: [std.fs.max_path_bytes]u8 = undefined;
    const length = try temp.dir.realPath(io_helper.io, &buffer);
    const root = buffer[0..length];
    var owner = Ownership.init(allocator);
    defer owner.deinit();
    owner.enabled = true;
    try owner.add("owned");
    var old = try package_types.Lockfile.init(allocator, "1.0.0");
    defer old.deinit(allocator);
    try old.addEntry(allocator, "owned@1.0.0", .{
        .name = try allocator.dupe(u8, "owned"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .source = .npm,
    });
    try std.testing.expectError(error.JavaScriptWorkspaceLockNeedsMigration, owner.removeLegacyShadows(root, "pantry", &old, true));
    const managed = try std.fs.path.join(allocator, &.{ root, "pantry/owned/package.json" });
    defer allocator.free(managed);
    try io_helper.accessAbsolute(managed, .{});
    try owner.removeLegacyShadows(root, "pantry", &old, false);
    try std.testing.expectError(error.FileNotFound, io_helper.accessAbsolute(managed, .{}));
    const user = try std.fs.path.join(allocator, &.{ root, "node_modules/user-file/data" });
    defer allocator.free(user);
    const data = try io_helper.readFileAlloc(allocator, user, 100);
    defer allocator.free(data);
    try std.testing.expectEqualStrings("preserve me", data);
}

test "a changed installed identity cannot be deleted by a legacy lock entry" {
    const allocator = std.testing.allocator;
    var temp = std.testing.tmpDir(.{});
    defer temp.cleanup();
    try temp.dir.createDirPath(io_helper.io, "pantry/owned");
    try temp.dir.writeFile(io_helper.io, .{ .sub_path = "pantry/owned/package.json", .data = "{\"name\":\"user-package\",\"version\":\"1.0.0\"}" });
    var buffer: [std.fs.max_path_bytes]u8 = undefined;
    const length = try temp.dir.realPath(io_helper.io, &buffer);
    var owner = Ownership.init(allocator);
    defer owner.deinit();
    owner.enabled = true;
    try owner.add("owned");
    var old = try package_types.Lockfile.init(allocator, "1.0.0");
    defer old.deinit(allocator);
    try old.addEntry(allocator, "owned@1.0.0", .{
        .name = try allocator.dupe(u8, "owned"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .source = .npm,
    });
    try std.testing.expectError(error.UnownedJavaScriptShadow, owner.removeLegacyShadows(buffer[0..length], "pantry", &old, false));
    const path = try std.fs.path.join(allocator, &.{ buffer[0..length], "pantry/owned/package.json" });
    defer allocator.free(path);
    try io_helper.accessAbsolute(path, .{});
}
