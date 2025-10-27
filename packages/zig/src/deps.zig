// Dependency management module exports
pub const detector = @import("deps/detector.zig");
pub const parser = @import("deps/parser.zig");
pub const global_scanner = @import("deps/global_scanner.zig");
pub const resolver = @import("deps/resolver.zig");

// Re-export main types
pub const Dependency = resolver.Dependency;
pub const SortResult = resolver.SortResult;
pub const topologicalSort = resolver.topologicalSort;
