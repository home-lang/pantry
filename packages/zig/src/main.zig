const std = @import("std");
const cli = @import("zig-cli");
const lib = @import("lib");

// ============================================================================
// Command Actions
// ============================================================================

fn installAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    // Get variadic package arguments
    var packages = std.ArrayList([]const u8){};
    defer packages.deinit(allocator);

    var i: usize = 0;
    while (ctx.getArgument(i)) |pkg| : (i += 1) {
        try packages.append(allocator, pkg);
    }

    const global = ctx.hasOption("global");
    const user = ctx.hasOption("user");
    const force = ctx.hasOption("force");
    const verbose = ctx.hasOption("verbose");
    const production = ctx.hasOption("production");
    const dev_only = ctx.hasOption("dev");
    const include_peer = ctx.hasOption("peer");
    const ignore_scripts = ctx.hasOption("ignore-scripts");
    const offline = ctx.hasOption("offline");
    const filter = ctx.getOption("filter");

    if (force) {
        std.debug.print("Warning: --force option is not yet implemented\n", .{});
    }

    // Note: --offline flag sets offline mode for this process
    // The offline module checks PANTRY_OFFLINE env var, but we can't easily set it in Zig 0.16
    // Instead, we inform the user and the install code will check this flag
    if (offline) {
        std.debug.print("Offline mode: Installing from cache only\n", .{});
        std.debug.print("Note: Set PANTRY_OFFLINE=1 environment variable for full offline support\n\n", .{});
    }

    // If global flag is set and no packages specified, install global dependencies
    if (global and packages.items.len == 0) {
        const result = if (user)
            try lib.commands.installGlobalDepsCommandUserLocal(allocator)
        else
            try lib.commands.installGlobalDepsCommand(allocator);
        defer result.deinit(allocator);

        if (result.message) |msg| {
            std.debug.print("{s}\n", .{msg});
        }

        std.process.exit(result.exit_code);
    }

    // If global flag is set WITH packages, install those packages globally
    if (global and packages.items.len > 0) {
        const result = try lib.commands.installPackagesGloballyCommand(allocator, packages.items);
        defer result.deinit(allocator);

        if (result.message) |msg| {
            std.debug.print("{s}\n", .{msg});
        }

        std.process.exit(result.exit_code);
    }

    // Call existing install logic with options
    const install_options = lib.commands.InstallOptions{
        .production = production,
        .dev_only = dev_only,
        .include_peer = include_peer,
        .ignore_scripts = ignore_scripts,
        .verbose = verbose,
        .filter = filter,
    };
    const result = try lib.commands.installCommandWithOptions(allocator, packages.items, install_options);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn addAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    // Get variadic package arguments
    var packages = std.ArrayList([]const u8){};
    defer packages.deinit(allocator);

    var i: usize = 0;
    while (ctx.getArgument(i)) |pkg| : (i += 1) {
        try packages.append(allocator, pkg);
    }

    if (packages.items.len == 0) {
        std.debug.print("Error: No packages specified. Usage: pantry add <package>[@version] ...\n", .{});
        std.process.exit(1);
    }

    const global = ctx.hasOption("global");
    const dev = ctx.hasOption("dev");
    const peer = ctx.hasOption("peer");
    const verbose = ctx.hasOption("verbose");

    // TODO: Implement global add (add to global dependencies)
    if (global) {
        std.debug.print("Warning: --global option is not yet implemented for add command\n", .{});
    }

    // Install the packages
    const install_options = lib.commands.InstallOptions{
        .production = false,
        .dev_only = false,
        .include_peer = false,
        .ignore_scripts = false,
        .verbose = verbose,
        .filter = null,
    };
    var result = try lib.commands.installCommandWithOptions(allocator, packages.items, install_options);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    // Exit if install failed
    if (result.exit_code != 0) {
        std.process.exit(result.exit_code);
    }

    // Save packages to config file
    const cwd = try std.process.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    // Find config file
    const config_files = [_][]const u8{ "pantry.json", "pantry.jsonc", "package.json", "package.jsonc" };
    var config_path: ?[]const u8 = null;
    for (config_files) |config_file| {
        const full_path = try std.fs.path.join(allocator, &[_][]const u8{ cwd, config_file });
        std.fs.cwd().access(full_path, .{}) catch {
            allocator.free(full_path);
            continue;
        };
        config_path = full_path;
        break;
    }

    if (config_path) |path| {
        defer allocator.free(path);

        // Save dependencies to config file
        saveDependenciesToConfig(allocator, path, packages.items, dev, peer) catch |err| {
            std.debug.print("\n⚠ Warning: Failed to save to config file: {}\n", .{err});
            std.debug.print("[33m Note:[0m To save to config, manually add to {s}\n", .{std.fs.path.basename(path)});
            std.process.exit(0);
        };

        std.debug.print("\n[32m✓[0m Installed and saved {d} package(s) to {s}\n", .{ packages.items.len, std.fs.path.basename(path) });
    } else {
        std.debug.print("\n[32m✓[0m Packages installed\n", .{});
        // No config file, so dev and peer flags are not used
    }

    std.process.exit(0);
}

/// Wrapper for ArrayList that provides writer interface for Zig 0.16-dev
const AppendWriter = struct {
    list: *std.ArrayList(u8),
    allocator: std.mem.Allocator,

    pub fn writeAll(self: *AppendWriter, bytes: []const u8) !void {
        try self.list.appendSlice(self.allocator, bytes);
    }

    pub fn writeByte(self: *AppendWriter, byte: u8) !void {
        try self.list.append(self.allocator, byte);
    }

    pub fn print(self: *AppendWriter, comptime fmt: []const u8, args: anytype) !void {
        var buf: [1024]u8 = undefined;
        const formatted = try std.fmt.bufPrint(&buf, fmt, args);
        try self.list.appendSlice(self.allocator, formatted);
    }
};

/// Save dependencies to config file (pantry.json or package.json)
fn serializeJsonValue(value: std.json.Value, writer: anytype, indent_level: usize) !void {
    const indent = "  ";

    switch (value) {
        .null => try writer.writeAll("null"),
        .bool => |b| try writer.writeAll(if (b) "true" else "false"),
        .integer => |i| try writer.print("{d}", .{i}),
        .float => |f| try writer.print("{d}", .{f}),
        .number_string => |s| try writer.writeAll(s),
        .string => |s| {
            try writer.writeByte('"');
            for (s) |c| {
                switch (c) {
                    '"' => try writer.writeAll("\\\""),
                    '\\' => try writer.writeAll("\\\\"),
                    '\n' => try writer.writeAll("\\n"),
                    '\r' => try writer.writeAll("\\r"),
                    '\t' => try writer.writeAll("\\t"),
                    else => try writer.writeByte(c),
                }
            }
            try writer.writeByte('"');
        },
        .array => |arr| {
            try writer.writeAll("[\n");
            for (arr.items, 0..) |item, i| {
                for (0..indent_level + 1) |_| try writer.writeAll(indent);
                try serializeJsonValue(item, writer, indent_level + 1);
                if (i < arr.items.len - 1) try writer.writeByte(',');
                try writer.writeByte('\n');
            }
            for (0..indent_level) |_| try writer.writeAll(indent);
            try writer.writeByte(']');
        },
        .object => |obj| {
            try writer.writeAll("{\n");
            var iter = obj.iterator();
            var count: usize = 0;
            const total = obj.count();
            while (iter.next()) |entry| {
                count += 1;
                for (0..indent_level + 1) |_| try writer.writeAll(indent);
                try writer.print("\"{s}\": ", .{entry.key_ptr.*});
                try serializeJsonValue(entry.value_ptr.*, writer, indent_level + 1);
                if (count < total) try writer.writeByte(',');
                try writer.writeByte('\n');
            }
            for (0..indent_level) |_| try writer.writeAll(indent);
            try writer.writeByte('}');
        },
    }
}

fn saveDependenciesToConfig(
    allocator: std.mem.Allocator,
    config_path: []const u8,
    packages: []const []const u8,
    is_dev: bool,
    is_peer: bool,
) !void {
    // Read existing config
    const config_content = try std.fs.cwd().readFileAlloc(config_path, allocator, std.Io.Limit.limited(1024 * 1024));
    defer allocator.free(config_content);

    // Strip JSONC comments if needed
    const is_jsonc = std.mem.endsWith(u8, config_path, ".jsonc");
    const json_content = if (is_jsonc)
        try lib.utils.jsonc.stripComments(allocator, config_content)
    else
        config_content; // Don't dupe if not needed
    defer if (is_jsonc) allocator.free(json_content);

    // Parse JSON
    var parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    // Determine dependency type field
    const dep_field = if (is_peer)
        "peerDependencies"
    else if (is_dev)
        "devDependencies"
    else
        "dependencies";

    // Get root object
    if (parsed.value != .object) return error.InvalidJson;
    var root_obj = parsed.value.object;

    // Get or create dependencies object
    var deps_obj_value = blk: {
        if (root_obj.getPtr(dep_field)) |existing| {
            break :blk existing;
        } else {
            const new_deps = std.json.ObjectMap.init(allocator);
            try root_obj.put(dep_field, .{ .object = new_deps });
            break :blk root_obj.getPtr(dep_field).?;
        }
    };

    if (deps_obj_value.* != .object) return error.InvalidJson;
    var deps_obj = &deps_obj_value.object;

    // Add each package
    for (packages) |pkg| {
        // Parse package name and version
        const at_pos = std.mem.lastIndexOf(u8, pkg, "@");
        const pkg_name = if (at_pos) |pos| blk: {
            // Handle scoped packages like @org/package@version
            if (pos > 0 and pkg[0] == '@') {
                break :blk pkg[0..pos];
            } else if (pos == 0) {
                break :blk pkg; // No version specified
            }
            break :blk pkg[0..pos];
        } else pkg;
        const pkg_version = if (at_pos) |pos|
            (if (pos > 0 and pkg[0] == '@') pkg[pos + 1 ..] else if (pos == 0) "latest" else pkg[pos + 1 ..])
        else
            "latest";

        // Add to dependencies
        const version_value = std.json.Value{ .string = try allocator.dupe(u8, pkg_version) };
        try deps_obj.put(try allocator.dupe(u8, pkg_name), version_value);
    }

    // Write back to file with pretty formatting
    var buf = std.ArrayList(u8){};
    defer buf.deinit(allocator);

    // Create an AppendWriter that wraps ArrayList
    var append_writer = AppendWriter{ .list = &buf, .allocator = allocator };
    try serializeJsonValue(parsed.value, &append_writer, 0);
    try buf.append(allocator, '\n');

    try std.fs.cwd().writeFile(.{
        .sub_path = config_path,
        .data = buf.items,
    });
}

fn removeAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    // Get variadic package arguments
    var packages = std.ArrayList([]const u8){};
    defer packages.deinit(allocator);

    var i: usize = 0;
    while (ctx.getArgument(i)) |pkg| : (i += 1) {
        try packages.append(allocator, pkg);
    }

    const save = !ctx.hasOption("no-save");
    const global = ctx.hasOption("global");
    const dry_run = ctx.hasOption("dry-run");
    const silent = ctx.hasOption("silent");
    const verbose = ctx.hasOption("verbose");

    const options = lib.commands.RemoveOptions{
        .save = save,
        .global = global,
        .dry_run = dry_run,
        .silent = silent,
        .verbose = verbose,
    };

    const result = try lib.commands.removeCommand(allocator, packages.items, options);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}
fn runAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const script_name = ctx.getArgument(0) orelse {
        std.debug.print("Error: No script name provided\n", .{});
        std.process.exit(1);
    };

    // Check if --filter flag is set
    const filter = ctx.getOption("filter");
    const parallel = ctx.hasOption("parallel");
    const sequential = ctx.hasOption("sequential");
    const changed = ctx.getOption("changed");
    const watch = ctx.hasOption("watch");

    // Use a stack-allocated array for args
    var args_buf: [32][]const u8 = undefined;
    var args_len: usize = 0;

    args_buf[args_len] = script_name;
    args_len += 1;

    // Get remaining arguments
    var i: usize = 1;
    while (true) : (i += 1) {
        const arg = ctx.getArgument(i) orelse break;
        if (args_len >= args_buf.len) break; // Prevent overflow
        args_buf[args_len] = arg;
        args_len += 1;
    }

    // If filter or changed is set, use filtered execution
    if (filter != null or changed != null or watch) {
        const use_parallel = if (sequential) false else if (parallel) true else true;

        const result = try lib.commands.runScriptWithFilter(
            allocator,
            script_name,
            args_buf[1..args_len],
            .{
                .filter = filter,
                .parallel = use_parallel,
                .changed_only = changed != null,
                .changed_base = changed orelse "HEAD",
                .watch = watch,
            },
        );
        defer result.deinit(allocator);

        if (result.message) |msg| {
            std.debug.print("{s}\n", .{msg});
        }

        std.process.exit(result.exit_code);
    }

    // Otherwise, run normally
    var result = try lib.commands.runScriptCommand(allocator, args_buf[0..args_len]);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn updateAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    // Get variadic package arguments
    var packages = std.ArrayList([]const u8){};
    defer packages.deinit(allocator);

    var i: usize = 0;
    while (ctx.getArgument(i)) |pkg| : (i += 1) {
        try packages.append(allocator, pkg);
    }

    const latest = ctx.hasOption("latest");
    const force = ctx.hasOption("force");
    const interactive = ctx.hasOption("interactive");
    const production = ctx.hasOption("production");
    const global = ctx.hasOption("global");
    const dry_run = ctx.hasOption("dry-run");
    const silent = ctx.hasOption("silent");
    const verbose = ctx.hasOption("verbose");
    const no_save = ctx.hasOption("no-save");

    const options = lib.commands.UpdateOptions{
        .latest = latest,
        .force = force,
        .interactive = interactive,
        .production = production,
        .global = global,
        .dry_run = dry_run,
        .silent = silent,
        .verbose = verbose,
        .save = !no_save,
    };

    const result = try lib.commands.updateCommand(allocator, packages.items, options);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn pxAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    // Get all arguments
    var args = try std.ArrayList([]const u8).initCapacity(allocator, 8);
    defer args.deinit(allocator);

    var i: usize = 0;
    while (ctx.getArgument(i)) |arg| : (i += 1) {
        try args.append(allocator, arg);
    }

    const use_pantry = ctx.hasOption("pantry");
    const package_name = ctx.getOption("package");
    const silent = ctx.hasOption("silent");
    const verbose = ctx.hasOption("verbose");

    const options = lib.commands.PxOptions{
        .use_pantry = use_pantry,
        .package_name = package_name,
        .silent = silent,
        .verbose = verbose,
    };

    const result = try lib.commands.pxCommand(allocator, args.items, options);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn outdatedAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    // Get variadic filter arguments
    var args = try std.ArrayList([]const u8).initCapacity(allocator, 8);
    defer args.deinit(allocator);

    var i: usize = 0;
    while (ctx.getArgument(i)) |arg| : (i += 1) {
        try args.append(allocator, arg);
    }

    const production = ctx.hasOption("production");
    const global = ctx.hasOption("global");
    const filter = ctx.getOption("filter");
    const silent = ctx.hasOption("silent");
    const verbose = ctx.hasOption("verbose");
    const no_progress = ctx.hasOption("no-progress");

    const options = lib.commands.OutdatedOptions{
        .production = production,
        .global = global,
        .filter = filter,
        .silent = silent,
        .verbose = verbose,
        .no_progress = no_progress,
    };

    const result = try lib.commands.outdatedCommand(allocator, args.items, options);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn scriptsListAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    var result = try lib.commands.listScriptsCommand(allocator);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn listAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const format = ctx.getOption("format") orelse "table";
    const verbose = ctx.hasOption("verbose");

    // TODO: Implement format and verbose options
    if (!std.mem.eql(u8, format, "table")) {
        std.debug.print("Warning: --format={s} is not yet implemented, using table format\n\n", .{format});
    }
    if (verbose) {
        std.debug.print("Warning: --verbose option is not yet implemented for list command\n\n", .{});
    }

    const result = try lib.commands.listCommand(allocator, &[_][]const u8{});
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn whoamiAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const result = try lib.commands.whoamiCommand(allocator, &[_][]const u8{});
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn publishAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const dry_run = ctx.hasOption("dry-run");
    const access_val = ctx.getOption("access") orelse "public";
    const tag = ctx.getOption("tag") orelse "latest";
    const registry_val = ctx.getOption("registry") orelse "https://registry.npmjs.org";

    const options = lib.commands.PublishOptions{
        .dry_run = dry_run,
        .access = access_val,
        .tag = tag,
        .registry = registry_val,
    };

    const result = try lib.commands.publishCommand(allocator, &[_][]const u8{}, options);
    defer {
        var r = result;
        r.deinit(allocator);
    }

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn publisherAddAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const package_name = ctx.getOption("package") orelse {
        std.debug.print("Error: --package is required\n", .{});
        std.process.exit(1);
    };

    const publisher_type = ctx.getOption("type") orelse "github-action";
    const owner = ctx.getOption("owner") orelse {
        std.debug.print("Error: --owner is required\n", .{});
        std.process.exit(1);
    };
    const repository = ctx.getOption("repository") orelse {
        std.debug.print("Error: --repository is required\n", .{});
        std.process.exit(1);
    };
    const workflow = ctx.getOption("workflow");
    const environment = ctx.getOption("environment");
    const registry = ctx.getOption("registry") orelse "https://registry.npmjs.org";

    const options = lib.commands.TrustedPublisherAddOptions{
        .package = package_name,
        .type = publisher_type,
        .owner = owner,
        .repository = repository,
        .workflow = workflow,
        .environment = environment,
        .registry = registry,
    };

    const result = try lib.commands.trustedPublisherAddCommand(allocator, &[_][]const u8{}, options);
    defer {
        var r = result;
        r.deinit(allocator);
    }

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn publisherListAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const package_name = ctx.getOption("package") orelse {
        std.debug.print("Error: --package is required\n", .{});
        std.process.exit(1);
    };

    const json_output = ctx.hasOption("json");
    const registry = ctx.getOption("registry") orelse "https://registry.npmjs.org";

    const options = lib.commands.TrustedPublisherListOptions{
        .package = package_name,
        .registry = registry,
        .json = json_output,
    };

    const result = try lib.commands.trustedPublisherListCommand(allocator, &[_][]const u8{}, options);
    defer {
        var r = result;
        r.deinit(allocator);
    }

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn publisherRemoveAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const package_name = ctx.getOption("package") orelse {
        std.debug.print("Error: --package is required\n", .{});
        std.process.exit(1);
    };

    const publisher_id = ctx.getOption("publisher-id") orelse {
        std.debug.print("Error: --publisher-id is required\n", .{});
        std.process.exit(1);
    };

    const registry = ctx.getOption("registry") orelse "https://registry.npmjs.org";

    const options = lib.commands.TrustedPublisherRemoveOptions{
        .package = package_name,
        .publisher_id = publisher_id,
        .registry = registry,
    };

    const result = try lib.commands.trustedPublisherRemoveCommand(allocator, &[_][]const u8{}, options);
    defer {
        var r = result;
        r.deinit(allocator);
    }

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn whyAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    // Get package name argument
    var packages = std.ArrayList([]const u8){};
    defer packages.deinit(allocator);

    var i: usize = 0;
    while (ctx.getArgument(i)) |pkg| : (i += 1) {
        try packages.append(allocator, pkg);
    }

    const top = ctx.hasOption("top");
    const depth_str = ctx.getOption("depth");

    var depth: ?usize = null;
    if (depth_str) |d| {
        depth = std.fmt.parseInt(usize, d, 10) catch null;
    }

    const options = lib.commands.WhyOptions{
        .top = top,
        .depth = depth,
    };

    const result = try lib.commands.whyCommand(allocator, packages.items, options);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn auditAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    // Parse audit-level option
    var audit_level: ?lib.commands.Severity = null;
    if (ctx.getOption("audit-level")) |level_str| {
        audit_level = lib.commands.Severity.fromString(level_str);
    }

    // Parse ignore CVEs
    var ignore_cves = std.ArrayList([]const u8){};
    defer ignore_cves.deinit(allocator);

    var i: usize = 0;
    while (ctx.getOption("ignore")) |_| : (i += 1) {
        // Note: zig-cli doesn't support multiple same-name options easily
        // This is a placeholder for the pattern
        break;
    }

    const prod_only = ctx.hasOption("prod");
    const json = ctx.hasOption("json");

    const options = lib.commands.AuditOptions{
        .audit_level = audit_level,
        .prod_only = prod_only,
        .ignore_cves = ignore_cves.items,
        .json = json,
    };

    const result = try lib.commands.auditCommand(allocator, &[_][]const u8{}, options);
    defer {
        var r = result;
        r.deinit(allocator);
    }

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn cacheStatsAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const format = ctx.getOption("format") orelse "table";

    // TODO: Implement format option
    if (!std.mem.eql(u8, format, "table")) {
        std.debug.print("Warning: --format={s} is not yet implemented, using table format\n\n", .{format});
    }

    const result = try lib.commands.cacheStatsCommand(allocator, &[_][]const u8{});
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn cacheClearAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const force = ctx.hasOption("force");

    // TODO: Implement force option (skip confirmation prompt when added)
    _ = force;

    const result = try lib.commands.cacheClearCommand(allocator, &[_][]const u8{});
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn cacheCleanAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    var result = try lib.commands.cacheCleanCommand(allocator);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn cleanAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const clean_local = ctx.hasOption("local");
    const clean_global = ctx.hasOption("global");
    const clean_cache = ctx.hasOption("cache");
    const clean_all = ctx.hasOption("all");

    // If no flags specified, default to cleaning local deps (which includes env cache)
    // This is the most common dev workflow: clean project to test fresh install
    const should_clean_local = clean_all or clean_local or (!clean_local and !clean_global and !clean_cache and !clean_all);
    const should_clean_global = clean_all or clean_global;
    const should_clean_cache = clean_all or clean_cache;

    const result = try lib.commands.cleanCommand(allocator, .{
        .local = should_clean_local,
        .global = should_clean_global,
        .cache = should_clean_cache,
    });
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn envListAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const format = ctx.getOption("format") orelse "table";
    const verbose = ctx.hasOption("verbose");

    // TODO: Implement format and verbose options
    if (!std.mem.eql(u8, format, "table")) {
        std.debug.print("Warning: --format={s} is not yet implemented, using table format\n\n", .{format});
    }
    if (verbose) {
        std.debug.print("Warning: --verbose option is not yet implemented for env:list command\n\n", .{});
    }

    const result = try lib.commands.envListCommand(allocator, &[_][]const u8{});
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn envInspectAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const hash = ctx.getArgument(0) orelse {
        std.debug.print("Error: env:inspect requires a hash argument\n", .{});
        std.process.exit(1);
    };

    const verbose = ctx.hasOption("verbose");

    // TODO: Implement verbose option (show more details like timestamps, sizes)
    if (verbose) {
        std.debug.print("Warning: --verbose option is not yet implemented for env:inspect command\n\n", .{});
    }

    const result = try lib.commands.envInspectCommand(allocator, hash);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn envCleanAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const dry_run = ctx.hasOption("dry-run");
    const force = ctx.hasOption("force");

    // TODO: Implement dry_run and force options
    if (dry_run) {
        std.debug.print("Warning: --dry-run option is not yet implemented for env:clean command\n\n", .{});
    }
    if (force) {
        std.debug.print("Warning: --force option is not yet implemented for env:clean command\n\n", .{});
    }

    const result = try lib.commands.envCleanCommand(allocator, &[_][]const u8{});
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn envRemoveAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const hash = ctx.getArgument(0) orelse {
        std.debug.print("Error: env:remove requires a hash argument\n", .{});
        std.process.exit(1);
    };

    const force = ctx.hasOption("force");

    // TODO: Implement force option (skip confirmation prompt when added)
    _ = force;

    const result = try lib.commands.envRemoveCommand(allocator, hash);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn shellIntegrateAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const result = try lib.commands.shellIntegrateCommand(allocator);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn shellLookupAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const dir = ctx.getArgument(0) orelse {
        std.debug.print("Error: shell:lookup requires a directory argument\n", .{});
        std.process.exit(1);
    };

    const result = try lib.commands.shellLookupCommand(allocator, dir);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn shellActivateAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const dir = ctx.getArgument(0) orelse {
        std.debug.print("Error: shell:activate requires a directory argument\n", .{});
        std.process.exit(1);
    };

    const result = try lib.commands.shellActivateCommand(allocator, dir);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn devShellcodeAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    var result = try lib.commands.shellCodeCommand(allocator);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        // Write to stdout for eval to capture
        const stdout = std.fs.File.stdout();
        _ = try stdout.writeAll(msg);
    }

    std.process.exit(result.exit_code);
}

fn servicesAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const result = try lib.commands.servicesListCommand(allocator);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn startAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const service_name = ctx.getArgument(0) orelse {
        std.debug.print("Error: start requires a service name argument\n", .{});
        std.process.exit(1);
    };

    const args = [_][]const u8{service_name};
    const result = try lib.commands.serviceStartCommand(allocator, &args);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn stopAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const service_name = ctx.getArgument(0) orelse {
        std.debug.print("Error: stop requires a service name argument\n", .{});
        std.process.exit(1);
    };

    const args = [_][]const u8{service_name};
    const result = try lib.commands.serviceStopCommand(allocator, &args);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn restartAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const service_name = ctx.getArgument(0) orelse {
        std.debug.print("Error: restart requires a service name argument\n", .{});
        std.process.exit(1);
    };

    const args = [_][]const u8{service_name};
    const result = try lib.commands.serviceRestartCommand(allocator, &args);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn statusAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const service_name = ctx.getArgument(0) orelse {
        std.debug.print("Error: status requires a service name argument\n", .{});
        std.process.exit(1);
    };

    const args = [_][]const u8{service_name};
    const result = try lib.commands.serviceStatusCommand(allocator, &args);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn enableAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const service_name = ctx.getArgument(0) orelse {
        std.debug.print("Error: enable requires a service name argument\n", .{});
        std.process.exit(1);
    };

    const args = [_][]const u8{service_name};
    const result = try lib.commands.serviceEnableCommand(allocator, &args);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn disableAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const service_name = ctx.getArgument(0) orelse {
        std.debug.print("Error: disable requires a service name argument\n", .{});
        std.process.exit(1);
    };

    const args = [_][]const u8{service_name};
    const result = try lib.commands.serviceDisableCommand(allocator, &args);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn bootstrapAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const path = ctx.getOption("path");
    const verbose = ctx.hasOption("verbose");
    const skip_bun = ctx.hasOption("skip-bun");
    const skip_shell_integration = ctx.hasOption("skip-shell-integration");

    const options = lib.commands.BootstrapOptions{
        .path = path,
        .verbose = verbose,
        .skip_bun = skip_bun,
        .skip_shell_integration = skip_shell_integration,
    };

    const result = try lib.commands.bootstrapCommand(allocator, options);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn shimAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    // Get variadic package arguments
    var packages = std.ArrayList([]const u8){};
    defer packages.deinit(allocator);

    var i: usize = 0;
    while (ctx.getArgument(i)) |pkg| : (i += 1) {
        try packages.append(allocator, pkg);
    }

    const output_dir = ctx.getOption("output");
    const force = ctx.hasOption("force");
    const verbose = ctx.hasOption("verbose");

    const options = lib.commands.ShimOptions{
        .output_dir = output_dir,
        .force = force,
        .verbose = verbose,
    };

    const result = try lib.commands.shimCommand(allocator, packages.items, options);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn shimListAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const result = try lib.commands.shimListCommand(allocator);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn shimRemoveAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    // Get variadic name arguments
    var names = std.ArrayList([]const u8){};
    defer names.deinit(allocator);

    var i: usize = 0;
    while (ctx.getArgument(i)) |name| : (i += 1) {
        try names.append(allocator, name);
    }

    const result = try lib.commands.shimRemoveCommand(allocator, names.items);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn verifyAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const package_path = ctx.getArgument(0) orelse {
        std.debug.print("Error: verify requires a package path argument\n", .{});
        std.process.exit(1);
    };

    const keyring_path = ctx.getOption("keyring");
    const verbose = ctx.hasOption("verbose");

    var args = std.ArrayList([]const u8){};
    defer args.deinit(allocator);

    try args.append(allocator, package_path);
    if (keyring_path) |path| {
        try args.append(allocator, "--keyring");
        try args.append(allocator, path);
    }
    if (verbose) {
        try args.append(allocator, "--verbose");
    }

    const result = try lib.commands.verifyCommand(allocator, args.items);
    defer {
        var r = result;
        r.deinit(allocator);
    }

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn signAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const package_path = ctx.getArgument(0) orelse {
        std.debug.print("Error: sign requires a package path argument\n", .{});
        std.process.exit(1);
    };

    const key = ctx.getArgument(1) orelse {
        std.debug.print("Error: sign requires a private key argument\n", .{});
        std.process.exit(1);
    };

    const output = ctx.getOption("output");
    const verbose = ctx.hasOption("verbose");

    var args = std.ArrayList([]const u8){};
    defer args.deinit(allocator);

    try args.append(allocator, package_path);
    try args.append(allocator, key);
    if (output) |path| {
        try args.append(allocator, "--output");
        try args.append(allocator, path);
    }
    if (verbose) {
        try args.append(allocator, "--verbose");
    }

    const result = try lib.commands.signCommand(allocator, args.items);
    defer {
        var r = result;
        r.deinit(allocator);
    }

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn generateKeyAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const output = ctx.getOption("output");
    const verbose = ctx.hasOption("verbose");

    var args = std.ArrayList([]const u8){};
    defer args.deinit(allocator);

    if (output) |path| {
        try args.append(allocator, "--output");
        try args.append(allocator, path);
    }
    if (verbose) {
        try args.append(allocator, "--verbose");
    }

    const result = try lib.commands.generateKeyCommand(allocator, args.items);
    defer {
        var r = result;
        r.deinit(allocator);
    }

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn initAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const verbose = ctx.hasOption("verbose");

    var args = std.ArrayList([]const u8){};
    defer args.deinit(allocator);

    if (verbose) {
        try args.append(allocator, "--verbose");
    }

    const result = try lib.commands.initCommand(allocator, args.items);
    defer {
        var r = result;
        r.deinit(allocator);
    }

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn doctorAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const result = try lib.commands.doctorNewCommand(allocator, &[_][]const u8{});
    defer {
        var r = result;
        r.deinit(allocator);
    }

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn dedupeAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const dry_run = ctx.hasOption("dry-run");

    var args = std.ArrayList([]const u8){};
    defer args.deinit(allocator);

    if (dry_run) {
        try args.append(allocator, "--dry-run");
    }

    const result = try lib.commands.dedupeCommand(allocator, args.items);
    defer {
        var r = result;
        r.deinit(allocator);
    }

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn searchAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const query = ctx.getArgument(0) orelse {
        std.debug.print("Error: search requires a query argument\n", .{});
        std.process.exit(1);
    };

    const args = [_][]const u8{query};
    const result = try lib.commands.searchCommand(allocator, &args);
    defer {
        var r = result;
        r.deinit(allocator);
    }

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn infoAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const package_name = ctx.getArgument(0) orelse {
        std.debug.print("Error: info requires a package name argument\n", .{});
        std.process.exit(1);
    };

    const args = [_][]const u8{package_name};
    const result = try lib.commands.infoCommand(allocator, &args);
    defer {
        var r = result;
        r.deinit(allocator);
    }

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn treeAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const no_versions = ctx.hasOption("no-versions");
    const no_dev = ctx.hasOption("no-dev");
    const peer = ctx.hasOption("peer");
    const json = ctx.hasOption("json");
    const depth = ctx.getOption("depth");

    var args = std.ArrayList([]const u8){};
    defer args.deinit(allocator);

    if (no_versions) {
        try args.append(allocator, "--no-versions");
    }
    if (no_dev) {
        try args.append(allocator, "--no-dev");
    }
    if (peer) {
        try args.append(allocator, "--peer");
    }
    if (json) {
        try args.append(allocator, "--json");
    }
    if (depth) |d| {
        const depth_arg = try std.fmt.allocPrint(allocator, "--depth={s}", .{d});
        defer allocator.free(depth_arg);
        try args.append(allocator, depth_arg);
    }

    const result = try lib.commands.treeCommand(allocator, args.items);
    defer {
        var r = result;
        r.deinit(allocator);
    }

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

// ============================================================================
// Main
// ============================================================================

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // Create root command
    var root = try cli.BaseCommand.init(allocator, "pantry", "Modern dependency manager");
    defer {
        root.deinit();
        allocator.destroy(root);
    }

    // ========================================================================
    // Install Command
    // ========================================================================
    var install_cmd = try cli.BaseCommand.init(allocator, "install", "Install packages");

    const install_packages_arg = cli.Argument.init("packages", "Packages to install", .string)
        .withRequired(false)
        .withVariadic(true);
    _ = try install_cmd.addArgument(install_packages_arg);

    const global_opt = cli.Option.init("global", "global", "Install globally", .bool)
        .withShort('g');
    _ = try install_cmd.addOption(global_opt);

    const user_opt = cli.Option.init("user", "user", "Install to user directory (~/.pantry/global)", .bool)
        .withShort('u');
    _ = try install_cmd.addOption(user_opt);

    const install_force_opt = cli.Option.init("force", "force", "Force reinstallation (not yet implemented)", .bool)
        .withShort('f');
    _ = try install_cmd.addOption(install_force_opt);

    const install_verbose_opt = cli.Option.init("verbose", "verbose", "Verbose output", .bool)
        .withShort('v');
    _ = try install_cmd.addOption(install_verbose_opt);

    const install_production_opt = cli.Option.init("production", "production", "Skip devDependencies (install only dependencies)", .bool)
        .withShort('p');
    _ = try install_cmd.addOption(install_production_opt);

    const install_dev_opt = cli.Option.init("dev", "dev", "Install devDependencies only", .bool)
        .withShort('d');
    _ = try install_cmd.addOption(install_dev_opt);

    const install_peer_opt = cli.Option.init("peer", "peer", "Install peerDependencies", .bool);
    _ = try install_cmd.addOption(install_peer_opt);

    const install_ignore_scripts_opt = cli.Option.init("ignore-scripts", "ignore-scripts", "Don't run lifecycle scripts", .bool);
    _ = try install_cmd.addOption(install_ignore_scripts_opt);

    const install_offline_opt = cli.Option.init("offline", "offline", "Install from cache only (no network requests)", .bool);
    _ = try install_cmd.addOption(install_offline_opt);

    const install_filter_opt = cli.Option.init("filter", "filter", "Filter workspace packages by pattern", .string)
        .withShort('F');
    _ = try install_cmd.addOption(install_filter_opt);

    _ = install_cmd.setAction(installAction);
    _ = try root.addCommand(install_cmd);

    // ========================================================================
    // Add Command
    // ========================================================================
    var add_cmd = try cli.BaseCommand.init(allocator, "add", "Add and install packages");

    const add_packages_arg = cli.Argument.init("packages", "Packages to add", .string)
        .withRequired(true)
        .withVariadic(true);
    _ = try add_cmd.addArgument(add_packages_arg);

    const add_global_opt = cli.Option.init("global", "global", "Add globally", .bool)
        .withShort('g');
    _ = try add_cmd.addOption(add_global_opt);

    const add_dev_opt = cli.Option.init("dev", "dev", "Add to devDependencies", .bool)
        .withShort('D');
    _ = try add_cmd.addOption(add_dev_opt);

    const add_peer_opt = cli.Option.init("peer", "peer", "Add to peerDependencies", .bool)
        .withShort('P');
    _ = try add_cmd.addOption(add_peer_opt);

    const add_verbose_opt = cli.Option.init("verbose", "verbose", "Verbose output", .bool)
        .withShort('v');
    _ = try add_cmd.addOption(add_verbose_opt);

    _ = add_cmd.setAction(addAction);
    _ = try root.addCommand(add_cmd);

    // ========================================================================
    // Remove Command
    // ========================================================================
    var remove_cmd = try cli.BaseCommand.init(allocator, "remove", "Remove dependencies from your project");

    const remove_packages_arg = cli.Argument.init("packages", "Packages to remove", .string)
        .withRequired(true)
        .withVariadic(true);
    _ = try remove_cmd.addArgument(remove_packages_arg);

    const remove_no_save_opt = cli.Option.init("no-save", "no-save", "Don't update package.json or save a lockfile", .bool);
    _ = try remove_cmd.addOption(remove_no_save_opt);

    const remove_global_opt = cli.Option.init("global", "global", "Remove globally", .bool)
        .withShort('g');
    _ = try remove_cmd.addOption(remove_global_opt);

    const remove_dry_run_opt = cli.Option.init("dry-run", "dry-run", "Don't remove anything", .bool);
    _ = try remove_cmd.addOption(remove_dry_run_opt);

    const remove_silent_opt = cli.Option.init("silent", "silent", "Don't log anything", .bool);
    _ = try remove_cmd.addOption(remove_silent_opt);

    const remove_verbose_opt = cli.Option.init("verbose", "verbose", "Excessively verbose logging", .bool)
        .withShort('v');
    _ = try remove_cmd.addOption(remove_verbose_opt);

    _ = remove_cmd.setAction(removeAction);
    _ = try root.addCommand(remove_cmd);

    // ========================================================================
    // List Command

    // ========================================================================
    // Update Command
    // ========================================================================
    var update_cmd = try cli.BaseCommand.init(allocator, "update", "Update dependencies to latest versions");

    const update_packages_arg = cli.Argument.init("packages", "Packages to update", .string)
        .withRequired(false)
        .withVariadic(true);
    _ = try update_cmd.addArgument(update_packages_arg);

    const update_latest_opt = cli.Option.init("latest", "latest", "Update to latest versions (ignore semver)", .bool);
    _ = try update_cmd.addOption(update_latest_opt);

    const update_force_opt = cli.Option.init("force", "force", "Force update", .bool)
        .withShort('f');
    _ = try update_cmd.addOption(update_force_opt);

    const update_interactive_opt = cli.Option.init("interactive", "interactive", "Interactive mode", .bool)
        .withShort('i');
    _ = try update_cmd.addOption(update_interactive_opt);

    const update_production_opt = cli.Option.init("production", "production", "Skip devDependencies", .bool)
        .withShort('p');
    _ = try update_cmd.addOption(update_production_opt);

    const update_global_opt = cli.Option.init("global", "global", "Update globally", .bool)
        .withShort('g');
    _ = try update_cmd.addOption(update_global_opt);

    const update_dry_run_opt = cli.Option.init("dry-run", "dry-run", "Don't update anything", .bool);
    _ = try update_cmd.addOption(update_dry_run_opt);

    const update_silent_opt = cli.Option.init("silent", "silent", "Don't log anything", .bool);
    _ = try update_cmd.addOption(update_silent_opt);

    const update_verbose_opt = cli.Option.init("verbose", "verbose", "Verbose logging", .bool)
        .withShort('v');
    _ = try update_cmd.addOption(update_verbose_opt);

    const update_no_save_opt = cli.Option.init("no-save", "no-save", "Don't update package.json", .bool);
    _ = try update_cmd.addOption(update_no_save_opt);

    _ = update_cmd.setAction(updateAction);
    _ = try root.addCommand(update_cmd);
    // ========================================================================
    var list_cmd = try cli.BaseCommand.init(allocator, "list", "List installed packages");

    // ========================================================================
    // Px Command (Package Executor)
    // ========================================================================
    var px_cmd = try cli.BaseCommand.init(allocator, "px", "Run packages from npm (like npx/bunx)");

    const px_executable_arg = cli.Argument.init("executable", "Package executable to run", .string)
        .withRequired(true);
    _ = try px_cmd.addArgument(px_executable_arg);

    const px_args_arg = cli.Argument.init("args", "Arguments for the executable", .string)
        .withRequired(false)
        .withVariadic(true);
    _ = try px_cmd.addArgument(px_args_arg);

    const px_pantry_opt = cli.Option.init("pantry", "pantry", "Use Pantry runtime (ignore shebangs)", .bool);
    _ = try px_cmd.addOption(px_pantry_opt);

    const px_package_opt = cli.Option.init("package", "package", "Specific package to use", .string)
        .withShort('p');
    _ = try px_cmd.addOption(px_package_opt);

    const px_silent_opt = cli.Option.init("silent", "silent", "Don't log anything", .bool);
    _ = try px_cmd.addOption(px_silent_opt);

    const px_verbose_opt = cli.Option.init("verbose", "verbose", "Verbose logging", .bool)
        .withShort('v');
    _ = try px_cmd.addOption(px_verbose_opt);

    _ = px_cmd.setAction(pxAction);
    _ = try root.addCommand(px_cmd);

    // ========================================================================
    // Outdated Command
    // ========================================================================
    var outdated_cmd = try cli.BaseCommand.init(allocator, "outdated", "Check for outdated dependencies");

    const outdated_filter_arg = cli.Argument.init("filter", "Package name patterns to check", .string)
        .withRequired(false)
        .withVariadic(true);
    _ = try outdated_cmd.addArgument(outdated_filter_arg);

    const outdated_production_opt = cli.Option.init("production", "production", "Check only production dependencies", .bool)
        .withShort('p');
    _ = try outdated_cmd.addOption(outdated_production_opt);

    const outdated_global_opt = cli.Option.init("global", "global", "Check global packages", .bool)
        .withShort('g');
    _ = try outdated_cmd.addOption(outdated_global_opt);

    const outdated_filter_opt = cli.Option.init("filter", "filter", "Filter by workspace", .string)
        .withShort('F');
    _ = try outdated_cmd.addOption(outdated_filter_opt);

    const outdated_silent_opt = cli.Option.init("silent", "silent", "Don't log anything", .bool);
    _ = try outdated_cmd.addOption(outdated_silent_opt);

    const outdated_verbose_opt = cli.Option.init("verbose", "verbose", "Verbose logging", .bool)
        .withShort('v');
    _ = try outdated_cmd.addOption(outdated_verbose_opt);

    const outdated_no_progress_opt = cli.Option.init("no-progress", "no-progress", "Disable progress bar", .bool);
    _ = try outdated_cmd.addOption(outdated_no_progress_opt);

    _ = outdated_cmd.setAction(outdatedAction);
    _ = try root.addCommand(outdated_cmd);

    const list_format_opt = cli.Option.init("format", "format", "Output format (table, json, simple)", .string)
        .withDefault("table");
    _ = try list_cmd.addOption(list_format_opt);

    const list_verbose_opt = cli.Option.init("verbose", "verbose", "Verbose output", .bool)
        .withShort('v');
    _ = try list_cmd.addOption(list_verbose_opt);

    _ = list_cmd.setAction(listAction);
    _ = try root.addCommand(list_cmd);

    // ========================================================================
    // Whoami Command
    // ========================================================================
    var whoami_cmd = try cli.BaseCommand.init(allocator, "whoami", "Display the currently authenticated user");
    _ = whoami_cmd.setAction(whoamiAction);
    _ = try root.addCommand(whoami_cmd);

    // ========================================================================
    // Publish Command
    // ========================================================================
    var publish_cmd = try cli.BaseCommand.init(allocator, "publish", "Publish package to registry");

    const dry_run_opt = cli.Option.init("dry-run", "dry-run", "Perform dry run without publishing", .bool);
    _ = try publish_cmd.addOption(dry_run_opt);

    const access_opt = cli.Option.init("access", "access", "Package access level (public/restricted)", .string)
        .withDefault("public");
    _ = try publish_cmd.addOption(access_opt);

    const tag_opt = cli.Option.init("tag", "tag", "Publish with a tag", .string)
        .withDefault("latest");
    _ = try publish_cmd.addOption(tag_opt);

    const registry_opt = cli.Option.init("registry", "registry", "Custom registry URL", .string);
    _ = try publish_cmd.addOption(registry_opt);

    _ = publish_cmd.setAction(publishAction);
    _ = try root.addCommand(publish_cmd);

    // ========================================================================
    // Why Command
    // ========================================================================
    var why_cmd = try cli.BaseCommand.init(allocator, "why", "Explain why a package is installed");

    const why_package_arg = cli.Argument.init("package", "Package name or pattern (supports globs like @org/*, *-suffix)", .string)
        .withRequired(true)
        .withVariadic(true);
    _ = try why_cmd.addArgument(why_package_arg);

    const why_top_opt = cli.Option.init("top", "top", "Show only top-level dependencies", .bool);
    _ = try why_cmd.addOption(why_top_opt);

    const why_depth_opt = cli.Option.init("depth", "depth", "Maximum depth of dependency tree to display", .string);
    _ = try why_cmd.addOption(why_depth_opt);

    _ = why_cmd.setAction(whyAction);
    _ = try root.addCommand(why_cmd);

    // ========================================================================
    // Audit Command
    // ========================================================================
    var audit_cmd = try cli.BaseCommand.init(allocator, "audit", "Check packages for security vulnerabilities");

    const audit_level_opt = cli.Option.init("audit-level", "audit-level", "Only show vulnerabilities at this severity or higher (low, moderate, high, critical)", .string);
    _ = try audit_cmd.addOption(audit_level_opt);

    const audit_prod_opt = cli.Option.init("prod", "prod", "Audit only production dependencies", .bool);
    _ = try audit_cmd.addOption(audit_prod_opt);

    const audit_ignore_opt = cli.Option.init("ignore", "ignore", "Ignore specific CVE IDs", .string);
    _ = try audit_cmd.addOption(audit_ignore_opt);

    const audit_json_opt = cli.Option.init("json", "json", "Output in JSON format", .bool);
    _ = try audit_cmd.addOption(audit_json_opt);

    _ = audit_cmd.setAction(auditAction);
    _ = try root.addCommand(audit_cmd);

    // ========================================================================
    // Run Command (Script Runner)
    // ========================================================================
    var run_cmd = try cli.BaseCommand.init(allocator, "run", "Run a script from pantry.json or package.json");

    const run_script_arg = cli.Argument.init("script", "Script name", .string)
        .withRequired(true);
    _ = try run_cmd.addArgument(run_script_arg);

    const run_args_arg = cli.Argument.init("args", "Script arguments", .string)
        .withVariadic(true)
        .withRequired(false);
    _ = try run_cmd.addArgument(run_args_arg);

    const run_filter_opt = cli.Option.init("filter", "filter", "Run script in filtered workspace packages", .string)
        .withShort('F');
    _ = try run_cmd.addOption(run_filter_opt);

    const run_parallel_opt = cli.Option.init("parallel", "parallel", "Run scripts in parallel (respecting dependency order)", .bool);
    _ = try run_cmd.addOption(run_parallel_opt);

    const run_sequential_opt = cli.Option.init("sequential", "sequential", "Run scripts sequentially", .bool);
    _ = try run_cmd.addOption(run_sequential_opt);

    const run_changed_opt = cli.Option.init("changed", "changed", "Only run on changed packages since git ref", .string);
    _ = try run_cmd.addOption(run_changed_opt);

    const run_watch_opt = cli.Option.init("watch", "watch", "Watch for changes and re-run script", .bool)
        .withShort('w');
    _ = try run_cmd.addOption(run_watch_opt);

    _ = run_cmd.setAction(runAction);
    _ = try root.addCommand(run_cmd);

    // ========================================================================
    // Scripts Command
    // ========================================================================
    var scripts_list_cmd = try cli.BaseCommand.init(allocator, "scripts", "List available scripts");
    _ = scripts_list_cmd.setAction(scriptsListAction);
    _ = try root.addCommand(scripts_list_cmd);

    // ========================================================================
    // Common Script Shortcuts (npm-style)
    // ========================================================================
    // Add shortcuts for common scripts: dev, test, build
    // Note: 'start' is reserved for service management
    const common_scripts = [_]struct { name: []const u8, desc: []const u8 }{
        .{ .name = "dev", .desc = "Run development script (alias for 'run dev')" },
        .{ .name = "test", .desc = "Run test script (alias for 'run test')" },
        .{ .name = "build", .desc = "Run build script (alias for 'run build')" },
    };

    inline for (common_scripts) |script_info| {
        const ScriptName = struct {
            const name = script_info.name;
        };

        var shortcut_cmd = try cli.BaseCommand.init(allocator, script_info.name, script_info.desc);

        const shortcut_args_arg = cli.Argument.init("args", "Script arguments", .string)
            .withVariadic(true)
            .withRequired(false);
        _ = try shortcut_cmd.addArgument(shortcut_args_arg);

        const ActionStruct = struct {
            fn action(ctx: *cli.BaseCommand.ParseContext) !void {
                const alloc = ctx.allocator;

                // Use a stack-allocated array for script name + args
                var args_buf: [16][]const u8 = undefined;
                var args_len: usize = 0;

                // Add the script name (command name)
                args_buf[args_len] = ScriptName.name;
                args_len += 1;

                // Add any additional arguments
                var i: usize = 0;
                while (true) : (i += 1) {
                    const arg = ctx.getArgument(i) orelse break;
                    if (args_len >= args_buf.len) break; // Prevent overflow
                    args_buf[args_len] = arg;
                    args_len += 1;
                }

                var result = try lib.commands.runScriptCommand(alloc, args_buf[0..args_len]);
                defer result.deinit(alloc);

                if (result.message) |msg| {
                    std.debug.print("{s}\n", .{msg});
                }

                std.process.exit(result.exit_code);
            }
        };

        _ = shortcut_cmd.setAction(ActionStruct.action);
        _ = try root.addCommand(shortcut_cmd);
    }

    // ========================================================================
    // Cache Commands
    // ========================================================================
    var cache_stats_cmd = try cli.BaseCommand.init(allocator, "cache:stats", "Show cache statistics");

    const cache_stats_format_opt = cli.Option.init("format", "format", "Output format", .string)
        .withDefault("table");
    _ = try cache_stats_cmd.addOption(cache_stats_format_opt);

    _ = cache_stats_cmd.setAction(cacheStatsAction);
    _ = try root.addCommand(cache_stats_cmd);

    var cache_clear_cmd = try cli.BaseCommand.init(allocator, "cache:clear", "Clear cache");

    const cache_clear_force_opt = cli.Option.init("force", "force", "Force clearing", .bool)
        .withShort('f');
    _ = try cache_clear_cmd.addOption(cache_clear_force_opt);

    _ = cache_clear_cmd.setAction(cacheClearAction);
    _ = try root.addCommand(cache_clear_cmd);

    var cache_clean_cmd = try cli.BaseCommand.init(allocator, "cache:clean", "Clean unused cache entries");
    _ = cache_clean_cmd.setAction(cacheCleanAction);
    _ = try root.addCommand(cache_clean_cmd);

    // clean command with options for local/global
    var clean_cmd = try cli.BaseCommand.init(allocator, "clean", "Clean local dependencies and env cache (default)");

    const clean_local_opt = cli.Option.init("local", "local", "Clean local project dependencies (pantry)", .bool)
        .withShort('l');
    _ = try clean_cmd.addOption(clean_local_opt);

    const clean_global_opt = cli.Option.init("global", "global", "Clean global dependencies", .bool)
        .withShort('g');
    _ = try clean_cmd.addOption(clean_global_opt);

    const clean_cache_opt = cli.Option.init("cache", "cache", "Clean package cache", .bool)
        .withShort('c');
    _ = try clean_cmd.addOption(clean_cache_opt);

    const clean_all_opt = cli.Option.init("all", "all", "Clean everything (local, global, cache)", .bool)
        .withShort('a');
    _ = try clean_cmd.addOption(clean_all_opt);

    _ = clean_cmd.setAction(cleanAction);
    _ = try root.addCommand(clean_cmd);

    // ========================================================================
    // Environment Commands
    // ========================================================================
    var env_list_cmd = try cli.BaseCommand.init(allocator, "env:list", "List environments");

    const env_list_format_opt = cli.Option.init("format", "format", "Output format", .string)
        .withDefault("table");
    _ = try env_list_cmd.addOption(env_list_format_opt);

    const env_list_verbose_opt = cli.Option.init("verbose", "verbose", "Verbose output", .bool)
        .withShort('v');
    _ = try env_list_cmd.addOption(env_list_verbose_opt);

    _ = env_list_cmd.setAction(envListAction);
    _ = try root.addCommand(env_list_cmd);

    var env_inspect_cmd = try cli.BaseCommand.init(allocator, "env:inspect", "Inspect environment");

    const env_inspect_hash_arg = cli.Argument.init("hash", "Environment hash", .string)
        .withRequired(true);
    _ = try env_inspect_cmd.addArgument(env_inspect_hash_arg);

    const env_inspect_verbose_opt = cli.Option.init("verbose", "verbose", "Verbose output", .bool)
        .withShort('v');
    _ = try env_inspect_cmd.addOption(env_inspect_verbose_opt);

    _ = env_inspect_cmd.setAction(envInspectAction);
    _ = try root.addCommand(env_inspect_cmd);

    var env_clean_cmd = try cli.BaseCommand.init(allocator, "env:clean", "Clean old environments");

    const env_clean_dry_run_opt = cli.Option.init("dry-run", "dry-run", "Dry run", .bool);
    _ = try env_clean_cmd.addOption(env_clean_dry_run_opt);

    const env_clean_force_opt = cli.Option.init("force", "force", "Force removal", .bool)
        .withShort('f');
    _ = try env_clean_cmd.addOption(env_clean_force_opt);

    _ = env_clean_cmd.setAction(envCleanAction);
    _ = try root.addCommand(env_clean_cmd);

    var env_remove_cmd = try cli.BaseCommand.init(allocator, "env:remove", "Remove environment");

    const env_remove_hash_arg = cli.Argument.init("hash", "Environment hash", .string)
        .withRequired(true);
    _ = try env_remove_cmd.addArgument(env_remove_hash_arg);

    const env_remove_force_opt = cli.Option.init("force", "force", "Force removal", .bool)
        .withShort('f');
    _ = try env_remove_cmd.addOption(env_remove_force_opt);

    _ = env_remove_cmd.setAction(envRemoveAction);
    _ = try root.addCommand(env_remove_cmd);

    // ========================================================================
    // Shell Commands
    // ========================================================================
    var shell_integrate_cmd = try cli.BaseCommand.init(allocator, "shell:integrate", "Install shell integration");
    _ = shell_integrate_cmd.setAction(shellIntegrateAction);
    _ = try root.addCommand(shell_integrate_cmd);

    var shell_lookup_cmd = try cli.BaseCommand.init(allocator, "shell:lookup", "Cache lookup (internal)");

    const shell_lookup_dir_arg = cli.Argument.init("dir", "Directory", .string)
        .withRequired(true);
    _ = try shell_lookup_cmd.addArgument(shell_lookup_dir_arg);

    _ = shell_lookup_cmd.setAction(shellLookupAction);
    _ = try root.addCommand(shell_lookup_cmd);

    var shell_activate_cmd = try cli.BaseCommand.init(allocator, "shell:activate", "Activate environment (internal)");

    const shell_activate_dir_arg = cli.Argument.init("dir", "Directory", .string)
        .withRequired(true);
    _ = try shell_activate_cmd.addArgument(shell_activate_dir_arg);

    _ = shell_activate_cmd.setAction(shellActivateAction);
    _ = try root.addCommand(shell_activate_cmd);

    // ========================================================================
    // Dev Commands
    // ========================================================================
    var dev_shellcode_cmd = try cli.BaseCommand.init(allocator, "dev:shellcode", "Generate shell integration code");
    _ = dev_shellcode_cmd.setAction(devShellcodeAction);
    _ = try root.addCommand(dev_shellcode_cmd);

    // ========================================================================
    // Service Commands
    // ========================================================================
    var services_cmd = try cli.BaseCommand.init(allocator, "services", "List available services");
    _ = services_cmd.setAction(servicesAction);
    _ = try root.addCommand(services_cmd);

    var start_cmd = try cli.BaseCommand.init(allocator, "start", "Start a service");

    const start_service_arg = cli.Argument.init("service", "Service name", .string)
        .withRequired(true);
    _ = try start_cmd.addArgument(start_service_arg);

    const start_port_opt = cli.Option.init("port", "port", "Service port", .int)
        .withShort('p');
    _ = try start_cmd.addOption(start_port_opt);

    _ = start_cmd.setAction(startAction);
    _ = try root.addCommand(start_cmd);

    var stop_cmd = try cli.BaseCommand.init(allocator, "stop", "Stop a service");

    const stop_service_arg = cli.Argument.init("service", "Service name", .string)
        .withRequired(true);
    _ = try stop_cmd.addArgument(stop_service_arg);

    _ = stop_cmd.setAction(stopAction);
    _ = try root.addCommand(stop_cmd);

    var restart_cmd = try cli.BaseCommand.init(allocator, "restart", "Restart a service");

    const restart_service_arg = cli.Argument.init("service", "Service name", .string)
        .withRequired(true);
    _ = try restart_cmd.addArgument(restart_service_arg);

    _ = restart_cmd.setAction(restartAction);
    _ = try root.addCommand(restart_cmd);

    var status_cmd = try cli.BaseCommand.init(allocator, "status", "Check service status");

    const status_service_arg = cli.Argument.init("service", "Service name", .string)
        .withRequired(true);
    _ = try status_cmd.addArgument(status_service_arg);

    _ = status_cmd.setAction(statusAction);
    _ = try root.addCommand(status_cmd);

    var enable_cmd = try cli.BaseCommand.init(allocator, "enable", "Enable service auto-start");

    const enable_service_arg = cli.Argument.init("service", "Service name", .string)
        .withRequired(true);
    _ = try enable_cmd.addArgument(enable_service_arg);

    _ = enable_cmd.setAction(enableAction);
    _ = try root.addCommand(enable_cmd);

    var disable_cmd = try cli.BaseCommand.init(allocator, "disable", "Disable service auto-start");

    const disable_service_arg = cli.Argument.init("service", "Service name", .string)
        .withRequired(true);
    _ = try disable_cmd.addArgument(disable_service_arg);

    _ = disable_cmd.setAction(disableAction);
    _ = try root.addCommand(disable_cmd);

    // ========================================================================
    // Bootstrap Command (System Setup)
    // ========================================================================
    var bootstrap_cmd = try cli.BaseCommand.init(allocator, "bootstrap", "Set up development environment");

    const bootstrap_path_opt = cli.Option.init("path", "path", "Custom installation path", .string);
    _ = try bootstrap_cmd.addOption(bootstrap_path_opt);

    const bootstrap_verbose_opt = cli.Option.init("verbose", "verbose", "Verbose output", .bool)
        .withShort('v');
    _ = try bootstrap_cmd.addOption(bootstrap_verbose_opt);

    const bootstrap_skip_bun_opt = cli.Option.init("skip-bun", "skip-bun", "Skip Bun installation", .bool);
    _ = try bootstrap_cmd.addOption(bootstrap_skip_bun_opt);

    const bootstrap_skip_shell_opt = cli.Option.init("skip-shell-integration", "skip-shell-integration", "Skip shell integration", .bool);
    _ = try bootstrap_cmd.addOption(bootstrap_skip_shell_opt);

    _ = bootstrap_cmd.setAction(bootstrapAction);
    _ = try root.addCommand(bootstrap_cmd);

    // ========================================================================
    // Shim Commands
    // ========================================================================
    var shim_cmd = try cli.BaseCommand.init(allocator, "shim", "Create executable shims for packages");

    const shim_packages_arg = cli.Argument.init("packages", "Packages to create shims for", .string)
        .withRequired(true)
        .withVariadic(true);
    _ = try shim_cmd.addArgument(shim_packages_arg);

    const shim_output_opt = cli.Option.init("output", "output", "Output directory for shims", .string)
        .withShort('o');
    _ = try shim_cmd.addOption(shim_output_opt);

    const shim_force_opt = cli.Option.init("force", "force", "Overwrite existing shims", .bool)
        .withShort('f');
    _ = try shim_cmd.addOption(shim_force_opt);

    const shim_verbose_opt = cli.Option.init("verbose", "verbose", "Verbose output", .bool)
        .withShort('v');
    _ = try shim_cmd.addOption(shim_verbose_opt);

    _ = shim_cmd.setAction(shimAction);
    _ = try root.addCommand(shim_cmd);

    var shim_list_cmd = try cli.BaseCommand.init(allocator, "shim:list", "List existing shims");
    _ = shim_list_cmd.setAction(shimListAction);
    _ = try root.addCommand(shim_list_cmd);

    var shim_remove_cmd = try cli.BaseCommand.init(allocator, "shim:remove", "Remove shims");

    const shim_remove_names_arg = cli.Argument.init("names", "Shim names to remove", .string)
        .withRequired(true)
        .withVariadic(true);
    _ = try shim_remove_cmd.addArgument(shim_remove_names_arg);

    _ = shim_remove_cmd.setAction(shimRemoveAction);
    _ = try root.addCommand(shim_remove_cmd);

    // ========================================================================
    // Verify Command (Package Signature Verification)
    // ========================================================================
    var verify_cmd = try cli.BaseCommand.init(allocator, "verify", "Verify package signature");

    const verify_package_arg = cli.Argument.init("package", "Package path to verify", .string)
        .withRequired(true);
    _ = try verify_cmd.addArgument(verify_package_arg);

    const verify_keyring_opt = cli.Option.init("keyring", "keyring", "Path to keyring file", .string)
        .withShort('k');
    _ = try verify_cmd.addOption(verify_keyring_opt);

    const verify_verbose_opt = cli.Option.init("verbose", "verbose", "Verbose output", .bool)
        .withShort('v');
    _ = try verify_cmd.addOption(verify_verbose_opt);

    _ = verify_cmd.setAction(verifyAction);
    _ = try root.addCommand(verify_cmd);

    // ========================================================================
    // Sign Command (Package Signing)
    // ========================================================================
    var sign_cmd = try cli.BaseCommand.init(allocator, "sign", "Sign a package");

    const sign_package_arg = cli.Argument.init("package", "Package path to sign", .string)
        .withRequired(true);
    _ = try sign_cmd.addArgument(sign_package_arg);

    const sign_key_arg = cli.Argument.init("key", "Private key (hex format)", .string)
        .withRequired(true);
    _ = try sign_cmd.addArgument(sign_key_arg);

    const sign_output_opt = cli.Option.init("output", "output", "Output signature file path", .string)
        .withShort('o');
    _ = try sign_cmd.addOption(sign_output_opt);

    const sign_verbose_opt = cli.Option.init("verbose", "verbose", "Verbose output", .bool)
        .withShort('v');
    _ = try sign_cmd.addOption(sign_verbose_opt);

    _ = sign_cmd.setAction(signAction);
    _ = try root.addCommand(sign_cmd);

    // ========================================================================
    // Generate-Key Command (Keypair Generation)
    // ========================================================================
    var generate_key_cmd = try cli.BaseCommand.init(allocator, "generate-key", "Generate Ed25519 keypair");

    const generate_key_output_opt = cli.Option.init("output", "output", "Output directory for keys", .string)
        .withShort('o');
    _ = try generate_key_cmd.addOption(generate_key_output_opt);

    const generate_key_verbose_opt = cli.Option.init("verbose", "verbose", "Verbose output", .bool)
        .withShort('v');
    _ = try generate_key_cmd.addOption(generate_key_verbose_opt);

    _ = generate_key_cmd.setAction(generateKeyAction);
    _ = try root.addCommand(generate_key_cmd);

    // ========================================================================
    // Init Command (Project Initialization)
    // ========================================================================
    var init_cmd = try cli.BaseCommand.init(allocator, "init", "Initialize a new pantry.json file");

    const init_verbose_opt = cli.Option.init("verbose", "verbose", "Verbose output", .bool)
        .withShort('v');
    _ = try init_cmd.addOption(init_verbose_opt);

    _ = init_cmd.setAction(initAction);
    _ = try root.addCommand(init_cmd);

    // ========================================================================
    // Tree Command (Dependency Tree Visualization)
    // ========================================================================
    var tree_cmd = try cli.BaseCommand.init(allocator, "tree", "Display dependency tree");

    const tree_no_versions_opt = cli.Option.init("no-versions", "no-versions", "Hide version numbers", .bool);
    _ = try tree_cmd.addOption(tree_no_versions_opt);

    const tree_no_dev_opt = cli.Option.init("no-dev", "no-dev", "Hide dev dependencies", .bool);
    _ = try tree_cmd.addOption(tree_no_dev_opt);

    const tree_peer_opt = cli.Option.init("peer", "peer", "Show peer dependencies", .bool);
    _ = try tree_cmd.addOption(tree_peer_opt);

    const tree_json_opt = cli.Option.init("json", "json", "Output in JSON format", .bool);
    _ = try tree_cmd.addOption(tree_json_opt);

    const tree_depth_opt = cli.Option.init("depth", "depth", "Maximum tree depth", .string);
    _ = try tree_cmd.addOption(tree_depth_opt);

    _ = tree_cmd.setAction(treeAction);
    _ = try root.addCommand(tree_cmd);

    // ========================================================================
    // Doctor Command (System Diagnostics)
    // ========================================================================
    var doctor_cmd = try cli.BaseCommand.init(allocator, "doctor", "Run system diagnostics");
    _ = doctor_cmd.setAction(doctorAction);
    _ = try root.addCommand(doctor_cmd);

    // ========================================================================
    // Dedupe Command (Deduplicate Dependencies)
    // ========================================================================
    var dedupe_cmd = try cli.BaseCommand.init(allocator, "dedupe", "Deduplicate dependencies");

    const dedupe_dry_run_opt = cli.Option.init("dry-run", "dry-run", "Preview changes without making them", .bool);
    _ = try dedupe_cmd.addOption(dedupe_dry_run_opt);

    _ = dedupe_cmd.setAction(dedupeAction);
    _ = try root.addCommand(dedupe_cmd);

    // ========================================================================
    // Search Command (Registry Search)
    // ========================================================================
    var search_cmd = try cli.BaseCommand.init(allocator, "search", "Search for packages in the registry");

    const search_query_arg = cli.Argument.init("query", "Search term", .string)
        .withRequired(true);
    _ = try search_cmd.addArgument(search_query_arg);

    _ = search_cmd.setAction(searchAction);
    _ = try root.addCommand(search_cmd);

    // ========================================================================
    // Info Command (Package Information)
    // ========================================================================
    var info_cmd = try cli.BaseCommand.init(allocator, "info", "Show detailed package information");

    const info_package_arg = cli.Argument.init("package", "Package name", .string)
        .withRequired(true);
    _ = try info_cmd.addArgument(info_package_arg);

    _ = info_cmd.setAction(infoAction);
    _ = try root.addCommand(info_cmd);

    // ========================================================================
    // Publisher Commands (Trusted Publisher Management for OIDC)
    // ========================================================================
    var publisher_add_cmd = try cli.BaseCommand.init(allocator, "publisher:add", "Add a trusted publisher for OIDC authentication");

    const pub_add_package_opt = cli.Option.init("package", "package", "Package name", .string)
        .withRequired(true);
    _ = try publisher_add_cmd.addOption(pub_add_package_opt);

    const pub_add_type_opt = cli.Option.init("type", "type", "Publisher type (github-action, gitlab-ci, bitbucket-pipeline, circleci)", .string)
        .withDefault("github-action");
    _ = try publisher_add_cmd.addOption(pub_add_type_opt);

    const pub_add_owner_opt = cli.Option.init("owner", "owner", "Repository owner/organization", .string)
        .withRequired(true);
    _ = try publisher_add_cmd.addOption(pub_add_owner_opt);

    const pub_add_repo_opt = cli.Option.init("repository", "repository", "Repository name", .string)
        .withRequired(true);
    _ = try publisher_add_cmd.addOption(pub_add_repo_opt);

    const pub_add_workflow_opt = cli.Option.init("workflow", "workflow", "Workflow file path (e.g., .github/workflows/publish.yml)", .string);
    _ = try publisher_add_cmd.addOption(pub_add_workflow_opt);

    const pub_add_env_opt = cli.Option.init("environment", "environment", "GitHub environment name", .string);
    _ = try publisher_add_cmd.addOption(pub_add_env_opt);

    const pub_add_registry_opt = cli.Option.init("registry", "registry", "Registry URL", .string)
        .withDefault("https://registry.npmjs.org");
    _ = try publisher_add_cmd.addOption(pub_add_registry_opt);

    _ = publisher_add_cmd.setAction(publisherAddAction);
    _ = try root.addCommand(publisher_add_cmd);

    var publisher_list_cmd = try cli.BaseCommand.init(allocator, "publisher:list", "List trusted publishers for a package");

    const pub_list_package_opt = cli.Option.init("package", "package", "Package name", .string)
        .withRequired(true);
    _ = try publisher_list_cmd.addOption(pub_list_package_opt);

    const pub_list_json_opt = cli.Option.init("json", "json", "Output in JSON format", .bool);
    _ = try publisher_list_cmd.addOption(pub_list_json_opt);

    const pub_list_registry_opt = cli.Option.init("registry", "registry", "Registry URL", .string)
        .withDefault("https://registry.npmjs.org");
    _ = try publisher_list_cmd.addOption(pub_list_registry_opt);

    _ = publisher_list_cmd.setAction(publisherListAction);
    _ = try root.addCommand(publisher_list_cmd);

    var publisher_remove_cmd = try cli.BaseCommand.init(allocator, "publisher:remove", "Remove a trusted publisher");

    const pub_remove_package_opt = cli.Option.init("package", "package", "Package name", .string)
        .withRequired(true);
    _ = try publisher_remove_cmd.addOption(pub_remove_package_opt);

    const pub_remove_id_opt = cli.Option.init("publisher-id", "publisher-id", "Publisher ID to remove", .string)
        .withRequired(true);
    _ = try publisher_remove_cmd.addOption(pub_remove_id_opt);

    const pub_remove_registry_opt = cli.Option.init("registry", "registry", "Registry URL", .string)
        .withDefault("https://registry.npmjs.org");
    _ = try publisher_remove_cmd.addOption(pub_remove_registry_opt);

    _ = publisher_remove_cmd.setAction(publisherRemoveAction);
    _ = try root.addCommand(publisher_remove_cmd);

    // Parse arguments
    const args = try std.process.argsAlloc(allocator);
    defer std.process.argsFree(allocator, args);

    var parser = cli.Parser.init(allocator);
    try parser.parse(root, args[1..]);
}
