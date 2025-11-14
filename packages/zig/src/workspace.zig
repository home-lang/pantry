// Workspace module exports
pub const core = @import("workspace/core.zig");
pub const commands = @import("workspace/commands.zig");

// Re-export main types
pub const Workspace = core.Workspace;
pub const WorkspaceConfig = core.WorkspaceConfig;
pub const WorkspacePackage = core.WorkspacePackage;
pub const DependencyGraph = core.DependencyGraph;
pub const CommandResult = commands.CommandResult;

// Re-export commands
pub const init = commands.init;
pub const list = commands.list;
pub const runScript = commands.runScript;
pub const linkAll = commands.linkAll;
pub const check = commands.check;
pub const graph = commands.graph;
pub const exec = commands.exec;

test {
    @import("std").testing.refAllDecls(@This());
}
