const std = @import("std");
const builtin = @import("builtin");
const definitions = @import("definitions.zig");

/// Platform-specific service management
pub const Platform = enum {
    macos,
    linux,
    windows,
    unknown,

    pub fn detect() Platform {
        return switch (builtin.os.tag) {
            .macos => .macos,
            .linux => .linux,
            .windows => .windows,
            else => .unknown,
        };
    }

    pub fn serviceManager(self: Platform) []const u8 {
        return switch (self) {
            .macos => "launchd",
            .linux => "systemd",
            .windows => "sc",
            .unknown => "unsupported",
        };
    }

    pub fn serviceFileExtension(self: Platform) []const u8 {
        return switch (self) {
            .macos => ".plist",
            .linux => ".service",
            .windows => ".xml",
            .unknown => "",
        };
    }

    pub fn serviceDirectory(self: Platform, allocator: std.mem.Allocator) ![]const u8 {
        return switch (self) {
            .macos => try allocator.dupe(u8, "/Library/LaunchDaemons"),
            .linux => try allocator.dupe(u8, "/etc/systemd/system"),
            .windows => try allocator.dupe(u8, "C:\\Windows\\System32\\config\\systemprofile\\AppData\\Roaming"),
            .unknown => error.UnsupportedPlatform,
        };
    }

    pub fn userServiceDirectory(self: Platform, allocator: std.mem.Allocator) ![]const u8 {
        const home = std.posix.getenv("HOME") orelse return error.HomeNotFound;

        return switch (self) {
            .macos => try std.fmt.allocPrint(allocator, "{s}/Library/LaunchAgents", .{home}),
            .linux => try std.fmt.allocPrint(allocator, "{s}/.config/systemd/user", .{home}),
            .windows => error.UnsupportedPlatform,
            .unknown => error.UnsupportedPlatform,
        };
    }
};

/// Platform-specific service controller
pub const ServiceController = struct {
    platform: Platform,
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) ServiceController {
        return .{
            .platform = Platform.detect(),
            .allocator = allocator,
        };
    }

    /// Start a service
    pub fn start(self: *ServiceController, service_name: []const u8) !void {
        switch (self.platform) {
            .macos => try self.launchdStart(service_name),
            .linux => try self.systemdStart(service_name),
            .windows => return error.UnsupportedPlatform,
            .unknown => return error.UnsupportedPlatform,
        }
    }

    /// Stop a service
    pub fn stop(self: *ServiceController, service_name: []const u8) !void {
        switch (self.platform) {
            .macos => try self.launchdStop(service_name),
            .linux => try self.systemdStop(service_name),
            .windows => return error.UnsupportedPlatform,
            .unknown => return error.UnsupportedPlatform,
        }
    }

    /// Restart a service
    pub fn restart(self: *ServiceController, service_name: []const u8) !void {
        try self.stop(service_name);
        // Small delay to ensure service fully stops
        std.Thread.sleep(std.time.ns_per_s / 2);
        try self.start(service_name);
    }

    /// Get service status
    pub fn status(self: *ServiceController, service_name: []const u8) !definitions.ServiceStatus {
        return switch (self.platform) {
            .macos => try self.launchdStatus(service_name),
            .linux => try self.systemdStatus(service_name),
            .windows => error.UnsupportedPlatform,
            .unknown => error.UnsupportedPlatform,
        };
    }

    /// Check if service is running
    pub fn isRunning(self: *ServiceController, service_name: []const u8) !bool {
        const st = try self.status(service_name);
        return st == .running;
    }

    // ========================================================================
    // macOS launchd implementation
    // ========================================================================

    fn launchdStart(self: *ServiceController, service_name: []const u8) !void {
        const service_file = try self.getLaunchdServiceFile(service_name);
        defer self.allocator.free(service_file);

        const argv = [_][]const u8{ "launchctl", "load", service_file };
        var child = std.process.Child.init(&argv, self.allocator);
        const result = try child.spawnAndWait();

        if (result != .Exited or result.Exited != 0) {
            return error.ServiceStartFailed;
        }
    }

    fn launchdStop(self: *ServiceController, service_name: []const u8) !void {
        const service_file = try self.getLaunchdServiceFile(service_name);
        defer self.allocator.free(service_file);

        const argv = [_][]const u8{ "launchctl", "unload", service_file };
        var child = std.process.Child.init(&argv, self.allocator);
        const result = try child.spawnAndWait();

        if (result != .Exited or result.Exited != 0) {
            return error.ServiceStopFailed;
        }
    }

    fn launchdStatus(self: *ServiceController, service_name: []const u8) !definitions.ServiceStatus {
        const label = try self.getLaunchdLabel(service_name);
        defer self.allocator.free(label);

        const argv = [_][]const u8{ "launchctl", "list", label };
        var child = std.process.Child.init(&argv, self.allocator);
        child.stdout_behavior = .Pipe;
        child.stderr_behavior = .Pipe;

        try child.spawn();
        const result = try child.wait();

        return if (result == .Exited and result.Exited == 0)
            .running
        else
            .stopped;
    }

    fn getLaunchdServiceFile(self: *ServiceController, service_name: []const u8) ![]const u8 {
        const label = try self.getLaunchdLabel(service_name);
        defer self.allocator.free(label);

        return try std.fmt.allocPrint(
            self.allocator,
            "/Library/LaunchDaemons/{s}.plist",
            .{label},
        );
    }

    fn getLaunchdLabel(self: *ServiceController, service_name: []const u8) ![]const u8 {
        return try std.fmt.allocPrint(
            self.allocator,
            "com.pantry.{s}",
            .{service_name},
        );
    }

    // ========================================================================
    // Linux systemd implementation
    // ========================================================================

    fn systemdStart(self: *ServiceController, service_name: []const u8) !void {
        const service_unit = try self.getSystemdUnit(service_name);
        defer self.allocator.free(service_unit);

        const argv = [_][]const u8{ "systemctl", "start", service_unit };
        var child = std.process.Child.init(&argv, self.allocator);
        const result = try child.spawnAndWait();

        if (result != .Exited or result.Exited != 0) {
            return error.ServiceStartFailed;
        }
    }

    fn systemdStop(self: *ServiceController, service_name: []const u8) !void {
        const service_unit = try self.getSystemdUnit(service_name);
        defer self.allocator.free(service_unit);

        const argv = [_][]const u8{ "systemctl", "stop", service_unit };
        var child = std.process.Child.init(&argv, self.allocator);
        const result = try child.spawnAndWait();

        if (result != .Exited or result.Exited != 0) {
            return error.ServiceStopFailed;
        }
    }

    fn systemdStatus(self: *ServiceController, service_name: []const u8) !definitions.ServiceStatus {
        const service_unit = try self.getSystemdUnit(service_name);
        defer self.allocator.free(service_unit);

        const argv = [_][]const u8{ "systemctl", "is-active", service_unit };
        var child = std.process.Child.init(&argv, self.allocator);
        child.stdout_behavior = .Pipe;
        child.stderr_behavior = .Pipe;

        try child.spawn();

        var stdout_buf: [1024]u8 = undefined;
        const n = try child.stdout.?.readAll(&stdout_buf);
        _ = try child.wait();

        const output = stdout_buf[0..n];

        if (std.mem.startsWith(u8, output, "active")) {
            return .running;
        } else if (std.mem.startsWith(u8, output, "inactive")) {
            return .stopped;
        } else if (std.mem.startsWith(u8, output, "failed")) {
            return .failed;
        }

        return .unknown;
    }

    fn getSystemdUnit(self: *ServiceController, service_name: []const u8) ![]const u8 {
        return try std.fmt.allocPrint(
            self.allocator,
            "pantry-{s}.service",
            .{service_name},
        );
    }
};

test "Platform detection" {
    const platform = Platform.detect();

    // Should detect a known platform
    try std.testing.expect(platform != .unknown);

    // Check service manager name
    const manager = platform.serviceManager();
    try std.testing.expect(manager.len > 0);
}

test "ServiceController init" {
    const allocator = std.testing.allocator;

    const controller = ServiceController.init(allocator);
    try std.testing.expect(controller.platform != .unknown);
}
