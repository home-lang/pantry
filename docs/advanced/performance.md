# Performance Optimization

Launchpad is designed to be efficient, but there are several ways to optimize its performance for different scenarios and workloads.

## Reducing Installation Time

### Parallel Installations

When installing multiple packages, consider splitting them into batches, _when useful_:

```bash
# Instead of installing all at once
launchpad install node@22 python@3.12 ruby@3.3 go@1.23 rust@1.82

# Split into parallel installations
launchpad install node@22 python@3.12 &
launchpad install ruby@3.3 go@1.23 rust@1.82 &
wait
```

### Installation Location Strategy

Understanding installation location performance characteristics:

```bash
# System-wide to /usr/local (preferred, fastest for most use cases)
launchpad install node@22  # Uses /usr/local if writable

# User-specific installation (automatic fallback)
launchpad install --path ~/.local node@22  # Falls back automatically if /usr/local not writable

# Custom path for specific performance needs
launchpad install --path /fast-ssd/packages node@22  # For SSD optimization
```

### Force Reinstall Optimization

The `--force` flag bypasses existing installation checks, which can be slower:

```bash
# Only use force when needed
launchpad install --force node  # Only when you actually need to reinstall
```

## Optimizing Shim Performance

### Direct Shims

For frequently used binaries, consider using direct shims that don't require the full pkgx resolution:

```bash
# Create a custom efficient shim
cat > ~/.local/bin/node << EOF
#!/bin/sh
# Direct path to reduce overhead
exec ~/.local/pkgs/nodejs.org/v22.0.0/bin/node "\$@"
EOF
chmod +x ~/.local/bin/node
```

### Optimized PATH Order

Arrange your PATH for optimal lookup performance:

```bash
# Put frequently used directories earlier in your PATH
export PATH="~/.local/bin:$PATH"  # This will be checked first
```

## Cache Management

### Clear pkgx Cache

pkgx maintains its own cache that can sometimes become large:

```bash
# Clear pkgx cache
rm -rf ~/.pkgx/cache/*
```

### Optimize Download Cache

Preserve downloaded packages to avoid re-downloading:

```bash
# Set environment variable to preserve downloads
export PKGX_KEEP_DOWNLOADS=1
launchpad install node@22
```

## Configuration Optimization

### Disable Verbose Logging

Verbose logging adds overhead:

```bash
# In configuration
{
  "verbose": false
}

# Or on the command line
launchpad install --quiet node
```

### Shell Message Performance

Shell messages can add slight overhead to directory changes:

```bash
# Disable shell messages for maximum performance
export LAUNCHPAD_SHOW_ENV_MESSAGES=false

# Or use minimal messages
export LAUNCHPAD_SHELL_ACTIVATION_MESSAGE="[ENV]"
export LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE="[EXIT]"
```

### Adjust Timeout and Retries

Optimize timeout and retry settings for your network conditions:

```bash
# In configuration
{
  "timeout": 30000,  # 30 seconds instead of default 60
  "maxRetries": 2    # Only retry twice instead of default 3
}
```

## Memory Usage Optimization

### Clean Up After Large Installations

Some packages can consume significant memory during installation:

```bash
# After installing large packages, clean up environments
launchpad env:clean --older-than 1 --force
```

## Auto-update Configuration

Disable auto-updates if you prefer manual control:

```bash
# Disable auto-updates
launchpad autoupdate:disable
```

## System-Specific Optimizations

### macOS

On macOS, leverage the default `/usr/local` installation for optimal performance:

```bash
# Use system-wide installation (default and fastest)
launchpad install node@22  # Automatically uses /usr/local

# Never use Homebrew paths (conflicts and slower)
# launchpad install --path /opt/homebrew node  # DON'T DO THIS
```

### Linux

On Linux, prefer the default behavior which chooses the fastest available option:

```bash
# Let Launchpad choose the optimal path
launchpad install node@22  # Uses /usr/local if writable, ~/.local otherwise

# For containers or CI, user installation is often faster
launchpad install --path ~/.local node@22
```

### Windows

On Windows, prefer shorter paths to avoid path length limitations:

```bash
# Use shorter paths on Windows
launchpad install --path C:\pkg node@22
```

## CI/CD Pipeline Optimization

For continuous integration environments:

```bash
# Install only what you need
launchpad install node  # Just the specific package

# Use a persistent cache directory
PKGX_CACHE_DIR=/ci-cache launchpad install node@22

# Disable shell messages in CI
export LAUNCHPAD_SHOW_ENV_MESSAGES=false

# Use shorter timeouts in CI
launchpad install --timeout 30000 node@22
```

## Monitoring Performance

You can time Launchpad commands to identify bottlenecks:

```bash
# Time a command
time launchpad install node@22

# More detailed profiling
/usr/bin/time -v launchpad install node@22

# Monitor environment activation speed
time (cd my-project && cd ..)
```

## Network Performance

If you're in an environment with limited bandwidth:

```bash
# Set a longer timeout
launchpad install --timeout 120000 node@22  # 2 minutes

# Use fewer retries to fail faster
launchpad install --max-retries 1 node@22
```

## Environment Management Performance

### Environment Cleanup

Regular environment cleanup improves performance and saves disk space:

```bash
# Clean up old environments regularly
launchpad env:clean --older-than 7 --force

# Preview cleanup to understand disk usage
launchpad env:clean --dry-run

# Aggressive cleanup for performance
launchpad env:clean --older-than 1 --force
```

### Environment Hash Optimization

The new readable hash format is more efficient than the old base64 format:

- **Faster directory lookups** - Shorter, more predictable names
- **Better filesystem performance** - Avoids special characters that can slow down some filesystems
- **Reduced memory usage** - Shorter strings use less memory in directory listings
- **Human-readable** - Easier debugging and management

### Monitoring Environment Disk Usage

Track environment disk usage to identify cleanup opportunities:

```bash
# List environments sorted by size (requires jq)
launchpad env:list --format json | jq -r 'sort_by(.size) | reverse | .[] | "\(.projectName): \(.size)"'

# Find large environments
launchpad env:list --verbose | grep -E '[0-9]+[0-9][0-9]M|[0-9]+G'

# Quick size check
du -sh ~/.local/share/launchpad/envs/*
```

### Optimizing Environment Activation

For faster environment activation:

```bash
# Use the fast activation path when packages are already installed
# This automatically happens when you re-enter a project directory
cd my-project  # Fast activation if environment already exists

# Pre-build environments for faster activation
launchpad dev:dump ~/my-project > /dev/null  # Pre-install packages
```

### Environment Storage Location

Consider the storage location for environments:

```bash
# Use faster storage for environments if available
export LAUNCHPAD_ENV_BASE_DIR=/fast-ssd/launchpad/envs

# Or configure in launchpad.config.ts
export default {
  envBaseDir: '/fast-ssd/launchpad/envs'
}
```

### Batch Environment Operations

When managing multiple environments:

```bash
# Use JSON output for efficient scripting
envs=$(launchpad env:list --format json)

# Remove empty environments efficiently
echo "$envs" | jq -r '.[] | select(.packages == 0) | .hash' | \
  xargs -I {} launchpad env:remove {} --force

# Clean up large, old environments
echo "$envs" | jq -r '.[] | select(.size | test("[0-9]+G")) | .hash' | \
  xargs -I {} launchpad env:inspect {}
```

## Performance Benchmarking

### Measuring Installation Speed

```bash
# Benchmark installation
time launchpad install node@22
time npm install -g node  # Compare with npm

# Benchmark environment activation
time (cd project && echo "activated")
```

### Memory Usage Monitoring

```bash
# Monitor memory usage during operations
/usr/bin/time -v launchpad install large-package

# Monitor environment memory usage
ps aux | grep launchpad
```

### Disk I/O Optimization

```bash
# Use SSDs for better performance
# Monitor disk usage during operations
iostat -x 1 &  # Monitor disk I/O
launchpad install node@22
kill %1  # Stop iostat
```

## Performance Best Practices

1. **Use default installation paths** - `/usr/local` is optimized for performance
2. **Clean environments regularly** - Prevents disk space and performance issues
3. **Disable unnecessary features in CI** - Turn off shell messages and verbose logging
4. **Monitor disk usage** - Large environments can slow down operations
5. **Use appropriate timeouts** - Match your network conditions
6. **Leverage caching** - Keep download caches when possible
7. **Batch operations** - Group similar operations together when possible
