const std = @import("std");
const lib = @import("../lib.zig");

pub const ShellCommands = struct {
    allocator: std.mem.Allocator,
    env_cache: *lib.cache.EnvCache,

    pub fn init(allocator: std.mem.Allocator) !ShellCommands {
        const cache_dir = try lib.Paths.cache(allocator);
        defer allocator.free(cache_dir);

        const cache_file = try std.fs.path.join(allocator, &[_][]const u8{
            cache_dir,
            "env_cache.json",
        });
        defer allocator.free(cache_file);

        // Ensure cache directory exists
        const cache_parent = std.fs.path.dirname(cache_file) orelse cache_dir;
        std.fs.cwd().makePath(cache_parent) catch {};

        const env_cache = try allocator.create(lib.cache.EnvCache);
        env_cache.* = lib.cache.EnvCache.init(allocator);

        return .{
            .allocator = allocator,
            .env_cache = env_cache,
        };
    }

    pub fn deinit(self: *ShellCommands) void {
        self.env_cache.deinit();
        self.allocator.destroy(self.env_cache);
    }

    /// shell:lookup - Fast cache lookup (called by shell on every cd)
    /// Returns: env_dir|project_dir or empty on cache miss
    /// Performance target: < 1ms
    pub fn lookup(self: *ShellCommands, pwd: []const u8) !?[]const u8 {
        const start = std.time.nanoTimestamp();
        defer {
            const elapsed = std.time.nanoTimestamp() - start;
            const elapsed_us = @divFloor(elapsed, std.time.ns_per_us);
            if (elapsed_us > 1000) {
                std.debug.print("! shell:lookup took {d}μs (> 1ms target)\n", .{elapsed_us});
            }
        }

        // Walk up directory tree checking cache
        var current_dir = try self.allocator.dupe(u8, pwd);
        defer self.allocator.free(current_dir);

        while (true) {
            // Compute hash for this directory
            const hash = lib.string.md5Hash(current_dir);
            const hash_hex = try lib.string.hashToHex(hash, self.allocator);
            defer self.allocator.free(hash_hex);

            // Check cache for this directory
            if (try self.env_cache.get(hash)) |entry| {
                // Validate entry is still valid
                // 1. Check env directory exists
                std.fs.cwd().access(entry.path, .{}) catch {
                    // Environment deleted, invalidate cache
                    continue;
                };

                // 2. Check dependency file mtime (if tracked)
                if (entry.dep_file.len > 0) {
                    const file = std.fs.cwd().openFile(entry.dep_file, .{}) catch {
                        // Dependency file deleted
                        continue;
                    };
                    defer file.close();

                    const stat = try file.stat();
                    const mtime = @divFloor(stat.mtime, std.time.ns_per_s);

                    if (mtime != entry.dep_mtime) {
                        // Dependency file changed, invalidate cache
                        return null; // Force re-detection
                    }
                }

                // Cache valid! Return env_dir|project_dir
                return try std.fmt.allocPrint(
                    self.allocator,
                    "{s}|{s}",
                    .{ entry.path, current_dir },
                );
            }

            // Move up directory tree
            const parent = std.fs.path.dirname(current_dir) orelse break;
            if (std.mem.eql(u8, parent, current_dir)) break; // Reached root

            self.allocator.free(current_dir);
            current_dir = try self.allocator.dupe(u8, parent);
        }

        return null; // Cache miss
    }

    /// shell:activate - Detect project, install dependencies, output shell code
    /// Returns: Shell code to eval (exports, PATH modifications)
    /// Performance target: < 50ms (cache miss)
    pub fn activate(self: *ShellCommands, pwd: []const u8) ![]const u8 {
        const start = std.time.nanoTimestamp();
        defer {
            const elapsed = std.time.nanoTimestamp() - start;
            const elapsed_ms = @divFloor(elapsed, std.time.ns_per_ms);
            if (elapsed_ms > 50) {
                std.debug.print("! shell:activate took {d}ms (> 50ms target)\n", .{elapsed_ms});
            }
        }

        // 1. Detect project root
        const project_root = try self.detectProjectRoot(pwd) orelse {
            return try self.allocator.dupe(u8, ""); // No project found
        };
        defer self.allocator.free(project_root);

        // 2. Find dependency file
        const dep_file = try self.findDependencyFile(project_root);
        defer if (dep_file) |file| self.allocator.free(file);

        // 3. Compute environment hash
        const project_hash = lib.string.md5Hash(project_root);
        const project_hash_hex = try lib.string.hashToHex(project_hash, self.allocator);
        defer self.allocator.free(project_hash_hex);

        const project_basename = std.fs.path.basename(project_root);

        var env_name = try std.fmt.allocPrint(
            self.allocator,
            "{s}_{s}",
            .{ project_basename, project_hash_hex[0..8] },
        );
        defer self.allocator.free(env_name);

        // Add dependency hash if we have a dependency file
        if (dep_file) |file| {
            const dep_hash = lib.string.hashDependencyFile(file);
            const dep_hash_hex = try lib.string.hashToHex(dep_hash, self.allocator);
            defer self.allocator.free(dep_hash_hex);

            const old_env_name = env_name;
            env_name = try std.fmt.allocPrint(
                self.allocator,
                "{s}-d{s}",
                .{ old_env_name, dep_hash_hex[0..8] },
            );
            self.allocator.free(old_env_name);
        }

        // 4. Determine environment directory
        const data_dir = try lib.Paths.data(self.allocator);
        defer self.allocator.free(data_dir);

        const env_dir = try std.fs.path.join(self.allocator, &[_][]const u8{
            data_dir,
            "envs",
            env_name,
        });
        defer self.allocator.free(env_dir);

        // 5. Check if environment exists
        const env_bin = try std.fs.path.join(self.allocator, &[_][]const u8{
            env_dir,
            "bin",
        });
        defer self.allocator.free(env_bin);

        const env_exists = blk: {
            std.fs.cwd().access(env_bin, .{}) catch break :blk false;
            break :blk true;
        };

        if (!env_exists and dep_file != null) {
            // 6. Install dependencies (stub for now)
            // In production, this would call the installer
            std.debug.print("Would install dependencies from {s} to {s}\n", .{ dep_file.?, env_dir });
        }

        // 7. Update cache
        const project_hash_for_cache = lib.string.md5Hash(project_root);
        const dep_mtime = if (dep_file) |file| blk: {
            const f = std.fs.cwd().openFile(file, .{}) catch break :blk 0;
            defer f.close();
            const stat = f.stat() catch break :blk 0;
            break :blk @divFloor(stat.mtime, std.time.ns_per_s);
        } else 0;

        const entry = try self.allocator.create(lib.cache.env_cache.Entry);
        entry.* = .{
            .hash = project_hash_for_cache,
            .dep_file = try self.allocator.dupe(u8, dep_file orelse ""),
            .dep_mtime = dep_mtime,
            .path = try self.allocator.dupe(u8, env_dir),
            .env_vars = std.StringHashMap([]const u8).init(self.allocator),
            .created_at = std.time.timestamp(),
            .cached_at = std.time.timestamp(),
            .last_validated = std.time.timestamp(),
        };

        try self.env_cache.put(entry);

        // 8. Generate shell code for activation
        return try std.fmt.allocPrint(
            self.allocator,
            \\export PANTRY_CURRENT_PROJECT="{s}"
            \\export PANTRY_ENV_BIN_PATH="{s}"
            \\export PANTRY_ENV_DIR="{s}"
            \\PATH="{s}:$PATH"
            \\export PATH
            ,
            .{ project_root, env_bin, env_dir, env_bin },
        );
    }

    fn detectProjectRoot(self: *ShellCommands, pwd: []const u8) !?[]const u8 {
        // Known dependency files to look for
        const dep_files = [_][]const u8{
            "pantry.jsonc",
            "package.json",
            "Cargo.toml",
            "go.mod",
            "requirements.txt",
            "Gemfile",
        };

        var current_dir = try self.allocator.dupe(u8, pwd);
        defer self.allocator.free(current_dir);

        while (true) {
            // Check for any dependency file
            for (dep_files) |dep_file| {
                const file_path = try std.fs.path.join(self.allocator, &[_][]const u8{
                    current_dir,
                    dep_file,
                });
                defer self.allocator.free(file_path);

                std.fs.cwd().access(file_path, .{}) catch continue;

                // Found a dependency file!
                return try self.allocator.dupe(u8, current_dir);
            }

            // Move up directory tree
            const parent = std.fs.path.dirname(current_dir) orelse break;
            if (std.mem.eql(u8, parent, current_dir)) break; // Reached root

            self.allocator.free(current_dir);
            current_dir = try self.allocator.dupe(u8, parent);
        }

        return null;
    }

    fn findDependencyFile(self: *ShellCommands, project_root: []const u8) !?[]const u8 {
        const dep_files = [_][]const u8{
            "pantry.jsonc",
            "package.json",
            "Cargo.toml",
            "go.mod",
            "requirements.txt",
            "Gemfile",
        };

        for (dep_files) |dep_file| {
            const file_path = try std.fs.path.join(self.allocator, &[_][]const u8{
                project_root,
                dep_file,
            });
            errdefer self.allocator.free(file_path);

            std.fs.cwd().access(file_path, .{}) catch {
                self.allocator.free(file_path);
                continue;
            };

            return file_path;
        }

        return null;
    }
};

test "ShellCommands init and deinit" {
    const allocator = std.testing.allocator;

    var commands = try ShellCommands.init(allocator);
    defer commands.deinit();
}

test "ShellCommands lookup cache miss" {
    const allocator = std.testing.allocator;

    var commands = try ShellCommands.init(allocator);
    defer commands.deinit();

    const result = try commands.lookup("/nonexistent/path");
    try std.testing.expect(result == null);
}

test "ShellCommands detectProjectRoot" {
    const allocator = std.testing.allocator;

    var commands = try ShellCommands.init(allocator);
    defer commands.deinit();

    // Create test project structure
    const test_dir = "test_project_detect";
    std.fs.cwd().makeDir(test_dir) catch {};
    defer std.fs.cwd().deleteTree(test_dir) catch {};

    const pkg_json = try std.fs.path.join(allocator, &[_][]const u8{ test_dir, "package.json" });
    defer allocator.free(pkg_json);

    {
        const file = try std.fs.cwd().createFile(pkg_json, .{});
        defer file.close();
        try file.writeAll("{}");
    }

    const root = try commands.detectProjectRoot(test_dir);
    try std.testing.expect(root != null);
    if (root) |r| {
        defer allocator.free(r);
        try std.testing.expect(std.mem.indexOf(u8, r, test_dir) != null);
    }
}

test "ShellCommands activate generates shell code" {
    const allocator = std.testing.allocator;

    var commands = try ShellCommands.init(allocator);
    defer commands.deinit();

    // Create test project
    const test_dir = "test_project_activate";
    std.fs.cwd().makeDir(test_dir) catch {};
    defer std.fs.cwd().deleteTree(test_dir) catch {};

    const pkg_json = try std.fs.path.join(allocator, &[_][]const u8{ test_dir, "package.json" });
    defer allocator.free(pkg_json);

    {
        const file = try std.fs.cwd().createFile(pkg_json, .{});
        defer file.close();
        try file.writeAll("{}");
    }

    const shell_code = try commands.activate(test_dir);
    defer allocator.free(shell_code);

    try std.testing.expect(shell_code.len > 0);
    try std.testing.expect(std.mem.indexOf(u8, shell_code, "PANTRY_CURRENT_PROJECT") != null);
    try std.testing.expect(std.mem.indexOf(u8, shell_code, "PANTRY_ENV_BIN_PATH") != null);
    try std.testing.expect(std.mem.indexOf(u8, shell_code, "export PATH") != null);
}
