# Performance Optimization Guide

Launchpad is designed for speed and efficiency. This guide covers performance optimization strategies, monitoring, and troubleshooting.

## Performance Features

### 1. Parallel Package Installation

Launchpad supports parallel installation of independent packages, significantly reducing installation time for multiple packages.

```yaml
# This will install packages in parallel
dependencies:
  - nodejs.org@20
  - python.org@3.11
  - go.dev@1.21
  - rust-lang.org@1.70
```

**Performance Impact:**
- 3-5x faster installation for multiple packages
- Automatic dependency resolution prevents conflicts
- Intelligent retry logic with exponential backoff

### 2. Enhanced Binary Caching with Metadata

Advanced caching system with metadata tracking and validation:

```bash
# View cache statistics
launchpad cache:stats

# Clean old cache entries
launchpad cache:clean --older-than 30d

# View cache metadata
launchpad cache:info
```

**Features:**
- Cache metadata with checksums and timestamps
- Automatic cache validation and corruption detection
- Smart cache cleanup based on access patterns
- Cache size monitoring and reporting

### 3. Optimized Shell Integration

Reduced shell overhead with intelligent caching:

```bash
# Shell integration caches dependency file lookups
# Reduces filesystem calls by 80% for repeated directory changes
cd /path/to/project  # Fast activation (cached)
cd /path/to/project  # Even faster (cache hit)
```

**Performance Improvements:**
- 5-second cache TTL for dependency file detection
- Batch environment variable exports
- Optimized PATH management (no duplicates)
- Reduced filesystem syscalls

#### Dependency Fingerprint Overhead

Launchpad computes a dependency fingerprint by md5 hashing the dependency file (e.g. `deps.yaml`). This cost is O(file-size) and negligible for typical YAML/JSON files. The fingerprint is used only to select the environment directory and to validate cache freshness.

### 4. Dependency Detection Memoization

Intelligent caching of dependency analysis results:

```typescript
// Dependency analysis is cached for 5 seconds
// Repeated calls to the same directory are instant
const deps1 = await sniff('/project')  // 50ms (first call)
const deps2 = await sniff('/project')  // <1ms (cached)
```

**Benefits:**
- 95% reduction in repeated dependency analysis time
- Automatic cache invalidation
- Memory-efficient with TTL cleanup

### 5. Binary Path Optimization

Cached binary lookups reduce PATH scanning overhead:

```typescript
import { findBinaryInPath } from './utils'

// Binary paths are cached for 30 seconds
const bunPath = findBinaryInPath('bun')     // 10ms (first lookup)
const bunPath2 = findBinaryInPath('bun')    // <1ms (cached)
```

### 6. Smart Download Resumption

Robust download handling with resumption support:

```bash
# Downloads can resume from interruption
# Automatic retry with exponential backoff
# Checksum validation for integrity
```

**Features:**
- HTTP Range request support
- Partial download resumption
- Automatic retry with backoff (1s, 2s, 4s)
- Size validation and corruption detection

## Performance Monitoring

### Cache Statistics

```bash
# View comprehensive cache statistics
launchpad cache:stats
```

**Output:**
```
📊 Cache Statistics

📦 Cached Packages: 15
💾 Total Size: 2.3 GB
📅 Oldest Access: 2024-01-15 (30 days ago)
📅 Newest Access: 2024-02-14 (today)

💡 Use `launchpad cache:clean` to free up disk space
```

### Performance Benchmarks

Launchpad includes built-in performance benchmarks:

```bash
# Run performance tests
bun test packages/launchpad/test/performance.test.ts
```

**Expected Results:**
- Shell code generation: <200ms
- Hash generation: <0.01ms per hash
- Dependency detection: <50ms (uncached), <1ms (cached)
- Binary lookup: <10ms (uncached), <1ms (cached)

## Optimization Strategies

### 1. Environment Optimization

**Fast Environment Activation:**
```bash
# Environments are cached after first activation
cd /project          # 200ms (first time)
cd /other/project    # 50ms (different project)
cd /project          # <10ms (cached environment)
```

**Global vs Local Strategy:**
```yaml
# Use global for commonly used tools
dependencies:
  nodejs.org: 20      # Local to project

global:
  git-scm.org: latest # Global installation
  vim.org: latest     # Global installation
```

### 2. Cache Management

**Automatic Cache Cleanup:**
```bash
# Clean caches older than 30 days
launchpad cache:clean --older-than 30d

# Clean caches larger than 1GB
launchpad cache:clean --max-size 1GB

# Clean unused caches (not accessed in 7 days)
launchpad cache:clean --unused 7d
```

**Cache Size Optimization:**
```bash
# Monitor cache growth
launchpad cache:stats

# Set cache size limits in config
echo 'cache: { maxSize: "5GB", maxAge: "90d" }' >> launchpad.config.ts
```

### 3. Network Optimization

**Download Performance:**
```typescript
// launchpad.config.ts
export default {
  downloads: {
    maxConcurrent: 4,      // Parallel downloads
    timeout: 30000,        // 30s timeout
    retries: 3,            // Retry attempts
    resumeSupport: true    // Resume interrupted downloads
  }
}
```

**CDN Configuration:**
```typescript
export default {
  mirrors: {
    'nodejs.org': 'https://nodejs.org/dist/',
    'python.org': 'https://python.org/ftp/python/',
    // Add faster mirrors for your region
  }
}
```

## Performance Troubleshooting

### Slow Installation

**Symptoms:**
- Package installation takes >2 minutes
- High CPU usage during installation
- Network timeouts

**Solutions:**
```bash
# Check network connectivity
launchpad doctor

# Clear corrupted cache
launchpad cache:clean --corrupted

# Use verbose mode to identify bottlenecks
launchpad install --verbose nodejs.org@20

# Check disk space
df -h ~/.cache/launchpad
```

### Slow Shell Integration

**Symptoms:**
- Directory changes take >500ms
- Shell becomes unresponsive
- High filesystem I/O

**Solutions:**
```bash
# Check for filesystem issues
launchpad doctor

# Clear shell integration cache
unset __launchpad_cache_dir

# Reduce cache TTL if needed
export LAUNCHPAD_CACHE_TTL=1  # 1 second
```

### Memory Usage

**Monitor Memory:**
```bash
# Check launchpad memory usage
ps aux | grep launchpad

# Clear caches if memory is high
launchpad cache:clean

# Limit cache size
echo 'cache: { maxMemory: "500MB" }' >> launchpad.config.ts
```

## Performance Metrics

### Current Performance
- **Shell activation**: 10-50ms (cached)
- **Dependency detection**: <1ms (cached), ~50ms (first scan)
- **Binary lookup**: <1ms (cached), ~10ms (first lookup)
- **Package installation**: Varies by package size and network speed

### Performance Improvements Summary
- **3-5x faster** parallel package installation
- **10x faster** shell integration with caching
- **50x faster** repeated dependency detection
- **10x faster** binary path lookups
- **95% reduction** in filesystem operations
- **Automatic recovery** from interrupted downloads

## Advanced Configuration

### Performance Tuning

```typescript
// launchpad.config.ts
export default {
  performance: {
    // Cache settings
    cache: {
      dependencyTTL: 5000,     // 5 seconds
      binaryTTL: 30000,        // 30 seconds
      maxMemoryUsage: '1GB',   // Memory limit
      maxDiskUsage: '10GB'     // Disk limit
    },

    // Download settings
    downloads: {
      maxParallel: 4,          // Concurrent downloads
      chunkSize: '1MB',        // Download chunk size
      resumeThreshold: '100KB', // Min size for resume
      timeout: 30000           // Request timeout
    },

    // Shell integration
    shell: {
      cacheTTL: 5000,          // Cache time-to-live
      maxCacheEntries: 1000,   // Max cached paths
      enableOptimizations: true // Enable all optimizations
    }
  }
}
```

## Future Performance Improvements

Planned optimizations for future releases:

1. **Delta Updates**: Only download changed parts of packages
2. **Predictive Caching**: Pre-cache likely dependencies
3. **Compression**: Compress cached data to save disk space

These performance improvements make Launchpad fast and efficient, providing a smooth development experience even with complex dependency requirements.
