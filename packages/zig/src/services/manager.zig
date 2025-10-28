const std = @import("std");
const definitions = @import("definitions.zig");
const platform = @import("platform.zig");

pub const ServiceManager = struct {
    allocator: std.mem.Allocator,
    controller: platform.ServiceController,
    services: std.StringHashMap(*definitions.ServiceConfig),

    pub fn init(allocator: std.mem.Allocator) ServiceManager {
        return .{
            .allocator = allocator,
            .controller = platform.ServiceController.init(allocator),
            .services = std.StringHashMap(*definitions.ServiceConfig).init(allocator),
        };
    }

    pub fn deinit(self: *ServiceManager) void {
        var it = self.services.iterator();
        while (it.next()) |entry| {
            entry.value_ptr.*.deinit(self.allocator);
            self.allocator.destroy(entry.value_ptr.*);
        }
        self.services.deinit();
    }

    /// Register a service
    pub fn register(self: *ServiceManager, config: definitions.ServiceConfig) !void {
        // Check if service already exists and free it
        if (self.services.fetchRemove(config.name)) |kv| {
            kv.value.deinit(self.allocator);
            self.allocator.destroy(kv.value);
        }

        const service_ptr = try self.allocator.create(definitions.ServiceConfig);
        service_ptr.* = config;

        try self.services.put(config.name, service_ptr);
    }

    /// Unregister a service
    pub fn unregister(self: *ServiceManager, service_name: []const u8) !void {
        if (self.services.fetchRemove(service_name)) |kv| {
            kv.value.deinit(self.allocator);
            self.allocator.destroy(kv.value);
        } else {
            return error.ServiceNotFound;
        }
    }

    /// Get service configuration
    pub fn getService(self: *ServiceManager, service_name: []const u8) ?*definitions.ServiceConfig {
        return self.services.get(service_name);
    }

    /// List all registered services
    pub fn listServices(self: *ServiceManager) ![]*definitions.ServiceConfig {
        const count = self.services.count();
        const result = try self.allocator.alloc(*definitions.ServiceConfig, count);

        var i: usize = 0;
        var it = self.services.valueIterator();
        while (it.next()) |service| : (i += 1) {
            result[i] = service.*;
        }

        return result;
    }

    /// Start a service
    pub fn start(self: *ServiceManager, service_name: []const u8) !void {
        const service = self.services.get(service_name) orelse return error.ServiceNotFound;

        // Generate service file if it doesn't exist
        try self.ensureServiceFile(service);

        // Start the service
        try self.controller.start(service_name);
    }

    /// Stop a service
    pub fn stop(self: *ServiceManager, service_name: []const u8) !void {
        _ = self.services.get(service_name) orelse return error.ServiceNotFound;
        try self.controller.stop(service_name);
    }

    /// Restart a service
    pub fn restart(self: *ServiceManager, service_name: []const u8) !void {
        _ = self.services.get(service_name) orelse return error.ServiceNotFound;
        try self.controller.restart(service_name);
    }

    /// Get service status
    pub fn status(self: *ServiceManager, service_name: []const u8) !definitions.ServiceStatus {
        _ = self.services.get(service_name) orelse return error.ServiceNotFound;
        return try self.controller.status(service_name);
    }

    /// Check if service is running
    pub fn isRunning(self: *ServiceManager, service_name: []const u8) !bool {
        return try self.controller.isRunning(service_name);
    }

    /// Generate service file for the current platform
    fn ensureServiceFile(self: *ServiceManager, service: *definitions.ServiceConfig) !void {
        const plat = platform.Platform.detect();

        switch (plat) {
            .macos => try self.generateLaunchdPlist(service),
            .linux => try self.generateSystemdUnit(service),
            .windows => return error.UnsupportedPlatform,
            .unknown => return error.UnsupportedPlatform,
        }
    }

    /// Generate launchd plist file for macOS
    fn generateLaunchdPlist(self: *ServiceManager, service: *definitions.ServiceConfig) !void {
        const label = try std.fmt.allocPrint(
            self.allocator,
            "com.pantry.{s}",
            .{service.name},
        );
        defer self.allocator.free(label);

        const plist_path = try std.fmt.allocPrint(
            self.allocator,
            "/Library/LaunchDaemons/{s}.plist",
            .{label},
        );
        defer self.allocator.free(plist_path);

        // Check if file already exists
        std.fs.cwd().access(plist_path, .{}) catch {
            // File doesn't exist, create it
            var file = try std.fs.cwd().createFile(plist_path, .{});
            defer file.close();

            try file.writeAll("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
            try file.writeAll("<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">\n");
            try file.writeAll("<plist version=\"1.0\">\n");
            try file.writeAll("<dict>\n");

            const label_line = try std.fmt.allocPrint(self.allocator, "    <key>Label</key>\n    <string>{s}</string>\n", .{label});
            defer self.allocator.free(label_line);
            try file.writeAll(label_line);

            const prog_args_line = try std.fmt.allocPrint(self.allocator, "    <key>ProgramArguments</key>\n    <array>\n        <string>{s}</string>\n    </array>\n", .{service.start_command});
            defer self.allocator.free(prog_args_line);
            try file.writeAll(prog_args_line);

            if (service.working_directory) |wd| {
                const wd_line = try std.fmt.allocPrint(self.allocator, "    <key>WorkingDirectory</key>\n    <string>{s}</string>\n", .{wd});
                defer self.allocator.free(wd_line);
                try file.writeAll(wd_line);
            }

            if (service.keep_alive) {
                try file.writeAll("    <key>KeepAlive</key>\n    <true/>\n");
            }

            if (service.auto_start) {
                try file.writeAll("    <key>RunAtLoad</key>\n    <true/>\n");
            }

            // Environment variables
            if (service.env_vars.count() > 0) {
                try file.writeAll("    <key>EnvironmentVariables</key>\n    <dict>\n");

                var it = service.env_vars.iterator();
                while (it.next()) |entry| {
                    const env_line = try std.fmt.allocPrint(self.allocator, "        <key>{s}</key>\n        <string>{s}</string>\n", .{
                        entry.key_ptr.*,
                        entry.value_ptr.*,
                    });
                    defer self.allocator.free(env_line);
                    try file.writeAll(env_line);
                }

                try file.writeAll("    </dict>\n");
            }

            try file.writeAll("</dict>\n");
            try file.writeAll("</plist>\n");
        };
    }

    /// Generate systemd unit file for Linux
    fn generateSystemdUnit(self: *ServiceManager, service: *definitions.ServiceConfig) !void {
        const unit_name = try std.fmt.allocPrint(
            self.allocator,
            "pantry-{s}.service",
            .{service.name},
        );
        defer self.allocator.free(unit_name);

        const unit_path = try std.fmt.allocPrint(
            self.allocator,
            "/etc/systemd/system/{s}",
            .{unit_name},
        );
        defer self.allocator.free(unit_path);

        // Check if file already exists
        std.fs.cwd().access(unit_path, .{}) catch {
            // File doesn't exist, create it
            var file = try std.fs.cwd().createFile(unit_path, .{});
            defer file.close();

            try file.writeAll("[Unit]\n");

            const desc_line = try std.fmt.allocPrint(self.allocator, "Description={s}\n", .{service.description});
            defer self.allocator.free(desc_line);
            try file.writeAll(desc_line);

            try file.writeAll("After=network.target\n\n");

            try file.writeAll("[Service]\n");

            const exec_line = try std.fmt.allocPrint(self.allocator, "ExecStart={s}\n", .{service.start_command});
            defer self.allocator.free(exec_line);
            try file.writeAll(exec_line);

            if (service.working_directory) |wd| {
                const wd_line = try std.fmt.allocPrint(self.allocator, "WorkingDirectory={s}\n", .{wd});
                defer self.allocator.free(wd_line);
                try file.writeAll(wd_line);
            }

            if (service.keep_alive) {
                try file.writeAll("Restart=always\n");
                try file.writeAll("RestartSec=3\n");
            }

            // Environment variables
            var it = service.env_vars.iterator();
            while (it.next()) |entry| {
                const env_line = try std.fmt.allocPrint(self.allocator, "Environment=\"{s}={s}\"\n", .{
                    entry.key_ptr.*,
                    entry.value_ptr.*,
                });
                defer self.allocator.free(env_line);
                try file.writeAll(env_line);
            }

            try file.writeAll("\n[Install]\n");
            if (service.auto_start) {
                try file.writeAll("WantedBy=multi-user.target\n");
            }
        };
    }
};

test "ServiceManager init and deinit" {
    const allocator = std.testing.allocator;

    var manager = ServiceManager.init(allocator);
    defer manager.deinit();

    try std.testing.expect(manager.services.count() == 0);
}

test "ServiceManager register and unregister" {
    const allocator = std.testing.allocator;

    var manager = ServiceManager.init(allocator);
    defer manager.deinit();

    // Register a service
    const redis = try definitions.Services.redis(allocator, 6379);
    try manager.register(redis);

    try std.testing.expect(manager.services.count() == 1);

    // Get service
    const service = manager.getService("redis");
    try std.testing.expect(service != null);
    try std.testing.expectEqualStrings("redis", service.?.name);

    // Unregister service
    try manager.unregister("redis");
    try std.testing.expect(manager.services.count() == 0);
}

test "ServiceManager list services" {
    const allocator = std.testing.allocator;

    var manager = ServiceManager.init(allocator);
    defer manager.deinit();

    // Register multiple services
    const redis = try definitions.Services.redis(allocator, 6379);
    try manager.register(redis);

    const pg = try definitions.Services.postgresql(allocator, 5432);
    try manager.register(pg);

    // List services
    const services = try manager.listServices();
    defer allocator.free(services);

    try std.testing.expect(services.len == 2);
}
