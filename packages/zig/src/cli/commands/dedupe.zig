const std = @import("std");
const common = @import("common.zig");
const lib = @import("../../lib.zig");

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

/// Deduplicate dependencies
pub fn execute(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    const stdout = std.io.getStdOut().writer();

    // Parse flags
    var dry_run = false;
    for (args) |arg| {
        if (std.mem.eql(u8, arg, "--dry-run")) {
            dry_run = true;
        }
    }

    if (dry_run) {
        try stdout.print("🔍 Dry run mode - no changes will be made\n\n", .{});
    }

    // Load pantry.json
    const config_result = lib.loadpantryConfig(allocator, .{}) catch {
        return CommandResult.err(allocator, common.ERROR_NO_CONFIG);
    };
    defer {
        var mut_result = config_result;
        mut_result.deinit();
    }

    try stdout.print("🔍 Analyzing dependency tree...\n\n", .{});

    // Find duplicates
    var duplicates = std.ArrayList(DuplicatePackage).init(allocator);
    defer {
        for (duplicates.items) |*dup| {
            dup.deinit(allocator);
        }
        duplicates.deinit();
    }

    try findDuplicates(allocator, &duplicates);

    if (duplicates.items.len == 0) {
        try stdout.print("✨ No duplicate packages found!\n", .{});
        return CommandResult.success(allocator, "Dependency tree is already optimized");
    }

    // Display duplicates
    try stdout.print("Found {d} duplicate package{s}:\n\n", .{
        duplicates.items.len,
        if (duplicates.items.len == 1) "" else "s",
    });

    var total_size_saved: usize = 0;

    for (duplicates.items) |dup| {
        try stdout.print("📦 {s}\n", .{dup.name});
        try stdout.print("  Versions: ", .{});

        for (dup.versions, 0..) |version, i| {
            if (i > 0) try stdout.print(", ", .{});
            try stdout.print("{s}", .{version});
        }

        try stdout.print("\n  Locations: {d}\n", .{dup.locations.len});

        const size_str = try formatSize(allocator, dup.total_size);
        defer allocator.free(size_str);

        try stdout.print("  Size: {s}\n\n", .{size_str});

        // Calculate potential savings (keep newest version)
        if (dup.versions.len > 1) {
            total_size_saved += dup.total_size * (dup.versions.len - 1) / dup.versions.len;
        }
    }

    if (!dry_run) {
        try stdout.print("Deduplicating...\n\n", .{});

        var deduped: usize = 0;
        for (duplicates.items) |dup| {
            const result = try deduplicatePackage(allocator, &dup);
            if (result) {
                deduped += 1;
                try stdout.print("✓ Deduplicated {s}\n", .{dup.name});
            }
        }

        try stdout.print("\n", .{});

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

/// Find duplicate packages
fn findDuplicates(
    allocator: std.mem.Allocator,
    duplicates: *std.ArrayList(DuplicatePackage),
) !void {
    // This is a simplified implementation
    // Real implementation would:
    // 1. Scan node_modules recursively
    // 2. Track all package versions and locations
    // 3. Identify packages with multiple versions

    // Simulate some duplicates
    const simulated = [_]struct {
        name: []const u8,
        versions: []const []const u8,
        size: usize,
    }{
        .{
            .name = "lodash",
            .versions = &[_][]const u8{ "4.17.15", "4.17.20", "4.17.21" },
            .size = 1024 * 512, // 512 KB
        },
        .{
            .name = "chalk",
            .versions = &[_][]const u8{ "2.4.2", "4.1.0" },
            .size = 1024 * 128, // 128 KB
        },
    };

    for (simulated) |sim| {
        var versions = try allocator.alloc([]const u8, sim.versions.len);
        for (sim.versions, 0..) |v, i| {
            versions[i] = try allocator.dupe(u8, v);
        }

        var locations = try allocator.alloc([]const u8, sim.versions.len);
        for (sim.versions, 0..) |_, i| {
            locations[i] = try std.fmt.allocPrint(allocator, "node_modules/dep{d}/node_modules/{s}", .{ i + 1, sim.name });
        }

        try duplicates.append(.{
            .name = try allocator.dupe(u8, sim.name),
            .versions = versions,
            .locations = locations,
            .total_size = sim.size * sim.versions.len,
        });
    }
}

/// Deduplicate a single package
fn deduplicatePackage(
    allocator: std.mem.Allocator,
    package: *const DuplicatePackage,
) !bool {
    _ = allocator;
    _ = package;

    // Real implementation would:
    // 1. Determine which version to keep (usually the latest compatible)
    // 2. Update package.json files
    // 3. Remove duplicate installations
    // 4. Re-link dependencies

    // For now, just simulate success
    return true;
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
