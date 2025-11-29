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

        // Header
        try result.appendSlice(self.allocator, "# Pantry Shell Integration (Zig)\n");
        try result.appendSlice(self.allocator, "# Generated: ");
        try result.appendSlice(self.allocator, @tagName(builtin.os.tag));
        try result.appendSlice(self.allocator, "-");
        try result.appendSlice(self.allocator, @tagName(builtin.cpu.arch));
        try result.appendSlice(self.allocator, "\n\n");

        // Configuration
        const show_msg = if (self.config.show_messages) "true" else "false";
        try result.appendSlice(self.allocator, "__PANTRY_SHOW_MESSAGES=\"");
        try result.appendSlice(self.allocator, show_msg);
        try result.appendSlice(self.allocator, "\"\n");

        try result.appendSlice(self.allocator, "__PANTRY_ACTIVATION_MSG=\"");
        try result.appendSlice(self.allocator, self.config.activation_message);
        try result.appendSlice(self.allocator, "\"\n");

        try result.appendSlice(self.allocator, "__PANTRY_DEACTIVATION_MSG=\"");
        try result.appendSlice(self.allocator, self.config.deactivation_message);
        try result.appendSlice(self.allocator, "\"\n");

        const verbose = if (self.config.verbose) "true" else "false";
        try result.appendSlice(self.allocator, "__PANTRY_VERBOSE=\"");
        try result.appendSlice(self.allocator, verbose);
        try result.appendSlice(self.allocator, "\"\n\n");

        // Embed optimized shell functions (compile-time)
        try result.appendSlice(self.allocator, shell_template);

        return try result.toOwnedSlice(self.allocator);
    }

    /// Generate minimal shell code (no hooks, just functions)
    pub fn generateMinimal(self: *ShellCodeGenerator) ![]const u8 {
        var result = try std.ArrayList(u8).initCapacity(self.allocator, 2048);
        errdefer result.deinit(self.allocator);

        // Just the switch function, no hooks
        try result.appendSlice(self.allocator, "# Pantry Shell Functions\n\n");

        // Configuration
        const show_msg = if (self.config.show_messages) "true" else "false";
        try result.appendSlice(self.allocator, "__PANTRY_SHOW_MESSAGES=\"");
        try result.appendSlice(self.allocator, show_msg);
        try result.appendSlice(self.allocator, "\"\n");

        try result.appendSlice(self.allocator, "__PANTRY_ACTIVATION_MSG=\"");
        try result.appendSlice(self.allocator, self.config.activation_message);
        try result.appendSlice(self.allocator, "\"\n");

        try result.appendSlice(self.allocator, "__PANTRY_DEACTIVATION_MSG=\"");
        try result.appendSlice(self.allocator, self.config.deactivation_message);
        try result.appendSlice(self.allocator, "\"\n\n");

        // Only the core function
        var lines = std.mem.split(u8, shell_template, "\n");
        var in_function = false;
        while (lines.next()) |line| {
            if (std.mem.indexOf(u8, line, "__pantry_switch_environment()") != null) {
                in_function = true;
            }
            if (in_function) {
                try result.appendSlice(self.allocator, line);
                try result.appendSlice(self.allocator, "\n");
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
