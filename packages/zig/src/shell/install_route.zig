//! Who installs a project when the shell integration enters it (#204).
//!
//! The shell hooks only ever run `pantry install`, but `pantry install` in a
//! project pantry does not manage (a `package.json` with a `bun.lock`) hands
//! the whole job to that project's JS package manager. So `cd`-ing into any
//! JavaScript project ran a `bun install` the user never asked pantry for.
//!
//! The rule:
//!
//!   - the project has `pantry.lock` or a pantry dependency file
//!     (`deps.yaml`, `pantry.jsonc`, `pantry.config.ts`, ... — `markers`)
//!       -> the hook runs `pantry install`
//!   - otherwise (only `package.json`, `Cargo.toml`, `go.mod`, ...)
//!       -> the hook installs nothing; the project's own package manager owns
//!          it, and running it is the user's call. Activation is unaffected.
//!
//! The hooks ask through `pantry shell:route <dir>` (exit 0 = pantry), which
//! runs only on the rare path where a project has no environment yet, and
//! each hook memoises the answer, so no prompt pays for it twice.

const std = @import("std");
const io_helper = @import("../io_helper.zig");

pub const Route = enum {
    /// Run `pantry install`.
    pantry,
    /// Leave the project to its own package manager.
    project_package_manager,

    pub fn name(self: Route) []const u8 {
        return switch (self) {
            .pantry => "pantry",
            .project_package_manager => "project",
        };
    }
};

/// Files whose presence makes a directory a pantry-managed project. Every one
/// of them is read by `pantry install` itself, never delegated.
pub const markers = [_][]const u8{
    "pantry.lock",
    "pantry.json",
    "pantry.jsonc",
    "pantry.yaml",
    "pantry.yml",
    "deps.yaml",
    "deps.yml",
    "dependencies.yaml",
    "dependencies.yml",
    "pkgx.yaml",
    "pkgx.yml",
    "config/deps.ts",
    ".config/deps.ts",
    "pantry.config.ts",
    ".config/pantry.ts",
    "pantry.config.js",
};

pub fn isMarker(file: []const u8) bool {
    for (markers) |m| {
        if (std.mem.eql(u8, m, file)) return true;
    }
    return false;
}

/// The routing decision, given the project-relative files that exist. Pure.
pub fn decide(present: []const []const u8) Route {
    for (present) |file| {
        if (isMarker(file)) return .pantry;
    }
    return .project_package_manager;
}

/// The routing decision for a project directory on disk.
pub fn routeForDir(dir: []const u8) Route {
    var buf: [std.fs.max_path_bytes]u8 = undefined;
    for (markers) |m| {
        const full = std.fmt.bufPrint(&buf, "{s}/{s}", .{ dir, m }) catch continue;
        io_helper.accessAbsolute(full, .{}) catch continue;
        return .pantry;
    }
    return .project_package_manager;
}

// ============================================================================
// Tests
// ============================================================================

const testing = std.testing;

test "a pantry lockfile or dependency file routes to pantry install" {
    try testing.expectEqual(Route.pantry, decide(&.{"pantry.lock"}));
    try testing.expectEqual(Route.pantry, decide(&.{ "package.json", "bun.lock", "pantry.lock" }));
    try testing.expectEqual(Route.pantry, decide(&.{ "package.json", "deps.yaml" }));
    try testing.expectEqual(Route.pantry, decide(&.{"pantry.jsonc"}));
    try testing.expectEqual(Route.pantry, decide(&.{"config/deps.ts"}));
}

test "anything else is left to the project's own package manager" {
    try testing.expectEqual(Route.project_package_manager, decide(&.{}));
    try testing.expectEqual(Route.project_package_manager, decide(&.{ "package.json", "bun.lock" }));
    try testing.expectEqual(Route.project_package_manager, decide(&.{ "package.json", "package-lock.json" }));
    try testing.expectEqual(Route.project_package_manager, decide(&.{ "package.json", "pnpm-lock.yaml" }));
    try testing.expectEqual(Route.project_package_manager, decide(&.{ "Cargo.toml", "go.mod", "pyproject.toml", "composer.json" }));
}

test "routeForDir reads the directory" {
    var tmp = testing.tmpDir(.{});
    defer tmp.cleanup();
    var buf: [std.fs.max_path_bytes]u8 = undefined;
    const dir = buf[0..try tmp.dir.realPath(io_helper.io, &buf)];

    (try tmp.dir.createFile(io_helper.io, "package.json", .{})).close(io_helper.io);
    try testing.expectEqual(Route.project_package_manager, routeForDir(dir));
    (try tmp.dir.createFile(io_helper.io, "pantry.lock", .{})).close(io_helper.io);
    try testing.expectEqual(Route.pantry, routeForDir(dir));
}

// ── The emitted shellcode ───────────────────────────────────────────────────

const generator = @import("generator.zig");
const integration = @import("integration.zig");

const Fixture = struct {
    allocator: std.mem.Allocator,
    tmp: testing.TmpDir,
    root: []const u8,
    root_buf: [std.fs.max_path_bytes]u8 = undefined,

    fn init(allocator: std.mem.Allocator) !*Fixture {
        const f = try allocator.create(Fixture);
        f.* = .{ .allocator = allocator, .tmp = testing.tmpDir(.{}), .root = "" };
        f.root = f.root_buf[0..try f.tmp.dir.realPath(io_helper.io, &f.root_buf)];
        return f;
    }

    fn deinit(f: *Fixture) void {
        f.tmp.cleanup();
        f.allocator.destroy(f);
    }

    fn write(f: *Fixture, rel: []const u8, content: []const u8) !void {
        if (std.fs.path.dirname(rel)) |parent| {
            const full_parent = try std.fs.path.join(f.allocator, &.{ f.root, parent });
            defer f.allocator.free(full_parent);
            try io_helper.makePath(full_parent);
        }
        const file = try f.tmp.dir.createFile(io_helper.io, rel, .{});
        defer file.close(io_helper.io);
        try io_helper.writeAllToFile(file, content);
    }

    fn path(f: *Fixture, rel: []const u8) ![]u8 {
        return std.fs.path.join(f.allocator, &.{ f.root, rel });
    }
};

fn haveShell(allocator: std.mem.Allocator, shell: []const u8) bool {
    const found = io_helper.findExecutable(allocator, shell) catch return false;
    if (found) |p| {
        allocator.free(p);
        return true;
    }
    return false;
}

/// Run `<shell> -n <file>`; fails the test with the shell's complaint.
fn expectSyntaxOk(allocator: std.mem.Allocator, shell: []const u8, file: []const u8) !void {
    const res = try io_helper.childRun(allocator, &.{ shell, "-n", file });
    defer allocator.free(res.stdout);
    defer allocator.free(res.stderr);
    if (res.term != .exited or res.term.exited != 0) {
        std.debug.print("{s} -n rejected {s}:\n{s}\n", .{ shell, file, res.stderr });
        return error.ShellSyntaxError;
    }
}

fn generatedTemplate(allocator: std.mem.Allocator) ![]const u8 {
    var gen = generator.ShellCodeGenerator.init(allocator, .{});
    defer gen.deinit();
    return gen.generate();
}

test "emitted shellcode parses in bash and zsh; the den hook is POSIX sh" {
    const allocator = testing.allocator;
    const f = try Fixture.init(allocator);
    defer f.deinit();

    const template = try generatedTemplate(allocator);
    defer allocator.free(template);
    try f.write("pantry.sh", template);
    const template_path = try f.path("pantry.sh");
    defer allocator.free(template_path);

    try expectSyntaxOk(allocator, "bash", template_path);
    if (haveShell(allocator, "zsh")) try expectSyntaxOk(allocator, "zsh", template_path);

    // den's hook is written to den's POSIX surface, so a POSIX shell must
    // accept it too. dash is the strictest one commonly installed.
    const den_hook = try integration.generateHook(.den, allocator);
    defer allocator.free(den_hook);
    try f.write("den.sh", den_hook);
    const den_path = try f.path("den.sh");
    defer allocator.free(den_path);
    const posix = if (haveShell(allocator, "dash")) "dash" else "sh";
    try expectSyntaxOk(allocator, posix, den_path);

    if (haveShell(allocator, "fish")) {
        const fish_hook = try integration.generateHook(.fish, allocator);
        defer allocator.free(fish_hook);
        try f.write("hook.fish", fish_hook);
        const fish_path = try f.path("hook.fish");
        defer allocator.free(fish_path);
        try expectSyntaxOk(allocator, "fish", fish_path);
    }
}

test "every hook that auto-installs asks shell:route first" {
    const allocator = testing.allocator;
    const template = try generatedTemplate(allocator);
    defer allocator.free(template);

    const hooks = [_]integration.Shell{ .fish, .powershell, .den };
    var texts: [hooks.len + 1][]const u8 = undefined;
    texts[0] = template;
    for (hooks, 1..) |h, i| texts[i] = try integration.generateHook(h, allocator);
    defer for (texts[1..]) |t| allocator.free(t);

    for (texts) |text| {
        const route = std.mem.indexOf(u8, text, "pantry shell:route") orelse {
            std.debug.print("hook never consults shell:route:\n{s}\n", .{text[0..@min(text.len, 200)]});
            return error.RouteMissing;
        };
        // The route check must come before the hook's first `pantry install`.
        var search: usize = 0;
        while (std.mem.indexOfPos(u8, text, search, "pantry install")) |i| : (search = i + 1) {
            const line_start = if (std.mem.lastIndexOfScalar(u8, text[0..i], '\n')) |n| n + 1 else 0;
            const line = std.mem.trimStart(u8, text[line_start..i], " \t");
            if (line.len > 0 and line[0] == '#') continue; // comment
            if (std.mem.indexOfScalar(u8, line, '`') != null or std.mem.indexOfScalar(u8, line, '\'') != null or std.mem.indexOfScalar(u8, line, '"') != null) continue; // a message
            try testing.expect(route < i);
            break;
        }
        // No hook names a JS package manager's installer itself.
        for ([_][]const u8{ "bun install", "npm install", "pnpm install", "yarn install" }) |pm| {
            var s: usize = 0;
            while (std.mem.indexOfPos(u8, text, s, pm)) |i| : (s = i + 1) {
                const line_start = if (std.mem.lastIndexOfScalar(u8, text[0..i], '\n')) |n| n + 1 else 0;
                const line = std.mem.trimStart(u8, text[line_start..i], " \t");
                if (line.len > 0 and line[0] == '#') continue;
                std.debug.print("hook invokes {s}\n", .{pm});
                return error.HardcodedPackageManager;
            }
        }
    }
}

/// Source the bash/zsh template in `shell` with a stub `pantry` that logs its
/// argv, `cd` into each project, and return the log.
fn runTemplate(allocator: std.mem.Allocator, f: *Fixture, shell: []const u8) ![]u8 {
    const template = try generatedTemplate(allocator);
    defer allocator.free(template);
    try f.write("pantry.sh", template);

    // shell:lookup finds no environment, so every project reaches the
    // auto-install branch; shell:route mirrors routeForDir for two markers.
    try f.write("bin/pantry",
        \\#!/bin/sh
        \\echo "$*" >> "$PANTRY_STUB_LOG"
        \\case "$1" in
        \\  shell:lookup) exit 1 ;;
        \\  shell:route) { [ -f "$2/pantry.lock" ] || [ -f "$2/deps.yaml" ]; } && exit 0; exit 1 ;;
        \\esac
        \\exit 0
        \\
    );
    const stub = try f.path("bin/pantry");
    defer allocator.free(stub);
    const chmod = try io_helper.childRun(allocator, &.{ "chmod", "+x", stub });
    allocator.free(chmod.stdout);
    allocator.free(chmod.stderr);

    try f.write("js-only/package.json", "{}");
    try f.write("js-only/bun.lock", "");
    try f.write("pantry-proj/package.json", "{}");
    try f.write("pantry-proj/pantry.lock", "{}");
    try f.write("yaml-proj/deps.yaml", "dependencies:\n  bun.sh: 1\n");

    const script =
        \\export HOME="$ROOT/home" PATH="$ROOT/bin:$PATH" PANTRY_STUB_LOG="$ROOT/log" PANTRY_QUIET=1
        \\mkdir -p "$HOME"; : > "$PANTRY_STUB_LOG"
        \\. "$ROOT/pantry.sh"
        \\for p in js-only pantry-proj yaml-proj js-only; do cd "$ROOT/$p" && __pantry_switch_environment; cd "$ROOT"; __pantry_switch_environment; done
        \\cat "$PANTRY_STUB_LOG"
    ;
    const env_script = try std.fmt.allocPrint(allocator, "ROOT='{s}'\n{s}", .{ f.root, script });
    defer allocator.free(env_script);
    const res = try io_helper.childRun(allocator, &.{ shell, "-c", env_script });
    defer allocator.free(res.stderr);
    errdefer allocator.free(res.stdout);
    if (res.term != .exited or res.term.exited != 0) {
        std.debug.print("{s} run failed:\n{s}\n", .{ shell, res.stderr });
        return error.ShellRunFailed;
    }
    return res.stdout;
}

fn countLines(haystack: []const u8, needle: []const u8) usize {
    var n: usize = 0;
    var it = std.mem.splitScalar(u8, haystack, '\n');
    while (it.next()) |line| {
        if (std.mem.eql(u8, line, needle)) n += 1;
    }
    return n;
}

fn expectRouting(allocator: std.mem.Allocator, shell: []const u8) !void {
    const f = try Fixture.init(allocator);
    defer f.deinit();
    const log = try runTemplate(allocator, f, shell);
    defer allocator.free(log);

    // Two pantry projects installed, the JS-only project never; and its
    // route answer is memoised, so the second visit does not ask again.
    try testing.expectEqual(@as(usize, 2), countLines(log, "install"));
    var route_js: usize = 0;
    var it = std.mem.splitScalar(u8, log, '\n');
    while (it.next()) |line| {
        if (std.mem.startsWith(u8, line, "shell:route ") and std.mem.endsWith(u8, line, "/js-only")) route_js += 1;
    }
    try testing.expectEqual(@as(usize, 1), route_js);
}

test "bash: cd runs pantry install only in pantry projects" {
    try expectRouting(testing.allocator, "bash");
}

test "zsh: cd runs pantry install only in pantry projects" {
    if (!haveShell(testing.allocator, "zsh")) return error.SkipZigTest;
    try expectRouting(testing.allocator, "zsh");
}

test "den: cd runs pantry install only in pantry projects" {
    const allocator = testing.allocator;
    if (!haveShell(allocator, "den")) return error.SkipZigTest;
    const f = try Fixture.init(allocator);
    defer f.deinit();

    const hook = try integration.generateHook(.den, allocator);
    defer allocator.free(hook);
    try f.write("hook.sh", hook);
    // den's auto-install path is "lookup found a project, but it has no bin
    // dir to activate", so the stub reports a project with an empty env.
    try f.write("bin/pantry",
        \\#!/bin/sh
        \\echo "$*" >> "$PANTRY_STUB_LOG"
        \\case "$1" in
        \\  shell:lookup) echo "/nonexistent-env|$2"; exit 0 ;;
        \\  shell:route) { [ -f "$2/pantry.lock" ] || [ -f "$2/deps.yaml" ]; } && exit 0; exit 1 ;;
        \\esac
        \\exit 0
        \\
    );
    const stub = try f.path("bin/pantry");
    defer allocator.free(stub);
    const chmod = try io_helper.childRun(allocator, &.{ "chmod", "+x", stub });
    allocator.free(chmod.stdout);
    allocator.free(chmod.stderr);
    try f.write("js-only/package.json", "{}");
    try f.write("pantry-proj/pantry.lock", "{}");
    try f.write("home/.keep", "");

    // Isolate HOME as well as PATH: the hook prepends HOME's global pantry
    // bin directory, which would otherwise shadow this fixture's stub.
    // Clear the inherited opt-out so the test exercises auto-install.
    const script = try std.fmt.allocPrint(allocator,
        \\HOME="{0s}/home"
        \\export HOME
        \\PATH="{0s}/bin:$PATH"
        \\export PATH
        \\PANTRY_STUB_LOG="{0s}/log"
        \\export PANTRY_STUB_LOG
        \\PANTRY_QUIET=1
        \\export PANTRY_QUIET
        \\unset PANTRY_NO_AUTO_INSTALL
        \\source "{0s}/hook.sh"
        \\cd "{0s}/js-only"
        \\__pantry_switch
        \\cd "{0s}/pantry-proj"
        \\__pantry_switch
        \\
    , .{f.root});
    defer allocator.free(script);
    try f.write("run.sh", script);
    try f.write("log", "");
    const run_path = try f.path("run.sh");
    defer allocator.free(run_path);
    const res = try io_helper.childRun(allocator, &.{ "den", "--norc", run_path });
    defer allocator.free(res.stdout);
    defer allocator.free(res.stderr);
    if (res.term != .exited or res.term.exited != 0) {
        std.debug.print("den rejected routing fixture:\n{s}\n{s}\n", .{ res.stdout, res.stderr });
        return error.ShellRoutingError;
    }

    const log_path = try f.path("log");
    defer allocator.free(log_path);
    const log = try io_helper.readFileAlloc(allocator, log_path, 1024 * 1024);
    defer allocator.free(log);
    if (countLines(log, "install") != 1) {
        std.debug.print("den routing log:\n{s}\nstdout:\n{s}\nstderr:\n{s}\n", .{ log, res.stdout, res.stderr });
    }
    try testing.expectEqual(@as(usize, 1), countLines(log, "install"));
    // The JS-only project was routed away before any install ran.
    try testing.expect(std.mem.indexOf(u8, log, "/js-only\ninstall") == null);
}
