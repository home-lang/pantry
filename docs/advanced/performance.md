# Performance Optimization

Launchpad is designed to be efficient, but there are several ways to optimize its performance for different scenarios.

## Reducing Installation Time

### Parallel Installations

When installing multiple packages, consider splitting them into batches, _when useful_:

```bash
# Instead of installing all at once
launchpad install node python ruby go rust

# Split into parallel installations
launchpad install node python &
launchpad install ruby go rust &
wait
```

### Installation Location

Installing to a location that doesn't require sudo can be faster:

```bash
# Use a user-specific installation location
launchpad install --path ~/.local node
```

### Force Reinstall Wisely

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
exec ~/.pkgx/pkgx.sh/node/v16.14.2/bin/node "$@"
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
launchpad install node
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
launchpad install --no-verbose node
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
# After installing large packages, run garbage collection
launchpad pkgx  # Reinstall pkgx to clean up
```

## Auto-update Configuration

Disable auto-updates if you prefer manual control:

```bash
# Disable auto-updates
launchpad autoupdate:disable
```

## System-Specific Optimizations

### macOS

On macOS, prefer `/usr/local` for system-wide installations:

```bash
# Use /usr/local on macOS
launchpad install --path /usr/local node
```

### Linux

On Linux, prefer user-specific installations unless you need system-wide access:

```bash
# Use ~/.local on Linux for user-specific installations
launchpad install --path ~/.local node
```

### Windows

On Windows, prefer shorter paths to avoid path length limitations:

```bash
# Use a shorter path on Windows
launchpad install --path C:\pkgs node
```

## CI/CD Pipeline Optimization

For continuous integration environments:

```bash
# Install only what you need
launchpad install node  # Just the specific package

# Use a persistent cache directory
PKGX_CACHE_DIR=/ci-cache launchpad install node
```

## Monitoring Performance

You can time Launchpad commands to identify bottlenecks:

```bash
# Time a command
time launchpad install node

# More detailed profiling
/usr/bin/time -v launchpad install node
```

## Network Performance

If you're in an environment with limited bandwidth:

```bash
# Set a longer timeout
launchpad install --timeout 120000 node  # 2 minutes
```
