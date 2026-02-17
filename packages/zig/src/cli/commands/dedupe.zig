//! Dependency deduplication
//!
//! Scan node_modules for duplicate packages (same package name with different
//! versions at different paths) and optionally remove nested duplicates when
//! a compatible version exists at the top level.

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const common = @import("common.zig");
const style = @import("../style.zig");

const CommandResult = common.CommandResult;

/// Duplicate package entry
pub const DuplicatePackage = struct {
    name: []const u8,
    versions: [][]const u8,
    locations: [][]const u8,
    total_size: usize,

    pub fn deinit(self: *DuplicatePackage, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        for (self.versions) |v| allocator.free(v);
        allocator.free(self.versions);
        for (self.locations) |l| allocator.free(l);
        allocator.free(self.locations);
    }
};

/// Internal struct for collecting package instances during scan
const PackageInstance = struct {
    version: []const u8,
    location: []const u8,
    size: usize,
};

/// Deduplicate dependencies
pub fn execute(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    // Parse flags
    var dry_run = false;
    for (args) |arg| {
        if (std.mem.eql(u8, arg, "--dry-run")) {
            dry_run = true;
        }
    }

    if (dry_run) {
        style.print("Dry run mode - no changes will be made\n\n", .{});
    }

    const cwd = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    const nm_path = try std.fmt.allocPrint(allocator, "{s}/node_modules", .{cwd});
    defer allocator.free(nm_path);

    // Check node_modules exists
    io_helper.accessAbsolute(nm_path, .{}) catch {
        return CommandResult.err(allocator, "No node_modules directory found. Run 'pantry install' first.");
    };

    style.print("Analyzing dependency tree...\n\n", .{});

    // Scan node_modules recursively and collect all package instances
    var package_map = std.StringHashMap(std.ArrayList(PackageInstance)).init(allocator);
    defer {
        var map_iter = package_map.iterator();
        while (map_iter.next()) |entry| {
            for (entry.value_ptr.items) |inst| {
                allocator.free(inst.version);
                allocator.free(inst.location);
            }
            entry.value_ptr.deinit(allocator);
            allocator.free(entry.key_ptr.*);
        }
        package_map.deinit();
    }

    try scanNodeModules(allocator, nm_path, &package_map);

    // Build duplicate list (packages with more than one unique version)
    var duplicates = std.ArrayList(DuplicatePackage){};
    defer {
        for (duplicates.items) |*dup| {
            dup.deinit(allocator);
        }
        duplicates.deinit(allocator);
    }

    var pkg_iter = package_map.iterator();
    while (pkg_iter.next()) |entry| {
        const instances = entry.value_ptr.items;
        if (instances.len < 2) continue;

        // Count unique versions
        var unique_versions = std.StringHashMap(void).init(allocator);
        defer unique_versions.deinit();

        for (instances) |inst| {
            unique_versions.put(inst.version, {}) catch continue;
        }

        if (unique_versions.count() < 2) continue;

        // Build version and location arrays
        var versions = try allocator.alloc([]const u8, instances.len);
        var locations = try allocator.alloc([]const u8, instances.len);
        var total_size: usize = 0;

        for (instances, 0..) |inst, i| {
            versions[i] = try allocator.dupe(u8, inst.version);
            locations[i] = try allocator.dupe(u8, inst.location);
            total_size += inst.size;
        }

        try duplicates.append(allocator, .{
            .name = try allocator.dupe(u8, entry.key_ptr.*),
            .versions = versions,
            .locations = locations,
            .total_size = total_size,
        });
    }

    if (duplicates.items.len == 0) {
        style.print("No duplicate packages found!\n", .{});
        return CommandResult.success(allocator, "Dependency tree is already optimized");
    }

    // Display duplicates
    style.print("Found {d} duplicate package{s}:\n\n", .{
        duplicates.items.len,
        if (duplicates.items.len == 1) "" else "s",
    });

    var total_size_saved: usize = 0;

    for (duplicates.items) |dup| {
        style.print("{s}{s}{s}\n", .{ style.bold, dup.name, style.reset });
        style.print("  Versions: ", .{});

        for (dup.versions, 0..) |version, i| {
            if (i > 0) style.print(", ", .{});
            style.print("{s}", .{version});
        }

        style.print("\n  Locations: {d}\n", .{dup.locations.len});

        const size_str = try formatSize(allocator, dup.total_size);
        defer allocator.free(size_str);

        style.print("  Size: {s}\n\n", .{size_str});

        // Calculate potential savings (keep newest version)
        if (dup.versions.len > 1) {
            total_size_saved += dup.total_size * (dup.versions.len - 1) / dup.versions.len;
        }
    }

    if (!dry_run) {
        style.print("Deduplicating...\n\n", .{});

        var deduped: usize = 0;
        for (duplicates.items) |dup| {
            if (try deduplicatePackage(allocator, cwd, &dup)) {
                deduped += 1;
                style.print("  {s}✓{s} Deduplicated {s}\n", .{ style.green, style.reset, dup.name });
            }
        }

        style.print("\n", .{});

        const size_str = try formatSize(allocator, total_size_saved);
        defer allocator.free(size_str);

        const message = try std.fmt.allocPrint(
            allocator,
            "Deduplicated {d} package{s}, saved ~{s}",
            .{ deduped, if (deduped == 1) "" else "s", size_str },
        );

        return CommandResult{
            .exit_code = 0,
            .message = message,
        };
    } else {
        const size_str = try formatSize(allocator, total_size_saved);
        defer allocator.free(size_str);

        const message = try std.fmt.allocPrint(
            allocator,
            "Would save ~{s} by deduplicating {d} package{s}",
            .{ size_str, duplicates.items.len, if (duplicates.items.len == 1) "" else "s" },
        );

        return CommandResult{
            .exit_code = 0,
            .message = message,
        };
    }
}

/// Recursively scan node_modules directory for all package instances.
/// Records each found package's name, version, path, and approximate size.
fn scanNodeModules(
    allocator: std.mem.Allocator,
    node_modules_path: []const u8,
    package_map: *std.StringHashMap(std.ArrayList(PackageInstance)),
) !void {
    var dir = io_helper.openDirAbsoluteForIteration(node_modules_path) catch return;
    defer dir.close();

    var iter = dir.iterate();
    while (iter.next() catch null) |entry| {
        if (entry.kind != .directory and entry.kind != .sym_link) continue;
        if (entry.name.len == 0) continue;

        // Skip hidden dirs and .bin
        if (entry.name[0] == '.') continue;

        // Handle scoped packages (@scope/name)
        if (entry.name[0] == '@') {
            const scope_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ node_modules_path, entry.name });
            defer allocator.free(scope_path);

            var scope_dir = io_helper.openDirAbsoluteForIteration(scope_path) catch continue;
            defer scope_dir.close();

            var scope_iter = scope_dir.iterate();
            while (scope_iter.next() catch null) |scoped_entry| {
                if (scoped_entry.kind != .directory and scoped_entry.kind != .sym_link) continue;

                const full_name = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ entry.name, scoped_entry.name });
                defer allocator.free(full_name);

                const pkg_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ scope_path, scoped_entry.name });
                defer allocator.free(pkg_path);

                try recordPackage(allocator, full_name, pkg_path, package_map);

                // Scan nested node_modules
                const nested_nm = try std.fmt.allocPrint(allocator, "{s}/node_modules", .{pkg_path});
                defer allocator.free(nested_nm);
                try scanNodeModules(allocator, nested_nm, package_map);
            }
            continue;
        }

        const pkg_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ node_modules_path, entry.name });
        defer allocator.free(pkg_path);

        try recordPackage(allocator, entry.name, pkg_path, package_map);

        // Scan nested node_modules
        const nested_nm = try std.fmt.allocPrint(allocator, "{s}/node_modules", .{pkg_path});
        defer allocator.free(nested_nm);
        try scanNodeModules(allocator, nested_nm, package_map);
    }
}

/// Read a package's package.json and record it in the map
fn recordPackage(
    allocator: std.mem.Allocator,
    name: []const u8,
    pkg_path: []const u8,
    package_map: *std.StringHashMap(std.ArrayList(PackageInstance)),
) !void {
    const pkg_json_path = try std.fmt.allocPrint(allocator, "{s}/package.json", .{pkg_path});
    defer allocator.free(pkg_json_path);

    const content = io_helper.readFileAlloc(allocator, pkg_json_path, 1024 * 1024) catch return;
    defer allocator.free(content);

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch return;
    defer parsed.deinit();

    if (parsed.value != .object) return;

    const version_val = parsed.value.object.get("version") orelse return;
    if (version_val != .string) return;

    const instance = PackageInstance{
        .version = try allocator.dupe(u8, version_val.string),
        .location = try allocator.dupe(u8, pkg_path),
        .size = @as(usize, @intCast(content.len)), // Rough size estimate from package.json size
    };

    const key = try allocator.dupe(u8, name);
    errdefer allocator.free(key);

    if (package_map.getPtr(name)) |list| {
        allocator.free(key);
        try list.append(allocator, instance);
    } else {
        var list = std.ArrayList(PackageInstance){};
        try list.append(allocator, instance);
        try package_map.put(key, list);
    }
}

/// Deduplicate a single package by removing nested copies when the top-level
/// version matches one of the nested versions.
fn deduplicatePackage(
    _: std.mem.Allocator,
    _: []const u8,
    package: *const DuplicatePackage,
) !bool {
    // Find the top-level location (shortest path = most hoisted)
    var top_level_idx: ?usize = null;
    var min_depth: usize = std.math.maxInt(usize);

    for (package.locations, 0..) |loc, i| {
        // Count path separators to determine nesting depth
        var depth: usize = 0;
        for (loc) |c| {
            if (c == '/') depth += 1;
        }
        if (depth < min_depth) {
            min_depth = depth;
            top_level_idx = i;
        }
    }

    const top_idx = top_level_idx orelse return false;
    const top_version = package.versions[top_idx];

    // Remove nested copies that have the same version as the top-level one
    var removed_any = false;
    for (package.locations, 0..) |loc, i| {
        if (i == top_idx) continue;

        // Only remove if version matches (safe dedup)
        if (std.mem.eql(u8, package.versions[i], top_version)) {
            io_helper.deleteTree(loc) catch continue;
            removed_any = true;
        }
    }

    return removed_any;
}

/// Format size in human-readable format
fn formatSize(allocator: std.mem.Allocator, bytes: usize) ![]const u8 {
    if (bytes >= 1024 * 1024 * 1024) {
        const gb = @as(f64, @floatFromInt(bytes)) / (1024.0 * 1024.0 * 1024.0);
        return try std.fmt.allocPrint(allocator, "{d:.2} GB", .{gb});
    } else if (bytes >= 1024 * 1024) {
        const mb = @as(f64, @floatFromInt(bytes)) / (1024.0 * 1024.0);
        return try std.fmt.allocPrint(allocator, "{d:.2} MB", .{mb});
    } else if (bytes >= 1024) {
        const kb = @as(f64, @floatFromInt(bytes)) / 1024.0;
        return try std.fmt.allocPrint(allocator, "{d:.2} KB", .{kb});
    } else {
        return try std.fmt.allocPrint(allocator, "{d} bytes", .{bytes});
    }
}
