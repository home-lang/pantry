// Environment management module exports
pub const manager = @import("env/manager.zig");

// Re-export main types
pub const Environment = manager.Environment;
pub const EnvManager = manager.EnvManager;
