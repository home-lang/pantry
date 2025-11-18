# Caching

Pantry uses aggressive caching strategies to achieve sub-microsecond performance for cached operations.

## Overview

Pantry implements a two-tier caching system:
- **Fast cache**: Ring buffer (8 entries, <50μs lookup)
- **Slow cache**: Disk-based (unlimited entries, ~1ms lookup)

Combined with:
- **1-hour TTL**: No unnecessary revalidation
- **mtime tracking**: Instant invalidation on file changes
- **Lock-free reads**: Zero contention

## Cache Architecture

### Two-Tier System

```
┌─────────────────────────────────────┐
│         Application                  │
└────────────┬────────────────────────┘
             │
             ▼
      ┌─────────────┐
      │ Fast Cache  │  ◄── Ring buffer (8 entries)
      │  <50μs      │      L1 cache optimized
      └──────┬──────┘      Lock-free reads
             │
             ▼ (miss)
      ┌─────────────┐
      │ Slow Cache  │  ◄── Disk-based (unlimited)
      │   ~1ms      │      Memory-mapped files
      └──────┬──────┘      Atomic writes
             │
             ▼ (miss)
      ┌─────────────┐
      │  Create     │  ◄── Install packages
      │Environment  │      Download runtimes
      └─────────────┘      Generate environment
```

### Cache Entry Structure

```zig
pub const CacheEntry = struct {
    project_hash: [32]u8,      // MD5 hash of dependencies
    env_dir: []const u8,       // Path to environment
    dep_file: ?[]const u8,     // Dependency file path
    dep_mtime: i64,            // File modification time
    created_at: i64,           // Environment creation time
    last_used: i64,            // Last access time
    ttl: u64,                  // Time-to-live (1 hour)
};
```

## Fast Cache

### Ring Buffer Implementation

**Characteristics**:
- Fixed size: 8 entries
- FIFO eviction policy
- L1 cache optimized (64-byte alignment)
- Lock-free reads with RCU

**Performance**:
- Lookup: <50μs
- Insert: <100μs
- Eviction: <50μs

### Code Example

```zig
pub const FastCache = struct {
    entries: [8]?CacheEntry,
    head: usize,

    pub fn get(self: *FastCache, hash: []const u8) ?CacheEntry {
        // Linear search (only 8 entries, faster than hash lookup)
        for (self.entries) |entry| {
            if (entry) |e| {
                if (std.mem.eql(u8, e.project_hash[0..], hash)) {
                    return e;
                }
            }
        }
        return null;
    }

    pub fn put(self: *FastCache, entry: CacheEntry) void {
        self.entries[self.head] = entry;
        self.head = (self.head + 1) % 8;
    }
};
```

**Why it's fast**:
- **Linear search**: For 8 entries, faster than hash table
- **Cache-friendly**: All entries in single cache line
- **No allocations**: Fixed-size array
- **No locks**: Atomic reads

## Slow Cache

### Disk-Based Storage

**Characteristics**:
- Unlimited entries
- Memory-mapped files
- Persisted across restarts
- Atomic writes with RCU

**Performance**:
- Lookup: ~1ms
- Insert: ~2ms
- Delete: ~1ms

### File Structure

```
~/.pantry/cache/
├── env/
│   ├── abc123def456.json    # Environment metadata
│   ├── fed456cba321.json
│   └── ...
└── metadata.db              # Cache index
```

### Entry Format

```json
{
  "project_hash": "abc123def456...",
  "env_dir": "/Users/you/.pantry/envs/abc123",
  "dep_file": "/Users/you/projects/my-app/pantry.json",
  "dep_mtime": 1705324800,
  "created_at": 1705324800,
  "last_used": 1705410800,
  "ttl": 3600
}
```

## TTL (Time-To-Live)

### 1-Hour TTL Strategy

**Why 1 hour?**
- Balances performance vs freshness
- Typical development session length
- Avoids unnecessary network checks
- Still responsive to changes

**TTL behavior**:

```bash
# T+0: First activation (cache miss)
cd my-project
# 180ms - Install packages

# T+30s: Second activation (cache hit, within TTL)
cd my-project
# <50μs - Instant from cache

# T+30min: Third activation (cache hit, within TTL)
cd my-project
# <50μs - Still instant

# T+2hr: Fourth activation (TTL expired)
cd my-project
# ~1ms - Revalidate, no reinstall needed

# Change file (invalidate cache)
vim pantry.json
cd my-project
# 150ms - Update environment
```

### TTL Configuration

Configure TTL in `~/.pantry/config.json`:

```json
{
  "cache": {
    "ttl": 3600,
    "fast_cache_size": 8
  }
}
```

## mtime Tracking

### File Modification Detection

**How it works**:
1. Store dependency file mtime on cache
2. Compare on every activation
3. Invalidate if mtime changed
4. Instant detection (<1ms)

**Code**:

```zig
pub fn isValid(self: CacheEntry) bool {
    if (self.dep_file) |path| {
        const file = std.fs.cwd().openFile(path, .{}) catch return false;
        defer file.close();

        const stat = file.stat() catch return false;
        const mtime = @divFloor(stat.mtime, std.time.ns_per_s);

        // Compare mtime
        if (mtime != self.dep_mtime) {
            return false; // File changed
        }
    }

    // Check TTL
    const now = std.time.timestamp();
    return (now - self.created_at) < self.ttl;
}
```

**Result**: Instant cache invalidation on file changes

## Lock-Free Reads

### RCU (Read-Copy-Update)

**Read path** (no locks):
```zig
pub fn get(self: *Cache, hash: []const u8) ?CacheEntry {
    // Atomic load (no lock)
    const entries = @atomicLoad(*[8]?CacheEntry, &self.entries, .Acquire);

    // Search (no lock)
    for (entries) |entry| {
        if (entry) |e| {
            if (std.mem.eql(u8, e.project_hash[0..], hash)) {
                return e;
            }
        }
    }
    return null;
}
```

**Write path** (copy-update):
```zig
pub fn put(self: *Cache, entry: CacheEntry) void {
    // Copy current entries
    var new_entries = self.entries;

    // Update copy
    new_entries[self.head] = entry;

    // Atomic swap (no lock)
    @atomicStore(*[8]?CacheEntry, &self.entries, new_entries, .Release);

    // Update head
    self.head = (self.head + 1) % 8;
}
```

**Benefits**:
- **Zero locks on reads**: Scales to any core count
- **No contention**: Readers never block
- **Cache-friendly**: No false sharing
- **Wait-free**: Bounded time

## Cache Statistics

### View cache stats

```bash
pantry cache:stats
```

Output:
```
📊 Cache Statistics

Fast Cache:
  Size: 8 entries
  Used: 6 entries (75%)
  Hits: 1,240
  Misses: 32
  Hit Rate: 97.5%
  Avg Lookup: 42μs

Slow Cache:
  Entries: 127
  Total Size: 2.4MB
  Hits: 85
  Misses: 18
  Hit Rate: 82.5%
  Avg Lookup: 0.9ms

Overall:
  Total Hits: 1,325
  Total Misses: 50
  Overall Hit Rate: 96.3%
  Disk Usage: 2.4MB
```

## Cache Management

### Clear cache

```bash
# Clear all caches
pantry cache:clear

# Clear only fast cache
pantry cache:clear --fast

# Clear only slow cache
pantry cache:clear --slow

# Clear specific environment
pantry env:remove abc123def456
```

### Cache cleanup

```bash
# Remove unused environments
pantry env:clean

# Remove environments older than 7 days
pantry env:clean --older-than=7

# Aggressive cleanup (removes all but active)
pantry env:clean --aggressive
```

## Performance Characteristics

### Cache Lookup Times

| Cache | Lookup Time | Notes |
|-------|-------------|-------|
| Fast cache hit | <50μs | Ring buffer, linear search |
| Fast cache miss | <100μs | Fall through to slow cache |
| Slow cache hit | ~1ms | Disk read, JSON parse |
| Slow cache miss | ~2ms | Create new environment |

### Cache Hit Rates

**Typical development workflow**:
- Fast cache hit rate: **95%+**
- Slow cache hit rate: **80%+**
- Overall hit rate: **96%+**

**CI/CD pipeline**:
- Fast cache hit rate: **0%** (clean environment)
- Slow cache hit rate: **0%** (clean environment)
- Overall hit rate: **0%** (by design)

## Best Practices

### 1. Let cache work for you

Don't clear cache unless necessary:

```bash
# ❌ Bad: Clearing cache unnecessarily
pantry cache:clear
cd my-project

# ✅ Good: Let cache optimize
cd my-project
```

### 2. Use lockfiles

Lockfiles ensure cache consistency:

```bash
# Generate lockfile
pantry install

# Commit lockfile
git add bun.lockb package-lock.json
```

### 3. Monitor hit rates

Check cache effectiveness:

```bash
pantry cache:stats

# If hit rate <90%, investigate:
# - Frequently changing dependencies?
# - Too many projects?
# - TTL too short?
```

### 4. Regular cleanup

Clean old environments weekly:

```bash
# Add to cron
0 0 * * 0 pantry env:clean --older-than=7
```

### 5. Disable cache for CI

Disable caching in CI/CD:

```yaml
# GitHub Actions
- run: pantry install --no-cache

# Or clear before install
- run: pantry cache:clear && pantry install
```

## Cache Internals

### Hash Function

**FNV-1a for small strings** (<1KB):
```zig
pub fn fnv1a(data: []const u8) u64 {
    var hash: u64 = 0xcbf29ce484222325;
    for (data) |byte| {
        hash ^= byte;
        hash *%= 0x100000001b3;
    }
    return hash;
}
```

**MD5 for large data** (>1KB):
```zig
pub fn md5Hash(data: []const u8) [16]u8 {
    var hasher = std.crypto.hash.Md5.init(.{});
    hasher.update(data);
    return hasher.finalResult();
}
```

### Cache Eviction

**Fast cache**: FIFO (First-In-First-Out)
- Simple ring buffer
- No LRU overhead
- Predictable behavior

**Slow cache**: LRU (Least-Recently-Used)
- Track last_used timestamp
- Evict oldest on cleanup
- Configurable threshold

## Troubleshooting

### Cache not working

```bash
# Check cache stats
pantry cache:stats

# If hit rate is 0%, check:
pantry cache:clear
cd my-project  # Should create cache entry
cd ..
cd my-project  # Should hit cache
```

### Stale cache

```bash
# If environment seems stale:
pantry cache:clear
cd my-project
```

### High disk usage

```bash
# Check cache size
du -sh ~/.pantry/cache

# Clean old entries
pantry env:clean --older-than=7
```

## Next Steps

- [Performance](./performance.md) - Overall performance optimizations
- [Architecture](./architecture.md) - System architecture overview
- [Benchmarks](../benchmarks.md) - Performance comparisons
