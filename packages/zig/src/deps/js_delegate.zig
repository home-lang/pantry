const std = @import("std");
const io_helper = @import("../io_helper.zig");
const style = @import("../cli/style.zig");
const LinkerMode = @import("../config/pantry_config.zig").LinkerMode;

/// Delegate JS dependency installation to bun/pnpm/yarn/npm when a package.json
/// with JS deps is present alongside pantry's own system-dep file.
///
/// Mirrors `composer_delegate.installPhpDeps` for the JS ecosystem. Pantry
/// installs the runtime (node/bun) via its own pipeline and then hands off to
/// the appropriate JS package manager — it does not try to be a node_modules
/// resolver itself.
///
/// Returns true when delegation actually ran a successful install and false
/// when there was nothing to do. A selected package manager that cannot run or
/// exits unsuccessfully is an install error; callers must not report success
/// with an incomplete node_modules tree.
pub fn installJsDeps(allocator: std.mem.Allocator, project_dir: []const u8, verbose: bool, linker: ?LinkerMode) !bool {
    return installJsDepsWithPolicy(allocator, project_dir, verbose, linker, false);
}

pub fn installJsDepsWithPolicy(allocator: std.mem.Allocator, project_dir: []const u8, verbose: bool, linker: ?LinkerMode, frozen: bool) !bool {
    const package_json_path = try std.fs.path.join(allocator, &.{ project_dir, "package.json" });
    defer allocator.free(package_json_path);

    const content = io_helper.readFileAlloc(allocator, package_json_path, 4 * 1024 * 1024) catch return false;
    defer allocator.free(content);

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch return false;
    defer parsed.deinit();

    if (parsed.value != .object) return false;

    if (!hasJsDeps(parsed.value.object)) return false;

    // Fast no-op: if node_modules/ exists and is newer than package.json and
    // any lockfile, JS deps are already in sync and we can skip without ever
    // spawning the PM. Matches composer_delegate's "vendor + lock" check.
    if (try isUpToDate(allocator, project_dir, package_json_path, parsed.value.object)) {
        if (verbose) style.print("{s}  JS deps up to date{s}\n", .{ style.dim, style.reset });
        return false;
    }

    const pm = pickPackageManager(project_dir, parsed.value.object);

    const bin_owned = try resolveBin(allocator, project_dir, pm);
    const bin = bin_owned orelse {
        style.printWarn("Cannot install JS dependencies: '{s}' was not found (declare it in Pantry or add it to PATH)\n", .{pm});
        return error.JsPackageManagerNotFound;
    };
    defer allocator.free(bin);

    // Build a sh -c command that prepends <project>/pantry/.bin to PATH so the
    // JS PM can find node and its own helper bins even when the user invoked
    // `pantry install` from a shell where PATH doesn't include pantry/.bin yet.
    // Mirrors the lifecycle.zig PATH-wrapping pattern.
    const wrapped_cmd = try buildWrappedCommandWithPolicy(allocator, project_dir, bin, pm, linker, frozen);
    defer allocator.free(wrapped_cmd);

    style.print("{s}  Installing JS deps via {s}{s}\n", .{ style.dim, pm, style.reset });

    // When our stdout carries machine-consumed output (`pantry shell:activate`
    // is eval'd, `pantry env` likewise), the PM child must not inherit it —
    // bun/npm progress lines would corrupt the emitted shell code. Route the
    // child's stdout to stderr alongside our own diagnostics.
    const exec_cmd = if (style.isDiagnosticsToStderr())
        try std.fmt.allocPrint(allocator, "{{ {s} ; }} 1>&2", .{wrapped_cmd})
    else
        try allocator.dupe(u8, wrapped_cmd);
    defer allocator.free(exec_cmd);

    const term = io_helper.spawnAndWait(.{
        .argv = &[_][]const u8{ "sh", "-c", exec_cmd },
        .cwd = io_helper.toCwd(project_dir),
    }) catch |err| {
        style.printWarn("{s} install failed to spawn: {}\n", .{ pm, err });
        return error.JsInstallSpawnFailed;
    };

    switch (term) {
        .exited => |code| {
            if (code != 0) {
                style.printWarn("{s} install exited with code {d}\n", .{ pm, code });
                return error.JsInstallFailed;
            }
        },
        else => {
            style.printWarn("{s} install terminated abnormally\n", .{pm});
            return error.JsInstallFailed;
        },
    }

    writeMarker(allocator, project_dir);
    return true;
}

/// Marker file we write after a successful delegate run. We use it (not the
/// JS PM's own lockfile) for the staleness check because some PMs don't
/// touch the lockfile on a no-op install — that would cause every subsequent
/// `pantry install` after a `touch package.json` to needlessly re-spawn bun.
const marker_relpath = "node_modules/.pantry-js-installed";

/// JS lockfiles the delegated package manager reads. Any of them changing -
/// typically through `git pull` - means node_modules may no longer match.
const js_lockfiles = [_][]const u8{ "bun.lock", "bun.lockb", "package-lock.json", "yarn.lock", "pnpm-lock.yaml" };

/// JS deps are considered up to date when our marker file exists and is at
/// least as new as every input the package manager resolves from: the root
/// package.json, whichever JS lockfile exists, and every workspace member's
/// package.json.
///
/// The lockfile is an INPUT here, never the marker: a no-op install may not
/// touch it, so it cannot record that an install happened - but a lockfile
/// newer than our last install (a pull that bumped bun.lock while package.json
/// stayed put) must re-run the install, or node_modules keeps the old tree
/// while the lockfile names the new one (stacksjs/stacks#2848).
///
/// We can't stat node_modules itself for mtime (io_helper.statFile returns 0
/// for directories), hence the marker file.
fn isUpToDate(allocator: std.mem.Allocator, project_dir: []const u8, package_json_path: []const u8, package_json: std.json.ObjectMap) !bool {
    const marker = try std.fs.path.join(allocator, &.{ project_dir, marker_relpath });
    defer allocator.free(marker);

    const marker_stat = io_helper.statFile(marker) catch return false;
    const marker_mtime = marker_stat.mtime;

    const pkg_stat = io_helper.statFile(package_json_path) catch return false;
    if (pkg_stat.mtime > marker_mtime) return false;

    for (js_lockfiles) |lockfile| {
        const lock_path = try std.fs.path.join(allocator, &.{ project_dir, lockfile });
        defer allocator.free(lock_path);
        const lock_stat = io_helper.statFile(lock_path) catch continue;
        if (lock_stat.mtime > marker_mtime) return false;
    }

    return workspaceManifestsOlderThan(allocator, project_dir, package_json, marker_mtime);
}

/// Every workspace member's package.json is no newer than `mtime`. Members
/// come from the root package.json's `workspaces` (array, or `{ packages }`),
/// expanded by the same discovery `pantry install` uses for workspaces. When
/// discovery fails we cannot vouch for the tree, so report stale: a needless
/// no-op install is cheap, a stale node_modules is not.
fn workspaceManifestsOlderThan(allocator: std.mem.Allocator, project_dir: []const u8, package_json: std.json.ObjectMap, mtime: i128) bool {
    var patterns = std.ArrayList([]const u8).empty;
    defer patterns.deinit(allocator);
    collectWorkspacePatterns(allocator, package_json, &patterns) catch return false;
    if (patterns.items.len == 0) return true;

    const workspace_discovery = @import("../packages/workspace.zig");
    const members = workspace_discovery.discoverMembers(allocator, project_dir, patterns.items) catch return false;
    defer {
        for (members) |*member| member.deinit(allocator);
        allocator.free(members);
    }

    for (members) |member| {
        const manifest = std.fs.path.join(allocator, &.{ member.abs_path, "package.json" }) catch return false;
        defer allocator.free(manifest);
        const stat = io_helper.statFile(manifest) catch continue;
        if (stat.mtime > mtime) return false;
    }
    return true;
}

/// Workspace globs from package.json: `"workspaces": [...]` or
/// `"workspaces": { "packages": [...] }`. Negated globs (`!pkg`) are skipped;
/// checking an excluded member too only errs toward a reinstall. The strings
/// borrow from `package_json`.
fn collectWorkspacePatterns(allocator: std.mem.Allocator, package_json: std.json.ObjectMap, out: *std.ArrayList([]const u8)) !void {
    const workspaces = package_json.get("workspaces") orelse return;
    const list = switch (workspaces) {
        .array => |arr| arr,
        .object => |obj| blk: {
            const pkgs = obj.get("packages") orelse return;
            if (pkgs != .array) return;
            break :blk pkgs.array;
        },
        else => return,
    };
    for (list.items) |item| {
        if (item != .string or item.string.len == 0) continue;
        if (item.string[0] == '!') continue;
        try out.append(allocator, item.string);
    }
}

fn writeMarker(allocator: std.mem.Allocator, project_dir: []const u8) void {
    const marker = std.fs.path.join(allocator, &.{ project_dir, marker_relpath }) catch return;
    defer allocator.free(marker);
    const file = io_helper.createFile(marker, .{}) catch return;
    defer file.close(io_helper.io);
}

fn hasJsDeps(obj: std.json.ObjectMap) bool {
    // A JS workspace can declare every external dependency in its members.
    // The manager still owns member links and the complete locked graph.
    if (@import("js_workspace.zig").hasWorkspacePatterns(obj)) return true;
    const sections = [_][]const u8{ "dependencies", "devDependencies", "optionalDependencies" };
    for (sections) |section| {
        if (obj.get(section)) |val| {
            if (val != .object) continue;
            var it = val.object.iterator();
            while (it.next()) |entry| {
                // Domain-style names (ziglang.org, bun.sh, nodejs.org) are pantry
                // *system* deps, not npm packages — they live in package.json only
                // so one file can express both. They must NOT reach `bun install`:
                // bun tries to npm-resolve `ziglang.org` and 404s. A package.json
                // whose deps are ALL system deps has no real JS work, so we must
                // not spawn a package manager at all. (Same '.'-means-domain rule
                // the rest of pantry uses to route system vs. JS deps.)
                if (std.mem.indexOfScalar(u8, entry.key_ptr.*, '.') == null) return true;
            }
        }
    }
    return false;
}

/// Pick a JS package manager. Priority:
///   1. Lockfile heuristic (most reliable)
///   2. `packageManager` field in package.json
///   3. Default to bun
fn pickPackageManager(project_dir: []const u8, obj: std.json.ObjectMap) []const u8 {
    const lockfile_map = [_]struct { lock: []const u8, pm: []const u8 }{
        .{ .lock = "bun.lock", .pm = "bun" },
        .{ .lock = "bun.lockb", .pm = "bun" },
        .{ .lock = "pnpm-lock.yaml", .pm = "pnpm" },
        .{ .lock = "yarn.lock", .pm = "yarn" },
        .{ .lock = "package-lock.json", .pm = "npm" },
    };
    for (lockfile_map) |entry| {
        var path_buf: [std.fs.max_path_bytes]u8 = undefined;
        const full = std.fmt.bufPrint(&path_buf, "{s}/{s}", .{ project_dir, entry.lock }) catch continue;
        io_helper.accessAbsolute(full, .{}) catch continue;
        return entry.pm;
    }

    if (obj.get("packageManager")) |val| {
        if (val == .string) {
            const s = val.string;
            const at_pos = std.mem.indexOfScalar(u8, s, '@') orelse s.len;
            const name = s[0..at_pos];
            const known = [_][]const u8{ "bun", "pnpm", "yarn", "npm" };
            for (known) |k| {
                if (std.mem.eql(u8, name, k)) return k;
            }
        }
    }

    return "bun";
}

/// Resolve the absolute path to a JS package manager binary. Prefers the
/// project's own `pantry/.bin/<name>` (installed by `pantry install`) so we
/// pick up the user-declared version, then falls back to PATH.
fn resolveBin(allocator: std.mem.Allocator, project_dir: []const u8, name: []const u8) !?[]const u8 {
    const local = try std.fs.path.join(allocator, &.{ project_dir, "pantry", ".bin", name });
    if (io_helper.accessAbsolute(local, .{})) |_| {
        return local;
    } else |_| {
        allocator.free(local);
    }

    return io_helper.findExecutable(allocator, name) catch null;
}

/// Build `export PATH='<pantry/.bin>:<old PATH>' && <bin> install` so the child
/// process — and any lifecycle scripts it spawns — can find node/bun without
/// requiring the user to have manually activated pantry's env.
///
/// `linker` is forwarded to Bun ONLY when the project actually configured one
/// in `pantry.toml` (or passed `--linker`). Forwarding pantry's own default
/// meant every delegated `bun install` ran `--linker isolated`, which
/// overrides the project's `bunfig.toml` and relays out an already-hoisted
/// node_modules — breaking any import that relied on hoisting. When nothing
/// is configured here, bun reads its own config, which is the correct owner
/// of that decision.
fn buildWrappedCommand(allocator: std.mem.Allocator, project_dir: []const u8, bin: []const u8, pm: []const u8, linker: ?LinkerMode) ![]u8 {
    return buildWrappedCommandWithPolicy(allocator, project_dir, bin, pm, linker, false);
}

fn buildWrappedCommandWithPolicy(allocator: std.mem.Allocator, project_dir: []const u8, bin: []const u8, pm: []const u8, linker: ?LinkerMode, frozen: bool) ![]u8 {
    const current_path = io_helper.getenv("PATH") orelse "/usr/local/bin:/usr/bin:/bin";

    const path_val = try std.fmt.allocPrint(allocator, "{s}/pantry/.bin:{s}", .{ project_dir, current_path });
    defer allocator.free(path_val);

    var escaped_path = std.ArrayList(u8).empty;
    defer escaped_path.deinit(allocator);
    for (path_val) |ch| {
        if (ch == '\'') {
            try escaped_path.appendSlice(allocator, "'\\''");
        } else {
            try escaped_path.append(allocator, ch);
        }
    }

    const command = if (frozen and std.mem.eql(u8, pm, "npm")) "ci" else "install";
    const freeze_flag = if (frozen and !std.mem.eql(u8, pm, "npm")) " --frozen-lockfile" else "";
    if (std.mem.eql(u8, pm, "bun")) {
        if (linker) |mode| {
            return try std.fmt.allocPrint(allocator, "export PATH='{s}' && '{s}' {s} --linker {s}{s}", .{ escaped_path.items, bin, command, @tagName(mode), freeze_flag });
        }
    }

    return try std.fmt.allocPrint(allocator, "export PATH='{s}' && '{s}' {s}{s}", .{ escaped_path.items, bin, command, freeze_flag });
}

test "frozen delegation uses each selected manager's lock enforcement" {
    const allocator = std.testing.allocator;
    for ([_][]const u8{ "bun", "pnpm", "yarn", "npm" }) |pm| {
        const command = try buildWrappedCommandWithPolicy(allocator, "/tmp/project", "/usr/bin/manager", pm, null, true);
        defer allocator.free(command);
        try std.testing.expect(std.mem.endsWith(u8, command, if (std.mem.eql(u8, pm, "npm")) " ci" else " install --frozen-lockfile"));
    }
}

test "JS delegate forwards Pantry's linker mode to Bun when one is configured" {
    const allocator = std.testing.allocator;
    const command = try buildWrappedCommand(allocator, "/tmp/pantry-project", "/usr/bin/bun", "bun", .hoisted);
    defer allocator.free(command);

    try std.testing.expect(std.mem.endsWith(u8, command, "'/usr/bin/bun' install --linker hoisted"));
}

test "JS delegate leaves Bun's own linker config alone when none is configured" {
    const allocator = std.testing.allocator;
    const command = try buildWrappedCommand(allocator, "/tmp/pantry-project", "/usr/bin/bun", "bun", null);
    defer allocator.free(command);

    try std.testing.expect(std.mem.endsWith(u8, command, "'/usr/bin/bun' install"));
    try std.testing.expect(std.mem.indexOf(u8, command, "--linker") == null);
}

test "JS delegate leaves other package managers' install arguments unchanged" {
    const allocator = std.testing.allocator;
    const command = try buildWrappedCommand(allocator, "/tmp/pantry-project", "/usr/bin/npm", "npm", .isolated);
    defer allocator.free(command);

    try std.testing.expect(std.mem.endsWith(u8, command, "'/usr/bin/npm' install"));
}

test "JS delegate propagates package manager failure without writing marker" {
    if (comptime @import("builtin").os.tag == .windows) return;

    const allocator = std.testing.allocator;
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const path_len = try tmp_dir.dir.realPath(io_helper.io, &path_buf);
    const project_dir = path_buf[0..path_len];

    try tmp_dir.dir.writeFile(io_helper.io, .{
        .sub_path = "package.json",
        .data = "{\"dependencies\":{\"left-pad\":\"1.3.0\"}}",
    });
    try tmp_dir.dir.writeFile(io_helper.io, .{
        .sub_path = "package-lock.json",
        .data = "{}",
    });
    try tmp_dir.dir.createDirPath(io_helper.io, "pantry/.bin");
    const fake_npm = try tmp_dir.dir.createFile(io_helper.io, "pantry/.bin/npm", .{});
    try fake_npm.writeStreamingAll(io_helper.io, "#!/bin/sh\nexit 42\n");
    fake_npm.close(io_helper.io);
    const fake_npm_path = try std.fs.path.join(allocator, &.{ project_dir, "pantry/.bin/npm" });
    defer allocator.free(fake_npm_path);
    var chmod_buf: [std.fs.max_path_bytes:0]u8 = undefined;
    @memcpy(chmod_buf[0..fake_npm_path.len], fake_npm_path);
    chmod_buf[fake_npm_path.len] = 0;
    try std.testing.expect(std.c.chmod(&chmod_buf, 0o755) == 0);

    try std.testing.expectError(
        error.JsInstallFailed,
        installJsDeps(allocator, project_dir, false, .hoisted),
    );

    const marker = try std.fs.path.join(allocator, &.{ project_dir, marker_relpath });
    defer allocator.free(marker);
    try std.testing.expectError(error.FileNotFound, io_helper.accessAbsolute(marker, .{}));
}

/// Test helper: set a file's mtime to `seconds` past the epoch.
fn setMtimeForTest(dir: std.Io.Dir, sub_path: []const u8, seconds: i64) !void {
    try dir.setTimestamps(io_helper.io, sub_path, .{
        .modify_timestamp = .{ .new = .{ .nanoseconds = @as(i96, seconds) * std.time.ns_per_s } },
    });
}

/// Test helper: a project with a package.json, its marker, and whatever
/// extra files the case needs, every file at a controlled mtime.
const StalenessFixture = struct {
    tmp: std.testing.TmpDir,
    path_buf: [std.fs.max_path_bytes]u8 = undefined,
    path_len: usize = 0,

    fn init(package_json: []const u8) !StalenessFixture {
        var fixture = StalenessFixture{ .tmp = std.testing.tmpDir(.{}) };
        errdefer fixture.tmp.cleanup();
        fixture.path_len = try fixture.tmp.dir.realPath(io_helper.io, &fixture.path_buf);
        try fixture.write("package.json", package_json, 1_000);
        try fixture.tmp.dir.createDirPath(io_helper.io, "node_modules");
        try fixture.write(marker_relpath, "", 2_000);
        return fixture;
    }

    fn deinit(self: *StalenessFixture) void {
        self.tmp.cleanup();
    }

    fn dir(self: *StalenessFixture) []const u8 {
        return self.path_buf[0..self.path_len];
    }

    fn write(self: *StalenessFixture, sub_path: []const u8, data: []const u8, mtime: i64) !void {
        if (std.fs.path.dirname(sub_path)) |parent| try self.tmp.dir.createDirPath(io_helper.io, parent);
        try self.tmp.dir.writeFile(io_helper.io, .{ .sub_path = sub_path, .data = data });
        try setMtimeForTest(self.tmp.dir, sub_path, mtime);
    }

    fn upToDate(self: *StalenessFixture) !bool {
        const allocator = std.testing.allocator;
        const package_json_path = try std.fs.path.join(allocator, &.{ self.dir(), "package.json" });
        defer allocator.free(package_json_path);
        const content = try io_helper.readFileAlloc(allocator, package_json_path, 1024 * 1024);
        defer allocator.free(content);
        const parsed = try std.json.parseFromSlice(std.json.Value, allocator, content, .{});
        defer parsed.deinit();
        return isUpToDate(allocator, self.dir(), package_json_path, parsed.value.object);
    }
};

test "JS deps are up to date when the marker is newer than every input" {
    var fixture = try StalenessFixture.init("{\"dependencies\":{\"left-pad\":\"1.3.0\"}}");
    defer fixture.deinit();
    try fixture.write("bun.lock", "{}", 1_500);
    try std.testing.expect(try fixture.upToDate());
}

test "JS deps are stale when package.json is newer than the marker" {
    var fixture = try StalenessFixture.init("{\"dependencies\":{\"left-pad\":\"1.3.0\"}}");
    defer fixture.deinit();
    try setMtimeForTest(fixture.tmp.dir, "package.json", 3_000);
    try std.testing.expect(!try fixture.upToDate());
}

test "JS deps are stale when a pulled lockfile is newer than the marker" {
    // stacksjs/stacks#2848: `git pull` brought a new bun.lock (better-dx
    // 0.2.25 -> 0.2.26) without touching package.json, and node_modules kept
    // the old version because only package.json was compared.
    const lockfiles = [_][]const u8{ "bun.lock", "bun.lockb", "package-lock.json", "yarn.lock", "pnpm-lock.yaml" };
    for (lockfiles) |lockfile| {
        var fixture = try StalenessFixture.init("{\"dependencies\":{\"left-pad\":\"1.3.0\"}}");
        defer fixture.deinit();
        try fixture.write(lockfile, "{}", 3_000);
        if (try fixture.upToDate()) {
            std.debug.print("lockfile {s} newer than the marker was ignored\n", .{lockfile});
            return error.TestUnexpectedResult;
        }
    }
}

test "JS deps are stale when a workspace member's package.json is newer than the marker" {
    var fixture = try StalenessFixture.init(
        \\{"workspaces":["storage/framework","storage/framework/core/*"],"devDependencies":{"better-dx":"^0.2.24"}}
    );
    defer fixture.deinit();
    try fixture.write("storage/framework/package.json", "{\"name\":\"framework\"}", 1_000);
    try fixture.write("storage/framework/core/actions/package.json", "{\"name\":\"@stacksjs/actions\"}", 1_000);
    try fixture.write("storage/framework/core/router/package.json", "{\"name\":\"@stacksjs/router\"}", 1_000);
    try std.testing.expect(try fixture.upToDate());

    try setMtimeForTest(fixture.tmp.dir, "storage/framework/core/router/package.json", 3_000);
    try std.testing.expect(!try fixture.upToDate());

    try setMtimeForTest(fixture.tmp.dir, "storage/framework/core/router/package.json", 1_000);
    try setMtimeForTest(fixture.tmp.dir, "storage/framework/package.json", 3_000);
    try std.testing.expect(!try fixture.upToDate());
}

test "JS deps staleness reads the {packages: [...]} workspaces form" {
    var fixture = try StalenessFixture.init(
        \\{"workspaces":{"packages":["packages/*"],"nohoist":["**/x"]},"dependencies":{"left-pad":"1.3.0"}}
    );
    defer fixture.deinit();
    try fixture.write("packages/a/package.json", "{\"name\":\"a\"}", 1_000);
    try std.testing.expect(try fixture.upToDate());
    try setMtimeForTest(fixture.tmp.dir, "packages/a/package.json", 3_000);
    try std.testing.expect(!try fixture.upToDate());
}
