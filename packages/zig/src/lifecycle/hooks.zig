const std = @import("std");
const io_helper = @import("../io_helper.zig");
const lifecycle = @import("../lifecycle.zig");
const enhanced = @import("enhanced.zig");
const style = @import("../cli/style.zig");

/// Hook execution phase
pub const HookPhase = enum {
    pre,
    post,

    pub fn toString(self: HookPhase) []const u8 {
        return switch (self) {
            .pre => "pre",
            .post => "post",
        };
    }
};

/// Hook-enabled commands
pub const HookCommand = enum {
    install,
    uninstall,
    update,
    publish,
    run_test,
    build,
    clean,
    pack,

    pub fn toString(self: HookCommand) []const u8 {
        return switch (self) {
            .install => "install",
            .uninstall => "uninstall",
            .update => "update",
            .publish => "publish",
            .run_test => "test",
            .build => "build",
            .clean => "clean",
            .pack => "pack",
        };
    }

    /// Get the script name for this hook
    pub fn getScriptName(self: HookCommand, phase: HookPhase) []const u8 {
        return switch (self) {
            .install => if (phase == .pre) "preinstall" else "postinstall",
            .uninstall => if (phase == .pre) "preuninstall" else "postuninstall",
            .update => if (phase == .pre) "preupdate" else "postupdate",
            .publish => if (phase == .pre) "prepublish" else "postpublish",
            .run_test => if (phase == .pre) "pretest" else "posttest",
            .build => if (phase == .pre) "prebuild" else "postbuild",
            .clean => if (phase == .pre) "preclean" else "postclean",
            .pack => if (phase == .pre) "prepack" else "postpack",
        };
    }
};

/// Hook execution context
pub const HookContext = struct {
    command: HookCommand,
    phase: HookPhase,
    cwd: []const u8,
    package_name: ?[]const u8 = null,
    verbose: bool = false,
    ignore_errors: bool = false,
};

/// Hook result
pub const HookResult = struct {
    executed: bool,
    success: bool,
    script_result: ?lifecycle.ScriptResult,

    pub fn deinit(self: *HookResult, allocator: std.mem.Allocator) void {
        if (self.script_result) |*result| {
            result.deinit(allocator);
        }
    }
};

/// Execute hook for a command
pub fn executeHook(
    allocator: std.mem.Allocator,
    context: HookContext,
    options: enhanced.EnhancedScriptOptions,
) !HookResult {
    const script_name = context.command.getScriptName(context.phase);

    // Read package.json to check if hook exists
    const package_json_path = try std.fs.path.join(
        allocator,
        &[_][]const u8{ context.cwd, "package.json" },
    );
    defer allocator.free(package_json_path);

    const package_json_content = io_helper.readFileAlloc(allocator, package_json_path, 1024 * 1024) catch |err| {
        if (err == error.FileNotFound) {
            return HookResult{
                .executed = false,
                .success = true,
                .script_result = null,
            };
        }
        return err;
    };
    defer allocator.free(package_json_content);

    const parsed = try std.json.parseFromSlice(
        std.json.Value,
        allocator,
        package_json_content,
        .{},
    );
    defer parsed.deinit();

    // Extract scripts
    var scripts = try lifecycle.extractScripts(allocator, parsed);
    defer {
        var it = scripts.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        scripts.deinit();
    }

    // Check if hook script exists
    const script_cmd = scripts.get(script_name) orelse {
        return HookResult{
            .executed = false,
            .success = true,
            .script_result = null,
        };
    };

    if (context.verbose) {
        style.print("Executing {s} hook...\n", .{script_name});
    }

    // Execute the hook
    const result = enhanced.executeScriptWithRetry(
        allocator,
        script_name,
        script_cmd,
        options,
    ) catch |err| {
        if (context.ignore_errors) {
            const error_msg = try std.fmt.allocPrint(allocator, "Error: {}", .{err});
            return HookResult{
                .executed = true,
                .success = false,
                .script_result = lifecycle.ScriptResult{
                    .success = false,
                    .exit_code = 1,
                    .stdout = null,
                    .stderr = error_msg,
                },
            };
        }
        return err;
    };

    return HookResult{
        .executed = true,
        .success = result.success,
        .script_result = result,
    };
}

/// Execute pre and post hooks for a command
pub fn executeCommandHooks(
    allocator: std.mem.Allocator,
    command: HookCommand,
    cwd: []const u8,
    options: enhanced.EnhancedScriptOptions,
    comptime operation: fn () anyerror!void,
) !void {
    const pre_context = HookContext{
        .command = command,
        .phase = .pre,
        .cwd = cwd,
        .verbose = options.base.verbose,
        .ignore_errors = options.continue_on_error,
    };

    // Execute pre hook
    var pre_result = try executeHook(allocator, pre_context, options);
    defer pre_result.deinit(allocator);

    if (pre_result.executed and !pre_result.success) {
        if (!options.continue_on_error) {
            return error.PreHookFailed;
        }
    }

    // Execute the actual operation
    try operation();

    const post_context = HookContext{
        .command = command,
        .phase = .post,
        .cwd = cwd,
        .verbose = options.base.verbose,
        .ignore_errors = options.continue_on_error,
    };

    // Execute post hook
    var post_result = try executeHook(allocator, post_context, options);
    defer post_result.deinit(allocator);

    if (post_result.executed and !post_result.success) {
        if (!options.continue_on_error) {
            return error.PostHookFailed;
        }
    }
}

/// Hook registry for custom hooks
pub const HookRegistry = struct {
    hooks: std.StringHashMap(HookCallback),
    allocator: std.mem.Allocator,

    pub const HookCallback = *const fn (
        allocator: std.mem.Allocator,
        context: HookContext,
    ) anyerror!void;

    pub fn init(allocator: std.mem.Allocator) HookRegistry {
        return .{
            .hooks = std.StringHashMap(HookCallback).init(allocator),
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *HookRegistry) void {
        var it = self.hooks.keyIterator();
        while (it.next()) |key| {
            self.allocator.free(key.*);
        }
        self.hooks.deinit();
    }

    /// Register a custom hook
    pub fn register(
        self: *HookRegistry,
        name: []const u8,
        callback: HookCallback,
    ) !void {
        const key = try self.allocator.dupe(u8, name);
        try self.hooks.put(key, callback);
    }

    /// Execute a custom hook
    pub fn execute(
        self: *HookRegistry,
        name: []const u8,
        context: HookContext,
    ) !void {
        if (self.hooks.get(name)) |callback| {
            try callback(self.allocator, context);
        }
    }
};

/// Hook manager for centralized hook management
pub const HookManager = struct {
    registry: HookRegistry,
    default_options: enhanced.EnhancedScriptOptions,
    verbose: bool,

    pub fn init(
        allocator: std.mem.Allocator,
        verbose: bool,
    ) HookManager {
        return .{
            .registry = HookRegistry.init(allocator),
            .default_options = .{
                .base = .{
                    .cwd = ".",
                    .verbose = verbose,
                },
            },
            .verbose = verbose,
        };
    }

    pub fn deinit(self: *HookManager) void {
        self.registry.deinit();
    }

    /// Execute hook with default options
    pub fn runHook(
        self: *HookManager,
        allocator: std.mem.Allocator,
        context: HookContext,
    ) !HookResult {
        return try executeHook(allocator, context, self.default_options);
    }

    /// Register custom hook
    pub fn registerHook(
        self: *HookManager,
        name: []const u8,
        callback: HookRegistry.HookCallback,
    ) !void {
        try self.registry.register(name, callback);
    }

    /// Execute custom hook
    pub fn executeCustomHook(
        self: *HookManager,
        name: []const u8,
        context: HookContext,
    ) !void {
        try self.registry.execute(name, context);
    }
};
