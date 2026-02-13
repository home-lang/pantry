const std = @import("std");
const builtin = @import("builtin");
const definitions = @import("definitions.zig");
const lib = @import("../lib.zig");
const io_helper = lib.io_helper;

/// Platform-specific service management
pub const Platform = enum {
    macos,
    linux,
    windows,
    freebsd,
    unknown,

    pub fn detect() Platform {
        return switch (builtin.os.tag) {
            .macos => .macos,
            .linux => .linux,
            .windows => .windows,
            .freebsd => .freebsd,
            else => .unknown,
        };
    }

    pub fn serviceManager(self: Platform) []const u8 {
        return switch (self) {
            .macos => "launchd",
            .linux => "systemd",
            .windows => "sc",
            .freebsd => "rc.d",
            .unknown => "unsupported",
        };
    }

    pub fn serviceFileExtension(self: Platform) []const u8 {
        return switch (self) {
            .macos => ".plist",
            .linux => ".service",
            .windows => ".xml",
            .freebsd => "",
            .unknown => "",
        };
    }

    pub fn serviceDirectory(self: Platform, allocator: std.mem.Allocator) ![]const u8 {
        return switch (self) {
            .macos => try allocator.dupe(u8, "/Library/LaunchDaemons"),
            .linux => try allocator.dupe(u8, "/etc/systemd/system"),
            .windows => try allocator.dupe(u8, "C:\\Windows\\System32\\config\\systemprofile\\AppData\\Roaming"),
            .freebsd => try allocator.dupe(u8, "/usr/local/etc/rc.d"),
            .unknown => error.UnsupportedPlatform,
        };
    }

    pub fn userServiceDirectory(self: Platform, allocator: std.mem.Allocator) ![]const u8 {
        const home = io_helper.getEnvVarOwned(allocator, "HOME") catch |err| {
            if (err == error.EnvironmentVariableNotFound) {
                // Try USERPROFILE on Windows
                return io_helper.getEnvVarOwned(allocator, "USERPROFILE") catch return error.HomeNotFound;
            }
            return error.HomeNotFound;
        };
        defer allocator.free(home);

        return switch (self) {
            .macos => try std.fmt.allocPrint(allocator, "{s}/Library/LaunchAgents", .{home}),
            .linux => try std.fmt.allocPrint(allocator, "{s}/.config/systemd/user", .{home}),
            .freebsd => try std.fmt.allocPrint(allocator, "{s}/.config/pantry/services", .{home}),
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

    /// Start a service (load and start)
    pub fn start(self: *ServiceController, service_name: []const u8) !void {
        switch (self.platform) {
            .macos => try self.launchdStart(service_name),
            .linux => try self.systemdStart(service_name),
            .freebsd => try self.rcdStart(service_name),
            .windows => return error.UnsupportedPlatform,
            .unknown => return error.UnsupportedPlatform,
        }
    }

    /// Enable a service (auto-start on boot)
    pub fn enable(self: *ServiceController, service_name: []const u8) !void {
        switch (self.platform) {
            .macos => {}, // launchd handles this via RunAtLoad in plist
            .linux => try self.systemdEnable(service_name),
            .freebsd => try self.rcdEnable(service_name),
            .windows => return error.UnsupportedPlatform,
            .unknown => return error.UnsupportedPlatform,
        }
    }

    /// Disable a service (don't auto-start on boot)
    pub fn disable(self: *ServiceController, service_name: []const u8) !void {
        switch (self.platform) {
            .macos => {}, // launchd handles this via plist modification
            .linux => try self.systemdDisable(service_name),
            .freebsd => try self.rcdDisable(service_name),
            .windows => return error.UnsupportedPlatform,
            .unknown => return error.UnsupportedPlatform,
        }
    }

    /// Stop a service
    pub fn stop(self: *ServiceController, service_name: []const u8) !void {
        switch (self.platform) {
            .macos => try self.launchdStop(service_name),
            .linux => try self.systemdStop(service_name),
            .freebsd => try self.rcdStop(service_name),
            .windows => return error.UnsupportedPlatform,
            .unknown => return error.UnsupportedPlatform,
        }
    }

    /// Restart a service
    pub fn restart(self: *ServiceController, service_name: []const u8) !void {
        try self.stop(service_name);
        // Small delay to ensure service fully stops (500ms)
        const delay_ns: u64 = std.time.ns_per_s / 2;
        io_helper.nanosleep(delay_ns / std.time.ns_per_s, delay_ns % std.time.ns_per_s);
        try self.start(service_name);
    }

    /// Get service status
    pub fn status(self: *ServiceController, service_name: []const u8) !definitions.ServiceStatus {
        return switch (self.platform) {
            .macos => try self.launchdStatus(service_name),
            .linux => try self.systemdStatus(service_name),
            .freebsd => try self.rcdStatus(service_name),
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
        const result = try io_helper.spawnAndWait(.{ .argv = &argv });

        if (result != .exited or result.exited != 0) {
            return error.ServiceStartFailed;
        }
    }

    fn launchdStop(self: *ServiceController, service_name: []const u8) !void {
        const service_file = try self.getLaunchdServiceFile(service_name);
        defer self.allocator.free(service_file);

        const argv = [_][]const u8{ "launchctl", "unload", service_file };
        const result = try io_helper.spawnAndWait(.{ .argv = &argv });

        if (result != .exited or result.exited != 0) {
            return error.ServiceStopFailed;
        }
    }

    fn launchdStatus(self: *ServiceController, service_name: []const u8) !definitions.ServiceStatus {
        const label = try self.getLaunchdLabel(service_name);
        defer self.allocator.free(label);

        const argv = [_][]const u8{ "launchctl", "list", label };
        var child = try io_helper.spawn(.{ .argv = &argv, .stdout = .pipe, .stderr = .pipe });
        const result = try io_helper.wait(&child);

        return if (result == .exited and result.exited == 0)
            .running
        else
            .stopped;
    }

    fn getLaunchdServiceFile(self: *ServiceController, service_name: []const u8) ![]const u8 {
        const label = try self.getLaunchdLabel(service_name);
        defer self.allocator.free(label);

        const service_dir = try self.platform.userServiceDirectory(self.allocator);
        defer self.allocator.free(service_dir);

        return try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}.plist",
            .{ service_dir, label },
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

        // Use --user flag for user services
        const argv = [_][]const u8{ "systemctl", "--user", "start", service_unit };
        const result = try io_helper.spawnAndWait(.{ .argv = &argv });

        if (result != .exited or result.exited != 0) {
            return error.ServiceStartFailed;
        }
    }

    fn systemdStop(self: *ServiceController, service_name: []const u8) !void {
        const service_unit = try self.getSystemdUnit(service_name);
        defer self.allocator.free(service_unit);

        const argv = [_][]const u8{ "systemctl", "--user", "stop", service_unit };
        const result = try io_helper.spawnAndWait(.{ .argv = &argv });

        if (result != .exited or result.exited != 0) {
            return error.ServiceStopFailed;
        }
    }

    fn systemdEnable(self: *ServiceController, service_name: []const u8) !void {
        const service_unit = try self.getSystemdUnit(service_name);
        defer self.allocator.free(service_unit);

        const argv = [_][]const u8{ "systemctl", "--user", "enable", service_unit };
        const result = try io_helper.spawnAndWait(.{ .argv = &argv });

        if (result != .exited or result.exited != 0) {
            return error.ServiceEnableFailed;
        }
    }

    fn systemdDisable(self: *ServiceController, service_name: []const u8) !void {
        const service_unit = try self.getSystemdUnit(service_name);
        defer self.allocator.free(service_unit);

        const argv = [_][]const u8{ "systemctl", "--user", "disable", service_unit };
        const result = try io_helper.spawnAndWait(.{ .argv = &argv });

        if (result != .exited or result.exited != 0) {
            return error.ServiceDisableFailed;
        }
    }

    fn systemdStatus(self: *ServiceController, service_name: []const u8) !definitions.ServiceStatus {
        const service_unit = try self.getSystemdUnit(service_name);
        defer self.allocator.free(service_unit);

        const argv = [_][]const u8{ "systemctl", "--user", "is-active", service_unit };
        const result = try io_helper.childRun(self.allocator, &argv);
        defer self.allocator.free(result.stdout);
        defer self.allocator.free(result.stderr);

        const output = std.mem.trim(u8, result.stdout, &std.ascii.whitespace);

        if (std.mem.eql(u8, output, "active")) {
            return .running;
        } else if (std.mem.eql(u8, output, "inactive")) {
            return .stopped;
        } else if (std.mem.eql(u8, output, "failed")) {
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

    // ========================================================================
    // FreeBSD rc.d implementation
    // ========================================================================

    fn rcdStart(self: *ServiceController, service_name: []const u8) !void {
        const rcd_name = try self.getRcdName(service_name);
        defer self.allocator.free(rcd_name);

        const argv = [_][]const u8{ "service", rcd_name, "onestart" };
        const result = try io_helper.spawnAndWait(.{ .argv = &argv });

        if (result != .exited or result.exited != 0) {
            return error.ServiceStartFailed;
        }
    }

    fn rcdStop(self: *ServiceController, service_name: []const u8) !void {
        const rcd_name = try self.getRcdName(service_name);
        defer self.allocator.free(rcd_name);

        const argv = [_][]const u8{ "service", rcd_name, "onestop" };
        const result = try io_helper.spawnAndWait(.{ .argv = &argv });

        if (result != .exited or result.exited != 0) {
            return error.ServiceStopFailed;
        }
    }

    fn rcdEnable(self: *ServiceController, service_name: []const u8) !void {
        const rcd_name = try self.getRcdName(service_name);
        defer self.allocator.free(rcd_name);

        // Enable via sysrc: sysrc pantry_<name>_enable=YES
        const var_name = try std.fmt.allocPrint(self.allocator, "{s}_enable=YES", .{rcd_name});
        defer self.allocator.free(var_name);

        const argv = [_][]const u8{ "sysrc", var_name };
        const result = try io_helper.spawnAndWait(.{ .argv = &argv });

        if (result != .exited or result.exited != 0) {
            return error.ServiceEnableFailed;
        }
    }

    fn rcdDisable(self: *ServiceController, service_name: []const u8) !void {
        const rcd_name = try self.getRcdName(service_name);
        defer self.allocator.free(rcd_name);

        // Disable via sysrc: sysrc pantry_<name>_enable=NO
        const var_name = try std.fmt.allocPrint(self.allocator, "{s}_enable=NO", .{rcd_name});
        defer self.allocator.free(var_name);

        const argv = [_][]const u8{ "sysrc", var_name };
        const result = try io_helper.spawnAndWait(.{ .argv = &argv });

        if (result != .exited or result.exited != 0) {
            return error.ServiceDisableFailed;
        }
    }

    fn rcdStatus(self: *ServiceController, service_name: []const u8) !definitions.ServiceStatus {
        const rcd_name = try self.getRcdName(service_name);
        defer self.allocator.free(rcd_name);

        const argv = [_][]const u8{ "service", rcd_name, "status" };
        const result = try io_helper.childRun(self.allocator, &argv);
        defer self.allocator.free(result.stdout);
        defer self.allocator.free(result.stderr);

        // rc.d status returns 0 if running, non-zero if stopped
        return switch (result.term) {
            .exited => |code| if (code == 0) .running else .stopped,
            else => .unknown,
        };
    }

    fn getRcdName(self: *ServiceController, service_name: []const u8) ![]const u8 {
        return try std.fmt.allocPrint(
            self.allocator,
            "pantry_{s}",
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
