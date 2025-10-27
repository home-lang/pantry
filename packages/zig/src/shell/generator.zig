const std = @import("std");
const builtin = @import("builtin");

// Embed shell code template at compile time
const shell_template = @embedFile("templates/shell_integration.sh");

pub const ShellConfig = struct {
    show_messages: bool = true,
    activation_message: []const u8 = "✅ Environment activated",
    deactivation_message: []const u8 = "Environment deactivated",
    verbose: bool = false,
};

pub const ShellCodeGenerator = struct {
    allocator: std.mem.Allocator,
    config: ShellConfig,

    pub fn init(allocator: std.mem.Allocator, config: ShellConfig) ShellCodeGenerator {
        return .{
            .allocator = allocator,
            .config = config,
        };
    }

    pub fn deinit(self: *ShellCodeGenerator) void {
        _ = self;
    }

    /// Generate shell integration code
    pub fn generate(self: *ShellCodeGenerator) ![]const u8 {
        var result = try std.ArrayList(u8).initCapacity(self.allocator, 4096);
        errdefer result.deinit(self.allocator);

        const writer = result.writer(self.allocator);

        // Header
        try writer.writeAll("# Pantry Shell Integration (Zig)\n");
        try writer.writeAll("# Generated: ");
        try writer.writeAll(@tagName(builtin.os.tag));
        try writer.writeAll("-");
        try writer.writeAll(@tagName(builtin.cpu.arch));
        try writer.writeAll("\n\n");

        // Configuration
        try writer.print("__PANTRY_SHOW_MESSAGES=\"{s}\"\n", .{
            if (self.config.show_messages) "true" else "false",
        });
        try writer.print("__PANTRY_ACTIVATION_MSG=\"{s}\"\n", .{
            self.config.activation_message,
        });
        try writer.print("__PANTRY_DEACTIVATION_MSG=\"{s}\"\n", .{
            self.config.deactivation_message,
        });
        try writer.print("__PANTRY_VERBOSE=\"{s}\"\n\n", .{
            if (self.config.verbose) "true" else "false",
        });

        // Embed optimized shell functions (compile-time)
        try writer.writeAll(shell_template);

        return try result.toOwnedSlice(self.allocator);
    }

    /// Generate minimal shell code (no hooks, just functions)
    pub fn generateMinimal(self: *ShellCodeGenerator) ![]const u8 {
        var result = try std.ArrayList(u8).initCapacity(self.allocator, 2048);
        errdefer result.deinit(self.allocator);

        const writer = result.writer(self.allocator);

        // Just the switch function, no hooks
        try writer.writeAll("# Pantry Shell Functions\n\n");

        // Configuration
        try writer.print("__PANTRY_SHOW_MESSAGES=\"{s}\"\n", .{
            if (self.config.show_messages) "true" else "false",
        });
        try writer.print("__PANTRY_ACTIVATION_MSG=\"{s}\"\n", .{
            self.config.activation_message,
        });
        try writer.print("__PANTRY_DEACTIVATION_MSG=\"{s}\"\n\n", .{
            self.config.deactivation_message,
        });

        // Only the core function
        var lines = std.mem.split(u8, shell_template, "\n");
        var in_function = false;
        while (lines.next()) |line| {
            if (std.mem.indexOf(u8, line, "__pantry_switch_environment()") != null) {
                in_function = true;
            }
            if (in_function) {
                try writer.writeAll(line);
                try writer.writeAll("\n");
            }
            if (in_function and std.mem.indexOf(u8, line, "# Hook registration") != null) {
                break;
            }
        }

        return try result.toOwnedSlice(self.allocator);
    }
};

test "ShellCodeGenerator basic" {
    const allocator = std.testing.allocator;

    var generator = ShellCodeGenerator.init(allocator, .{});
    defer generator.deinit();

    const code = try generator.generate();
    defer allocator.free(code);

    try std.testing.expect(code.len > 0);
    try std.testing.expect(std.mem.indexOf(u8, code, "# Pantry Shell Integration") != null);
    try std.testing.expect(std.mem.indexOf(u8, code, "__pantry_switch_environment") != null);
}

test "ShellCodeGenerator with custom config" {
    const allocator = std.testing.allocator;

    var generator = ShellCodeGenerator.init(allocator, .{
        .show_messages = false,
        .activation_message = "Custom activation",
        .verbose = true,
    });
    defer generator.deinit();

    const code = try generator.generate();
    defer allocator.free(code);

    try std.testing.expect(std.mem.indexOf(u8, code, "__PANTRY_SHOW_MESSAGES=\"false\"") != null);
    try std.testing.expect(std.mem.indexOf(u8, code, "Custom activation") != null);
    try std.testing.expect(std.mem.indexOf(u8, code, "__PANTRY_VERBOSE=\"true\"") != null);
}

test "ShellCodeGenerator minimal" {
    const allocator = std.testing.allocator;

    var generator = ShellCodeGenerator.init(allocator, .{});
    defer generator.deinit();

    const code = try generator.generateMinimal();
    defer allocator.free(code);

    try std.testing.expect(code.len > 0);
    try std.testing.expect(std.mem.indexOf(u8, code, "__pantry_switch_environment") != null);
    // Should not have hook registration
    try std.testing.expect(std.mem.indexOf(u8, code, "chpwd_functions") == null);
}
