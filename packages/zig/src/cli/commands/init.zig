//! Initialize a new pantry.json file
//!
//! Creates a new pantry.json with sensible defaults

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const style = @import("../style.zig");

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

    const cwd = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    // Check if pantry.json already exists
    const file_exists = blk: {
        io_helper.cwd().access(io_helper.io, "pantry.json", .{}) catch |err| {
            if (err == error.FileNotFound) break :blk false;
            return err;
        };
        break :blk true;
    };

    if (file_exists) {
        // File exists
        style.print("pantry.json already exists\n", .{});
        style.print("Do you want to overwrite it? (y/N): ", .{});

        var buf: [10]u8 = undefined;
        const bytes_read = try io_helper.readStdin(&buf);

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
    style.print("\n Initializing pantry.json\n\n", .{});

    style.print("Project name ({s}): ", .{dir_name});
    var name_buf: [256]u8 = undefined;
    const name_bytes = try io_helper.readStdin(&name_buf);
    const project_name = blk: {
        if (name_bytes == 0) break :blk dir_name;
        const trimmed = std.mem.trim(u8, name_buf[0..name_bytes], &std.ascii.whitespace);
        break :blk if (trimmed.len > 0) trimmed else dir_name;
    };

    style.print("Version (1.0.0): ", .{});
    var version_buf: [64]u8 = undefined;
    const version_bytes = try io_helper.readStdin(&version_buf);
    const version = blk: {
        if (version_bytes == 0) break :blk "1.0.0";
        const trimmed = std.mem.trim(u8, version_buf[0..version_bytes], &std.ascii.whitespace);
        break :blk if (trimmed.len > 0) trimmed else "1.0.0";
    };

    style.print("Description: ", .{});
    var desc_buf: [512]u8 = undefined;
    const desc_bytes = try io_helper.readStdin(&desc_buf);
    const description = blk: {
        if (desc_bytes == 0) break :blk "";
        const trimmed = std.mem.trim(u8, desc_buf[0..desc_bytes], &std.ascii.whitespace);
        break :blk if (trimmed.len > 0) trimmed else "";
    };

    // Detect if TypeScript project
    const has_tsconfig = blk: {
        io_helper.cwd().access(io_helper.io, "tsconfig.json", .{}) catch break :blk false;
        break :blk true;
    };

    const has_package_json = blk: {
        io_helper.cwd().access(io_helper.io, "package.json", .{}) catch break :blk false;
        break :blk true;
    };

    // Generate pantry.json
    const template = if (has_tsconfig or has_package_json)
        try generateNodeTemplate(allocator, project_name, version, description)
    else
        try generateBasicTemplate(allocator, project_name, version, description);
    defer allocator.free(template);

    // Write file
    const file = try io_helper.cwd().createFile(io_helper.io, "pantry.json", .{});
    defer file.close(io_helper.io);
    try io_helper.writeAllToFile(file, template);

    style.print("\n✅ Created pantry.json\n", .{});
    style.print("\n📝 Next steps:\n", .{});
    style.print("   1. Add dependencies: pantry add <package>@<version>\n", .{});
    style.print("   2. Install packages: pantry install\n", .{});
    style.print("   3. Add scripts to the 'scripts' section\n", .{});
    if (!has_package_json) {
        style.print("   4. Consider adding services in 'services' section\n", .{});
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
