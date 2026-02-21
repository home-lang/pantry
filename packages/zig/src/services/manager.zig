const std = @import("std");
const definitions = @import("definitions.zig");
const platform = @import("platform.zig");
const io_helper = @import("../io_helper.zig");

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
            .freebsd => try self.generateRcdScript(service),
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

        // Use user LaunchAgents directory instead of system LaunchDaemons
        const plat = platform.Platform.detect();
        const service_dir = try plat.userServiceDirectory(self.allocator);
        defer self.allocator.free(service_dir);

        // Ensure directory exists
        try io_helper.makePath(service_dir);

        const plist_path = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}.plist",
            .{ service_dir, label },
        );
        defer self.allocator.free(plist_path);

        // Always regenerate the plist to pick up config changes
        {
            // Delete existing plist if present (ignore errors if it doesn't exist)
            io_helper.deleteFile(plist_path) catch {};
            const file = try io_helper.createFile(plist_path, .{});
            defer file.close(io_helper.io);

            try io_helper.writeAllToFile(file, "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
            try io_helper.writeAllToFile(file, "<!DOCTYPE plist PUBLIC \"-//Apple//DTD PLIST 1.0//EN\" \"http://www.apple.com/DTDs/PropertyList-1.0.dtd\">\n");
            try io_helper.writeAllToFile(file, "<plist version=\"1.0\">\n");
            try io_helper.writeAllToFile(file, "<dict>\n");

            const label_line = try std.fmt.allocPrint(self.allocator, "    <key>Label</key>\n    <string>{s}</string>\n", .{label});
            defer self.allocator.free(label_line);
            try io_helper.writeAllToFile(file, label_line);

            // Split start_command into individual ProgramArguments
            try io_helper.writeAllToFile(file, "    <key>ProgramArguments</key>\n    <array>\n");
            var arg_iter = std.mem.splitScalar(u8, service.start_command, ' ');
            while (arg_iter.next()) |arg| {
                if (arg.len == 0) continue;
                const arg_line = try std.fmt.allocPrint(self.allocator, "        <string>{s}</string>\n", .{arg});
                defer self.allocator.free(arg_line);
                try io_helper.writeAllToFile(file, arg_line);
            }
            try io_helper.writeAllToFile(file, "    </array>\n");

            if (service.working_directory) |wd| {
                const wd_line = try std.fmt.allocPrint(self.allocator, "    <key>WorkingDirectory</key>\n    <string>{s}</string>\n", .{wd});
                defer self.allocator.free(wd_line);
                try io_helper.writeAllToFile(file, wd_line);
            }

            if (service.keep_alive) {
                try io_helper.writeAllToFile(file, "    <key>KeepAlive</key>\n    <true/>\n");
            }

            if (service.auto_start) {
                try io_helper.writeAllToFile(file, "    <key>RunAtLoad</key>\n    <true/>\n");
            }

            // Log file paths
            {
                const home_env = io_helper.getEnvVarOwned(self.allocator, "HOME") catch null;
                defer if (home_env) |h| self.allocator.free(h);

                if (home_env) |h| {
                    const logs_dir = try std.fmt.allocPrint(self.allocator, "{s}/.local/share/pantry/logs", .{h});
                    defer self.allocator.free(logs_dir);
                    io_helper.makePath(logs_dir) catch {};

                    const stdout_path = try std.fmt.allocPrint(self.allocator, "    <key>StandardOutPath</key>\n    <string>{s}/{s}.log</string>\n", .{ logs_dir, service.name });
                    defer self.allocator.free(stdout_path);
                    try io_helper.writeAllToFile(file, stdout_path);

                    const stderr_path = try std.fmt.allocPrint(self.allocator, "    <key>StandardErrorPath</key>\n    <string>{s}/{s}.err</string>\n", .{ logs_dir, service.name });
                    defer self.allocator.free(stderr_path);
                    try io_helper.writeAllToFile(file, stderr_path);
                }
            }

            // Environment variables
            if (service.env_vars.count() > 0) {
                try io_helper.writeAllToFile(file, "    <key>EnvironmentVariables</key>\n    <dict>\n");

                var it = service.env_vars.iterator();
                while (it.next()) |entry| {
                    const env_line = try std.fmt.allocPrint(self.allocator, "        <key>{s}</key>\n        <string>{s}</string>\n", .{
                        entry.key_ptr.*,
                        entry.value_ptr.*,
                    });
                    defer self.allocator.free(env_line);
                    try io_helper.writeAllToFile(file, env_line);
                }

                try io_helper.writeAllToFile(file, "    </dict>\n");
            }

            try io_helper.writeAllToFile(file, "</dict>\n");
            try io_helper.writeAllToFile(file, "</plist>\n");
        }
    }

    /// Generate systemd unit file for Linux
    fn generateSystemdUnit(self: *ServiceManager, service: *definitions.ServiceConfig) !void {
        const unit_name = try std.fmt.allocPrint(
            self.allocator,
            "pantry-{s}.service",
            .{service.name},
        );
        defer self.allocator.free(unit_name);

        // Use user systemd directory instead of system
        const plat = platform.Platform.detect();
        const service_dir = try plat.userServiceDirectory(self.allocator);
        defer self.allocator.free(service_dir);

        // Ensure directory exists
        try io_helper.makePath(service_dir);

        const unit_path = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}",
            .{ service_dir, unit_name },
        );
        defer self.allocator.free(unit_path);

        // Check if file already exists
        io_helper.access(unit_path, .{}) catch {
            // File doesn't exist, create it
            const file = try io_helper.createFile(unit_path, .{});
            defer io_helper.closeFile(file);

            try io_helper.writeAllToFile(file, "[Unit]\n");

            const desc_line = try std.fmt.allocPrint(self.allocator, "Description={s}\n", .{service.description});
            defer self.allocator.free(desc_line);
            try io_helper.writeAllToFile(file, desc_line);

            try io_helper.writeAllToFile(file, "After=network.target\n\n");

            try io_helper.writeAllToFile(file, "[Service]\n");

            const exec_line = try std.fmt.allocPrint(self.allocator, "ExecStart={s}\n", .{service.start_command});
            defer self.allocator.free(exec_line);
            try io_helper.writeAllToFile(file, exec_line);

            if (service.working_directory) |wd| {
                const wd_line = try std.fmt.allocPrint(self.allocator, "WorkingDirectory={s}\n", .{wd});
                defer self.allocator.free(wd_line);
                try io_helper.writeAllToFile(file, wd_line);
            }

            if (service.keep_alive) {
                try io_helper.writeAllToFile(file, "Restart=always\n");
                try io_helper.writeAllToFile(file, "RestartSec=3\n");
            }

            // Log file paths
            {
                const home_env = io_helper.getEnvVarOwned(self.allocator, "HOME") catch null;
                defer if (home_env) |h| self.allocator.free(h);

                if (home_env) |h| {
                    const logs_dir = try std.fmt.allocPrint(self.allocator, "{s}/.local/share/pantry/logs", .{h});
                    defer self.allocator.free(logs_dir);
                    io_helper.makePath(logs_dir) catch {};

                    const stdout_line = try std.fmt.allocPrint(self.allocator, "StandardOutput=append:{s}/{s}.log\n", .{ logs_dir, service.name });
                    defer self.allocator.free(stdout_line);
                    try io_helper.writeAllToFile(file, stdout_line);

                    const stderr_line = try std.fmt.allocPrint(self.allocator, "StandardError=append:{s}/{s}.err\n", .{ logs_dir, service.name });
                    defer self.allocator.free(stderr_line);
                    try io_helper.writeAllToFile(file, stderr_line);
                }
            }

            // Environment variables
            var it = service.env_vars.iterator();
            while (it.next()) |entry| {
                const env_line = try std.fmt.allocPrint(self.allocator, "Environment=\"{s}={s}\"\n", .{
                    entry.key_ptr.*,
                    entry.value_ptr.*,
                });
                defer self.allocator.free(env_line);
                try io_helper.writeAllToFile(file, env_line);
            }

            try io_helper.writeAllToFile(file, "\n[Install]\n");
            if (service.auto_start) {
                try io_helper.writeAllToFile(file, "WantedBy=multi-user.target\n");
            }
        };
    }

    /// Generate FreeBSD rc.d script
    fn generateRcdScript(self: *ServiceManager, service: *definitions.ServiceConfig) !void {
        const script_name = try std.fmt.allocPrint(
            self.allocator,
            "pantry_{s}",
            .{service.name},
        );
        defer self.allocator.free(script_name);

        const service_dir = "/usr/local/etc/rc.d";

        const script_path = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}",
            .{ service_dir, script_name },
        );
        defer self.allocator.free(script_path);

        // Check if file already exists
        io_helper.access(script_path, .{}) catch {
            // File doesn't exist, create it
            const file = try io_helper.createFile(script_path, .{});
            defer io_helper.closeFile(file);

            try io_helper.writeAllToFile(file, "#!/bin/sh\n\n");
            try io_helper.writeAllToFile(file, "# PROVIDE: ");
            try io_helper.writeAllToFile(file, script_name);
            try io_helper.writeAllToFile(file, "\n# REQUIRE: DAEMON\n");
            try io_helper.writeAllToFile(file, "# KEYWORD: shutdown\n\n");

            try io_helper.writeAllToFile(file, ". /etc/rc.subr\n\n");

            try io_helper.writeAllToFile(file, "name=\"");
            try io_helper.writeAllToFile(file, script_name);
            try io_helper.writeAllToFile(file, "\"\n");

            const desc_line = try std.fmt.allocPrint(self.allocator, "rcvar=\"{s}_enable\"\n", .{script_name});
            defer self.allocator.free(desc_line);
            try io_helper.writeAllToFile(file, desc_line);

            const cmd_line = try std.fmt.allocPrint(self.allocator, "command=\"{s}\"\n", .{service.start_command});
            defer self.allocator.free(cmd_line);
            try io_helper.writeAllToFile(file, cmd_line);

            if (service.working_directory) |wd| {
                const wd_line = try std.fmt.allocPrint(self.allocator, "{s}_chdir=\"{s}\"\n", .{ script_name, wd });
                defer self.allocator.free(wd_line);
                try io_helper.writeAllToFile(file, wd_line);
            }

            // Environment variables
            var env_buf = std.ArrayList(u8){};
            defer env_buf.deinit(self.allocator);
            var it = service.env_vars.iterator();
            var first = true;
            while (it.next()) |entry| {
                if (!first) try env_buf.appendSlice(self.allocator, " ");
                first = false;
                const formatted = try std.fmt.allocPrint(self.allocator, "{s}={s}", .{ entry.key_ptr.*, entry.value_ptr.* });
                defer self.allocator.free(formatted);
                try env_buf.appendSlice(self.allocator, formatted);
            }
            if (env_buf.items.len > 0) {
                const env_line = try std.fmt.allocPrint(self.allocator, "{s}_env=\"{s}\"\n", .{ script_name, env_buf.items });
                defer self.allocator.free(env_line);
                try io_helper.writeAllToFile(file, env_line);
            }

            try io_helper.writeAllToFile(file, "\nrun_rc_command \"$1\"\n");
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
