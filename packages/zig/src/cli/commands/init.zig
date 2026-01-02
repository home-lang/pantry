//! Initialize a new pantry.json file
//!
//! Creates a new pantry.json with sensible defaults

const std = @import("std");

const CommandResult = struct {
    exit_code: u8,
    message: ?[]const u8 = null,

    pub fn deinit(self: *CommandResult, allocator: std.mem.Allocator) void {
        if (self.message) |msg| {
            allocator.free(msg);
        }
    }
};

pub fn initCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    _ = args;

    const cwd = try std.process.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    // Check if pantry.json already exists
    const file_exists = blk: {
        std.fs.cwd().access("pantry.json", .{}) catch |err| {
            if (err == error.FileNotFound) break :blk false;
            return err;
        };
        break :blk true;
    };

    if (file_exists) {
        // File exists
        std.debug.print("pantry.json already exists\n", .{});
        std.debug.print("Do you want to overwrite it? (y/N): ", .{});

        var buf: [10]u8 = undefined;
        const stdin_file = std.fs.File{ .handle = std.posix.STDIN_FILENO };
        const bytes_read = try stdin_file.read(&buf);

        if (bytes_read == 0 or buf[0] != 'y') {
            return .{
                .exit_code = 0,
                .message = try allocator.dupe(u8, "Cancelled"),
            };
        }
    }

    // Get project name from directory
    const dir_name = std.fs.path.basename(cwd);

    // Interactive prompts
    std.debug.print("\n Initializing pantry.json\n\n", .{});

    std.debug.print("Project name ({s}): ", .{dir_name});
    var name_buf: [256]u8 = undefined;
    const stdin = std.fs.File{ .handle = std.posix.STDIN_FILENO };
    const name_bytes = try stdin.read(&name_buf);
    const project_name = blk: {
        if (name_bytes == 0) break :blk dir_name;
        const trimmed = std.mem.trim(u8, name_buf[0..name_bytes], &std.ascii.whitespace);
        break :blk if (trimmed.len > 0) trimmed else dir_name;
    };

    std.debug.print("Version (1.0.0): ", .{});
    var version_buf: [64]u8 = undefined;
    const version_bytes = try stdin.read(&version_buf);
    const version = blk: {
        if (version_bytes == 0) break :blk "1.0.0";
        const trimmed = std.mem.trim(u8, version_buf[0..version_bytes], &std.ascii.whitespace);
        break :blk if (trimmed.len > 0) trimmed else "1.0.0";
    };

    std.debug.print("Description: ", .{});
    var desc_buf: [512]u8 = undefined;
    const desc_bytes = try stdin.read(&desc_buf);
    const description = blk: {
        if (desc_bytes == 0) break :blk "";
        const trimmed = std.mem.trim(u8, desc_buf[0..desc_bytes], &std.ascii.whitespace);
        break :blk if (trimmed.len > 0) trimmed else "";
    };

    // Detect if TypeScript project
    const has_tsconfig = blk: {
        std.fs.cwd().access("tsconfig.json", .{}) catch break :blk false;
        break :blk true;
    };

    const has_package_json = blk: {
        std.fs.cwd().access("package.json", .{}) catch break :blk false;
        break :blk true;
    };

    // Generate pantry.json
    const template = if (has_tsconfig or has_package_json)
        try generateNodeTemplate(allocator, project_name, version, description)
    else
        try generateBasicTemplate(allocator, project_name, version, description);
    defer allocator.free(template);

    // Write file
    const file = try std.fs.cwd().createFile("pantry.json", .{});
    defer file.close();
    try file.writeAll(template);

    std.debug.print("\n✅ Created pantry.json\n", .{});
    std.debug.print("\n📝 Next steps:\n", .{});
    std.debug.print("   1. Add dependencies: pantry add <package>@<version>\n", .{});
    std.debug.print("   2. Install packages: pantry install\n", .{});
    std.debug.print("   3. Add scripts to the 'scripts' section\n", .{});
    if (!has_package_json) {
        std.debug.print("   4. Consider adding services in 'services' section\n", .{});
    }

    return .{ .exit_code = 0 };
}

fn generateBasicTemplate(allocator: std.mem.Allocator, name: []const u8, version: []const u8, description: []const u8) ![]const u8 {
    return std.fmt.allocPrint(
        allocator,
        \\{{
        \\  "name": "{s}",
        \\  "version": "{s}",
        \\  "description": "{s}",
        \\  "dependencies": {{}},
        \\  "devDependencies": {{}},
        \\  "scripts": {{
        \\    "dev": "echo 'Add your dev command here'",
        \\    "build": "echo 'Add your build command here'",
        \\    "test": "echo 'Add your test command here'"
        \\  }},
        \\  "services": {{}},
        \\  "workspaces": []
        \\}}
        \\
    ,
        .{ name, version, description },
    );
}

fn generateNodeTemplate(allocator: std.mem.Allocator, name: []const u8, version: []const u8, description: []const u8) ![]const u8 {
    return std.fmt.allocPrint(
        allocator,
        \\{{
        \\  "name": "{s}",
        \\  "version": "{s}",
        \\  "description": "{s}",
        \\  "dependencies": {{
        \\    "bun": "latest"
        \\  }},
        \\  "devDependencies": {{}},
        \\  "scripts": {{
        \\    "dev": "bun run --watch src/index.ts",
        \\    "build": "bun build src/index.ts --outdir dist",
        \\    "test": "bun test",
        \\    "start": "bun run src/index.ts"
        \\  }},
        \\  "services": {{
        \\    "redis": {{
        \\      "autoStart": false,
        \\      "port": 6379
        \\    }}
        \\  }},
        \\  "workspaces": []
        \\}}
        \\
    ,
        .{ name, version, description },
    );
}
