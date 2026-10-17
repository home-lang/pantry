// Import these files explicitly so their launch and install invariants run in CI.
test {
    _ = @import("io_helper.zig");
    _ = @import("cli/commands/install/core.zig");
}
