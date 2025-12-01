# Zig 0.16-dev Migration Status

## ✅ Completed (7 fixes)

1. ✅ **ArrayList.writer()** - Removed allocator parameter
   - Changed: `result.writer(allocator)` → `result.writer()`
   - File: `src/shell/generator.zig:34`

2. ✅ **readFileAlloc() parameter order** - Path now comes first
   - Changed: `readFileAlloc(allocator, path, size)` → `readFileAlloc(path, allocator, size)`
   - Files: 13 files updated (shell/integration.zig, main.zig, cli/commands/*, packages/*, registry/*, deps/*)

3. ✅ **Io.Limit type** - Size parameter now requires enum
   - Changed: `1024 * 1024` → `@enumFromInt(1024 * 1024)`
   - Files: All readFileAlloc calls updated

4. ✅ **std.time.milliTimestamp()** - Function moved
   - Changed: `std.time.milliTimestamp()` → `std.time.timestamp() * std.time.ms_per_s`
   - File: `src/config/loader.zig:82`

5. ✅ **Lockfile integration** - Added pantry.lock support
   - New: `src/cli/commands/install/lockfile_hooks.zig`
   - Modified: `src/cli/commands/install/core.zig`

6. ✅ **Lifecycle hooks** - Pre/post install hooks
   - Integrated in: `src/cli/commands/install/core.zig`

7. ✅ **Build artifacts** - Added to .gitignore
   - Added: `/packages/zig/no/`, `*.a`, `*.o`

## ⚠️ Remaining Issues (13 errors)

### 1. File.readToEndAlloc() removed (4 locations)
**Error:** `no field or member function named 'readToEndAlloc' in 'fs.File'`

**Cause:** File API refactored to use Io-based readers

**Files affected:**
- `src/cli/commands/audit.zig:334`
- `src/cli/commands/registry.zig:169`
- `src/deps/parser.zig:794`
- Other locations using `file.readToEndAlloc()`

**Fix needed:**
```zig
// Old (Zig 0.15.2):
const content = try file.readToEndAlloc(allocator, max_size);

// New (Zig 0.16-dev):
var io: Io = .init_single_threaded;
var buf: [4096]u8 = undefined;
const reader = file.reader(io, &buf);
const content = try reader.readAllAlloc(allocator, max_size);
```

### 2. File.readAll() removed (1 location)
**Error:** `no field or member function named 'readAll' in 'fs.File'`

**File affected:**
- `src/services/platform.zig:282`

**Fix needed:**
```zig
// Old:
const n = try child.stdout.?.readAll(&stdout_buf);

// New:
var io: Io = .init_single_threaded;
var buf: [4096]u8 = undefined;
const reader = child.stdout.?.reader(io, &buf);
const n = try reader.readAll(&stdout_buf);
```

### 3. Dir.AccessOptions.mode removed (1 location)
**Error:** `no field named 'mode' in struct 'Io.Dir.AccessOptions'`

**File affected:**
- `src/cli/commands/px.zig:40`

**Fix needed:**
```zig
// Old:
try dir.access(name, .{ .mode = .read_only });

// New:
try dir.access(name, .{}); // mode parameter removed
```

### 4. Io.Timestamp type mismatch (1 location)
**Error:** `expected integer or vector, found 'Io.Timestamp'`

**File affected:**
- `src/install/installer.zig:1173`

**Fix needed:**
```zig
// Old:
const mtime: i128 = @intCast(stat.mtime);

// New:
const mtime: i128 = stat.mtime.ns(); // or similar Timestamp API
```

### 5. Auth modules missing 'io' field (2 locations)
**Error:** `missing struct field: io`

**Files affected:**
- `src/auth/oidc.zig:592`
- `src/auth/registry.zig:15`

**Fix needed:**
Add `io: Io` parameter to structs/functions that need it for File operations

### 6. signing.zig local variable address (1 location)
**Error:** `returning address of expired local variable 'public_key'`

**File affected:**
- `src/auth/signing.zig:215`

**Fix needed:**
```zig
// The function returns &public_key where public_key is a local [32]u8
// Need to heap-allocate or change return type
```

### 7. Other readToEndAlloc usages (12 more locations)
**Files affected:**
- `src/install/downloader.zig:353`
- `src/cache/env_cache.zig:324`
- `src/cache/optimized.zig:270`
- `src/workspace/core.zig:144`
- `src/workspace/commands.zig:177`
- `src/lifecycle/enhanced.zig:145,150,594,599`
- `src/cli/commands/audit.zig:339`
- `src/packages/lockfile.zig:195`
- `src/deps/parser.zig:384,553`

All need the same Io-based reader pattern as #1.

## Migration Strategy

### Phase 1: When Zig 0.16 stabilizes
1. Update all `readToEndAlloc` → Io-based reader pattern
2. Update all `readAll` → Io-based reader pattern
3. Remove `.mode` from AccessOptions calls
4. Fix Timestamp type conversions
5. Thread `Io` instances through auth modules
6. Fix signing.zig memory lifetime

### Phase 2: Test thoroughly
- Run full test suite with Zig 0.16 stable
- Check for any new API changes
- Update benchmarks

### Phase 3: Document
- Update README with Zig version requirement
- Add migration guide for users

## Notes

- **Current working binary:** Built Nov 20, 2025 with partial compatibility
- **Zig version tested:** 0.16.0-dev.1399+7b325e08c
- **Estimated fix time:** 1-2 hours when APIs stabilize
- **Risk:** APIs may change again before 0.16 stable release

## Workaround

For now, use the existing `zig-out/bin/pantry` binary built before the API changes.
All new features (lockfile, hooks) are implemented in source but need Zig 0.16 stable to rebuild.
