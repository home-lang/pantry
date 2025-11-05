# Commands Module Refactoring

## Overview

The commands module has been refactored from a single monolithic file (`commands.zig` - 4200+ lines) into a modular structure for better maintainability and organization.

## New Structure

```
src/cli/
├── commands.zig              # Main module - imports and re-exports all commands
├── commands/
│   ├── common.zig            # Shared types, utilities, and error messages
│   ├── package.zig           # Package management: remove, update, outdated
│   ├── px.zig                # Package executor (npx/bunx equivalent)
│   └── install.zig           # Install command (wrapper for now)
└── commands_old.zig          # Backup of original file (for gradual migration)
```

## Files

### `commands/common.zig`
**Purpose**: Shared types and utilities used across all commands

**Exports**:
- `CommandResult` - Standard result type for all commands
- Error message constants (`ERROR_NO_CONFIG`, `ERROR_CONFIG_PARSE`, etc.)
- Path utilities (`isLocalPath`, `isLocalDependency`, `stripDisplayPrefix`)
- Config file utilities (`findConfigFile`, `readConfigFile`)

**Benefits**:
- Eliminates code duplication
- Consistent error messages
- Centralized helper functions
- JSONC support built-in

### `commands/package.zig`
**Purpose**: Package management commands

**Commands**:
- `removeCommand` - Remove packages from project
- `updateCommand` - Update packages to latest versions
- `outdatedCommand` - Check for outdated dependencies

**Features**:
- Clean, focused implementations
- Glob pattern matching for filters
- JSONC support via common utilities
- Consistent table formatting

### `commands/px.zig`
**Purpose**: Package executor (like npx/bunx)

**Features**:
- Auto-installation of missing packages
- Local → Global → Auto-install resolution priority
- Argument pass-through to executables
- Runtime override support

### `commands/install.zig`
**Purpose**: Wrapper for install command (temporary)

**Status**: Currently wraps old implementation, converting return types
**TODO**: Fully refactor install logic into this file

### `commands.zig`
**Purpose**: Main entry point that imports and re-exports all commands

**Pattern**:
```zig
// Import modules
pub const package_commands = @import("commands/package.zig");
pub const px_commands = @import("commands/px.zig");

// Re-export for backwards compatibility
pub const removeCommand = package_commands.removeCommand;
pub const pxCommand = px_commands.pxCommand;
```

## Migration Strategy

### Phase 1: ✅ Complete
- [x] Created modular structure
- [x] Extracted common utilities
- [x] Refactored: remove, update, outdated, px
- [x] All tests passing

### Phase 2: TODO
- [ ] Refactor install command into `commands/install.zig`
- [ ] Create `commands/scripts.zig` (runScript, listScripts)
- [ ] Create `commands/cache.zig` (cacheStats, cacheClear)
- [ ] Create `commands/env.zig` (environment management)
- [ ] Create `commands/shell.zig` (shell integration)
- [ ] Create `commands/services.zig` (service management)
- [ ] Create `commands/dev.zig` (dev utilities)
- [ ] Create `commands/utils.zig` (clean, doctor, info, search)

### Phase 3: Cleanup
- [ ] Remove `commands_old.zig`
- [ ] Update documentation
- [ ] Add module-level tests

## Benefits of Refactoring

### Before
```zig
// commands.zig - 4222 lines
// Everything in one file
// Hard to navigate
// Difficult to maintain
```

### After
```zig
// commands/package.zig - ~350 lines
// Focused on package management only
// Easy to understand
// Simple to extend
```

### Improvements
1. **Maintainability**: Each file has a single responsibility
2. **Readability**: Smaller, focused files are easier to understand
3. **Testability**: Can test individual modules in isolation
4. **Collaboration**: Multiple developers can work on different commands
5. **Documentation**: Each module has clear purpose and API
6. **Code Reuse**: Common utilities extracted and shared

## Error Message Constants

Centralized in `common.zig`:
```zig
pub const ERROR_NO_CONFIG = "Error: No package.json or pantry.json found";
pub const ERROR_CONFIG_PARSE = "Error: Failed to parse config file";
pub const ERROR_CONFIG_NOT_OBJECT = "Error: Config file must be a JSON object";
pub const ERROR_NO_PACKAGES = "Error: No packages specified";
```

**Benefits**:
- Consistent error messages
- Easy to update
- Prevents typos
- Better i18n support in future

## Helper Functions

Extracted to `common.zig`:

```zig
// Path utilities
pub fn isLocalPath(version: []const u8) bool
pub fn isLocalDependency(dep: PackageDependency) bool
pub fn stripDisplayPrefix(name: []const u8) []const u8

// Config utilities
pub fn findConfigFile(allocator: Allocator, cwd: []const u8) ![]const u8
pub fn readConfigFile(allocator: Allocator, config_path: []const u8) !Parsed(Value)
```

**Benefits**:
- DRY principle
- Single source of truth
- Easier to test
- Consistent behavior

## CommandResult Type

Centralized result type with helper methods:

```zig
pub const CommandResult = struct {
    exit_code: u8,
    message: ?[]const u8 = null,

    pub fn deinit(self: *CommandResult, allocator: Allocator) void
    pub fn success(allocator: Allocator, message: ?[]const u8) !CommandResult
    pub fn err(allocator: Allocator, message: []const u8) !CommandResult
};
```

**Usage**:
```zig
// Old way
return .{
    .exit_code = 1,
    .message = try allocator.dupe(u8, "Error message"),
};

// New way
return CommandResult.err(allocator, "Error message");
```

## Testing

All refactored commands have been tested:
- ✅ `outdated` command - 10/10 tests passing
- ✅ `px` command - 10/10 tests passing
- ✅ `remove` command - Working as expected
- ✅ `update` command - Working as expected

## Backwards Compatibility

The refactoring maintains 100% backwards compatibility:
- All existing command exports remain available
- Main entry point (`commands.zig`) re-exports everything
- No breaking changes to CLI interface
- All tests pass without modification

## Future Work

### Recommended Next Steps

1. **Refactor Install Command**
   - Extract from `commands_old.zig` into `commands/install.zig`
   - Break down into smaller functions
   - Add unit tests

2. **Create Remaining Modules**
   - Group related commands by functionality
   - Follow same pattern as package.zig

3. **Add Module Tests**
   - Unit tests for each module
   - Integration tests for command interactions
   - Test common utilities thoroughly

4. **Documentation**
   - Add doc comments to all public functions
   - Create usage examples
   - Document internal architecture

5. **Performance**
   - Profile command execution
   - Optimize hot paths
   - Reduce allocations where possible

## Migration Guide

For contributors adding new commands:

### Old Way
```zig
// Add to commands.zig (4000+ lines)
pub fn myCommand(...) !CommandResult {
    // Implementation
}
```

### New Way
```zig
// 1. Create commands/my_feature.zig
pub fn myCommand(...) !common.CommandResult {
    // Use common.CommandResult
    // Use common utilities
}

// 2. Export in commands.zig
pub const my_feature = @import("commands/my_feature.zig");
pub const myCommand = my_feature.myCommand;
```

## Conclusion

This refactoring improves code organization while maintaining full backwards compatibility. The modular structure makes the codebase more maintainable and sets a foundation for future development.
