const std = @import("std");
const scanner = @import("scanner.zig");
const io_helper = @import("../io_helper.zig");
const style = @import("../cli/style.zig");

/// Get current Unix timestamp (Zig 0.16 compatible)
fn getTimestamp() i64 {
    const ts = std.posix.clock_gettime(.REALTIME) catch return 0;
    return @intCast(ts.sec);
}

pub const EnvCommands = struct {
    allocator: std.mem.Allocator,
    scanner: scanner.EnvScanner,

    pub fn init(allocator: std.mem.Allocator) EnvCommands {
        return .{
            .allocator = allocator,
            .scanner = scanner.EnvScanner.init(allocator),
        };
    }

    pub fn deinit(self: *EnvCommands) void {
        self.scanner.deinit();
    }

    /// env:list - List all environments
    pub fn list(self: *EnvCommands, format: []const u8, verbose: bool) !void {
        const envs = try self.scanner.scanAll();
        defer {
            for (envs) |*env| {
                env.deinit(self.allocator);
            }
            self.allocator.free(envs);
        }

        if (envs.len == 0) {
            style.print("📭 No development environments found\n", .{});
            return;
        }

        // Sort by modification time (newest first)
        scanner.EnvScanner.sortByModified(envs);

        if (std.mem.eql(u8, format, "json")) {
            // JSON output
            try self.printJson(envs);
        } else if (std.mem.eql(u8, format, "simple")) {
            // Simple output
            for (envs) |env| {
                style.print("{s} ({s})\n", .{ env.project_name, env.hash });
            }
        } else {
            // Table output
            try self.printTable(envs, verbose);
        }
    }

    /// env:inspect - Inspect specific environment
    pub fn inspect(self: *EnvCommands, hash: []const u8, verbose: bool, show_stubs: bool) !void {
        const envs = try self.scanner.scanAll();
        defer {
            for (envs) |*env| {
                env.deinit(self.allocator);
            }
            self.allocator.free(envs);
        }

        // Find environment with matching hash
        var found: ?*scanner.EnvironmentInfo = null;
        for (envs) |*env| {
            if (std.mem.indexOf(u8, env.hash, hash) != null) {
                found = env;
                break;
            }
        }

        if (found == null) {
            style.print("✗ Environment not found: {s}\n", .{hash});
            return error.EnvironmentNotFound;
        }

        const env = found.?;

        style.print("\n📦 Environment Details: {s}\n\n", .{env.project_name});
        style.print("Hash:      {s}\n", .{env.hash});
        style.print("Path:      {s}\n", .{env.path});

        const size_str = try formatSize(env.size_bytes, self.allocator);
        defer self.allocator.free(size_str);
        style.print("Size:      {s}\n", .{size_str});

        style.print("Packages:  {d}\n", .{env.packages});
        style.print("Binaries:  {d}\n", .{env.binaries});

        const created_str = try formatTimestamp(env.created, self.allocator);
        defer self.allocator.free(created_str);
        style.print("Created:   {s}\n", .{created_str});

        const modified_str = try formatTimestamp(env.modified, self.allocator);
        defer self.allocator.free(modified_str);
        style.print("Modified:  {s}\n", .{modified_str});

        if (verbose) {
            style.print("\nBinaries:\n", .{});
            try self.listBinaries(env.path);
        }

        if (show_stubs) {
            style.print("\nStubs:\n", .{});
            try self.listStubs(env.path);
        }

        style.print("\n", .{});
    }

    /// env:clean - Clean old environments
    pub fn clean(
        self: *EnvCommands,
        older_than_days: u32,
        dry_run: bool,
        force: bool,
    ) !void {
        const envs = try self.scanner.scanAll();
        defer {
            for (envs) |*env| {
                env.deinit(self.allocator);
            }
            self.allocator.free(envs);
        }

        if (envs.len == 0) {
            style.print("📭 No environments to clean\n", .{});
            return;
        }

        const now = getTimestamp();
        const cutoff = now - (@as(i64, older_than_days) * 86400);

        var removed_count: usize = 0;
        var freed_bytes: u64 = 0;

        for (envs) |*env| {
            if (env.modified < cutoff) {
                if (dry_run) {
                    style.print("Would remove: {s} ({s})\n", .{ env.project_name, env.hash });
                } else {
                    if (!force) {
                        style.print("Remove {s}? (y/N): ", .{env.project_name});
                        // In production, would read user input
                        // For now, skip without force
                        continue;
                    }

                    style.print("Removing: {s}...", .{env.project_name});
                    io_helper.deleteTree(env.path) catch |err| {
                        style.print(" ✗ ({any})\n", .{err});
                        continue;
                    };
                    style.print(" ✓\n", .{});
                }

                removed_count += 1;
                freed_bytes += env.size_bytes;
            }
        }

        const freed_str = try formatSize(freed_bytes, self.allocator);
        defer self.allocator.free(freed_str);

        if (dry_run) {
            style.print("\nWould clean {d} environment(s), freeing {s}\n", .{ removed_count, freed_str });
        } else {
            style.print("\nCleaned {d} environment(s), freed {s}\n", .{ removed_count, freed_str });
        }
    }

    /// env:remove - Remove specific environment
    pub fn remove(self: *EnvCommands, hash: []const u8, force: bool) !void {
        const envs = try self.scanner.scanAll();
        defer {
            for (envs) |*env| {
                env.deinit(self.allocator);
            }
            self.allocator.free(envs);
        }

        // Find environment with matching hash
        var found: ?*scanner.EnvironmentInfo = null;
        for (envs) |*env| {
            if (std.mem.indexOf(u8, env.hash, hash) != null) {
                found = env;
                break;
            }
        }

        if (found == null) {
            style.print("✗ Environment not found: {s}\n", .{hash});
            return error.EnvironmentNotFound;
        }

        const env = found.?;

        if (!force) {
            const size_str = try formatSize(env.size_bytes, self.allocator);
            defer self.allocator.free(size_str);

            style.print("Remove environment: {s}\n", .{env.project_name});
            style.print("  Path: {s}\n", .{env.path});
            style.print("  Size: {s}\n", .{size_str});
            style.print("\nThis action cannot be undone. Continue? (y/N): ", .{});
            // In production, would read user input
            // For now, require force flag
            style.print("\nUse --force to confirm removal\n", .{});
            return;
        }

        style.print("Removing environment: {s}...", .{env.project_name});
        try io_helper.deleteTree(env.path);
        style.print(" ✓\n", .{});
    }

    fn printTable(self: *EnvCommands, envs: []scanner.EnvironmentInfo, verbose: bool) !void {
        style.print("📦 Development Environments:\n\n", .{});

        // Calculate total size
        var total_size: u64 = 0;
        for (envs) |env| {
            total_size += env.size_bytes;
        }

        // Print header
        if (verbose) {
            style.print("┌─────────────────────────┬──────────┬──────────┬────────────┬────────────────────┐\n", .{});
            style.print("│ {s:<23} │ {s:>8} │ {s:>8} │ {s:>10} │ {s:<18} │\n", .{
                "Project", "Packages", "Binaries", "Size", "Modified",
            });
            style.print("├─────────────────────────┼──────────┼──────────┼────────────┼────────────────────┤\n", .{});
        } else {
            style.print("┌─────────────────────────┬────────────┬────────────────────┐\n", .{});
            style.print("│ {s:<23} │ {s:>10} │ {s:<18} │\n", .{
                "Project", "Size", "Modified",
            });
            style.print("├─────────────────────────┼────────────┼────────────────────┤\n", .{});
        }

        // Print rows
        for (envs) |env| {
            const size_str = try formatSize(env.size_bytes, self.allocator);
            defer self.allocator.free(size_str);

            const modified_str = try formatTimestamp(env.modified, self.allocator);
            defer self.allocator.free(modified_str);

            // Truncate long project names
            var name_buf: [24]u8 = undefined;
            const display_name = if (env.project_name.len > 23) blk: {
                @memcpy(name_buf[0..20], env.project_name[0..20]);
                @memcpy(name_buf[20..23], "...");
                break :blk name_buf[0..23];
            } else env.project_name;

            if (verbose) {
                style.print("│ {s:<23} │ {d:>8} │ {d:>8} │ {s:>10} │ {s:<18} │\n", .{
                    display_name,
                    env.packages,
                    env.binaries,
                    size_str,
                    modified_str,
                });
            } else {
                style.print("│ {s:<23} │ {s:>10} │ {s:<18} │\n", .{
                    display_name,
                    size_str,
                    modified_str,
                });
            }
        }

        // Print footer
        if (verbose) {
            style.print("└─────────────────────────┴──────────┴──────────┴────────────┴────────────────────┘\n", .{});
        } else {
            style.print("└─────────────────────────┴────────────┴────────────────────┘\n", .{});
        }

        const total_str = try formatSize(total_size, self.allocator);
        defer self.allocator.free(total_str);

        style.print("\nTotal: {d} environment(s), {s}\n", .{ envs.len, total_str });
    }

    fn printJson(self: *EnvCommands, envs: []scanner.EnvironmentInfo) !void {
        style.print("[", .{});

        for (envs, 0..) |env, i| {
            style.print("\n  {{\n", .{});
            style.print("    \"hash\": \"{s}\",\n", .{env.hash});
            style.print("    \"project\": \"{s}\",\n", .{env.project_name});
            style.print("    \"path\": \"{s}\",\n", .{env.path});
            style.print("    \"size_bytes\": {d},\n", .{env.size_bytes});
            style.print("    \"packages\": {d},\n", .{env.packages});
            style.print("    \"binaries\": {d},\n", .{env.binaries});
            style.print("    \"created\": {d},\n", .{env.created});
            style.print("    \"modified\": {d}\n", .{env.modified});

            if (i < envs.len - 1) {
                style.print("  }},", .{});
            } else {
                style.print("  }}", .{});
            }
        }

        style.print("\n]\n", .{});
        _ = self;
    }

    fn listBinaries(self: *EnvCommands, env_path: []const u8) !void {
        const bin_dir = try std.fs.path.join(self.allocator, &[_][]const u8{ env_path, "bin" });
        defer self.allocator.free(bin_dir);

        var dir = io_helper.cwd().openDir(io_helper.io, bin_dir, .{ .iterate = true }) catch {
            style.print("  (none)\n", .{});
            return;
        };
        defer dir.close(io_helper.io);

        var iter = dir.iterate();
        while (try iter.next(io_helper.io)) |entry| {
            style.print("  • {s}\n", .{entry.name});
        }
    }

    fn listStubs(self: *EnvCommands, env_path: []const u8) !void {
        const stubs_dir = try std.fs.path.join(self.allocator, &[_][]const u8{ env_path, "stubs" });
        defer self.allocator.free(stubs_dir);

        var dir = io_helper.cwd().openDir(io_helper.io, stubs_dir, .{ .iterate = true }) catch {
            style.print("  (none)\n", .{});
            return;
        };
        defer dir.close(io_helper.io);

        var iter = dir.iterate();
        while (try iter.next(io_helper.io)) |entry| {
            style.print("  • {s}\n", .{entry.name});
        }
    }
};

fn formatSize(bytes: u64, allocator: std.mem.Allocator) ![]const u8 {
    const units = [_][]const u8{ "B", "KB", "MB", "GB", "TB" };
    var size: f64 = @floatFromInt(bytes);
    var unit_index: usize = 0;

    while (size >= 1024.0 and unit_index < units.len - 1) {
        size /= 1024.0;
        unit_index += 1;
    }

    return try std.fmt.allocPrint(allocator, "{d:.1}{s}", .{ size, units[unit_index] });
}

fn formatTimestamp(timestamp: i64, allocator: std.mem.Allocator) ![]const u8 {
    // Simple relative time formatting
    const now = getTimestamp();
    const diff = now - timestamp;

    if (diff < 60) {
        return try allocator.dupe(u8, "just now");
    } else if (diff < 3600) {
        const mins = @divFloor(diff, 60);
        return try std.fmt.allocPrint(allocator, "{d}m ago", .{mins});
    } else if (diff < 86400) {
        const hours = @divFloor(diff, 3600);
        return try std.fmt.allocPrint(allocator, "{d}h ago", .{hours});
    } else if (diff < 604800) {
        const days = @divFloor(diff, 86400);
        return try std.fmt.allocPrint(allocator, "{d}d ago", .{days});
    } else {
        const weeks = @divFloor(diff, 604800);
        return try std.fmt.allocPrint(allocator, "{d}w ago", .{weeks});
    }
}

test "EnvCommands init and deinit" {
    const allocator = std.testing.allocator;

    var commands = EnvCommands.init(allocator);
    defer commands.deinit();
}

test "formatSize" {
    const allocator = std.testing.allocator;

    const size1 = try formatSize(512, allocator);
    defer allocator.free(size1);
    try std.testing.expectEqualStrings("512.0B", size1);

    const size2 = try formatSize(1536, allocator);
    defer allocator.free(size2);
    try std.testing.expectEqualStrings("1.5KB", size2);

    const size3 = try formatSize(1048576, allocator);
    defer allocator.free(size3);
    try std.testing.expectEqualStrings("1.0MB", size3);
}

test "formatTimestamp" {
    const allocator = std.testing.allocator;

    const now = getTimestamp();

    const t1 = try formatTimestamp(now - 30, allocator);
    defer allocator.free(t1);
    try std.testing.expectEqualStrings("just now", t1);

    const t2 = try formatTimestamp(now - 300, allocator);
    defer allocator.free(t2);
    try std.testing.expectEqualStrings("5m ago", t2);

    const t3 = try formatTimestamp(now - 7200, allocator);
    defer allocator.free(t3);
    try std.testing.expectEqualStrings("2h ago", t3);
}
