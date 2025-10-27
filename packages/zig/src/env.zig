// Environment management module exports
pub const manager = @import("env/manager.zig");
pub const scanner = @import("env/scanner.zig");
pub const commands = @import("env/commands.zig");

// Re-export main types (legacy)
pub const Environment = manager.Environment;
pub const EnvManager = manager.EnvManager;

// Re-export new types
pub const EnvironmentInfo = scanner.EnvironmentInfo;
pub const EnvScanner = scanner.EnvScanner;
pub const EnvCommands = commands.EnvCommands;
