# Cache Optimization

This guide covers advanced cache optimization strategies, performance tuning, and best practices for managing pantry's caching system in production environments.

## Cache Architecture

### Cache Hierarchy

pantry uses a multi-layered caching approach:

```
~/.cache/pantry/
├── binaries/
│   ├── packages/          # Package-specific cache
│   │   ├── {domain}-{version}/
│   │   │   ├── package.tar.xz
│   │   │   └── extracted/
│   │   └── metadata.json
│   └── bun/               # Bun-specific optimized cache
│       ├── {version}      # Direct binary cache
│       └── checksums.json
└── temp/                  # Temporary download cache
    └── {download-id}/
```

### Cache Key Strategy

Cache keys are generated using a deterministic approach:

- **Package Cache:** `{domain}-{version}` (e.g., `nodejs.org-20.0.0`)
- **Bun Cache:** `{version}` (e.g., `1.2.3`)
- **Temporary Cache:** `{timestamp}-{hash}` for downloads in progress

### Environment Selection Cache

pantry also maintains a lightweight shell-side cache for environment activation. It stores:

- a persistent marker for fast-path activation, and
- a `.deps_fingerprint` file inside the environment with the dependency fingerprint used to select it.

On directory change, pantry validates fast-path cache with two signals:

- "Cache invalid: dependency newer than cache" (dep file mtime > cache mtime)
- "Cache invalid: fingerprint mismatch" (computed fingerprint != stored fingerprint)

When either triggers, pantry skips fast-path and refreshes the environment selection, ensuring the correct versions are active.

## Performance Optimization

### Cache Hit Optimization

#### 1. Version Pinning Strategy

```bash
# Instead of using latest (cache miss on updates)
pantry install node@latest

# Use specific versions for better cache hits
pantry install node@20.0.0 python@3.11.5
```

#### 2. Batch Operations

```bash
# Efficient: Single operation, shared cache lookups
pantry install node@20 python@3.11 bun@1.2.3

# Less efficient: Multiple operations, repeated cache checks
pantry install node@20
pantry install python@3.11
pantry install bun@1.2.3
```

#### 3. Environment Consistency

```yaml
# deps.yaml - Use exact versions for cache consistency
dependencies:
  node: 20.0.0
  python.org: 3.11.5
  bun.sh: 1.2.3
```

### Cache Warming Strategies

#### Pre-populate Common Packages

```bash
#!/bin/bash
# cache-warm.sh - Pre-populate cache with common packages

COMMON_PACKAGES=(
  "node@20.0.0"
  "node@18.19.0"
  "python@3.11.5"
  "python@3.10.12"
  "bun@1.2.3"
  "go@1.21.5"
)

for package in "${COMMON_PACKAGES[@]}"; do
  echo "Warming cache for $package..."
  pantry install "$package" --cache-only 2>/dev/null || true
done
```

#### CI/CD Cache Strategy

```yaml
# .github/workflows/cache-strategy.yml
name: Optimized Cache Strategy

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - name: Cache pantry packages
        uses: actions/cache@v3
        with:
          path: ~/.cache/pantry
          key: pantry-${{ runner.os }}-${{ hashFiles('deps.yaml') }}
          restore-keys: |
            pantry-${{ runner.os }}-

      - name: Install dependencies
        run: |
          pantry install
```

## Cache Size Management

### Monitoring Cache Growth

```bash
#!/bin/bash
# cache-monitor.sh - Monitor cache size and growth

cache_size() {
  du -sh ~/.cache/pantry 2>/dev/null | cut -f1 || echo "0B"
}

cache_files() {
  find ~/.cache/pantry -type f 2>/dev/null | wc -l || echo "0"
}

echo "Cache size: $(cache_size)"
echo "Cache files: $(cache_files)"

# Detailed breakdown
echo "Package cache: $(du -sh ~/.cache/pantry/binaries/packages 2>/dev/null | cut -f1 || echo '0B')"
echo "Bun cache: $(du -sh ~/.cache/pantry/binaries/bun 2>/dev/null | cut -f1 || echo '0B')"
```

### Automated Cache Cleanup

```bash
#!/bin/bash
# cache-cleanup.sh - Automated cache maintenance

MAX_CACHE_SIZE_MB=1000
CACHE_DIR="$HOME/.cache/pantry"

# Check current cache size
current_size=$(du -sm "$CACHE_DIR" 2>/dev/null | cut -f1 || echo "0")

if [ "$current_size" -gt "$MAX_CACHE_SIZE_MB" ]; then
  echo "Cache size ($current_size MB) exceeds limit ($MAX_CACHE_SIZE_MB MB)"

  # Clean old packages first (keep recent versions)
  find "$CACHE_DIR/binaries/packages" -type d -mtime +30 -exec rm -rf {} + 2>/dev/null

  # If still too large, clear entire cache
  new_size=$(du -sm "$CACHE_DIR" 2>/dev/null | cut -f1 || echo "0")
  if [ "$new_size" -gt "$MAX_CACHE_SIZE_MB" ]; then
    echo "Clearing entire cache..."
    pantry cache:clear --force
  fi
fi
```

### Selective Cache Retention

```bash
#!/bin/bash
# selective-cleanup.sh - Keep only essential cached packages

KEEP_PACKAGES=(
  "nodejs.org-20.0.0"
  "python.org-3.11.5"
  "bun.sh-1.2.3"
)

# Clear cache but preserve essential packages
temp_dir=$(mktemp -d)

for package in "${KEEP_PACKAGES[@]}"; do
  if [ -d "$HOME/.cache/pantry/binaries/packages/$package" ]; then
    cp -r "$HOME/.cache/pantry/binaries/packages/$package" "$temp_dir/"
  fi
done

# Clear cache and restore essential packages
pantry cache:clear --force
mkdir -p "$HOME/.cache/pantry/binaries/packages"

for package in "${KEEP_PACKAGES[@]}"; do
  if [ -d "$temp_dir/$package" ]; then
    mv "$temp_dir/$package" "$HOME/.cache/pantry/binaries/packages/"
  fi
done

rm -rf "$temp_dir"
```

## Advanced Cache Strategies

### Multi-Environment Cache Sharing

#### Shared Cache Setup

```bash
# Setup shared cache for team/CI environments
export pantry_CACHE_DIR="/shared/cache/pantry"
mkdir -p "$pantry_CACHE_DIR"

# Symlink to shared cache
rm -rf ~/.cache/pantry
ln -s "$pantry_CACHE_DIR" ~/.cache/pantry
```

#### Cache Synchronization

```bash
#!/bin/bash
# sync-cache.sh - Synchronize cache across environments

REMOTE_CACHE="user@server:/shared/cache/pantry/"
LOCAL_CACHE="$HOME/.cache/pantry/"

# Download shared cache
rsync -av --delete "$REMOTE_CACHE" "$LOCAL_CACHE"

# Upload local cache additions
rsync -av "$LOCAL_CACHE" "$REMOTE_CACHE"
```

### Cache Validation and Integrity

#### Checksum Verification

```bash
#!/bin/bash
# verify-cache.sh - Verify cache integrity

CACHE_DIR="$HOME/.cache/pantry/binaries/packages"

for package_dir in "$CACHE_DIR"/*; do
  if [ -d "$package_dir" ]; then
    package_name=$(basename "$package_dir")

    # Check if package archive exists and is valid
    if [ -f "$package_dir/package.tar.xz" ]; then
      if ! tar -tf "$package_dir/package.tar.xz" >/dev/null 2>&1; then
        echo "Corrupted cache for $package_name, removing..."
        rm -rf "$package_dir"
      fi
    fi
  fi
done
```

#### Cache Repair

```bash
#!/bin/bash
# repair-cache.sh - Repair corrupted cache entries

corrupted_packages=()

# Detect corrupted packages
while IFS= read -r -d '' package_dir; do
  package_name=$(basename "$package_dir")

  if [ -f "$package_dir/package.tar.xz" ]; then
    if ! tar -tf "$package_dir/package.tar.xz" >/dev/null 2>&1; then
      corrupted_packages+=("$package_name")
      rm -rf "$package_dir"
    fi
  fi
done < <(find "$HOME/.cache/pantry/binaries/packages" -maxdepth 1 -type d -print0)

# Re-download corrupted packages
for package in "${corrupted_packages[@]}"; do
  echo "Re-caching $package..."
  # Extract package name and version
  domain=$(echo "$package" | cut -d'-' -f1-2)
  version=$(echo "$package" | cut -d'-' -f3-)

  pantry install "$domain@$version" --force-download 2>/dev/null || true
done
```

## Performance Monitoring

### Cache Performance Metrics

```bash
#!/bin/bash
# cache-metrics.sh - Collect cache performance metrics

CACHE_DIR="$HOME/.cache/pantry"
METRICS_FILE="/tmp/pantry-cache-metrics.json"

# Collect metrics
cache_size_bytes=$(du -sb "$CACHE_DIR" 2>/dev/null | cut -f1 || echo "0")
cache_files=$(find "$CACHE_DIR" -type f 2>/dev/null | wc -l || echo "0")
package_count=$(find "$CACHE_DIR/binaries/packages" -maxdepth 1 -type d 2>/dev/null | wc -l || echo "0")
bun_versions=$(find "$CACHE_DIR/binaries/bun" -type f 2>/dev/null | wc -l || echo "0")

# Calculate cache hit rate (requires instrumentation)
cache_hits=$(grep "cache hit" ~/.pantry/logs/install.log 2>/dev/null | wc -l || echo "0")
cache_misses=$(grep "cache miss" ~/.pantry/logs/install.log 2>/dev/null | wc -l || echo "0")
total_requests=$((cache_hits + cache_misses))

if [ "$total_requests" -gt 0 ]; then
  hit_rate=$(echo "scale=2; $cache_hits * 100 / $total_requests" | bc)
else
  hit_rate="0"
fi

# Generate metrics JSON
cat > "$METRICS_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "cache_size_bytes": $cache_size_bytes,
  "cache_files": $cache_files,
  "package_count": $package_count,
  "bun_versions": $bun_versions,
  "cache_hit_rate": $hit_rate,
  "cache_hits": $cache_hits,
  "cache_misses": $cache_misses
}
EOF

echo "Metrics saved to $METRICS_FILE"
cat "$METRICS_FILE"
```

### Performance Benchmarking

```bash
#!/bin/bash
# benchmark-cache.sh - Benchmark cache performance

PACKAGES=("node@20.0.0" "python@3.11.5" "bun@1.2.3")

echo "Benchmarking cache performance..."

# Clear cache for clean test
pantry cache:clear --force >/dev/null 2>&1

# Benchmark cold cache (first install)
echo "Cold cache performance:"
for package in "${PACKAGES[@]}"; do
  start_time=$(date +%s.%N)
  pantry install "$package" >/dev/null 2>&1
  end_time=$(date +%s.%N)
  duration=$(echo "$end_time - $start_time" | bc)
  echo "  $package: ${duration}s"
done

# Benchmark warm cache (reinstall)
echo "Warm cache performance:"
for package in "${PACKAGES[@]}"; do
  # Uninstall first
  pantry uninstall "$package" >/dev/null 2>&1

  start_time=$(date +%s.%N)
  pantry install "$package" >/dev/null 2>&1
  end_time=$(date +%s.%N)
  duration=$(echo "$end_time - $start_time" | bc)
  echo "  $package: ${duration}s"
done
```

## Best Practices

### Development Workflow

1. **Use Specific Versions:** Pin exact versions in `deps.yaml` for consistent cache hits
2. **Batch Operations:** Install multiple packages in single commands
3. **Regular Monitoring:** Check cache size weekly with `pantry cache:clear --dry-run`
4. **Selective Cleanup:** Use `--keep-cache` when resetting environments

### Production Deployment

1. **Pre-warm Cache:** Cache common packages before deployment
2. **Shared Cache:** Use shared cache directories in containerized environments
3. **Cache Validation:** Implement integrity checks in CI/CD pipelines
4. **Size Limits:** Set up automated cleanup when cache exceeds limits

### Team Collaboration

1. **Standardized Versions:** Use team-wide `deps.yaml` files
2. **Cache Sharing:** Share cache in development environments
3. **Documentation:** Document cache strategies in project README
4. **Monitoring:** Set up team-wide cache performance monitoring

## Troubleshooting

### Common Cache Issues

#### Cache Corruption

```bash
# Symptoms: Installation failures, corrupted archives
# Solution: Clear and rebuild cache
pantry cache:clear --force
pantry install your-packages
```

#### Disk Space Issues

```bash
# Symptoms: "No space left on device" errors
# Solution: Clean cache and monitor size
pantry cache:clear --dry-run  # Check size first
pantry cache:clear --force    # Clean if needed
```

#### Permission Problems

```bash
# Symptoms: Permission denied errors
# Solution: Fix cache directory permissions
sudo chown -R $(whoami) ~/.cache/pantry
chmod -R 755 ~/.cache/pantry
```

### Performance Issues

#### Slow Cache Lookups

```bash
# Check cache directory structure
find ~/.cache/pantry -type f | wc -l

# If too many files, consider cleanup
pantry cache:clear --force
```

#### Network vs Cache Performance

```bash
# Compare download vs cache performance
time pantry install node@20.0.0  # First time (download)
pantry uninstall node@20.0.0
time pantry install node@20.0.0  # Second time (cache)
```

## Related Documentation

- [Cache Management](/features/cache-management) - Basic cache management commands
- [Performance Optimization](/advanced/performance) - General performance tuning
- [Cross-platform Compatibility](/advanced/cross-platform) - Platform-specific considerations
