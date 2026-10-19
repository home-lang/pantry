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
    retained: std.StringHashMap(void),

    pub fn init(allocator: std.mem.Allocator) Ownership {
        return .{ .allocator = allocator, .names = std.StringHashMap(void).init(allocator), .members = std.StringHashMap(void).init(allocator), .retained = std.StringHashMap(void).init(allocator) };
    }

    pub fn deinit(self: *Ownership) void {
        var it = self.names.keyIterator();
        while (it.next()) |name| self.allocator.free(name.*);
        self.names.deinit();
        var members = self.members.keyIterator();
        while (members.next()) |name| self.allocator.free(name.*);
        self.members.deinit();
        var retained = self.retained.keyIterator();
        while (retained.next()) |name| self.allocator.free(name.*);
        self.retained.deinit();
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
        if (parsed.value.object.get("system")) |system| {
            if (system == .object) {
                var names = system.object.iterator();
                while (names.next()) |entry| try self.retain(entry.key_ptr.*);
            }
        }
        if (!root) {
            if (parsed.value.object.get("name")) |name| {
                if (name == .string and !self.members.contains(name.string)) {
                    const owned = try self.allocator.dupe(u8, name.string);
                    errdefer self.allocator.free(owned);
                    try self.members.put(owned, {});
                }
            }
        }
        for ([_][]const u8{ "dependencies", "devDependencies", "optionalDependencies", "peerDependencies" }) |section| {
            const deps = parsed.value.object.get(section) orelse continue;
            if (deps != .object) continue;
            var it = deps.object.iterator();
            while (it.next()) |entry| try self.add(entry.key_ptr.*);
        }
    }

    fn retain(self: *Ownership, raw_name: []const u8) !void {
        const name = if (std.mem.startsWith(u8, raw_name, "npm:")) raw_name[4..] else if (std.mem.startsWith(u8, raw_name, "auto:")) raw_name[5..] else raw_name;
        if (self.retained.contains(name)) return;
        const owned = try self.allocator.dupe(u8, name);
        errdefer self.allocator.free(owned);
        try self.retained.put(owned, {});
    }

    pub fn readCompanion(self: *Ownership, project_root: []const u8) !void {
        const detector = @import("detector.zig");
        const file = try detector.findDepsFile(self.allocator, project_root) orelse return;
        defer self.allocator.free(file.path);
        if (file.format == .package_json) return;
        const dependencies = try @import("parser.zig").inferDependencies(self.allocator, file);
        defer {
            for (dependencies) |*dependency| dependency.deinit(self.allocator);
            self.allocator.free(dependencies);
        }
        for (dependencies) |dependency| try self.retain(dependency.name);
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
        // Explicit native declarations and their dependency closure keep their
        // Pantry tree, even if the same name also appears in the JS graph.
        changed = true;
        while (changed) {
            const before = self.retained.count();
            var it = lockfile.packages.valueIterator();
            while (it.next()) |entry| {
                if (!self.retained.contains(entry.name)) continue;
                if (entry.dependencies) |dependencies| {
                    var deps = dependencies.keyIterator();
                    while (deps.next()) |name| try self.retain(name.*);
                }
            }
            changed = self.retained.count() != before;
        }
    }

    pub fn owns(self: *const Ownership, name: []const u8, source: package_types.PackageSource) bool {
        if (!self.enabled or !self.names.contains(name)) return false;
        // A dot in an npm name is not enough to make it a system dependency.
        // Keep legacy known system names and explicit system declarations.
        if (source == .pantry and (self.retained.contains(name) or @import("../packages/generated.zig").getPackageByName(name) != null)) return false;
        return true;
    }

    pub fn validateModulesDirectory(self: *const Ownership, project_root: []const u8, modules_dir: []const u8) !void {
        if (!self.enabled) return;
        const managed = try std.fs.path.resolve(self.allocator, &.{ project_root, modules_dir });
        defer self.allocator.free(managed);
        const javascript = try std.fs.path.resolve(self.allocator, &.{ project_root, "node_modules" });
        defer self.allocator.free(javascript);
        try rejectJavaScriptDirectory(managed, javascript);
        var managed_buffer: [std.fs.max_path_bytes]u8 = undefined;
        const managed_length = io_helper.cwd().realPathFile(io_helper.io, managed, &managed_buffer) catch |err| switch (err) {
            error.FileNotFound => return,
            else => return err,
        };
        var javascript_buffer: [std.fs.max_path_bytes]u8 = undefined;
        const javascript_length = io_helper.cwd().realPathFile(io_helper.io, javascript, &javascript_buffer) catch |err| switch (err) {
            error.FileNotFound => return,
            else => return err,
        };
        try rejectJavaScriptDirectory(managed_buffer[0..managed_length], javascript_buffer[0..javascript_length]);
    }

    fn rejectJavaScriptDirectory(managed: []const u8, javascript: []const u8) !void {
        if (managed.len < javascript.len) return;
        const same_prefix = if (@import("builtin").os.tag == .windows)
            std.ascii.eqlIgnoreCase(managed[0..javascript.len], javascript)
        else
            std.mem.eql(u8, managed[0..javascript.len], javascript);
        if (same_prefix and (managed.len == javascript.len or managed[javascript.len] == '/' or managed[javascript.len] == '\\'))
            return error.JavaScriptAndNativeModulesDirectoriesOverlap;
    }

    /// Called only after the selected JS manager succeeds, while the old
    /// committed Pantry lock still establishes the provenance of legacy files.
    pub fn removeLegacyShadows(self: *Ownership, project_root: []const u8, modules_dir: []const u8, old: *const package_types.Lockfile, frozen: bool) !void {
        if (!self.enabled) return;
        try self.validateModulesDirectory(project_root, modules_dir);
        try self.includeLegacyDependencies(old);
        var candidates = std.ArrayList(*const package_types.LockfileEntry).empty;
        defer candidates.deinit(self.allocator);
        var it = old.packages.valueIterator();
        while (it.next()) |entry| {
            if (entry.source != .npm or !self.names.contains(entry.name) or self.retained.contains(entry.name)) continue;
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

            // Resolve the parent through the OS: a user-created scope symlink
            // must not redirect deletion outside the managed modules root.
            const managed = try std.fs.path.join(self.allocator, &.{ project_root, modules_dir });
            defer self.allocator.free(managed);
            var root_buffer: [std.fs.max_path_bytes]u8 = undefined;
            const root_length = try io_helper.cwd().realPathFile(io_helper.io, managed, &root_buffer);
            var parent_buffer: [std.fs.max_path_bytes]u8 = undefined;
            const parent_length = try io_helper.cwd().realPathFile(io_helper.io, std.fs.path.dirname(directory).?, &parent_buffer);
            const canonical_root = root_buffer[0..root_length];
            const canonical_parent = parent_buffer[0..parent_length];
            if (!std.mem.eql(u8, canonical_root, canonical_parent) and !(std.mem.startsWith(u8, canonical_parent, canonical_root) and canonical_parent.len > canonical_root.len and (canonical_parent[canonical_root.len] == '/' or canonical_parent[canonical_root.len] == '\\')))
                return error.UnownedJavaScriptShadow;
            try candidates.append(self.allocator, entry);
        }

        // Validate every candidate before deleting any legacy installation.
        for (candidates.items) |entry| {
            const directory = try std.fs.path.join(self.allocator, &.{ project_root, modules_dir, entry.name });
            defer self.allocator.free(directory);

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
                    var target_buffer: [std.fs.max_path_bytes]u8 = undefined;
                    const target_length = io_helper.cwd().readLink(io_helper.io, link, &target_buffer) catch continue;
                    const target = target_buffer[0..target_length];
                    const absolute = try std.fs.path.resolve(self.allocator, &.{ bin_dir, target });
                    defer self.allocator.free(absolute);
                    if (std.mem.startsWith(u8, absolute, directory) and absolute.len > directory.len and (absolute[directory.len] == '/' or absolute[directory.len] == '\\'))
                        try io_helper.deleteFile(link);
                }
            }
            try io_helper.cwd().deleteTree(io_helper.io, directory);
            if (io_helper.cwd().statFile(io_helper.io, directory, .{ .follow_symlinks = false })) |_| {
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
    try owner.add("valid.npm-name");
    try std.testing.expect(owner.owns("@scope/parent", .npm));
    try std.testing.expect(!owner.owns("ziglang.org", .pantry));
    try std.testing.expect(owner.owns("valid.npm-name", .pantry));
    try std.testing.expect(!owner.owns("unrelated-user-package", .npm));
}

test "legacy JS migration cannot claim paths outside its managed namespace" {
    for ([_][]const u8{ "", ".", "..", "../user", "/user", "@scope/../user", "@scope/..", "@/pkg", "C:\\user" }) |name|
        try std.testing.expect(!validManagedName(name));
    try std.testing.expect(validManagedName("@scope/package"));
    try std.testing.expect(validManagedName("package"));
}

test "native workspace content cannot overlap the JavaScript manager's directory" {
    var owner = Ownership.init(std.testing.allocator);
    defer owner.deinit();
    owner.enabled = true;
    try owner.validateModulesDirectory("/project", "pantry");
    for ([_][]const u8{ "node_modules", "./node_modules", "pantry/../node_modules", "node_modules/native" }) |directory|
        try std.testing.expectError(error.JavaScriptAndNativeModulesDirectoriesOverlap, owner.validateModulesDirectory("/project", directory));
}

test "a native directory symlink cannot redirect migration into node_modules" {
    var temp = std.testing.tmpDir(.{});
    defer temp.cleanup();
    try temp.dir.createDirPath(io_helper.io, "node_modules");
    try temp.dir.symLink(io_helper.io, "node_modules", "pantry", .{ .is_directory = true });
    var buffer: [std.fs.max_path_bytes]u8 = undefined;
    const length = try temp.dir.realPath(io_helper.io, &buffer);
    var owner = Ownership.init(std.testing.allocator);
    defer owner.deinit();
    owner.enabled = true;
    try std.testing.expectError(error.JavaScriptAndNativeModulesDirectoriesOverlap, owner.validateModulesDirectory(buffer[0..length], "pantry"));
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

test "explicit Pantry dependencies retain their npm dependency closure" {
    const allocator = std.testing.allocator;
    var owner = Ownership.init(allocator);
    defer owner.deinit();
    owner.enabled = true;
    try owner.add("native-tool");
    try owner.retain("npm:native-tool");
    var old = try package_types.Lockfile.init(allocator, "1.0.0");
    defer old.deinit(allocator);
    var dependencies = std.StringHashMap([]const u8).init(allocator);
    try dependencies.put(try allocator.dupe(u8, "native-child"), try allocator.dupe(u8, "1.0.0"));
    try old.addEntry(allocator, "native-tool@1.0.0", .{
        .name = try allocator.dupe(u8, "native-tool"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .source = .npm,
        .dependencies = dependencies,
    });
    try owner.includeLegacyDependencies(&old);
    try std.testing.expect(owner.names.contains("native-child"));
    try std.testing.expect(owner.retained.contains("native-child"));
    // No file access or frozen-lock migration is permitted for retained names.
    try owner.removeLegacyShadows("/does-not-exist", "pantry", &old, true);
}

test "migration validates every installed identity before removing any candidate" {
    const allocator = std.testing.allocator;
    var temp = std.testing.tmpDir(.{});
    defer temp.cleanup();
    try temp.dir.createDirPath(io_helper.io, "pantry/owned");
    try temp.dir.createDirPath(io_helper.io, "pantry/changed");
    try temp.dir.writeFile(io_helper.io, .{ .sub_path = "pantry/owned/package.json", .data = "{\"name\":\"owned\",\"version\":\"1.0.0\"}" });
    try temp.dir.writeFile(io_helper.io, .{ .sub_path = "pantry/changed/package.json", .data = "{\"name\":\"user-data\",\"version\":\"1.0.0\"}" });
    var buffer: [std.fs.max_path_bytes]u8 = undefined;
    const length = try temp.dir.realPath(io_helper.io, &buffer);
    var owner = Ownership.init(allocator);
    defer owner.deinit();
    owner.enabled = true;
    var old = try package_types.Lockfile.init(allocator, "1.0.0");
    defer old.deinit(allocator);
    for ([_][]const u8{ "owned", "changed" }) |name| {
        try owner.add(name);
        try old.addEntry(allocator, name, .{ .name = try allocator.dupe(u8, name), .version = try allocator.dupe(u8, "1.0.0"), .source = .npm });
    }
    try std.testing.expectError(error.UnownedJavaScriptShadow, owner.removeLegacyShadows(buffer[0..length], "pantry", &old, false));
    const owned = try temp.dir.readFileAlloc(io_helper.io, "pantry/owned/package.json", allocator, .limited(100));
    defer allocator.free(owned);
    try std.testing.expectEqualStrings("{\"name\":\"owned\",\"version\":\"1.0.0\"}", owned);
}
