// Shell integration module exports
pub const integration = @import("shell/integration.zig");

// Re-export main types
pub const Shell = integration.Shell;
pub const generateHook = integration.generateHook;
pub const generateActivation = integration.generateActivation;
pub const install = integration.install;
