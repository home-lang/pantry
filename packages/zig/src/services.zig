// Service management module exports

pub const definitions = @import("services/definitions.zig");
pub const platform = @import("services/platform.zig");
pub const manager = @import("services/manager.zig");

// Re-export main types
pub const ServiceConfig = definitions.ServiceConfig;
pub const ServiceStatus = definitions.ServiceStatus;
pub const Services = definitions.Services;
pub const Platform = platform.Platform;
pub const ServiceController = platform.ServiceController;
pub const ServiceManager = manager.ServiceManager;
