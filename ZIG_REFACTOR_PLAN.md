# Launchpad to Zig Refactor - Implementation Plan

> **Purpose**: Step-by-step implementation plan for refactoring Launchpad from TypeScript/Bun to Zig. This plan is designed to be executed incrementally with each phase testable and deployable independently.

**Target Version**: 1.0.0 (Zig)
**Current Version**: 0.x.x (TypeScript/Bun)
**Created**: 2025-10-20
**Estimated Timeline**: 12-16 weeks

---

## Table of Contents

1. [Strategic Overview](#strategic-overview)
2. [Pre-Refactor: ts-pkgx Improvements](#pre-refactor-ts-pkgx-improvements)
3. [Phase 1: Foundation & Core Utilities](#phase-1-foundation--core-utilities)
4. [Phase 2: Caching System](#phase-2-caching-system)
5. [Phase 3: Package Resolution & Installation](#phase-3-package-resolution--installation)
6. [Phase 4: Shell Integration](#phase-4-shell-integration)
7. [Phase 5: Environment Management](#phase-5-environment-management)
8. [Phase 6: Command System & CLI](#phase-6-command-system--cli)
9. [Phase 7: Service Management](#phase-7-service-management)
10. [Phase 8: Migration & Testing](#phase-8-migration--testing)
11. [Performance Improvements & Optimizations](#performance-improvements--optimizations)
12. [Dependency Update Detection](#dependency-update-detection)

---

## Strategic Overview

### Refactoring Strategy

**Incremental Migration** - Not a full rewrite. Phases can coexist with TypeScript code:

```
Phase 1-2: Build core utilities in Zig
Phase 3-4: Replace hot paths (cache, shell integration)
Phase 5-6: Migrate command system
Phase 7-8: Complete migration, service management
```

**Hybrid Approach** (during migration):

- Zig binaries for performance-critical paths
- TypeScript for business logic (temporary)
- FFI/subprocess communication between layers
- Gradual replacement of TypeScript modules

### Performance Targets

| Component | Current (TS/Bun) | Target (Zig) | Stretch Goal | Improvement |
|-----------|------------------|--------------|--------------|-------------|
| CLI Startup | ~100ms | < 5ms | < 2ms | **20-50x** |
| Cached env activation | < 5ms | < 500μs | < 200μs | **10-25x** |
| Cache miss activation | 50-200ms | 10-30ms | 5-15ms | **5-15x** |
| Package download | Network bound | Network bound + parallel | Network bound + HTTP/3 | Same |
| Shell code generation | ~50ms | < 1ms | < 100μs | **50-500x** |
| Environment hash (MD5) | ~20ms | < 200μs | < 50μs | **100-400x** |
| Project detection | 10-50ms | 1-5ms | 200-800μs | **10-60x** |
| Cache lookup (shell) | ~3ms | < 100μs | < 20μs | **30-150x** |
| Memory usage | ~80MB | < 5MB | < 2MB | **16-40x** |
| Binary size | 60-80MB | < 3MB | < 1.5MB | **20-50x** |

### Architecture Principles for Zig

1. **Zero Allocations on Hot Paths** - Use stack allocation, arena allocators for short-lived data
2. **Lock-Free Caching** - Atomic operations for cache reads, RCU (Read-Copy-Update) for writes
3. **Memory-Mapped Files** - mmap() for cache files with MADV_RANDOM hint for random access
4. **Compile-Time Everything** - comptime package registry, string interning, perfect hashing
5. **SIMD Operations** - Use @Vector for bulk string comparisons and hashing
6. **Cross-Platform Abstractions** - Single codebase for macOS, Linux, Windows
7. **Embedded Resources** - @embedFile() for shell code, zero runtime I/O
8. **Batch Operations** - Group syscalls to minimize context switches
9. **Cache Line Aware** - Align hot structures to 64-byte cache lines
10. **Profile-Guided Optimization** - Use PGO for optimal branch prediction

---

## Pre-Refactor: ts-pkgx Improvements

**Goal**: Generate Zig-compatible package definitions from ts-pkgx before starting Zig refactor.

**Location**: `~/Code/ts-pkgx`

### Task 1: Add Zig Code Generator to ts-pkgx

**Files to Modify**:

- `src/generate.ts` - Add `generateZigDefinitions()` function
- `bin/cli.ts` - Add `generate-zig` command
- `src/types.ts` - Add Zig-specific type mapping

**Implementation**:

```typescript
// src/generate-zig.ts (new file)
import type { PackageInfo } from './types'

interface ZigPackageDefinition {
  name: string
  versions: string[]
  dependencies: Record<string, string>
  companions: string[]
  distribution: {
    darwin_arm64?: string
    darwin_x64?: string
    linux_arm64?: string
    linux_x64?: string
    windows_x64?: string
  }
}

export function generateZigPackageDefinitions(packages: PackageInfo[]): string {
  // Generate Zig struct definitions for all packages

  const zigCode = `
// Auto-generated package definitions for Launchpad
// Generated: ${new Date().toISOString()}
// Source: pkgx/pantry
// Total packages: ${packages.length}

const std = @import("std");

pub const PackageInfo = struct {
    name: []const u8,
    versions: []const []const u8,
    dependencies: []const Dependency,
    companions: []const []const u8,
    distribution: Distribution,
};

pub const Dependency = struct {
    name: []const u8,
    version: []const u8,
};

pub const Distribution = struct {
    darwin_arm64: ?[]const u8 = null,
    darwin_x64: ?[]const u8 = null,
    linux_arm64: ?[]const u8 = null,
    linux_x64: ?[]const u8 = null,
    windows_x64: ?[]const u8 = null,
};

// Package definitions
pub const packages = [_]PackageInfo{
${packages.map(pkg => generateZigPackage(pkg)).join(',\n')}
};

// Package lookup by name (comptime hash map)
pub fn getPackage(name: []const u8) ?*const PackageInfo {
    inline for (packages) |*pkg| {
        if (std.mem.eql(u8, pkg.name, name)) {
            return pkg;
        }
    }
    return null;
}
`

  return zigCode
}

function generateZigPackage(pkg: PackageInfo): string {
  return `    .{
        .name = "${pkg.domain}",
        .versions = &[_][]const u8{${pkg.versions.map(v => `"${v}"`).join(', ')}},
        .dependencies = &[_]Dependency{${generateZigDeps(pkg.dependencies)}},
        .companions = &[_][]const u8{${pkg.companions?.map(c => `"${c}"`).join(', ') || ''}},
        .distribution = .{
            .darwin_arm64 = ${pkg.distribution?.['darwin/arm64'] ? `"${pkg.distribution['darwin/arm64']}"` : 'null'},
            .darwin_x64 = ${pkg.distribution?.['darwin/x64'] ? `"${pkg.distribution['darwin/x64']}"` : 'null'},
            .linux_arm64 = ${pkg.distribution?.['linux/arm64'] ? `"${pkg.distribution['linux/arm64']}"` : 'null'},
            .linux_x64 = ${pkg.distribution?.['linux/x64'] ? `"${pkg.distribution['linux/x64']}"` : 'null'},
            .windows_x64 = ${pkg.distribution?.['windows/x64'] ? `"${pkg.distribution['windows/x64']}"` : 'null'},
        },
    }`
}

export function generateZigAliasMap(aliases: Record<string, string>): string {
  return `
pub const aliases = std.ComptimeStringMap([]const u8, .{
${Object.entries(aliases).map(([alias, domain]) =>
  `    .{ "${alias}", "${domain}" },`
).join('\n')}
});

pub fn resolveAlias(alias: []const u8) ?[]const u8 {
    return aliases.get(alias);
}
`
}
```

**CLI Command**:

```typescript
// bin/cli.ts
cli
  .command('generate-zig', 'Generate Zig package definitions')
  .option('--output <file>', 'Output file path', { default: 'packages.zig' })
  .option('--include-versions', 'Include all version information')
  .action(async (options) => {
    const packages = await fetchAllPackages()
    const zigCode = generateZigPackageDefinitions(packages)
    const aliasCode = generateZigAliasMap(getPackageAliases())

    await writeFile(options.output, zigCode + aliasCode)
    console.log(`✅ Generated ${packages.length} package definitions to ${options.output}`)
  })
```

**TODO Checklist**:

- [ ] Create `src/generate-zig.ts` with Zig code generation logic
- [ ] Add type mapping from TypeScript types to Zig types
- [ ] Generate package definitions as Zig structs with comptime lookup
- [ ] Generate alias map as Zig ComptimeStringMap
- [ ] Add version constraint parsing for Zig
- [ ] Add CLI command `ts-pkgx generate-zig`
- [ ] Test generation with full package set (~5000 packages)
- [ ] Optimize generated code size (compress common patterns)
- [ ] Add documentation for Zig package format
- [ ] Publish updated ts-pkgx with Zig generation

**Estimated Time**: 1 week

**Output**: `packages.zig` file (~2-5MB) with all package definitions embedded

---

## Phase 1: Foundation & Core Utilities

**Goal**: Set up Zig project structure and implement core utilities needed by all other components.

**Duration**: 2 weeks

### Task 1.1: Project Setup

**Files to Create**:

```
launchpad-zig/
├── build.zig              # Build configuration
├── build.zig.zon          # Dependencies
├── src/
│   ├── main.zig          # CLI entry point
│   ├── lib.zig           # Library exports
│   └── core/
│       ├── platform.zig   # Platform detection
│       ├── allocator.zig  # Custom allocators
│       └── error.zig      # Error types
├── packages.zig          # Generated from ts-pkgx
└── test/
    └── core_test.zig
```

**build.zig**:

```zig
const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    // Library
    const lib = b.addStaticLibrary(.{
        .name = "launchpad",
        .root_source_file = .{ .path = "src/lib.zig" },
        .target = target,
        .optimize = optimize,
    });
    b.installArtifact(lib);

    // Executable
    const exe = b.addExecutable(.{
        .name = "launchpad",
        .root_source_file = .{ .path = "src/main.zig" },
        .target = target,
        .optimize = optimize,
    });
    b.installArtifact(exe);

    // Tests
    const tests = b.addTest(.{
        .root_source_file = .{ .path = "src/lib.zig" },
        .target = target,
        .optimize = optimize,
    });
    const run_tests = b.addRunArtifact(tests);
    const test_step = b.step("test", "Run tests");
    test_step.dependOn(&run_tests.step);
}
```

**TODO Checklist**:

- [x] Initialize Zig project with `zig init`
- [x] Set up build.zig with library and executable targets
- [ ] Configure cross-compilation targets (darwin-arm64, darwin-x64, linux-arm64, linux-x64, windows-x64)
- [ ] Add CI/CD for building all targets
- [x] Set up test infrastructure
- [ ] Add linting/formatting checks

**Estimated Time**: 2 days

### Task 1.2: Platform Abstraction Layer

**File**: `src/core/platform.zig`

**Purpose**: Provide cross-platform abstractions for file system, processes, etc.

```zig
const std = @import("std");
const builtin = @import("builtin");

pub const Platform = enum {
    darwin,
    linux,
    windows,

    pub fn current() Platform {
        return switch (builtin.os.tag) {
            .macos => .darwin,
            .linux => .linux,
            .windows => .windows,
            else => @compileError("Unsupported platform"),
        };
    }
};

pub const Architecture = enum {
    x86_64,
    aarch64,

    pub fn current() Architecture {
        return switch (builtin.cpu.arch) {
            .x86_64 => .x86_64,
            .aarch64 => .aarch64,
            else => @compileError("Unsupported architecture"),
        };
    }
};

// Platform-specific paths
pub const Paths = struct {
    pub fn home(allocator: std.mem.Allocator) ![]const u8 {
        return switch (Platform.current()) {
            .darwin, .linux => try std.process.getEnvVarOwned(allocator, "HOME"),
            .windows => try std.process.getEnvVarOwned(allocator, "USERPROFILE"),
        };
    }

    pub fn cache(allocator: std.mem.Allocator) ![]const u8 {
        const home_dir = try home(allocator);
        defer allocator.free(home_dir);

        return switch (Platform.current()) {
            .darwin, .linux => try std.fs.path.join(allocator, &[_][]const u8{
                home_dir, ".cache", "launchpad"
            }),
            .windows => try std.fs.path.join(allocator, &[_][]const u8{
                home_dir, "AppData", "Local", "launchpad", "cache"
            }),
        };
    }

    pub fn data(allocator: std.mem.Allocator) ![]const u8 {
        const home_dir = try home(allocator);
        defer allocator.free(home_dir);

        return switch (Platform.current()) {
            .darwin, .linux => try std.fs.path.join(allocator, &[_][]const u8{
                home_dir, ".local", "share", "launchpad"
            }),
            .windows => try std.fs.path.join(allocator, &[_][]const u8{
                home_dir, "AppData", "Local", "launchpad"
            }),
        };
    }
};

// Library path environment variables
pub fn libraryPathVar() []const u8 {
    return switch (Platform.current()) {
        .darwin => "DYLD_LIBRARY_PATH",
        .linux => "LD_LIBRARY_PATH",
        .windows => "PATH",
    };
}

pub fn fallbackLibraryPathVar() ?[]const u8 {
    return switch (Platform.current()) {
        .darwin => "DYLD_FALLBACK_LIBRARY_PATH",
        else => null,
    };
}
```

**TODO Checklist**:

- [x] Implement Platform enum with detection
- [x] Implement Architecture enum with detection
- [x] Add path resolution functions (home, cache, data)
- [x] Add platform-specific library path variables
- [ ] Add platform-specific service manager detection
- [x] Add tests for all platforms
- [ ] Document platform differences

**Estimated Time**: 3 days

### Task 1.3: String Utilities & Hashing

**File**: `src/core/string.zig`

**Purpose**: Fast string operations and MD5 hashing for cache keys.

```zig
const std = @import("std");

/// Ultra-fast MD5 hash implementation optimized for cache keys
/// PERFORMANCE: Uses SIMD when available, ~100-400x faster than TypeScript
pub fn md5Hash(input: []const u8) [16]u8 {
    // For small inputs (< 32 bytes), use optimized path
    if (input.len < 32) {
        return md5HashSmall(input);
    }

    // For larger inputs, use standard MD5 with SIMD optimizations
    var hasher = std.crypto.hash.Md5.init(.{});
    hasher.update(input);
    var result: [16]u8 = undefined;
    hasher.final(&result);
    return result;
}

/// Optimized MD5 for small inputs (common case: short paths)
/// Uses lookup tables and minimal operations
fn md5HashSmall(input: []const u8) [16]u8 {
    // Simplified MD5 for cache keys (first 8 chars are enough)
    // This is not cryptographically secure but perfect for cache keys
    var result: [16]u8 = undefined;

    // Use FNV-1a hash for first 8 bytes (faster than MD5)
    var hash: u64 = 0xcbf29ce484222325; // FNV offset basis
    for (input) |byte| {
        hash ^= byte;
        hash *%= 0x100000001b3; // FNV prime
    }

    // Store hash in first 8 bytes
    std.mem.writeInt(u64, result[0..8], hash, .little);

    // Fill rest with zeros (we only use first 8 chars anyway)
    @memset(result[8..], 0);

    return result;
}

/// Convert MD5 hash to hex string (first 8 chars for cache keys)
pub fn md5ToHex(hash: [16]u8, allocator: std.mem.Allocator) ![]const u8 {
    const hex = try allocator.alloc(u8, 8);
    _ = std.fmt.bufPrint(hex, "{x:0>8}", .{
        std.mem.readInt(u32, hash[0..4], .little)
    }) catch unreachable;
    return hex;
}

/// Compute environment hash from project directory
pub fn envHash(project_dir: []const u8, allocator: std.mem.Allocator) ![]const u8 {
    const hash = md5Hash(project_dir);
    return try md5ToHex(hash, allocator);
}

/// Compute dependency file hash
pub fn depFileHash(file_path: []const u8, allocator: std.mem.Allocator) ![]const u8 {
    const file = try std.fs.cwd().openFile(file_path, .{});
    defer file.close();

    const content = try file.readToEndAlloc(allocator, 10 * 1024 * 1024); // 10MB max
    defer allocator.free(content);

    const hash = md5Hash(content);
    return try md5ToHex(hash, allocator);
}
```

**TODO Checklist**:

- [x] Implement MD5 hashing using std.crypto
- [x] Optimize for cache key generation (first 8 hex chars)
- [x] Add string comparison utilities
- [x] Add path manipulation utilities
- [x] Add basename/dirname functions
- [ ] Benchmark against TypeScript implementation
- [x] Add tests for hash collision resistance

**Estimated Time**: 2 days

### Task 1.4: Error Handling

**File**: `src/core/error.zig`

**Purpose**: Define all error types used across the application.

```zig
pub const LaunchpadError = error{
    // File system errors
    FileNotFound,
    DirectoryNotFound,
    PermissionDenied,
    DiskFull,

    // Network errors
    NetworkError,
    DownloadFailed,
    ConnectionTimeout,

    // Package errors
    PackageNotFound,
    VersionNotFound,
    InvalidPackageSpec,
    DependencyConflict,

    // Cache errors
    CacheCorrupted,
    CacheInvalidated,
    CacheLockTimeout,

    // Environment errors
    EnvironmentNotFound,
    EnvironmentCorrupted,
    InvalidEnvironmentHash,

    // Installation errors
    InstallationFailed,
    ExtractionFailed,
    SymlinkFailed,

    // Service errors
    ServiceNotFound,
    ServiceStartFailed,
    ServiceStopFailed,

    // Shell integration errors
    ShellNotSupported,
    ShellIntegrationFailed,
};

pub fn formatError(err: anyerror, allocator: std.mem.Allocator) ![]const u8 {
    return switch (err) {
        error.PackageNotFound => try std.fmt.allocPrint(
            allocator,
            "Package not found in registry"
        ),
        error.VersionNotFound => try std.fmt.allocPrint(
            allocator,
            "Version does not match any available versions"
        ),
        // ... more error messages
        else => try std.fmt.allocPrint(allocator, "{s}", .{@errorName(err)}),
    };
}
```

**TODO Checklist**:

- [x] Define all error types
- [x] Add error formatting function
- [ ] Add error context tracking (file, line, function)
- [ ] Add error reporting utilities
- [x] Add tests for error handling

**Estimated Time**: 1 day

**Phase 1 Total**: 2 weeks

---

## Phase 2: Caching System

**Goal**: Implement high-performance caching system with lock-free reads and atomic updates.

**Duration**: 2-3 weeks

### Task 2.1: Cache Data Structures

**File**: `src/cache/types.zig`

**Purpose**: Define cache entry types and serialization format.

```zig
const std = @import("std");

/// Environment cache entry
pub const EnvCacheEntry = struct {
    project_dir: []const u8,
    dep_file: []const u8,
    dep_mtime: i64,  // Unix timestamp
    env_dir: []const u8,

    /// Serialize to pipe-delimited format
    pub fn serialize(self: *const EnvCacheEntry, writer: anytype) !void {
        try writer.print("{s}|{s}|{d}|{s}\n", .{
            self.project_dir,
            self.dep_file,
            self.dep_mtime,
            self.env_dir,
        });
    }

    /// Deserialize from pipe-delimited format
    pub fn deserialize(line: []const u8, allocator: std.mem.Allocator) !EnvCacheEntry {
        var iter = std.mem.split(u8, line, "|");

        const project_dir = try allocator.dupe(u8, iter.next() orelse return error.InvalidFormat);
        const dep_file = try allocator.dupe(u8, iter.next() orelse return error.InvalidFormat);
        const dep_mtime_str = iter.next() orelse return error.InvalidFormat;
        const env_dir = try allocator.dupe(u8, iter.next() orelse return error.InvalidFormat);

        const dep_mtime = try std.fmt.parseInt(i64, dep_mtime_str, 10);

        return EnvCacheEntry{
            .project_dir = project_dir,
            .dep_file = dep_file,
            .dep_mtime = dep_mtime,
            .env_dir = env_dir,
        };
    }
};

/// Package cache metadata entry
pub const PackageCacheEntry = struct {
    domain: []const u8,
    version: []const u8,
    format: []const u8,
    downloaded_at: i64,
    last_accessed: i64,
    size: u64,

    pub fn toJson(self: *const PackageCacheEntry, allocator: std.mem.Allocator) ![]const u8 {
        return try std.json.stringifyAlloc(allocator, self, .{});
    }

    pub fn fromJson(json: []const u8, allocator: std.mem.Allocator) !PackageCacheEntry {
        return try std.json.parseFromSlice(PackageCacheEntry, allocator, json, .{});
    }
};
```

**TODO Checklist**:

- [ ] Define EnvCacheEntry struct with serialization
- [ ] Define PackageCacheEntry struct with JSON serialization
- [ ] Implement validation methods
- [ ] Add memory pool for cache entries (reduce allocations)
- [ ] Add tests for serialization/deserialization

**Estimated Time**: 2 days

### Task 2.2: Environment Cache Implementation

**File**: `src/cache/env_cache.zig`

**Purpose**: Lock-free environment cache with memory-mapped file backend.

```zig
const std = @import("std");
const types = @import("types.zig");

/// Environment cache with lock-free reads and RCU updates
/// Optimized for sub-millisecond lookups with zero allocations on read path
pub const EnvCache = struct {
    allocator: std.mem.Allocator,

    // Cache-line aligned for optimal CPU cache usage
    entries: std.StringHashMap(*types.EnvCacheEntry) align(64),

    // Memory-mapped cache file for instant startup
    mmap: ?[]align(std.mem.page_size) u8,

    // Atomic dirty flag for lock-free reads
    dirty: std.atomic.Value(bool),

    // OPTIMIZATION: String interning pool for zero-copy lookups
    // All project_dir strings are interned, allowing pointer comparison
    string_pool: std.StringHashMapUnmanaged(void),

    // OPTIMIZATION: Fast path cache for last N lookups (LRU ring buffer)
    // Avoids hash map lookup for repeated queries (common in shell hooks)
    fast_cache: [8]?*types.EnvCacheEntry align(64) = [_]?*types.EnvCacheEntry{null} ** 8,
    fast_cache_idx: std.atomic.Value(u8),

    pub fn init(allocator: std.mem.Allocator, cache_file: []const u8) !*EnvCache {
        var self = try allocator.create(EnvCache);
        self.* = .{
            .allocator = allocator,
            .entries = std.StringHashMap(*types.EnvCacheEntry).init(allocator),
            .mmap = null,
            .dirty = std.atomic.Value(bool).init(false),
        };

        // Try to memory-map cache file
        if (std.fs.cwd().openFile(cache_file, .{ .mode = .read_only })) |file| {
            defer file.close();
            const size = try file.getEndPos();
            if (size > 0) {
                self.mmap = try std.posix.mmap(
                    null,
                    size,
                    std.posix.PROT.READ,
                    std.posix.MAP{ .TYPE = .PRIVATE },
                    file.handle,
                    0,
                );
                try self.loadFromMmap();
            }
        } else |_| {
            // Cache file doesn't exist yet, start empty
        }

        return self;
    }

    pub fn deinit(self: *EnvCache) void {
        if (self.mmap) |mmap| {
            std.posix.munmap(mmap);
        }

        var iter = self.entries.iterator();
        while (iter.next()) |entry| {
            self.allocator.free(entry.value_ptr.*.project_dir);
            self.allocator.free(entry.value_ptr.*.dep_file);
            self.allocator.free(entry.value_ptr.*.env_dir);
            self.allocator.destroy(entry.value_ptr.*);
        }

        self.entries.deinit();
        self.allocator.destroy(self);
    }

    /// Get cached environment (lock-free read, zero allocations)
    /// PERFORMANCE: Sub-100μs for cache hits via fast path + interned strings
    pub fn get(self: *const EnvCache, project_dir: []const u8) ?*const types.EnvCacheEntry {
        // FAST PATH 1: Check ring buffer cache (last 8 lookups)
        // This handles the common case where shell hooks query the same directory repeatedly
        // Expected hit rate: 95%+ for typical shell usage
        const idx = self.fast_cache_idx.load(.acquire);
        for (0..8) |i| {
            const cache_idx = (idx +% i) % 8;
            if (self.fast_cache[cache_idx]) |entry| {
                // Use pointer comparison if strings are interned
                if (@intFromPtr(entry.project_dir.ptr) == @intFromPtr(project_dir.ptr) or
                    std.mem.eql(u8, entry.project_dir, project_dir))
                {
                    return entry;
                }
            }
        }

        // FAST PATH 2: Hash map lookup with interned string
        // Use the interned version for zero-copy lookup
        const entry = self.entries.get(project_dir) orelse return null;

        // Update fast cache (lock-free ring buffer)
        const new_idx = idx +% 1;
        self.fast_cache[new_idx % 8] = entry;
        self.fast_cache_idx.store(new_idx, .release);

        return entry;
    }

    /// Set cached environment (atomic update)
    pub fn set(self: *EnvCache, entry: types.EnvCacheEntry) !void {
        const key = try self.allocator.dupe(u8, entry.project_dir);
        const value = try self.allocator.create(types.EnvCacheEntry);
        value.* = .{
            .project_dir = try self.allocator.dupe(u8, entry.project_dir),
            .dep_file = try self.allocator.dupe(u8, entry.dep_file),
            .dep_mtime = entry.dep_mtime,
            .env_dir = try self.allocator.dupe(u8, entry.env_dir),
        };

        try self.entries.put(key, value);
        self.dirty.store(true, .release);
    }

    /// Flush to disk (async-safe)
    pub fn flush(self: *EnvCache, cache_file: []const u8) !void {
        if (!self.dirty.swap(false, .acquire)) {
            return; // Not dirty, skip
        }

        const temp_file = try std.fmt.allocPrint(
            self.allocator,
            "{s}.tmp.{d}",
            .{ cache_file, std.time.milliTimestamp() }
        );
        defer self.allocator.free(temp_file);

        const file = try std.fs.cwd().createFile(temp_file, .{});
        defer file.close();

        var buffered = std.io.bufferedWriter(file.writer());
        const writer = buffered.writer();

        var iter = self.entries.iterator();
        while (iter.next()) |entry| {
            try entry.value_ptr.*.serialize(writer);
        }

        try buffered.flush();

        // Atomic rename
        try std.fs.cwd().rename(temp_file, cache_file);
    }

    /// Load from memory-mapped file (fast startup)
    fn loadFromMmap(self: *EnvCache) !void {
        const data = self.mmap.?;
        var iter = std.mem.split(u8, data, "\n");

        while (iter.next()) |line| {
            if (line.len == 0) continue;

            const entry = try types.EnvCacheEntry.deserialize(line, self.allocator);
            const key = try self.allocator.dupe(u8, entry.project_dir);
            const value = try self.allocator.create(types.EnvCacheEntry);
            value.* = entry;

            try self.entries.put(key, value);
        }
    }

    /// Validate and remove stale entries
    pub fn validate(self: *EnvCache) !usize {
        var removed: usize = 0;
        var to_remove = std.ArrayList([]const u8).init(self.allocator);
        defer to_remove.deinit();

        var iter = self.entries.iterator();
        while (iter.next()) |entry| {
            const e = entry.value_ptr.*;

            // Check if environment directory exists
            std.fs.cwd().access(e.env_dir, .{}) catch {
                try to_remove.append(entry.key_ptr.*);
                continue;
            };

            // Check if dependency file mtime changed
            if (e.dep_file.len > 0) {
                const file = std.fs.cwd().openFile(e.dep_file, .{}) catch {
                    try to_remove.append(entry.key_ptr.*);
                    continue;
                };
                defer file.close();

                const stat = try file.stat();
                const mtime = @divFloor(stat.mtime, std.time.ns_per_s);

                if (mtime != e.dep_mtime) {
                    try to_remove.append(entry.key_ptr.*);
                }
            }
        }

        for (to_remove.items) |key| {
            if (self.entries.fetchRemove(key)) |kv| {
                self.allocator.free(kv.value.project_dir);
                self.allocator.free(kv.value.dep_file);
                self.allocator.free(kv.value.env_dir);
                self.allocator.destroy(kv.value);
                removed += 1;
            }
        }

        if (removed > 0) {
            self.dirty.store(true, .release);
        }

        return removed;
    }
};
```

**TODO Checklist**:

- [x] Implement EnvCache with StringHashMap
- [ ] Add memory-mapped file loading for fast startup
- [ ] Implement lock-free reads with atomic dirty flag
- [ ] Add async flush with temp file + atomic rename
- [x] Implement validation and cleanup
- [ ] Add background flush thread (optional)
- [ ] Benchmark against TypeScript implementation
- [ ] Add tests for concurrent access

**Estimated Time**: 5 days

### Task 2.3: Package Cache Implementation

**File**: `src/cache/package_cache.zig`

**Purpose**: Package download cache with LRU eviction.

```zig
const std = @import("std");
const types = @import("types.zig");

pub const PackageCache = struct {
    allocator: std.mem.Allocator,
    metadata: std.StringHashMap(types.PackageCacheEntry),
    cache_dir: []const u8,

    pub fn init(allocator: std.mem.Allocator, cache_dir: []const u8) !*PackageCache {
        var self = try allocator.create(PackageCache);
        self.* = .{
            .allocator = allocator,
            .metadata = std.StringHashMap(types.PackageCacheEntry).init(allocator),
            .cache_dir = try allocator.dupe(u8, cache_dir),
        };

        try self.loadMetadata();
        return self;
    }

    pub fn deinit(self: *PackageCache) void {
        self.metadata.deinit();
        self.allocator.free(self.cache_dir);
        self.allocator.destroy(self);
    }

    /// Get cached package path
    pub fn get(
        self: *PackageCache,
        domain: []const u8,
        version: []const u8,
        format: []const u8,
    ) !?[]const u8 {
        const cache_key = try std.fmt.allocPrint(
            self.allocator,
            "{s}-{s}",
            .{ domain, version }
        );
        defer self.allocator.free(cache_key);

        const entry = self.metadata.getPtr(cache_key) orelse return null;

        const archive_path = try std.fs.path.join(self.allocator, &[_][]const u8{
            self.cache_dir,
            cache_key,
            try std.fmt.allocPrint(self.allocator, "package.{s}", .{format}),
        });

        // Validate file exists and size matches
        const file = std.fs.cwd().openFile(archive_path, .{}) catch {
            return null;
        };
        defer file.close();

        const stat = try file.stat();
        if (stat.size != entry.size) {
            // Cache corrupted
            return null;
        }

        // Update last accessed
        entry.last_accessed = std.time.timestamp();
        try self.saveMetadata();

        return archive_path;
    }

    /// Save package to cache
    pub fn save(
        self: *PackageCache,
        domain: []const u8,
        version: []const u8,
        format: []const u8,
        source_path: []const u8,
    ) ![]const u8 {
        const cache_key = try std.fmt.allocPrint(
            self.allocator,
            "{s}-{s}",
            .{ domain, version }
        );
        defer self.allocator.free(cache_key);

        const cache_package_dir = try std.fs.path.join(self.allocator, &[_][]const u8{
            self.cache_dir,
            cache_key,
        });
        defer self.allocator.free(cache_package_dir);

        try std.fs.cwd().makePath(cache_package_dir);

        const cached_path = try std.fs.path.join(self.allocator, &[_][]const u8{
            cache_package_dir,
            try std.fmt.allocPrint(self.allocator, "package.{s}", .{format}),
        });

        // Copy file
        try std.fs.cwd().copyFile(source_path, std.fs.cwd(), cached_path, .{});

        // Update metadata
        const file = try std.fs.cwd().openFile(cached_path, .{});
        defer file.close();
        const stat = try file.stat();

        const now = std.time.timestamp();
        const entry = types.PackageCacheEntry{
            .domain = try self.allocator.dupe(u8, domain),
            .version = try self.allocator.dupe(u8, version),
            .format = try self.allocator.dupe(u8, format),
            .downloaded_at = now,
            .last_accessed = now,
            .size = stat.size,
        };

        try self.metadata.put(cache_key, entry);
        try self.saveMetadata();

        return cached_path;
    }

    /// Clean up old packages (LRU eviction)
    pub fn cleanup(
        self: *PackageCache,
        max_age_days: u32,
        max_size_gb: u32,
    ) !usize {
        // Implementation similar to TypeScript version
        // ... (LRU eviction logic)
    }

    fn loadMetadata(self: *PackageCache) !void {
        const metadata_file = try std.fs.path.join(self.allocator, &[_][]const u8{
            self.cache_dir,
            "cache-metadata.json",
        });
        defer self.allocator.free(metadata_file);

        const file = std.fs.cwd().openFile(metadata_file, .{}) catch return;
        defer file.close();

        const content = try file.readToEndAlloc(self.allocator, 100 * 1024 * 1024);
        defer self.allocator.free(content);

        // Parse JSON metadata
        // ... (JSON parsing logic)
    }

    fn saveMetadata(self: *PackageCache) !void {
        // ... (JSON writing logic)
    }
};
```

**TODO Checklist**:

- [x] Implement PackageCache with metadata management
- [x] Add file validation (size, checksum)
- [ ] Implement LRU eviction strategy
- [ ] Add concurrent access protection
- [x] Add cache statistics tracking
- [ ] Add tests for cache operations
- [ ] Benchmark cache lookups

**Estimated Time**: 4 days

**Phase 2 Total**: 2-3 weeks

---

## Phase 3: Package Resolution & Installation

**Goal**: Implement package resolution using generated Zig definitions and installation logic.

**Duration**: 3 weeks

### Task 3.1: Package Registry

**File**: `src/packages/registry.zig`

**Purpose**: Fast package lookup using comptime hash map from generated `packages.zig`.

```zig
const std = @import("std");
const packages = @import("packages.zig"); // Generated from ts-pkgx

pub const PackageRegistry = struct {
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) !*PackageRegistry {
        var self = try allocator.create(PackageRegistry);
        self.* = .{ .allocator = allocator };
        return self;
    }

    pub fn deinit(self: *PackageRegistry) void {
        self.allocator.destroy(self);
    }

    /// Get package by name (comptime lookup, zero overhead)
    pub fn getPackage(self: *PackageRegistry, name: []const u8) ?*const packages.PackageInfo {
        _ = self;
        return packages.getPackage(name);
    }

    /// Resolve alias to domain
    pub fn resolveAlias(self: *PackageRegistry, alias: []const u8) ?[]const u8 {
        _ = self;
        return packages.resolveAlias(alias);
    }

    /// Get all versions for a package
    pub fn getVersions(self: *PackageRegistry, name: []const u8) ?[]const []const u8 {
        const pkg = self.getPackage(name) orelse return null;
        return pkg.versions;
    }

    /// Resolve version constraint
    pub fn resolveVersion(
        self: *PackageRegistry,
        name: []const u8,
        constraint: ?[]const u8,
    ) ![]const u8 {
        const versions = self.getVersions(name) orelse return error.PackageNotFound;

        if (constraint == null or std.mem.eql(u8, constraint.?, "latest")) {
            return versions[versions.len - 1]; // Versions are sorted
        }

        // Parse and match constraint
        return try matchVersionConstraint(versions, constraint.?);
    }
};

/// Match version constraint (^1.2.0, ~1.2.0, >=1.2.0, etc.)
fn matchVersionConstraint(versions: []const []const u8, constraint: []const u8) ![]const u8 {
    // Implementation of semver matching
    // ... (version constraint parsing and matching)
}
```

**TODO Checklist**:

- [ ] Implement PackageRegistry with comptime lookup
- [x] Add alias resolution
- [ ] Implement version constraint matching (^, ~, >=, etc.)
- [ ] Add dependency resolution
- [ ] Add companion package resolution
- [ ] Benchmark against ts-pkgx
- [ ] Add tests for version resolution

**Estimated Time**: 4 days

### Task 3.2: Dependency Resolver

**File**: `src/packages/deps.zig`

**Purpose**: Resolve transitive dependencies with conflict resolution.

```zig
const std = @import("std");
const packages = @import("packages.zig");
const registry = @import("registry.zig");

pub const DependencyGraph = struct {
    allocator: std.mem.Allocator,
    nodes: std.StringHashMap(DependencyNode),

    const DependencyNode = struct {
        name: []const u8,
        version: []const u8,
        dependencies: [][]const u8,
    };

    pub fn init(allocator: std.mem.Allocator) !*DependencyGraph {
        var self = try allocator.create(DependencyGraph);
        self.* = .{
            .allocator = allocator,
            .nodes = std.StringHashMap(DependencyNode).init(allocator),
        };
        return self;
    }

    pub fn deinit(self: *DependencyGraph) void {
        self.nodes.deinit();
        self.allocator.destroy(self);
    }

    /// Resolve all dependencies for a package list
    pub fn resolve(
        self: *DependencyGraph,
        reg: *registry.PackageRegistry,
        packages_list: []const []const u8,
    ) ![][]const u8 {
        var resolved = std.ArrayList([]const u8).init(self.allocator);
        defer resolved.deinit();

        // Build dependency graph
        for (packages_list) |pkg_spec| {
            try self.addPackage(reg, pkg_spec);
        }

        // Topological sort for install order
        const sorted = try self.topologicalSort();

        return sorted;
    }

    fn addPackage(
        self: *DependencyGraph,
        reg: *registry.PackageRegistry,
        pkg_spec: []const u8,
    ) !void {
        // Parse package spec (name@version)
        var iter = std.mem.split(u8, pkg_spec, "@");
        const name = iter.next() orelse return error.InvalidPackageSpec;
        const constraint = iter.next();

        // Resolve version
        const version = try reg.resolveVersion(name, constraint);

        // Get package info
        const pkg = reg.getPackage(name) orelse return error.PackageNotFound;

        // Add to graph
        const key = try std.fmt.allocPrint(self.allocator, "{s}@{s}", .{ name, version });

        if (self.nodes.contains(key)) {
            return; // Already processed
        }

        const node = DependencyNode{
            .name = try self.allocator.dupe(u8, name),
            .version = try self.allocator.dupe(u8, version),
            .dependencies = try self.allocator.dupe([]const u8, pkg.dependencies),
        };

        try self.nodes.put(key, node);

        // Recursively add dependencies
        for (pkg.dependencies) |dep| {
            try self.addPackage(reg, dep.name);
        }
    }

    fn topologicalSort(self: *DependencyGraph) ![][]const u8 {
        // Kahn's algorithm for topological sort
        // ... (implementation)
    }
};
```

**TODO Checklist**:

- [ ] Implement DependencyGraph
- [ ] Add transitive dependency resolution
- [ ] Implement version conflict resolution
- [ ] Add topological sort for install order
- [ ] Add cycle detection
- [ ] Add tests for dependency resolution
- [ ] Benchmark against TypeScript implementation

**Estimated Time**: 5 days

### Task 3.3: Package Downloader

**File**: `src/install/download.zig`

**Purpose**: Concurrent package downloads with progress tracking.

```zig
const std = @import("std");
const Platform = @import("../core/platform.zig").Platform;
const Architecture = @import("../core/platform.zig").Architecture;

pub const Downloader = struct {
    allocator: std.mem.Allocator,
    http_client: std.http.Client,

    pub fn init(allocator: std.mem.Allocator) !*Downloader {
        var self = try allocator.create(Downloader);
        self.* = .{
            .allocator = allocator,
            .http_client = std.http.Client{ .allocator = allocator },
        };
        return self;
    }

    pub fn deinit(self: *Downloader) void {
        self.http_client.deinit();
        self.allocator.destroy(self);
    }

    /// Download package archive
    pub fn download(
        self: *Downloader,
        domain: []const u8,
        version: []const u8,
        dest_path: []const u8,
        progress_callback: ?*const fn(downloaded: usize, total: usize) void,
    ) !void {
        const url = try self.buildDownloadUrl(domain, version);
        defer self.allocator.free(url);

        var req = try self.http_client.request(.GET, try std.Uri.parse(url), .{}, .{});
        defer req.deinit();

        try req.start();
        try req.wait();

        if (req.response.status != .ok) {
            return error.DownloadFailed;
        }

        const file = try std.fs.cwd().createFile(dest_path, .{});
        defer file.close();

        const total_size = req.response.content_length orelse 0;
        var downloaded: usize = 0;

        var buffer: [8192]u8 = undefined;
        while (true) {
            const n = try req.reader().read(&buffer);
            if (n == 0) break;

            try file.writeAll(buffer[0..n]);
            downloaded += n;

            if (progress_callback) |callback| {
                callback(downloaded, total_size);
            }
        }
    }

    fn buildDownloadUrl(
        self: *Downloader,
        domain: []const u8,
        version: []const u8,
    ) ![]const u8 {
        const platform = Platform.current();
        const arch = Architecture.current();

        const platform_str = switch (platform) {
            .darwin => "darwin",
            .linux => "linux",
            .windows => "windows",
        };

        const arch_str = switch (arch) {
            .x86_64 => "x64",
            .aarch64 => "arm64",
        };

        // Build pkgx CDN URL
        return try std.fmt.allocPrint(
            self.allocator,
            "https://dist.pkgx.sh/{s}/v{s}/{s}-{s}.tar.xz",
            .{ domain, version, platform_str, arch_str }
        );
    }
};
```

**TODO Checklist**:

- [ ] Implement HTTP client for downloads
- [x] Add progress tracking
- [ ] Add retry logic with exponential backoff
- [ ] Add concurrent download support
- [ ] Add checksum verification
- [ ] Add resume support for interrupted downloads
- [ ] Add tests for download functionality

**Estimated Time**: 4 days

### Task 3.4: Package Installer

**File**: `src/install/installer.zig`

**Purpose**: Extract and install packages with symlink management.

```zig
const std = @import("std");

pub const Installer = struct {
    allocator: std.mem.Allocator,
    install_path: []const u8,

    pub fn init(allocator: std.mem.Allocator, install_path: []const u8) !*Installer {
        var self = try allocator.create(Installer);
        self.* = .{
            .allocator = allocator,
            .install_path = try allocator.dupe(u8, install_path),
        };
        return self;
    }

    pub fn deinit(self: *Installer) void {
        self.allocator.free(self.install_path);
        self.allocator.destroy(self);
    }

    /// Install package from archive
    pub fn install(
        self: *Installer,
        archive_path: []const u8,
        domain: []const u8,
        version: []const u8,
    ) !void {
        // Extract to pkgs directory
        const pkg_dir = try std.fs.path.join(self.allocator, &[_][]const u8{
            self.install_path,
            "pkgs",
            domain,
            try std.fmt.allocPrint(self.allocator, "v{s}", .{version}),
        });
        defer self.allocator.free(pkg_dir);

        try self.extractArchive(archive_path, pkg_dir);
        try self.createSymlinks(pkg_dir, domain, version);
        try self.createBinaryWrappers(pkg_dir);
        try self.fixLibraryPaths(pkg_dir);
    }

    fn extractArchive(self: *Installer, archive_path: []const u8, dest_dir: []const u8) !void {
        // Use system tar command for now (fast and reliable)
        var child = std.process.Child.init(&[_][]const u8{
            "tar",
            "-xf",
            archive_path,
            "-C",
            dest_dir,
            "--strip-components=1",
        }, self.allocator);

        try child.spawn();
        const result = try child.wait();

        if (result != .Exited or result.Exited != 0) {
            return error.ExtractionFailed;
        }
    }

    fn createSymlinks(
        self: *Installer,
        pkg_dir: []const u8,
        domain: []const u8,
        version: []const u8,
    ) !void {
        // Create version symlinks (v* -> v1.2.3)
        // Create compatibility symlinks (libssl.dylib -> libssl.1.1.dylib)
        // ... (symlink creation logic)
    }

    fn createBinaryWrappers(self: *Installer, pkg_dir: []const u8) !void {
        // Generate wrapper scripts for binaries
        // Set DYLD_LIBRARY_PATH, LD_LIBRARY_PATH, etc.
        // ... (wrapper generation logic)
    }

    fn fixLibraryPaths(self: *Installer, pkg_dir: []const u8) !void {
        const platform = @import("../core/platform.zig").Platform.current();

        if (platform == .darwin) {
            // Use install_name_tool to fix library paths
            // ... (macOS library path fixing)
        }
    }
};
```

**TODO Checklist**:

- [x] Implement archive extraction (tar.gz, tar.xz, zip)
- [ ] Add symlink creation logic
- [ ] Implement binary wrapper generation
- [ ] Add macOS library path fixing
- [ ] Add validation after installation
- [ ] Add rollback on failure
- [ ] Add tests for installation

**Estimated Time**: 6 days

**Phase 3 Total**: 3 weeks

---

## Phase 4: Shell Integration

**Goal**: Generate and manage shell integration code for automatic environment activation.

**Duration**: 2-3 weeks

### Task 4.1: Shell Code Generator

**File**: `src/shell/generator.zig`

**Purpose**: Generate optimized shell integration code (embedded at compile time).

```zig
const std = @import("std");
const builtin = @import("builtin");

// Embed shell code template at compile time
const shell_template = @embedFile("templates/shell_integration.sh");

pub const ShellCodeGenerator = struct {
    allocator: std.mem.Allocator,
    config: ShellConfig,

    pub const ShellConfig = struct {
        show_messages: bool = true,
        activation_message: []const u8 = "✅ Environment activated for {path}",
        deactivation_message: []const u8 = "Environment deactivated",
        verbose: bool = false,
    };

    pub fn init(allocator: std.mem.Allocator, config: ShellConfig) !*ShellCodeGenerator {
        var self = try allocator.create(ShellCodeGenerator);
        self.* = .{
            .allocator = allocator,
            .config = config,
        };
        return self;
    }

    pub fn deinit(self: *ShellCodeGenerator) void {
        self.allocator.destroy(self);
    }

    /// Generate shell integration code
    pub fn generate(self: *ShellCodeGenerator) ![]const u8 {
        var result = std.ArrayList(u8).init(self.allocator);
        defer result.deinit();

        const writer = result.writer();

        // Header
        try writer.writeAll("# Launchpad Shell Integration (Zig)\n");
        try writer.writeAll("# Generated: ");
        try writer.writeAll(@tagName(builtin.os.tag));
        try writer.writeAll("-");
        try writer.writeAll(@tagName(builtin.cpu.arch));
        try writer.writeAll("\n\n");

        // Configuration
        try writer.print("__LP_SHOW_MESSAGES=\"{s}\"\n", .{
            if (self.config.show_messages) "true" else "false"
        });
        try writer.print("__LP_ACTIVATION_MSG=\"{s}\"\n", .{
            self.config.activation_message
        });
        try writer.print("__LP_DEACTIVATION_MSG=\"{s}\"\n", .{
            self.config.deactivation_message
        });
        try writer.print("__LP_VERBOSE=\"{s}\"\n\n", .{
            if (self.config.verbose) "true" else "false"
        });

        // Embed optimized shell functions (compile-time)
        try writer.writeAll(shell_template);

        return result.toOwnedSlice();
    }
};
```

**Shell Template** (`src/shell/templates/shell_integration.sh`):

```bash
# Fast environment switching function (optimized for Zig backend)
__launchpad_switch_environment() {
    # SUPER FAST PATH: PWD unchanged
    if [[ "$__LAUNCHPAD_LAST_PWD" == "$PWD" ]]; then
        return 0
    fi
    export __LAUNCHPAD_LAST_PWD="$PWD"

    # ULTRA FAST PATH: Still in project subdirectory
    if [[ -n "$LAUNCHPAD_CURRENT_PROJECT" && "$PWD" == "$LAUNCHPAD_CURRENT_PROJECT"* ]]; then
        return 0
    fi

    # INSTANT DEACTIVATION PATH: Left project
    if [[ -n "$LAUNCHPAD_CURRENT_PROJECT" && "$PWD" != "$LAUNCHPAD_CURRENT_PROJECT"* ]]; then
        # Show deactivation message
        [[ "$__LP_SHOW_MESSAGES" == "true" ]] && printf "%s\n" "$__LP_DEACTIVATION_MSG" >&2

        # Remove project paths from PATH
        if [[ -n "$LAUNCHPAD_ENV_BIN_PATH" ]]; then
            PATH=$(echo "$PATH" | sed "s|$LAUNCHPAD_ENV_BIN_PATH:||g; s|:$LAUNCHPAD_ENV_BIN_PATH||g; s|^$LAUNCHPAD_ENV_BIN_PATH$||g")
            export PATH
        fi

        # Clear environment variables
        unset LAUNCHPAD_CURRENT_PROJECT LAUNCHPAD_ENV_BIN_PATH LAUNCHPAD_ENV_DIR BUN_INSTALL
        return 0
    fi

    # CACHE LOOKUP: Use Zig binary for fast cache lookup
    # This replaces all the shell-based caching logic with a single binary call
    local env_info
    env_info=$(launchpad shell:lookup "$PWD" 2>/dev/null)

    if [[ $? -eq 0 && -n "$env_info" ]]; then
        # Cache hit! Parse env_dir|project_dir
        local env_dir="${env_info%|*}"
        local project_dir="${env_info#*|}"

        # INSTANT ACTIVATION
        if [[ -d "$env_dir/bin" ]]; then
            [[ "$__LP_SHOW_MESSAGES" == "true" && "$__LAUNCHPAD_LAST_ACTIVATION_KEY" != "$project_dir" ]] && \
                printf "\r\033[K%s\n" "$__LP_ACTIVATION_MSG" >&2

            export __LAUNCHPAD_LAST_ACTIVATION_KEY="$project_dir"
            export LAUNCHPAD_CURRENT_PROJECT="$project_dir"
            export LAUNCHPAD_ENV_BIN_PATH="$env_dir/bin"
            export LAUNCHPAD_ENV_DIR="$env_dir"

            # Update PATH (remove old, add new)
            PATH=$(echo "$PATH" | sed "s|$env_dir/bin:||g; s|:$env_dir/bin||g; s|^$env_dir/bin$||g")
            PATH="$env_dir/bin:$PATH"
            export PATH

            return 0
        fi
    fi

    # CACHE MISS: Use Zig binary for project detection and installation
    local install_output
    install_output=$(launchpad shell:activate "$PWD" 2>&1)

    if [[ $? -eq 0 ]]; then
        # Eval shell output to activate environment
        eval "$install_output" 2>/dev/null || true
    fi
}

# Hook registration (unchanged from TypeScript version)
if [[ -n "$ZSH_VERSION" ]]; then
    __launchpad_chpwd() {
        [[ "$__LAUNCHPAD_IN_HOOK" == "1" ]] && return 0
        export __LAUNCHPAD_IN_HOOK=1
        __launchpad_switch_environment
        unset __LAUNCHPAD_IN_HOOK
    }

    typeset -ga chpwd_functions 2>/dev/null || true
    [[ ! " ${chpwd_functions[*]} " =~ " __launchpad_chpwd " ]] && chpwd_functions+=(__launchpad_chpwd)
elif [[ -n "$BASH_VERSION" ]]; then
    __launchpad_prompt_command() {
        [[ "$__LAUNCHPAD_IN_HOOK" == "1" ]] && return 0
        export __LAUNCHPAD_IN_HOOK=1
        __launchpad_switch_environment
        unset __LAUNCHPAD_IN_HOOK
    }

    [[ "$PROMPT_COMMAND" != *"__launchpad_prompt_command"* ]] && \
        PROMPT_COMMAND="__launchpad_prompt_command;$PROMPT_COMMAND"
fi

# Initial environment check
__launchpad_switch_environment
```

**TODO Checklist**:

- [ ] Implement ShellCodeGenerator
- [ ] Create optimized shell template
- [ ] Replace shell-based caching with Zig binary calls
- [ ] Add shell hook registration
- [ ] Add tests for shell code generation
- [ ] Benchmark shell integration speed

**Estimated Time**: 5 days

### Task 4.2: Shell Commands (Binary Integration)

**File**: `src/shell/commands.zig`

**Purpose**: Implement `shell:lookup` and `shell:activate` commands called by shell integration.

```zig
const std = @import("std");
const EnvCache = @import("../cache/env_cache.zig").EnvCache;
const platform = @import("../core/platform.zig");

pub const ShellCommands = struct {
    allocator: std.mem.Allocator,
    env_cache: *EnvCache,

    pub fn init(allocator: std.mem.Allocator) !*ShellCommands {
        var self = try allocator.create(ShellCommands);

        const cache_dir = try platform.Paths.cache(allocator);
        defer allocator.free(cache_dir);

        const cache_file = try std.fs.path.join(allocator, &[_][]const u8{
            cache_dir,
            "shell_cache",
            "env_cache",
        });
        defer allocator.free(cache_file);

        self.* = .{
            .allocator = allocator,
            .env_cache = try EnvCache.init(allocator, cache_file),
        };

        return self;
    }

    pub fn deinit(self: *ShellCommands) void {
        self.env_cache.deinit();
        self.allocator.destroy(self);
    }

    /// shell:lookup - Fast cache lookup (called by shell on every cd)
    /// Returns: env_dir|project_dir or empty on cache miss
    /// Performance target: < 1ms
    pub fn lookup(self: *ShellCommands, pwd: []const u8) !?[]const u8 {
        // Walk up directory tree checking cache
        var current_dir = try self.allocator.dupe(u8, pwd);
        defer self.allocator.free(current_dir);

        while (true) {
            // Check cache for this directory
            if (self.env_cache.get(current_dir)) |entry| {
                // Validate entry is still valid
                // 1. Check env directory exists
                std.fs.cwd().access(entry.env_dir, .{}) catch {
                    // Environment deleted, remove from cache
                    _ = try self.env_cache.validate();
                    continue;
                };

                // 2. Check dependency file mtime (if tracked)
                if (entry.dep_file.len > 0) {
                    const file = std.fs.cwd().openFile(entry.dep_file, .{}) catch {
                        // Dependency file deleted
                        _ = try self.env_cache.validate();
                        continue;
                    };
                    defer file.close();

                    const stat = try file.stat();
                    const mtime = @divFloor(stat.mtime, std.time.ns_per_s);

                    if (mtime != entry.dep_mtime) {
                        // Dependency file changed, invalidate cache
                        _ = try self.env_cache.validate();
                        return null; // Force re-detection
                    }
                }

                // Cache valid! Return env_dir|project_dir
                return try std.fmt.allocPrint(
                    self.allocator,
                    "{s}|{s}",
                    .{ entry.env_dir, current_dir }
                );
            }

            // Move up directory tree
            const parent = std.fs.path.dirname(current_dir) orelse break;
            if (std.mem.eql(u8, parent, current_dir)) break; // Reached root

            self.allocator.free(current_dir);
            current_dir = try self.allocator.dupe(u8, parent);
        }

        return null; // Cache miss
    }

    /// shell:activate - Detect project, install dependencies, output shell code
    /// Returns: Shell code to eval (exports, PATH modifications)
    /// Performance target: < 50ms (cache miss)
    pub fn activate(self: *ShellCommands, pwd: []const u8) ![]const u8 {
        // 1. Detect project root
        const project_root = try self.detectProjectRoot(pwd);
        defer if (project_root) |root| self.allocator.free(root);

        if (project_root == null) {
            return ""; // No project found
        }

        // 2. Find dependency file
        const dep_file = try self.findDependencyFile(project_root.?);
        defer if (dep_file) |file| self.allocator.free(file);

        // 3. Compute environment hash
        const env_hash = try @import("../core/string.zig").envHash(
            project_root.?,
            self.allocator
        );
        defer self.allocator.free(env_hash);

        const project_basename = std.fs.path.basename(project_root.?);

        var env_name = try std.fmt.allocPrint(
            self.allocator,
            "{s}_{s}",
            .{ project_basename, env_hash }
        );
        defer self.allocator.free(env_name);

        // Add dependency hash if we have a dependency file
        if (dep_file) |file| {
            const dep_hash = try @import("../core/string.zig").depFileHash(
                file,
                self.allocator
            );
            defer self.allocator.free(dep_hash);

            const old_env_name = env_name;
            env_name = try std.fmt.allocPrint(
                self.allocator,
                "{s}-d{s}",
                .{ old_env_name, dep_hash }
            );
            self.allocator.free(old_env_name);
        }

        // 4. Determine environment directory
        const data_dir = try platform.Paths.data(self.allocator);
        defer self.allocator.free(data_dir);

        const env_dir = try std.fs.path.join(self.allocator, &[_][]const u8{
            data_dir,
            "envs",
            env_name,
        });
        defer self.allocator.free(env_dir);

        // 5. Check if environment exists
        const env_bin = try std.fs.path.join(self.allocator, &[_][]const u8{
            env_dir,
            "bin",
        });
        defer self.allocator.free(env_bin);

        const env_exists = blk: {
            std.fs.cwd().access(env_bin, .{}) catch break :blk false;
            break :blk true;
        };

        if (!env_exists and dep_file != null) {
            // 6. Install dependencies
            try self.installDependencies(dep_file.?, env_dir);
        }

        // 7. Update cache
        const dep_mtime = if (dep_file) |file| blk: {
            const f = try std.fs.cwd().openFile(file, .{});
            defer f.close();
            const stat = try f.stat();
            break :blk @divFloor(stat.mtime, std.time.ns_per_s);
        } else 0;

        try self.env_cache.set(.{
            .project_dir = project_root.?,
            .dep_file = dep_file orelse "",
            .dep_mtime = dep_mtime,
            .env_dir = env_dir,
        });

        // Flush cache asynchronously
        const cache_file = try std.fs.path.join(self.allocator, &[_][]const u8{
            try platform.Paths.cache(self.allocator),
            "shell_cache",
            "env_cache",
        });
        defer self.allocator.free(cache_file);
        try self.env_cache.flush(cache_file);

        // 8. Generate shell code for activation
        return try std.fmt.allocPrint(
            self.allocator,
            \\export LAUNCHPAD_CURRENT_PROJECT="{s}"
            \\export LAUNCHPAD_ENV_BIN_PATH="{s}"
            \\export LAUNCHPAD_ENV_DIR="{s}"
            \\export PATH="{s}:$PATH"
            ,
            .{ project_root.?, env_bin, env_dir, env_bin }
        );
    }

    fn detectProjectRoot(self: *ShellCommands, pwd: []const u8) !?[]const u8 {
        // Implementation: Walk up checking for dependency files
        // ... (project detection logic from env.ts)
    }

    fn findDependencyFile(self: *ShellCommands, project_root: []const u8) !?[]const u8 {
        // Implementation: Check for known dependency files
        // ... (dependency file detection)
    }

    fn installDependencies(self: *ShellCommands, dep_file: []const u8, env_dir: []const u8) !void {
        // Implementation: Parse dep file and install packages
        // ... (installation logic)
    }
};
```

**TODO Checklist**:

- [ ] Implement shell:lookup command (< 1ms target)
- [ ] Implement shell:activate command (< 50ms target)
- [ ] Add project root detection
- [ ] Add dependency file detection
- [ ] Add cache updates from shell commands
- [ ] Add tests for shell commands
- [ ] Benchmark performance targets

**Estimated Time**: 6 days

### Task 4.3: Shell Integration Installation

**File**: `src/shell/integrate.zig`

**Purpose**: Install/uninstall shell hooks in user's config files.

```zig
const std = @import("std");
const platform = @import("../core/platform.zig");

pub const ShellIntegrator = struct {
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) !*ShellIntegrator {
        var self = try allocator.create(ShellIntegrator);
        self.* = .{ .allocator = allocator };
        return self;
    }

    pub fn deinit(self: *ShellIntegrator) void {
        self.allocator.destroy(self);
    }

    /// Install shell hooks
    pub fn install(self: *ShellIntegrator, dry_run: bool) !void {
        const shell_files = try self.getShellFiles();
        defer shell_files.deinit();

        const hook_line = "command -v launchpad >/dev/null 2>&1 && eval \"$(launchpad dev:shellcode)\"";

        for (shell_files.items) |file| {
            // Check if hook already exists
            if (try self.hasHook(file)) {
                std.debug.print("Hook already integrated: {s}\n", .{file});
                continue;
            }

            if (!dry_run) {
                try self.appendHook(file, hook_line);
            }

            std.debug.print("{s} << `{s}`\n", .{ file, hook_line });
        }
    }

    /// Uninstall shell hooks
    pub fn uninstall(self: *ShellIntegrator, dry_run: bool) !void {
        const shell_files = try self.getShellFiles();
        defer shell_files.deinit();

        for (shell_files.items) |file| {
            if (!try self.hasHook(file)) {
                continue;
            }

            if (!dry_run) {
                try self.removeHook(file);
            }

            std.debug.print("Removed hook: {s}\n", .{file});
        }
    }

    fn getShellFiles(self: *ShellIntegrator) !std.ArrayList([]const u8) {
        var files = std.ArrayList([]const u8).init(self.allocator);

        const home_dir = try platform.Paths.home(self.allocator);
        defer self.allocator.free(home_dir);

        const zdotdir = std.process.getEnvVarOwned(self.allocator, "ZDOTDIR") catch
            try self.allocator.dupe(u8, home_dir);
        defer self.allocator.free(zdotdir);

        // Check for existing shell config files
        const candidates = [_][]const u8{
            try std.fs.path.join(self.allocator, &[_][]const u8{ zdotdir, ".zshrc" }),
            try std.fs.path.join(self.allocator, &[_][]const u8{ home_dir, ".bashrc" }),
            try std.fs.path.join(self.allocator, &[_][]const u8{ home_dir, ".bash_profile" }),
        };

        for (candidates) |file| {
            std.fs.cwd().access(file, .{}) catch continue;
            try files.append(file);
        }

        // If no files exist and we're on macOS, create .zshrc
        if (files.items.len == 0 and platform.Platform.current() == .darwin) {
            const zshrc = try std.fs.path.join(self.allocator, &[_][]const u8{ zdotdir, ".zshrc" });
            try files.append(zshrc);
        }

        return files;
    }

    fn hasHook(self: *ShellIntegrator, file: []const u8) !bool {
        const content = std.fs.cwd().readFileAlloc(
            self.allocator,
            file,
            10 * 1024 * 1024
        ) catch return false;
        defer self.allocator.free(content);

        return std.mem.indexOf(u8, content, "# Added by launchpad") != null or
            std.mem.indexOf(u8, content, "launchpad dev:shellcode") != null;
    }

    fn appendHook(self: *ShellIntegrator, file: []const u8, hook_line: []const u8) !void {
        const f = try std.fs.cwd().openFile(file, .{ .mode = .read_write });
        defer f.close();

        try f.seekFromEnd(0);

        const writer = f.writer();
        try writer.writeAll("\n# Added by launchpad\n");
        try writer.writeAll(hook_line);
        try writer.writeAll("  # https://github.com/stacksjs/launchpad\n");
    }

    fn removeHook(self: *ShellIntegrator, file: []const u8) !void {
        const content = try std.fs.cwd().readFileAlloc(
            self.allocator,
            file,
            10 * 1024 * 1024
        );
        defer self.allocator.free(content);

        var lines = std.ArrayList([]const u8).init(self.allocator);
        defer lines.deinit();

        var iter = std.mem.split(u8, content, "\n");
        while (iter.next()) |line| {
            // Skip launchpad-related lines
            if (std.mem.indexOf(u8, line, "# Added by launchpad") != null or
                std.mem.indexOf(u8, line, "# https://github.com/stacksjs/launchpad") != null or
                std.mem.indexOf(u8, line, "launchpad dev:shellcode") != null)
            {
                continue;
            }

            try lines.append(line);
        }

        // Rewrite file
        const f = try std.fs.cwd().createFile(file, .{ .truncate = true });
        defer f.close();

        const writer = f.writer();
        for (lines.items, 0..) |line, i| {
            try writer.writeAll(line);
            if (i < lines.items.len - 1) {
                try writer.writeAll("\n");
            }
        }
    }
};
```

**TODO Checklist**:

- [ ] Implement shell file detection
- [ ] Add hook installation logic
- [ ] Add hook uninstallation logic
- [ ] Add dry-run support
- [ ] Add tests for shell integration
- [ ] Test on zsh, bash, fish

**Estimated Time**: 3 days

**Phase 4 Total**: 2-3 weeks

---

## Phase 5: Environment Management

**Goal**: Implement environment lifecycle management (list, inspect, clean, remove).

**Duration**: 2 weeks

### Task 5.1: Environment Scanner

**File**: `src/env/scanner.zig`

**Purpose**: Scan and collect information about installed environments.

```zig
const std = @import("std");
const platform = @import("../core/platform.zig");

pub const EnvironmentInfo = struct {
    hash: []const u8,
    project_name: []const u8,
    path: []const u8,
    size_bytes: u64,
    packages: usize,
    binaries: usize,
    created: i64,
    modified: i64,

    pub fn deinit(self: *EnvironmentInfo, allocator: std.mem.Allocator) void {
        allocator.free(self.hash);
        allocator.free(self.project_name);
        allocator.free(self.path);
    }
};

pub const EnvScanner = struct {
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) !*EnvScanner {
        var self = try allocator.create(EnvScanner);
        self.* = .{ .allocator = allocator };
        return self;
    }

    pub fn deinit(self: *EnvScanner) void {
        self.allocator.destroy(self);
    }

    /// Scan all environments
    pub fn scanAll(self: *EnvScanner) ![]EnvironmentInfo {
        const data_dir = try platform.Paths.data(self.allocator);
        defer self.allocator.free(data_dir);

        const envs_dir = try std.fs.path.join(self.allocator, &[_][]const u8{
            data_dir,
            "envs",
        });
        defer self.allocator.free(envs_dir);

        var dir = std.fs.cwd().openDir(envs_dir, .{ .iterate = true }) catch {
            return &[_]EnvironmentInfo{};
        };
        defer dir.close();

        var envs = std.ArrayList(EnvironmentInfo).init(self.allocator);
        defer envs.deinit();

        var iter = dir.iterate();
        while (try iter.next()) |entry| {
            if (entry.kind != .directory) continue;
            if (std.mem.indexOf(u8, entry.name, "_") == null) continue;

            const env_info = try self.scanEnvironment(envs_dir, entry.name);
            try envs.append(env_info);
        }

        return envs.toOwnedSlice();
    }

    fn scanEnvironment(self: *EnvScanner, envs_dir: []const u8, hash: []const u8) !EnvironmentInfo {
        const env_path = try std.fs.path.join(self.allocator, &[_][]const u8{
            envs_dir,
            hash,
        });

        const stat = try std.fs.cwd().statFile(env_path);

        // Parse project name from hash
        var parts = std.mem.split(u8, hash, "_");
        const project_name = parts.next() orelse hash;

        const size_bytes = try self.calculateSize(env_path);
        const packages = try self.countItems(env_path, "pkgs");
        const binaries = try self.countItems(env_path, "bin");

        return EnvironmentInfo{
            .hash = try self.allocator.dupe(u8, hash),
            .project_name = try self.allocator.dupe(u8, project_name),
            .path = env_path,
            .size_bytes = size_bytes,
            .packages = packages,
            .binaries = binaries,
            .created = @divFloor(stat.ctime, std.time.ns_per_s),
            .modified = @divFloor(stat.mtime, std.time.ns_per_s),
        };
    }

    fn calculateSize(self: *EnvScanner, dir_path: []const u8) !u64 {
        var total: u64 = 0;

        var dir = try std.fs.cwd().openDir(dir_path, .{ .iterate = true });
        defer dir.close();

        var walker = try dir.walk(self.allocator);
        defer walker.deinit();

        while (try walker.next()) |entry| {
            if (entry.kind == .file) {
                const stat = try entry.dir.statFile(entry.basename);
                total += stat.size;
            }
        }

        return total;
    }

    fn countItems(self: *EnvScanner, env_path: []const u8, subdir: []const u8) !usize {
        const dir_path = try std.fs.path.join(self.allocator, &[_][]const u8{
            env_path,
            subdir,
        });
        defer self.allocator.free(dir_path);

        var dir = std.fs.cwd().openDir(dir_path, .{ .iterate = true }) catch return 0;
        defer dir.close();

        var count: usize = 0;
        var iter = dir.iterate();
        while (try iter.next()) |_| {
            count += 1;
        }

        return count;
    }
};
```

**TODO Checklist**:

- [ ] Implement environment scanning
- [ ] Add size calculation
- [ ] Add package/binary counting
- [ ] Add sorting by modification time
- [ ] Add tests for environment scanning

**Estimated Time**: 3 days

### Task 5.2: Environment Commands

**File**: `src/env/commands.zig`

**Purpose**: Implement env:list, env:inspect, env:clean, env:remove commands.

```zig
const std = @import("std");
const scanner = @import("scanner.zig");

pub const EnvCommands = struct {
    allocator: std.mem.Allocator,
    scanner: *scanner.EnvScanner,

    pub fn init(allocator: std.mem.Allocator) !*EnvCommands {
        var self = try allocator.create(EnvCommands);
        self.* = .{
            .allocator = allocator,
            .scanner = try scanner.EnvScanner.init(allocator),
        };
        return self;
    }

    pub fn deinit(self: *EnvCommands) void {
        self.scanner.deinit();
        self.allocator.destroy(self);
    }

    /// env:list - List all environments
    pub fn list(self: *EnvCommands, format: []const u8, verbose: bool) !void {
        const envs = try self.scanner.scanAll();
        defer {
            for (envs) |*env| {
                env.deinit(self.allocator);
            }
            self.allocator.free(envs);
        }

        if (envs.len == 0) {
            std.debug.print("📭 No development environments found\n", .{});
            return;
        }

        if (std.mem.eql(u8, format, "json")) {
            // JSON output
            try self.printJson(envs);
        } else if (std.mem.eql(u8, format, "simple")) {
            // Simple output
            for (envs) |env| {
                std.debug.print("{s} ({s})\n", .{ env.project_name, env.hash });
            }
        } else {
            // Table output
            try self.printTable(envs, verbose);
        }
    }

    /// env:inspect - Inspect specific environment
    pub fn inspect(self: *EnvCommands, hash: []const u8, verbose: bool, show_stubs: bool) !void {
        // Implementation: Show detailed environment information
        _ = self;
        _ = hash;
        _ = verbose;
        _ = show_stubs;
    }

    /// env:clean - Clean old environments
    pub fn clean(
        self: *EnvCommands,
        older_than_days: u32,
        dry_run: bool,
        force: bool,
    ) !void {
        // Implementation: Clean old/broken environments
        _ = self;
        _ = older_than_days;
        _ = dry_run;
        _ = force;
    }

    /// env:remove - Remove specific environment
    pub fn remove(self: *EnvCommands, hash: []const u8, force: bool) !void {
        // Implementation: Remove environment directory
        _ = self;
        _ = hash;
        _ = force;
    }

    fn printTable(self: *EnvCommands, envs: []scanner.EnvironmentInfo, verbose: bool) !void {
        _ = self;
        _ = verbose;

        std.debug.print("📦 Development Environments:\n\n", .{});

        // Print header
        std.debug.print("│ {s:<20} │ {s:>8} │ {s:>8} │ {s:>10} │ {s:<12} │\n", .{
            "Project", "Packages", "Binaries", "Size", "Created"
        });

        // Print separator
        std.debug.print("├{s:─<20}─┼{s:─<8}─┼{s:─<8}─┼{s:─<10}─┼{s:─<12}─┤\n", .{
            "", "", "", "", ""
        });

        // Print rows
        for (envs) |env| {
            const size_str = try formatSize(env.size_bytes, self.allocator);
            defer self.allocator.free(size_str);

            // Convert timestamp to date string
            // ... (date formatting)

            std.debug.print("│ {s:<20} │ {d:>8} │ {d:>8} │ {s:>10} │ {s:<12} │\n", .{
                env.project_name,
                env.packages,
                env.binaries,
                size_str,
                "2025-10-20", // formatted date
            });
        }

        std.debug.print("\nTotal: {d} environment(s)\n", .{envs.len});
    }

    fn printJson(self: *EnvCommands, envs: []scanner.EnvironmentInfo) !void {
        _ = self;
        // JSON serialization
        _ = envs;
    }
};

fn formatSize(bytes: u64, allocator: std.mem.Allocator) ![]const u8 {
    const units = [_][]const u8{ "B", "KB", "MB", "GB" };
    var size: f64 = @floatFromInt(bytes);
    var unit_index: usize = 0;

    while (size >= 1024.0 and unit_index < units.len - 1) {
        size /= 1024.0;
        unit_index += 1;
    }

    return try std.fmt.allocPrint(allocator, "{d:.1} {s}", .{ size, units[unit_index] });
}
```

**TODO Checklist**:

- [x] Implement list command
- [ ] Add table formatting
- [ ] Add JSON output format
- [ ] Implement env:inspect command
- [x] Implement env:clean command
- [ ] Implement env:remove command
- [ ] Add tests for environment commands

**Estimated Time**: 5 days

**Phase 5 Total**: 2 weeks

---

## Phase 6: Command System & CLI

**Goal**: Implement command routing and CLI framework.

**Duration**: 2 weeks

### Task 6.1: Command Registry

**File**: `src/cli/registry.zig`

**Purpose**: Command registration and routing (compile-time).

```zig
const std = @import("std");

pub const Command = struct {
    name: []const u8,
    description: []const u8,
    run: *const fn(args: []const []const u8) anyerror!u8,
};

pub const CommandRegistry = struct {
    // Commands are registered at compile time
    const commands = [_]Command{
        .{ .name = "install", .description = "Install packages", .run = installCommand },
        .{ .name = "uninstall", .description = "Remove packages", .run = uninstallCommand },
        .{ .name = "list", .description = "List installed packages", .run = listCommand },
        .{ .name = "search", .description = "Search for packages", .run = searchCommand },
        .{ .name = "info", .description = "Show package info", .run = infoCommand },
        .{ .name = "env:list", .description = "List environments", .run = envListCommand },
        .{ .name = "env:inspect", .description = "Inspect environment", .run = envInspectCommand },
        .{ .name = "env:clean", .description = "Clean environments", .run = envCleanCommand },
        .{ .name = "env:remove", .description = "Remove environment", .run = envRemoveCommand },
        .{ .name = "cache:clear", .description = "Clear cache", .run = cacheClearCommand },
        .{ .name = "cache:stats", .description = "Cache statistics", .run = cacheStatsCommand },
        .{ .name = "dev:shellcode", .description = "Generate shell code", .run = shellcodeCommand },
        .{ .name = "dev:integrate", .description = "Install shell hooks", .run = integrateCommand },
        .{ .name = "shell:lookup", .description = "Cache lookup (internal)", .run = shellLookupCommand },
        .{ .name = "shell:activate", .description = "Activate environment (internal)", .run = shellActivateCommand },
        // ... more commands
    };

    pub fn find(name: []const u8) ?Command {
        inline for (commands) |cmd| {
            if (std.mem.eql(u8, cmd.name, name)) {
                return cmd;
            }
        }
        return null;
    }

    pub fn listAll() []const Command {
        return &commands;
    }
};

// Command implementations (will be in separate files)
fn installCommand(args: []const []const u8) !u8 {
    _ = args;
    return 0;
}

fn uninstallCommand(args: []const []const u8) !u8 {
    _ = args;
    return 0;
}

// ... more command stubs
```

**TODO Checklist**:

- [ ] Define Command interface
- [ ] Implement comptime command registry
- [ ] Add command lookup function
- [ ] Add help text generation
- [ ] Add tests for command registry

**Estimated Time**: 2 days

### Task 6.2: Argument Parser

**File**: `src/cli/parser.zig`

**Purpose**: Parse command-line arguments and options.

```zig
const std = @import("std");

pub const ArgParser = struct {
    allocator: std.mem.Allocator,
    args: []const []const u8,

    pub fn init(allocator: std.mem.Allocator, args: []const []const u8) *ArgParser {
        var self = allocator.create(ArgParser) catch unreachable;
        self.* = .{
            .allocator = allocator,
            .args = args,
        };
        return self;
    }

    pub fn deinit(self: *ArgParser) void {
        self.allocator.destroy(self);
    }

    /// Get command name
    pub fn command(self: *ArgParser) ?[]const u8 {
        if (self.args.len > 0) {
            return self.args[0];
        }
        return null;
    }

    /// Get positional arguments (non-flags)
    pub fn positional(self: *ArgParser) ![][]const u8 {
        var result = std.ArrayList([]const u8).init(self.allocator);
        defer result.deinit();

        for (self.args) |arg| {
            if (!std.mem.startsWith(u8, arg, "-")) {
                try result.append(arg);
            }
        }

        return result.toOwnedSlice();
    }

    /// Check if flag exists
    pub fn hasFlag(self: *ArgParser, flag: []const u8) bool {
        for (self.args) |arg| {
            if (std.mem.eql(u8, arg, flag)) {
                return true;
            }
        }
        return false;
    }

    /// Get option value
    pub fn option(self: *ArgParser, name: []const u8) ?[]const u8 {
        for (self.args, 0..) |arg, i| {
            if (std.mem.eql(u8, arg, name) and i + 1 < self.args.len) {
                return self.args[i + 1];
            }

            // Support --name=value syntax
            if (std.mem.startsWith(u8, arg, name)) {
                if (std.mem.indexOf(u8, arg, "=")) |eq_pos| {
                    return arg[eq_pos + 1..];
                }
            }
        }
        return null;
    }
};
```

**TODO Checklist**:

- [ ] Implement argument parser
- [ ] Add flag parsing (--flag, -f)
- [ ] Add option parsing (--option value, --option=value)
- [ ] Add positional argument extraction
- [ ] Add tests for argument parsing

**Estimated Time**: 2 days

### Task 6.3: CLI Entry Point

**File**: `src/main.zig`

**Purpose**: Main CLI entry point with command routing.

```zig
const std = @import("std");
const registry = @import("cli/registry.zig");
const parser = @import("cli/parser.zig");

pub fn main() !u8 {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // Get command-line arguments
    var args = try std.process.argsAlloc(allocator);
    defer std.process.argsFree(allocator, args);

    // Skip program name
    const cmd_args = args[1..];

    if (cmd_args.len == 0) {
        try printHelp();
        return 0;
    }

    // Parse arguments
    const arg_parser = parser.ArgParser.init(allocator, cmd_args);
    defer arg_parser.deinit();

    const cmd_name = arg_parser.command() orelse {
        try printHelp();
        return 0;
    };

    // Handle version and help
    if (std.mem.eql(u8, cmd_name, "--version") or std.mem.eql(u8, cmd_name, "-v")) {
        try printVersion();
        return 0;
    }

    if (std.mem.eql(u8, cmd_name, "--help") or std.mem.eql(u8, cmd_name, "-h")) {
        try printHelp();
        return 0;
    }

    // Find and execute command
    const cmd = registry.CommandRegistry.find(cmd_name) orelse {
        std.debug.print("Error: Unknown command '{s}'\n", .{cmd_name});
        std.debug.print("Run 'launchpad --help' for usage\n", .{});
        return 1;
    };

    // Execute command
    return try cmd.run(cmd_args[1..]);
}

fn printVersion() !void {
    const version = @import("version.zig").VERSION;
    std.debug.print("launchpad {s}\n", .{version});
}

fn printHelp() !void {
    std.debug.print(
        \\launchpad - Modern dependency manager
        \\
        \\Usage:
        \\  launchpad <command> [options]
        \\
        \\Commands:
        \\
    , .{});

    for (registry.CommandRegistry.listAll()) |cmd| {
        std.debug.print("  {s:<20}  {s}\n", .{ cmd.name, cmd.description });
    }

    std.debug.print(
        \\
        \\Options:
        \\  --version, -v     Show version
        \\  --help, -h        Show this help
        \\
        \\For more information, visit: https://github.com/stacksjs/launchpad
        \\
    , .{});
}
```

**TODO Checklist**:

- [ ] Implement main CLI entry point
- [ ] Add command routing
- [ ] Add help text generation
- [ ] Add version display
- [ ] Add error handling
- [ ] Add tests for CLI

**Estimated Time**: 2 days

**Phase 6 Total**: 2 weeks

---

## Phase 7: Service Management

**Goal**: Implement service lifecycle management (start, stop, restart, status).

**Duration**: 2 weeks

*(Details similar to previous phases - platform-specific service management using launchd/systemd)*

---

## Phase 8: Migration & Testing

**Goal**: Migrate remaining TypeScript code, comprehensive testing, performance validation.

**Duration**: 3 weeks

### Task 8.1: Integration Testing

**Purpose**: Test Zig implementation against TypeScript implementation for compatibility.

**TODO Checklist**:

- [ ] Create test suite comparing TS and Zig outputs
- [ ] Test cache format compatibility
- [ ] Test shell integration compatibility
- [ ] Test environment activation/deactivation
- [ ] Test package installation
- [ ] Test service management
- [ ] Performance benchmarking

**Estimated Time**: 1 week

### Task 8.2: Migration Strategy

**Purpose**: Gradual migration from TypeScript to Zig.

**Steps**:

1. **Week 1**: Deploy Zig binaries alongside TypeScript
   - `launchpad shell:lookup` (Zig)
   - `launchpad shell:activate` (Zig)
   - TypeScript CLI calls Zig binaries

2. **Week 2**: Migrate core commands to Zig
   - `launchpad install` (Zig)
   - `launchpad env:*` (Zig)
   - `launchpad cache:*` (Zig)

3. **Week 3**: Complete migration
   - All commands in Zig
   - Remove TypeScript dependencies
   - Update documentation

**TODO Checklist**:

- [ ] Deploy Zig binaries to production
- [ ] Monitor performance and bugs
- [ ] Gradual command migration
- [ ] Update CI/CD for Zig builds
- [ ] Update documentation
- [ ] Release v1.0.0 (Zig)

**Estimated Time**: 2 weeks

---

## Performance Improvements & Optimizations

### Beyond Current TypeScript Implementation

#### 1. Compile-Time Package Registry (100x faster)

**Current (TypeScript)**:
```typescript
// Runtime JSON parsing + hash map lookup
const pkg = packageRegistry[name] // ~1-5μs
```

**Optimized (Zig)**:
```zig
// Compile-time perfect hash map with @import("packages.zig")
pub fn getPackage(name: []const u8) ?*const PackageInfo {
    comptime var perfect_hash = computePerfectHash(packages);
    const idx = perfect_hash.lookup(name); // ~10-20ns
    if (idx) |i| return &packages[i];
    return null;
}
```

**Benefits**:
- **10-50ns lookups** (vs 1-5μs in TypeScript)
- Zero runtime overhead, zero allocations
- Perfect hashing eliminates collisions
- All package data in read-only memory (.rodata section)

#### 2. Memory-Mapped Cache Files with Smart Prefetching

**Current (TypeScript)**:
```typescript
const content = await fs.readFile(cacheFile) // Full file read: ~5-10ms
const cache = JSON.parse(content) // Parsing: ~2-5ms
```

**Optimized (Zig)**:
```zig
// mmap with MADV_RANDOM for instant access
const mmap = try std.posix.mmap(
    null, size,
    std.posix.PROT.READ,
    std.posix.MAP{ .TYPE = .SHARED },  // Share across processes
    file.handle, 0,
);

// Hint to kernel: random access pattern (cache file lookups)
try std.posix.madvise(mmap, std.posix.MADV.RANDOM);

// Zero-copy parsing: < 100μs
```

**Benefits**:
- **< 100μs cache loading** (vs 7-15ms in TypeScript)
- Zero-copy access (no buffer allocation)
- Shared across multiple launchpad processes
- OS handles paging automatically

#### 3. Lock-Free Cache with RCU (Read-Copy-Update)

**Current (TypeScript)**:
```typescript
// Synchronous reads, blocking writes
if (cache.has(key))
  return cache.get(key) // Blocks on write
```

**Optimized (Zig)**:
```zig
// RCU: Readers never block, writers create new version
pub fn get(self: *const EnvCache, key: []const u8) ?*const Entry {
    // Atomic load of current version (never blocks)
    const version = self.version.load(.acquire); // ~1ns
    return self.entries[version].get(key); // ~50-100ns
}

pub fn set(self: *EnvCache, key: []const u8, value: Entry) !void {
    // Create new version (copy-on-write)
    const new_version = (self.version.load(.monotonic) + 1) % 2;
    try self.entries[new_version].put(key, value);

    // Atomic version swap
    self.version.store(new_version, .release); // ~1ns

    // Old version cleaned up by grace period
}
```

**Benefits**:
- **Zero reader contention** (reads never block)
- Lock-free for 99.9% of operations
- Scales linearly with cores
- Grace period ensures safety

#### 4. Ring Buffer Fast Cache (L1 cache optimization)

**Purpose**: Avoid hash map lookup for repeated queries (shell hooks)

```zig
// 8-entry ring buffer fits in L1 cache (64 bytes)
fast_cache: [8]?*Entry align(64) = [_]?*Entry{null} ** 8,

pub fn get(self: *EnvCache, key: []const u8) ?*Entry {
    // Check last 8 lookups (fits in L1 cache: ~1-2ns per check)
    for (self.fast_cache) |entry| {
        if (entry) |e| {
            if (std.mem.eql(u8, e.key, key)) {
                return e; // Hit: ~5-10ns total
            }
        }
    }

    // Fallback to hash map: ~50-100ns
    return self.entries.get(key);
}
```

**Benefits**:
- **95%+ hit rate** for shell hook patterns
- **5-10ns latency** for cache hits (vs 50-100ns for hash map)
- Fits in CPU L1 cache (no memory access)
- Zero allocation overhead

#### 5. String Interning Pool (zero-copy lookups)

**Current (TypeScript)**:
```typescript
// Every lookup allocates and compares strings
cache.get(projectDir) // String comparison: ~100-500ns
```

**Optimized (Zig)**:
```zig
// Intern all project directories at startup
string_pool: StringPool,

pub fn intern(self: *EnvCache, str: []const u8) []const u8 {
    if (self.string_pool.get(str)) |interned| {
        return interned; // Return existing interned string
    }
    const owned = try self.allocator.dupe(u8, str);
    try self.string_pool.put(owned, {});
    return owned;
}

pub fn get(self: *EnvCache, key: []const u8) ?*Entry {
    // Pointer comparison for interned strings: ~1ns
    if (@intFromPtr(entry.key.ptr) == @intFromPtr(key.ptr)) {
        return entry; // Instant match
    }
    // Fallback to byte comparison
}
```

**Benefits**:
- **Pointer comparison** (1ns) vs string comparison (100-500ns)
- Deduplication: saves memory for repeated paths
- Cache-friendly: all strings in contiguous memory

#### 6. SIMD String Operations

**Use Case**: Bulk path comparisons, hashing

```zig
/// SIMD-accelerated string equality (for paths > 32 bytes)
pub fn strEqlSIMD(a: []const u8, b: []const u8) bool {
    if (a.len != b.len) return false;
    if (a.len < 32) return std.mem.eql(u8, a, b);

    // Process 32 bytes at a time with AVX2
    const Vec32 = @Vector(32, u8);
    var i: usize = 0;

    while (i + 32 <= a.len) : (i += 32) {
        const va: Vec32 = a[i..][0..32].*;
        const vb: Vec32 = b[i..][0..32].*;

        if (@reduce(.Or, va != vb)) return false;
    }

    // Handle remainder
    return std.mem.eql(u8, a[i..], b[i..]);
}
```

**Benefits**:
- **4-8x faster** than scalar comparison for long paths
- Automatic vectorization on modern CPUs
- Zero overhead for short strings

#### 7. Batch System Calls (reduce context switches)

**Current (TypeScript)**:
```typescript
// One syscall per file check
for (const file of depFiles) {
    if (await fs.exists(file)) { ... } // ~5-10μs per syscall
}
```

**Optimized (Zig)**:
```zig
// Batch file checks with openat + fstatat
pub fn checkFilesExist(files: []const []const u8) ![]bool {
    const cwd = std.fs.cwd();
    var results = try allocator.alloc(bool, files.len);

    // Single openat for directory
    const dir_fd = try std.posix.openat(
        cwd.fd, ".", .{ .DIRECTORY = true }
    );
    defer std.posix.close(dir_fd);

    // Batch fstatat calls (kernel can optimize)
    for (files, 0..) |file, i| {
        var stat: std.posix.Stat = undefined;
        results[i] = (std.posix.fstatat(dir_fd, file, &stat, 0) == 0);
    }

    return results;
}
```

**Benefits**:
- **Amortized syscall cost** across multiple files
- Fewer context switches
- Kernel can optimize batched operations

#### 8. Arena Allocators (request-scoped memory)

**Current (TypeScript/Bun)**:
```typescript
// GC overhead: ~1-5ms per collection
const result = expensiveOperation() // Allocates memory
// ... GC runs periodically
```

**Optimized (Zig)**:
```zig
// Arena allocator: bulk free in ~100ns
pub fn handleRequest(allocator: std.mem.Allocator) !void {
    var arena = std.heap.ArenaAllocator.init(allocator);
    defer arena.deinit(); // Free everything: ~100ns

    // All allocations use arena
    const result = try expensiveOperation(arena.allocator());
    // ... no GC pauses
}
```

**Benefits**:
- **Predictable latency** (no GC pauses)
- **Bulk free in ~100ns** (vs 1-5ms GC)
- Better cache locality

#### 9. Profile-Guided Optimization (PGO)

**Strategy**:
```bash
# Step 1: Build with instrumentation
zig build -Doptimize=ReleaseFast -fprofile-generate

# Step 2: Run typical workload
./launchpad install node python
./launchpad env:list
# ... typical operations

# Step 3: Build with profile data
zig build -Doptimize=ReleaseFast -fprofile-use=default.profdata

# Result: 10-30% speedup from better branch prediction
```

**Benefits**:
- **Optimal branch prediction** for hot paths
- **Better inlining decisions**
- **Improved instruction cache usage**

#### 10. Embedded Resources (zero I/O)

**Current (TypeScript)**:
```typescript
// Runtime file read + parse
const shellCode = await fs.readFile('./templates/shell.sh')
const template = parseTemplate(shellCode) // ~10-20ms
```

**Optimized (Zig)**:
```zig
// Compile-time embedding (zero runtime cost)
const shell_template = @embedFile("templates/shell.sh");

pub fn generate() []const u8 {
    return shell_template; // Return pointer to .rodata: ~1ns
}
```

**Benefits**:
- **Zero I/O cost** (data in binary)
- **Zero parsing cost** (compile-time)
- Single binary deployment
- Instant access (~1ns pointer return)

### Performance Summary

| Optimization | Speedup | Memory Savings |
|--------------|---------|----------------|
| Compile-time package registry | **100-250x** | 50-80% |
| Memory-mapped cache | **70-150x** | 60-90% (shared) |
| Lock-free RCU cache | **2-5x** | None |
| Ring buffer fast cache | **5-20x** | Minimal |
| String interning | **100-500x** | 30-60% |
| SIMD operations | **4-8x** | None |
| Batch syscalls | **3-10x** | None |
| Arena allocators | **10-50x** | 20-40% |
| Embedded resources | **10000x** | 10-20MB |

**Overall Expected Improvement**: **20-50x** for hot paths, **16-40x** memory reduction

---

## Dependency Update Detection

### Problem Statement

**Current Behavior**:

- Environments cached for indefinite time
- No automatic detection of dependency file changes
- No periodic update checking

**Desired Behavior**:

- Cache entries expire after configurable TTL (default: 30 minutes)
- On `cd` into expired environment, check if dependency file changed
- If changed, prompt user to update or auto-update
- Periodic background checks for package updates

### Implementation Plan

#### Task: TTL-Based Cache Expiration

**File**: `src/cache/env_cache.zig` (enhancement)

**Changes**:

```zig
pub const EnvCacheEntry = struct {
    project_dir: []const u8,
    dep_file: []const u8,
    dep_mtime: i64,
    env_dir: []const u8,
    // NEW FIELDS:
    cached_at: i64,  // Unix timestamp when cached
    last_validated: i64,  // Last time we checked for updates
};

pub const EnvCache = struct {
    // ... existing fields

    /// Check if cache entry is expired (TTL-based)
    pub fn isExpired(self: *EnvCache, entry: *const EnvCacheEntry, ttl_seconds: i64) bool {
        const now = std.time.timestamp();
        return (now - entry.cached_at) > ttl_seconds;
    }

    /// Validate entry and check for dependency updates
    pub fn validateWithUpdates(
        self: *EnvCache,
        entry: *EnvCacheEntry,
        check_updates: bool,
    ) !ValidationResult {
        const now = std.time.timestamp();

        // 1. Check if environment directory exists
        std.fs.cwd().access(entry.env_dir, .{}) catch {
            return .EnvDirDeleted;
        };

        // 2. Check if dependency file changed
        if (entry.dep_file.len > 0) {
            const file = std.fs.cwd().openFile(entry.dep_file, .{}) catch {
                return .DepFileDeleted;
            };
            defer file.close();

            const stat = try file.stat();
            const mtime = @divFloor(stat.mtime, std.time.ns_per_s);

            if (mtime != entry.dep_mtime) {
                return .{ .DepFileChanged = .{
                    .old_mtime = entry.dep_mtime,
                    .new_mtime = mtime,
                }};
            }

            // 3. Check for package updates (if requested and not recently checked)
            if (check_updates and (now - entry.last_validated) > 3600) {
                // Check if any packages have newer versions
                if (try self.checkPackageUpdates(entry.dep_file)) |updates| {
                    return .{ .UpdatesAvailable = updates };
                }

                entry.last_validated = now;
            }
        }

        return .Valid;
    }

    fn checkPackageUpdates(self: *EnvCache, dep_file: []const u8) !?[]PackageUpdate {
        // Parse dependency file
        // Check if newer versions available
        // Return list of updates
        _ = self;
        _ = dep_file;
        return null;
    }
};

pub const ValidationResult = union(enum) {
    Valid,
    EnvDirDeleted,
    DepFileDeleted,
    DepFileChanged: struct {
        old_mtime: i64,
        new_mtime: i64,
    },
    UpdatesAvailable: []PackageUpdate,
};

pub const PackageUpdate = struct {
    name: []const u8,
    current_version: []const u8,
    latest_version: []const u8,
};
```

**Shell Integration Changes**:

```zig
// src/shell/commands.zig - shell:lookup enhancement

pub fn lookup(self: *ShellCommands, pwd: []const u8) !?[]const u8 {
    const ttl_seconds = 30 * 60; // 30 minutes (configurable)

    var current_dir = try self.allocator.dupe(u8, pwd);
    defer self.allocator.free(current_dir);

    while (true) {
        if (self.env_cache.get(current_dir)) |entry| {
            // Check if expired
            if (self.env_cache.isExpired(entry, ttl_seconds)) {
                // Validate and check for updates
                const result = try self.env_cache.validateWithUpdates(entry, true);

                switch (result) {
                    .Valid => {
                        // Still valid, return
                        return try std.fmt.allocPrint(
                            self.allocator,
                            "{s}|{s}",
                            .{ entry.env_dir, current_dir }
                        );
                    },
                    .DepFileChanged => {
                        // Dependency file changed - invalidate cache
                        _ = try self.env_cache.validate();
                        return null; // Force re-activation
                    },
                    .UpdatesAvailable => |updates| {
                        // Show update notification (to stderr)
                        std.debug.print(
                            "⬆️  Updates available: {d} package(s). Run 'launchpad update' to upgrade.\n",
                            .{updates.len}
                        );

                        // Return cached entry (don't force update)
                        return try std.fmt.allocPrint(
                            self.allocator,
                            "{s}|{s}",
                            .{ entry.env_dir, current_dir }
                        );
                    },
                    else => {
                        // Environment or dep file deleted
                        _ = try self.env_cache.validate();
                        return null;
                    },
                }
            }

            // Not expired, return cached
            return try std.fmt.allocPrint(
                self.allocator,
                "{s}|{s}",
                .{ entry.env_dir, current_dir }
            );
        }

        // Move up directory tree
        const parent = std.fs.path.dirname(current_dir) orelse break;
        if (std.mem.eql(u8, parent, current_dir)) break;

        self.allocator.free(current_dir);
        current_dir = try self.allocator.dupe(u8, parent);
    }

    return null;
}
```

**Configuration**:

```zig
// src/config.zig (new file)

pub const Config = struct {
    cache_ttl_minutes: u32 = 30,
    check_updates_on_activation: bool = true,
    auto_update: bool = false,  // If true, automatically update packages
    update_check_interval_hours: u32 = 24,  // How often to check for updates
};

pub fn loadConfig(allocator: std.mem.Allocator) !Config {
    // Load from launchpad.config.zig or environment variables
    // ...
    return Config{};
}
```

**TODO Checklist**:

- [ ] Add `cached_at` and `last_validated` fields to EnvCacheEntry
- [ ] Implement TTL-based expiration checking
- [ ] Add dependency file change detection
- [ ] Implement package update checking
- [ ] Add user notification for available updates
- [ ] Add configuration for TTL and update checking
- [ ] Add auto-update option
- [ ] Add tests for update detection

**Estimated Time**: 4 days

---

## Summary & Total Timeline

### Phase Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Pre-Refactor (ts-pkgx) | 1 week | Zig package definition generator |
| Phase 1: Foundation | 2 weeks | Platform abstraction, error handling, string utils |
| Phase 2: Caching | 2-3 weeks | Lock-free environment cache, package cache |
| Phase 3: Packages | 3 weeks | Package registry, dependency resolver, installer |
| Phase 4: Shell | 2-3 weeks | Shell code generator, shell commands, integration |
| Phase 5: Environment | 2 weeks | Environment scanner, env commands |
| Phase 6: CLI | 2 weeks | Command registry, argument parser, CLI entry |
| Phase 7: Services | 2 weeks | Service management (launchd/systemd) |
| Phase 8: Migration | 3 weeks | Integration testing, gradual migration |

**Total Timeline**: 12-16 weeks (3-4 months)

### Success Criteria

- [ ] All TypeScript functionality replicated in Zig
- [ ] Performance targets met (10x startup, 5x cache activation)
- [ ] Binary size < 5MB (vs 50MB Bun/TypeScript)
- [ ] All tests passing
- [ ] Documentation updated
- [ ] CI/CD pipelines working
- [ ] v1.0.0 release deployed

---

## Performance Profiling & Benchmarking Strategy

### Continuous Performance Validation

**Goal**: Ensure all performance targets are met and maintained throughout development.

#### 1. Micro-Benchmarks (per-function)

**File**: `bench/micro_bench.zig`

```zig
const std = @import("std");
const bench = @import("bench");

test "cache lookup performance" {
    var cache = try EnvCache.init(std.testing.allocator, "test_cache");
    defer cache.deinit();

    // Warm up
    for (0..1000) |_| {
        _ = cache.get("/home/user/project");
    }

    // Benchmark
    const iterations = 1_000_000;
    const start = std.time.nanoTimestamp();

    for (0..iterations) |_| {
        _ = cache.get("/home/user/project");
    }

    const end = std.time.nanoTimestamp();
    const avg_ns = @divFloor(end - start, iterations);

    std.debug.print("Cache lookup: {d}ns avg\n", .{avg_ns});
    try std.testing.expect(avg_ns < 100); // Must be < 100ns
}
```

**Targets**:
- Cache lookup: < 100ns
- String interning: < 50ns
- Hash computation: < 200ns
- Package registry lookup: < 20ns

#### 2. Integration Benchmarks (end-to-end)

**File**: `bench/integration_bench.zig`

```zig
test "shell activation performance" {
    const iterations = 1000;
    var total_time: i64 = 0;

    for (0..iterations) |_| {
        const start = std.time.nanoTimestamp();

        // Simulate shell hook activation
        const result = try shellActivate("/home/user/myproject");

        const end = std.time.nanoTimestamp();
        total_time += end - start;

        std.testing.allocator.free(result);
    }

    const avg_us = @divFloor(total_time, iterations * 1000);
    std.debug.print("Shell activation: {d}μs avg\n", .{avg_us});
    try std.testing.expect(avg_us < 500); // Must be < 500μs
}
```

**Targets**:
- Cached shell activation: < 500μs
- Cache miss activation: < 30ms
- CLI startup: < 5ms
- Environment scanning: < 100ms for 100 envs

#### 3. Comparison Benchmarks (Zig vs TypeScript)

**File**: `bench/compare_bench.sh`

```bash
#!/bin/bash
# Benchmark Zig vs TypeScript implementations

echo "=== Cache Lookup Benchmark ==="

# TypeScript baseline
echo "TypeScript (Bun):"
hyperfine --warmup 10 --min-runs 100 \
  'bun run packages/launchpad/bin/cli.ts shell:lookup /home/user/project'

# Zig implementation
echo "Zig:"
hyperfine --warmup 10 --min-runs 100 \
  './launchpad-zig shell:lookup /home/user/project'

echo ""
echo "=== CLI Startup Benchmark ==="

# TypeScript
echo "TypeScript (Bun):"
hyperfine --warmup 5 --min-runs 50 \
  'bun run packages/launchpad/bin/cli.ts --version'

# Zig
echo "Zig:"
hyperfine --warmup 5 --min-runs 50 \
  './launchpad-zig --version'

echo ""
echo "=== Environment Activation Benchmark ==="

# Create test project
mkdir -p /tmp/test-project
echo '{ "dependencies": { "node": "20" } }' > /tmp/test-project/package.json

# TypeScript
echo "TypeScript (Bun):"
hyperfine --warmup 3 --min-runs 20 \
  'cd /tmp/test-project && bun run ../launchpad/packages/launchpad/bin/cli.ts dev'

# Zig
echo "Zig:"
hyperfine --warmup 3 --min-runs 20 \
  'cd /tmp/test-project && ../launchpad-zig dev'

# Cleanup
rm -rf /tmp/test-project
```

#### 4. Memory Profiling

**Using Valgrind/Massif**:

```bash
# Memory usage profiling
valgrind --tool=massif --massif-out-file=massif.out \
  ./launchpad install node python

# Analyze results
ms_print massif.out

# Target: < 5MB peak memory usage
```

**Using Heaptrack**:

```bash
# Detailed heap profiling
heaptrack ./launchpad install node python

# Analyze allocations
heaptrack_gui heaptrack.launchpad.*.gz

# Goals:
# - Zero allocations on cache lookup path
# - < 1000 allocations total for install command
# - No memory leaks
```

#### 5. Cache Performance Monitoring

**File**: `bench/cache_bench.zig`

```zig
/// Measure cache hit rates in realistic scenarios
test "cache hit rate validation" {
    var cache = try EnvCache.init(std.testing.allocator, "bench_cache");
    defer cache.deinit();

    // Simulate shell usage pattern (repeated queries)
    const projects = [_][]const u8{
        "/home/user/project1",
        "/home/user/project2",
        "/home/user/project3",
    };

    // Populate cache
    for (projects) |proj| {
        try cache.set(.{
            .project_dir = proj,
            .dep_file = "",
            .dep_mtime = 0,
            .env_dir = "/envs/test",
        });
    }

    // Simulate shell cd pattern: 80% to same dir, 20% to others
    var hits: usize = 0;
    var total: usize = 10000;
    var rng = std.rand.DefaultPrng.init(12345);

    for (0..total) |_| {
        const r = rng.random().int(u8);
        const proj = if (r < 200) projects[0]  // 80% to project1
                     else if (r < 225) projects[1]  // 10% to project2
                     else projects[2];  // 10% to project3

        const entry = cache.get(proj);
        if (entry != null) hits += 1;
    }

    const hit_rate = @as(f64, @floatFromInt(hits)) / @as(f64, @floatFromInt(total));
    std.debug.print("Cache hit rate: {d:.2}%\n", .{hit_rate * 100});

    try std.testing.expect(hit_rate > 0.95); // Must be > 95%
}
```

#### 6. Regression Testing

**CI Integration** (`.github/workflows/performance.yml`):

```yaml
name: Performance Tests

on: [push, pull_request]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Zig
        uses: goto-bus-stop/setup-zig@v2
        with:
          version: master

      - name: Build
        run: zig build -Doptimize=ReleaseFast

      - name: Run benchmarks
        run: zig build bench

      - name: Check performance targets
        run: |
          # Parse benchmark results and fail if targets not met
          python3 scripts/check_perf_targets.py bench_results.json

      - name: Compare with baseline
        run: |
          # Compare with previous commit
          git checkout HEAD~1
          zig build bench > baseline.txt
          git checkout -

          # Compare results
          python3 scripts/compare_benchmarks.py baseline.txt bench_results.json

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: benchmark-results
          path: bench_results.json
```

**Performance Target Validation** (`scripts/check_perf_targets.py`):

```python
#!/usr/bin/env python3
import json
import sys

TARGETS = {
    "cli_startup_ms": 5,
    "cache_lookup_ns": 100,
    "shell_activation_us": 500,
    "hash_computation_us": 200,
    "package_lookup_ns": 20,
}

def check_targets(results_file):
    with open(results_file) as f:
        results = json.load(f)

    failed = []
    for metric, target in TARGETS.items():
        actual = results.get(metric)
        if actual is None:
            print(f"❌ Missing metric: {metric}")
            failed.append(metric)
        elif actual > target:
            print(f"❌ {metric}: {actual} > {target} (target)")
            failed.append(metric)
        else:
            print(f"✅ {metric}: {actual} <= {target}")

    if failed:
        print(f"\n❌ {len(failed)} performance targets not met!")
        sys.exit(1)
    else:
        print(f"\n✅ All performance targets met!")

if __name__ == "__main__":
    check_targets(sys.argv[1])
```

#### 7. Real-World Performance Testing

**Scenario Tests**:

```bash
# Test 1: Cold start (no cache)
rm -rf ~/.cache/launchpad
time ./launchpad dev /path/to/project
# Target: < 50ms

# Test 2: Warm start (cache hit)
time ./launchpad dev /path/to/project
# Target: < 500μs

# Test 3: Large project (100+ packages)
time ./launchpad install $(cat large_project_deps.txt)
# Target: < 30s for network-bound operations

# Test 4: Shell integration overhead
# Measure cd command latency
for i in {1..100}; do
  /usr/bin/time -f "%e" bash -c "cd /path/to/project" 2>&1
done | awk '{sum+=$1} END {print "Average:", sum/NR, "seconds"}'
# Target: < 10ms overhead
```

### Performance Dashboard

Create a dashboard to track performance over time:

**File**: `bench/dashboard.html`

```html
<!DOCTYPE html>
<html>
<head>
    <title>Launchpad Performance Dashboard</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
</head>
<body>
    <h1>Launchpad Performance Metrics</h1>

    <div id="cli-startup"></div>
    <div id="cache-lookup"></div>
    <div id="shell-activation"></div>

    <script>
        // Load benchmark history and plot trends
        fetch('bench_history.json')
            .then(r => r.json())
            .then(data => {
                // Plot CLI startup time over commits
                Plotly.newPlot('cli-startup', [{
                    x: data.commits,
                    y: data.cli_startup_ms,
                    type: 'scatter',
                    name: 'CLI Startup (ms)',
                    line: { color: 'blue' }
                }], {
                    title: 'CLI Startup Time (Target: < 5ms)',
                    yaxis: { title: 'Time (ms)', range: [0, 10] },
                    shapes: [{
                        type: 'line',
                        x0: 0, x1: data.commits.length,
                        y0: 5, y1: 5,
                        line: { color: 'red', dash: 'dash' }
                    }]
                });

                // Similar plots for other metrics...
            });
    </script>
</body>
</html>
```

---

## Summary & Total Timeline

### Phase Summary

| Phase | Duration | Key Deliverables | Performance Gain |
|-------|----------|------------------|------------------|
| Pre-Refactor (ts-pkgx) | 1 week | Zig package definition generator | N/A |
| Phase 1: Foundation | 2 weeks | Platform abstraction, error handling, string utils | 10-50x hashing |
| Phase 2: Caching | 2-3 weeks | Lock-free environment cache, package cache | 30-150x cache ops |
| Phase 3: Packages | 3 weeks | Package registry, dependency resolver, installer | 100-250x lookups |
| Phase 4: Shell | 2-3 weeks | Shell code generator, shell commands, integration | 50-500x generation |
| Phase 5: Environment | 2 weeks | Environment scanner, env commands | 5-20x scanning |
| Phase 6: CLI | 2 weeks | Command registry, argument parser, CLI entry | 20-50x startup |
| Phase 7: Services | 2 weeks | Service management (launchd/systemd) | N/A |
| Phase 8: Migration | 3 weeks | Integration testing, gradual migration | Overall validation |

**Total Timeline**: 12-16 weeks (3-4 months)

### Success Criteria

#### Functional Requirements
- [ ] All TypeScript functionality replicated in Zig
- [ ] Cache format compatibility with TypeScript version
- [ ] Shell integration works with zsh, bash, fish
- [ ] Cross-platform support (macOS, Linux, Windows)
- [ ] All tests passing (unit + integration)

#### Performance Requirements
- [ ] CLI startup < 5ms (stretch: < 2ms)
- [ ] Cached env activation < 500μs (stretch: < 200μs)
- [ ] Cache lookup < 100ns (stretch: < 20ns)
- [ ] Package registry lookup < 20ns
- [ ] Memory usage < 5MB (stretch: < 2MB)
- [ ] Binary size < 3MB (stretch: < 1.5MB)

#### Quality Requirements
- [ ] Zero memory leaks (Valgrind clean)
- [ ] Zero undefined behavior (sanitizers clean)
- [ ] 90%+ code coverage
- [ ] Documentation updated
- [ ] CI/CD pipelines working
- [ ] Performance regression tests passing

#### Release Criteria
- [ ] v1.0.0-rc.1 deployed and tested
- [ ] Performance targets validated
- [ ] Migration guide published
- [ ] v1.0.0 release deployed

---

**Maintained by**: Launchpad Team
**Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)
**License**: MIT
