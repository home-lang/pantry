const std = @import("std");
const testing = std.testing;
const lib = @import("lib");

test "Platform - current returns valid OS" {
    const os = lib.Platform.current();

    // Should be one of the known OS types
    const valid_os = switch (os) {
        .darwin, .linux, .windows => true,
    };

    try testing.expect(valid_os);
}

test "Platform - name returns string" {
    const os = lib.Platform.current();
    const name = os.name();

    try testing.expect(name.len > 0);
}

test "Architecture - current returns valid arch" {
    const arch = lib.Architecture.current();

    // Should be one of the known architectures
    const valid_arch = switch (arch) {
        .aarch64, .x86_64 => true,
    };

    try testing.expect(valid_arch);
}

test "Architecture - name returns string" {
    const arch = lib.Architecture.current();
    const name = arch.name();

    try testing.expect(name.len > 0);
}

test "Paths - home returns valid path" {
    const allocator = testing.allocator;

    const home = try lib.Paths.home(allocator);
    defer allocator.free(home);

    try testing.expect(home.len > 0);
    try testing.expect(std.fs.path.isAbsolute(home));
}

test "Paths - cache returns valid path" {
    const allocator = testing.allocator;

    const cache = try lib.Paths.cache(allocator);
    defer allocator.free(cache);

    try testing.expect(cache.len > 0);
    try testing.expect(std.fs.path.isAbsolute(cache));
}

test "Paths - data returns valid path" {
    const allocator = testing.allocator;

    const data = try lib.Paths.data(allocator);
    defer allocator.free(data);

    try testing.expect(data.len > 0);
    try testing.expect(std.fs.path.isAbsolute(data));
}

test "Paths - config returns valid path" {
    const allocator = testing.allocator;

    const config = try lib.Paths.config(allocator);
    defer allocator.free(config);

    try testing.expect(config.len > 0);
    try testing.expect(std.fs.path.isAbsolute(config));
}

test "Paths - libraryPathVar returns valid var name" {
    const var_name = lib.Paths.libraryPathVar();

    try testing.expect(var_name.len > 0);
    // Should be one of the standard lib path vars
    const valid = std.mem.eql(u8, var_name, "LD_LIBRARY_PATH") or
                  std.mem.eql(u8, var_name, "DYLD_LIBRARY_PATH") or
                  std.mem.eql(u8, var_name, "PATH");

    try testing.expect(valid);
}

test "Paths - pathSeparator returns valid separator" {
    const sep = lib.Paths.pathSeparator();

    // Should be : or ;
    try testing.expect(sep == ':' or sep == ';');
}

test "Paths - all paths are absolute" {
    const allocator = testing.allocator;

    const home = try lib.Paths.home(allocator);
    defer allocator.free(home);

    const cache = try lib.Paths.cache(allocator);
    defer allocator.free(cache);

    const data = try lib.Paths.data(allocator);
    defer allocator.free(data);

    const config = try lib.Paths.config(allocator);
    defer allocator.free(config);

    try testing.expect(std.fs.path.isAbsolute(home));
    try testing.expect(std.fs.path.isAbsolute(cache));
    try testing.expect(std.fs.path.isAbsolute(data));
    try testing.expect(std.fs.path.isAbsolute(config));
}
