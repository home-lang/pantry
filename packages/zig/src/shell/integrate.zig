const std = @import("std");
const lib = @import("../lib.zig");

pub const ShellIntegrator = struct {
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) ShellIntegrator {
        return .{ .allocator = allocator };
    }

    pub fn deinit(self: *ShellIntegrator) void {
        _ = self;
    }

    /// Install shell hooks
    pub fn install(self: *ShellIntegrator, dry_run: bool) !void {
        const shell_files = try self.getShellFiles();
        defer {
            for (shell_files.items) |file| {
                self.allocator.free(file);
            }
            shell_files.deinit();
        }

        const hook_line = "command -v pantry >/dev/null 2>&1 && eval \"$(pantry dev:shellcode)\"";

        for (shell_files.items) |file| {
            // Check if hook already exists
            if (try self.hasHook(file)) {
                std.debug.print("✓ Hook already integrated: {s}\n", .{file});
                continue;
            }

            if (!dry_run) {
                try self.appendHook(file, hook_line);
            }

            std.debug.print("✓ {s} {s} << `{s}`\n", .{
                if (dry_run) "Would add" else "Added",
                file,
                hook_line,
            });
        }
    }

    /// Uninstall shell hooks
    pub fn uninstall(self: *ShellIntegrator, dry_run: bool) !void {
        const shell_files = try self.getShellFiles();
        defer {
            for (shell_files.items) |file| {
                self.allocator.free(file);
            }
            shell_files.deinit();
        }

        for (shell_files.items) |file| {
            if (!try self.hasHook(file)) {
                continue;
            }

            if (!dry_run) {
                try self.removeHook(file);
            }

            std.debug.print("✓ {s} hook: {s}\n", .{
                if (dry_run) "Would remove" else "Removed",
                file,
            });
        }
    }

    fn getShellFiles(self: *ShellIntegrator) !std.ArrayList([]const u8) {
        var files = std.ArrayList([]const u8).init(self.allocator);
        errdefer {
            for (files.items) |file| {
                self.allocator.free(file);
            }
            files.deinit();
        }

        const home_dir = try lib.Paths.home(self.allocator);
        defer self.allocator.free(home_dir);

        const zdotdir = std.process.getEnvVarOwned(self.allocator, "ZDOTDIR") catch
            try self.allocator.dupe(u8, home_dir);
        defer self.allocator.free(zdotdir);

        // Check for existing shell config files
        const candidates = [_]struct { dir: []const u8, file: []const u8 }{
            .{ .dir = zdotdir, .file = ".zshrc" },
            .{ .dir = home_dir, .file = ".bashrc" },
            .{ .dir = home_dir, .file = ".bash_profile" },
        };

        for (candidates) |candidate| {
            const file = try std.fs.path.join(self.allocator, &[_][]const u8{
                candidate.dir,
                candidate.file,
            });
            errdefer self.allocator.free(file);

            std.Io.Dir.cwd().access(file, .{}) catch {
                self.allocator.free(file);
                continue;
            };

            try files.append(file);
        }

        // If no files exist and we're on macOS, create .zshrc
        if (files.items.len == 0 and lib.Platform.current() == .darwin) {
            const zshrc = try std.fs.path.join(self.allocator, &[_][]const u8{
                zdotdir,
                ".zshrc",
            });
            try files.append(zshrc);
        }

        return files;
    }

    fn hasHook(self: *ShellIntegrator, file: []const u8) !bool {
        const content = std.Io.Dir.cwd().readFileAlloc(
            self.allocator,
            file,
            10 * 1024 * 1024,
        ) catch return false;
        defer self.allocator.free(content);

        return std.mem.indexOf(u8, content, "# Added by pantry") != null or
            std.mem.indexOf(u8, content, "pantry dev:shellcode") != null;
    }

    fn appendHook(_: *ShellIntegrator, file: []const u8, hook_line: []const u8) !void {
        const f = try std.Io.Dir.cwd().openFile(file, .{ .mode = .read_write });
        defer f.close();

        try f.seekFromEnd(0);

        const writer = f.writer();
        try writer.writeAll("\n# Added by pantry\n");
        try writer.writeAll(hook_line);
        try writer.writeAll("  # https://github.com/stacksjs/pantry\n");
    }

    fn removeHook(self: *ShellIntegrator, file: []const u8) !void {
        const content = try std.Io.Dir.cwd().readFileAlloc(
            self.allocator,
            file,
            10 * 1024 * 1024,
        );
        defer self.allocator.free(content);

        var lines = std.ArrayList([]const u8).init(self.allocator);
        defer lines.deinit();

        var iter = std.mem.split(u8, content, "\n");
        var skip_next = false;

        while (iter.next()) |line| {
            // Skip pantry-related lines
            if (std.mem.indexOf(u8, line, "# Added by pantry") != null) {
                skip_next = true;
                continue;
            }
            if (skip_next and (std.mem.indexOf(u8, line, "pantry dev:shellcode") != null or
                std.mem.indexOf(u8, line, "# https://github.com/stacksjs/pantry") != null))
            {
                skip_next = false;
                continue;
            }

            try lines.append(line);
        }

        // Rewrite file
        const f = try std.Io.Dir.cwd().createFile(file, .{ .truncate = true });
        defer f.close();

        const writer = f.writer();
        for (lines.items, 0..) |line, i| {
            try writer.writeAll(line);
            if (i < lines.items.len - 1) {
                try writer.writeAll("\n");
            }
        }
    }
};

test "ShellIntegrator init" {
    const allocator = std.testing.allocator;

    var integrator = ShellIntegrator.init(allocator);
    defer integrator.deinit();
}

test "ShellIntegrator getShellFiles" {
    const allocator = std.testing.allocator;

    var integrator = ShellIntegrator.init(allocator);
    defer integrator.deinit();

    const files = try integrator.getShellFiles();
    defer {
        for (files.items) |file| {
            allocator.free(file);
        }
        files.deinit();
    }

    // Should find at least one shell file or create one
    try std.testing.expect(files.items.len > 0);
}

test "ShellIntegrator hasHook" {
    const allocator = std.testing.allocator;

    var integrator = ShellIntegrator.init(allocator);
    defer integrator.deinit();

    // Create test file
    const test_file = "test_shell_hook.sh";
    {
        const file = try std.Io.Dir.cwd().createFile(test_file, .{});
        defer file.close();
        try file.writeAll("#!/bin/bash\n# Added by pantry\neval \"$(pantry dev:shellcode)\"\n");
    }
    defer std.Io.Dir.cwd().deleteFile(test_file) catch {};

    const has_hook = try integrator.hasHook(test_file);
    try std.testing.expect(has_hook);
}

test "ShellIntegrator appendHook and removeHook" {
    const allocator = std.testing.allocator;

    var integrator = ShellIntegrator.init(allocator);
    defer integrator.deinit();

    // Create test file
    const test_file = "test_shell_append.sh";
    {
        const file = try std.Io.Dir.cwd().createFile(test_file, .{});
        defer file.close();
        try file.writeAll("#!/bin/bash\n");
    }
    defer std.Io.Dir.cwd().deleteFile(test_file) catch {};

    // Add hook
    try integrator.appendHook(test_file, "eval \"$(pantry dev:shellcode)\"");

    // Verify hook was added
    const has_hook = try integrator.hasHook(test_file);
    try std.testing.expect(has_hook);

    // Remove hook
    try integrator.removeHook(test_file);

    // Verify hook was removed
    const still_has_hook = try integrator.hasHook(test_file);
    try std.testing.expect(!still_has_hook);
}
