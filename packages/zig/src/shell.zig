// Shell integration module exports
pub const integration = @import("shell/integration.zig");
pub const generator = @import("shell/generator.zig");
pub const commands = @import("shell/commands.zig");
pub const integrate = @import("shell/integrate.zig");

// Re-export main types (legacy)
pub const Shell = integration.Shell;
pub const generateHook = integration.generateHook;
pub const generateActivation = integration.generateActivation;
pub const install = integration.install;

// Re-export new types
pub const ShellCodeGenerator = generator.ShellCodeGenerator;
pub const ShellConfig = generator.ShellConfig;
pub const ShellCommands = commands.ShellCommands;
pub const ShellIntegrator = integrate.ShellIntegrator;
