//! Desktop apps & fonts from deps.yaml (macOS)
//!
//! Lets a project's `deps.yaml` declare GUI applications and fonts alongside its
//! command-line `dependencies:`, so a single `pantry install` provisions the
//! whole machine. Apps are installed via Homebrew casks (`brew install --cask`)
//! or the Mac App Store (`mas install`); fonts via Homebrew font casks.
//!
//! deps.yaml shape (all top-level keys, sibling to `dependencies:`):
//!
//!   apps:
//!     - cursor                              # bare slug → cask of the same name
//!     - { cask: ghostty }                   # explicit Homebrew cask
//!     - { mas: "1147396723", name: WhatsApp }  # Mac App Store id
//!   fonts:
//!     - font-inter                          # Homebrew font cask
//!     - meslo-lg-nerd-font                  # "font-" prefix added if missing
//!
//! This is a no-op on non-macOS targets. Installs are idempotent: a per-project
//! marker file records what has already been installed so repeat runs (and the
//! auto-install triggered on `cd`) don't re-invoke brew/mas for every entry.

const std = @import("std");
const builtin = @import("builtin");
const io_helper = @import("../io_helper.zig");
const lib = @import("../lib.zig");
const style = @import("../cli/style.zig");

const deps_parser = @import("../deps/parser.zig");

pub const AppSource = enum { cask, mas };

pub const App = struct {
    source: AppSource,
    /// For .cask: the Homebrew cask token. For .mas: the App Store numeric id.
    id: []const u8,
    /// Human-facing name for output (mas display name, or the cask token).
    name: []const u8,

    pub fn deinit(self: *App, allocator: std.mem.Allocator) void {
        allocator.free(self.id);
        allocator.free(self.name);
    }
};

pub const Font = struct {
    /// Homebrew font cask token (always carries the "font-" prefix).
    cask: []const u8,

    pub fn deinit(self: *Font, allocator: std.mem.Allocator) void {
        allocator.free(self.cask);
    }
};

// ── Scalar helpers (mirror deps/parser.zig's YAML scalar handling) ───────────

fn stripInlineComment(value: []const u8) []const u8 {
    if (value.len == 0) return value;
    if (value[0] == '#') return "";
    var i: usize = 1;
    while (i < value.len) : (i += 1) {
        if (value[i] == '#' and (value[i - 1] == ' ' or value[i - 1] == '\t')) {
            return std.mem.trimEnd(u8, value[0..i], " \t");
        }
    }
    return value;
}

fn stripQuotes(value: []const u8) []const u8 {
    if (value.len >= 2 and value[0] == '"' and value[value.len - 1] == '"') {
        return value[1 .. value.len - 1];
    }
    if (value.len >= 2 and value[0] == '\'' and value[value.len - 1] == '\'') {
        return value[1 .. value.len - 1];
    }
    return value;
}

fn scalar(value: []const u8) []const u8 {
    return std.mem.trim(u8, stripQuotes(std.mem.trim(u8, stripInlineComment(value), " \t")), " \t");
}

/// Number of leading-space indent columns (tabs count as 2).
fn indentOf(line: []const u8) usize {
    var n: usize = 0;
    for (line) |c| {
        if (c == ' ') n += 1 else if (c == '\t') n += 2 else break;
    }
    return n;
}

/// Look up a key in an inline flow map body like `cask: ghostty, name: My App`.
/// Returns the (comment/quote-stripped) value for `key`, or null.
fn flowMapGet(body: []const u8, key: []const u8) ?[]const u8 {
    var it = std.mem.tokenizeScalar(u8, body, ',');
    while (it.next()) |pair| {
        const colon = std.mem.indexOfScalar(u8, pair, ':') orelse continue;
        const k = std.mem.trim(u8, pair[0..colon], " \t");
        if (std.mem.eql(u8, k, key)) {
            return scalar(pair[colon + 1 ..]);
        }
    }
    return null;
}

/// Generic: collect the raw `- ...` item bodies of a top-level YAML sequence
/// named `section` (e.g. "apps" / "fonts"). Item text has the leading "- "
/// removed and inline comments stripped, but is otherwise unparsed.
fn collectSequenceItems(
    allocator: std.mem.Allocator,
    content: []const u8,
    section: []const u8,
) ![][]const u8 {
    var items = try std.ArrayList([]const u8).initCapacity(allocator, 8);
    errdefer {
        for (items.items) |it| allocator.free(it);
        items.deinit(allocator);
    }

    var lines = std.mem.tokenizeScalar(u8, content, '\n');
    var in_section = false;
    while (lines.next()) |line| {
        const trimmed = std.mem.trim(u8, line, " \t\r");
        if (trimmed.len == 0 or trimmed[0] == '#') continue;

        if (!in_section) {
            // Enter when we hit a top-level (indent 0) `section:` header.
            if (indentOf(line) == 0 and std.mem.startsWith(u8, trimmed, section) and
                trimmed.len > section.len and trimmed[section.len] == ':')
            {
                in_section = true;
            }
            continue;
        }

        // A new top-level key (indent 0, not a list item) ends the section.
        if (indentOf(line) == 0 and trimmed[0] != '-') break;

        if (trimmed[0] != '-') continue; // ignore stray nested lines
        const body = scalar(std.mem.trim(u8, trimmed[1..], " \t"));
        if (body.len == 0) continue;
        try items.append(allocator, try allocator.dupe(u8, body));
    }

    return items.toOwnedSlice(allocator);
}

/// Parse the `apps:` section. Caller owns the returned slice and each App.
pub fn parseApps(allocator: std.mem.Allocator, content: []const u8) ![]App {
    const raw = try collectSequenceItems(allocator, content, "apps");
    defer {
        for (raw) |it| allocator.free(it);
        allocator.free(raw);
    }

    var apps = try std.ArrayList(App).initCapacity(allocator, raw.len);
    errdefer {
        for (apps.items) |*a| a.deinit(allocator);
        apps.deinit(allocator);
    }

    for (raw) |item| {
        if (item.len >= 2 and item[0] == '{' and item[item.len - 1] == '}') {
            const body = std.mem.trim(u8, item[1 .. item.len - 1], " \t");
            if (flowMapGet(body, "mas")) |mas_id| {
                if (mas_id.len == 0) continue;
                const display = flowMapGet(body, "name") orelse mas_id;
                try apps.append(allocator, .{
                    .source = .mas,
                    .id = try allocator.dupe(u8, mas_id),
                    .name = try allocator.dupe(u8, display),
                });
            } else if (flowMapGet(body, "cask")) |cask| {
                if (cask.len == 0) continue;
                try apps.append(allocator, .{
                    .source = .cask,
                    .id = try allocator.dupe(u8, cask),
                    .name = try allocator.dupe(u8, cask),
                });
            }
        } else {
            // Bare slug → cask token of the same name.
            try apps.append(allocator, .{
                .source = .cask,
                .id = try allocator.dupe(u8, item),
                .name = try allocator.dupe(u8, item),
            });
        }
    }

    return apps.toOwnedSlice(allocator);
}

/// Parse the `fonts:` section. Caller owns the returned slice and each Font.
pub fn parseFonts(allocator: std.mem.Allocator, content: []const u8) ![]Font {
    const raw = try collectSequenceItems(allocator, content, "fonts");
    defer {
        for (raw) |it| allocator.free(it);
        allocator.free(raw);
    }

    var fonts = try std.ArrayList(Font).initCapacity(allocator, raw.len);
    errdefer {
        for (fonts.items) |*f| f.deinit(allocator);
        fonts.deinit(allocator);
    }

    for (raw) |item| {
        // Accept inline `{ cask: font-x }` too, but the common form is a bare name.
        var name = item;
        if (item.len >= 2 and item[0] == '{' and item[item.len - 1] == '}') {
            const body = std.mem.trim(u8, item[1 .. item.len - 1], " \t");
            name = flowMapGet(body, "cask") orelse continue;
        }
        if (name.len == 0) continue;
        const cask = if (std.mem.startsWith(u8, name, "font-"))
            try allocator.dupe(u8, name)
        else
            try std.fmt.allocPrint(allocator, "font-{s}", .{name});
        try fonts.append(allocator, .{ .cask = cask });
    }

    return fonts.toOwnedSlice(allocator);
}

// ── Idempotency marker ───────────────────────────────────────────────────────

/// Path of the per-project marker file recording installed app/font keys.
/// Keyed by the deps file path so different projects don't collide.
fn markerPath(allocator: std.mem.Allocator, deps_file_path: []const u8) ![]u8 {
    const data_dir = try lib.Paths.data(allocator);
    defer allocator.free(data_dir);

    var hash: [16]u8 = undefined;
    std.crypto.hash.Md5.hash(deps_file_path, &hash, .{});
    const hex = try lib.string.hashToHex(hash, allocator);
    defer allocator.free(hex);

    const dir = try std.fs.path.join(allocator, &[_][]const u8{ data_dir, "desktop-apps" });
    defer allocator.free(dir);
    io_helper.makePath(dir) catch {};

    return std.fmt.allocPrint(allocator, "{s}/{s}.txt", .{ dir, hex });
}

/// True if `key` appears as a whole line in the marker content.
fn markerHas(content: []const u8, key: []const u8) bool {
    var it = std.mem.tokenizeScalar(u8, content, '\n');
    while (it.next()) |line| {
        if (std.mem.eql(u8, std.mem.trim(u8, line, " \t\r"), key)) return true;
    }
    return false;
}

fn writeMarker(path: []const u8, content: []const u8) void {
    const file = io_helper.createFileAbsolute(path, .{ .truncate = true }) catch return;
    defer io_helper.closeFile(file);
    io_helper.writeAllToFile(file, content) catch {};
}

// ── Output ───────────────────────────────────────────────────────────────────

fn printOk(name: []const u8, label: []const u8) void {
    style.print("{s}{s}{s} {s}{s}{s} {s}({s}){s}\n", .{
        style.green, style.plus, style.reset,
        style.bold,  name,       style.reset,
        style.dim,   label,      style.reset,
    });
}

fn printFail(name: []const u8, label: []const u8, reason: []const u8) void {
    style.printForced("{s}{s}{s} {s}{s}{s} {s}({s}: {s}){s}\n", .{
        style.red,   style.minus, style.reset,
        style.bold,  name,        style.reset,
        style.dim,   label,       reason,
        style.reset,
    });
}

// ── Install ──────────────────────────────────────────────────────────────────

fn runOk(allocator: std.mem.Allocator, argv: []const []const u8) bool {
    _ = allocator;
    // Inherit stdio so brew/mas progress streams to the user in real time.
    const term = io_helper.spawnAndWait(.{ .argv = argv }) catch return false;
    return switch (term) {
        .exited => |code| code == 0,
        else => false,
    };
}

/// Parse `apps:`/`fonts:` from the deps file and install anything not already
/// recorded in the marker. macOS-only; every failure is non-fatal (logged and
/// skipped) so a missing brew/mas or one bad cask never breaks `pantry install`.
pub fn installFromDepsFile(allocator: std.mem.Allocator, deps_file_path: []const u8, quiet: bool) void {
    if (builtin.os.tag != .macos) return;

    const content = io_helper.readFileAlloc(allocator, deps_file_path, 10 * 1024 * 1024) catch return;
    defer allocator.free(content);

    const apps = parseApps(allocator, content) catch return;
    defer {
        for (apps) |*a| {
            var m = a.*;
            m.deinit(allocator);
        }
        allocator.free(apps);
    }
    const fonts = parseFonts(allocator, content) catch return;
    defer {
        for (fonts) |*f| {
            var m = f.*;
            m.deinit(allocator);
        }
        allocator.free(fonts);
    }

    if (apps.len == 0 and fonts.len == 0) return;

    // Load marker (absent = empty). `marked` accumulates every key that should
    // be present after this run; we rewrite the file once at the end.
    const marker_file = markerPath(allocator, deps_file_path) catch return;
    defer allocator.free(marker_file);
    const existing = io_helper.readFileAlloc(allocator, marker_file, 1024 * 1024) catch
        (allocator.dupe(u8, "") catch return);
    defer allocator.free(existing);

    var marked = std.ArrayList(u8).initCapacity(allocator, existing.len + 64) catch return;
    defer marked.deinit(allocator);
    const existing_trimmed = std.mem.trim(u8, existing, " \t\r\n");
    if (existing_trimmed.len > 0) {
        marked.appendSlice(allocator, existing_trimmed) catch {};
        marked.append(allocator, '\n') catch {};
    }

    // Count pending work so we only print a header when there's something to do.
    var pending: usize = 0;
    {
        var kbuf: [512]u8 = undefined;
        for (apps) |app| {
            const prefix = if (app.source == .cask) "cask:" else "mas:";
            const key = std.fmt.bufPrint(&kbuf, "{s}{s}", .{ prefix, app.id }) catch continue;
            if (!markerHas(marked.items, key)) pending += 1;
        }
        for (fonts) |font| {
            const key = std.fmt.bufPrint(&kbuf, "font:{s}", .{font.cask}) catch continue;
            if (!markerHas(marked.items, key)) pending += 1;
        }
    }
    if (pending == 0) return;

    // Casks (apps + fonts) need Homebrew; mas apps need the `mas` CLI. Resolve
    // each to an absolute path once — std.process.spawn does not search $PATH,
    // so argv[0] must be the full path to the executable.
    const brew_path: ?[]const u8 = io_helper.findExecutable(allocator, "brew") catch null;
    defer if (brew_path) |p| allocator.free(p);
    const mas_path: ?[]const u8 = io_helper.findExecutable(allocator, "mas") catch null;
    defer if (mas_path) |p| allocator.free(p);

    if (!quiet) {
        style.print("{s}>{s} Installing {d} desktop app(s)/font(s)\n", .{ style.dim, style.reset, pending });
    }

    var installed_any = false;

    for (apps) |app| {
        const prefix = if (app.source == .cask) "cask:" else "mas:";
        const key = std.fmt.allocPrint(allocator, "{s}{s}", .{ prefix, app.id }) catch continue;
        defer allocator.free(key);
        if (markerHas(marked.items, key)) continue;

        switch (app.source) {
            .cask => {
                const bp = brew_path orelse {
                    printFail(app.name, "cask", "Homebrew not found");
                    continue;
                };
                if (runOk(allocator, &[_][]const u8{ bp, "install", "--cask", app.id })) {
                    printOk(app.name, "cask");
                    marked.appendSlice(allocator, key) catch {};
                    marked.append(allocator, '\n') catch {};
                    installed_any = true;
                } else {
                    printFail(app.name, "cask", "brew install failed");
                }
            },
            .mas => {
                const mp = mas_path orelse {
                    printFail(app.name, "app store", "`mas` not found (try: pantry install mas, or brew install mas)");
                    continue;
                };
                if (runOk(allocator, &[_][]const u8{ mp, "install", app.id })) {
                    printOk(app.name, "app store");
                    marked.appendSlice(allocator, key) catch {};
                    marked.append(allocator, '\n') catch {};
                    installed_any = true;
                } else {
                    printFail(app.name, "app store", "mas install failed (is `mas` signed in?)");
                }
            },
        }
    }

    for (fonts) |font| {
        const key = std.fmt.allocPrint(allocator, "font:{s}", .{font.cask}) catch continue;
        defer allocator.free(key);
        if (markerHas(marked.items, key)) continue;

        const bp = brew_path orelse {
            printFail(font.cask, "font", "Homebrew not found");
            continue;
        };
        if (runOk(allocator, &[_][]const u8{ bp, "install", "--cask", font.cask })) {
            printOk(font.cask, "font");
            marked.appendSlice(allocator, key) catch {};
            marked.append(allocator, '\n') catch {};
            installed_any = true;
        } else {
            printFail(font.cask, "font", "brew install failed");
        }
    }

    if (installed_any) writeMarker(marker_file, marked.items);
}

// ── Tests ────────────────────────────────────────────────────────────────────

test "parseApps: bare slugs, cask maps, and mas maps" {
    const a = std.testing.allocator;
    const content =
        \\global: true
        \\dependencies:
        \\  bun.sh: ^1.3.0
        \\apps:
        \\  - 1password
        \\  - { cask: ghostty }              # terminal
        \\  - { mas: "1147396723", name: WhatsApp }
        \\fonts:
        \\  - font-inter
    ;
    const apps = try parseApps(a, content);
    defer {
        for (apps) |*x| {
            var m = x.*;
            m.deinit(a);
        }
        a.free(apps);
    }

    try std.testing.expectEqual(@as(usize, 3), apps.len);

    try std.testing.expectEqual(AppSource.cask, apps[0].source);
    try std.testing.expectEqualStrings("1password", apps[0].id);

    try std.testing.expectEqual(AppSource.cask, apps[1].source);
    try std.testing.expectEqualStrings("ghostty", apps[1].id);

    try std.testing.expectEqual(AppSource.mas, apps[2].source);
    try std.testing.expectEqualStrings("1147396723", apps[2].id);
    try std.testing.expectEqualStrings("WhatsApp", apps[2].name);
}

test "parseFonts: adds font- prefix when missing" {
    const a = std.testing.allocator;
    const content =
        \\fonts:
        \\  - font-inter
        \\  - meslo-lg-nerd-font
        \\
    ;
    const fonts = try parseFonts(a, content);
    defer {
        for (fonts) |*x| {
            var m = x.*;
            m.deinit(a);
        }
        a.free(fonts);
    }

    try std.testing.expectEqual(@as(usize, 2), fonts.len);
    try std.testing.expectEqualStrings("font-inter", fonts[0].cask);
    try std.testing.expectEqualStrings("font-meslo-lg-nerd-font", fonts[1].cask);
}

test "parseApps: no apps section yields empty" {
    const a = std.testing.allocator;
    const content =
        \\dependencies:
        \\  bun.sh: ^1.3.0
        \\
    ;
    const apps = try parseApps(a, content);
    defer a.free(apps);
    try std.testing.expectEqual(@as(usize, 0), apps.len);
}

test "markerHas matches whole lines only" {
    try std.testing.expect(markerHas("cask:ghostty\nmas:123\n", "cask:ghostty"));
    try std.testing.expect(markerHas("cask:ghostty\nmas:123\n", "mas:123"));
    try std.testing.expect(!markerHas("cask:github\n", "cask:git"));
    try std.testing.expect(!markerHas("", "cask:ghostty"));
}
